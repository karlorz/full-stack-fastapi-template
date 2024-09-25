from fastapi import APIRouter

from app.api.routes import (
    apps,
    deployments,
    invitations,
    login,
    private,
    teams,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(
    invitations.router, prefix="/invitations", tags=["invitations"]
)
api_router.include_router(apps.router, prefix="/apps", tags=["apps"])
api_router.include_router(deployments.router, tags=["deployments"])

if settings.ENABLE_PRIVATE_API:
    api_router.include_router(private.router, prefix="/private", tags=["private"])
