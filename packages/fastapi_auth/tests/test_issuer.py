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
        {"error": "invalid_request", "error_description": "client_id is required"}
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
            "error_description": "grant_type is required",
        }
    )


async def test_returns_error_for_unsupported_grant_type(
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
            "error": "unsupported_grant_type",
            "error_description": "Grant type 'client_credentials' is not supported",
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
        {"error": "invalid_request", "error_description": "code is required"}
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
        {"error": "invalid_request", "error_description": "redirect_uri is required"}
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
        {"error": "invalid_request", "error_description": "code_verifier is required"}
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


async def test_password_grant_missing_username(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "password": "password123",
            }
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "username is required"}
    )


async def test_password_grant_missing_password(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "username": "test@example.com",
            }
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_request", "error_description": "password is required"}
    )


async def test_password_grant_invalid_credentials(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "username": "test@example.com",
                "password": "wrong_password",
            }
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_grant", "error_description": "Invalid username or password"}
    )


async def test_password_grant_invalid_username(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "username": "nonexistent@example.com",
                "password": "password123",
            }
        ),
        context,
    )
    assert response.status_code == 400
    assert response.json() == snapshot(
        {"error": "invalid_grant", "error_description": "Invalid username or password"}
    )


async def test_password_grant_success(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "username": "test@example.com",
                "password": "password123",
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


async def test_password_grant_with_scope(issuer: Issuer, context: Context):
    response = await issuer.token(
        AsyncHTTPRequest.from_form_data(
            data={
                "grant_type": "password",
                "client_id": "test",
                "username": "test@example.com",
                "password": "password123",
                "scope": "",
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
