"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Password validation (matching signup requirements)
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pwd)) return "Must contain at least one number.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Already submitting, ignoring duplicate request');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('🔐 Starting password update...');

    // Client-side validation
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Create timeout promise (10 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000)
      );

      // Race between update and timeout
      const updatePromise = supabase.auth.updateUser({ password });

      const { error: updateError } = await Promise.race([updatePromise, timeoutPromise]);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Password updated successfully');
      setSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      console.error("❌ Password Update Failed:", err);
      
      let errorMessage = "Failed to update password. ";
      
      if (err.message?.includes('timeout')) {
        errorMessage = "Request timed out. Your reset link may have expired. Please request a new one.";
      } else if (err.message?.includes('session') || err.message?.includes('JWT')) {
        errorMessage = "Your reset link has expired. Please request a new one.";
      } else if (err.message?.includes('same password')) {
        errorMessage = "New password cannot be the same as your old password.";
      } else {
        errorMessage += err.message || "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const score = [hasLength, hasUpper, hasNumber].filter(Boolean).length;
    
    if (score === 3) return { label: "Strong", color: "text-emerald-400" };
    if (score === 2) return { label: "Medium", color: "text-amber-400" };
    return { label: "Weak", color: "text-red-400" };
  };

  const strength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="text-center space-y-4 relative z-10">
          <CheckCircle size={64} className="mx-auto text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Password Updated!</h2>
          <p className="text-slate-400 text-sm">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Back Button */}
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group z-50"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Form Container */}
      <div className="relative w-full max-w-md bg-[#161b2c] border border-violet-500/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-violet-500 to-transparent" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
            New <span className="text-violet-400">Password</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Enter a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              New Password
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
            {strength && (
              <p className={`text-xs mt-2 font-bold ${strength.color}`}>
                Strength: {strength.label}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-[#0b0f19] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-slate-500 space-y-1">
            <p className={password.length >= 8 ? "text-emerald-400" : ""}>
              • At least 8 characters
            </p>
            <p className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>
              • At least one uppercase letter
            </p>
            <p className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>
              • At least one number
            </p>
            <p className={password === confirmPassword && password ? "text-emerald-400" : ""}>
              • Passwords match
            </p>
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
                Updating Password...
              </>
            ) : (
              <>
                <Lock size={20} />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Link expired or not working?
          </p>
          <Link
            href="/forgot-password"
            className="text-xs text-violet-400 hover:underline font-bold"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    </div>
  );
}