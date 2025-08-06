import datetime
import json
from urllib.parse import urlencode

import httpx
import pytest
import time_machine
from fastapi_auth._context import Context, SecondaryStorage
from fastapi_auth._issuer import AuthorizationCodeGrantData
from fastapi_auth.social_providers.oauth import OAuth2Provider
from inline_snapshot import snapshot
from lia import AsyncHTTPRequest
from lia.request import TestingRequestAdapter
from respx import MockRouter

from ..conftest import MemoryAccountsStorage

pytestmark = pytest.mark.asyncio


@pytest.fixture
def valid_callback_request(secondary_storage: SecondaryStorage) -> AsyncHTTPRequest:
    secondary_storage.set(
        "oauth:authorization_request:test_state",
        json.dumps(
            {
                "redirect_uri": "http://valid-frontend.com/callback",
                "login_hint": "test_login_hint",
                "state": "test_state",
                "client_state": "test_client_state",
                "code_challenge": "test",
                "code_challenge_method": "S256",
            }
        ),
    )

    return AsyncHTTPRequest(
        TestingRequestAdapter(
            method="GET",
            url="http://localhost:8000/test/callback",
            query_params={
                "code": "test_code",
                "state": "test_state",
            },
        )
    )


async def test_fails_if_there_were_no_provider_data_in_secondary_storage(
    oauth_provider: OAuth2Provider, context: Context
):
    request = AsyncHTTPRequest(
        TestingRequestAdapter(
            method="GET",
            url="http://localhost:8000/test/callback",
            query_params={
                "code": "test_code",
                "state": "test_state",
            },
        )
    )

    response = await oauth_provider.callback(request, context)

    assert response.status_code == 400
    assert response.headers is not None
    assert response.headers["Content-Type"] == "application/json"
    assert response.json() == {
        "error": "server_error",
        "error_description": "Provider data not found",
    }


async def test_fails_if_there_was_no_code_in_request(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
):
    request = AsyncHTTPRequest(
        TestingRequestAdapter(
            method="GET",
            url="http://localhost:8000/test/callback",
            query_params={
                "state": "test_state",
            },
        )
    )

    secondary_storage.set(
        "oauth:authorization_request:test_state",
        json.dumps(
            {
                "redirect_uri": "http://valid-frontend.com/callback",
                "login_hint": "test_login_hint",
                "state": "test_state",
                "client_state": "test_client_state",
                "code_challenge": "test",
                "code_challenge_method": "S256",
            }
        ),
    )

    response = await oauth_provider.callback(request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=No+authorization+code+received+in+callback"
    )


async def test_fails_if_there_was_no_state_in_request(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: SecondaryStorage,
):
    request = AsyncHTTPRequest(
        TestingRequestAdapter(
            method="GET",
            url="http://localhost:8000/test/callback",
            query_params={
                "code": "test_code",
            },
        )
    )

    response = await oauth_provider.callback(request, context)

    assert response.status_code == 400
    assert response.json() == {
        "error": "server_error",
        "error_description": "No state found in request",
    }


async def test_fails_if_the_token_exchange_fails(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
):
    respx_mock.post(oauth_provider.token_endpoint).mock(
        return_value=httpx.Response(
            status_code=200,
            content="error=incorrect_client_credentials&error_description=The+client_id+and%2For+client_secret+passed+are+incorrect.",
        )
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=Token+exchange+failed"
    )


async def test_fails_if_the_token_exchange_returns_an_error_response(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
):
    respx_mock.post(oauth_provider.token_endpoint).mock(
        return_value=httpx.Response(status_code=500)
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=Token+exchange+failed"
    )


async def test_fails_if_there_is_no_email_in_the_user_info_response(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
):
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
        return_value=httpx.Response(status_code=200, json={"id": "test_id"})
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=No+email+found+in+user+info"
    )


async def test_fails_if_the_user_info_response_is_not_valid_json(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
):
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
        return_value=httpx.Response(status_code=200, content="not-valid-json")
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=Failed+to+fetch+user+info"
    )


async def test_fails_if_the_user_info_response_does_not_have_an_id(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
):
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
        return_value=httpx.Response(status_code=200, json={"email": "test@example.com"})
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=server_error&error_description=No+provider+user+ID+found+in+user+info"
    )


