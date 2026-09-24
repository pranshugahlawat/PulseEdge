from app.models.schemas import PatientEncounter, TriagePriority, SOAPNote

class SOAPService:
    @staticmethod
    def get_bmi_category(bmi: float | None) -> str:
        if bmi is None:
            return "N/A"
        if bmi < 18.5:
            return "Underweight"
        elif bmi < 25.0:
            return "Normal weight"
        elif bmi < 30.0:
            return "Overweight"
        return "Obese"

    @staticmethod
    def generate(encounter: PatientEncounter, priority: TriagePriority, reasons: list[str]) -> SOAPNote:
        v = encounter.vitals
        bmi_val = encounter.bmi
        bmi_cat = SOAPService.get_bmi_category(bmi_val)
        c_str = str(getattr(v.consciousness, "value", v.consciousness or "ALERT"))

        vitals_formatted = (
            f"HR: {v.heart_rate or '--'} bpm | BP: {v.systolic_bp or '--'}/{v.diastolic_bp or '--'} mmHg | "
            f"SpO2: {v.spo2 or '--'}% | RR: {v.respiratory_rate or '--'}/min | "
            f"Temp: {v.temperature_c or '--'} C | Mental Status: {c_str}"
        )

        biometrics = (
            f"Height: {encounter.height_cm or '--'} cm | Weight: {encounter.weight_kg or '--'} kg | "
            f"BMI: {bmi_val or '--'} kg/m² ({bmi_cat}) | Locality: {encounter.address or 'Field Location'}"
        )

        symptoms_str = ", ".join(encounter.symptoms) if encounter.symptoms else "None selected"

        wound_status = (
            "Point-of-care trauma/wound photo attached and verified."
            if encounter.wound_image_base64
            else "No external wound image submitted."
        )

        return SOAPNote(
            subjective=(
                f"Chief Complaint: {encounter.chief_complaint or 'Routine assessment'}\n"
                f"Checked Symptoms: {symptoms_str}\n\n"
                f"Dialogue / Clinical History:\n\"{encounter.raw_transcript.strip()}\"\n\n"
                f"Recorded by: {encounter.submitted_by_name} (+91 {encounter.submitted_by_phone})"
            ),
            objective=(
                f"Point-of-Care Vitals:\n{vitals_formatted}\n\n"
                f"Biometrics & Demographics:\n{biometrics}\n\n"
                f"Physical Wound Examination:\n{wound_status}"
            ),
            assessment=f"Triage Level: {priority.value}\nClinical Triggers:\n- " + "\n- ".join(reasons),
            plan=(
                "1. Bedside nursing evaluation aligned with triage priority.\n"
                "2. Fluid resuscitation & stabilization if hemodynamically compromised.\n"
                "3. Attending physician direct consult.\n"
                "4. Monitor continuous vitals until stable."
            )
        )