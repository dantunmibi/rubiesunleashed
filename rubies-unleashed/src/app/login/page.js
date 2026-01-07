/**
 * ================================================================
 * LOGIN PAGE - User Authentication (Supabase Integrated)
 * ================================================================
 * 
 * Logic:
 * - Authenticates via Supabase.
 * - Redirects to /explore (or /initialize if profile incomplete).
 * - Theme: Phantom (Violet) for security context.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // ✅ New State

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // AuthProvider handles global state update
      // We push to explore, but AuthProvider might intercept to /initialize if needed
      router.push("/");

    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message === "Invalid login credentials" 
        ? "Incorrect email or password." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      {/* Background Effects (Violet for Security/Phantom) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Back Button */}
      <Link
        href="/explore"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Login Form */}
      <div className="relative w-full max-w-md bg-[#161b2c] border border-violet-500/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-violet-500 to-transparent" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
            Access The <span className="text-violet-400">Vault</span>
          </h1>
          <p className="text-slate-400 text-sm">Identify yourself to proceed</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email
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

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"} // ✅ Dynamic Type
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-colors"
              />
              {/* ✅ Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                Authenticating...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Access Terminal
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-slate-500">
            Need an identity?{" "}
            <Link href="/signup" className="text-violet-400 hover:underline font-bold">
              Initialize Protocol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}