export type TriagePriority = "RED" | "YELLOW" | "GREEN";

export interface PatientVitals {
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  respiratory_rate?: number;
  spo2?: number;
  temperature_c?: number;
  consciousness: string;
}

export interface PatientEncounter {
  id: string;
  submitted_by_phone?: string;
  submitted_by_name?: string;
  patient_name: string;
  age: number;
  gender: string;
  address?: string;
  height_cm?: number;
  weight_kg?: number;
  chief_complaint?: string;
  symptoms?: string[];
  raw_transcript: string;
  vitals: PatientVitals;
  wound_image_base64?: string;
  created_at: string;
  synced_from_offline: boolean;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface EvaluatedEncounter {
  encounter: PatientEncounter;
  priority: TriagePriority;
  triage_score: number;
  priority_reasons: string[];
  soap_note: SOAPNote;
  bmi?: number;
  bmi_category?: string;
}