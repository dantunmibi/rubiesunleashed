"use client";

/* 
  💎 RUBIES UNLEASHED - Help Center (v20.5)
  -----------------------------------------
  - Purpose: Universal Knowledge Base.
  - Updates: Corrected Dev "Claim" & "Update" workflows.
  - Logic: Search overrides filters; Categories scroll to FAQs.
*/

import React, { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Shield,
  User,
  MessageCircle,
  Bug,
  Server,
  Code2,
  Book,
  Activity,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Auto-scroll ref
  const faqSectionRef = useRef(null);

  const scrollToContent = () => {
    setTimeout(() => {
      if (faqSectionRef.current) {
        const yOffset = -120;
        const y =
          faqSectionRef.current.getBoundingClientRect().top +
          window.scrollY +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const handleCategoryClick = (id) => {
    setActiveFilter(id === activeFilter ? "All" : id);
    setSearchQuery("");
    setOpenFaq(null);
    scrollToContent();
  };

  // 💎 DATA: Categories
  const categories = [
    {
      id: "Technical",
      icon: <Download size={24} className="text-cyan-400" />,
      color:
        "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]",
      title: "Installation",
      desc: "Fixes for Android, Windows, Mac & Zip files.",
      action: "filter",
    },
    {
      id: "Account",
      icon: <User size={24} className="text-ruby" />,
      color:
        "group-hover:border-ruby/50 group-hover:shadow-[0_0_30px_rgba(224,17,95,0.2)]",
      title: "Account",
      desc: "Guest mode, Wishlists, and Cloud saves.",
      action: "filter",
    },
    {
      id: "Developers",
      icon: <Code2 size={24} className="text-emerald-400" />,
      color:
        "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      title: "Developers",
      desc: "Submit, Update, or Claim projects.",
      action: "filter",
    },
    {
      id: "Safety",
      icon: <Shield size={24} className="text-amber-400" />,
      color:
        "group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
      title: "Safety",
      desc: "Virus scans and file safety.",
      action: "filter",
    },
    {
      id: "Features",
      icon: <Globe size={24} className="text-violet-400" />,
      color:
        "group-hover:border-violet-500/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
      title: "App Features",
      desc: "How to install this site as an App (PWA).",
      action: "filter",
    },
    {
      id: "Status",
      icon: <Activity size={24} className="text-slate-300" />,
      color:
        "group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]",
      title: "System Status",
      desc: "Check if the website is online.",
      link: "/status",
      action: "link",
    },
  ];

  // 💎 DATA: Detailed Answers
  const faqs = [
    // --- TECHNICAL ---
    {
      category: "Technical",
      question: "Android: 'App not installed' or blocked?",
      answer:
        "Android blocks unknown apps by default. Go to Settings > Security > Install Unknown Apps and allow your browser. If it still fails, uninstall any older version of the game first.",
    },
    {
      category: "Technical",
      question: "Windows: 'Windows protected your PC'?",
      answer:
        "This is normal for indie games. Click 'More Info' then 'Run Anyway'. This happens because indie developers often don't buy expensive security certificates from Microsoft.",
    },
    {
      category: "Technical",
      question: "How do I use a .ZIP or .RAR file?",
      answer:
        "You cannot play a ZIP file directly. You must 'Extract' it first. Right-click the file, select 'Extract All', and open the new folder to find the game file (.exe or .app).",
    },
    {
      category: "Technical",
      question: "The download link is broken.",
      answer:
        "We link to external sites (Itch.io, Drive). If a link stops working, please click 'Report Issue' on the game page or contact us so we can fix it.",
    },
    // --- ACCOUNT ---
    {
      category: "Account",
      question: "Do I need to sign up?",
      answer:
        "No. You are currently using a 'Guest Session'. Your Wishlist is saved to this device automatically. You don't need an email to use the site.",
    },
    {
      category: "Account",
      question: "When can I save my data to the cloud?",
      answer:
        "Real accounts are coming soon in the next update. This will allow you to save your Wishlist and sync it across your phone and computer.",
    },
    // --- DEVELOPERS (UPDATED) ---
    {
      category: "Developers",
      question: "How do I submit my game?",
      answer: (
        <span>
          Submissions are open via our Google Form.{" "}
          <a
            href="/publish"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ruby hover:text-white underline font-bold"
          >
            Click here to submit your project
          </a>
          . We review all entries manually.
        </span>
      ),
    },
    {
      category: "Developers",
      question: "How do I update my game version?",
      answer:
        "Please re-submit the Google Form with the new links and version number, OR use the Contact page to message us directly with your Game Name and the update details.",
    },
    {
      category: "Developers",
      question: "My game is listed. How do I claim it?",
      answer:
        "The 'Claim Protocol' is coming soon (Phase 3). Once active, you will be able to click 'Claim Project' on the game page to request an Architect Account. All claims will be manually verified by our team.",
    },
    {
      category: "Developers",
      question: "Do I need a Developer Account?",
      answer:
        "Not yet. Architect Accounts are currently in development. For now, you can submit and manage your content simply by using the forms and contact channels.",
    },
    // --- SAFETY ---
    {
      category: "Safety",
      question: "Are files safe to download?",
      answer:
        "We manually review submissions and prefer links from trusted sources like Itch.io or Steam. However, as an indie marketplace, we always recommend using an antivirus on your device.",
    },
    // --- FEATURES ---
    {
      category: "Features",
      question: "How do I install this site as an App?",
      answer:
        "Mobile: Tap 'Share' (iOS) or 'Menu' (Android) -> 'Add to Home Screen'. Desktop: Look for the install icon in your browser's address bar.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 💎 SEARCH LOGIC
  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof f.answer === "string" &&
        f.answer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = searchQuery
      ? true
      : activeFilter === "All" || f.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-ruby/30 selection:text-white overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundEffects />
      </div>

      {/* Navbar */}
      <div className="relative z-40">
        <Navbar />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* --- HERO SECTION --- */}
          <div className="text-center mb-16 relative">
            <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter text-white uppercase drop-shadow-2xl">
              Help{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-b from-ruby to-ruby-800">
                Center
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Find answers, fix installation issues, or contact our team.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group z-20">
              <div className="absolute inset-0 bg-ruby/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
              <div className="relative transform transition-transform duration-300 group-focus-within:scale-105">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-ruby transition-colors"
                  size={24}
                />
                <input
                  type="text"
                  placeholder="Search for help (e.g. 'Install', 'Claim', 'Zip')..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setOpenFaq(null);
                      scrollToContent();
                    }
                  }}
                  className="w-full pl-16 pr-6 py-5 bg-[#161b2c]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-lg text-white placeholder-slate-500 focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-all shadow-[0_0_60px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* --- CATEGORY GRID --- */}
          {/* Fades out slightly when searching */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 transition-all duration-500 ${
              searchQuery ? "opacity-50 grayscale scale-95" : "opacity-100"
            }`}
          >
            {categories.map((cat, i) => {
              const CardContent = (
                <>
                  <div className="mb-6 w-14 h-14 rounded-2xl bg-[#0b0f19] flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {cat.desc}
                  </p>

                  {cat.action === "filter" &&
                    activeFilter === cat.id &&
                    !searchQuery && (
                      <div className="absolute top-6 right-6 text-ruby animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-ruby block" />
                      </div>
                    )}
                </>
              );

              // RENDER AS LINK
              if (cat.action === "link") {
                return (
                  <Link
                    key={i}
                    href={cat.link}
                    className={`
                      group relative bg-surface/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl 
                      transition-all duration-300 hover:-translate-y-1 hover:bg-surface/60 cursor-pointer ${cat.color}
                    `}
                  >
                    <ArrowRight
                      className="absolute top-6 right-6 text-slate-600 group-hover:text-white transition-colors"
                      size={20}
                    />
                    {CardContent}
                  </Link>
                );
              }

              // RENDER AS FILTER BUTTON
              return (
                <button
                  key={i}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`
                    text-left group relative bg-surface/40 backdrop-blur-md border p-8 rounded-3xl 
                    transition-all duration-300 hover:-translate-y-1 hover:bg-surface/60 cursor-pointer
                    ${
                      activeFilter === cat.id && !searchQuery
                        ? "border-ruby bg-surface/80 shadow-[0_0_30px_rgba(224,17,95,0.1)]"
                        : "border-white/5 " + cat.color
                    }
                  `}
                >
                  {CardContent}
                </button>
              );
            })}
          </div>

          {/* --- FAQ SECTION (Auto-Scroll Target) --- */}
          <div
            ref={faqSectionRef}
            className="max-w-4xl mx-auto mb-24 scroll-mt-32"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/10 flex-1" />
              <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Book className="text-ruby" />
                {searchQuery
                  ? `Search Results: "${searchQuery}"`
                  : activeFilter === "All"
                  ? "Common Questions"
                  : activeFilter}
              </h2>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className="group bg-surface/20 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/20 hover:bg-surface/40"
                  >
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full px-8 py-6 flex items-start justify-between text-left focus:outline-none cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-ruby uppercase tracking-widest mb-2 block">
                          {faq.category}
                        </span>
                        <span className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">
                          {faq.question}
                        </span>
                      </div>
                      <div
                        className={`mt-1 p-2 rounded-full bg-white/5 transition-colors ${
                          openFaq === i
                            ? "bg-ruby text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {openFaq === i ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </button>

                    <div
                      className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                        openFaq === i
                          ? "max-h-96 opacity-100 pb-8"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="text-slate-400 leading-relaxed border-t border-white/5 pt-6 text-base">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-surface/20">
                  <p className="text-slate-500 mb-2 font-medium">
                    No results found.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("All");
                    }}
                    className="text-ruby hover:underline text-sm font-bold uppercase cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- CONTACT CTA --- */}
          <div className="relative rounded-4xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(224,17,95,0.1)]">
            <div className="absolute inset-0 bg-linear-to-r from-ruby/20 to-indigo-900/40" />
            <div className="absolute inset-0 bg-[#0b0f19]/80 backdrop-blur-3xl" />

            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <Bug size={18} className="text-ruby" />
                  <span className="text-xs font-bold text-ruby uppercase tracking-widest">
                    Direct Support
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase italic">
                  Still need help?
                </h2>
                <p className="text-slate-400 max-w-md text-lg font-medium">
                  If you couldn't find the solution above, our team is ready to
                  assist.
                </p>
              </div>

              <div className="flex flex-col gap-4 min-w-48">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-ruby hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(224,17,95,0.4)] hover:-translate-y-1 cursor-pointer"
                >
                  <MessageCircle size={16} /> Contact Us
                </Link>
                <Link
                  href="/status"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:bg-white/5 cursor-pointer"
                >
                  <Server size={16} /> System Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
