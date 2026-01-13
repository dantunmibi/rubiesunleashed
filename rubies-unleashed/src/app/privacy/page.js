"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import {
  Lock,
  Eye,
  Database,
  UserCheck,
  Shield,
  Cookie,
  Mail,
  Wrench,
} from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "What We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your email address, username, display name, and chosen archetype. This information enables access to creator tools, wishlists, and personalized features.",
        },
        {
          subtitle: "Creator Content",
          text: "If you use The Forge to publish projects, we collect project details, descriptions, images, and download links you provide. This content is used to display your projects on the platform.",
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including pages visited, projects viewed, and wishlist activity. This helps us improve our services and recommendations.",
        },
        {
          subtitle: "Communication Data",
          text: "When you contact us through our support forms or report content issues, we collect the content of your messages to provide support and maintain platform safety.",
        },
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Data",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to operate Rubies Unleashed features, including personalized content discovery, creator dashboards, wishlist management, and customer support.",
        },
        {
          subtitle: "Creator Platform",
          text: "For creators using The Forge, we use your data to enable project publishing, asset management, portfolio display, and creator analytics.",
        },
        {
          subtitle: "Platform Improvement",
          text: "Your usage data helps us understand user behavior, identify issues, develop new features, and enhance the overall experience for both creators and users.",
        },
        {
          subtitle: "Safety & Security",
          text: "We use your information to detect and prevent spam, abuse, and other harmful activities, ensuring a safe environment for our community.",
        },
      ],
    },
    {
      icon: Shield,
      title: "How We Protect Your Data",
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement industry-standard security measures including encryption, secure servers, and Row Level Security (RLS) policies to protect your personal information from unauthorized access.",
        },
        {
          subtitle: "Data Encryption",
          text: "All data transmitted between your device and our servers is encrypted using SSL/TLS protocols. Passwords are securely hashed before storage.",
        },
        {
          subtitle: "Access Controls",
          text: "We use database-level security policies to ensure users can only access their own data. Creator content is protected by ownership verification.",
        },
        {
          subtitle: "External Link Safety",
          text: "We provide warnings before redirecting to external download links, helping you make informed decisions about file downloads.",
        },
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights & Control",
      content: [
        {
          subtitle: "Access Your Data",
          text: "You can view and manage your account information, projects, and wishlists through your profile and dashboard. Contact us for a complete data export.",
        },
        {
          subtitle: "Update or Correct",
          text: "You can update your profile information, project details, and preferences at any time through your account settings and creator dashboard.",
        },
        {
          subtitle: "Delete Your Account",
          text: "You can delete your account and associated data through your settings. Published projects may remain visible unless specifically removed.",
        },
        {
          subtitle: "Content Control",
          text: "As a creator, you have full control over your published projects - edit, update, or remove them at any time through The Forge dashboard.",
        },
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Local Storage",
      content: [
        {
          subtitle: "Essential Storage",
          text: "We use browser storage for essential functionality like user authentication, session management, and maintaining your wishlist while browsing.",
        },
        {
          subtitle: "Guest Data",
          text: "If you browse without an account, your wishlist is stored locally on your device. This data migrates to your account when you sign up.",
        },
        {
          subtitle: "Preferences",
          text: "We store your theme preferences, archetype selection, and other settings to provide a consistent experience across visits.",
        },
        {
          subtitle: "Managing Storage",
          text: "You can clear browser data through your browser settings. Note that this may reset your preferences and guest wishlist.",
        },
      ],
    },
    {
      icon: Mail,
      title: "Data Sharing",
      content: [
        {
          subtitle: "Service Providers",
          text: "We share data with trusted service providers including Supabase (database), Netlify (hosting), and email services. All providers are contractually bound to protect your data.",
        },
        {
          subtitle: "Public Content",
          text: "Content you publish through The Forge (projects, profiles, public wishlists) is visible to other users as intended. You control what information is public.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, court order, or to protect the rights, property, or safety of Rubies Unleashed and its users.",
        },
        {
          subtitle: "No Data Sales",
          text: "We never sell your personal information to third parties. Your data is used solely to operate and improve our platform.",
        },
      ],
    },
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
              <Lock size={16} />
              <span>PRIVACY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-linear-to-br from-white via-ruby-light to-ruby bg-clip-text text-transparent">
                PRIVACY POLICY
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Your data is protected with enterprise-grade security. Here's how we 
              safeguard your information on our creator platform.
            </p>
            <p className="text-sm text-slate-500 mt-4 font-bold">
              Last Updated: January 13, 2026
            </p>
          </div>

          {/* Quick Overview */}
          <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                <Lock size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Privacy at a Glance
                </h2>
                <p className="text-slate-400 font-medium">
                  Our commitment to your privacy:
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">🔒</span>
                <span>
                  We collect only what's necessary to operate the platform and creator tools
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-xl">🛡️</span>
                <span>
                  Your data is protected with Row Level Security and encryption
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 text-xl">✋</span>
                <span>
                  We never sell your personal information to third parties
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 text-xl">👑</span>
                <span>
                  You control your data - access, update, or delete it anytime
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-violet-400 text-xl">🔨</span>
                <span>
                  Creators have full control over their published content and portfolios
                </span>
              </li>
            </ul>
          </div>

          {/* Privacy Sections */}
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
                  <h2 className="text-2xl font-black text-white">
                    {section.title}
                  </h2>
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

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-emerald-400" />
                Children's Privacy
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                Rubies Unleashed is designed for users aged 13 and older. We do
                not knowingly collect personal information from children under
                13. If you believe a child has provided us with personal
                information, please contact us immediately.
              </p>
            </div>

            <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-emerald-400" />
                Creator Rights
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                As a creator using The Forge, you retain ownership of your content.
                We only use your project information to display it on our platform.
                You can modify or remove your content at any time.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-4">
              Privacy Questions?
            </h2>
            <p className="text-slate-300 font-medium mb-6">
              Have concerns about your privacy or data? Want to exercise your
              rights? Need help with creator account settings? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-ruby to-ruby-dark hover:from-ruby-light hover:to-ruby text-white font-black rounded-xl transition-all transform hover:scale-105"
              >
                Contact Privacy Team
                <Lock size={18} />
              </a>
              <a
                href="mailto:officialrubiesunleashed@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-slate-800 hover:border-ruby text-white font-black rounded-xl transition-all"
              >
                Email Us Directly
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}