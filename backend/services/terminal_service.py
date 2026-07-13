"""
Terminal Service — Bridges xterm.js (WebSocket) to a GNS3 console (Telnet).
When the student types in the browser, we forward it to the router.
When the router responds, we send it back to the browser.
"""

import asyncio
import telnetlib3
from fastapi import WebSocket


async def bridge_terminal(
    websocket: WebSocket,
    host: str,
    port: int,
):
    """
    Core bridge function. Opens a Telnet connection to the router console
    and forwards data bidirectionally with the browser's WebSocket.
    """
    try:
        # Open Telnet connection to GNS3 console port
        reader, writer = await telnetlib3.open_connection(host, port)

        async def from_router_to_browser():
            """Continuously read from router, send to browser."""
            while True:
                data = await reader.read(1024)
                if not data:
                    break
                await websocket.send_text(data)

        async def from_browser_to_router():
            """Continuously read from browser, send to router."""
            while True:
                data = await websocket.receive_text()
                writer.write(data)
                await writer.drain()

        # Create tasks so we can cancel them if one fails
        task1 = asyncio.create_task(from_router_to_browser())
        task2 = asyncio.create_task(from_browser_to_router())

        # Wait until either the browser disconnects or the router disconnects
        done, pending = await asyncio.wait(
            [task1, task2],
            return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel the remaining task
        for task in pending:
            task.cancel()

    except Exception as e:
        print(f"Terminal bridge error: {e}")
    finally:
        try:
            if 'writer' in locals():
                writer.close()
        except:
            pass
        try:
            await websocket.close()
        except:
            pass
