import anyio
from nats.js.api import StreamConfig

from app.nats import make_nats_client


async def main() -> None:
    nc = await make_nats_client()

    jetstream = nc.jetstream()
    await jetstream.add_stream(
        config=StreamConfig(name="logs-apps", subjects=["logs.apps.>"])
    )

    await nc.close()


if __name__ == "__main__":
    anyio.run(main)
