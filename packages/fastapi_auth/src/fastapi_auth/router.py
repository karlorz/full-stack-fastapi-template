import logging
from collections.abc import Awaitable, Callable
from itertools import chain

from duck import AsyncHTTPRequest, Response
from fastapi import APIRouter
from fastapi import Request as FastAPIRequest
from fastapi import Response as FastAPIResponse

from ._context import AccountsStorage, Context, SecondaryStorage
from ._issuer import Issuer
from .social_providers.oauth import OAuth2Provider

logger = logging.getLogger(__name__)


class AuthRouter(APIRouter):
    def __init__(
        self,
        providers: list[OAuth2Provider],
        secondary_storage: SecondaryStorage,
        accounts_storage: AccountsStorage,
        create_token: Callable[[str], tuple[str, int]],
        trusted_origins: list[str],
    ):
        super().__init__()

        self.issuer = Issuer()

        self._secondary_storage = secondary_storage
        self._accounts_storage = accounts_storage
        self._create_token = create_token
        self._trusted_origins = trusted_origins

        provider_routes = list(chain.from_iterable(p.routes for p in providers))

        routes = provider_routes + self.issuer.routes

        for route in routes:
            self.add_api_route(
                route.path,
                self._wrap_route(route.function),
                methods=route.methods,
                response_model=route.response_model,
                operation_id=route.operation_id,
            )

    def _wrap_route(
        self, route: Callable[[AsyncHTTPRequest, Context], Awaitable[Response]]
    ) -> Callable:
        async def wrapper(request: FastAPIRequest) -> FastAPIResponse:
            route_request = AsyncHTTPRequest.from_fastapi(request)

            context = Context(
                secondary_storage=self._secondary_storage,
                accounts_storage=self._accounts_storage,
                create_token=self._create_token,
                trusted_origins=self._trusted_origins,
            )

            route_response = await route(route_request, context)

            return route_response.to_fastapi()

        return wrapper
