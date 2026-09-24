import { useState, useEffect, useCallback, useRef } from "react";
import { EvaluatedEncounter } from "../types/triage";

const SEED_DATA: EvaluatedEncounter[] = [
  {
    encounter: {
      id: "DEMO-01",
      patient_name: "Sunita Devi",
      age: 46,
      gender: "Female",
      raw_transcript: "Patient reports severe chest pressure and sudden breathlessness since morning.",
      vitals: {
        heart_rate: 136,
        systolic_bp: 86,
        diastolic_bp: 55,
        spo2: 88,
        temperature_c: 37.4,
        consciousness: "ALERT",
      },
      // FIXED STATIC TIMESTAMP (Prevents millisecond difference on SSR)
      created_at: "2026-09-22T08:30:00.000Z",
      synced_from_offline: true,
    },
    priority: "RED",
    priority_reasons: [
      "Severe Hypoxemia: SpO2 88% (<90%)",
      "Hypotensive Shock Warning: Systolic BP 86 mmHg (<90)",
      "Severe Arrhythmia risk: HR 136 bpm",
      "Emergency clinical presentation detected: 'chest pressure'",
    ],
    soap_note: {
      subjective: 'Patient reports: "Severe chest pressure and sudden breathlessness since morning."',
      objective: "Point-of-Care Vitals: HR: 136 bpm | BP: 86/55 mmHg | SpO2: 88% | Temp: 37.4 C",
      assessment: "Triage Level: RED. Critical cardiopulmonary presentation with hypoxemia and hypotension.",
      plan: "1. High-flow oxygen immediately.\n2. Establish dual large-bore IV access.\n3. Immediate physician evaluation.",
    },
    triage_score: 92,
  },
  {
    encounter: {
      id: "DEMO-02",
      patient_name: "Amit Patel",
      age: 28,
      gender: "Male",
      raw_transcript: "High fever for three days with persistent dry cough and body weakness.",
      vitals: {
        heart_rate: 108,
        systolic_bp: 118,
        diastolic_bp: 76,
        spo2: 95,
        temperature_c: 39.2,
        consciousness: "ALERT",
      },
      // FIXED STATIC TIMESTAMP
      created_at: "2026-09-22T08:15:00.000Z",
      synced_from_offline: false,
    },
    priority: "YELLOW",
    priority_reasons: [
      "Tachycardia: HR 108 bpm",
      "Urgent symptom detected: 'high fever'",
    ],
    soap_note: {
      subjective: 'Patient reports: "High fever for three days with persistent dry cough."',
      objective: "Point-of-Care Vitals: HR: 108 bpm | BP: 118/76 mmHg | SpO2: 95% | Temp: 39.2 C",
      assessment: "Triage Level: YELLOW. Febrile illness requiring acute observation.",
      plan: "1. Oral antipyretics.\n2. Rapid malaria and dengue serology tests.\n3. Re-evaluate temperature in 30 mins.",
    },
    triage_score: 55,
  },
];

export function useTriage(apiBaseUrl = "http://localhost:8000") {
  const [records, setRecords] = useState<EvaluatedEncounter[]>(SEED_DATA);
  const [selectedRecord, setSelectedRecord] = useState<EvaluatedEncounter | null>(SEED_DATA[0]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

    // Sort by highest triage score first
  const sortRecords = useCallback((list: EvaluatedEncounter[]) => {
    return [...list].sort((a, b) => b.triage_score - a.triage_score);
  }, []);

      useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;

    // 1. Safe REST fetch
    async function fetchEncounters() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/encounters`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: EvaluatedEncounter[] = await res.json();
        
        if (isMounted && data.length > 0) {
          const sorted = sortRecords(data);
          setRecords(sorted);
          setSelectedRecord(sorted[0]);
        }
      } catch (err) {
        console.warn("Backend not detected yet on http://localhost:8000. Running in offline/demo mode.");
      }
    }

    fetchEncounters();

    // 2. Safe WebSocket initialization with StrictMode guards
    try {
      const wsUrl = apiBaseUrl.replace(/^http/, "ws") + "/ws/triage";
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      ws.onclose = () => {
        if (isMounted) setIsConnected(false);
      };

      ws.onerror = () => {
        if (isMounted) setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "NEW_TRIAGE_ENCOUNTER" && isMounted) {
            setRecords((prev) => {
              const filtered = prev.filter((r) => r.encounter.id !== payload.data.encounter.id);
              return sortRecords([payload.data, ...filtered]);
            });
          } else if (payload.event === "INITIAL_STATE" && isMounted && payload.data.length > 0) {
            const sorted = sortRecords(payload.data);
            setRecords(sorted);
            setSelectedRecord(sorted[0]);
          }
        } catch (e) {
          console.error("Malformed WS event:", e);
        }
      };
    } catch (e) {
      console.warn("WebSocket could not initialize:", e);
    }

    // React 18 Safe Cleanup: Do not abort while CONNECTING
    return () => {
      isMounted = false;
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close(); // Close only after handshake completes
        }
      }
    };
  }, [apiBaseUrl, sortRecords]);

  return { records, selectedRecord, setSelectedRecord, isConnected };
}