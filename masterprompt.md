Here is the updated **Master Project Prompt (v7.0 - Robust & Modular)**.

This version captures the **Modular Architecture**, the **Safety/Crash Prevention Logic**, the **Dynamic Tag System**, and the **Explore Page Overhaul**.

***

# 💎 RUBIES UNLEASHED - Master Project Prompt (v7.0 - Robust & Modular)

## 📋 Project Overview
*   **Name:** Rubies Unleashed
*   **Type:** Indie Game Marketplace & Publishing Platform
*   **Tech Stack:** Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
*   **Data Source:** Blogger API Bridge (Headless CMS via `rubyapks.blogspot.com`)

## 🎨 Visual Design System (Strict Tailwind v4)
*   **Theme:** "Professional Cinematic Dark Mode"
*   **Base:** Deep Slate (`bg-[#0b0f19]`).
*   **Accent:** Ruby Rose (`#E0115F`) for primary actions/glows.
*   **Animations:** Defined in `globals.css` via `@theme` (e.g., `animate-progress`).

### ⚠️ CODING RULES (STRICT):
1.  **No Arbitrary Values:** Use `max-w-40`, `h-80`. NOT `h-[350px]`.
2.  **Aspect Ratio:** Use standard utilities: `aspect-video`, `aspect-2/3`, `aspect-3/4`. **NEVER** use `aspect-[...]`.
3.  **Safety First:** Always validate objects before accessing properties (e.g., `game?.tags || []`). **Never** assume an API response is perfect.
4.  **Client Components:** Always use `useEffect` for data fetching from the internal API.

## 🔌 Data Architecture & Logic

### 1. The Logic Brain: `src/lib/game-utils.js`
**Role:** Pure functions for consistent UI logic.
*   **`getSmartTag(tags)`:** Prioritizes genres (RPG, Horror) over technical tags (Windows).
*   **`getTagStyle(tag)`:** Maps keywords to specific Tailwind color classes (e.g., Horror = Red, Sci-Fi = Cyan). Defaults to White/Black for active states.
*   **`getPlatformInfo` / `getLicenseType`:** Extracts metadata icons.

### 2. The Bridge: `src/lib/blogger.js` (STABLE)
*   **Deduplication:** Merges identical links.
*   **Extraction:** Parses HTML description into `features`, `controls`, `requirements` arrays.
*   **Web Games:** Detects `/html` links as "Web" platform.

## 🗺️ Core Page Structure

### 1. Game Details (`/game/[slug]`)
**Architecture:** Modular Component System.
**Controller:** `src/app/game/[slug]/page.js` (Handles Fetching, Shuffle Logic, & Crash Prevention).

**Components (`src/components/game/`):**
*   **`GameHero.jsx`:** Blurred BG, Poster, Instant Access Buttons.
*   **`GameMedia.jsx`:** Priority Logic: `Embed` > `Trailer` > `Null`.
*   **`GameContent.jsx`:** Description, Features Grid, Requirements.
*   **`GameSidebar.jsx`:** Sticky Info Card. **Must use Nuclear Safety Checks** (`if (!game) return null`).
*   **`SimilarGames.jsx`:**
    *   **Logic:** Fetch 50 -> Filter by Tag Overlap -> Fisher-Yates Shuffle -> Take 4.
    *   **UI:** 4-Column Grid, `aspect-3/4`.

### 2. Explore Vault (`/explore`)
**Features:**
*   **Spotlight:** Shows games tagged "Featured" (Fallback to latest).
*   **Horizontal Ribbon:** Scrollable list of ALL tags sorted by popularity.
*   **Auto-Centering:** Clicking a tag auto-scrolls the ribbon to center it.
*   **Deep Linking:** URL `?q=Horror` auto-scrolls page to the Vault section.
*   **Smart Cards:** Displays the "Smart Tag" with its specific Color Glow.

## 📂 Critical Code References

