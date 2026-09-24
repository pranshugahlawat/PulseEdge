"use client";
import React, { useState, useEffect } from "react";
import { useTriage } from "../hooks/useTriage";
import { TriageHeader, UserProfile } from "../components/TriageHeader";
import { TriageQueue } from "../components/TriageQueue";
import { ClinicalViewer } from "../components/ClinicalViewer";
import { LoginModal } from "../components/LoginModal";
import { DoctorReportModal } from "../components/DoctorReportModal";

export default function DashboardPage() {
  const { records, selectedRecord, setSelectedRecord, isConnected } = useTriage();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pulseedge_user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pulseedge_user");
    setCurrentUser(null);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem("pulseedge_user", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <TriageHeader
        isConnected={isConnected}
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />

      <div className="flex flex-1 overflow-hidden">
        <TriageQueue
          records={records}
          selectedId={selectedRecord?.encounter.id}
          onSelect={setSelectedRecord}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ClinicalViewer
            record={selectedRecord}
            onOpenReport={() => setShowReport(true)}
          />
        </div>
      </div>

      {authChecked && !currentUser && (
        <LoginModal onLoginSuccess={(u) => setCurrentUser(u)} />
      )}

      {showReport && selectedRecord && (
        <DoctorReportModal
          record={selectedRecord}
          doctor={currentUser}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}