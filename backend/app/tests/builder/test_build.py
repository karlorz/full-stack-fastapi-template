from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import CommonSettings, MainSettings
from app.models import DeploymentStatus
from app.tests.utils.apps import create_deployment_for_app, create_random_app
from app.tests.utils.team import create_random_team

settings = MainSettings.get_settings()
common_settings = CommonSettings.get_settings()


@pytest.fixture
def redis_mock() -> Generator[MagicMock]:
    with patch(
        "app.builder.main.redis.Redis.from_url", return_value=MagicMock()
    ) as redis_mock:
        yield redis_mock


@pytest.fixture
def download_and_extract_tar_mock() -> Generator[MagicMock]:
    with patch(
        "app.builder.main.download_and_extract_tar", return_value=MagicMock()
    ) as download_and_extract_tar_mock:
        yield download_and_extract_tar_mock


@pytest.fixture
def create_ecr_repository_mock() -> Generator[MagicMock]:
    with patch(
        "app.builder.main.create_ecr_repository", return_value=MagicMock()
    ) as create_ecr_repository_mock:
        yield create_ecr_repository_mock


@pytest.fixture
def build_and_push_docker_image_mock() -> Generator[MagicMock]:
    with patch(
        "app.builder.main.build_and_push_docker_image", return_value=MagicMock()
    ) as build_and_push_docker_image_mock:
        yield build_and_push_docker_image_mock


@pytest.fixture
def deploy_to_kubernetes_mock() -> Generator[MagicMock]:
    with patch(
        "app.builder.main.deploy_to_kubernetes", return_value=MagicMock()
    ) as deploy_to_kubernetes_mock:
        yield deploy_to_kubernetes_mock


def test_depot_build_fails_when_api_key_is_invalid(client: TestClient) -> None:
    response = client.post(
        "/apps/depot/build",
        json={"deployment_id": "123"},
        headers={"X-API-KEY": "invalid"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid API key"}


def test_depot_build_fails_when_deployment_not_found(client: TestClient) -> None:
    response = client.post(
        "/apps/depot/build",
        json={"deployment_id": "00000000-0000-0000-0000-000000000000"},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Deployment not found"}


def test_depot_build_fails_when_deployment_is_waiting_for_upload(
    client: TestClient, db: Session
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.waiting_upload
    )

    response = client.post(
        "/apps/depot/build",
        json={"deployment_id": str(deployment.id)},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )
    assert response.status_code == 500
    assert response.json() == {
        "detail": "Deployment is waiting for upload, the build should have not been triggered"
    }


def test_depot_build_fails(
    client: TestClient,
    db: Session,
    redis_mock: MagicMock,  # noqa: ARG001
    download_and_extract_tar_mock: MagicMock,  # noqa: ARG001
    create_ecr_repository_mock: MagicMock,  # noqa: ARG001
    build_and_push_docker_image_mock: MagicMock,  # noqa: ARG001
    deploy_to_kubernetes_mock: MagicMock,  # noqa: ARG001
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.ready_for_build
    )

    download_and_extract_tar_mock.side_effect = Exception("Woops")

    with pytest.raises(Exception, match="Woops"):
        client.post(
            "/apps/depot/build",
            json={"deployment_id": str(deployment.id)},
            headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
        )

    db.refresh(deployment)
    assert deployment.status == DeploymentStatus.failed


def test_depot_build_works(
    client: TestClient,
    db: Session,
    redis_mock: MagicMock,  # noqa: ARG001
    download_and_extract_tar_mock: MagicMock,  # noqa: ARG001
    create_ecr_repository_mock: MagicMock,  # noqa: ARG001
    build_and_push_docker_image_mock: MagicMock,  # noqa: ARG001
    deploy_to_kubernetes_mock: MagicMock,  # noqa: ARG001
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.ready_for_build
    )

    response = client.post(
        "/apps/depot/build",
        json={"deployment_id": str(deployment.id)},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )

    assert response.json() == {"message": "OK"}
    assert response.status_code == 200

    db.refresh(deployment)
    assert deployment.status == DeploymentStatus.success
