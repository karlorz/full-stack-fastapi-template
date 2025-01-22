from functools import lru_cache

from asyncer import syncify
from grpclib.client import Channel

from app.core.config import DepotSettings
from app.depot_py.depot.build import v1 as depot_build
from app.depot_py.depot.buildkit import v1 as depot_buildkit
from app.depot_py.depot.core import v1 as depot_core


# The Channel expects an asyincio event loop (in its thread), so this function needs
# to be async
async def make_channel() -> Channel:
    depot_channel = Channel(
        host=DepotSettings.get_settings().DEPOT_HOSTNAME, port=443, ssl=True
    )
    return depot_channel


@lru_cache
def channel() -> Channel:
    return syncify(make_channel)()


@lru_cache
def build() -> depot_build.BuildServiceStub:
    depot_channel = channel()
    return depot_build.BuildServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def core_build() -> depot_core.BuildServiceStub:
    depot_channel = channel()
    return depot_core.BuildServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def core_project() -> depot_core.ProjectServiceStub:
    depot_channel = channel()
    return depot_core.ProjectServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def buildkit() -> depot_buildkit.BuildKitServiceStub:
    depot_channel = channel()
    return depot_buildkit.BuildKitServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )
