"use client";

import { useState } from "react";
import { X, Flag, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider"; // Just for user ID

export default function ReportModal({ game, onClose }) {
  const { user } = useAuth();
  
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!game || !game.id) return null;

  const handleSubmit = async () => {
    if (!issueType) return;
    setLoading(true);

    try {
      // ✅ SEND TO OUR API ROUTE (Bypasses Supabase Client issues)
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          user_id: user?.id || null,
          issue_type: issueType,
          description: description
        })
      });

      if (!response.ok) {
        throw new Error('Server rejected report');
      }

      setSuccess(true);
      setTimeout(onClose, 2000);
      
    } catch (err) {
      console.error("Report Failed:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reasons = [
    "Broken Download Link",
    "Wrong Version / Outdated",
    "Malware / Security Risk",
    "Incorrect Information",
    "Other"
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-600 to-transparent opacity-80" />
        
        {success ? (
          <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Check size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Report Received</h3>
            <p className="text-slate-400 text-sm">Our Architects will investigate immediately.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                <Flag size={20} className="text-red-500" /> Report Issue
              </h3>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Issue Type</p>
                <div className="grid grid-cols-1 gap-2">
                  {reasons.map(r => (
                    <button
                      key={r}
                      onClick={() => setIssueType(r)}
                      className={`text-left px-4 py-3.5 rounded-xl border text-sm font-bold transition-all ${
                        issueType === r 
                          ? "bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                          : "bg-black/20 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Details (Optional)</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:border-red-500/50 focus:outline-none h-28 resize-none transition-colors"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!issueType || loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(224,17,95,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}