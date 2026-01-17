/**
 * ================================================================
 * FORGOT PASSWORD PAGE - Password Recovery Trigger
 * ================================================================
 * 
 * Logic:
 * - User enters email
 * - Supabase sends magic link to reset password
 * - Redirects to /reset-password with token
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      console.error("Password Reset Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Back Button */}
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Form Container */}
      <div className="relative w-full max-w-md bg-[#161b2c] border border-violet-500/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-violet-500 to-transparent" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
            Reset <span className="text-violet-400">Access</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle size={64} className="mx-auto text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Check Your Email</h2>
            <p className="text-slate-400 text-sm">
              We've sent a password reset link to <span className="text-white font-bold">{email}</span>
            </p>
            <p className="text-slate-500 text-xs">
              If you don't see it, check your spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}