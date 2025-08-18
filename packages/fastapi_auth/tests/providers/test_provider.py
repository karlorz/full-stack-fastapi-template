import pytest
import respx
from fastapi_auth.social_providers.oauth import OAuth2Provider
from fastapi_auth.models.oauth_token_response import TokenResponse


class ExampleProvider(OAuth2Provider):
    id = "example"

    authorization_endpoint = "https://example.com/login/oauth/authorize"
    token_endpoint = "https://example.com/login/oauth/access_token"
    user_info_endpoint = "https://api.example.com/user"
    scopes = ["user:email"]


@pytest.fixture
def example_provider() -> ExampleProvider:
    return ExampleProvider(
        client_id="test_client_id", client_secret="test_client_secret"
    )


@respx.mock
def test_exchange_code_success(example_provider: ExampleProvider) -> None:
    token_response = {
        "access_token": "gho_test_token_12345",
        "token_type": "bearer",
        "scope": "user:email",
    }

    respx.post("https://example.com/login/oauth/access_token").mock(
        return_value=respx.MockResponse(200, json=token_response)
    )

    result = example_provider._exchange_code(
        "test_code", "https://example.com/callback"
    )

    assert result is not None
    assert not result.is_error()

    assert isinstance(result.root, TokenResponse)
    assert result.root.access_token == "gho_test_token_12345"
    assert result.root.token_type == "bearer"


@respx.mock
def test_exchange_code_github_down(example_provider: ExampleProvider):
    respx.post("https://example.com/login/oauth/access_token").mock(
        return_value=respx.MockResponse(503)
    )

    result = example_provider._exchange_code(
        "test_code", "https://example.com/callback"
    )

    assert result is None
