import os
from collections.abc import Generator
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import APIKeyHeader
from kubernetes import client as k8s
from kubernetes import config
from kubernetes.client import Configuration
from sqlmodel import Session

from app.core.config import BuilderSettings, CommonSettings
from app.core.db import engine

builder_settings = BuilderSettings.get_settings()
common_settings = CommonSettings.get_settings()


def load_kube_config() -> None:
    if common_settings.ENVIRONMENT == "local" or os.getenv("CI"):
        client_config = Configuration()
        contexts = config.list_kube_config_contexts()[0]
        knative_kind_context_name = "kind-knative"
        names = {c["name"] for c in contexts}
        if knative_kind_context_name in names:
            config.load_kube_config(
                context=knative_kind_context_name,
                client_configuration=client_config,
            )
            # Override the host to the Knative service host, by default it will be on
            # http://127.0.0.1:xxxx, but that's not available inside of Docker
            if builder_settings.KUBERNETES_HOST:
                # In Docker Compose, override the host using the provided host name
                client_config.host = builder_settings.KUBERNETES_HOST
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
