from collections.abc import Awaitable, Callable

from duck import AsyncHTTPRequest, Response
from pydantic import BaseModel

from ._context import Context


class Route:
    def __init__(
        self,
        path: str,
        methods: list[str],
        function: Callable[[AsyncHTTPRequest, Context], Awaitable[Response]],
        response_model: type[BaseModel] | None = None,
        operation_id: str | None = None,
    ):
        self.path = path
        self.methods = methods
        self.function = function
        self.response_model = response_model
        self.operation_id = operation_id
