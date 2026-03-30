/**
 * ================================================================
 * LOGIN PAGE - User Authentication (Supabase Integrated)
 * ================================================================
 *
 * Logic:
 * - Authenticates via Supabase.
 * - Cache-first redirect decision (ruby_profile localStorage).
 * - Only fetches 'archetype' from DB on cache miss.
 * - Two button states: idle → signing in (spinner).
 * - Curtain drops on success — holds until new page takes over.
 * - setLoading(false) ONLY fires on error path.
 * - Theme: Phantom (Violet) for security context.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LogIn,
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ----------------------------------------------------------------
// VAULT CURTAIN
// Full screen takeover after successful auth.
// Just the logo — no text, no animation, no ceremony.
// Unmounts naturally when the new page takes over.
// ----------------------------------------------------------------
function VaultCurtain({ stalled }) {
  return (
    <div className="fixed inset-0 z-100 bg-[#0b0f19] flex flex-col items-center justify-center">
      {/* Outer pulse ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full border border-violet-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute w-24 h-24 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />

        {/* Logo container with glow */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.15)' }}
        >
          <Image
            src="/ru-logo.png"
            alt="Rubies Unleashed"
            width={80}
            height={80}
            className="opacity-95"
            priority
          />
        </div>
      </div>

      {/* Loading bar */}
      <div className="mt-10 w-40 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full"
          style={{
            animation: 'loadbar 1.6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Stall fallback */}
      {stalled && (
        <div className="flex flex-col items-center gap-3 mt-6 animate-in fade-in duration-500">
          <p className="text-sm text-slate-500 font-medium">Taking longer than usual...</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider transition-colors"
          >
            Try Again →
          </button>
        </div>
      )}

      <style>{`
        @keyframes loadbar {
          0% { transform: translateX(-100%); width: 40%; }
          50% { transform: translateX(150%); width: 60%; }
          100% { transform: translateX(300%); width: 40%; }
        }
      `}</style>
    </div>
  );
}

// ----------------------------------------------------------------
// LOGIN PAGE
// ----------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [curtain, setCurtain] = useState(false);   // Fullscreen curtain
  const [stalled, setStalled] = useState(false);   // 4s stall detection
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

      // ✅ Cache-first redirect decision
      // AuthProvider.onAuthStateChange handles full profile fetch
      // We only need archetype to decide: dashboard or /initialize
      const cachedProfile = localStorage.getItem('ruby_profile');
      let destination = '/';

      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          destination = !parsed?.archetype ? '/initialize' : '/';
        } catch {
          // Cache corrupt — fall through to lightweight DB query
          const { data: profile } = await supabase
            .from('profiles')
            .select('archetype')
            .eq('id', data.user.id)
            .single();
          destination = !profile?.archetype ? '/initialize' : '/';
        }
      } else {
        // Cache miss — single minimal query, archetype field only
        const { data: profile } = await supabase
          .from('profiles')
          .select('archetype')
          .eq('id', data.user.id)
          .single();
        destination = !profile?.archetype ? '/initialize' : '/';
      }

      // ✅ Drop the curtain immediately on success
      setCurtain(true);

      // ✅ Stall detection — 4s timeout
      const stallTimer = setTimeout(() => setStalled(true), 4000);

      // ✅ Navigate — curtain holds until new page unmounts this one
      router.push(destination);

      // Cleanup (fires if component somehow stays mounted)
      return () => clearTimeout(stallTimer);

    } catch (err) {
      console.error("Login Error:", err.message);
      setError(
        err.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : err.message
      );
      // ✅ ONLY reset on error path
      setCurtain(false);
      setLoading(false);
    }
    // ✅ No finally block — success path never resets the button
  };

  return (
    <>
      {/* Vault curtain — above everything on success */}
      {curtain && <VaultCurtain stalled={stalled} />}

      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        {/* Background Effects */}
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

        {/* Login Card */}
        <div className="relative w-full max-w-md bg-[#161b2c] border border-violet-500/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-violet-500 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
              Enter The <span className="text-violet-400">Vault</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome back. Your collection is waiting.
            </p>
          </div>

          {/* Error */}
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
                  disabled={loading}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-colors disabled:opacity-50"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit — Two States */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-slate-400 hover:text-violet-400 transition-colors font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-white/5" />

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Don't have an account?{" "}
              <Link href="/signup" className="text-violet-400 hover:underline font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}