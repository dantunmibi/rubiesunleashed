// app/privacy/page.js
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
} from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "What We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your email address, username, and password. This information is necessary to provide you with access to our platform and personalized features.",
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including game downloads, playtime, preferences, and device information. This helps us improve our services and recommendations.",
        },
        {
          subtitle: "Payment Information",
          text: "If you make purchases, we collect necessary payment details. However, sensitive payment information is processed by secure third-party payment processors and not stored on our servers.",
        },
        {
          subtitle: "Communication Data",
          text: "When you contact us or participate in community features, we collect the content of your messages and communications to provide support and improve our services.",
        },
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Data",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to operate, maintain, and provide Rubies Unleashed features, including personalized game recommendations, account management, and customer support.",
        },
        {
          subtitle: "Platform Improvement",
          text: "Your usage data helps us understand how users interact with our platform, identify bugs, develop new features, and enhance overall user experience.",
        },
        {
          subtitle: "Communications",
          text: "We may send you service-related emails, notifications about new games, platform updates, and promotional content. You can opt out of marketing communications at any time.",
        },
        {
          subtitle: "Safety & Security",
          text: "We use your information to detect and prevent fraud, abuse, and other harmful activities, ensuring a safe environment for all treasure hunters.",
        },
      ],
    },
    {
      icon: Shield,
      title: "How We Protect Your Data",
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information from unauthorized access or disclosure.",
        },
        {
          subtitle: "Data Encryption",
          text: "All sensitive data transmitted between your device and our servers is encrypted using SSL/TLS protocols. Passwords are hashed and salted before storage.",
        },
        {
          subtitle: "Access Controls",
          text: "We limit access to personal information to authorized employees and contractors who need it to perform their duties. All personnel are bound by confidentiality agreements.",
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security assessments and vulnerability testing to identify and address potential security risks proactively.",
        },
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights & Control",
      content: [
        {
          subtitle: "Access Your Data",
          text: "You have the right to request a copy of all personal information we hold about you. We'll provide this in a portable format within 30 days of your request.",
        },
        {
          subtitle: "Update or Correct",
          text: "You can update your account information at any time through your profile settings. If you notice any inaccuracies, contact us for assistance.",
        },
        {
          subtitle: "Delete Your Account",
          text: "You can request deletion of your account and associated data at any time. Note that some information may be retained for legal or legitimate business purposes.",
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt out of marketing communications, targeted advertising, and certain data collection practices through your account settings or by contacting us.",
        },
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies to enable core functionality like user authentication, session management, and security features. These cannot be disabled without affecting site functionality.",
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use analytics cookies to understand how users interact with our platform, which pages are most popular, and where improvements are needed.",
        },
        {
          subtitle: "Preference Cookies",
          text: "These cookies remember your settings and preferences to provide a more personalized experience on future visits.",
        },
        {
          subtitle: "Managing Cookies",
          text: "You can control cookie preferences through your browser settings. Note that disabling certain cookies may limit platform functionality.",
        },
      ],
    },
    {
      icon: Mail,
      title: "Third-Party Sharing",
      content: [
        {
          subtitle: "Service Providers",
          text: "We share data with trusted third-party service providers who help us operate the platform, including hosting, payment processing, and analytics services. All providers are contractually bound to protect your data.",
        },
        {
          subtitle: "Game Developers",
          text: "When you download or interact with games, basic analytics may be shared with developers to help them improve their games. We never share personally identifiable information without consent.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law, court order, or government regulation, or to protect the rights, property, or safety of Rubies Unleashed and its users.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred. We'll notify you via email and platform notice before this occurs.",
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
              Your treasure is safe with us! Here's how we protect your data on
              this legendary quest. 🛡️✨
            </p>
            <p className="text-sm text-slate-500 mt-4 font-bold">
              Last Updated: December 31, 2025
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
                  We collect only what's necessary to run an awesome platform
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">🛡️</span>
                <span>
                  Your data is encrypted and protected with industry-standard
                  security
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">✋</span>
                <span>
                  We never sell your personal information to third parties
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ruby text-xl">👑</span>
                <span>
                  You control your data - access, update, or delete it anytime
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
              <h3 className="text-xl font-black text-white mb-4">
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
              <h3 className="text-xl font-black text-white mb-4">
                International Users
              </h3>
              <p className="text-slate-300 font-medium leading-relaxed">
                Rubies Unleashed operates globally. By using our service, you
                consent to the transfer of your information to countries where
                we operate, which may have different data protection laws than
                your country.
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
              rights? We're here to help! Reach out to our privacy team.
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
