// app/terms/page.js
"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { Shield, Scroll, Swords, Scale, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: Shield,
      title: "The Guild Rules",
      content: [
        {
          subtitle: "Acceptance of Terms",
          text: "By accessing and using Rubies Unleashed, you accept and agree to be bound by these Terms of Service. If you disagree with any part, you may not access our platform."
        },
        {
          subtitle: "Account Registration",
          text: "You must provide accurate, complete information when creating an account. You're responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
        }
      ]
    },
    {
      icon: Swords,
      title: "Fair Play & Conduct",
      content: [
        {
          subtitle: "User Responsibilities",
          text: "You agree not to engage in any activity that disrupts or interferes with our services. This includes attempting to gain unauthorized access, distributing malware, or engaging in any fraudulent activity."
        },
        {
          subtitle: "Content Standards",
          text: "Any content you upload or share must not violate intellectual property rights, contain illegal material, or promote hate speech, violence, or harassment. We reserve the right to remove content that violates these standards."
        }
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Platform Content",
          text: "All content on Rubies Unleashed, including but not limited to text, graphics, logos, and software, is the property of Rubies Unleashed or its content suppliers and is protected by copyright laws."
        },
        {
          subtitle: "Game Developer Rights",
          text: "Games published on our platform remain the intellectual property of their respective developers. By publishing on Rubies Unleashed, developers grant us a license to distribute and promote their games."
        },
        {
          subtitle: "User-Generated Content",
          text: "By submitting content to our platform, you grant Rubies Unleashed a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the service."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive to keep Rubies Unleashed available 24/7, but we don't guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the service at any time."
        },
        {
          subtitle: "Limitation of Liability",
          text: "Rubies Unleashed shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service."
        },
        {
          subtitle: "Third-Party Content",
          text: "We are not responsible for the content, accuracy, or safety of games and materials published by third-party developers. Users download and play games at their own risk."
        }
      ]
    },
    {
      icon: Scroll,
      title: "Additional Terms",
      content: [
        {
          subtitle: "Modifications to Terms",
          text: "We reserve the right to modify these terms at any time. We'll notify users of significant changes via email or platform notification. Continued use after changes constitutes acceptance."
        },
        {
          subtitle: "Termination",
          text: "We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties."
        },
        {
          subtitle: "Governing Law",
          text: "These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-200 overflow-x-hidden relative font-sans selection:bg-ruby/30 selection:text-white">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ruby/10 border border-ruby/30 rounded-full mb-6 font-black text-ruby">
              <Shield size={16} />
              <span>LEGAL</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-linear-to-br from-white via-ruby-light to-ruby bg-clip-text text-transparent">
                TERMS OF SERVICE
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              The sacred scrolls that keep our treasure hunt fair and legendary! 📜✨
            </p>
            <p className="text-sm text-slate-500 mt-4 font-bold">
              Last Updated: December 31, 2025
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">TL;DR - The Quick Version</h2>
                <p className="text-slate-400 font-medium">Here's what you need to know:</p>
              </div>
            </div>
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">⚔️</span>
                <span>Play fair, be respectful, and follow the rules</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">🎮</span>
                <span>Games belong to their creators, but you can enjoy them here</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">🛡️</span>
                <span>We protect the platform, but you're responsible for your account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">⚖️</span>
                <span>We can update these terms, and we'll let you know when we do</span>
              </li>
            </ul>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-ruby/30 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-ruby to-ruby-dark rounded-xl flex items-center justify-center shrink-0">
                    <section.icon size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{section.title}</h2>
                </div>

                <div className="space-y-6 ml-16">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <h3 className="text-lg font-black text-ruby-light mb-3">
                        {item.subtitle}
                      </h3>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">Questions About These Terms?</h2>
            <p className="text-slate-300 font-medium mb-6">
              Got questions or need clarification? We're here to help! Drop us a message and our team will get back to you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-ruby to-ruby-dark hover:from-ruby-light hover:to-ruby text-white font-black rounded-xl transition-all transform hover:scale-105"
            >
              Contact Us
              <Shield size={18} />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}