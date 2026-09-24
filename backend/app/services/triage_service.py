from app.models.schemas import PatientVitals, TriagePriority, ConsciousnessLevel

class TriageService:
    @staticmethod
    def evaluate(
        vitals: PatientVitals,
        symptoms: list[str] | None = None,
        transcript: str = "",
        age: int = 30,
        bmi: float | None = None
    ) -> tuple[TriagePriority, list[str], int]:
        reasons = []
        text = (transcript or "").lower()
        symptom_list = [s.lower() for s in (symptoms or [])]
        score = 10

        # 1. Level of Consciousness
        c_val = str(getattr(vitals.consciousness, "value", vitals.consciousness or "ALERT")).upper()
        if c_val in ["PAIN", "UNRESPONSIVE"]:
            reasons.append("Critical Mental Status: Non-Alert (Pain/Unresponsive)")
            score += 50
        elif c_val == "VOICE":
            reasons.append("Decreased Responsiveness: Reacts to Voice Only")
            score += 25

        # 2. Oxygen Saturation
        if vitals.spo2 is not None:
            if vitals.spo2 < 90:
                reasons.append(f"Severe Hypoxemia: SpO2 {vitals.spo2}% (<90%)")
                score += 40
            elif vitals.spo2 < 94:
                reasons.append(f"Moderate Hypoxemia: SpO2 {vitals.spo2}% (90-94%)")
                score += 20

        # 3. Blood Pressure
        if vitals.systolic_bp is not None:
            if vitals.systolic_bp < 90:
                reasons.append(f"Hypotensive Shock Warning: SBP {vitals.systolic_bp} mmHg (<90)")
                score += 35
            elif vitals.systolic_bp > 180:
                reasons.append(f"Hypertensive Crisis: SBP {vitals.systolic_bp} mmHg (>180)")
                score += 25

        # 4. Respiration
        if vitals.respiratory_rate is not None:
            if vitals.respiratory_rate > 30 or vitals.respiratory_rate < 8:
                reasons.append(f"Severe Respiratory Distress: RR {vitals.respiratory_rate}/min")
                score += 35
            elif vitals.respiratory_rate > 22:
                reasons.append(f"Tachypnea: RR {vitals.respiratory_rate}/min")
                score += 15

        # 5. Heart Rate
        if vitals.heart_rate is not None:
            max_hr = 160 if age < 5 else 130
            if vitals.heart_rate > max_hr or vitals.heart_rate < 40:
                reasons.append(f"Severe Arrhythmia Risk: HR {vitals.heart_rate} bpm (Age: {age}y)")
                score += 30
            elif vitals.heart_rate > 105:
                reasons.append(f"Tachycardia: HR {vitals.heart_rate} bpm")
                score += 15

        # 6. Evaluation of Structured Symptoms
        for sym in symptom_list:
            if "chest pain" in sym or "breathlessness" in sym or "severe bleeding" in sym or "unconscious" in sym:
                reasons.append(f"High-Acuity Symptom Checked: {sym.title()}")
                score += 35
            elif "fever" in sym or "wound" in sym or "fracture" in sym or "vomiting" in sym:
                reasons.append(f"Clinical Symptom Checked: {sym.title()}")
                score += 15

        # 7. Transcript Keywords fallback
        if "cannot breathe" in text and not any("breath" in s for s in symptom_list):
            reasons.append("Emergency presentation detected: 'cannot breathe'")
            score += 30

        final_score = min(max(score, 5), 100)

        if final_score >= 75:
            priority = TriagePriority.RED
        elif final_score >= 40:
            priority = TriagePriority.YELLOW
        else:
            priority = TriagePriority.GREEN
            if not reasons:
                reasons.append("Vitals, biometrics, and symptoms within stable baseline")

        return priority, reasons, final_score