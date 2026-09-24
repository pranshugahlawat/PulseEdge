import React from "react";
import { EvaluatedEncounter } from "../types/triage";
import { TriageCard } from "./TriageCard";

interface Props {
  records: EvaluatedEncounter[];
  selectedId: string | undefined;
  onSelect: (record: EvaluatedEncounter) => void;
}

export const TriageQueue: React.FC<Props> = ({ records, selectedId, onSelect }) => {
  return (
    <aside className="w-80 lg:w-96 border-r border-slate-800 flex flex-col h-full bg-slate-950">
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Patient Triage Queue</span>
        <span className="text-[11px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full">{records.length} Intake</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-xs">Waiting for incoming triage packets...</div>
        ) : (
          records.map((r) => (
            <TriageCard
              key={r.encounter.id}
              data={r}
              isSelected={r.encounter.id === selectedId}
              onSelect={() => onSelect(r)}
            />
          ))
        )}
      </div>
    </aside>
  );
};