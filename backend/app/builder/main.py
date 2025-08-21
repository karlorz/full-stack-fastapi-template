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
from botocore.exceptions import ClientError
from fastapi import Depends, FastAPI, HTTPException
from kubernetes import client as k8s
from kubernetes.client.rest import ApiException as K8sApiException
from mypy_boto3_ecr import ECRClient
from mypy_boto3_s3 import S3Client
from pydantic import BaseModel
from sqlalchemy.orm import joinedload
from sqlmodel import select

from app import depot_client
from app.api.deps.aws import ECRDep, S3Dep
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
    CleanupMessage,
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


def get_ecr_token(ecr: ECRClient) -> str:
    """
    Get the ECR token for the current AWS account.
    """

    response = ecr.get_authorization_token()

    token = response["authorizationData"][0].get("authorizationToken")
    assert token, "No authorization token available"

    return token


def create_namespace(namespace: str) -> None:
    api_instance = get_kubernetes_client_core_v1()

    try:
        api_instance.read_namespace(name=namespace)  # type: ignore
        logfire.info(
            f"Namespace '{namespace}' already exists."
        )  # if there is no error, the namespace exists
    except K8sApiException as e:
        if e.status == 404:
            namespace_body = k8s.V1Namespace(metadata=k8s.V1ObjectMeta(name=namespace))

            api_instance.create_namespace(namespace_body)  # type: ignore
            logfire.info(
                f"Namespace '{namespace}' created."
            )  # if there is no error, the namespace was created
        else:
            logfire.error(f"Error reading namespace: {e}")

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
        logfire.info(f"Custom object patched. Status='{api_response}'")

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
            logfire.info(f"Custom object created. Status='{api_response}'")
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
        logfire.info(f"Custom object patched. Status='{api_response}'")

    except K8sApiException as e:
        if e.status == 404:  # Not Found
            # Object doesn't exist, so create it
            api_response = api_instance.create_cluster_custom_object(  # type: ignore
                group=group,
                version=version,
                plural=plural,
                body=body,
            )
            logfire.info(f"Custom object created. Status='{api_response}'")
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

    logfire.info(
        f"Deploying service '{service_name}' to namespace '{namespace}'",
        labels=use_labels,
    )

    knative_service: dict[str, Any] = {
        "apiVersion": "serving.knative.dev/v1",
        "kind": "Service",
        "metadata": {
            "name": service_name,
            "namespace": namespace,
            "labels": use_labels,
        },
        "spec": {
            "template": {
                "metadata": {
                    "annotations": {
                        "autoscaling.knative.dev/min-scale": str(min_scale),
                        # As this annotation will be different, it will trigger a
                        # new Knative Revision, deploying again, getting the latest
                        # external configs (ConfigMap, Secret, etc.)
                        "fastapicloud.com/last-updated": use_last_updated.isoformat(),
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


def repository_exists(repository_name: str, ecr: ECRClient) -> bool:
    try:
        response = ecr.describe_repositories(repositoryNames=[repository_name])
        return len(response["repositories"]) > 0
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") == "RepositoryNotFoundException":
            return False

        raise


def get_repository_name(app_id: uuid.UUID) -> str:
    return str(app_id)


def create_ecr_repository(app_id: uuid.UUID, ecr: ECRClient) -> None:
    """
    Creates an ECR repository for the app if it doesn't exist.

    The repository name is the app id.
    """
    repository_name = get_repository_name(app_id)

    if not repository_exists(repository_name, ecr):
        ecr.create_repository(repositoryName=repository_name)


def get_image_name(*, app_id: uuid.UUID, deployment_id: uuid.UUID) -> str:
    """
    The image name is the app id and the deployment id.
    """
    return f"{app_id}:{deployment_id}"


def get_full_image_name(image_tag: str) -> str:
    if builder_settings.ECR_REGISTRY_URL:
        return f"{builder_settings.ECR_REGISTRY_URL}/{image_tag}"
    if common_settings.ENVIRONMENT == "local":
        return f"registry.kind.local:5000/{image_tag}"
    return image_tag


def download_and_extract_tar(
    *, bucket_name: str, object_key: str, object_id: str, extract_to: str, s3: S3Client
) -> None:
    with tempfile.TemporaryDirectory(prefix=f"download-tar-{object_id}-") as tar_dir:
        logfire.info(f"Download directory: {tar_dir}")
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


def buildkit_build_exec(
    *,
    context_dir: Path,
    image_full_name: str,
) -> Generator[str, None, None]:
    if not builder_settings.BUILDKIT_URL:
        raise ValueError("BUILDKIT_URL must be set when BUILD_TOOL is buildkit")
    yield from _subprocess_stream(
        [
            "buildctl",
            "--addr",
            builder_settings.BUILDKIT_URL,
            "build",
            "--frontend",
            "dockerfile.v0",
            "--local",
            f"context={context_dir}",
            "--local",
            f"dockerfile={context_dir}",
            "--output",
            f"type=image,name={image_full_name},push=true,registry.insecure=true",  # TODO: use certificate
        ]
    )


def depot_build_exec(
    *,
    context_dir: Path,
    image_full_name: str,
    project_id: str,
    build_id: str,
    build_token: str,
    ecr: ECRClient,
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
        ecr_token = get_ecr_token(ecr)

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


def _cleanup_line(line: str) -> str:
    """
    Remove the depot prefix from the line.
    """
    return line.replace("[depot] ", "")


def build_and_push_docker_image(
    *, full_image_tag: str, docker_context_path: str, ecr: ECRClient
) -> Generator[str, None, None]:
    match builder_settings.BUILD_TOOL:
        case "buildkit":
            yield from buildkit_build_exec(
                context_dir=Path(docker_context_path),
                image_full_name=full_image_tag,
            )

        case "depot":
            depot_settings = DepotSettings.get_settings()
            build_request = _create_build(depot_client.build(), depot_settings)

            logfire.info(f"Build request created: {build_request.build_id}")

            yield from depot_build_exec(
                context_dir=Path(docker_context_path),
                image_full_name=full_image_tag,
                # TODO: one project per app
                project_id=depot_settings.DEPOT_PROJECT_ID,
                build_id=build_request.build_id,
                build_token=build_request.build_token,
                ecr=ecr,
            )

            logfire.info(f"Build request completed: {build_request.build_id}")

            if common_settings.ENVIRONMENT == "local":
                # Save to local registry so Knative can use it
                local_result = subprocess.run(
                    ["docker", "push", full_image_tag],
                    check=True,
                    capture_output=True,
                )

                print(local_result.stdout.decode("utf-8"))  # noqa: T201


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


def cleanup_app_kubernetes_resources(app: App) -> None:
    """Clean up all Kubernetes resources for an app using label selectors."""
    namespace = get_app_namespace(app)

    with logfire.span(
        "Cleanup Kubernetes resources for app {app_id}",
        app_id=app.id,
    ):
        api_instance = get_kubernetes_client_custom_objects()

        label_selector = f"fastapicloud.com/app={app.id}"

        logfire.info(f"Deleting Knative Services for app {app.id}")

        services = api_instance.list_namespaced_custom_object(  # type: ignore[no-untyped-call]
            group="serving.knative.dev",
            version="v1",
            namespace=namespace,
            plural="services",
            label_selector=label_selector,
        )

        for item in services.get("items", []):
            name = item["metadata"]["name"]

            logfire.info(f"Deleting Knative service: {name}")

            api_instance.delete_namespaced_custom_object(  # type: ignore[no-untyped-call]
                group="serving.knative.dev",
                version="v1",
                namespace=namespace,
                plural="services",
                name=name,
            )

        knative_services_deleted = len(services.get("items", []))

        logfire.info(f"Deleted {knative_services_deleted} Knative services")


def _app_process_build(
    *,
    deployment_with_team: Deployment,
    session: SessionDep,
    ecr: ECRClient,
    s3: S3Client,
) -> None:
    redis_client = redis.Redis.from_url(CommonSettings.get_settings().REDIS_URI)

    bucket_name = CommonSettings.get_settings().DEPLOYMENTS_BUCKET_NAME

    # Update status to building
    deployment_with_team.status = DeploymentStatus.building
    session.commit()

    try:
        image_tag = get_image_name(
            app_id=deployment_with_team.app.id, deployment_id=deployment_with_team.id
        )

        env_vars = get_env_vars(deployment_with_team.app.id, session)
        app_name = deployment_with_team.slug

        context_name_prefix = f"build-context-{deployment_with_team.id}-"

        with tempfile.TemporaryDirectory(prefix=context_name_prefix) as build_context:
            logfire.info(f"Build context: {build_context}")

            deployment_with_team.status = DeploymentStatus.extracting
            session.commit()

            # Download and extract the tar file
            download_and_extract_tar(
                bucket_name=bucket_name,
                object_id=str(deployment_with_team.id),
                object_key=deployment_with_team.s3_object_key,
                extract_to=build_context,
                s3=s3,
            )

            # Create ECR repository if it doesn't exist
            if builder_settings.ECR_REGISTRY_URL:
                create_ecr_repository(deployment_with_team.app.id, ecr=ecr)

            shutil.copytree(
                root_path / "builder-context", build_context, dirs_exist_ok=True
            )

            deployment_with_team.status = DeploymentStatus.building_image
            session.commit()

            full_image_tag = get_full_image_name(image_tag)

            for line in build_and_push_docker_image(
                full_image_tag=full_image_tag,
                docker_context_path=build_context,
                ecr=ecr,
            ):
                line = _cleanup_line(line)

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
                    "fastapicloud.com/team": str(deployment_with_team.app.team.id),
                    "fastapicloud.com/team-slug": deployment_with_team.app.team.slug,
                    "fastapicloud.com/app": str(deployment_with_team.app.id),
                    "fastapicloud.com/app-slug": deployment_with_team.app.slug,
                    "fastapicloud.com/deployment": str(deployment_with_team.id),
                    # legacy for vector, to remove once we remove vector
                    "fastapicloud_team": deployment_with_team.app.team.slug,
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
def app_depot_build(
    message: DeployMessage, session: SessionDep, ecr: ECRDep, s3: S3Dep
) -> Message:
    deployment_with_team = session.exec(
        select(Deployment)
        .options(joinedload(Deployment.app).joinedload(App.team))  # type: ignore
        .where(Deployment.id == message.deployment_id)
    ).first()

    if deployment_with_team is None:
        raise HTTPException(status_code=404, detail="Deployment not found")

    if deployment_with_team.status == DeploymentStatus.waiting_upload:
        raise HTTPException(
            status_code=500,
            detail="Deployment is waiting for upload, the build should have not been triggered",
        )

    if deployment_with_team.status != DeploymentStatus.ready_for_build:
        return Message(message="Already being processed")

    _app_process_build(
        deployment_with_team=deployment_with_team, session=session, ecr=ecr, s3=s3
    )

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
            "fastapicloud.com/team": str(deployment.app.team.id),
            "fastapicloud.com/team-slug": deployment.app.team.slug,
            "fastapicloud.com/app": str(deployment.app.id),
            "fastapicloud.com/app-slug": deployment.app.slug,
            "fastapicloud.com/deployment": str(deployment.id),
            # legacy for vector, to remove once we remove vector
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


@app.post("/cleanup", dependencies=[Depends(validate_api_key)])
def cleanup_app(message: CleanupMessage, session: SessionDep) -> Message:
    """
    Clean up app resources (kubernetes). This doesn't delete the app from the database.
    """
    app_with_deployments = session.exec(
        select(App)
        .options(joinedload(App.deployments))  # type: ignore
        .where(App.id == message.app_id)
    ).first()

    if not app_with_deployments:
        raise HTTPException(status_code=404, detail="App not found")

    cleanup_app_kubernetes_resources(app_with_deployments)

    app_with_deployments.cleaned_up_at = get_datetime_utc()
    session.add(app_with_deployments)
    session.commit()

    return Message(message="Cleanup completed")


class HealthCheckResponse(BaseModel):
    message: str


@app.get("/health-check/", response_model=HealthCheckResponse)
def health_check() -> Any:
    return HealthCheckResponse(message="OK")
