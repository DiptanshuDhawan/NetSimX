from fastapi import APIRouter, WebSocket
from db.database import get_db
from services.gns3_service import get_node_console_port, GNS3_HOST
from services.terminal_service import bridge_terminal

router = APIRouter(tags=["terminal"])


@router.websocket("/ws/terminal/{session_id}/{node_name}")
async def terminal_websocket(
    websocket: WebSocket,
    session_id: int,
    node_name: str,
):
    conn = get_db()
    session_row = conn.execute("SELECT gns3_project_id FROM lab_sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    
    if not session_row:
        print(f"WS error: Session {session_id} not found in DB")
        await websocket.close(code=1008, reason="Session not found")
        return

    project_id = session_row["gns3_project_id"]

    # Look up the live console port for the requested node
    try:
        console_port = get_node_console_port(project_id, node_name)
    except ValueError as e:
        print(f"WS error: Node {node_name} console port not found: {e}")
        await websocket.close(code=1008, reason=str(e))
        return

    # Bridge the WebSocket to the Telnet console
    await bridge_terminal(websocket, GNS3_HOST, console_port)
