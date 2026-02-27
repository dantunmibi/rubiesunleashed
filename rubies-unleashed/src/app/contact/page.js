/**
 * ================================================================
 * CONTACT PAGE - Decluttered Edition
 * ================================================================
 * Changes:
 * - Reduced sidebar from 6 cards to 3 (Email, Quick Links, Support Topics)
 * - Removed "Follow Us" card (social links stay in footer)
 * - Removed redundant "Platform Overview" and "Community" cards
 * - Cleaner visual hierarchy
 */

"use client";

import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Mail,
  Send,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Briefcase,
  ChevronRight,
  Wrench,
  Users,
  Shield,
  AlertTriangle, 
  CheckCircle,
  Zap
} from "lucide-react";
import { useToastContext } from "@/components/providers/ToastProvider";

function ContactFormLogic() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const defaultSubject = searchParams.get('subject') || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: defaultSubject,
    message: "",
  });
  
  // [Keep your existing useEffect for claim requests - no changes]
  useEffect(() => {
    const subj = searchParams.get('subject');
    const isClaimRequest = subj && subj.includes('Claim Request:');
    
    let autoMessage = "";
    let dropdownSubject = "";
    
    if (isClaimRequest) {
      dropdownSubject = "Claim Request";
      const gameInfo = subj.replace('Claim Request:', '').trim();
      const username = profile?.username || user?.user_metadata?.username || "";
      const developerName = profile?.developer_name || profile?.display_name || "";
      
      if (user) {
        autoMessage = `Hello,

I would like to claim this game listing: ${gameInfo}

USERNAME: ${username}${developerName ? `\nDEVELOPER NAME: ${developerName}` : ''}
PROFILE LINK: https://rubiesunleashed.app/${username}

PROOF OF OWNERSHIP: 
[Please describe how you can prove this is your game. For example:
- Link to your developer profile on other platforms
- Original source code repository
- Social media accounts showing development
- Build files or internal documentation
- Other verification methods]

Additional Information:
[Any other details you'd like to share]

Thank you!`;
      } else {
        autoMessage = `Hello,

I would like to claim this game listing: ${gameInfo}

⚠️ IMPORTANT: Please log in to your account before submitting this claim.
This helps us verify your identity and speeds up the approval process.

If you don't have an account yet, please sign up at:
https://rubiesunleashed.app/signup

USERNAME (after login): [Will be auto-filled when you log in]

PROOF OF OWNERSHIP: 
[Please describe how you can prove this is your game]

Thank you!`;
      }
    } else {
      dropdownSubject = subj || "";
    }
    
    setFormData(prev => ({ 
      ...prev, 
      subject: dropdownSubject,
      message: autoMessage || prev.message
    }));
  }, [searchParams, user, profile]);

  const [status, setStatus] = useState("idle");
  const { showToast } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          ...formData,
        }).toString(),
      });

      if (response.ok) {
        setStatus("success");
        showToast("Message sent successfully! We'll be in touch.", "success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        console.error("Form submission failed:", response.statusText);
        setStatus("error");
        showToast("Unable to send message. Please try again.", "error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setStatus("error");
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      {/* Contact Form - Left Side (3/5 width) */}
      <div className="lg:col-span-3 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
          <div className="w-12 h-12 bg-linear-to-br from-ruby to-ruby-dark rounded-xl flex items-center justify-center shadow-lg shadow-ruby/20">
            <Send size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Send a Message
            </h2>
            <p className="text-slate-400 text-sm">
              We typically respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Auth Status Banner */}
        {formData.subject === "Claim Request" && (
          <div className={`mb-6 p-4 rounded-xl border ${
            user 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            {user ? (
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400 mb-1">
                    Authenticated Claim
                  </h4>
                  <p className="text-xs text-slate-300">
                    Submitting as: <strong>{profile?.username || user?.user_metadata?.username}</strong>
                    {profile?.developer_name && ` (${profile.developer_name})`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your account info has been pre-filled for faster verification.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-400 mb-1">
                    Login Recommended
                  </h4>
                  <p className="text-xs text-slate-300 mb-2">
                    Please log in to auto-verify your identity and speed up the claim process.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/login?redirect=/contact?subject=${encodeURIComponent(formData.subject)}`}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href={`/signup?redirect=/contact?subject=${encodeURIComponent(formData.subject)}`}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="form-name" value="contact" />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-background/60 border border-slate-700 focus:border-ruby rounded-lg text-white placeholder-slate-600 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-ruby/50"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-background/60 border border-slate-700 focus:border-ruby rounded-lg text-white placeholder-slate-600 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-ruby/50"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-background/60 border border-slate-700 focus:border-ruby rounded-lg text-white transition-all font-medium focus:outline-none focus:ring-1 focus:ring-ruby/50"
            >
              <option value="">Select a topic...</option>
              <option value="Claim Request">Claim Request</option>
              <option value="Creator Support">Creator Support - The Forge</option>
              <option value="Publishing Inquiry">Publishing Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Partnership">Partnership Opportunity</option>
              <option value="Content Report">Content Report</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={12}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-background/60 border border-slate-700 focus:border-ruby rounded-lg text-white placeholder-slate-600 transition-all font-medium resize-y focus:outline-none focus:ring-1 focus:ring-ruby/50 min-h-50"
              placeholder="How can we help you today?"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-ruby to-ruby-dark hover:from-ruby-light hover:to-ruby text-white font-bold py-4 rounded-lg transition-all transform hover:translate-y-0.5 shadow-lg shadow-ruby/20 text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit Request
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {status === "success" && (
          <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles size={20} />
            <span>Thank you. Your message has been sent successfully.</span>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 p-5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-medium flex items-center gap-3">
            <span>Unable to send message. Please try again or email us directly.</span>
          </div>
        )}
      </div>

      {/* Sidebar - Right Side (2/5 width) - SIMPLIFIED */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* 1. Direct Email (Most Important) */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-ruby/30 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
              <Mail size={24} className="text-ruby" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Email Support
              </h3>
              <a
                href="mailto:officialrubiesunleashed@gmail.com"
                className="text-slate-300 hover:text-white transition-colors font-medium break-all text-sm"
              >
                officialrubiesunleashed@gmail.com
              </a>
              <p className="text-slate-500 mt-2 text-xs">
                For urgent inquiries and direct assistance.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Quick Links (Consolidated) */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap size={20} className="text-cyan-400" />
            Quick Links
          </h3>
          <div className="space-y-3">
            <Link
              href="/publish"
              className="flex items-center justify-between px-5 py-3 bg-background/60 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/50 rounded-lg transition-all text-sm font-bold text-slate-300 hover:text-white group"
            >
              <span>🔨 Start Publishing</span>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
            
            <Link
              href="/help"
              className="flex items-center justify-between px-5 py-3 bg-background/60 hover:bg-ruby/10 border border-slate-800 hover:border-ruby/50 rounded-lg transition-all text-sm font-bold text-slate-300 hover:text-white group"
            >
              <span>📚 Help Center</span>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-ruby transition-colors" />
            </Link>
            
            <Link
              href="/status"
              className="flex items-center justify-between px-5 py-3 bg-background/60 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/50 rounded-lg transition-all text-sm font-bold text-slate-300 hover:text-white group"
            >
              <span>⚡ Platform Status</span>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </Link>

            <Link
              href="/about"
              className="flex items-center justify-between px-5 py-3 bg-background/60 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/50 rounded-lg transition-all text-sm font-bold text-slate-300 hover:text-white group"
            >
              <span>💎 About Us</span>
              <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* 3. Support Topics (What to Expect) */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle size={20} className="text-ruby" />
            We Can Help With
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Wrench size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">Creator Support</p>
                <p className="text-slate-400 text-xs">Publishing, dashboards, asset uploads</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users size={16} className="text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">Account Issues</p>
                <p className="text-slate-400 text-xs">Login problems, wishlists, profiles</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">Content Reports</p>
                <p className="text-slate-400 text-xs">Broken links, inappropriate content</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Briefcase size={16} className="text-ruby mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">Partnerships</p>
                <p className="text-slate-400 text-xs">Collaborations, sponsorships, media</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 overflow-x-hidden relative font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-6 font-bold text-sm text-ruby uppercase tracking-wider">
              <MessageSquare size={14} />
              <span>Contact & Support</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-linear-to-br from-white via-ruby-light to-ruby bg-clip-text text-transparent">
                GET IN TOUCH
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Whether you're a creator publishing on <strong className="text-white">The Forge</strong>, 
              a player with technical questions, or a partner exploring opportunities
              we're here to help you succeed.
            </p>
          </div>

          <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-500">Loading form...</div>}>
            <ContactFormLogic />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}