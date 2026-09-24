import React from "react";

interface Props {
  title: string;
  badge: string;
  content: string;
}

export const SOAPSection: React.FC<Props> = ({ title, badge, content }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h4>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      </div>
      <p className="text-xs lg:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed flex-1">
        {content}
      </p>
    </div>
  );
};