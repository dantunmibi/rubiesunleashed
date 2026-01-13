/**
 * ================================================================
 * SIGNUP PAGE - User Registration (Supabase Integrated)
 * ================================================================
 * 
 * Features:
 * - Email verification with OTP
 * - Resend verification email with 60s cooldown
 * - Real-time username availability check
 * - Password strength validation
 * - Toast notifications for feedback
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Check, X, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ✅ NEW: Resend Email States
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // ✅ DEBOUNCED USERNAME VALIDATION
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .maybeSingle();

      setUsernameAvailable(!data);
      setIsCheckingUsername(false);
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // ✅ NEW: Cooldown Timer Effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pwd)) return "Must contain at least one number.";
    return "";
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (val) setPasswordError(validatePassword(val));
    else setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
        
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (signUpError) throw signUpError;

      if (data?.session) {
        router.push("/initialize");
      } else {
        // ✅ User needs to verify email
        setNeedsVerification(true);
        setResendCooldown(60); // Start 60s cooldown
        showToast("Verification email sent! Check your inbox.", "success");
      }
    } catch (err) {
      console.error("Signup Error:", err.message);
      
      if (err.message.includes('duplicate key') || err.message.includes('username')) {
        setError("That username is already taken. Please choose another.");
      } else if (err.message.includes('rate limit')) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Resend Verification Email Handler
  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;
    
    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResendCooldown(60); // Reset cooldown
      showToast("Verification email resent successfully!", "success");
    } catch (err) {
      console.error("Resend Error:", err);
      setError(err.message || "Failed to resend email. Please try again.");
      showToast("Failed to resend email", "error");
    } finally {
      setIsResending(false);
    }
  };

  // ✅ OTP Verification Handler
  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      showToast("Email verified! Setting up your account...", "success");
      router.push("/initialize");
    } catch (err) {
      setError(err.message);
      showToast("Invalid verification code", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFICATION VIEW (Enhanced with Resend Button)
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ruby/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative w-full max-w-md bg-[#161b2c] border border-ruby/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(224,17,95,0.15)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-ruby to-transparent" />

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-ruby/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-ruby" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 text-sm">
              We sent a verification code to<br />
              <strong className="text-white">{email}</strong>
            </p>
          </div>
           
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-4 text-center text-white text-3xl tracking-[0.5em] font-bold focus:border-ruby/50 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-ruby text-white font-black uppercase tracking-widest py-4 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(224,17,95,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Verify Email
                </>
              )}
            </button>
          </form>

          {/* ✅ NEW: Resend Email Section */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs mb-3">Didn't receive the code?</p>
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isResending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw size={16} />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend Email
                </>
              )}
            </button>
          </div>

          {/* Back to Signup Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setNeedsVerification(false)}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              ← Back to Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SIGNUP FORM (Unchanged, keeping your existing UI)
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ruby/10 blur-[120px] rounded-full" />
      </div>

      {/* Back Button */}
      <Link
        href="/explore"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Signup Form */}
      <div className="relative w-full max-w-md bg-[#161b2c] border border-ruby/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(224,17,95,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-ruby to-transparent" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
            Join The <span className="text-ruby">Vault</span>
          </h1>
          <p className="text-slate-400 text-sm">Create your account and start collecting</p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
              Username
              {isCheckingUsername ? (
                <span className="text-slate-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Checking...</span>
              ) : usernameAvailable === true ? (
                <span className="text-emerald-400 flex items-center gap-1"><Check size={10} /> Available</span>
              ) : usernameAvailable === false ? (
                <span className="text-red-400 flex items-center gap-1"><X size={10} /> Taken</span>
              ) : null}
            </label>
            <div className="relative">
              <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${usernameAvailable === false ? "text-red-500" : usernameAvailable === true ? "text-emerald-500" : "text-slate-500"}`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '_'))}
                placeholder="RubyHunter_42"
                required
                className={`w-full bg-[#0b0f19] border rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:outline-none transition-colors 
                  ${usernameAvailable === false ? "border-red-500/50 focus:border-red-500" : 
                    usernameAvailable === true ? "border-emerald-500/50 focus:border-emerald-500" : 
                    "border-white/10 focus:border-ruby/50"}`}
              />
            </div>
          </div>

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
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:border-ruby/50 focus:outline-none transition-colors"
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
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                className={`w-full bg-[#0b0f19] border rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none transition-colors ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-ruby/50'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-[10px] mt-2 font-bold ml-1">{passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || usernameAvailable === false}
            className="w-full bg-ruby text-white font-black uppercase tracking-widest py-4 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(224,17,95,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-ruby hover:underline font-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}