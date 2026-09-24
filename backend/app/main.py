import sys
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router, encounters_db
from app.services.websocket_service import ws_manager

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes go under /api
app.include_router(router, prefix=settings.API_V1_STR)

# Dedicated WebSocket endpoint at root /ws/triage
@app.websocket("/ws/triage")
async def websocket_triage(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot of encounters on connect
        initial_dump = [json.loads(e.model_dump_json()) for e in encounters_db.values()]
        await websocket.send_text(json.dumps({"event": "INITIAL_STATE", "data": initial_dump}))
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
def root():
    return {"status": "PulseEdge Engine Ready", "docs": "/docs"}