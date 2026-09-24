"use client";
import React, { useState } from "react";

interface Props {
  onLoginSuccess: (user: { name: string; phone: string; role: string }) => void;
}

export const LoginModal: React.FC<Props> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("123456");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (res.ok) {
        setDevHint(data.dev_hint_otp || "123456");
        setStep("OTP");
      } else {
        setError(data.detail || "Failed to request OTP");
      }
    } catch {
      setError("Cannot reach auth server. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          role: "DOCTOR",
          name: "Dr. A. Sharma (Medical Officer)",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("pulseedge_user", JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        setError(data.detail || "Invalid OTP code");
      }
    } catch {
      setError("Authentication network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🩺</span>
          </div>
          <h2 className="text-lg font-bold text-white">Medical Officer Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">PulseEdge Clinic Command Board Staff Access</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition"
            >
              {loading ? "Sending..." : "Request Access OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-300 font-medium">Enter 6-Digit OTP</label>
                <span className="text-[10px] text-cyan-400 font-mono">Demo OTP: {devHint}</span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-center tracking-widest text-lg text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                Code sent to +91 {phone}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition"
            >
              {loading ? "Verifying..." : "Verify & Access Dashboard ✓"}
            </button>
            <button
              type="button"
              onClick={() => setStep("PHONE")}
              className="w-full text-slate-400 hover:text-white text-xs py-1"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};