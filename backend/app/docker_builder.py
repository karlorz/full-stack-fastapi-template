import base64
import os
import shutil
import tarfile
import uuid
from collections.abc import Generator
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

import boto3
import docker
import sentry_sdk
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import Depends, FastAPI
from kubernetes import client as k8s
from kubernetes import config
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import Session, select

from app.core.config import (
    get_builder_settings,
    get_common_settings,
    get_db_settings,
    get_main_settings,
)
from app.core.db import engine
from app.models import App, Deployment, DeploymentStatus, EnvironmentVariable

# aws vars
aws_region = get_builder_settings().AWS_REGION

# AWS S3 client
s3 = boto3.client("s3", region_name=aws_region)

# AWS ECR client
ecr = boto3.client("ecr", region_name=aws_region)

# Docker client
docker_client = docker.from_env()


# Kubernetes client
@lru_cache
def get_kubernetes_client_custom_objects() -> k8s.CustomObjectsApi:
    if os.getenv("CI"):
        config.load_kube_config()
    else:
        config.load_incluster_config()

    return k8s.CustomObjectsApi()


@lru_cache
def get_kubernetes_client_core_v1() -> k8s.CoreV1Api:
    if os.getenv("CI"):
        config.load_kube_config()
    else:
        config.load_incluster_config()

    return k8s.CoreV1Api()


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


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]


def create_namespace_by_team(namespace: str) -> None:
    api_instance = get_kubernetes_client_core_v1()

    try:
        api_instance.read_namespace(name=namespace)  # type: ignore
        print(
            f"Namespace '{namespace}' already exists."
        )  # if there is no error, the namespace exists
    except k8s.rest.ApiException as e:
        if e.status == 404:
            namespace_body = k8s.V1Namespace(metadata=k8s.V1ObjectMeta(name=namespace))
            try:
                api_instance.create_namespace(namespace_body)  # type: ignore
                print(
                    f"Namespace '{namespace}' created."
                )  # if there is no error, the namespace was created
            except k8s.rest.ApiException as ex:
                print(f"Error creating namespace: {ex}")
                raise ex
        else:
            print(f"Error reading namespace: {e}")
            raise e


def create_or_patch_custom_object(
    group: str,
    version: str,
    namespace: str,
    plural: str,
    name: str,
    body: dict[str, Any],
) -> None:
    api_instance = get_kubernetes_client_custom_objects()

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


def deploy_cloud(
    service_name: str, image_url: str, image_sha256_hash: str, min_scale: int = 0
) -> None:
    main_settings = get_main_settings().model_dump(
        mode="json", exclude_unset=True, exclude={"all_cors_origins"}
    )
    common_settings = get_common_settings().model_dump(mode="json", exclude_unset=True)
    db_settings = get_db_settings().model_dump(mode="json", exclude_unset=True)

    env_data = {**main_settings, **common_settings, **db_settings}

    env_strs = {k: str(v) for k, v in env_data.items()}

    deploy_to_kubernetes(
        service_name,
        image_url,
        image_sha256_hash,
        namespace="default",
        min_scale=min_scale,
        env=env_strs,
    )


def deploy_to_kubernetes(
    service_name: str,
    image_url: str,
    image_sha256_hash: str,
    namespace: str,
    min_scale: int = 0,
    env: dict[str, str] | None = None,
) -> None:
    use_env = env or {}
    knative_service = {
        "apiVersion": "serving.knative.dev/v1",
        "kind": "Service",
        "metadata": {
            "name": service_name,
            "namespace": namespace,
        },
        "spec": {
            "template": {
                "metadata": {
                    "annotations": {
                        "autoscaling.knative.dev/minScale": str(min_scale),
                    },
                },
                "spec": {
                    "containers": [
                        {
                            "image": f"{image_url}@{image_sha256_hash}",
                            "env": [
                                {"name": str(k), "value": str(v)}
                                for k, v in use_env.items()
                            ],
                        }
                    ],
                },
            }
        },
    }

    ## TODO: Add resource limits and quotas by namespace
    create_namespace_by_team(namespace)

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


def get_env_vars(app_id: uuid.UUID, session: SessionDep) -> dict[str, str]:
    smt = select(EnvironmentVariable).where(EnvironmentVariable.app_id == app_id)
    env_vars = session.exec(smt).all()
    return {env_var.name: env_var.value for env_var in env_vars}


def process_message(message: dict[str, Any], session: SessionDep) -> None:
    bucket = message.get("bucket", {})
    _object = message.get("object", {})

    # Extract necessary data from the message
    bucket_name = bucket.get("name")
    object_key = _object.get("key")
    image_tag = _object.get("key").split(".")[0].replace("/", "_")
    registry_url = get_builder_settings().ECR_REGISTRY_URL

    object_name = object_key.split("/")[-1]
    object_id = object_name.split(".")[0]

    deployment_with_team = session.exec(
        select(Deployment)
        .options(joinedload(Deployment.app).joinedload(App.team))  # type: ignore
        .where(Deployment.id == object_id)
    ).first()
    if deployment_with_team is None:
        raise RuntimeError("Deployment not found")

    team = deployment_with_team.app.team

    # Create a temporary directory for the build context
    build_context = f"/tmp/{object_id}/build_context"
    if os.path.exists(build_context):
        shutil.rmtree(build_context)
    os.makedirs(build_context)

    app_name = deployment_with_team.slug

    # Update status to building
    deployment_with_team.status = DeploymentStatus.building
    session.commit()

    # Download and extract the tar file
    download_and_extract_tar(
        bucket_name, object_key, object_id, extract_to=build_context
    )

    # Create ECR repository if it doesn't exist
    create_ecr_repository(image_tag)

    # Copy Dockerfile to build context
    build_files = os.listdir(build_context)
    if "requirements.txt" in build_files:
        shutil.copy("/app/Dockerfile.requirements", f"{build_context}/Dockerfile")
    else:
        shutil.copy("/app/Dockerfile.standard", f"{build_context}/Dockerfile")

    # Build and push Docker image
    sha256 = build_and_push_docker_image(image_tag, build_context, registry_url)

    # Update status to deploying
    deployment_with_team.status = DeploymentStatus.deploying
    session.commit()

    env_vars = get_env_vars(deployment_with_team.app_id, session)

    # Deploy to Kubernetes
    deploy_to_kubernetes(
        service_name=app_name,
        image_url=f"{registry_url}/{image_tag}",
        image_sha256_hash=sha256,
        namespace=f"team-{team.id}",
        env=env_vars,
    )

    # Clean up the build context
    shutil.rmtree(build_context)

    # Update status to success
    deployment_with_team.status = DeploymentStatus.success
    session.commit()


@app.post("/apps")
def event_service_handler(event: dict[str, Any], session: SessionDep) -> Any:
    message = event["Body"]["Records"][0].get("s3", {})
    try:
        process_message(message, session)
    except Exception as e:
        object_id = message.get("object", {}).get("key").split("/")[-1].split(".")[0]
        smt = select(Deployment).where(Deployment.id == object_id)
        deployment = session.exec(smt).first()
        if deployment is None:
            raise RuntimeError("Deployment not found")

        deployment.status = DeploymentStatus.failed
        session.commit()
        sentry_sdk.capture_exception(e)
        raise e

    return {"message": "OK"}


class HealthCheckResponse(BaseModel):
    message: str


@app.get("/health-check/", response_model=HealthCheckResponse)
def health_check() -> Any:
    return HealthCheckResponse(message="OK")


# dump comment
# TODO: separate service accounts for better security
