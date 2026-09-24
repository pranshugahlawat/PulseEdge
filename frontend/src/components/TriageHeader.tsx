"use client";
import React, { useState } from "react";

export interface UserProfile {
  name: string;
  phone: string;
  role: string;
  department?: string;
}

interface Props {
  isConnected: boolean;
  user?: UserProfile | null;
  onLogout?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const TriageHeader: React.FC<Props> = ({
  isConnected,
  user,
  onLogout,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "Dr. Medical Officer");
  const [editDept, setEditDept] = useState(user?.department || "Emergency Triage Unit");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && onUpdateUser) {
      onUpdateUser({
        ...user,
        name: editName.trim() || user.name,
        department: editDept.trim() || "Emergency Triage Unit",
      });
    }
    setIsEditing(false);
  };

  return (
    <>
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 px-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-950"></span>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-none">
              PulseEdge Command Center
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">
              {user?.department || "Emergency Triage Unit"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold text-slate-100">{user.name}</span>
                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditDept(user.department || "Emergency Triage Unit");
                      setIsEditing(true);
                    }}
                    title="Edit Name & Department"
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    ✏️
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  📱 +91 {user.phone}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[10px] bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 px-2.5 py-1 rounded border border-slate-700 transition"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-rose-500 animate-ping"
              }`}
            />
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded ${
                isConnected
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {isConnected ? "WEBSOCKET LIVE" : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </header>

      {/* Edit Doctor Profile Dialog Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Edit Doctor Profile</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update how your name and title appear on clinical reports.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Full Name & Credentials</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Dr. Maya Sen, MD (Emergency Medicine)"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Hospital / Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  placeholder="e.g. Trauma & Acute Care Unit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};