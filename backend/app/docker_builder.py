import json
import os
import shutil
import subprocess
import tarfile
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

import boto3
import sentry_sdk
from asyncer import syncify
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from kubernetes import client as k8s
from kubernetes.client.rest import ApiException as K8sApiException
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import select

from app import depot_client
from app.builder_utils import (
    SessionDep,
    ensure_deployment_is_buildable,
    get_kubernetes_client_core_v1,
    get_kubernetes_client_custom_objects,
    validate_api_key,
)
from app.core.config import (
    BuilderSettings,
    CloudflareSettings,
    CommonSettings,
    DBSettings,
    DepotSettings,
    MainSettings,
)
from app.depot_py.depot.build import v1 as depot_build
from app.models import (
    App,
    Deployment,
    DeploymentStatus,
    EnvironmentVariable,
    Message,
    SendDeploy,
)

builder_settings = BuilderSettings.get_settings()

# aws vars
aws_region = builder_settings.AWS_REGION

# AWS S3 client
s3 = boto3.client("s3", region_name=aws_region)

# AWS ECR client
ecr = boto3.client("ecr", region_name=aws_region)


# Sentry

if (
    builder_settings.BUILDER_SENTRY_DSN
    and CommonSettings.get_settings().ENVIRONMENT != "local"
):
    sentry_sdk.init(
        dsn=str(builder_settings.BUILDER_SENTRY_DSN),
        enable_tracing=True,
        environment=CommonSettings.get_settings().ENVIRONMENT,
    )

# FastAPI app
app = FastAPI()


def create_namespace_by_team(namespace: str) -> None:
    api_instance = get_kubernetes_client_core_v1()

    try:
        api_instance.read_namespace(name=namespace)  # type: ignore
        print(
            f"Namespace '{namespace}' already exists."
        )  # if there is no error, the namespace exists
    except K8sApiException as e:
        if e.status == 404:
            namespace_body = k8s.V1Namespace(metadata=k8s.V1ObjectMeta(name=namespace))
            try:
                api_instance.create_namespace(namespace_body)  # type: ignore
                print(
                    f"Namespace '{namespace}' created."
                )  # if there is no error, the namespace was created
            except K8sApiException as ex:
                print(f"Error creating namespace: {ex}")
                raise ex
        else:
            print(f"Error reading namespace: {e}")
            raise e


