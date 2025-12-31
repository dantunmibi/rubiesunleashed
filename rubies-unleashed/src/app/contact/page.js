// app/contact/page.js
"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { Mail, Send, Sparkles, Zap, Target, Gem } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          ...formData,
        }).toString(),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 overflow-x-hidden relative font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-6 font-black text-ruby">
              <Sparkles size={16} />
              <span>GET IN TOUCH</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-linear-to-br from-white via-ruby-light to-ruby bg-clip-text text-transparent">
                JOIN THE HUNT
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Got a legendary game? Questions? Want to partner up? Drop us a message and let's make gaming history! 🎮✨
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-linear-to-br from-ruby to-ruby-dark rounded-xl flex items-center justify-center rotate-3">
                  <Send size={24} className="text-white -rotate-3" />
                </div>
                <h2 className="text-3xl font-black text-white">Send Message</h2>
              </div>

              <form onSubmit={handleSubmit} name="contact" method="POST" data-netlify="true" className="space-y-6">
                <input type="hidden" name="form-name" value="contact" />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-black text-slate-300 mb-2 uppercase tracking-wide"
                    >
                      Your Name 🎯
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background/80 border-2 border-slate-800 focus:border-ruby rounded-xl text-white placeholder-slate-600 transition-all font-medium focus:outline-none"
                      placeholder="Hunter Name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-black text-slate-300 mb-2 uppercase tracking-wide"
                    >
                      Email Address 📧
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-background/80 border-2 border-slate-800 focus:border-ruby rounded-xl text-white placeholder-slate-600 transition-all font-medium focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-black text-slate-300 mb-2 uppercase tracking-wide"
                  >
                    Subject 💎
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-background/80 border-2 border-slate-800 focus:border-ruby rounded-xl text-white placeholder-slate-600 transition-all font-medium focus:outline-none"
                    placeholder="What's the treasure?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-black text-slate-300 mb-2 uppercase tracking-wide"
                  >
                    Your Message 📜
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-background/80 border-2 border-slate-800 focus:border-ruby rounded-xl text-white placeholder-slate-600 transition-all font-medium resize-none focus:outline-none"
                    placeholder="Tell us about your legendary game or inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-ruby to-ruby-dark hover:from-ruby-light hover:to-ruby text-white font-black py-5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-ruby/20 text-lg uppercase tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Launch Message
                    </>
                  )}
                </button>
              </form>

              {status === "success" && (
                <div className="mt-6 p-5 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl text-emerald-300 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                  <Sparkles size={20} />
                  Message sent! We'll get back to you faster than a speedrun! 🚀
                </div>
              )}

              {status === "error" && (
                <div className="mt-6 p-5 bg-red-500/10 border-2 border-red-500/50 rounded-xl text-red-300 font-bold flex items-center gap-3">
                  ⚠️ Oops! Something went wrong. Try again or email us directly!
                </div>
              )}
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Direct Email */}
              <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-ruby/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-ruby to-ruby-dark rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform">
                    <Mail size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-3">Direct Line</h3>
                    <a
                      href="mailto:doluwatunmibi@gmail.com"
                      className="text-ruby-light hover:text-ruby transition-colors font-bold break-all text-lg"
                    >
                      doluwatunmibi@gmail.com
                    </a>
                    <p className="text-slate-500 mt-3 font-medium text-sm">
                      Response time: 24-48 hours ⚡
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Gem size={24} className="text-ruby" />
                  Why Rubies?
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <span className="text-2xl">💎</span>
                    <span>Curated marketplace for rising games</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <span className="text-2xl">⚡</span>
                    <span>Lightning-fast publishing process</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <span className="text-2xl">🎯</span>
                    <span>Direct connection to treasure hunters</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <span className="text-2xl">🏆</span>
                    <span>Competitive rewards & recognition</span>
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Target size={24} className="text-ruby" />
                  Quick Access
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://forms.gle/i7X2sUJ5cnqsUciA6"
                    className="block px-5 py-3 bg-background/60 hover:bg-ruby/10 border border-slate-800 hover:border-ruby/50 rounded-lg transition-all font-bold text-slate-300 hover:text-white"
                  >
                    📜 Submit Your Game
                  </a>
                  <a
                    href="/developers"
                    className="block px-5 py-3 bg-background/60 hover:bg-ruby/10 border border-slate-800 hover:border-ruby/50 rounded-lg transition-all font-bold text-slate-300 hover:text-white"
                  >
                    ⚔️ Developer Portal
                  </a>
                  <a
                    href="https://rubyapks.blogspot.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-3 bg-background/60 hover:bg-ruby/10 border border-slate-800 hover:border-ruby/50 rounded-lg transition-all font-bold text-slate-300 hover:text-white"
                  >
                    🌐 Visit RubyApks
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}