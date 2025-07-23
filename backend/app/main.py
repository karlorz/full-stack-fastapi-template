from typing import Any

import logfire
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.api.routes.auth.router import router as auth_router
from app.core.config import CommonSettings, MainSettings
from app.core.db import engine
from app.core.exceptions import OAuth2Exception


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


settings = MainSettings.get_settings()
common_settings = CommonSettings.get_settings()

if settings.BACKEND_SENTRY_DSN and common_settings.ENVIRONMENT != "local":
    sentry_sdk.init(
        dsn=str(settings.BACKEND_SENTRY_DSN),
        enable_tracing=True,
        environment=common_settings.ENVIRONMENT,
    )

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

logfire.configure(
    token=common_settings.LOGFIRE_TOKEN,
    environment=common_settings.ENVIRONMENT,
    service_name="backend",
    send_to_logfire="if-token-present",
)
logfire.instrument_fastapi(app)
logfire.instrument_httpx()
logfire.instrument_sqlalchemy(engine=engine)
logfire.instrument_redis()


@app.exception_handler(OAuth2Exception)
async def oauth2_exception_handler(
    _request: Request, exc: OAuth2Exception
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.error,
            "error_description": exc.error_description,
        },
    )


# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


original_openapi = app.openapi


# Custom OpenAPI schema to include additional schemas from FastAPI auth
def custom_openapi() -> dict[str, Any]:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = original_openapi()
    openapi_schema["components"]["schemas"].update(auth_router.extra_schemas)

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi  # type: ignore
