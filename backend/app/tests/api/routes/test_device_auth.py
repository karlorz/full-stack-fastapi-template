from fastapi.testclient import TestClient

from app.core.config import settings


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
