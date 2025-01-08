import os
import uuid
from collections.abc import Generator
from functools import lru_cache
from typing import Annotated, Literal

from fastapi import Depends, HTTPException
from fastapi.security import APIKeyHeader
from kubernetes import client as k8s
from kubernetes import config
from kubernetes.client import Configuration
from sqlmodel import Session, select

from app.core.config import BuilderSettings, CommonSettings
from app.core.db import engine
from app.models import Deployment, DeploymentStatus

builder_settings = BuilderSettings.get_settings()
common_settings = CommonSettings.get_settings()


def load_kube_config() -> None:
    if CommonSettings.get_settings().ENVIRONMENT == "local" or os.getenv("CI"):
        client_config = Configuration()
        contexts = config.list_kube_config_contexts()[0]
        knative_kind_context_name = "kind-knative"
        names = {c["name"] for c in contexts}
        if knative_kind_context_name in names:
            config.load_kube_config(
                context=knative_kind_context_name,
                client_configuration=client_config,
            )
            client_config.host = "https://knative-control-plane:6443"
            Configuration.set_default(client_config)
        else:
            config.load_kube_config()
    else:
        config.load_incluster_config()


@lru_cache
def get_kubernetes_client_custom_objects() -> k8s.CustomObjectsApi:
    load_kube_config()
    return k8s.CustomObjectsApi()


@lru_cache
def get_kubernetes_client_core_v1() -> k8s.CoreV1Api:
    load_kube_config()
    return k8s.CoreV1Api()


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
api_key_header = APIKeyHeader(name="X-API-KEY")


def validate_api_key(api_key: Annotated[str, Depends(api_key_header)]) -> str:
    if api_key != common_settings.BUILDER_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


def ensure_deployment_is_buildable(
    deployment_id: uuid.UUID, source: Literal["sqs", "api"], session: SessionDep
) -> None:
    smt = select(Deployment).where(Deployment.id == deployment_id)
    deployment = session.exec(smt).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    match deployment.status:
        case DeploymentStatus.ready_for_build:
            return
        case DeploymentStatus.waiting_upload if source == "sqs":
            return
        case DeploymentStatus.waiting_upload:
            raise HTTPException(
                status_code=400,
                detail="Deployment is waiting for upload",
            )
        case DeploymentStatus.building | DeploymentStatus.deploying:
            raise HTTPException(
                status_code=400,
                detail="Deployment is being processed",
            )
        case DeploymentStatus.success:
            raise HTTPException(
                status_code=400,
                detail="Deployment is already processed",
            )
        case DeploymentStatus.failed:
            raise HTTPException(
                status_code=400,
                detail="Deployment failed",
            )
        case _:
            raise RuntimeError("Deployment is in unknown state")
