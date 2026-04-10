/**
 * 💎 RUBIES UNLEASHED - Help Center (AI-Optimized Edition)
 * -----------------------------------------
 * NEW: FAQPage Schema, Speakable Schema, Enhanced SEO
 */

import React from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import HelpClient from "./HelpClient"; // We'll create this
import { generateFAQPageSchema, generateSpeakableSchema, generateBreadcrumbSchema, BRAND } from "@/lib/seo-utils";

// ✅ Metadata
export const metadata = {
  title: "Help Center",
  description: `Get help with ${BRAND.name}. Find answers about downloads, creator tools, accounts, publishing on The Forge, and platform features. Support for indie developers and users.`,
  openGraph: {
    title: `Help Center | ${BRAND.name}`,
    description: "Find answers about downloads, creator tools, accounts, and more. Support for indie creators and users.",
  },
  alternates: {
    canonical: '/help',
  }
};

// ✅ FAQ Data (Server-side for schema generation)
const faqs = [
  // TECHNICAL
  {
    category: "Technical",
    question: "Android: 'App not installed' or blocked?",
    answer: "Android blocks unknown apps by default. Go to Settings > Security > Install Unknown Apps and allow your browser. If it still fails, uninstall any older version of the game first.",
  },
  {
    category: "Technical",
    question: "Windows: 'Windows protected your PC'?",
    answer: "This is normal for indie games. Click 'More Info' then 'Run Anyway'. This happens because indie developers often don't buy expensive security certificates from Microsoft.",
  },
  {
    category: "Technical",
    question: "How do I use a .ZIP or .RAR file?",
    answer: "You cannot play a ZIP file directly. You must 'Extract' it first. Right-click the file, select 'Extract All', and open the new folder to find the game file (.exe or .app).",
  },
  {
    category: "Technical",
    question: "The download link is broken.",
    answer: "We link to external sites and creator-hosted files. If a link stops working, please click 'Report Issue' on the game page or contact us so we can fix it.",
  },

  // ACCOUNT
  {
    category: "Account",
    question: "Do I need to sign up?",
    answer: "No account is required to browse and download. However, creating an account lets you save wishlists, publish projects, and access creator tools.",
  },
  {
    category: "Account",
    question: "How do I create an account?",
    answer: "Click 'Sign Up' in the top navigation. You can sign up with email or social login. Once registered, you'll be able to save wishlists and access The Forge creator platform.",
  },
  {
    category: "Account",
    question: "What are archetypes?",
    answer: "Archetypes are user classes that personalize your experience on Rubies Unleashed. When you create an account, you choose one of four archetypes — Hunter, Netrunner, Curator, or Phantom — each with a different feed algorithm, color identity, and dashboard priority. You can switch your archetype at any time from Settings.",
  },
  {
    category: "Account",
    question: "What is the Hunter archetype?",
    answer: "Hunters are game-first explorers. If you live for discovering new games before they go mainstream, Hunter is your class. Your dashboard prioritizes the latest game releases, action titles, and fresh drops from The Vault. Hunter's color is Ruby.",
  },
  {
    category: "Account",
    question: "What is the Netrunner archetype?",
    answer: "Netrunners are efficiency-driven and tech-savvy. Your feed prioritizes apps, tools, and utilities over games. If you're here for software, development tools, and digital utilities — Netrunner is built for you. Netrunner's color is Cyan.",
  },
  {
    category: "Account",
    question: "What is the Curator archetype?",
    answer: "Curators are quality-first collectors and preservationists. Your dashboard surfaces top-rated projects, hidden gems, and carefully selected content rather than just the newest releases. If you value depth over recency, Curator is your class. Curator's color is Amber.",
  },
  {
    category: "Account",
    question: "What is the Phantom archetype?",
    answer: "Phantoms are privacy-first and underground-focused. Your feed is intentionally unpredictable — shuffled, randomized, and surface-independent. If you prefer discovering content on your own terms without pattern or algorithm, Phantom is your class. Phantom's color is Violet.",
  },
  {
    category: "Account",
    question: "Can I change my archetype after signing up?",
    answer: "Yes. Go to Settings and select the Archetype tab. You can switch between Hunter, Netrunner, Curator, and Phantom at any time. Your dashboard and feed will update immediately to reflect your new class.",
  },
  {
    category: "Account",
    question: "What is the Architect archetype?",
    answer: "Architect is a creator role unlocked automatically when you publish your first project through The Forge. Unlike other archetypes, Architect is not selected at signup — it activates alongside your chosen archetype when you become a publisher. Architects get access to the creator dashboard, project analytics, and publishing tools.",
  },

  // CREATORS
  {
    category: "Creators",
    question: "How do I publish my project?",
    answer: "Create an account, then visit The Forge at /publish. You can upload projects directly, manage assets, and control your portfolio through your creator dashboard.",
  },
  {
    category: "Creators",
    question: "What can I upload to The Forge?",
    answer: "You can publish games, applications, tools, and digital assets. Upload cover images, screenshots, videos, and provide download links. All content is moderated for quality and safety.",
  },
  {
    category: "Creators",
    question: "How do I manage my published projects?",
    answer: "Access your creator dashboard at /[username]/dashboard. From there you can edit projects, upload new versions, manage assets, and view your public portfolio.",
  },
  {
    category: "Creators",
    question: "Can I update my project after publishing?",
    answer: "Yes! Use your creator dashboard to edit project details, upload new versions, add screenshots, or update download links at any time.",
  },

  // SAFETY
  {
    category: "Safety",
    question: "Are files safe to download?",
    answer: "We manually review all submissions and use external link warnings for downloads. Community projects go through moderation, but we always recommend using antivirus software.",
  },
  {
    category: "Safety",
    question: "How do I report inappropriate content?",
    answer: "Click 'Report Issue' on any project page, or use the contact form. We take content reports seriously and investigate all submissions promptly.",
  },

  // FEATURES
  {
    category: "Features",
    question: "How does the unified discovery work?",
    answer: "Our platform combines curated content from RubyApks with community-published projects from The Forge, giving you access to both established and fresh content in one place.",
  },
  {
    category: "Features",
    question: "What are wishlists and how do they work?",
    answer: "Wishlists let you save interesting projects for later. Your wishlist is private by default but can be made public to share with others. Access it from your profile menu.",
  },
];

export default function HelpPage() {
  // Generate schemas
  const faqSchema = generateFAQPageSchema(faqs);
  const speakableSchema = generateSpeakableSchema(['h1', 'h2', '.faq-question']);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Help', url: '/help' }
  ]);

  return (
    <>
      {/* ✅ Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-ruby/30 selection:text-white overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <BackgroundEffects />
        </div>

        <div className="relative z-40">
          <Navbar />
        </div>

        <HelpClient faqs={faqs} />

        <Footer />
      </div>
    </>
  );
}