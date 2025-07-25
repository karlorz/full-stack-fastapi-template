import asyncio
import time
from collections.abc import AsyncGenerator
from types import TracebackType
from typing import Self

import pytest

from app.api.utils.stream import stream_with_heartbeat


async def simple_stream(
    items: list[str], delay: float = 0.1
) -> AsyncGenerator[str, None]:
    """A simple async generator that yields items with a delay."""
    for item in items:
        await asyncio.sleep(delay)
        yield item


async def error_stream(items: list[str], error_after: int) -> AsyncGenerator[str, None]:
    """A stream that raises an error after yielding a certain number of items."""
    for i, item in enumerate(items):
        if i == error_after:
            raise ValueError(f"Error after {error_after} items")
        yield item


@pytest.mark.asyncio
async def test_stream_with_heartbeat_basic() -> None:
    """Test that the decorator preserves the original stream's output."""
    items = ["item1", "item2", "item3"]

    @stream_with_heartbeat(
        message="ping", interval=10.0
    )  # Long interval to avoid heartbeats
    async def decorated_stream() -> AsyncGenerator[str, None]:
        async for item in simple_stream(items, delay=0.01):
            yield item

    collected = []
    async for item in decorated_stream():
        collected.append(item)

    assert collected == items


@pytest.mark.asyncio
async def test_stream_with_heartbeat_includes_heartbeats() -> None:
    """Test that heartbeats are sent when the stream is slow."""
    items = ["item1", "item2"]
    heartbeat_message = '{"type": "heartbeat"}'

    @stream_with_heartbeat(interval=0.05, message=heartbeat_message)
    async def decorated_stream() -> AsyncGenerator[str, None]:
        async for item in simple_stream(items, delay=0.1):
            yield item

    collected = []
    start_time = time.time()
    async for item in decorated_stream():
        collected.append((item, time.time() - start_time))

    # Extract just the messages
    messages = [msg for msg, _ in collected]

    # Should have at least one heartbeat between items
    assert heartbeat_message in messages
    assert "item1" in messages
    assert "item2" in messages


@pytest.mark.asyncio
async def test_stream_with_heartbeat_exception_propagation() -> None:
    """Test that exceptions from the stream are properly propagated."""
    items = ["item1", "item2", "item3"]

    @stream_with_heartbeat(message="ping", interval=1.0)
    async def decorated_stream() -> AsyncGenerator[str, None]:
        async for item in error_stream(items, error_after=1):
            yield item

    collected = []
    # TaskGroup wraps exceptions in ExceptionGroup
    with pytest.raises(ExceptionGroup) as exc_info:
        async for item in decorated_stream():
            collected.append(item)

    # Check that the original ValueError is in the exception group
    assert len(exc_info.value.exceptions) == 1
    assert isinstance(exc_info.value.exceptions[0], ValueError)
    assert "Error after 1 items" in str(exc_info.value.exceptions[0])

    # Should have collected only the first item
    assert collected == ["item1"]


@pytest.mark.asyncio
async def test_stream_with_heartbeat_cancellation() -> None:
    """Test that the stream can be cancelled properly."""

    @stream_with_heartbeat(message='{"type": "ping"}', interval=0.01)
    async def infinite_stream() -> AsyncGenerator[str, None]:
        count = 0
        while True:
            yield f"item{count}"
            count += 1
            await asyncio.sleep(0.02)

    collected = []
    async for item in infinite_stream():
        collected.append(item)
        if len(collected) >= 3:
            break  # This should trigger cancellation

    # Should have collected at least 3 items
    assert len(collected) >= 3
    assert all(
        item.startswith("item") for item in collected if not item.startswith('{"type')
    )


@pytest.mark.asyncio
async def test_stream_with_heartbeat_empty_stream() -> None:
    """Test that empty streams work correctly."""

    @stream_with_heartbeat(message="ping", interval=0.05)
    async def empty_stream() -> AsyncGenerator[str, None]:
        # Yield nothing
        return
        yield  # Make it a generator

    collected = []
    async for item in empty_stream():
        collected.append(item)

    # Should be empty (no items, no heartbeats)
    assert collected == []


@pytest.mark.asyncio
async def test_stream_with_heartbeat_async_context_manager() -> None:
    """Test that the decorator works with async context managers in the stream."""

    class AsyncResource:
        def __init__(self) -> None:
            self.closed = False

        async def __aenter__(self) -> Self:
            return self

        async def __aexit__(
            self,
            exc_type: type[BaseException] | None,
            exc_val: BaseException | None,
            exc_tb: TracebackType | None,
        ) -> None:
            self.closed = True

    resource = AsyncResource()

    @stream_with_heartbeat(message="ping", interval=0.05)
    async def stream_with_context() -> AsyncGenerator[str, None]:
        async with resource:
            yield "item1"
            await asyncio.sleep(0.1)
            yield "item2"

    collected = []
    async for item in stream_with_context():
        collected.append(item)

    assert "item1" in collected
    assert "item2" in collected
    assert resource.closed  # Resource should be properly cleaned up
