import React from "react";
import { TriagePriority } from "../types/triage";

interface Props {
  priority: TriagePriority;
  score?: number;
  size?: "sm" | "md";
}

export const TriageBadge: React.FC<Props> = ({ priority, score, size = "sm" }) => {
  const styles = {
    RED: "bg-red-600/90 text-white border-red-500",
    YELLOW: "bg-amber-500/90 text-black border-amber-400 font-semibold",
    GREEN: "bg-emerald-600/90 text-white border-emerald-500",
  };

  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <div className="inline-flex items-center gap-1.5 font-mono">
      <span className={`inline-flex items-center uppercase tracking-wider rounded border ${styles[priority]} ${pad} ${priority === "RED" ? "animate-pulse" : ""}`}>
        {priority} PRIORITY
      </span>
      {score !== undefined && (
        <span className={`rounded px-1.5 py-0.5 font-bold border text-[10px] ${
          score >= 75 ? "bg-red-950 text-red-300 border-red-800" :
          score >= 40 ? "bg-amber-950 text-amber-300 border-amber-800" :
          "bg-emerald-950 text-emerald-300 border-emerald-800"
        }`}>
          {score}/100
        </span>
      )}
    </div>
  );
};