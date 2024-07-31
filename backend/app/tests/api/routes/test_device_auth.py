from datetime import timedelta
from typing import Any

import time_machine
from fastapi.testclient import TestClient
from redis import Redis

from app.core.config import settings
from app.utils import (
    authorize_device_code,
    create_and_store_device_code,
    generate_user_code,
)


def test_get_device_code(client: TestClient) -> None:
    data = {"client_id": "valid_id"}

    r = client.post(f"{settings.API_V1_STR}/login/device/authorization", data=data)

    assert r.status_code == 200

    response_data = r.json()

    assert "device_code" in response_data
    assert "user_code" in response_data
    assert "expires_in" in response_data
    assert "interval" in response_data

    assert response_data["verification_uri"] == f"{settings.server_host}/device"
    assert (
        response_data["verification_uri_complete"]
        == f"{settings.server_host}/device?code={response_data['user_code']}"
    )


def test_device_access_token_not_found(client: TestClient) -> None:
    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": "fictional-code",
    }

    r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 400

    response_data = r.json()

    assert response_data == {
        "error": "invalid_request",
        "error_description": "Invalid device code",
    }


def test_device_access_token_pending(client: TestClient, redis: "Redis[Any]") -> None:
    user_code = generate_user_code()
    device_code = create_and_store_device_code(
        user_code=user_code, client_id="valid_id", redis=redis
    )

    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": str(device_code),
    }

    r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 400

    response_data = r.json()

    assert response_data == {
        "error": "authorization_pending",
        "error_description": None,
    }


def test_device_access_token_different_client_id(
    client: TestClient, redis: "Redis[Any]"
) -> None:
    device_code = create_and_store_device_code(
        user_code="valid-code", client_id="some-fake-id", redis=redis
    )

    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": device_code,
    }

    r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 400

    response_data = r.json()

    assert response_data == {
        "error": "invalid_request",
        "error_description": "Invalid device code",
    }


def test_device_access_token_expired(
    client: TestClient,
    redis: "Redis[Any]",
    time_machine: time_machine.TimeMachineFixture,
) -> None:
    time_machine.move_to("2021-01-01 00:00:00")

    device_code = create_and_store_device_code(
        user_code="valid-code", client_id="valid_id", redis=redis
    )

    time_machine.shift(timedelta(minutes=settings.DEVICE_AUTH_TTL_MINUTES + 1))

    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": device_code,
    }

    r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 400

    response_data = r.json()

    assert response_data == {
        "error": "expired_token",
        "error_description": "Device code expired",
    }


def test_device_access_token_authorized(
    client: TestClient,
    redis: "Redis[Any]",
) -> None:
    user_code = generate_user_code()
    device_code = create_and_store_device_code(
        user_code=user_code, client_id="valid_id", redis=redis
    )
    authorize_device_code(device_code, access_token="valid-token", redis=redis)

    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": str(device_code),
    }

    r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 200

    response_data = r.json()

    assert response_data["token_type"] == "bearer"
    assert response_data["access_token"] == "valid-token"
