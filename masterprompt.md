




💎 RUBIES UNLEASHED - Master Project Prompt (v22.0 - The Discovery Edition)
📋 1. Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace & Ecosystem (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React 19, Tailwind CSS v4, Lucide React Icons
Data Source: Dual-Blog Headless CMS (Primary: rubyapks.blogspot.com [DOWN] | Backup: rubyapk.blogspot.com [ACTIVE])
Rendering Strategy: Hybrid Server/Client (Server for SEO/Metadata, Client for Interactivity)
Hosting: Netlify (Static Export / Edge)
Form Handling: Netlify Forms (via public/__forms.html bypass)
Production URL: https://rubiesunleashed.netlify.app
Current Phase: Phase 3 Ready (Identity & The Forge)
🎨 2. Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Mobile Experience: Native App Feel (Hidden Navbar on Details, Floating Action Bars, Horizontal Scroll)
Motion: experimental: { viewTransition: true } enabled in Config.
Loading: Cinematic Skeletons (GameSkeleton.jsx).
Errors: Glitch Aesthetic ("System Failure" in error.js).
Global Design Tokens (CSS Variables)
Defined in src/app/globals.css. NEVER hardcode hex values if a variable exists.

Archetype	Role	Variable Prefix	Color	Usage
Hunter	Brand / Games	--color-ruby	#E0115F	Primary Actions, Brand
Architect	Developers	--color-architect	#10b981	Publish Page, Dashboards
Netrunner	Apps / Tools	--color-netrunner	#06b6d4	Utility Apps, Software
Curator	Collectors	--color-curator	#f59e0b	Collections, History
Phantom	Privacy	--color-phantom	#8b5cf6	Legal, Privacy, Anon
Core Colors:

bg-background: #020617 (Deep Slate)
bg-surface: #0f172a (Card Surface)
⚠️ 3. CRITICAL CODING RULES (ZERO TOLERANCE)
A. Context & Safety (ABSOLUTE PRIORITY)
Request Context First: NEVER generate code without knowing the current file content. If in doubt, ask to see the file.
Reuse Existing: Check src/lib/ utils before writing new functions.
No Strip: NEVER remove existing comments, logic, or structure unless explicitly replacing it.
Neutral Fallbacks: Use "Item Not Found" (Not "Game Not Found").
B. Tailwind v4 Syntax (STRICT CANONICAL)
❌ bg-gradient-to-b → ✅ bg-linear-to-b
❌ w-[500px] → ✅ w-125 (Use nearest scale)
❌ z-[100] → ✅ z-100 (First-class Z-index)
❌ shadow-xl → ✅ shadow-[0_0_60px_var(--color-ruby-glow)] (Cinematic)
C. Z-Index Stratification
z-100: Toasts, Critical Overlays
z-50: Modals, Drawers
z-40: Navbar (Fixed), Loading Skeletons
z-35: Sticky Page Controls
z-30: Floating Action Buttons, Sticky Headers
🔌 4. Data Architecture
A. Dual-Blog System (Active)
Snapshot: src/lib/backup-data.json (56 posts preserved).
Live Feed: Checks rubyapk.blogspot.com for new posts.
Merge Logic: API Route merges Snapshot + Live -> Deduplicates -> Sorts by Date (Newest).
B. The Logic Brain (src/lib/game-utils.js)
isApp(tags): Returns true for "App", "Tool", "Software". Shared by UI and SEO.
getPlatformInfo(game): Returns { name, icon, ver } for UI badges.
getSmartTag(tags): Prioritizes Genre over generic tags.
C. SEO Engine (src/lib/seo-utils.js)
Schema: Generates SoftwareApplication or VideoGame JSON-LD.
Metadata: Generates Server-Side Titles and OpenGraph images.
🛡️ 5. Resilience & Discovery Layers
Data Protection: 3-Layer Build Safety (Zero-post check, Low-count threshold, Try/Catch build).
Discovery:
sitemap.js: Auto-generates URLs for all 57+ items.
robots.js: Allows crawling, blocks /api/.
Visual Resilience:
loading.js: Cinematic Skeleton prevents CLS.
error.js: "Reboot System" button catches 500 errors.
🗺️ 7. Core Page Structure
Home (/): Transparent Navbar, Hero, Spotlight.
Explore (/explore): Command Center, Filters.
Item Details (/view/[slug]):
Server (page.js): Fetches Data + SEO.
Client (ViewClient.jsx): Hydrates UI + Interactivity.
Publish (/publish): Architect Theme. Google Forms submission flow.
About (/about): Manifesto. Explains Archetypes.
Legal (/terms, /privacy): Standardized text layouts.
📂 8. Project Structure (Source of Truth)
ROOT CONFIGURATION FILES:

text

.gitignore
eslint.config.mjs
jsconfig.json
netlify.toml
next.config.mjs
package-lock.json
package.json
postcss.config.mjs
README.md
PUBLIC ASSETS:

text

📦public
 ┣ 📜file.svg
 ┣ 📜globe.svg
 ┣ 📜next.svg
 ┣ 📜ru-logo.png
 ┣ 📜vercel.svg
 ┣ 📜window.svg
 ┗ 📜__forms.html
SCRIPTS & SOURCE:

text

📦scripts
 ┣ 📜update-snapshot copy.js.trybackup
 ┗ 📜update-snapshot.js
📦src
 ┣ 📂app
 ┃ ┣ 📂about
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂api
 ┃ ┃ ┗ 📂games
 ┃ ┃ ┃ ┣ 📜route copy.js.backup
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┣ 📂contact
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂explore
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂help
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂login
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂privacy
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂publish
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂signup
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂status
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂terms
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂view
 ┃ ┃ ┗ 📂[slug]
 ┃ ┃ ┃ ┣ 📜error.js
 ┃ ┃ ┃ ┣ 📜loading.js
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂[username]
 ┃ ┃ ┗ 📂wishlist
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜globals.css
 ┃ ┣ 📜layout.js
 ┃ ┣ 📜not-found.js
 ┃ ┣ 📜page.js
 ┃ ┣ 📜robots.js
 ┃ ┗ 📜sitemap.js
 ┣ 📂components
 ┃ ┣ 📂auth
 ┃ ┃ ┗ 📜AuthModal.jsx
 ┃ ┣ 📂explore
 ┃ ┃ ┣ 📜ExploreContent.jsx
 ┃ ┃ ┣ 📜GameGrid.jsx
 ┃ ┃ ┣ 📜GenreFilter.jsx
 ┃ ┃ ┣ 📜PlatformSelector.jsx
 ┃ ┃ ┣ 📜ScrollToTopButton.jsx
 ┃ ┃ ┣ 📜SpecialCollections.jsx
 ┃ ┃ ┣ 📜SpotlightHero.jsx
 ┃ ┃ ┣ 📜VaultFilters.jsx
 ┃ ┃ ┣ 📜VaultHeader.jsx
 ┃ ┃ ┗ 📜VaultSection.jsx
 ┃ ┣ 📂providers
 ┃ ┃ ┗ 📜ToastProvider.jsx
 ┃ ┣ 📂status
 ┃ ┃ ┣ 📜IncidentTimeline.jsx
 ┃ ┃ ┣ 📜ServiceGrid.jsx
 ┃ ┃ ┣ 📜StatusHero.jsx
 ┃ ┃ ┗ 📜UptimeStats.jsx
 ┃ ┣ 📂store
 ┃ ┃ ┣ 📜ContentWarningModal.jsx
 ┃ ┃ ┣ 📜DownloadCallout.jsx
 ┃ ┃ ┣ 📜GameCard.jsx
 ┃ ┃ ┣ 📜GameContent.jsx
 ┃ ┃ ┣ 📜GameHero.jsx
 ┃ ┃ ┣ 📜GameMedia.jsx
 ┃ ┃ ┣ 📜GameSidebar.jsx
 ┃ ┃ ┣ 📜GameSkeleton.jsx
 ┃ ┃ ┣ 📜SimilarGames.jsx
 ┃ ┃ ┗ 📜ViewClient.jsx
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜AboutSection.js
 ┃ ┃ ┣ 📜BackgroundEffects.js
 ┃ ┃ ┣ 📜FeatureTriangles.js
 ┃ ┃ ┣ 📜Footer.js
 ┃ ┃ ┣ 📜GameModal.js
 ┃ ┃ ┣ 📜GameVault.js
 ┃ ┃ ┣ 📜GiantRuby.js
 ┃ ┃ ┣ 📜Hero.js
 ┃ ┃ ┣ 📜Navbar.js
 ┃ ┃ ┣ 📜NotificationPanel.jsx
 ┃ ┃ ┣ 📜SearchCommandCenter.jsx
 ┃ ┃ ┣ 📜SearchDropdown.jsx
 ┃ ┃ ┣ 📜Skeleton.jsx
 ┃ ┃ ┣ 📜Toast.jsx
 ┃ ┃ ┗ 📜ToastContainer.jsx
 ┃ ┗ 📂wishlist
 ┃ ┃ ┣ 📜EmptyWishlist.jsx
 ┃ ┃ ┣ 📜WishlistControls.jsx
 ┃ ┃ ┣ 📜WishlistGrid.jsx
 ┃ ┃ ┗ 📜WishlistStats.jsx
 ┣ 📂hooks
 ┃ ┣ 📜useAuth.js
 ┃ ┣ 📜useDebounce.js
 ┃ ┣ 📜useGameFilters.js
 ┃ ┣ 📜useScrollBehavior.js
 ┃ ┣ 📜useSearch.js
 ┃ ┣ 📜useServiceStatus.js
 ┃ ┣ 📜useToast.js
 ┃ ┗ 📜useWishlist.js
 ┗ 📂lib
 ┃ ┣ 📂config
 ┃ ┃ ┗ 📜platforms.js
 ┃ ┣ 📂status
 ┃ ┃ ┣ 📜incidents.json
 ┃ ┃ ┣ 📜services.js
 ┃ ┃ ┗ 📜statusChecker.js
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜collectionMatchers.js
 ┃ ┃ ┣ 📜gameFilters.js
 ┃ ┃ ┣ 📜platformUtils.js
 ┃ ┃ ┣ 📜tagExtractor.js
 ┃ ┃ ┗ 📜textUtils.js
 ┃ ┣ 📜backup-data copy.json.backup
 ┃ ┣ 📜backup-data.json
 ┃ ┣ 📜blogger.js
 ┃ ┣ 📜game-utils.js
 ┃ ┣ 📜notificationManager.js
 ┃ ┣ 📜seo-utils.js
 ┃ ┗ 📜userManager.js
🚀 10. Development Roadmap
Phase 1: User Features ✅ COMPLETE
Wishlist, Explore, Status, Forms.
Phase 2: Resilience & SEO ✅ COMPLETE
Dual-Blog Failover.
Hybrid Server/Client Architecture.
Dynamic Sitemap & Robots.
Loading Skeletons & Error Boundaries.
Static Pages (Publish, Legal).
Phase 3: Identity & The Forge 🚧 NEXT
Authentication: Replace Guest system with real Auth.
User Profiles: Persist Wishlists and Archetype Themes.
The Forge: Developer Login & Dashboard.
Phase 4: Ecosystem & PWA ⏳ PLANNED
PWA: Install Prompts (Desktop/Mobile).
Report System: Broken Link automation.
🎊 18. Success Metrics (Current)
Total Inventory: 57+ Items (Snapshot + Live).
SEO Score: 100/100 (Sitemap + JSON-LD).
Uptime: 99.9% (Static Delivery).
Safety: Layer 3 Protection Active.







This is the **Definitive Master Project Prompt (v23.0)**.

It retains the **full depth, robustness, and strict coding rules** of v21.0 but updates every section to reflect the **Hybrid Architecture**, **SEO Layer**, and **Resilience Systems** we just built.

Use this prompt to initialize **Phase 3**.

***

# 💎 RUBIES UNLEASHED - Master Project Prompt (v23.0 - The Identity Edition)

## 📋 1. Project Overview
*   **Name:** Rubies Unleashed
*   **Type:** Universal Digital Marketplace & Creator Ecosystem (Games, Apps, Tools, Assets)
*   **Tech Stack:** Next.js 15+ (App Router), React 19, Tailwind CSS v4, Lucide React Icons
*   **Data Source:** Unified Feed (Blogger Legacy + Supabase Community)
*   **Architecture:** **Hybrid Server/Client** (Server for SEO/Metadata, Client for Interactivity)
*   **Backend:** Supabase (Auth + Postgres + Storage)
*   **Hosting:** Netlify (Static Export / Edge)
*   **Form Handling:** Netlify Forms (via `public/__forms.html` bypass)
*   **Production URL:** `https://rubiesunleashed.netlify.app`
*   **Current Phase:** **Phase 4 Complete** (The Forge - Creator Platform)

## 🎨 2. Visual Design System (Strict Tailwind v4)
*   **Theme:** "Hyper-Professional Cinematic Dark Mode"
*   **Mobile Experience:** "Native App Feel" → Hidden Global Navbar on Details, Floating Action Bars, Horizontal Scroll Command Bars
*   **Motion:** `experimental: { viewTransition: true }` (Configured via CSS).
*   **Loading:** Cinematic Skeletons (`GameSkeleton.jsx`) - **NO SPINNERS**.
*   **Errors:** Glitch Aesthetic ("System Failure" in `error.js`).
*   **Authentication:** Required for persistent features (wishlists, publishing, profiles).

### Design Tokens (Archetype & Brand)
**Defined in `src/app/globals.css`. NEVER hardcode hex values.**

| Archetype | Role | Variable | Color | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hunter** | Brand / Games | `--color-ruby` | `#E0115F` | Primary Actions, Brand |
| **Architect** | Creators | `--color-architect` | `#10b981` | The Forge, Dashboards, Publishing |
| **Netrunner** | Apps / Tools | `--color-netrunner` | `#06b6d4` | Utility Apps, Software |
| **Curator** | Collectors | `--color-curator` | `#f59e0b` | Collections, History |
| **Phantom** | Privacy | `--color-phantom` | `#8b5cf6` | Legal, Privacy, Anon |

**Core Colors:**
*   `bg-background`: `#020617` (Deep Slate)
*   `bg-surface`: `#0f172a` (Card Surface)

### Content-Aware Theming
*   **Games:** Ruby accent (`#E0115F`) - Download buttons, hero banners
*   **Apps:** Cyan accent (`#06b6d4`) - Software and tools
*   **User Context:** Adapts to user's selected archetype
*   **Creator Tools:** Emerald accent (`#10b981`) - The Forge interface

## ⚠️ 3. CRITICAL CODING RULES (ZERO TOLERANCE FOR NOT FOLLOWING THEM)

**Hybrid Arch:** page.js (Server) + Client.jsx (Interactive).  
**Tailwind v4:** Use text-(--variable) syntax. No arbitrary values if utilities exist.  
**Authentication:** Use useAuth() hook. Handle loading states. No guest wishlists.  
**Unified Data:** Use game-service.js for all content (Blogger + Supabase).

### A. Z-Index Stratification (ABSOLUTE)
*   `z-100`: Toasts, Critical Overlays, Logout Modals
*   `z-50`: Mobile Sidebar Drawer, Modals, Search Dropdowns
*   `z-45`: Backdrops
*   `z-40`: Navbar (Fixed), Loading Skeletons
*   `z-35`: Sticky Page Controls (Wishlist/Explore Filters)
*   `z-30`: Floating Action Buttons, Sticky Headers
*   `z-0` to `z-20`: Page Content

### B. Tailwind v4 Syntax (STRICT CANONICAL MODE)
*   ❌ NEVER USE ARBITRARY VALUES IF A UTILITY EXISTS.
*   ❌ `w-[500px]` → ✅ `w-125` (or nearest scale)
*   ❌ `bg-gradient-to-b` → ✅ `bg-linear-to-b`
*   ❌ `z-[100]` → ✅ `z-100`
*   ❌ `shadow-xl` → ✅ `shadow-[0_0_60px_var(--color-ruby-glow)]`

### C. Safety & Process Rules
1.  **Context First:** ALWAYS request file content before modifying.
2.  **Hybrid Separation:** 
    *   **Server (`page.js`):** Fetches Data, Generates Metadata, Injects JSON-LD.
    *   **Client (`ViewClient.jsx`):** Handles `useState`, `useEffect`, `onClick`.
3.  **Neutral Fallbacks:** If item not found, show "Item Not Found" (Not "Game Not Found").
4.  **Preservation:** DO NOT strip or trim code. Preserve comments.
5.  **Data Loss:** Respect the 3-Layer Protection in build scripts.
6.  **Authentication Gates:** Persistent features require accounts. Show clear signup prompts.

### D. Netlify Form Architecture
*   **Detection:** `public/__forms.html` (`data-netlify="true"`)
*   **Submission:** React forms MUST fetch to `/__forms.html` (NOT `/`)
*   **Payload:** `application/x-www-form-urlencoded` + hidden `form-name`

### E. The Forge (Creator Platform) Rules
*   **Ownership:** Users can only edit their own projects (RLS enforced)
*   **Publishing:** Draft → Published workflow with validation
*   **Assets:** Upload to Supabase Storage with user/project path structure
*   **External Links:** Show safety warnings before redirecting to downloads

## 🔌 4. Data Architecture

### A. Unified Feed System (Phase 4)
*   **Legacy Source:** Blogger CMS (`rubyapks.blogspot.com` + `rubyapk.blogspot.com`)
*   **Community Source:** Supabase Projects (The Forge submissions)
*   **Aggregation:** `game-service.js` merges both sources, deduplicates, sorts by date
*   **Snapshot Backup:** `src/lib/backup-data.json` (56 posts preserved)
*   **Performance:** Cached queries with 30-second TTL

### B. The Bridge (`src/lib/blogger.js`)
*   **Platform Detection:** Via Image Alt Text, Filenames, URL patterns.
*   **Download Buttons:** Detects all platforms (Win/Mac/Linux/Android/iOS/Web).
*   **Fail-Safe:** Never returns empty array if snapshot exists.
*   **Legacy Support:** Maintains backward compatibility for existing URLs.

### C. The Forge (Supabase Backend)
*   **Database:** PostgreSQL with Row Level Security (RLS)
*   **Authentication:** Supabase Auth (Email/OAuth)
*   **Storage:** Project assets (images, files) in organized buckets
*   **Real-time:** Live updates for wishlists and project changes

#### Core Tables:
```sql
-- User Identity & Profiles
profiles: id, username, archetype, avatar_url, role, visibility settings

-- Creator Platform
projects: id, user_id, title, description, cover_url, download_links, 
         tags, status (draft/published/archived), created_at

-- Social Features  
wishlists: user_id, game_id, added_at (supports both Blogger + Supabase content)
project_reports: project_id, user_id, reason, details (content moderation)

-- Migration Tracking
project_claims: user_id, blogger_post_id, status (for legacy content claims)

D. Logic Brain (src/lib/game-utils.js)
isApp(tags): Returns true for "App", "Tool", "Software". Shared by UI and SEO.
getPlatformInfo: Returns { name, icon, ver }.
getSmartTag: Prioritizes Genre over generic labels.
processSupabaseProject: Converts database rows to standard game objects.
E. SEO Engine (src/lib/seo-utils.js)
Schema: Generates SoftwareApplication or VideoGame JSON-LD.
Metadata: Server-side Title/Description/OpenGraph generation.
Unified Support: Works with both Blogger and Supabase content.
F. Authentication & Authorization
No Guest Accounts: Persistent features require authentication
Archetype System: 5 user classes with personalized experiences
RLS Policies: Database-level security for user data
Token Caching: Prevents auth session hangs on idle tabs

## 🛡️ 5. Resilience & Discovery Layers

### A. Data Loss Prevention (3-Layer Protection)
1.  **Layer 1:** Zero-Post Protection (Build passes even with empty API responses)
2.  **Layer 2:** Low-Count Threshold (<50 posts triggers snapshot fallback)
3.  **Layer 3:** Try/Catch Build Failure (Graceful degradation to cached data)
4.  **Layer 4:** Unified Feed Resilience (Blogger fails → Supabase only, vice versa)

### B. Discovery & SEO Layer
*   **Dynamic Sitemap:** `sitemap.js` auto-generates URLs for all content sources
    *   Blogger legacy content (57+ items)
    *   Supabase community projects
    *   User profiles and public wishlists
    *   Creator portfolios (`/[username]/projects`)
*   **Robots Protocol:** `robots.js` allows crawling, protects `/api/` routes
*   **Schema Markup:** JSON-LD for both VideoGame and SoftwareApplication types

### C. Visual Resilience
*   **Loading States:** Cinematic Skeletons (`GameSkeleton.jsx`) prevent CLS
*   **Error Boundaries:** "System Failure" screen (`error.js`) with recovery options
*   **Authentication Loading:** Skeleton states during auth resolution
*   **Empty States:** Contextual empty screens (EmptyWishlist, etc.)

### D. Platform Health Monitoring
*   **Status Page:** `/status` with real-time service monitoring
*   **Health Checks:** API endpoints for database, auth, and storage
*   **Incident Tracking:** Historical uptime and issue resolution
*   **Service Categories:** Core Platform, The Forge, User Features, Infrastructure

### E. Content Moderation & Safety
*   **External Link Warnings:** Safety prompts before downloading from external sources
*   **Report System:** Community-driven content flagging with auto-moderation
*   **RLS Security:** Database-level access control prevents unauthorized data access
*   **Content Validation:** Server-side validation for all user-generated content

### F. Performance & Caching
*   **Request Caching:** 30-second TTL for expensive queries
*   **Cross-tab Sync:** localStorage synchronization for user data
*   **Image Optimization:** Next.js Image component with Blogger/Supabase domains
*   **Static Generation:** Pre-rendered pages for optimal performance


## 👤 6. User System & Identity Protocol (Phase 4 Complete)

### A. Architecture Overview
*   **Backend:** Supabase (Auth + Postgres + Storage)
*   **Authentication:** Required for persistent features (wishlists, publishing, profiles)
*   **Initialization:** `/initialize` screen forces Archetype selection for new users
*   **State Management:** `AuthProvider.jsx` provides user, profile, archetype context
*   **No Guest Accounts:** Browsing is free, but saving requires authentication

### B. Database Schema

#### Profiles Table:
```sql
create table profiles (
  id uuid primary key references auth.users,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  role text default 'user',
  archetype text not null check (archetype in ('hunter', 'netrunner', 'curator', 'phantom', 'architect')),
  profile_visibility text default 'public',
  is_public_wishlist boolean default true,
  developer_name text, -- For creators using The Forge
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

Wishlists Table:
create table wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  game_id text not null, -- Supports both Blogger IDs and Supabase project IDs
  added_at timestamptz default now(),
  unique(user_id, game_id)
);

C. The 5 Archetypes (User Classes)
Class	Color	Feed Algorithm	Dashboard Priority
Hunter	Ruby	Games First	Hero: Latest Games, Sec 1: Action/Shooter
Netrunner	Cyan	Tools First	Hero: Latest Apps, Sec 1: Development Tools
Curator	Amber	Quality First	Hero: Top Rated, Sec 1: Hidden Gems
Phantom	Violet	Underground	Hero: Random Selection, Sec 1: Shuffled Feed
Architect	Emerald	Creator Focus	Hero: The Forge, Sec 1: Publishing Tools
D. Authentication Flow
Guest Experience: Browse freely, see "Sign up to save" prompts
Registration: Email/OAuth → Username selection → Archetype choice
Dashboard Redirect: Authenticated users see personalized home feed
Creator Onboarding: Architects get access to The Forge immediately
E. UI Components & Behavior
Navbar Logic:
Guest: Transparent on Home (Landing), Fixed on Explore
Authenticated: Fixed Glass on Home (Dashboard) and Explore
Identity-Aware: UI accents adapt to user's archetype
Creator Tools: Architects see "The Forge" in navigation
Core Components:
AuthProvider.jsx: Central auth state with token caching
Profile Pages: /[username] - Public portfolios with cover images
Settings: /settings - Tabbed interface (Profile, Archetype, Privacy)
Wishlist Pages: /[username]/wishlist - Social wishlists (auth required)
Creator Dashboard: /[username]/dashboard - The Forge management interface
F. Visual Hierarchy (Color Logic)
Content Context (The Item):
Source: game.type ('Game' or 'App')
Logic: Games = Ruby, Apps = Cyan
Implementation: src/lib/theme-utils.js → getGameTheme(type)
User Context (The Interface):
Source: User's selected archetype
Logic: UI adapts to user's persona (Hunter=Ruby, Netrunner=Cyan, etc.)
Implementation: CSS Variable Injection (--user-accent)
Scope: Navbar, Buttons, Toasts, Profile Elements
G. Security & Privacy
Row Level Security (RLS): Database policies enforce data ownership
Public/Private Profiles: Users control visibility of profile and wishlist
Content Ownership: Creators retain full control over their projects
Data Portability: Users can export their data on request


## 🗺️ 7. Core Page Structure (Phase 4 Complete)

### A. Home Experience (Dual-Mode)
*   **Route:** `/`
*   **Guest:** Classic Landing Page (Hero, Marketing, Spotlight)
*   **Authenticated:** Personalized Dashboard (Archetype Feed, Wishlist Highlights)
*   **Implementation:** `HomeWrapper.jsx` switches between `LandingPage.jsx` and `UserDashboard.jsx`

### B. Discovery & Exploration
*   **The Vault (`/explore`):** Global search and discovery hub
    *   Unified content grid (Blogger + Supabase)
    *   Advanced filtering (Platform, Genre, Type)
    *   Special collections and featured content
*   **Item Details (`/view/[slug]`):** Hybrid Server/Client architecture
    *   Content-aware theming (Games=Ruby, Apps=Cyan)
    *   External link safety warnings
    *   Similar content recommendations

### C. User Identity & Social
*   **Public Profile (`/[username]`):** Creator portfolio and identity
    *   Cover image, avatar, bio, archetype display
    *   Published projects showcase
    *   Social links and contact information
*   **Public Wishlist (`/[username]/wishlist`):** Social discovery feature
    *   Authentication required (no guest wishlists)
    *   Privacy controls (public/private toggle)
    *   Sharing and export functionality
*   **Settings (`/settings`):** Account management hub
    *   Profile editing, archetype switching
    *   Privacy controls, account deletion

### D. The Forge (Creator Platform)
*   **Creator Dashboard (`/[username]/dashboard`):** Command center for creators
    *   Project management overview
    *   Publishing statistics and analytics
    *   Quick actions (Create, Edit, Publish)
*   **Project Management (`/[username]/dashboard/project/[id]`):** Individual project control
    *   Project cockpit with status overview
    *   Publishing workflow (Draft → Published)
    *   Asset management and version control
*   **Project Editor (`/[username]/dashboard/project/[id]/edit`):** Content creation interface
    *   Rich form with image uploads
    *   Platform-specific download links
    *   Tag management and categorization
*   **Public Portfolio (`/[username]/projects`):** Showcase published work
    *   Grid view of published projects
    *   Professional presentation for creators

### E. Platform & Legal
*   **Publishing Hub (`/publish`):** Creator onboarding and guidelines
    *   The Forge introduction and benefits
    *   Publishing guidelines and best practices
    *   Account creation flow for new creators
*   **Platform Status (`/status`):** Real-time health monitoring
    *   Service status grid (Core, Forge, Features, Infrastructure)
    *   Incident timeline and uptime statistics
    *   Phase completion indicators
*   **Legal Pages:** Standard compliance pages
    *   `/about` - Platform manifesto and evolution story
    *   `/help` - Comprehensive FAQ with creator guidance
    *   `/contact` - Support with creator-specific categories
    *   `/privacy` - Data practices including creator content
    *   `/terms` - Platform rules including creator responsibilities

### F. Authentication & Onboarding
*   **Authentication Pages:** `/login`, `/signup`
    *   Email and OAuth options
    *   Seamless redirect to intended destination
*   **Identity Setup (`/initialize`):** Required for new users
    *   Archetype selection with detailed explanations
    *   Immediate dashboard personalization
*   **Admin Console (`/admin`):** Stealth route for platform management
    *   User management and content moderation
    *   Project claims and migration tools
    *   System health and analytics

### G. Route Protection & Access Control
*   **Public Routes:** Home, Explore, View, About, Help, Contact, Status
*   **Authentication Required:** Wishlist, Settings, Dashboard, Admin
*   **Creator Only:** The Forge routes (`/[username]/dashboard/`)
*   **Owner Only:** Private drafts, personal settings, project editing
*   **Graceful Degradation:** Clear signup prompts for protected features

## 📂 8. Project Structure (Source of Truth)

```text
.gitignore
eslint.config.mjs
jsconfig.json
netlify.toml
next.config.mjs               # Updated with Google Image Domains + Supabase
package-lock.json
package.json
postcss.config.mjs
README.md

📦 public/
 ┣ 📜 __forms.html            # Netlify Forms Detection
 ┣ 📜 ru-logo.png
 ┣ 📜 rubieslogo.png
 ┗ 📜 [SVG assets]

📦 scripts/
 ┗ 📜 update-snapshot.js      # Dual-blog snapshot generator

📦src
 ┣ 📂app
 ┃ ┣ 📂about
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂admin
 ┃ ┃ ┣ 📂preview
 ┃ ┃ ┃ ┗ 📂[slug]
 ┃ ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┣ 📜AdminClient.jsx
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂api
 ┃ ┃ ┣ 📂admin
 ┃ ┃ ┃ ┣ 📂assign-blogger-posts
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┃ ┗ 📂moderate
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂games
 ┃ ┃ ┃ ┣ 📜route copy.js.backup
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂health
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂profile
 ┃ ┃ ┃ ┗ 📂update
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂projects
 ┃ ┃ ┃ ┣ 📂create
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┃ ┣ 📂delete
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┃ ┣ 📂update
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┃ ┣ 📂update-developer
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┃ ┗ 📂upload-image
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂report
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┗ 📂wishlist
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┣ 📂contact
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂explore
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂help
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂initialize
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂login
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂privacy
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂publish
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂settings
 ┃ ┃ ┣ 📜layout.js
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂signup
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂status
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂terms
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂view
 ┃ ┃ ┗ 📂[slug]
 ┃ ┃ ┃ ┣ 📜error.js
 ┃ ┃ ┃ ┣ 📜loading.js
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂[username]
 ┃ ┃ ┣ 📂dashboard
 ┃ ┃ ┃ ┣ 📂project
 ┃ ┃ ┃ ┃ ┗ 📂[id]
 ┃ ┃ ┃ ┃ ┃ ┣ 📂edit
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┃ ┃ ┃ ┣ 📂preview
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┃ ┣ 📜DashboardClient.jsx
 ┃ ┃ ┃ ┣ 📜layout.js
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┣ 📂projects
 ┃ ┃ ┃ ┣ 📜page.js
 ┃ ┃ ┃ ┗ 📜ProjectsClient.jsx
 ┃ ┃ ┣ 📂wishlist
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┣ 📜page.js
 ┃ ┃ ┗ 📜ProfileClient.jsx
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜globals.css
 ┃ ┣ 📜layout.js
 ┃ ┣ 📜not-found.js
 ┃ ┣ 📜page.js
 ┃ ┣ 📜robots.js
 ┃ ┗ 📜sitemap.js
 ┣ 📂components
 ┃ ┣ 📂analytics
 ┃ ┃ ┗ 📜InternalTrafficGuard.js
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📜AuthLoadingWrapper.jsx
 ┃ ┃ ┗ 📜AuthModal.jsx
 ┃ ┣ 📂explore
 ┃ ┃ ┣ 📜ExploreContent.jsx
 ┃ ┃ ┣ 📜GameGrid.jsx
 ┃ ┃ ┣ 📜GenreFilter.jsx
 ┃ ┃ ┣ 📜PlatformSelector.jsx
 ┃ ┃ ┣ 📜ScrollToTopButton.jsx
 ┃ ┃ ┣ 📜SpecialCollections.jsx
 ┃ ┃ ┣ 📜SpotlightHero.jsx
 ┃ ┃ ┣ 📜VaultFilters.jsx
 ┃ ┃ ┣ 📜VaultHeader.jsx
 ┃ ┃ ┗ 📜VaultSection.jsx
 ┃ ┣ 📂forge
 ┃ ┃ ┣ 📜ProjectCockpit.jsx
 ┃ ┃ ┗ 📜ProjectEditor.jsx
 ┃ ┣ 📂home
 ┃ ┃ ┣ 📜HomeWrapper.jsx
 ┃ ┃ ┣ 📜LandingPage.jsx
 ┃ ┃ ┗ 📜UserDashboard.jsx
 ┃ ┣ 📂moderation
 ┃ ┃ ┗ 📜ModerationNotificationBanner.jsx
 ┃ ┣ 📂providers
 ┃ ┃ ┣ 📜AuthProvider.jsx
 ┃ ┃ ┣ 📜ThemeProvider.jsx
 ┃ ┃ ┗ 📜ToastProvider.jsx
 ┃ ┣ 📂status
 ┃ ┃ ┣ 📜IncidentTimeline.jsx
 ┃ ┃ ┣ 📜ServiceGrid.jsx
 ┃ ┃ ┣ 📜StatusHero.jsx
 ┃ ┃ ┗ 📜UptimeStats.jsx
 ┃ ┣ 📂store
 ┃ ┃ ┣ 📜ContentWarningModal.jsx
 ┃ ┃ ┣ 📜DownloadCallout.jsx
 ┃ ┃ ┣ 📜GameCard.jsx
 ┃ ┃ ┣ 📜GameContent.jsx
 ┃ ┃ ┣ 📜GameHero.jsx
 ┃ ┃ ┣ 📜GameMedia.jsx
 ┃ ┃ ┣ 📜GameSidebar.jsx
 ┃ ┃ ┣ 📜GameSkeleton.jsx
 ┃ ┃ ┣ 📜ReportModal.jsx
 ┃ ┃ ┣ 📜SimilarGames.jsx
 ┃ ┃ ┗ 📜ViewClient.jsx
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜AboutSection.js
 ┃ ┃ ┣ 📜BackgroundEffects.js
 ┃ ┃ ┣ 📜ExternalLinkWarning.jsx
 ┃ ┃ ┣ 📜FeatureTriangles.js
 ┃ ┃ ┣ 📜Footer.js
 ┃ ┃ ┣ 📜GameModal.js
 ┃ ┃ ┣ 📜GameVault.js
 ┃ ┃ ┣ 📜GiantRuby.js
 ┃ ┃ ┣ 📜Hero.js
 ┃ ┃ ┣ 📜Navbar.js
 ┃ ┃ ┣ 📜NotificationPanel.jsx
 ┃ ┃ ┣ 📜PreviewBanner.jsx
 ┃ ┃ ┣ 📜SearchCommandCenter.jsx
 ┃ ┃ ┣ 📜SearchDropdown.jsx
 ┃ ┃ ┣ 📜SessionErrorOverlay.jsx
 ┃ ┃ ┣ 📜Skeleton.jsx
 ┃ ┃ ┣ 📜Toast.jsx
 ┃ ┃ ┗ 📜ToastContainer.jsx
 ┃ ┣ 📂wishlist
 ┃ ┃ ┣ 📜EmptyWishlist.jsx
 ┃ ┃ ┣ 📜WishlistControls.jsx
 ┃ ┃ ┣ 📜WishlistGrid.jsx
 ┃ ┃ ┗ 📜WishlistStats.jsx
 ┃ ┗ 📜SessionErrorOverlay.jsx
 ┣ 📂hooks
 ┃ ┣ 📜useDebounce.js
 ┃ ┣ 📜useGameFilters.js
 ┃ ┣ 📜useScrollBehavior.js
 ┃ ┣ 📜useSearch.js
 ┃ ┣ 📜useServiceStatus.js
 ┃ ┣ 📜useSessionGuard.js
 ┃ ┣ 📜useToast.js
 ┃ ┗ 📜useWishlist.js
 ┣ 📂icons
 ┃ ┗ 📜discord.svg
 ┣ 📂lib
 ┃ ┣ 📂config
 ┃ ┃ ┗ 📜platforms.js
 ┃ ┣ 📂status
 ┃ ┃ ┣ 📜incidents.json
 ┃ ┃ ┣ 📜services.js
 ┃ ┃ ┗ 📜statusChecker.js
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜collectionMatchers.js
 ┃ ┃ ┣ 📜gameFilters.js
 ┃ ┃ ┣ 📜platformUtils.js
 ┃ ┃ ┣ 📜tagExtractor.js
 ┃ ┃ ┗ 📜textUtils.js
 ┃ ┣ 📜backup-data copy.json.backup
 ┃ ┣ 📜backup-data.json
 ┃ ┣ 📜blogger.js
 ┃ ┣ 📜feed-utils.js
 ┃ ┣ 📜game-service-client.js
 ┃ ┣ 📜game-service.js
 ┃ ┣ 📜game-utils.js
 ┃ ┣ 📜notificationManager.js
 ┃ ┣ 📜projectNotifications.js
 ┃ ┣ 📜seo-utils.js
 ┃ ┣ 📜supabase-server.js
 ┃ ┣ 📜supabase.js
 ┃ ┗ 📜theme-utils.js
 ┗ 📜proxy.js
 ```

## 🚀 9. Development Roadmap

### Phase 1: Foundation ✅ COMPLETE
*   **Core Features:** Wishlist system, Explore page, Status monitoring
*   **UI/UX:** Adaptive Navbar, Hybrid Footer, Mobile-first design
*   **Infrastructure:** Netlify hosting, Form handling, Basic SEO

### Phase 2: Resilience & SEO ✅ COMPLETE
*   **Data Architecture:** Dual-Blog system with active failover
*   **Rendering:** Hybrid Server/Client architecture for optimal SEO
*   **Discovery:** Dynamic sitemap generation and robots protocol
*   **Resilience:** Cinematic loading states and error boundaries
*   **Content:** Ecosystem pages (About, Publish, Legal documentation)

### Phase 3: Identity & Personalization ✅ COMPLETE
*   **Authentication:** Supabase integration with email and OAuth
*   **Identity System:** 5-Archetype classification with personalized experiences
*   **User Experience:** Personalized dashboards and archetype-based feeds
*   **Social Features:** Public profiles, social wishlists, settings management
*   **Data Migration:** Guest-to-user data synchronization (DEPRECATED in Phase 4)

### Phase 4: The Forge (Creator Platform) ✅ COMPLETE
*   **Creator Dashboard:** Full project management interface with analytics
*   **Publishing System:** Draft-to-published workflow with content validation
*   **Asset Management:** Image uploads and file hosting via Supabase Storage
*   **Unified Feed:** Seamless integration of legacy Blogger + community content
*   **Content Moderation:** Report system with auto-flagging and admin tools
*   **Security:** Row Level Security policies and external link warnings
*   **Architecture Cleanup:** Removed guest accounts for simplified codebase

### Phase 5: Analytics & Social Layer ⏳ NEXT
Analytics & Discovery:
View tracking and download metrics for creators
Trending algorithm highlighting hot games this week
Enhanced discovery through engagement-based recommendations
*   **Social Features:**
    *   Follow system (creators and curators)
    *   Comments and ratings on projects
    *   Activity feeds ("New from creators you follow")
Creator Insights:
Comprehensive analytics dashboard (views, downloads, ratings)
Performance tracking and audience engagement metrics


### Phase 6: Ecosystem Expansion 🔮 FUTURE
PWA
Community Features:
Creator collaboration tools and co-authoring
Community challenges and featured collections
Advanced Discovery:
Recommendation engine based on user behavior patterns
Collaborative filtering for "Users who liked this also liked"
Advanced search with semantic matching and AI-powered suggestions


PHASE 7: 
Mobile app (React Native) with offline capabilities
Desktop app (Electron) for power users
Multi-language support and localization

### Current Focus: Phase 5 Preparation
*   **Database Schema:** Design analytics tables and social relationship models
*   **Performance:** Optimize unified feed for larger datasets
*   **Infrastructure:** Prepare for increased traffic and data volume
*   **User Research:** Gather feedback on Phase 4 features and identify Phase 5 priorities
Here's your Phase 5 preparation checklist:

## Phase 5: Analytics & Social Layer - Preparation

### Database Schema Design
**Analytics Tables:**
```sql
-- View/download tracking
analytics_events (id, user_id, project_id, event_type, timestamp, metadata)
project_stats (project_id, total_views, total_downloads, avg_rating, updated_at)

-- Social relationships
follows (follower_id, following_id, created_at)
comments (id, user_id, project_id, content, created_at, updated_at)
ratings (user_id, project_id, rating, created_at)
```

**Trending Algorithm Prep:**
- Design scoring formula (views + downloads + ratings + recency weight)
- Plan time-window calculations (daily/weekly trending)
- Index strategy for performance

### Performance Optimization
**Feed Architecture:**
- Pagination strategy for "following" feeds
- Caching layer for trending calculations
- Database indexes for social queries

**Analytics Pipeline:**
- Event batching for high-volume tracking
- Background jobs for stats aggregation
- Real-time vs. batch processing decisions

### UI/UX Planning
**Social Components:**
- Comment thread design and moderation
- Rating display (stars vs. thumbs vs. numeric)
- Follow button states and notifications
- Activity feed layout and infinite scroll

**Analytics Dashboard:**
- Creator metrics visualization
- Engagement charts and trends
- Export capabilities for creator data

### Infrastructure Considerations
**Scalability:**
- Rate limiting for social actions
- Spam prevention for comments/ratings
- Notification system architecture

**Data Privacy:**
- Analytics data retention policies
- User consent for tracking
- GDPR compliance for social features

### Feature Prioritization
**MVP Social Features:**
1. Basic follow system
2. Simple rating (1-5 stars)
3. Comments with basic moderation
4. Personalized user feeds

**Analytics MVP:**
1. View/download counting
2. Basic trending (last 7 days)
3. Creator dashboard with key metrics



## 🔐 16. Environment Variables
**`next.config.mjs` MUST include:**
```javascript
images: {
  remotePatterns: [
    { hostname: 'blogger.googleusercontent.com' },
    { hostname: 'lh3.googleusercontent.com' }
  ]
}
```

## 🎊 18. Success Metrics (Current)
*   **Total Inventory:** 59+ Items (Snapshot + Live).
*   **SEO Score:** 100/100 (Dynamic Metadata + Sitemap).
*   **Uptime:** 99.9% (Static Delivery).
*   **Protection:** Layer 3 (Snapshot + Build Safety).
*   **Visuals:** Zero CLS (Layout Shift) due to Skeletons.

---

**End of Master Prompt v23.0 💎**
*This document captures the entire project state, including the Phase 2 completion of Hybrid Architecture and SEO Discovery.*





