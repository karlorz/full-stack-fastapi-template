import pytest
from duck import AsyncHTTPRequest
from fastapi_auth._context import Context
from fastapi_auth._issuer import Issuer
from inline_snapshot import snapshot

pytestmark = pytest.mark.asyncio


async def test_issuer(issuer: Issuer):
    (token_route,) = issuer.routes

    assert token_route.path == "/token"
    assert token_route.methods == ["POST"]
    assert token_route.function == issuer.token


async def test_returns_error_response_if_client_id_is_missing(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(data={"grant_type": "authorization_code"}),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "No client_id provided"}
    )


async def test_returns_error_response_if_grant_type_is_missing(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(data={"client_id": "test"}), context
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "invalid_request",
            "error_description": "No grant_type provided",
        }
    )


async def test_we_only_support_authorization_code_grant_type(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={"grant_type": "client_credentials", "client_id": "test"}
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "invalid_request",
            "error_description": "We only support authorization_code grant type at this time",
        }
    )


async def test_returns_error_response_if_code_is_missing(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={"grant_type": "authorization_code", "client_id": "test"}
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "No code provided"}
    )


async def test_returns_error_response_if_redirect_uri_is_missing(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": "test",
            }
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "No redirect_uri provided"}
    )


async def test_returns_error_response_if_code_is_invalid(
    issuer: Issuer, context: Context
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": "test",
                "redirect_uri": "test",
                "code_verifier": "test",
            }
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_grant", "error_description": "Authorization code not found"}
    )


async def test_returns_error_response_if_code_has_expired(
    issuer: Issuer, context: Context, expired_code: str
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": expired_code,
                "redirect_uri": "test",
                "code_verifier": "test",
            }
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {
            "error": "invalid_grant",
            "error_description": "Authorization code has expired",
        }
    )


async def test_returns_error_response_if_redirect_uri_does_not_match(
    issuer: Issuer, context: Context, valid_code: str
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": valid_code,
                "redirect_uri": "test2",
                "code_verifier": "test",
            }
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_grant", "error_description": "Redirect URI does not match"}
    )


async def test_returns_error_response_if_code_verifier_is_missing(
    issuer: Issuer, context: Context, valid_code: str
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": valid_code,
                "redirect_uri": "test",
            }
        ),
        context,
    )

    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "No code_verifier provided"}
    )


async def test_returns_token_if_code_is_valid(
    issuer: Issuer, context: Context, valid_code: str
):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "authorization_code",
                "client_id": "test",
                "code": valid_code,
                "redirect_uri": "test",
                "code_verifier": "test",
            }
        ),
        context,
    )

    assert response.status_code == 200
    assert response.json() == snapshot(
        {
            "access_token": "token-test",
            "token_type": "Bearer",
            "expires_in": 0,
            "refresh_token": None,
            "refresh_token_expires_in": None,
            "scope": "",
        }
    )