@time_machine.travel(
    datetime.datetime(2012, 10, 1, 1, 0, tzinfo=datetime.timezone.utc), tick=False
)
async def test_create_user_if_it_does_not_exist(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    accounts_storage: MemoryAccountsStorage,
):
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

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?code=a-totally-valid-code"
    )

    pollo = accounts_storage.data.get("pollo")

    assert pollo is not None
    assert pollo.social_accounts[0].provider == "test"
    assert pollo.social_accounts[0].provider_user_id == "pollo"
    assert pollo.social_accounts[0].access_token == access_token
    assert pollo.social_accounts[0].refresh_token is None
    assert pollo.social_accounts[0].access_token_expires_at == datetime.datetime(
        2012, 10, 1, 2, 0, tzinfo=datetime.timezone.utc
    )
    assert pollo.social_accounts[0].refresh_token_expires_at is None
    assert pollo.social_accounts[0].scope == "openid email profile"


@time_machine.travel(
    datetime.datetime(2012, 10, 1, 1, 0, tzinfo=datetime.timezone.utc), tick=False
)
async def test_stores_the_code_in_the_session(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    secondary_storage: SecondaryStorage,
):
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

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?code=a-totally-valid-code"
    )

    raw_auth_data = secondary_storage.get("oauth:code:a-totally-valid-code")

    assert raw_auth_data is not None

    auth_data = AuthorizationCodeGrantData.model_validate_json(raw_auth_data)

    assert auth_data.model_dump() == {
        "user_id": "pollo",
        "expires_at": datetime.datetime(
            2012, 10, 1, 1, 10, tzinfo=datetime.timezone.utc
        ),
        "client_id": "test_client_id",
        "redirect_uri": "http://valid-frontend.com/callback",
        "code_challenge": "test",
        "code_challenge_method": "S256",
    }


async def test_fails_if_there_is_user_with_the_same_email_but_different_provider(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    accounts_storage: MemoryAccountsStorage,
):
    access_token = "test_access_token"

    accounts_storage.create_user(
        user_info={"email": "pollo@example.com", "id": "pollo"}
    )

    accounts_storage.create_social_account(
        user_id="pollo",
        provider="other_provider",
        provider_user_id="other_provider_user_id",
        access_token=None,
        refresh_token=None,
        access_token_expires_at=None,
        refresh_token_expires_at=None,
        scope=None,
        user_info={"email": "pollo@example.com", "id": "pollo"},
    )

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

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=account_exists&error_description=An+account+with+this+email+already+exists."
    )


async def test_works_when_there_is_user_with_the_same_email_and_provider(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    accounts_storage: MemoryAccountsStorage,
):
    accounts_storage.create_user(
        user_info={"email": "pollo@example.com", "id": "pollo"},
    )

    accounts_storage.create_social_account(
        user_id="pollo",
        provider="test",
        provider_user_id="pollo",
        access_token=None,
        refresh_token=None,
        access_token_expires_at=None,
        refresh_token_expires_at=None,
        scope=None,
        user_info={"email": "pollo@example.com", "id": "pollo"},
    )

    data = {
        "access_token": "test_access_token",
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
            json={"email": "pollo@example.com", "id": "pollo"},
        )
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?code=a-totally-valid-code"
    )

    assert accounts_storage.data.get("pollo")


@time_machine.travel(
    datetime.datetime(2012, 10, 1, 1, 0, tzinfo=datetime.timezone.utc), tick=False
)
async def test_updates_the_social_account_if_it_already_exists(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    accounts_storage: MemoryAccountsStorage,
):
    accounts_storage.create_user(
        user_info={"email": "pollo@example.com", "id": "pollo"},
    )

    accounts_storage.create_social_account(
        user_id="pollo",
        provider="test",
        provider_user_id="pollo",
        access_token="old_access_token",
        refresh_token="old_refresh_token",
        access_token_expires_at=None,
        refresh_token_expires_at=None,
        scope="old_scope",
        user_info={"email": "pollo@example.com", "id": "pollo"},
    )

    data = {
        "access_token": "test_access_token",
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
            json={"email": "pollo@example.com", "id": "pollo"},
        )
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?code=a-totally-valid-code"
    )

    account = accounts_storage.data.get("pollo")

    assert account is not None
    assert account.social_accounts[0].provider == "test"
    assert account.social_accounts[0].provider_user_id == "pollo"
    assert account.social_accounts[0].access_token == "test_access_token"
    assert account.social_accounts[0].refresh_token is None


async def test_fails_if_the_user_is_not_allowed_to_signup(
    oauth_provider: OAuth2Provider,
    context: Context,
    respx_mock: MockRouter,
    valid_callback_request: AsyncHTTPRequest,
    secondary_storage: SecondaryStorage,
):
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
            json={"email": "not-allowed@example.com", "id": "not-allowed"},
        )
    )

    response = await oauth_provider.callback(valid_callback_request, context)

    assert response.status_code == 302
    assert response.headers is not None
    assert response.headers["Location"] == snapshot(
        "http://valid-frontend.com/callback?error=email_not_invited&error_description=This+email+has+not+yet+been+invited+to+join+FastAPI+Cloud"
    )
