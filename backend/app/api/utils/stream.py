import asyncio
import dataclasses
import functools
from collections.abc import AsyncGenerator, Callable
from typing import Literal, ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")
Item = TypeVar("Item")


@dataclasses.dataclass
class StreamDone:
    data: None = None
    done: Literal[True] = True


@dataclasses.dataclass
class StreamMessage[Item]:
    data: Item
    done: Literal[False] = False


type StreamQueueMessage[Item] = StreamMessage[Item] | StreamDone


def stream_with_heartbeat[Item, **P](
    message: Item,
    interval: float = 5.0,
) -> Callable[
    [Callable[P, AsyncGenerator[Item, None]]], Callable[P, AsyncGenerator[Item, None]]
]:
    """Add heartbeat messages to a stream to prevent connection timeouts.

    Heartbeats are sent every X seconds when the drain task isn't sending data.
    """

    def decorator(
        stream: Callable[P, AsyncGenerator[Item, None]],
    ) -> Callable[P, AsyncGenerator[Item, None]]:
        queue: asyncio.Queue[StreamQueueMessage[Item]] = asyncio.Queue()

        async def drain(*args: P.args, **kwargs: P.kwargs) -> None:
            async for item in stream(*args, **kwargs):
                await queue.put(StreamMessage(item))

            await queue.put(StreamDone())

        @functools.wraps(stream)
        async def merged(
            *args: P.args, **kwargs: P.kwargs
        ) -> AsyncGenerator[Item, None]:
            async with asyncio.TaskGroup() as tg:
                tg.create_task(drain(*args, **kwargs))

                while True:
                    try:
                        async with asyncio.timeout(interval):
                            queue_message = await queue.get()

                            if queue_message.done:
                                break

                            yield queue_message.data
                    except TimeoutError:
                        yield message

        return merged

    return decorator
