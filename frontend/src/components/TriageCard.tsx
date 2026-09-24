import React from "react";
import { EvaluatedEncounter } from "../types/triage";
import { TriageBadge } from "./TriageBadge";

interface Props {
  data: EvaluatedEncounter;
  isSelected: boolean;
  onSelect: () => void;
}

export const TriageCard: React.FC<Props> = ({ data, isSelected, onSelect }) => {
  const { encounter, priority, triage_score } = data;

  const barColor =
    triage_score >= 75 ? "bg-red-500" :
    triage_score >= 40 ? "bg-amber-500" :
    "bg-emerald-500";

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-cyan-500 bg-slate-900 shadow-md ring-1 ring-cyan-500/20"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
      }`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-semibold text-slate-200 text-sm">
          {encounter.patient_name}{" "}
          <span className="text-slate-500 text-xs font-normal">
            ({encounter.age}y, {encounter.gender})
          </span>
        </h4>
        <TriageBadge priority={priority} score={triage_score} />
      </div>

      {/* Acuity Progress Bar */}
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden my-2">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${triage_score}%` }}
        />
      </div>

      <p className="text-xs text-slate-400 italic line-clamp-1 mb-2">
        "{encounter.raw_transcript}"
      </p>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
        <span>HR: <strong className="text-slate-200">{encounter.vitals.heart_rate ?? "--"}</strong></span>
        <span>SpO2: <strong className="text-slate-200">{encounter.vitals.spo2 ? `${encounter.vitals.spo2}%` : "--"}</strong></span>
        <span>BP: <strong className="text-slate-200">{encounter.vitals.systolic_bp ? `${encounter.vitals.systolic_bp}/${encounter.vitals.diastolic_bp ?? "--"}` : "--"}</strong></span>
      </div>
    </div>
  );
};