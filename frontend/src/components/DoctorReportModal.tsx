"use client";
import React from "react";
import { EvaluatedEncounter } from "../types/triage";
import { TriageBadge } from "./TriageBadge";

export interface UserProfile {
  name: string;
  phone: string;
  role: string;
  department?: string;
}

interface Props {
  record: EvaluatedEncounter;
  doctor?: UserProfile | null;
  onClose: () => void;
}

export const DoctorReportModal: React.FC<Props> = ({ record, doctor, onClose }) => {
  const { encounter, priority, triage_score, priority_reasons, soap_note, bmi, bmi_category } = record;
  const v = encounter.vitals;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Action Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compiled Clinical Encounter Report
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded shadow transition"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Medical Encounter Sheet */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 font-sans print:p-0 print:text-black print:overflow-visible">
          
          {/* Header Banner */}
          <div className="border-b-2 border-cyan-500 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-white print:text-black tracking-tight">
                PULSEEDGE CLINICAL TRIAGE REPORT
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Primary Health & Remote Clinical Response Network
              </p>
            </div>
            <div className="text-right">
              <TriageBadge priority={priority} score={triage_score} size="md" />
              <p className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
                Encounter ID: {encounter.id}
              </p>
            </div>
          </div>

          {/* Patient Demographics & Biometrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Patient Name</span>
              <p className="text-sm font-bold text-white print:text-black">{encounter.patient_name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Demographics</span>
              <p className="text-sm font-bold text-white print:text-black">
                {encounter.age} yrs • {encounter.gender}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Address / Locality</span>
              <p className="text-sm font-medium text-slate-200 print:text-black">
                {encounter.address || "Rural PHC Field Location"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Biometrics & BMI</span>
              <p className="text-sm font-bold text-cyan-400 print:text-black">
                {bmi ? `${bmi} kg/m² (${bmi_category})` : "N/A"}
              </p>
              <span className="text-[10px] text-slate-500">
                {encounter.height_cm ? `${encounter.height_cm} cm` : "--"} / {encounter.weight_kg ? `${encounter.weight_kg} kg` : "--"}
              </span>
            </div>
          </div>

          {/* Vitals Ribbon */}
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">HEART RATE</span>
              <strong className="text-white text-sm">{v.heart_rate ?? "--"} bpm</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">BLOOD PRESSURE</span>
              <strong className="text-white text-sm">
                {v.systolic_bp ?? "--"}/{v.diastolic_bp ?? "--"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">O2 SATURATION</span>
              <strong className="text-white text-sm">{v.spo2 ? `${v.spo2}%` : "--"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RESP. RATE</span>
              <strong className="text-white text-sm">{v.respiratory_rate ?? "--"}/min</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">TEMPERATURE</span>
              <strong className="text-white text-sm">{v.temperature_c ? `${v.temperature_c}°C` : "--"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CONSCIOUSNESS</span>
              <strong className="text-white text-sm">{v.consciousness}</strong>
            </div>
          </div>

          {/* Wound Inspection Image (If uploaded from mobile) */}
          {encounter.wound_image_base64 && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                Point-of-Care Wound / Trauma Inspection
              </h4>
              <div className="flex items-center gap-4">
                <img
                  src={encounter.wound_image_base64}
                  alt="Wound / Injury"
                  className="w-48 h-36 object-cover rounded-md border border-slate-700 shadow"
                />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="text-slate-200 font-semibold">Visual Trauma Evidence Captured at Point of Care</p>
                  <p>Image pre-compressed on mobile device and verified before sync.</p>
                  <p className="text-amber-400 font-mono text-[11px]">
                    Inspect for tissue involvement, laceration depth, and infection margins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* WHO Protocol Rationale & Acuity Index */}
          <div className="bg-red-950/20 border border-red-900/60 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-red-400 uppercase mb-1">
              Assigned Clinical Acuity Triggers ({triage_score}/100)
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
              {priority_reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Structured SOAP Clinical Sections */}
          <div className="space-y-3 text-xs">
            <div className="border border-slate-800 p-3 rounded bg-slate-900">
              <strong className="text-cyan-400 uppercase block mb-1">Subjective (Consult Dialogue)</strong>
              <p className="text-slate-300 whitespace-pre-wrap">{soap_note.subjective}</p>
            </div>
            <div className="border border-slate-800 p-3 rounded bg-slate-900">
              <strong className="text-cyan-400 uppercase block mb-1">Objective (Vitals & Physical Exam)</strong>
              <p className="text-slate-300 whitespace-pre-wrap">{soap_note.objective}</p>
            </div>
            <div className="border border-slate-800 p-3 rounded bg-slate-900">
              <strong className="text-cyan-400 uppercase block mb-1">Assessment</strong>
              <p className="text-slate-300 whitespace-pre-wrap">{soap_note.assessment}</p>
            </div>
            <div className="border border-slate-800 p-3 rounded bg-slate-900">
              <strong className="text-cyan-400 uppercase block mb-1">Plan of Action</strong>
              <p className="text-slate-300 whitespace-pre-wrap">{soap_note.plan}</p>
            </div>
          </div>

          {/* Verified Chain of Custody & Doctor Signature Footer */}
          <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-400 print:text-black">
            <div>
              <p>
                Recorded by Field Health Worker:{" "}
                <strong className="text-slate-200 print:text-black">
                  {encounter.submitted_by_name || "Community Health Worker"}
                </strong>{" "}
                (+91 {encounter.submitted_by_phone || "--"})
              </p>
              <p className="text-[10px] text-slate-500">
                Timestamp: {new Date(encounter.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p>
                Attending Reviewer:{" "}
                <strong className="text-cyan-400 print:text-black">
                  {doctor?.name || "Dr. Medical Officer"}
                </strong>
              </p>
              <p className="text-[10px] text-slate-500">
                {doctor?.department || "Emergency Triage Unit"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};