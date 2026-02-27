/**
 * 💎 RUBIES UNLEASHED - Brand Constants
 * Single source of truth for brand identity
 * Based on official Brand Document v1.0
 */

export const BRAND = {
  // Core Identity
  name: "Rubies Unleashed",
  legalName: "Rubies Unleashed",
  alternateName: "RubyApks", // Legacy reference only
  
  // Messaging
  slogan: "Where New Ideas Rise",
  logoTagline: "Unleash Your Power", // Visual only, not for metadata
  shortDescription: "Building a home for rising games, apps, and digital creations.",
  launchpadDescription: "A launchpad for indie games, apps, and digital creators.",
  
  longDescription: "Rubies Unleashed is a creator-first platform where independent developers publish, showcase, and share their digital projects with a global audience. We focus on visibility, ownership, and long-term value, helping emerging creators turn passion projects into recognized work, while giving users early access to innovative games, apps, and tools they won't find elsewhere.",
  
  // Statements
  missionStatement: "To empower indie creators with a curated platform that provides visibility, ownership, and long-term preservation for their digital projects.",
  visionStatement: "To become the definitive launchpad for emerging digital creators, where quality and creativity triumph over budget and marketing spend.",
  
  // Platform Info
  url: "https://rubiesunleashed.app",
  logo: "https://rubiesunleashed.app/rubieslogo.png",
  foundingDate: "2020-07-01",
  
  // Founder
  founder: {
    name: "Tkprobix",
    alternateName: "Daniel Oluwatunmibi"
  },
  
  // Milestones
  milestones: {
    launched: "2025-12-26",
    devAccountsLive: "2026-01-13",
    analyticsLive: "2026-01-07"
  },
  
  // Social Profiles (for schema markup - no email/linkedin here)
  socialProfiles: [
    "https://x.com/rubiesunleashed",
    "https://www.instagram.com/official_rubiesunleashed",
    "https://facebook.com/rubiesunleashed",
    "https://discord.gg/zgCh55JfWF",
  ],
  
  // Detailed social links for UI usage (includes email & LinkedIn)
  social: {
    discord: {
      name: "Discord",
      handle: "Rubies Unleashed Community",
      url: "https://discord.gg/zgCh55JfWF",
      icon: "discord"
    },
    twitter: {
      name: "Twitter/X",
      handle: "@rubiesunleashed",
      url: "https://x.com/rubiesunleashed",
      icon: "twitter"
    },
    instagram: {
      name: "Instagram",
      handle: "@official_rubiesunleashed",
      url: "https://www.instagram.com/official_rubiesunleashed",
      icon: "instagram"
    },
    facebook: {
      name: "Facebook",
      handle: "@rubiesunleashed",
      url: "https://facebook.com/rubiesunleashed",
      icon: "facebook"
    },
    linkedin: {
      name: "LinkedIn",
      handle: "rubies-unleashed",
      url: "https://linkedin.com/company/rubies-unleashed",
      icon: "linkedin"
    },
    email: {
      name: "Email",
      handle: "officialrubiesunleashed@gmail.com",
      url: "mailto:officialrubiesunleashed@gmail.com",
      icon: "mail"
    }
  },
  
  // Core Values (for internal use)
  coreValues: [
    "Creator empowerment (The Forge platform)",
    "Quality over quantity (Curated, not crowded)",
    "Community-driven discovery (Archetypes, not algorithms)",
    "Preservation and legacy (Projects backed up, protected)",
    "Radical transparency (Clear policies, creator-first terms)"
  ]
};

// Messaging Pillars
export const MESSAGING = {
  forDevelopers: [
    "Build. Publish. Own it.",
    "Your project deserves more than a store listing",
    "No approval queues. No revenue cuts. Just distribution.",
    "The Forge: Built by creators, for creators"
  ],
  
  forUsers: [
    "Discover games before they're mainstream",
    "Every download supports an indie developer directly",
    "Curated by archetypes, not algorithms",
    "Your wishlist, your way—Hunter, Netrunner, Curator, Phantom, or Architect"
  ]
};

// CTAs
export const CTA = {
  deployProject: "Deploy Your Project",
  enterVault: "Enter The Vault",
  claimGem: "Claim This Gem",
  joinForge: "Join The Forge"
};