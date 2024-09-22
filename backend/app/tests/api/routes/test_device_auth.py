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
    get_datetime_utc,
    get_device_authorization_data,
)


@time_machine.travel("2021-01-01 00:00:00", tick=False)
def test_get_device_code(client: TestClient, redis: "Redis[Any]") -> None:
    data = {"client_id": "valid_id"}

    r = client.post(f"{settings.API_V1_STR}/login/device/authorization", data=data)

    assert r.status_code == 200

    response_data = r.json()

    assert "device_code" in response_data
    assert "user_code" in response_data
    assert "expires_in" in response_data
    assert "interval" in response_data

    assert response_data["verification_uri"] == f"{settings.FRONTEND_HOST}/device"
    assert (
        response_data["verification_uri_complete"]
        == f"{settings.FRONTEND_HOST}/device?code={response_data['user_code']}"
    )

    device_authorization_data = get_device_authorization_data(
        response_data["device_code"], redis=redis
    )

    assert device_authorization_data is not None
    assert device_authorization_data.client_id == "valid_id"
    assert device_authorization_data.device_code == response_data["device_code"]
    assert device_authorization_data.access_token is None
    assert device_authorization_data.status == "pending"
    assert device_authorization_data.created_at == get_datetime_utc()
    # the test client sends a "testclient" host, so that's the request_ip stored
    assert device_authorization_data.request_ip == "testclient"


@time_machine.travel("2021-01-01 00:00:00", tick=False)
def test_can_get_authorization_info(client: TestClient, redis: "Redis[Any]") -> None:
    user_code = generate_user_code()
    device_code = create_and_store_device_code(
        user_code=user_code, request_ip="127.0.0.1", client_id="valid_id", redis=redis
    )

    r = client.get(f"{settings.API_V1_STR}/login/device/authorization/{user_code}")

    assert r.status_code == 200

    response_data = r.json()

    assert response_data == {
        "device_code": str(device_code),
        "created_at": get_datetime_utc().isoformat(),
        "request_ip": "127.0.0.1",
    }


def test_device_authorization_info_not_found(client: TestClient) -> None:
    r = client.get(f"{settings.API_V1_STR}/login/device/authorization/fake-code")

    assert r.status_code == 404


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
        user_code=user_code, request_ip=None, client_id="valid_id", redis=redis
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
        user_code="valid-code", request_ip=None, client_id="some-fake-id", redis=redis
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
        user_code="valid-code", request_ip=None, client_id="valid_id", redis=redis
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
        user_code=user_code, request_ip=None, client_id="valid_id", redis=redis
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


def test_can_authorize_device_code_401_when_not_logged_in(
    client: TestClient, redis: "Redis[Any]"
) -> None:
    user_code = generate_user_code()

    device_code = create_and_store_device_code(
        user_code=user_code, request_ip=None, client_id="valid_id", redis=redis
    )

    r = client.post(
        f"{settings.API_V1_STR}/login/device/authorize",
        json={"user_code": device_code},
    )

    assert r.status_code == 401


def test_can_authorize_device_code_400_when_code_is_not_found(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/login/device/authorize",
        json={"user_code": "some-random-code"},
        headers=normal_user_token_headers,
    )

    assert r.status_code == 404


def test_can_authorize_device_code(
    client: TestClient, redis: "Redis[Any]", normal_user_token_headers: dict[str, str]
) -> None:
    user_code = generate_user_code()

    device_code = create_and_store_device_code(
        user_code=user_code, request_ip=None, client_id="valid_id", redis=redis
    )

    r = client.post(
        f"{settings.API_V1_STR}/login/device/authorize",
        json={"user_code": user_code},
        headers=normal_user_token_headers,
    )

    assert r.status_code == 200

    response_data = r.json()

    assert response_data["success"] is True

    device_data = get_device_authorization_data(device_code, redis=redis)

    assert device_data is not None
    assert device_data.status == "authorized"
    assert device_data.access_token is not None


def test_rate_limit_on_device_authorization(client: TestClient) -> None:
    data = {"client_id": "valid_id"}

    for _ in range(6):
        r = client.post(f"{settings.API_V1_STR}/login/device/authorization", data=data)

    assert r.status_code == 429


def test_rate_limit_on_device_code(client: TestClient) -> None:
    for _ in range(6):
        r = client.get(f"{settings.API_V1_STR}/login/device/authorization/some-code")

    assert r.status_code == 429


def test_rate_limit_on_device_token(client: TestClient) -> None:
    data = {
        "client_id": "valid_id",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": "some-code",
    }

    for _ in range(21):
        r = client.post(f"{settings.API_V1_STR}/login/device/token", data=data)

    assert r.status_code == 429
