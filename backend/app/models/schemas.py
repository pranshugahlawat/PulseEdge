import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict  # pyright: ignore[reportMissingImports]

class ConsciousnessLevel(str, Enum):
    ALERT = "ALERT"
    VOICE = "VOICE"
    PAIN = "PAIN"
    UNRESPONSIVE = "UNRESPONSIVE"

class TriagePriority(str, Enum):
    RED = "RED"       # Immediate resuscitation
    YELLOW = "YELLOW" # Urgent observation
    GREEN = "GREEN"   # Routine outpatient

class PatientVitals(BaseModel):
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    respiratory_rate: Optional[int] = None
    spo2: Optional[int] = None
    temperature_c: Optional[float] = None
    consciousness: ConsciousnessLevel = ConsciousnessLevel.ALERT

class PatientEncounter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    submitted_by_phone: Optional[str] = "Unauthenticated Worker" # <-- ADD THIS FIELD
    patient_name: str
    age: int
    gender: str
    address: Optional[str] = "Rural Primary Health Sector"
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    raw_transcript: str
    vitals: PatientVitals
    wound_image_base64: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    synced_from_offline: bool = False

    @property
    def bmi(self) -> Optional[float]:
        if self.height_cm and self.weight_kg and self.height_cm > 0:
            h_m = self.height_cm / 100.0
            return round(self.weight_kg / (h_m * h_m), 1)
        return None

class SOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

class EvaluatedEncounter(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)  # <-- ADD THIS

    encounter: PatientEncounter
    priority: TriagePriority
    triage_score: int = Field(..., ge=0, le=100)
    priority_reasons: List[str]
    soap_note: SOAPNote
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None

class OTPRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,14}$")

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str
    role: str = "FIELD_WORKER"       # "FIELD_WORKER" or "DOCTOR"
    name: Optional[str] = None
    department: Optional[str] = None 

class AuthResponse(BaseModel):
    access_token: str
    phone: str
    name: str
    role: str
    department: Optional[str] = "Emergency Triage Unit"
    message: str

class PatientEncounter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    submitted_by_phone: str = "9876543210"
    submitted_by_name: str = "Sunita Devi (CHW)"
    patient_name: str
    age: int
    gender: str
    address: Optional[str] = "Rural PHC Sector"
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    chief_complaint: Optional[str] = "Acute presentation"     # <-- ADDED
    symptoms: List[str] = Field(default_factory=list)          # <-- ADDED
    raw_transcript: str
    vitals: PatientVitals
    wound_image_base64: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    synced_from_offline: bool = False

    @property
    def bmi(self) -> Optional[float]:
        if self.height_cm and self.weight_kg and self.height_cm > 0:
            h_m = self.height_cm / 100.0
            return round(self.weight_kg / (h_m * h_m), 1)
        return None