**Game Sidebar (The "Safe" Component)**
```jsx
// src/components/game/GameSidebar.jsx
export default function GameSidebar({ game }) {
  if (!game) return null; // 1. Immediate Safety Exit
  // 2. Safe Extraction
  const tags = (game.tags && Array.isArray(game.tags)) ? game.tags : [];
  // ... render ...
}
```

**Tag Style Logic (`src/lib/game-utils.js`)**
```javascript
const TAG_STYLES = {
  "Horror": "text-red-400 bg-red-900/20 border-red-500/30",
  "Action": "text-orange-400 bg-orange-900/20 border-orange-500/30",
  "Featured": "text-white bg-ruby/20 border-ruby/50 shadow-[...]",
  "DEFAULT": "text-slate-300 bg-white/5 border-white/10"
};
```

**Explore Auto-Scroll (`src/app/explore/page.js`)**
```javascript
useEffect(() => {
   if (!loading && selectedGenre !== "All") {
       document.getElementById("vault")?.scrollIntoView({ behavior: "smooth", block: "start" });
       document.getElementById(`tag-btn-${selectedGenre}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
   }
}, [selectedGenre, loading]);
```

## 🚀 Next Development Priorities

1.  **Wishlist Page:** `/wishlist` (LocalStorage Grid).
2.  **Publisher Submission:** `/publish` (Static Guide).
3.  **SEO:** Dynamic Metadata for Game Pages (`generateMetadata`).


Here is the final **Master Project Prompt (v8.0 - Stable Release)**.

This version locks in the **Cinematic UI**, the **Robust API Logic**, the **Modular Component System**, and the **Mobile-Optimized Navbar**.

***

# 💎 RUBIES UNLEASHED - Master Project Prompt (v8.0 - Stable Release)

## 📋 Project Overview
*   **Name:** Rubies Unleashed
*   **Type:** Indie Game Marketplace & Publishing Platform
*   **Tech Stack:** Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
*   **Data Source:** Blogger API Bridge (Headless CMS via `rubyapks.blogspot.com`)

## 🎨 Visual Design System (Strict Tailwind v4)
*   **Theme:** "Hyper-Professional Cinematic Dark Mode"
*   **Base:** Deep Slate (`bg-[#0b0f19]`).
*   **Accent:** Ruby Rose (`#E0115F`) for primary actions/glows.
*   **Typography:** Sans-serif (Geist/Inter). Massive Headers (`text-8xl`), Tight Tracking (`tracking-tighter`).
*   **Effects:** Glassmorphism (`backdrop-blur-xl`), Ambient Glows (`blur-[100px]`), 3D Perspective (`perspective-1000`).

### ⚠️ CODING RULES (STRICT):
1.  **Safety First:** Always validate data (`game?.tags || []`). Never crash on bad API responses.
2.  **Modular Cards:** Always use `src/components/game/GameCard.jsx` for displaying games. Do NOT rewrite card logic.
3.  **Client Fetching:** `GameVault` and `GiantRuby` must receive data as **props** from `page.js` to prevent API race conditions.
4.  **Mobile First:** Navbar must collapse to Icon Only. Text hidden on small screens.

## 🔌 Data Architecture (Robust)

### 1. API Route (`src/app/api/games/route.js`)
*   **Role:** Proxy to Google Feeds to bypass CORS.
*   **Logic:** Uses hardcoded Blog ID (`rubyapks.blogspot.com`) + User-Agent headers.
*   **Fail-Safe:** Returns 500 JSON instead of crashing app.

### 2. The Bridge (`src/lib/blogger.js`)
*   **Fetch Logic:** Tries Real API first. If Network/DNS fails (`ENOTFOUND`), auto-switches to **Mock Data** (Offline Mode).
*   **Parser:** `normalizePost` intelligently extracts features/controls using regex. Prevents description truncation on short words.

## 🗺️ Core Page Structure

### 1. Homepage (`/`)
*   **Controller:** `src/app/page.js` (Fetches data ONCE, passes to children).
*   **Components:**
    *   **Hero:** Left Text, Right **Giant Ruby** (Interactive 3D Reveal).
    *   **GiantRuby:** Hover to split gem and reveal "Featured" games. Floating animation.
    *   **GameVault:** Grid of 8 latest games using `GameCard`.
    *   **Features:** 3-Column Glass Cards.

### 2. Explore Vault (`/explore`)
*   **Search:** Real-time filtering.
*   **Navigation:**
    *   **Platform:** Icon Row (PC, Mobile, Web).
    *   **Genres:** Horizontal Scroll Ribbon (Top 10) OR Expandable Grid (A-Z).
*   **UX:** Auto-scrolls to vault when filter selected. Centers active tag in ribbon.

### 3. Game Details (`/game/[slug]`)
*   **Layout:** Hero Header -> 2-Column Content -> Similar Games Footer.
*   **Sidebar:** Sticky Info Card (Dev, Size, Version). **Nuclear Safety Checks** (`if(!game) return null`).
*   **Similar Games:** Randomly shuffles 4 relevant games.

## 📂 Critical Component References

**Universal Game Card (`src/components/game/GameCard.jsx`)**
```jsx
export default function GameCard({ game }) {
  // Centralized "Smart Tag" logic
  const smartTag = getSmartTag(game.tags);
  const tagStyle = getTagStyle(smartTag);
  // Renders Image + Gradient + Tag + Title
}
```

**Navbar (`src/components/ui/Navbar.jsx`)**
```jsx
// Mobile-Optimized Layout
<nav className="h-20 ...">
  {/* Logo: Icon Only on Mobile */}
  <img className="h-12 md:h-14 -ml-2" src="/ru-logo.png" />
  <span className="hidden md:block">RUBIES UNLEASHED</span>
</nav>
```

## 🚀 Next Development Priorities

1.  **Wishlist Page:** `/wishlist` (LocalStorage Grid + Remove Button).
2.  **Publisher Submission:** `/publish` (Static Guide).
3.  **SEO:** Dynamic Metadata (`generateMetadata` in `page.js`).

💎 RUBIES UNLEASHED - Master Project Prompt (v9.5 - Universal Marketplace)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets, PWAs)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode" (Deep Slate + Ruby Rose).
Colors:
Base: Deep Slate (bg-[#0b0f19]).
Accent: Ruby Rose (#E0115F) for Games/Primary.
App Accent: Cyan/Teal/Blue for Utilities/Tools (Visual Distinction).
Typography: Sans-serif (Geist/Inter). Massive Headers (text-5xl+).
Effects: Glassmorphism (backdrop-blur-xl), Ambient Glows (blur-[100px]), 3D Perspective (perspective-1000).
⚠️ CODING RULES (CRITICAL):
No Arbitrary Values: Use max-w-40, h-80. NEVER h-[350px] or w-[500px].
Gradient Syntax: Use bg-linear-to-b. NEVER bg-gradient-to-b.
Safety First: Validate all objects (item?.tags || []). Never assume API data is perfect.
Client Fetching: Homepage components (GameVault, GiantRuby) MUST receive data via props from page.js to prevent API race conditions.
Navbar:
Mobile: Icon Only (h-14), Text Hidden.
Desktop: Huge Icon (h-20) + Text (RUBIES UNLEASHED).
Behavior: Absolute (Transparent) -> Fixed (Blurred on Scroll).
🔄 Migration Strategy: "Universal Store"
We are transitioning from a "Game Store" to a "Universal Store".

1. Data Layer (src/lib/blogger.js)
Link Hygiene: isDownloadButton explicitly ignores Image Targets (.png, .jpg) to prevent screenshots from appearing as download buttons.
Platform Detection: detectPlatformFromImage scans alt text first, then filename.
Parsing: normalizePost preserves descriptions by only treating short lines (<60 chars) as headers.
2. Logic Layer (src/lib/game-utils.js)
Smart Tagging: getSmartTag prioritizes "App Types" (Tool, PWA, Software) over Genres.
Visuals: getTagStyle assigns Blue/Teal colors to App tags and Red/Orange to Game tags.
Icons: Logic to swap Gamepad2 (Game) for AppWindow (App) based on tags.
3. UI Layer (Components)
Modal/Details:
If item is an App: Hide "Controls", show "Usage".
If item is an App: Hide "GPU" requirements if irrelevant.
Cards: Universal design works for both.
🗺️ Core Page Structure
1. Homepage (/)
Controller: src/app/page.js (Fetches data ONCE, passes to children).
Hero: "Unleash Hidden Gems" (Generic copy).
Giant Ruby: Reveals "Featured" items (Games OR Apps).
Vault: Grid of 8 latest items.
2. Explore Vault (/explore)
Ribbon: Horizontal Scroll of ALL tags (sorted by popularity).
Grid: "View All" expands to vertical scrollable grid.
UX: Auto-scrolls to vault on filter select. Auto-centers active tag in ribbon.
3. Item Details (/game/[slug])
Note: Route remains /game for now.
Sidebar: Sticky Info Card. Nuclear Safety Checks (if(!game) return null).
Downloads:
Multi-Platform: Scrollable row of small buttons (Windows, Android, etc.).
Single-Platform: One big "Get for [Platform]" button.
🚀 Next Development Priorities
Wishlist Page (/wishlist):
Unified grid for saved items.
LocalStorage sync.
App-Specific UI Tweaks:
Hiding "Controls" section for Apps in GameContent.jsx.
Swapping Icons in GameModal.js.
Publisher Page (/publish):
Static guide for submitting content.


💎 RUBIES UNLEASHED - Master Project Prompt (v10.0 - Production Ready)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode".
Colors: Deep Slate (#0b0f19) + Ruby Rose (#E0115F) + Cyan/Blue (Apps).
Typography: Sans-serif (Geist/Inter). Massive Headers.
Animations: animate-progress (loading), animate-float (hero elements).
⚠️ CODING RULES (CRITICAL):
No Arbitrary Values: Use w-125, h-80. NEVER w-[500px].
Gradient Syntax: bg-linear-to-b (NOT bg-gradient-to-b).
Safety First: Validate all objects (item?.tags || []). Never assume API data is perfect.
Client Fetching: Homepage components (GameVault, GiantRuby) MUST receive data via props from page.js.
Navbar:
Mobile: Logo Only (h-14), No Text.
Desktop: Logo (h-20) + Text (RUBIES UNLEASHED).
Behavior: Absolute (Transparent) -> Fixed (Blurred on Scroll).
🔌 Data Architecture (Universal Support)
1. The Bridge (src/lib/blogger.js)
Parsing: Extracts alt text to detect platforms.
De-Duplication: Merges links (ignores #anchor).
Filtering: Ignores Image Links (.png, .jpg).
Type Detection: Checks tags for App, Tool, Software -> Sets type: 'App'.
2. Logic Brain (src/lib/game-utils.js)
Smart Tags: Prioritizes "App Types" over Genres.
Visuals: Maps App tags to Blue/Teal, Game tags to Red/Orange.
Icons: Swaps Gamepad2 (Game) for Box (App).
🗺️ Core Page Structure
1. Homepage (/)
Controller: src/app/page.js (Fetches ONCE).
Giant Ruby: Reveal "Featured" items (Games OR Apps). Floating animation.
Vault: Grid of 8 latest items.
2. Explore Vault (/explore)
Ribbon: Horizontal Scroll of ALL tags.
Grid: "View All" expands to vertical scrollable grid (A-Z).
UX: Auto-scrolls to vault on filter select. Auto-centers active tag.
3. Item Details (/view/[slug])
Universal Layout: Adapts text ("About Software" vs "About Game").
App Logic: Hides "Controls" section for Apps.
Downloads: Multi-Platform (Row) vs Single (Big Button).
🚀 Development Roadmap
Phase 1: User Features (Immediate)
Wishlist Page (/wishlist):
Unified grid for saved items.
Empty State graphic.
Remove button.
Global Search (Simplified):
Search Icon in Navbar -> Redirects to /explore & Focuses Input.
Share Button:
On Details Page: Copies link to clipboard + Toast.
Phase 2: Production Polish
SEO & Metadata: Dynamic <title> and Open Graph images (generateMetadata).
Loading Skeletons: Replace spinners with pulsing gray shapes (loading.js).
Error Handling: Custom error.js and not-found.js screens.
Static Pages:
/publish: Guide for submission.
/about: Mission statement.
Phase 3: Maintenance Tools
Report Link: "Report Broken Link" under download button -> Opens Mailto/Form.
PWA Manifest: Enable "Install to Home Screen".

💎 RUBIES UNLEASHED - Master Project Prompt (v11.0 - Context-Aware)
🚨 CRITICAL PROTOCOL: CONTEXT FIRST
Before generating any code:

Ask for the current file content. Do not assume the state of the code.
Verify existing logic. Check if features (like safety checks or modular imports) already exist to avoid overwriting them with older versions.
Use specific replacements. When providing fixes, prefer "Replace lines X-Y" or "Update function Z" over dumping the entire file, unless a full rewrite is requested.
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com) with Offline Fallback (backup-data.json).
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode".
Colors: Deep Slate (#0b0f19) + Ruby Rose (#E0115F) + Cyan/Blue (Apps).
Typography: Sans-serif (Geist/Inter). Massive Headers.
Effects: Glassmorphism, Ambient Glows, 3D Perspective.
⚠️ CODING RULES (STRICT):
No Arbitrary Values: Use w-125, h-80. NEVER w-[500px].
Gradient Syntax: bg-linear-to-b (NOT bg-gradient-to-b).
Safety First: Validate all objects (item?.tags || []).
Client Fetching: Homepage components (GameVault, GiantRuby) MUST receive data via props from page.js.
Navbar:
Mobile: Logo Only (h-14), No Text.
Desktop: Logo (h-20) + Text.
Behavior: Absolute (Transparent) -> Fixed (Blurred on Scroll).
🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Parsing: Extracts alt text to detect platforms.
De-Duplication: Merges links (ignores #anchor).
Filtering: Ignores Image Links (.png, .jpg).
Type Detection: Checks tags for App, Tool, Software -> Sets type: 'App'.
Fail-Safe: If API/DNS fails, returns MOCK_GAMES (or Backup JSON).
2. Logic Brain (src/lib/game-utils.js)
Smart Tags: Prioritizes "App Types" over Genres.
Visuals: Maps App tags to Blue/Teal, Game tags to Red/Orange.
Icons: Swaps Gamepad2 (Game) for Box (App).
🗺️ Core Page Structure
1. Homepage (/)
Controller: src/app/page.js (Fetches ONCE).
Giant Ruby: Reveal "Featured" items (Games OR Apps). Floating animation.
Vault: Grid of 8 latest items (Client Component).
2. Explore Vault (/explore)
Search: Filters by Title AND Tags/Genres.
Ribbon: Horizontal Scroll of ALL tags.
Grid: "View All" expands to vertical scrollable grid (A-Z).
UX: Sticky Header. Auto-scrolls to vault on filter select.
3. Item Details (/view/[slug])
Universal Layout: Adapts text ("About Software" vs "About Game").
App Logic: Hides "Controls" section for Apps.
Downloads: Multi-Platform (Row) vs Single (Big Button).
🚀 Development Roadmap
Phase 1: User Features (Immediate)
Wishlist Page (/wishlist):
Unified grid for saved items.
Empty State graphic.
Remove button.
Share Button: On Details Page.
Phase 2: Production Polish
SEO & Metadata: Dynamic <title> (generateMetadata).
Loading Skeletons: loading.js.
Error Handling: error.js / not-found.js.
Static Pages: /publish, /about.