import json
from urllib.parse import parse_qs, urlparse

import pytest
from duck import AsyncHTTPRequest
from duck.request import TestingRequestAdapter
from fastapi_auth._context import Context
from fastapi_auth.social_providers.oauth import OAuth2Provider
from inline_snapshot import snapshot

from tests.conftest import MemoryStorage

pytestmark = pytest.mark.asyncio


async def test_stores_the_correct_request_data(
    oauth_provider: OAuth2Provider,
    context: Context,
    secondary_storage: MemoryStorage,
):
    request = AsyncHTTPRequest(
        TestingRequestAdapter(
            method="GET",
            url="http://localhost:8000/test/authorize",
            query_params={
                "redirect_uri": "http://valid-frontend.com/callback",
                "code_challenge": "test",
                "code_challenge_method": "S256",
                "response_type": "link_code",
            },
        )
    )

    response = await oauth_provider.authorize(request, context)

    assert response.status_code == 302
    assert response.headers

    redirect_uri = response.headers["Location"]

    assert redirect_uri.startswith(oauth_provider.authorization_endpoint)

    query_params = parse_qs(urlparse(redirect_uri).query)

    assert query_params["client_id"] == ["test_client_id"]
    assert query_params["scope"] == ["openid email profile"]
    assert query_params["redirect_uri"] == ["http://localhost:8000/test/callback"]

    state = query_params["state"][0]

    data_str = secondary_storage.get(f"oauth:authorization_request:{state}")

    assert data_str

    assert json.loads(data_str) == snapshot(
        {
            "redirect_uri": "http://valid-frontend.com/callback",
            "login_hint": None,
            "client_state": None,
            "state": state,
            "code_challenge": "test",
            "code_challenge_method": "S256",
            "link": True,
        }
    )
