"use client";
import React from "react";
import { EvaluatedEncounter } from "../types/triage";
import { TriageBadge } from "./TriageBadge";
import { SOAPSection } from "./SOAPSection";

interface Props {
  record: EvaluatedEncounter | null;
  onOpenReport?: () => void;
}

export const ClinicalViewer: React.FC<Props> = ({ record, onOpenReport }) => {
  if (!record) {
    return (
      <main className="flex-1 flex items-center justify-center text-slate-600 text-sm">
        Select a patient from the triage queue to examine clinical notes.
      </main>
    );
  }

  const { encounter, priority, triage_score, priority_reasons, soap_note, bmi, bmi_category } = record;
  const v = encounter.vitals;

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* Patient Header Block */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TriageBadge priority={priority} score={triage_score} size="md" />
            <span className="text-xs font-mono text-slate-400">ID: {encounter.id}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Acuity: {triage_score} / 100
            </span>
            {encounter.synced_from_offline && (
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded">
                OFFLINE SYNCED
              </span>
            )}
          </div>
                {/* Checked Symptoms Chips Bar */}
      {encounter.symptoms && encounter.symptoms.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
            Checked Symptoms ({encounter.chief_complaint || "Acute presentation"})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {encounter.symptoms.map((s, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full font-medium"
              >
                ⚠️ {s}
              </span>
            ))}
          </div>
        </div>
      )}

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {encounter.patient_name} <span className="text-slate-400 text-base font-normal">({encounter.age} yrs, {encounter.gender})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            📍 Address: <span className="text-slate-300 font-medium">{encounter.address || "Field Location"}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5" suppressHydrationWarning>
            Recorded: {new Date(encounter.created_at).toLocaleString()} by {encounter.submitted_by_name || "Field Worker"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition"
            >
              📋 Generate Doctor Report
            </button>
          )}
          <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-cyan-400 font-mono">
            HL7 / FHIR R4 Ready
          </span>
        </div>
      </div>

      {/* Biometrics & Vitals Quick Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Heart Rate</span>
          <span className="text-base font-bold text-white">{v.heart_rate ?? "--"} bpm</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Blood Pressure</span>
          <span className="text-base font-bold text-white">{v.systolic_bp ? `${v.systolic_bp}/${v.diastolic_bp ?? "--"}` : "--"}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">SpO2 Oxygen</span>
          <span className="text-base font-bold text-cyan-400">{v.spo2 ? `${v.spo2}%` : "--"}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Height / Weight</span>
          <span className="text-sm font-semibold text-slate-200">
            {encounter.height_cm ? `${encounter.height_cm}cm` : "--"} / {encounter.weight_kg ? `${encounter.weight_kg}kg` : "--"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Calculated BMI</span>
          <span className="text-sm font-bold text-amber-300">
            {bmi ? `${bmi} (${bmi_category})` : "N/A"}
          </span>
        </div>
      </div>

      {/* Wound Inspection Card */}
      {encounter.wound_image_base64 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
            Attached Point-of-Care Wound / Injury Image
          </h3>
          <div className="flex items-start gap-4">
            <img
              src={encounter.wound_image_base64}
              alt="Patient Injury"
              className="w-48 h-32 object-cover rounded-lg border border-slate-700 shadow"
            />
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-semibold block mb-1">Visual Trauma Record</span>
              <p>Uploaded from edge mobile client for immediate physician inspection prior to arrival.</p>
            </div>
          </div>
        </div>
      )}

      {/* Deterministic WHO Protocol Reasons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
          Deterministic Clinical Rule Matches
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {priority_reasons.map((reason, idx) => (
            <li key={idx} className={priority === "RED" ? "text-red-400 font-medium" : "text-amber-300"}>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Structured SOAP Notes 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SOAPSection title="Subjective" badge="Scribe Dialogue" content={soap_note.subjective} />
        <SOAPSection title="Objective" badge="Point-of-Care Vitals" content={soap_note.objective} />
        <SOAPSection title="Assessment" badge="Triage Classification" content={soap_note.assessment} />
        <SOAPSection title="Plan" badge="Clinical Actions" content={soap_note.plan} />
      </div>
    </main>
  );
};