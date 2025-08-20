from collections.abc import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from kubernetes.client.rest import ApiException as K8sApiException
from sqlmodel import Session

from app.core.config import CommonSettings
from app.models import DeploymentStatus
from app.tests.utils.apps import create_deployment_for_app, create_random_app
from app.tests.utils.team import create_random_team

common_settings = CommonSettings.get_settings()


@pytest.fixture
def kubernetes_custom_objects_mock() -> Generator[MagicMock, None, None]:
    """Mock Kubernetes custom objects API client."""
    with patch(
        "app.builder.main.get_kubernetes_client_custom_objects",
        return_value=MagicMock(),
    ) as kubernetes_mock:
        yield kubernetes_mock


@pytest.fixture
def ecr_client_mock() -> Generator[MagicMock, None, None]:
    """Mock ECR client for testing."""
    with patch("app.builder.main.ecr", autospec=True) as ecr_mock:
        yield ecr_mock


def test_cleanup_fails_when_api_key_is_invalid(client: TestClient) -> None:
    response = client.post(
        "/cleanup",
        json={"app_id": "123e4567-e89b-12d3-a456-426614174000"},
        headers={"X-API-KEY": "invalid"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid API key"}


def test_cleanup_fails_when_app_not_found(client: TestClient) -> None:
    response = client.post(
        "/cleanup",
        json={"app_id": "00000000-0000-0000-0000-000000000000"},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "App not found"}


def test_cleanup_works_with_no_deployments(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    # Mock Kubernetes list to return no services
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": []
    }

    response = client.post(
        "/cleanup",
        json={"app_id": str(app.id)},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Cleanup completed"}

    # Verify Kubernetes cleanup was attempted with label selector
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.assert_called_once_with(
        group="serving.knative.dev",
        version="v1",
        namespace=f"team-{team.id}",
        plural="services",
        label_selector=f"fastapicloud.com/app={app.id}",
    )

    # Verify no deletions were called since there are no services
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.assert_not_called()

    # App should still exist but marked as cleaned up
    db.refresh(app)

    assert app.cleaned_up_at is not None


def test_cleanup_works_with_deployments(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    deployment1 = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.success
    )
    deployment2 = create_deployment_for_app(db, app=app, status=DeploymentStatus.failed)

    # Mock Kubernetes list_namespaced_custom_object to return services with app label
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": [
            {"metadata": {"name": deployment1.slug}},
            {"metadata": {"name": deployment2.slug}},
        ]
    }

    response = client.post(
        "/cleanup",
        json={"app_id": str(app.id)},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Cleanup completed"}

    # Verify Kubernetes cleanup with label selector
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.assert_called_once_with(
        group="serving.knative.dev",
        version="v1",
        namespace=f"team-{team.id}",
        plural="services",
        label_selector=f"fastapicloud.com/app={app.id}",
    )

    # Verify services were deleted
    assert (
        kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.call_count
        == 2
    )

    # App should still exist but marked as cleaned up
    db.refresh(app)
    assert app.cleaned_up_at is not None


def test_cleanup_handles_kubernetes_service_not_found(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(db, app=app, status=DeploymentStatus.success)

    # Mock Kubernetes list to return one service
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": [{"metadata": {"name": deployment.slug}}]
    }

    # Mock delete to raise 404 - current implementation doesn't handle this gracefully
    not_found_exception = K8sApiException(status=404)
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.side_effect = not_found_exception

    # The current implementation doesn't handle the exception, so it will raise
    with pytest.raises(K8sApiException) as exc_info:
        client.post(
            "/cleanup",
            json={"app_id": str(app.id)},
            headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
        )

    assert exc_info.value.status == 404

    # Verify that the service deletion was attempted
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.assert_called_once()

    # App should NOT be marked as cleaned up because the Kubernetes cleanup failed
    db.refresh(app)
    assert app.cleaned_up_at is None


def test_cleanup_handles_kubernetes_service_deletion_error(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(db, app=app, status=DeploymentStatus.success)

    # Mock Kubernetes list to return one service
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": [{"metadata": {"name": deployment.slug}}]
    }

    # Mock delete to raise server error - current implementation doesn't handle this gracefully
    server_error_exception = K8sApiException(status=500)
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.side_effect = server_error_exception

    # The current implementation doesn't handle the exception, so it will raise
    with pytest.raises(K8sApiException) as exc_info:
        client.post(
            "/cleanup",
            json={"app_id": str(app.id)},
            headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
        )

    assert exc_info.value.status == 500

    # Verify that the service deletion was attempted
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.assert_called_once()

    # App should NOT be marked as cleaned up due to the error
    db.refresh(app)
    assert app.cleaned_up_at is None


def test_cleanup_handles_general_exception(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)
    deployment = create_deployment_for_app(db, app=app, status=DeploymentStatus.success)

    # Mock Kubernetes list to return one service
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": [{"metadata": {"name": deployment.slug}}]
    }

    # Mock Kubernetes delete to raise general exception - current implementation doesn't handle this gracefully
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.side_effect = Exception(
        "Kubernetes error"
    )

    # The current implementation doesn't handle the exception, so it will raise
    with pytest.raises(Exception) as exc_info:
        client.post(
            "/cleanup",
            json={"app_id": str(app.id)},
            headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
        )

    assert str(exc_info.value) == "Kubernetes error"

    # Verify that the service deletion was attempted
    kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.assert_called_once()

    # App should NOT be marked as cleaned up due to the error
    db.refresh(app)
    assert app.cleaned_up_at is None


def test_cleanup_with_multiple_deployments_different_statuses(
    client: TestClient,
    db: Session,
    kubernetes_custom_objects_mock: MagicMock,
) -> None:
    team = create_random_team(db)
    app = create_random_app(db, team=team)

    deployment1 = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.success
    )
    deployment2 = create_deployment_for_app(db, app=app, status=DeploymentStatus.failed)
    deployment3 = create_deployment_for_app(
        db, app=app, status=DeploymentStatus.building
    )

    # Mock Kubernetes list to return 3 services (one per deployment)
    kubernetes_custom_objects_mock.return_value.list_namespaced_custom_object.return_value = {
        "items": [
            {"metadata": {"name": deployment1.slug}},
            {"metadata": {"name": deployment2.slug}},
            {"metadata": {"name": deployment3.slug}},
        ]
    }

    response = client.post(
        "/cleanup",
        json={"app_id": str(app.id)},
        headers={"X-API-KEY": common_settings.BUILDER_API_KEY},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Cleanup completed"}

    # Verify all 3 services were deleted
    assert (
        kubernetes_custom_objects_mock.return_value.delete_namespaced_custom_object.call_count
        == 3
    )

    # App should still exist but marked as cleaned up
    db.refresh(app)
    assert app.cleaned_up_at is not None
