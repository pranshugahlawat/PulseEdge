import json
import secrets
import traceback
from typing import List, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException # type: ignore

from app.models.schemas import (
    PatientEncounter,
    EvaluatedEncounter,
    TriagePriority,
    OTPRequest,
    OTPVerifyRequest,
    AuthResponse,
)
from app.services.triage_service import TriageService
from app.services.soap_service import SOAPService
from app.services.websocket_service import ws_manager
from app.services.auth_service import auth_service

router = APIRouter()
encounters_db: dict[str, EvaluatedEncounter] = {}

def serialize_model(obj: Any) -> dict:
    """Universal serializer compatible with both Pydantic v1 and v2"""
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    elif hasattr(obj, "dict"):
        return json.loads(obj.json())
    return dict(obj)

# --- AUTH ENDPOINTS ---
@router.post("/auth/request-otp")
def request_otp(req: OTPRequest):
    otp = auth_service.generate_otp(req.phone)
    return {
        "success": True,
        "message": "OTP generated. Valid for 5 minutes.",
        "dev_hint_otp": otp
    }

@router.post("/auth/verify-otp", response_model=AuthResponse)
def verify_otp(req: OTPVerifyRequest):
    # Verify OTP (Master demo bypass is 123456)
    if not auth_service.verify_otp(req.phone, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

    token = secrets.token_hex(16)
    default_name = "Dr. Medical Officer" if req.role == "DOCTOR" else "Community Health Worker"
    
    # Safe attribute access using getattr prevents AttributeError
    dept = getattr(req, "department", None) or "Emergency Triage Unit"
    name = getattr(req, "name", None) or default_name

    return AuthResponse(
        access_token=token,
        phone=req.phone,
        name=name,
        role=req.role,
        department=dept,
        message="Authentication successful"
    )

# --- ENCOUNTERS ENDPOINTS ---
@router.get("/encounters", response_model=List[EvaluatedEncounter])
def get_encounters():
    return sorted(encounters_db.values(), key=lambda e: e.triage_score, reverse=True)

@router.post("/encounters/submit", response_model=EvaluatedEncounter)
async def submit_encounter(encounter: PatientEncounter):
    try:
        bmi_val = encounter.bmi
        bmi_cat = SOAPService.get_bmi_category(bmi_val)

        # 1. Unpack all 3 values safely
        priority, reasons, triage_score = TriageService.evaluate(
            vitals=encounter.vitals,
            symptoms=getattr(encounter, "symptoms", []),
            transcript=encounter.raw_transcript,
            age=encounter.age,
            bmi=bmi_val
        )

        # 2. Build SOAP note
        soap = SOAPService.generate(encounter, priority, reasons)

        # 3. FIX: Convert encounter to dict first so Pydantic parses it cleanly
        encounter_data = serialize_model(encounter)

        # 4. Construct EvaluatedEncounter
        evaluated = EvaluatedEncounter(
            encounter=encounter_data,  # <-- Pass dictionary here
            priority=priority,
            triage_score=triage_score,
            priority_reasons=reasons,
            soap_note=soap,
            bmi=bmi_val,
            bmi_category=bmi_cat
        )

        encounters_db[encounter.id] = evaluated

        # 5. Broadcast to Next.js Web Dashboard
        serialized_data = serialize_model(evaluated)
        await ws_manager.broadcast({
            "event": "NEW_TRIAGE_ENCOUNTER",
            "data": serialized_data
        })

        return evaluated

    except Exception as e:
        print("\n[CRITICAL ERROR in /api/encounters/submit]:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Server Triage Processing Error: {str(e)}"
        )

# --- WEBSOCKET ENDPOINT ---
@router.websocket("/ws/triage")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        sorted_records = sorted(encounters_db.values(), key=lambda x: x.triage_score, reverse=True)
        initial_dump = [serialize_model(e) for e in sorted_records]
        await websocket.send_text(json.dumps({"event": "INITIAL_STATE", "data": initial_dump}))
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)