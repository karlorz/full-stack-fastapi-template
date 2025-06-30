import os
import shutil
import subprocess
import tarfile
import tempfile
import uuid
from collections.abc import Generator
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any

import logfire
import redis
import sentry_sdk
import stamina
from asyncer import syncify
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import Depends, FastAPI, HTTPException
from kubernetes import client as k8s
from kubernetes.client.rest import ApiException as K8sApiException
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import select

from app import depot_client
from app.aws_utils import get_ecr_client, get_s3_client
from app.builder.builder_utils import (
    SessionDep,
    get_app_namespace,
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
    SettingsEnv,
)
from app.core.db import engine
from app.depot_py.depot.build import v1 as depot_build
from app.models import (
    App,
    Deployment,
    DeploymentStatus,
    DeployMessage,
    EnvironmentVariable,
    Message,
)
from app.utils import get_datetime_utc

from .models import BuildLog, BuildLogComplete, BuildLogFailed, BuildLogMessage

builder_settings = BuilderSettings.get_settings()
common_settings = CommonSettings.get_settings()


# AWS S3 client
s3 = get_s3_client()

# AWS ECR client
ecr = get_ecr_client()

root_path = Path(__file__).parents[2].resolve()

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

logfire.configure(
    token=common_settings.LOGFIRE_TOKEN,
    environment=common_settings.ENVIRONMENT,
    service_name="builder",
    send_to_logfire="if-token-present",
)
logfire.instrument_fastapi(app)
logfire.instrument_httpx()
logfire.instrument_sqlalchemy(engine=engine)
logfire.instrument_redis()


def get_ecr_token() -> str:
    """
    Get the ECR token for the current AWS account.
    """
    try:
        response = ecr.get_authorization_token()
    except NoCredentialsError:
        print("Credentials not available")
        raise

    token = response["authorizationData"][0].get("authorizationToken")
    assert token, "No authorization token available"

    return token


def create_namespace(namespace: str) -> None:
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


class ServiceName(str, Enum):
    api = "api-fastapicloud"
    builder = "builder-fastapicloud"
    posthog = "posthog-fastapicloud"


def deploy_cloud(
    service_name: ServiceName,
    image_url: str,
    min_scale: int = 0,
    public: bool = False,
    container_port: int | None = None,
    domain: str | None = None,
) -> None:
    namespace = "fastapicloud"

    settings_groups: list[type[SettingsEnv]] = []

    if service_name == ServiceName.api:
        settings_groups.extend(
            [CommonSettings, DBSettings, CloudflareSettings, MainSettings]
        )
    elif service_name == ServiceName.builder:
        settings_groups.extend(
            [
                CommonSettings,
                DBSettings,
                CloudflareSettings,
                BuilderSettings,
                DepotSettings,
            ]
        )
    env_data = {}
    for settings_group in settings_groups:
        settings = settings_group.get_settings()
        env_data.update(settings.model_dump(mode="json", exclude_unset=True))

    # Reserver app names are passed as a comma separated string from .env or env vars
    # but in the python instance they are a tuple, so doing str(v) in the code below
    # doesn't work, so we need to convert it to a comma separated string
    if "RESERVED_APP_NAMES" in env_data:
        env_data["RESERVED_APP_NAMES"] = ",".join(env_data["RESERVED_APP_NAMES"])

    env_strs = {k: str(v) for k, v in env_data.items()}

    deploy_to_kubernetes(
        service_name=service_name.value,
        full_image_tag=image_url,
        namespace=namespace,
        min_scale=min_scale,
        env=env_strs,
        service_account="fastapicloud",
        public=public,
        container_port=container_port,
    )
    if service_name == ServiceName.api:
        # Setting a custom domain exposes the service publicly via the custom domain
        create_custom_domain(
            namespace=namespace,
            domain=MainSettings.get_settings().API_DOMAIN,
            service_name=service_name.value,
        )

    if domain:
        # Create a custom domain for the service
        create_custom_domain(
            namespace=namespace,
            domain=domain,
            service_name=service_name.value,
        )


