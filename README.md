# 🩺 PulseEdge: Disconnect-Resilient Clinical Co-Pilot & Triage Dispatch Network

[![Hackathon](https://img.shields.io/badge/Global%20Innovation%20Hackathon-2026-cyan?style=for-the-badge)](https://unstop.com)
[![Theme](https://img.shields.io/badge/Theme-Innovate%20Without%20Borders-indigo?style=for-the-badge)](#)
[![Stack](https://img.shields.io/badge/Architecture-Edge--to--Hub%20Distributed-emerald?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **PulseEdge** is an open-source, edge-native clinical intake and emergency triage dispatch ecosystem designed for low-resource environments, rural primary health centers (PHCs), and disaster-response zones. It combines an **offline-first mobile field scribe** with a **real-time desktop hospital command board**, governed by a **deterministic WHO/ESI clinical acuity engine**.

---

## 📌 Executive Summary & Problem Realities

In rural clinics and disaster camps across developing regions, frontline healthcare delivery is crippled by four structural failures:

* 🚨 **`[BURDEN & BURNOUT]` 40%+ Time Consumed by Paper Registers:** Doctors and Community Health Workers (CHWs/ASHAs) spend nearly half their shifts writing manual paper logs, reducing patient consultation time to under 3 minutes.
* 🌐 **`[INFRASTRUCTURE WALL]` Cloud-AI Collapse in Low-Bandwidth Regions:** Commercial Generative AI scribes (e.g., Nuance DAX, Ambience) require constant high-speed cloud connections and costly APIs. In zones with daily power cuts and cellular blackouts, **they fail completely**.
* ⚠️ **`[CRITICAL RISK]` Delayed Triage & Diagnostic Blindspots:** Overworked clinicians miss early signs of rapid deterioration (pediatric sepsis, pre-eclampsia, hypovolemic shock) because vitals and symptoms remain locked in paper notes.
* ⛓️ **`[CHAIN-OF-CUSTODY GAP]` Fragmented Field-to-Hospital Auditing:** Referred patients arrive at tertiary centers with lost history, forcing doctors to restart intake from scratch without knowing who administered initial field care.

---

## 💡 The PulseEdge Solution Ecosystem

                   [ 📱 mobile/ ]
          (Frontline Health Worker / Edge)
    • Works 100% Offline with Mobile OTP Login
    • Point-of-Care Vitals & Biometrics (Height/Weight/BMI)
    • Structured Symptoms Checklist & Ambient Voice Scribe
    • Point-of-Care Wound/Trauma Photo Capture
    • Instant 0–100 Clinical Acuity Score & Priority Badge
    • Automatic Form Reset post-transmission
                       │
                       │  (Batch sync via cellular / local clinic Wi-Fi)
                       ▼
                   [ ⚙️ backend/ ]
          (FastAPI Clinic Hub & Sync Engine)
    • Deterministic WHO IMCI / ESI Rule Verification (Zero Hallucinations)
    • Auto-Generated Structured SOAP Notes
    • Session-based Mobile Number + OTP Auth Service
    • Real-Time WebSocket Multiplexing & FHIR R4 JSON Standards
                       │
                       │  (Live WebSocket Stream: ws://)
                       ▼
                  [ 💻 frontend/ ]
          (Attending Doctor / Command Board)
    • Next.js 14 Real-Time Emergency Triage Queue (Sorted by Acuity)
    • Doctor Profile & Department Customization (Persistent)
    • Verified Field-to-Hospital Chain of Custody Audit Strip
    • 1-Click Compiled Printable Doctor's Report (PDF Export)


---

## ✨ Key Technical Innovations

1. **Deterministic Acuity Engine (Zero AI Hallucinations):** Instead of allowing generative models to guess medical urgency, PulseEdge calculates a **0–100 Clinical Acuity Score** and maps it to **RED**, **YELLOW**, or **GREEN** badges using validated clinical protocols (WHO IMCI & Emergency Severity Index).
2. **Point-of-Care Trauma Visuals:** Integrates compressed wound and injury images directly with systemic vitals, allowing emergency room doctors to inspect tissue trauma before the patient arrives.
3. **True Edge-Native Offline Resilience:** The Flutter field client requires zero network access during intake. If disconnected, records are cached in an encrypted local store and batch-synced upon reconnect.
4. **Verified Chain of Custody:** Explicitly links the field worker's identity (`submitted_by_name` and `submitted_by_phone`) with the reviewing physician’s credentials on the generated hospital report.
5. **Universal Multi-Platform Support:** Compatible out-of-the-box with Android Emulators (`10.0.2.2`), iOS Simulators, Physical Devices (LAN IP override), Windows Desktop, and Web Browsers.

---

## 🛠️ Technology Stack (100% Software)

| Layer | Technologies Used | Key Libraries & Standards |
| :--- | :--- | :--- |
| **Mobile Client** | Flutter, Dart | `http`, `image_picker`, Material 3 |
| **Command Board** | Next.js 14, React 18, TypeScript | Tailwind CSS, Lucide Icons, Shadcn UI patterns |
| **Backend Nervous System** | FastAPI (Python 3.10+) | Uvicorn, Pydantic v2, WebSockets, AnyIO |
| **Data & Clinical Standards** | JSON Schema, HL7 / FHIR R4 | WHO IMCI Protocol, Emergency Severity Index (ESI) |

---

## 📂 Repository Directory Layout

```text
pulse-edge/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py           # REST triage endpoints & WebSocket handler
│   │   ├── core/
│   │   │   └── config.py           # CORS & application settings
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic data schemas & FHIR models
│   │   ├── services/
│   │   │   ├── auth_service.py     # Mobile number OTP generator & validator
│   │   │   ├── soap_service.py     # Automated SOAP clinical note generator
│   │   │   ├── triage_service.py   # Deterministic WHO/ESI scoring engine
│   │   │   └── websocket_service.py# Real-time WebSocket connection manager
│   │   └── main.py                 # FastAPI application entrypoint
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css         # Dark-mode styling & custom scrollbars
│   │   │   ├── layout.tsx          # Root Next.js layout metadata
│   │   │   └── page.tsx            # Reactive main dashboard controller
│   │   ├── components/
│   │   │   ├── ClinicalViewer.tsx  # Detailed SOAP & biometrics viewer
│   │   │   ├── DoctorReportModal.tsx # Printable PDF-ready clinical report
│   │   │   ├── LoginModal.tsx      # Medical officer OTP authentication modal
│   │   │   ├── SOAPSection.tsx     # Reusable clinical section cards
│   │   │   ├── TriageBadge.tsx     # Color-coded acuity chip with 0-100 score
│   │   │   ├── TriageCard.tsx      # Queue card with acuity progress bar
│   │   │   ├── TriageHeader.tsx    # Header with doctor profile/name editor
│   │   │   └── TriageQueue.tsx     # Prioritized patient triage queue
│   │   ├── hooks/
│   │   │   └── useTriage.ts        # WebSocket & REST sync hook with demo fallback
│   │   └── types/
│   │       └── triage.ts           # Shared TypeScript interfaces
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.ts
│
└── mobile/
    ├── lib/
    │   ├── models/
    │   │   └── encounter.dart      # Data models with client-side BMI helpers
    │   ├── screens/
    │   │   ├── intake_screen.dart  # Multi-section triage intake & photo capture
    │   │   └── login_screen.dart   # Field worker mobile OTP login screen
    │   ├── services/
    │   │   ├── auth_service.dart   # Mobile auth service with offline fallback
    │   │   ├── sync_service.dart   # Multi-platform network dispatcher
    │   │   └── triage_calculator.dart # On-device deterministic acuity calculator
    │   ├── widgets/
    │   │   ├── priority_chip.dart  # Acuity badge with numerical score
    │   │   └── vitals_input_field.dart # High-visibility vitals input
    │   └── main.dart               # Flutter application entrypoint
    ├── android/gradle.properties   # Windows Kotlin compiler daemon locks fix
    └── pubspec.yaml