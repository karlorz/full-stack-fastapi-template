import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import ClassVar, Literal

import httpx
from duck import AsyncHTTPRequest
from pydantic import BaseModel, HttpUrl, TypeAdapter, ValidationError

from fastapi_auth.utils._response import Response

from .._context import Context
from .._issuer import AuthorizationCodeGrantData
from .._route import Route
from ..models.oauth_token_response import (
    OAuth2TokenEndpointResponse,
    TokenErrorResponse,
    TokenResponse,
)

logger = logging.getLogger(__name__)


class OAuth2AuthorizationRequestData(BaseModel):
    redirect_uri: str
    login_hint: str | None
    client_state: str | None
    state: str
    code_challenge: str
    code_challenge_method: Literal["S256"]


def relative_url(url: str, path: str) -> str:
    parts = url.split("/")
    parts.pop()
    parts.append(path)
    return "/".join(parts)


class OAuth2Provider:
    id: ClassVar[str]
    authorization_endpoint: ClassVar[str]
    token_endpoint: ClassVar[str]
    user_info_endpoint: ClassVar[str]
    scopes: ClassVar[list[str]]

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    def _generate_code(self) -> str:
        return str(uuid.uuid4())

    async def authorize(
        self,
        request: AsyncHTTPRequest,
        context: Context,
    ) -> Response:
        """
        Redirect to the provider's authorization page.

        This endpoint works similar to a proxy, we store the actual redirect uri
        in a cookie and then use that to redirect the user back to the client
        once the authorization is complete on the Identity Provider's site.
        """

        redirect_uri = request.query_params.get("redirect_uri")

        if not redirect_uri:
            logger.error("No redirect URI provided")
            return Response.error("invalid_request")

        try:
            redirect_uri = str(TypeAdapter(HttpUrl).validate_python(redirect_uri))
        except ValidationError:
            logger.error("Invalid redirect URI")

            return Response.error("invalid_redirect_uri")

        # TODO: this is where we'll validate the redirect URI against the client
        # when we implement clients :)

        if not context.is_valid_redirect_uri(redirect_uri):
            logger.error("Invalid redirect URI")

            return Response.error("invalid_redirect_uri")

        response_type = request.query_params.get("response_type")

        if not response_type:
            logger.error("No response type provided")

            return Response.error_redirect(
                redirect_uri,
                error="invalid_request",
                error_description="No response type provided",
            )

        if response_type != "code":
            logger.error("Unsupported response type")

            return Response.error_redirect(
                redirect_uri,
                error="invalid_request",
                error_description="Unsupported response type",
            )

        code_challenge = request.query_params.get("code_challenge")
        code_challenge_method = request.query_params.get("code_challenge_method")

        if not code_challenge:
            logger.error("No code challenge provided")

            return Response.error_redirect(
                redirect_uri,
                error="invalid_request",
                error_description="No code challenge provided",
            )

        if code_challenge_method != "S256":
            logger.error("Unsupported code challenge method")

            return Response.error_redirect(
                redirect_uri,
                error="invalid_request",
                error_description="Unsupported code challenge method",
            )

        login_hint = request.query_params.get("login_hint")
        client_state = request.query_params.get("state")
        state = secrets.token_hex(16)

        data = OAuth2AuthorizationRequestData.model_validate(
            {
                "redirect_uri": redirect_uri,
                "login_hint": login_hint,
                "client_state": client_state,
                "state": state,
                "code_challenge": code_challenge,
                "code_challenge_method": code_challenge_method,
            }
        )

        context.secondary_storage.set(
            f"oauth:authorization_request:{state}",
            data.model_dump_json(),
        )

        proxy_redirect_uri = relative_url(str(request.url), "callback")

        return Response.redirect(
            self.authorization_endpoint,
            query_params={
                "client_id": self.client_id,
                "scope": " ".join(self.scopes),
                "redirect_uri": proxy_redirect_uri,
                "state": state,
            },
        )

    async def callback(self, request: AsyncHTTPRequest, context: Context) -> Response:
        """
        This callback endpoint is used to exchange the Identity Provider's code
        for a token and then login the user on our side.
        """

        state = request.query_params.get("state")

        if not state:
            logger.error("No state found in request")
            return Response.error(
                "server_error",
                error_description="No state found in request",
            )

        raw_provider_data = context.secondary_storage.get(
            f"oauth:authorization_request:{state}"
        )

        if not raw_provider_data:
            logger.error("No provider data found in secondary storage")

            return Response.error(
                "server_error",
                error_description="Provider data not found",
            )

        try:
            provider_data = OAuth2AuthorizationRequestData.model_validate_json(
                raw_provider_data
            )
        except ValidationError:
            logger.error("Invalid provider data")

            return Response.error(
                "server_error",
                error_description="Invalid provider data",
            )

        code = request.query_params.get("code")

        if not code:
            logger.error("No authorization code received in callback")

            return Response.error_redirect(
                provider_data.redirect_uri,
                error="server_error",
                error_description="No authorization code received in callback",
            )

        redirect_uri = provider_data.redirect_uri

        proxy_redirect_uri = relative_url(str(request.url), "callback")

        token_response = self._exchange_code(code, proxy_redirect_uri)

        if token_response is None or token_response.is_error():
            if token_response:
                assert isinstance(token_response.root, TokenErrorResponse)

                logger.error(f"Token exchange failed: {token_response.root.error}")

            return Response.error_redirect(
                redirect_uri,
                error="server_error",
                error_description="Token exchange failed",
            )

        assert isinstance(token_response.root, TokenResponse)

        try:
            user_info = self.fetch_user_info(token_response.root.access_token)
        except Exception as e:
            logger.error(f"Failed to fetch user info: {str(e)}")
            return Response.error_redirect(
                redirect_uri,
                error="server_error",
                error_description="Failed to fetch user info",
            )

        email = user_info.get("email")

        if not email:
            logger.error("No email found in user info")

            return Response.error_redirect(
                redirect_uri,
                error="server_error",
                error_description="No email found in user info",
            )

        provider_user_id = user_info.get("id")

        if not provider_user_id:
            logger.error("No provider user ID found in user info")

            return Response.error_redirect(
                redirect_uri,
                error="server_error",
                error_description="No provider user ID found in user info",
            )

        social_account = context.accounts_storage.find_social_account(
            provider=self.id,
            provider_user_id=provider_user_id,
        )

        user = context.accounts_storage.find_user_by_email(email=email)

        if user:
            if not social_account:
                return Response.error_redirect(
                    redirect_uri,
                    error="account_exists",
                    error_description="An account with this email already exists.",
                )

            context.accounts_storage.update_social_account(
                social_account.id,
                access_token=token_response.root.access_token,
                refresh_token=token_response.root.refresh_token,
                access_token_expires_at=token_response.root.access_token_expires_at,
                refresh_token_expires_at=token_response.root.refresh_token_expires_at,
                scope=token_response.root.scope,
            )
        else:
            user = context.accounts_storage.create_user(user_info=user_info)

            context.accounts_storage.create_social_account(
                user_id=user.id,
                provider=self.id,
                provider_user_id=provider_user_id,
                access_token=token_response.root.access_token,
                refresh_token=token_response.root.refresh_token,
                access_token_expires_at=token_response.root.access_token_expires_at,
                refresh_token_expires_at=token_response.root.refresh_token_expires_at,
                scope=token_response.root.scope,
            )

        code = self._generate_code()

        data = AuthorizationCodeGrantData(
            user_id=str(user.id),
            expires_at=datetime.now(tz=timezone.utc) + timedelta(minutes=10),
            client_id=self.client_id,
            redirect_uri=redirect_uri,
            code_challenge=provider_data.code_challenge,
            code_challenge_method=provider_data.code_challenge_method,
        )

        context.secondary_storage.set(
            f"oauth:code:{code}",
            data.model_dump_json(),
        )

        return Response.redirect(
            redirect_uri,
            query_params={"code": code},
        )

    def _exchange_code(
        self, code: str, redirect_uri: str
    ) -> OAuth2TokenEndpointResponse | None:
        try:
            response = httpx.post(
                self.token_endpoint,
                data={
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            return OAuth2TokenEndpointResponse.from_query_string(response.text)
        except ValidationError as e:
            logger.error(f"Failed to exchange code for token: {str(e)}")

            return None

    def fetch_user_info(self, token: str) -> dict:
        response = httpx.get(
            self.user_info_endpoint,
            headers={"Authorization": f"Bearer {token}"},
        )
        return response.json()

    @property
    def routes(self) -> list[Route]:
        # TODO: add support for response models (for OpenAPI)
        return [
            Route(
                path=f"/{self.id}/authorize",
                methods=["GET"],
                function=self.authorize,
                operation_id=f"{self.id}_authorize",
            ),
            Route(
                path=f"/{self.id}/callback",
                methods=["GET"],
                function=self.callback,
                operation_id=f"{self.id}_callback",
            ),
        ]
