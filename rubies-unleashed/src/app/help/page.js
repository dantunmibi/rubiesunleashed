/**
 * ================================================================
 * HELP & SUPPORT CENTER
 * ================================================================
 * 
 * Purpose:
 * - "Solve My Problem" hub for users
 * - Self-service documentation and FAQs
 * - Reduces load on direct contact channels
 * 
 * Structure:
 * - Hero: Search & Welcome
 * - Quick Categories: Grid of common topic areas
 * - FAQs: Accordion style detailed answers
 * - CTA: Fallback to Contact page
 * ================================================================
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { 
  Search, ChevronDown, ChevronUp, 
  Download, Shield, User, Zap, 
  HelpCircle, MessageCircle, Bug
} from "lucide-react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: <Download size={24} className="text-cyan-400" />,
      title: "Download & Install",
      desc: "Issues with APKs, ZIPs, or installation errors."
    },
    {
      icon: <User size={24} className="text-ruby" />,
      title: "Account & Guest",
      desc: "Managing your guest session, wishlist, and settings."
    },
    {
      icon: <Zap size={24} className="text-amber-400" />,
      title: "Publishing",
      desc: "How to submit your game to the Vault."
    },
    {
      icon: <Shield size={24} className="text-emerald-400" />,
      title: "Safety & Privacy",
      desc: "Content warnings, virus checks, and data policies."
    }
  ];

  const faqs = [
    {
      question: "Why can't I install an Android (APK) game?",
      answer: "Android devices block apps from unknown sources by default. Go to Settings > Security > Install Unknown Apps and allow your browser to install the file. All files on Rubies Unleashed are scanned, but proceed at your own discretion."
    },
    {
      question: "Do I need an account to use the Wishlist?",
      answer: "No! We use a 'Guest Session' system. Your wishlist is saved to your browser automatically. However, if you clear your browser cache, you may lose your list. Real accounts are coming soon!"
    },
    {
      question: "How do I submit my game?",
      answer: "We are always hunting for hidden gems. Go to the 'Publish' page (link in navbar) to fill out our submission form. Our team reviews every submission manually."
    },
    {
      question: "Is Rubies Unleashed free?",
      answer: "Yes. Using the platform to find games is completely free. Most games listed here are free-to-play indie titles, though some developers may have paid versions on their own sites."
    },
    {
      question: "I found a bug or broken link. What do I do?",
      answer: "Please report it! You can use the 'Contact Us' page and select 'Report a Bug' as the subject. Include the game title and what went wrong."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-6 font-bold text-sm text-ruby uppercase tracking-wider">
              <HelpCircle size={14} />
              <span>Support Center</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
              How can we <span className="text-ruby">help</span> you?
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-0 bg-ruby/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-ruby transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for answers (e.g., 'install', 'account')..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-[#161b2c] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-all shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="grid md:grid-cols-2 gap-4 mb-20">
            {categories.map((cat, i) => (
              <div key={i} className="bg-surface/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:border-ruby/30 transition-all group cursor-default">
                <div className="mb-4 w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="mb-20">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <MessageCircle className="text-ruby" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="bg-surface/30 border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-bold text-slate-200">{faq.question}</span>
                      {openFaq === i ? <ChevronUp className="text-ruby" /> : <ChevronDown className="text-slate-500" />}
                    </button>
                    
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                        openFaq === i ? "max-h-48 opacity-100 pb-6" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-slate-400 leading-relaxed text-sm border-t border-white/5 pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No answers found for "{searchQuery}". Try a different keyword.
                </div>
              )}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-linear-to-br from-ruby/10 to-[#161b2c] border border-ruby/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ruby/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <Bug size={32} className="text-ruby mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                Still stuck? Let's solve it.
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                If you couldn't find the answer above, our team is ready to help you directly.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-ruby hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(224,17,95,0.4)] transform hover:-translate-y-1"
              >
                Contact Support
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}