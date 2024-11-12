from functools import lru_cache

from asyncer import syncify
from grpclib.client import Channel

from app.core.config import DepotSettings
from app.depot_py.depot.build import v1 as depot_build
from app.depot_py.depot.buildkit import v1 as depot_buildkit
from app.depot_py.depot.core import v1 as depot_core


# The Channel expects an asyincio event loop (in its thread), so this function needs
# to be async
@lru_cache
async def channel() -> Channel:
    depot_channel = Channel(
        host=DepotSettings.get_settings().DEPOT_HOSTNAME, port=443, ssl=True
    )
    return depot_channel


@lru_cache
def build() -> depot_build.BuildServiceStub:
    depot_channel = syncify(channel)()
    return depot_build.BuildServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def core_build() -> depot_core.BuildServiceStub:
    depot_channel = syncify(channel)()
    return depot_core.BuildServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def core_project() -> depot_core.ProjectServiceStub:
    depot_channel = syncify(channel)()
    return depot_core.ProjectServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )


@lru_cache
def buildkit() -> depot_buildkit.BuildKitServiceStub:
    depot_channel = syncify(channel)()
    return depot_buildkit.BuildKitServiceStub(
        depot_channel,
        metadata={
            "authorization": f"Bearer {DepotSettings.get_settings().DEPOT_TOKEN}"
        },
    )
