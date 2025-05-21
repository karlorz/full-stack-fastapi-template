import json
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
import pytest
import time_machine
from duck import AsyncHTTPRequest
from duck.request import TestingRequestAdapter
from fastapi_auth._context import Context, SecondaryStorage
from fastapi_auth._storage import AccountsStorage, User
from fastapi_auth.social_providers.oauth import OAuth2Provider
from inline_snapshot import snapshot
from respx import MockRouter

pytestmark = pytest.mark.asyncio


async def test_fails_if_not_logged_in(
    oauth_provider: OAuth2Provider,
    context: Context,
) -> None:
    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
            )
        ),
        context,
    )

    assert response.status_code == 401
    assert response.json() == snapshot(
        {"error": "unauthorized", "error_description": "Not logged in"}
    )


async def test_fails_if_no_link_code_is_provided(
    oauth_provider: OAuth2Provider,
    context: Context,
) -> None:
    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                headers={"Authorization": "Bearer test"},
                json={},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "server_error", "error_description": "No link code found in request"}
    )


async def test_fails_if_data_is_missing(
    oauth_provider: OAuth2Provider,
    context: Context,
) -> None:
    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={"link_code": "non-existent-code"},
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "No link data found in secondary storage",
        }
    )


async def test_fails_if_data_is_invalid(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
) -> None:
    secondary_storage.set(
        "oauth:link_request:test_code",
        json.dumps({"invalid": "data"}),
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={"link_code": "test_code"},
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "Invalid link data",
        }
    )


@time_machine.travel(datetime(2012, 10, 1, 1, 0, tzinfo=timezone.utc), tick=False)
async def test_fails_if_code_has_expired(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
) -> None:
    secondary_storage.set(
        "oauth:link_request:test_code",
        json.dumps(
            {
                "expires_at": "2012-10-01T00:00:00Z",
                "client_id": "test_client_id",
                "redirect_uri": "http://localhost:8000/test/redirect",
                "code_challenge": "test_code_challenge",
                "code_challenge_method": "S256",
                "provider_code": "1234567890",
            }
        ),
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={"link_code": "test_code"},
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "Link code has expired",
        }
    )


@time_machine.travel(datetime(2012, 10, 1, 1, 0, tzinfo=timezone.utc), tick=False)
async def test_fails_if_code_challenge_is_missing(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
) -> None:
    secondary_storage.set(
        "oauth:link_request:test_code",
        json.dumps(
            {
                "expires_at": "2012-10-02T00:00:00Z",
                "client_id": "test_client_id",
                "redirect_uri": "http://localhost:8000/test/redirect",
                "code_challenge": "test_code_challenge",
                "code_challenge_method": "S256",
                "provider_code": "1234567890",
            }
        ),
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={"link_code": "test_code"},
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "No code_verifier provided",
        }
    )


@time_machine.travel(datetime(2012, 10, 1, 1, 0, tzinfo=timezone.utc), tick=False)
async def test_fails_if_code_challenge_is_invalid(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
) -> None:
    secondary_storage.set(
        "oauth:link_request:test_code",
        json.dumps(
            {
                "expires_at": "2012-10-02T00:00:00Z",
                "client_id": "test_client_id",
                "redirect_uri": "http://localhost:8000/test/redirect",
                "code_challenge": "test_code_challenge",
                "code_challenge_method": "S256",
                "provider_code": "1234567890",
            }
        ),
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={
                    "link_code": "test_code",
                    "code_verifier": "test_code_verifier",
                },
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "Invalid code challenge",
        }
    )


@time_machine.travel(datetime(2012, 10, 1, 1, 0, tzinfo=timezone.utc), tick=False)
async def test_fails_if_account_already_exists_on_another_user(
    oauth_provider: OAuth2Provider,
    context: Context,
    accounts_storage: AccountsStorage,
    valid_link_code: str,
    respx_mock: MockRouter,
) -> None:
    accounts_storage.create_user(
        user_info={"email": "pollo@example.com", "id": "pollo"}
    )

    accounts_storage.create_social_account(
        user_id="pollo",
        provider="test",
        provider_user_id="pollo",
        access_token=None,
        access_token_expires_at=None,
        refresh_token=None,
        refresh_token_expires_at=None,
        scope=None,
    )

    access_token = "test_access_token"

    data = {
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": 3600,
        "scope": "openid email profile",
    }

    respx_mock.post(oauth_provider.token_endpoint).mock(
        return_value=httpx.Response(
            status_code=200,
            headers={"Content-Type": "application/www-form-urlencoded"},
            content=urlencode(data),
        )
    )

    respx_mock.get(oauth_provider.user_info_endpoint).mock(
        return_value=httpx.Response(
            status_code=200,
            json={"email": "pollo@example.com", "id": "pollo", "social_accounts": []},
        )
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                # TODO: these should be in the body...
                json={
                    "link_code": valid_link_code,
                    "code_verifier": "test",
                },
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "server_error",
            "error_description": "Social account already exists",
        }
    )


@time_machine.travel(datetime(2012, 10, 1, 1, 0, tzinfo=timezone.utc), tick=False)
async def test_links_to_correct_user(
    oauth_provider: OAuth2Provider,
    context: Context,
    accounts_storage: AccountsStorage,
    valid_link_code: str,
    logged_in_user: User,
    respx_mock: MockRouter,
) -> None:
    assert len(list(logged_in_user.social_accounts)) == 0

    access_token = "test_access_token"

    data = {
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": 3600,
        "scope": "openid email profile",
    }

    respx_mock.post(oauth_provider.token_endpoint).mock(
        return_value=httpx.Response(
            status_code=200,
            headers={"Content-Type": "application/www-form-urlencoded"},
            content=urlencode(data),
        )
    )

    respx_mock.get(oauth_provider.user_info_endpoint).mock(
        return_value=httpx.Response(
            status_code=200,
            json={"email": "pollo@example.com", "id": "pollo", "social_accounts": []},
        )
    )

    response = await oauth_provider.finalize_link(
        AsyncHTTPRequest(
            TestingRequestAdapter(
                method="POST",
                url="http://localhost:8000/test/finalize-link",
                json={
                    "link_code": valid_link_code,
                    "code_verifier": "test",
                },
                headers={"Authorization": "Bearer test"},
            )
        ),
        context,
    )

    assert response.status_code == 200
    assert response.json() == snapshot({"message": "Link finalized"})

    user = accounts_storage.find_user_by_id(logged_in_user.id)

    assert user is not None

    social_accounts = list(user.social_accounts)

    assert len(social_accounts) == 1
    assert social_accounts[0].provider == "test"
    assert social_accounts[0].provider_user_id == "pollo"