def deploy_to_kubernetes(
    *,
    service_name: str,
    full_image_tag: str,
    namespace: str,
    # TODO: set to 0 once we debug and improve cold starts
    min_scale: int = 1,
    env: dict[str, str] | None = None,
    service_account: str | None = None,
    labels: dict[str, str] | None = None,
    public: bool = True,
    last_updated: datetime | None = None,
    container_port: int | None = None,
) -> None:
    use_last_updated = last_updated or get_datetime_utc()
    use_env = env or {}
    use_labels = labels or {}
    knative_service: dict[str, Any] = {
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
                        # As this annotation will be different, it will trigger a
                        # new Knative Revision, deploying again, getting the latest
                        # external configs (ConfigMap, Secret, etc.)
                        "last-updated": use_last_updated.isoformat(),
                    },
                    "labels": use_labels,
                },
                "spec": {
                    "containers": [
                        {
                            "image": f"{full_image_tag}",
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

    if container_port:
        knative_service["spec"]["template"]["spec"]["containers"][0]["ports"] = [
            {"containerPort": container_port}
        ]

    if service_account:
        knative_service["spec"]["template"]["spec"]["serviceAccountName"] = (
            service_account
        )
    if not public:
        knative_service["metadata"].setdefault("labels", {})[
            "networking.knative.dev/visibility"
        ] = "cluster-local"

    ## TODO: Add resource limits and quotas by namespace
    create_namespace(namespace)

    create_or_patch_custom_namespaced_object(
        group="serving.knative.dev",
        version="v1",
        namespace=namespace,
        plural="services",
        name=service_name,
        body=knative_service,
    )


def repository_exists(repository_name: str) -> bool:
    try:
        response = ecr.describe_repositories(repositoryNames=[repository_name])
        return len(response["repositories"]) > 0
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") == "RepositoryNotFoundException":
            return False

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


def get_image_name(*, app_id: uuid.UUID, deployment_id: uuid.UUID) -> str:
    image_tag = f"{app_id}_{deployment_id}"
    return image_tag


def get_full_image_name(image_tag: str) -> str:
    if builder_settings.ECR_REGISTRY_URL:
        return f"{builder_settings.ECR_REGISTRY_URL}/{image_tag}"
    if common_settings.ENVIRONMENT == "local":
        return f"localhost:5001/{image_tag}"
    return image_tag


def download_and_extract_tar(
    *, bucket_name: str, object_key: str, object_id: str, extract_to: str
) -> None:
    with tempfile.TemporaryDirectory(prefix=f"download-tar-{object_id}-") as tar_dir:
        print(f"Download directory: {tar_dir}")
        tar_path = f"{tar_dir}/code.tar"
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


def _subprocess_stream(
    command: list[str], env: dict[str, str] | None = None
) -> Generator[str, None, None]:
    process = subprocess.Popen(
        command,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        universal_newlines=True,
    )

    if process.stderr:
        yield from process.stderr

    process.wait()
    status = process.poll()

    if status is not None and status != 0:
        raise subprocess.CalledProcessError(status, process.args)


def depot_build_exec(
    *,
    context_dir: Path,
    image_full_name: str,
    project_id: str,
    build_id: str,
    build_token: str,
) -> Generator[str, None, None]:
    additional_flags = (
        ["--load"]
        if CommonSettings.get_settings().ENVIRONMENT == "local"
        else ["--push"]
    )

    env = {
        **os.environ,
        "DEPOT_BUILD_ID": build_id,
        "DEPOT_TOKEN": build_token,
        "DEPOT_PROJECT_ID": project_id,
        "DEPOT_NO_SUMMARY_LINK": "true",
    }

    if CommonSettings.get_settings().ENVIRONMENT != "local":
        ecr_token = get_ecr_token()

        env["DEPOT_PUSH_REGISTRY_AUTH"] = ecr_token

    yield from _subprocess_stream(
        [
            "depot",
            "build",
            *additional_flags,
            "-t",
            image_full_name,
            str(context_dir),
        ],
        env=env,
    )


def retry_on_grpc_error(exc: Exception) -> bool:
    from grpclib import GRPCError, Status
    from grpclib.exceptions import StreamTerminatedError

    RETRYABLE_GRPC_STATUS_CODES = [
        Status.DEADLINE_EXCEEDED,
        Status.UNAVAILABLE,
        Status.CANCELLED,
        Status.INTERNAL,
    ]

    if isinstance(exc, GRPCError) and exc.status in RETRYABLE_GRPC_STATUS_CODES:
        return True

    return isinstance(exc, (StreamTerminatedError))


@stamina.retry(on=retry_on_grpc_error)
def _create_build(
    depot_client: depot_build.BuildServiceStub,
    depot_settings: DepotSettings,
) -> depot_build.CreateBuildResponse:
    return syncify(depot_client.create_build)(
        create_build_request=depot_build.CreateBuildRequest(
            project_id=depot_settings.DEPOT_PROJECT_ID
        ),
    )


def build_and_push_docker_image(
    *, full_image_tag: str, docker_context_path: str
) -> Generator[str, None, None]:
    depot_settings = DepotSettings.get_settings()

    build_request = _create_build(depot_client.build(), depot_settings)

    print(f"Build request created: {build_request.build_id}")

    yield from depot_build_exec(
        context_dir=Path(docker_context_path),
        image_full_name=full_image_tag,
        # TODO: one project per app
        project_id=depot_settings.DEPOT_PROJECT_ID,
        build_id=build_request.build_id,
        build_token=build_request.build_token,
    )

    if common_settings.ENVIRONMENT == "local":
        # Save to local registry so Knative can use it
        local_result = subprocess.run(
            ["docker", "push", full_image_tag],
            check=True,
            capture_output=True,
        )
        print(local_result.stdout)


def get_env_vars(app_id: uuid.UUID, session: SessionDep) -> dict[str, str]:
    smt = select(EnvironmentVariable).where(EnvironmentVariable.app_id == app_id)
    env_vars = session.exec(smt).all()
    return {env_var.name: env_var.value for env_var in env_vars}


def _send_build_log(
    deployment_id: uuid.UUID,
    log: BuildLog,
    redis_client: redis.Redis,
) -> None:
    redis_client.xadd(
        f"build_logs:{deployment_id}",
        fields=log.model_dump(mode="json"),  # type: ignore
        maxlen=1_000,
    )


def _app_process_build(*, deployment_id: uuid.UUID, session: SessionDep) -> None:
    redis_client = redis.Redis.from_url(CommonSettings.get_settings().REDIS_URI)

    bucket_name = CommonSettings.get_settings().DEPLOYMENTS_BUCKET_NAME

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

    try:
        team = deployment_with_team.app.team
        image_tag = get_image_name(
            app_id=deployment_with_team.app.id, deployment_id=deployment_with_team.id
        )

        # TODO: this should maybe live in the model
        object_key = f"{deployment_with_team.app.id}/{deployment_with_team.id}.tar"
        env_vars = get_env_vars(deployment_with_team.app_id, session)
        app_name = deployment_with_team.slug

        context_name_prefix = f"build-context-{deployment_with_team.id}-"

        with tempfile.TemporaryDirectory(prefix=context_name_prefix) as build_context:
            print(f"Build context: {build_context}")

            deployment_with_team.status = DeploymentStatus.extracting
            session.commit()

            # Download and extract the tar file
            download_and_extract_tar(
                bucket_name=bucket_name,
                object_id=str(deployment_with_team.id),
                object_key=object_key,
                extract_to=build_context,
            )

            # Create ECR repository if it doesn't exist
            if builder_settings.ECR_REGISTRY_URL:
                create_ecr_repository(image_tag)

            shutil.copytree(
                root_path / "builder-context", build_context, dirs_exist_ok=True
            )

            deployment_with_team.status = DeploymentStatus.building_image
            session.commit()

            full_image_tag = get_full_image_name(image_tag)

            for line in build_and_push_docker_image(
                full_image_tag=full_image_tag,
                docker_context_path=build_context,
            ):
                progress_log = BuildLogMessage(message=line)

                _send_build_log(deployment_with_team.id, progress_log, redis_client)

            # Update status to deploying
            deployment_with_team.status = DeploymentStatus.deploying
            session.commit()

            # Deploy to Kubernetes
            deploy_to_kubernetes(
                service_name=app_name,
                full_image_tag=full_image_tag,
                namespace=get_app_namespace(deployment_with_team.app),
                env=env_vars,
                labels={
                    "fastapicloud_team": team.slug,
                    "fastapicloud_app": deployment_with_team.app.slug,
                    "fastapicloud_deployment": str(deployment_with_team.id),
                },
                last_updated=deployment_with_team.updated_at,
            )

        # Update status to success
        deployment_with_team.status = DeploymentStatus.success
        session.commit()

        _send_build_log(deployment_with_team.id, BuildLogComplete(), redis_client)
    except Exception as e:
        deployment_with_team.status = DeploymentStatus.failed
        session.commit()

        _send_build_log(deployment_with_team.id, BuildLogFailed(), redis_client)
        raise e


@app.post("/apps/depot/build", dependencies=[Depends(validate_api_key)])
def app_depot_build(message: DeployMessage, session: SessionDep) -> Message:
    smt = select(Deployment).where(Deployment.id == message.deployment_id)
    deployment = session.exec(smt).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    if deployment.status == DeploymentStatus.waiting_upload:
        raise HTTPException(
            status_code=500,
            detail="Deployment is waiting for upload, the build should have not been triggered",
        )
    if deployment.status != DeploymentStatus.ready_for_build:
        return Message(message="Already being processed")

    # TODO: we could pass the deployment directly instead of the id
    _app_process_build(deployment_id=message.deployment_id, session=session)

    return Message(message="OK")


@app.post("/deploy", dependencies=[Depends(validate_api_key)])
def deploy(
    message: DeployMessage,
    session: SessionDep,
) -> Message:
    deployment = session.exec(
        select(Deployment).where(Deployment.id == message.deployment_id)
    ).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    image_tag = f"{deployment.app.id}_{deployment.id}"
    image_tag = get_image_name(app_id=deployment.app.id, deployment_id=deployment.id)
    full_image_tag = get_full_image_name(image_tag)
    env_vars = get_env_vars(deployment.app.id, session)

    deploy_to_kubernetes(
        service_name=deployment.slug,
        full_image_tag=full_image_tag,
        namespace=get_app_namespace(deployment.app),
        env=env_vars,
        labels={
            "fastapicloud_team": deployment.app.team.slug,
            "fastapicloud_app": deployment.app.slug,
            "fastapicloud_deployment": str(deployment.id),
        },
        last_updated=deployment.updated_at,
    )
    deployment.status = DeploymentStatus.success
    session.add(deployment)
    session.commit()

    return Message(message="OK")


class HealthCheckResponse(BaseModel):
    message: str


@app.get("/health-check/", response_model=HealthCheckResponse)
def health_check() -> Any:
    return HealthCheckResponse(message="OK")
