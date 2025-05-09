import json
from datetime import datetime, timezone
from typing import Any, Literal, Required, TypedDict

from duck import AsyncHTTPRequest, Response
from pydantic import AwareDatetime, BaseModel, ValidationError

from fastapi_auth.models.oauth_token_response import TokenResponse
from fastapi_auth.utils._pkce import validate_pkce

from ._context import Context
from ._route import Route

TokenErrorType = Literal[
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "invalid_scope",
]


class TokenErrorResponse(TypedDict, total=False):
    error: Required[TokenErrorType]
    error_description: str | None
    error_uri: str | None


class AuthorizationCodeGrantData(BaseModel):
    user_id: str
    expires_at: AwareDatetime
    client_id: str
    redirect_uri: str

    # PKCE
    code_challenge: str
    code_challenge_method: Literal["S256"]

    @property
    def is_expired(self) -> bool:
        return datetime.now(tz=timezone.utc) > self.expires_at


class Issuer:
    def _error_response(
        self,
        error: TokenErrorType,
        error_description: str | None = None,
        error_uri: str | None = None,
    ) -> Response:
        body: TokenErrorResponse = {"error": error}

        if error_description:
            body["error_description"] = error_description

        if error_uri:
            body["error_uri"] = error_uri

        return Response(
            status_code=400,
            body=json.dumps(body),
            headers={"Content-Type": "application/json"},
        )

    async def token(self, request: AsyncHTTPRequest, context: Context) -> Response:
        form_data = await request.get_form_data()

        grant_type = form_data.get("grant_type")
        client_id = form_data.get("client_id")

        if not client_id:
            return self._error_response(
                "invalid_request",
                "No client_id provided",
            )

        # TODO: validate client_id
        # TODO: support confidential clients (client_secret)

        if not grant_type:
            return self._error_response(
                "invalid_request",
                "No grant_type provided",
            )

        if grant_type == "authorization_code":
            return self._authorization_code_grant(form_data, context)

        return self._error_response(
            "invalid_request",
            "We only support authorization_code grant type at this time",
        )

    def _authorization_code_grant(self, form_data: Any, context: Context) -> Response:
        code = form_data.get("code")
        redirect_uri = form_data.get("redirect_uri")
        code_verifier = form_data.get("code_verifier")

        if not code:
            return self._error_response(
                "invalid_request",
                "No code provided",
            )

        if not redirect_uri:
            return self._error_response(
                "invalid_request",
                "No redirect_uri provided",
            )

        if not code_verifier:
            return self._error_response(
                "invalid_request",
                "No code_verifier provided",
            )

        raw_authorization_data = context.secondary_storage.get(f"oauth:code:{code}")

        if raw_authorization_data is None:
            return self._error_response(
                "invalid_grant",
                "Authorization code not found",
            )

        context.secondary_storage.delete(f"oauth:code:{code}")

        try:
            authorization_data = AuthorizationCodeGrantData.model_validate_json(
                raw_authorization_data
            )
        except ValidationError:
            return self._error_response(
                "invalid_grant",
                "Invalid authorization code data",
            )

        if authorization_data.is_expired:
            return self._error_response(
                "invalid_grant",
                "Authorization code has expired",
            )

        if authorization_data.redirect_uri != redirect_uri:
            return self._error_response(
                "invalid_grant",
                "Redirect URI does not match",
            )

        if authorization_data.code_challenge_method != "S256":
            return self._error_response(
                "invalid_request",
                "Unsupported code challenge method",
            )

        if not validate_pkce(
            authorization_data.code_challenge,
            authorization_data.code_challenge_method,
            code_verifier,
        ):
            return self._error_response(
                "invalid_grant",
                "Invalid code challenge",
            )

        token, expires_in = context.create_token(authorization_data.user_id)

        token_data = TokenResponse(
            access_token=token,
            token_type="Bearer",
            expires_in=expires_in,
            refresh_token=None,
            refresh_token_expires_in=None,
            # TODO: figure out scopes
            scope="",
        )

        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
        }

        return Response(
            status_code=200,
            body=token_data.model_dump_json(),
            headers=headers,
            cookies=[],
        )

    @property
    def routes(self) -> list[Route]:
        return [
            Route(
                path="/token",
                methods=["POST"],
                function=self.token,
                response_model=TokenResponse,
                operation_id="token",
            ),
        ]
