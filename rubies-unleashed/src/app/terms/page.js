"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { Shield, Scroll, Swords, Scale, AlertTriangle, CheckCircle, Wrench } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      icon: Shield,
      title: "Platform Access & Accounts",
      content: [
        {
          subtitle: "Acceptance of Terms",
          text: "By accessing and using Rubies Unleashed, you accept and agree to be bound by these Terms of Service. If you disagree with any part, you may not access our platform."
        },
        {
          subtitle: "Account Registration",
          text: "Account creation is optional for browsing but required for publishing content, saving wishlists, and accessing creator tools. You must provide accurate information and maintain the confidentiality of your credentials."
        },
        {
          subtitle: "User Archetypes",
          text: "When creating an account, you'll choose an archetype that personalizes your experience. You can change your archetype at any time through your account settings."
        }
      ]
    },
    {
      icon: Wrench,
      title: "The Forge - Creator Platform",
      content: [
        {
          subtitle: "Publishing Rights",
          text: "Creators can publish games, applications, and digital tools through The Forge. You must own or have proper licensing for all content you publish. False claims of ownership may result in account termination."
        },
        {
          subtitle: "Content Standards",
          text: "Published content must not contain malware, illegal material, hate speech, or copyright violations. We reserve the right to remove content that violates these standards and may suspend creator accounts for repeated violations."
        },
        {
          subtitle: "Creator Responsibilities",
          text: "Creators are responsible for maintaining accurate project information, functional download links, and responding to user reports. You retain ownership of your content but grant us license to display it on our platform."
        },
        {
          subtitle: "Content Moderation",
          text: "All published content is subject to moderation. We may remove or restrict access to content that violates our guidelines. Creators will be notified of moderation actions and may appeal decisions through our support system."
        }
      ]
    },
    {
      icon: Swords,
      title: "User Conduct & Community",
      content: [
        {
          subtitle: "Acceptable Use",
          text: "You agree not to engage in activities that disrupt our services, attempt unauthorized access, distribute malware, engage in fraud, or abuse our reporting systems."
        },
        {
          subtitle: "Community Guidelines",
          text: "Treat other users with respect. Harassment, spam, impersonation, or attempts to manipulate the platform are prohibited and may result in account suspension."
        },
        {
          subtitle: "Reporting System",
          text: "Users can report inappropriate content or broken links. False or malicious reports may result in account restrictions. We investigate all reports and take appropriate action."
        }
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property & Content",
      content: [
        {
          subtitle: "Platform Content",
          text: "All platform features, design, code, and branding are the property of Rubies Unleashed and protected by copyright laws. Users may not copy, modify, or redistribute our platform code or design."
        },
        {
          subtitle: "Creator Content Rights",
          text: "Creators retain full ownership of their published content. By publishing through The Forge, you grant us a non-exclusive license to display, distribute, and promote your content on our platform."
        },
        {
          subtitle: "Legacy Content",
          text: "Content originally featured on RubyApks remains subject to original licensing terms. Creators can claim ownership of their legacy content through our verification process."
        },
        {
          subtitle: "User-Generated Content",
          text: "By submitting reviews, comments, or other content, you grant us a license to use and display that content in connection with our service. You retain ownership of your contributions."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect service availability."
        },
        {
          subtitle: "Third-Party Content",
          text: "We are not responsible for the content, accuracy, functionality, or safety of games and applications published by creators. Users download and use third-party content at their own risk."
        },
        {
          subtitle: "External Links",
          text: "Our platform may contain links to external websites and download sources. We provide safety warnings but are not responsible for external content or services."
        },
        {
          subtitle: "Limitation of Liability",
          text: "Rubies Unleashed shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service, including but not limited to data loss or security breaches of third-party content."
        }
      ]
    },
    {
      icon: Scroll,
      title: "Platform Policies & Changes",
      content: [
        {
          subtitle: "Terms Modifications",
          text: "We reserve the right to modify these terms at any time. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of new terms."
        },
        {
          subtitle: "Account Termination",
          text: "We may suspend or terminate accounts for violations of these terms, illegal activity, or behavior harmful to our community. Creators will have opportunity to export their content before termination when possible."
        },
        {
          subtitle: "Data Retention",
          text: "Upon account deletion, personal data is removed according to our Privacy Policy. Published content may remain visible unless specifically removed by the creator before account deletion."
        },
        {
          subtitle: "Governing Law",
          text: "These Terms are governed by applicable laws without regard to conflict of law provisions. Disputes will be resolved through binding arbitration where legally permitted."
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
              The rules that govern our creator platform and community. Clear, fair, and designed to protect everyone.
            </p>
            <p className="text-sm text-slate-500 mt-4 font-bold">
              Last Updated: January 13, 2026
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">TL;DR - The Essential Points</h2>
                <p className="text-slate-400 font-medium">Here's what you need to know:</p>
              </div>
            </div>
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">🔨</span>
                <span>Creators can publish freely through The Forge while retaining content ownership</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">🛡️</span>
                <span>All content is moderated for safety, but creators control their projects</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">👥</span>
                <span>Respect the community - harassment and abuse are not tolerated</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 text-xl">⚖️</span>
                <span>We can update these terms and will notify you of significant changes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 text-xl">🔗</span>
                <span>External downloads are at your own risk - we provide safety warnings</span>
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

          {/* Important Notice */}
          <div className="mt-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-amber-400 mb-3">Important Notice for Creators</h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  By publishing content through The Forge, you confirm that you own or have proper licensing 
                  for all materials included in your project. This includes code, assets, music, and any 
                  third-party components. Violation of intellectual property rights may result in immediate 
                  content removal and account suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">Questions About These Terms?</h2>
            <p className="text-slate-300 font-medium mb-6">
              Need clarification on creator rights, content policies, or platform rules? 
              Our legal team is here to help clarify any questions about these terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-ruby to-ruby-dark hover:from-ruby-light hover:to-ruby text-white font-black rounded-xl transition-all transform hover:scale-105"
              >
                Contact Legal Team
                <Shield size={18} />
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-slate-800 hover:border-ruby text-white font-black rounded-xl transition-all"
              >
                Help
                <Wrench size={18} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}