def create_or_patch_custom_namespaced_object(
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

    except K8sApiException as e:
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


def create_or_patch_custom_cluster_object(
    *,
    group: str,
    version: str,
    plural: str,
    name: str,
    body: dict[str, Any],
) -> None:
    api_instance = get_kubernetes_client_custom_objects()

    try:
        # Try to get the custom object
        api_instance.get_cluster_custom_object(  # type: ignore
            group=group, version=version, plural=plural, name=name
        )

        # Object exists, so patch it
        api_response = api_instance.patch_cluster_custom_object(  # type: ignore
            group=group,
            version=version,
            plural=plural,
            name=name,
            body=body,
        )
        print(f"Custom object patched. Status='{api_response}'")

    except K8sApiException as e:
        if e.status == 404:  # Not Found
            # Object doesn't exist, so create it
            api_response = api_instance.create_cluster_custom_object(  # type: ignore
                group=group,
                version=version,
                plural=plural,
                body=body,
            )
            print(f"Custom object created. Status='{api_response}'")
        else:
            raise e


def create_custom_domain(*, namespace: str, domain: str, service_name: str) -> None:
    domain_claim = {
        "apiVersion": "networking.internal.knative.dev/v1alpha1",
        "kind": "ClusterDomainClaim",
        "metadata": {
            "name": domain,
        },
        "spec": {
            "namespace": namespace,
        },
    }
    create_or_patch_custom_cluster_object(
        group="networking.internal.knative.dev",
        version="v1alpha1",
        plural="clusterdomainclaims",
        name=domain,
        body=domain_claim,
    )

    domain_mapping = {
        "apiVersion": "serving.knative.dev/v1beta1",
        "kind": "DomainMapping",
        "metadata": {
            "name": domain,
            "namespace": namespace,
        },
        "spec": {
            "ref": {
                "name": service_name,
                "kind": "Service",
                "apiVersion": "serving.knative.dev/v1",
            },
        },
    }
    create_or_patch_custom_namespaced_object(
        group="serving.knative.dev",
        version="v1beta1",
        namespace=namespace,
        plural="domainmappings",
        name=domain,
        body=domain_mapping,
    )


def deploy_cloud(service_name: str, image_url: str, min_scale: int = 0) -> None:
    main_settings = MainSettings.get_settings().model_dump(
        mode="json", exclude_unset=True, exclude={"all_cors_origins"}
    )
    common_settings = CommonSettings.get_settings().model_dump(
        mode="json", exclude_unset=True
    )
    db_settings = DBSettings.get_settings().model_dump(mode="json", exclude_unset=True)
    cloudflare_settings = CloudflareSettings.get_settings().model_dump(
        mode="json", exclude_unset=True
    )

    env_data = {
        **main_settings,
        **common_settings,
        **db_settings,
        **cloudflare_settings,
    }

    env_strs = {k: str(v) for k, v in env_data.items()}

    namespace = "default"

    deploy_to_kubernetes(
        service_name,
        image_url,
        namespace=namespace,
        min_scale=min_scale,
        env=env_strs,
    )
    create_custom_domain(
        namespace=namespace,
        domain=MainSettings.get_settings().API_DOMAIN,
        service_name=service_name,
    )


def deploy_to_kubernetes(
    service_name: str,
    image_url: str,
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
                            "image": f"{image_url}",
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

    create_or_patch_custom_namespaced_object(
        group="serving.knative.dev",
        version="v1",
        namespace=namespace,
        plural="services",
        name=service_name,
        body=knative_service,
    )


@contextmanager
def docker_login(registry_url: str) -> Iterator[None]:
    try:
        # Get ECR authorization token
        response = ecr.get_authorization_token()
    except NoCredentialsError:
        print("Credentials not available")
        raise
    token = response["authorizationData"][0].get("authorizationToken")
    assert token, "No authorization token available"
    docker_config_path = Path.home().joinpath(".docker/config.json")
    docker_config_path.parent.mkdir(parents=True, exist_ok=True)
    docker_config_path.write_text(
        json.dumps({"auths": {registry_url: {"auth": token}}})
    )
    try:
        yield
    finally:
        # After finishing with this build, remove the Docker config file
        # login should be done again for the next build
        docker_config_path.unlink()


def repository_exists(repository_name: str) -> bool:
    try:
        response = ecr.describe_repositories(repositoryNames=[repository_name])
        return len(response["repositories"]) > 0
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") == "RepositoryNotFoundException":
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


def depot_build_exec(
    *,
    context_dir: Path,
    image_full_name: str,
    project_id: str,
    build_id: str,
    build_token: str,
) -> subprocess.CompletedProcess[bytes]:
    push_load_flag = (
        "--load" if CommonSettings.get_settings().ENVIRONMENT == "local" else "--push"
    )
    result = subprocess.run(
        [
            "depot",
            "build",
            push_load_flag,
            "-t",
            image_full_name,
            str(context_dir),
        ],
        env={
            **os.environ,
            "DEPOT_BUILD_ID": build_id,
            "DEPOT_TOKEN": build_token,
            "DEPOT_PROJECT_ID": project_id,
        },
        check=True,
        capture_output=True,
    )
    return result


def build_and_push_docker_image(
    *, registry_url: str, image_tag: str, docker_context_path: str
) -> None:
    depot_settings = DepotSettings.get_settings()
    # Docker login
    with docker_login(registry_url):
        build_request = syncify(depot_client.build().create_build)(
            create_build_request=depot_build.CreateBuildRequest(
                project_id=depot_settings.DEPOT_PROJECT_ID
            ),
        )
        print(f"Build request created: {build_request.build_id}")

        full_image_name = f"{registry_url}/{image_tag}"
        result = depot_build_exec(
            context_dir=Path(docker_context_path),
            image_full_name=full_image_name,
            # TODO: one project per app
            project_id=depot_settings.DEPOT_PROJECT_ID,
            build_id=build_request.build_id,
            build_token=build_request.build_token,
        )
        print(result.stdout)


def get_env_vars(app_id: uuid.UUID, session: SessionDep) -> dict[str, str]:
    smt = select(EnvironmentVariable).where(EnvironmentVariable.app_id == app_id)
    env_vars = session.exec(smt).all()
    return {env_var.name: env_var.value for env_var in env_vars}


def _app_process_build(deployment_id: uuid.UUID, session: SessionDep) -> None:
    registry_url = BuilderSettings.get_settings().ECR_REGISTRY_URL
    bucket_name = CommonSettings.get_settings().AWS_DEPLOYMENT_BUCKET

    deployment_with_team = session.exec(
        select(Deployment)
        .options(joinedload(Deployment.app).joinedload(App.team))  # type: ignore
        .where(Deployment.id == deployment_id)
    ).first()
    if deployment_with_team is None:
        raise HTTPException(status_code=404, detail="Deployment not found")

    # Update status to building
    deployment_with_team.status = DeploymentStatus.building
    session.commit()

    team = deployment_with_team.app.team
    image_tag = f"{deployment_with_team.app.id}_{deployment_with_team.id}"
    object_key = f"{deployment_with_team.app.id}/{deployment_with_team.id}.tar"
    env_vars = get_env_vars(deployment_with_team.app_id, session)
    app_name = deployment_with_team.slug

    build_context = f"/tmp/{deployment_with_team.id}/build_context"
    if os.path.exists(build_context):
        shutil.rmtree(build_context)
    os.makedirs(build_context)

    # Download and extract the tar file
    download_and_extract_tar(
        bucket_name, object_key, str(deployment_with_team.id), extract_to=build_context
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
    build_and_push_docker_image(
        registry_url=registry_url,
        image_tag=image_tag,
        docker_context_path=build_context,
    )

    # Update status to deploying
    deployment_with_team.status = DeploymentStatus.deploying
    session.commit()

    # Deploy to Kubernetes
    deploy_to_kubernetes(
        service_name=app_name,
        image_url=f"{registry_url}/{image_tag}",
        namespace=f"team-{team.id}",
        env=env_vars,
    )

    # Clean up the build context
    shutil.rmtree(build_context)

    # Update status to success
    deployment_with_team.status = DeploymentStatus.success
    session.commit()


# ! Deprecated, will be removed to use the new endpoint /apps/depot/build
@app.post("/apps")
def event_service_handler(event: dict[str, Any], session: SessionDep) -> Any:
    message = event["Body"]["Records"][0].get("s3", {})
    try:
        # Extract deployment id from the message
        _object = message.get("object", {})
        object_key = _object.get("key")
        object_name = object_key.split("/")[-1]
        deployment_id = object_name.split(".")[0]
        ensure_deployment_is_buildable(deployment_id, "sqs", session)
        _app_process_build(deployment_id, session)
    except Exception as e:
        deployment_id = (
            message.get("object", {}).get("key").split("/")[-1].split(".")[0]
        )
        smt = select(Deployment).where(Deployment.id == deployment_id)
        deployment = session.exec(smt).first()
        if deployment is None:
            raise RuntimeError("Deployment not found")

        deployment.status = DeploymentStatus.failed
        session.commit()
        sentry_sdk.capture_exception(e)
        raise e

    return {"message": "OK"}


@app.post("/apps/depot/build", dependencies=[Depends(validate_api_key)])
async def app_depot_build(
    message: SendDeploy, session: SessionDep, background_tasks: BackgroundTasks
) -> Message:
    ensure_deployment_is_buildable(message.deployment_id, "api", session)
    background_tasks.add_task(_app_process_build, message.deployment_id, session)
    return Message(message="OK")


@app.post("/send/deploy", dependencies=[Depends(validate_api_key)])
def send_deploy(
    message: SendDeploy,
    session: SessionDep,
) -> Message:
    deployment = session.exec(
        select(Deployment).where(Deployment.id == message.deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    # TODO: handle this after Depot
    # if not deployment.image_hash:
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Deployment image hash not found, please build first",
    #     )

    app = session.exec(select(App).where(App.id == deployment.app_id)).first()
    if not app:
        raise HTTPException(
            status_code=404, detail="App associated with the deployment not found"
        )

    team = app.team

    image_tag = f"{app.id}_{deployment.id}"
    registry_url = BuilderSettings.get_settings().ECR_REGISTRY_URL
    env_vars = get_env_vars(app.id, session)

    deploy_to_kubernetes(
        service_name=deployment.slug,
        image_url=f"{registry_url}/{image_tag}",
        namespace=f"team-{team.id}",
        env=env_vars,
    )

    return Message(message="OK")


class HealthCheckResponse(BaseModel):
    message: str


@app.get("/health-check/", response_model=HealthCheckResponse)
def health_check() -> Any:
    return HealthCheckResponse(message="OK")


# dump comment
# TODO: separate service accounts for better security
