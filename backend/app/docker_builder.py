import base64
import os
import shutil
import tarfile
from pathlib import Path
from typing import Any

import boto3
import docker
import sentry_sdk
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import FastAPI, HTTPException
from kubernetes import client as k8s
from kubernetes import config
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.config import settings
from app.models import Deployment, DeploymentStatus

# aws vars
aws_region = os.getenv("AWS_REGION")

# AWS S3 client
s3 = boto3.client("s3", region_name=aws_region)

# AWS ECR client
ecr = boto3.client("ecr", region_name=aws_region)

# Docker client
docker_client = docker.from_env()

# Kubernetes client
config.load_incluster_config()
# config.load_kube_config()

# Sentry
sentry_sdk.init(
    dsn="https://c88c25ac97cd610c007760c0bd062fc6@o4506985151856640.ingest.us.sentry.io/4507940416716800",
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=1.0,
)

# FastAPI app
app = FastAPI()


def create_or_patch_custom_object(
    group: str,
    version: str,
    namespace: str,
    plural: str,
    name: str,
    body: dict[str, Any],
) -> None:
    api_instance = k8s.CustomObjectsApi()

    try:
        # Try to get the custom object
        api_instance.get_namespaced_custom_object(  # type: ignore
            group=group, version=version, namespace=namespace, plural=plural, name=name
        )

        # Object exists, so patch it
        api_response = api_instance.patch_namespaced_custom_object(  # type: ignore
            group=group,
            version=version,
            namespace=namespace,
            plural=plural,
            name=name,
            body=body,
        )
        print(f"Custom object patched. Status='{api_response}'")

    except k8s.rest.ApiException as e:
        if e.status == 404:  # Not Found
            # Object doesn't exist, so create it
            api_response = api_instance.create_namespaced_custom_object(  # type: ignore
                group=group,
                version=version,
                namespace=namespace,
                plural=plural,
                body=body,
            )
            print(f"Custom object created. Status='{api_response}'")
        else:
            raise e


def deploy_to_kubernetes(
    service_name: str, image_url: str, image_sha256_hash: str
) -> None:
    knative_service = {
        "apiVersion": "serving.knative.dev/v1",
        "kind": "Service",
        "metadata": {
            "name": service_name,
        },
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {
                            "image": f"{image_url}@{image_sha256_hash}",
                        }
                    ],
                }
            }
        },
    }

    namespace = "default"  # Replace with your namespace if needed
    # Todo: add a namespace per customer

    create_or_patch_custom_object(
        group="serving.knative.dev",
        version="v1",
        namespace=namespace,
        plural="services",
        name=service_name,
        body=knative_service,
    )


def docker_login(registry_url: str) -> None:
    try:
        # Get ECR authorization token
        response = ecr.get_authorization_token()
        token = response["authorizationData"][0]["authorizationToken"]

        # Decode and extract username and password
        username, password = base64.b64decode(token).decode("utf-8").split(":")

        # Log in to Docker
        docker_client.login(username=username, password=password, registry=registry_url)  # type: ignore
    except NoCredentialsError:
        print("Credentials not available")
    except Exception as e:
        print(f"Error during Docker login: {e}")
        raise


def repository_exists(repository_name: str) -> bool:
    try:
        response = ecr.describe_repositories(repositoryNames=[repository_name])
        return len(response["repositories"]) > 0
    except ClientError as e:
        if e.response["Error"]["Code"] == "RepositoryNotFoundException":
            return False
        else:
            raise


def create_ecr_repository(repository_name: str) -> dict[str, Any]:
    try:
        if not repository_exists(repository_name):
            response = ecr.create_repository(repositoryName=repository_name)
            return response["repository"]  # type: ignore
        else:
            print(f"Repository '{repository_name}' already exists.")
            # Optionally, you can retrieve and return the existing repository info here
            return ecr.describe_repositories(repositoryNames=[repository_name])[  # type: ignore
                "repositories"
            ][0]
    except ClientError as e:
        print(f"Error creating repository: {e}")
        raise


def download_and_extract_tar(
    bucket_name: str, object_key: str, object_id: str, extract_to: str
) -> None:
    tar_path = f"/tmp/{object_id}/code.tar"
    s3.download_file(bucket_name, object_key, tar_path)

    extract_to_path = Path(extract_to).resolve()

    with tarfile.open(tar_path, "r") as tar_ref:
        for member in tar_ref.getmembers():
            member_path = extract_to_path.joinpath(member.name).resolve()
            if extract_to_path in member_path.parents:
                tar_ref.extract(member, extract_to, filter="data")
            else:
                raise RuntimeError(
                    f"Attempted to extract file outside of target directory: {member.name}",
                    f"From bucket: {bucket_name}, object: {object_key}",
                )

    os.remove(tar_path)


def build_and_push_docker_image(
    image_tag: str, dockerfile_path: str, registry_url: str
) -> str:
    # Docker login
    docker_login(registry_url)

    # Build Docker image
    image, logs = docker_client.images.build(path=dockerfile_path, tag=image_tag)
    for log in logs:
        print(log)

    # Tag Docker image
    full_image_tag = f"{registry_url}/{image_tag}"
    image.tag(full_image_tag)

    # Push Docker image to registry
    push_logs = docker_client.images.push(full_image_tag, stream=True, decode=True)
    sha256 = None
    for push_log in push_logs:
        if "aux" in push_log:
            sha256 = push_log["aux"]["Digest"]
        print(push_log)

    if not sha256:
        raise Exception("Failed to push Docker image")

    return sha256  # type: ignore


def process_message(event: dict[str, Any], session: SessionDep) -> None:
    message = event["Records"][0].get("s3", {})

    bucket = message.get("bucket", {})
    _object = message.get("object", {})

    # Extract necessary data from the message
    bucket_name = bucket.get("name")
    object_key = _object.get("key")
    image_tag = _object.get("key").split(".")[0].replace("/", "_")
    registry_url = settings.ECR_REGISTRY_URL

    object_name = object_key.split("/")[-1]
    object_id = object_name.split(".")[0]

    # Create a temporary directory for the build context
    build_context = f"/tmp/{object_id}/build_context"
    if os.path.exists(build_context):
        shutil.rmtree(build_context)
    os.makedirs(build_context)

    # Update status to building
    smt = select(Deployment).where(Deployment.id == object_id)
    deployment = session.exec(smt).first()
    if deployment is None:
        raise HTTPException(status_code=404, detail="Deployment not found")

    app_name = deployment.slug

    deployment.status = DeploymentStatus.building
    session.commit()

    # Download and extract the tar file
    download_and_extract_tar(
        bucket_name, object_key, object_id, extract_to=build_context
    )

    # Create ECR repository if it doesn't exist
    create_ecr_repository(image_tag)

    # Copy Dockerfile to build context
    shutil.copy("/app/Dockerfile", build_context)

    # Build and push Docker image
    sha256 = build_and_push_docker_image(image_tag, build_context, registry_url)

    # Update status to deploying
    deployment.status = DeploymentStatus.deploying
    session.commit()

    # Deploy to Kubernetes
    deploy_to_kubernetes(app_name, f"{registry_url}/{image_tag}", sha256)

    # Clean up the build context
    shutil.rmtree(build_context)

    # Update status to success
    deployment.status = DeploymentStatus.success
    session.commit()


@app.post("/apps")
def event_service_handler(event: dict[str, Any], session: SessionDep) -> Any:
    process_message(event["Body"], session)
    return {"message": "OK"}
