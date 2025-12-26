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

 ┣ 📂public
 ┃ ┣ 📜file.svg
 ┃ ┣ 📜globe.svg
 ┃ ┣ 📜next.svg
 ┃ ┣ 📜ru-logo.png
 ┃ ┣ 📜vercel.svg
 ┃ ┗ 📜window.svg
 ┣ 📂scripts
 ┃ ┗ 📜update-snapshot.js
 ┣ 📂src
 ┃ ┣ 📂app
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┃ ┗ 📂games
 ┃ ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┃ ┣ 📂explore
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┣ 📂view
 ┃ ┃ ┃ ┗ 📂[slug]
 ┃ ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┃ ┣ 📜favicon.ico
 ┃ ┃ ┣ 📜globals.css
 ┃ ┃ ┣ 📜layout.js
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂components
 ┃ ┃ ┣ 📂store
 ┃ ┃ ┃ ┣ 📜DownloadCallout.jsx
 ┃ ┃ ┃ ┣ 📜GameCard.jsx
 ┃ ┃ ┃ ┣ 📜GameContent.jsx
 ┃ ┃ ┃ ┣ 📜GameHero.jsx
 ┃ ┃ ┃ ┣ 📜GameMedia.jsx
 ┃ ┃ ┃ ┣ 📜GameSidebar.jsx
 ┃ ┃ ┃ ┗ 📜SimilarGames.jsx
 ┃ ┃ ┗ 📂ui
 ┃ ┃ ┃ ┣ 📜AboutSection.js
 ┃ ┃ ┃ ┣ 📜BackgroundEffects.js
 ┃ ┃ ┃ ┣ 📜FeatureTriangles.js
 ┃ ┃ ┃ ┣ 📜Footer.js
 ┃ ┃ ┃ ┣ 📜GameModal.js
 ┃ ┃ ┃ ┣ 📜GameVault.js
 ┃ ┃ ┃ ┣ 📜GiantRuby.js
 ┃ ┃ ┃ ┣ 📜Hero.js
 ┃ ┃ ┃ ┗ 📜Navbar.js
 ┃ ┗ 📂lib
 ┃ ┃ ┣ 📜backup-data.json
 ┃ ┃ ┣ 📜blogger.js
 ┃ ┃ ┗ 📜game-utils.js
 ┣ 📜.gitignore
 ┣ 📜eslint.config.mjs
 ┣ 📜jsconfig.json
 ┣ 📜netlify.toml
 ┣ 📜next.config.mjs
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜postcss.config.mjs
 ┗ 📜README.md

 Perfect! Your final blogger.js is solid! 🎉

Here's a clean summary of what your parser now handles:

✅ Features Successfully Implemented:
1. Content Extraction:
✅ Descriptions - Properly reconstructed paragraphs with smart sentence detection
✅ Features - List parsing with duplicate removal
✅ System Requirements - Platform-specific requirements
✅ Controls - Keyboard/mouse/gamepad mappings
✅ Content Warnings - Age ratings and content advisories
✅ Social Links - Patreon, Discord, YouTube, etc.
2. Metadata Detection:
✅ Developer extraction from structured metadata
✅ Build Platform detection (Windows, Mac, Linux, Android, iOS, Web)
✅ App vs Game classification based on tags
✅ Tags from Blogger categories
3. Media Handling:
✅ Main Cover Image with fallback placeholder
✅ Screenshots (up to 6, excludes cover and download buttons)
✅ Videos (YouTube, Vimeo, etc.)
✅ Game Embeds (Itch.io, Newgrounds, etc.)
4. Download Links:
✅ Platform Detection from image filenames and alt text
✅ Duplicate Removal and URL normalization
✅ Smart Sorting (Windows, Mac, Linux, Android, iOS, Web)
5. Robust Parsing:
✅ HTML Cleaning - Removes hidden elements, scripts, styles
✅ Attribute Filtering - Skips HTML remnants
✅ Smart Paragraph Reconstruction - Merges broken lines
✅ Metadata Exit Detection - Prevents data leakage between sections
📋 Quick Tips for Blog Post Structure:
For best results, structure your Blogger posts like this:

HTML

<!-- 1. Cover Image -->
<div class="separator">
    <img src="..." alt="Cover" />
</div>

<!-- 2. Description -->
<div>
    <p>First paragraph...</p>
    <p>Second paragraph...</p>
</div>

<!-- 3. Content Warning (BEFORE metadata!) -->
<h3>Content Warning:</h3>
<ul>
    <li>Warning 1</li>
    <li>Warning 2</li>
</ul>

<!-- 4. Metadata -->
<div>
    Developer – <a href="...">Name</a>
    Version – 1.0
    Build – Windows, Mac, Linux
</div>

<!-- 5. Features -->
<h3>Features:</h3>
<ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
</ul>

<!-- 6. Screenshots -->
<h3>Screenshots:</h3>
<img src="..." />

<!-- 7. Video -->
<h3>Gameplay Video:</h3>
<iframe src="youtube..."></iframe>

<!-- 8. Download -->
<h3>Download:</h3>
<a href="..."><img src="download-button.png" /></a>


💎 RUBIES UNLEASHED - Master Project Prompt (v12.0 - Universal & Immersive)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Base: Deep Slate (bg-[#0b0f19]).
Accent: Ruby Rose (#E0115F) for Games/Primary.
Secondary: Cyan/Teal for Apps/Tools.
Effects: Glassmorphism (backdrop-blur-xl), Ambient Glows, Parallax Backgrounds.
Mobile Experience: "Native App Feel" -> Hidden Global Navbar on Details, Floating Action Bars, Swipe-friendly.
⚠️ CODING RULES (CRITICAL):
Z-Index Stratification:
z-50: Modals, Overlays.
z-40: Mobile Floating Action Bars (must sit below Modals/Menus).
z-30: Sticky Headers, Floating Back Buttons.
z-0 to z-20: Page Content.
No Arbitrary Values: Use w-125, h-80. NOT w-[500px].
Safety First: Validate all objects (game?.tags || []). Never crash on missing data.
Navigation Hygiene: On Mobile Details Page (/view/[slug]), HIDE the global Navbar to prevent "Double Header" clutter. Use the Hero's internal navigation instead.
🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Context-Aware Parsing:
Extracts Content Warnings (<h3>Warning:</h3>).
Extracts Social Links (Discord, Patreon).
Detects Platform via Image Alt Text & Filenames.
Fail-Safe: Returns backup-data.json if API fails.
2. Logic Brain (src/lib/game-utils.js)
Smart Classification:
isApp: Checks tags for "App", "Tool", "Software".
Visuals: Swaps Gamepad2 (Game) for Box (App).
Colors: Apps get Blue/Teal accents; Games get Ruby.
🗺️ Core Page Structure
1. Explore Vault (/explore)
Features: Deep Linking (?q=), Dynamic Tag Ribbon (Auto-Centers Active Tag), Smart Search (Title + Tag + Developer).
UX: Sticky Filter Header, Auto-scroll to Vault on interaction.
2. Item Details (/view/[slug])
Hybrid Layout:
Mobile: Immersive "App" Mode. Global Navbar Hidden. Floating Back Button (Top Left). Floating Action Bar (Bottom Fixed).
Desktop: Cinematic Widescreen Mode. Standard Sidebar Layout.
Scroll Targets: #download-section and #about-section for smooth navigation.
Components:
GameHero.jsx: Handles the Responsive Hybrid Layout + Share Logic (Native Sheet vs Clipboard).
GameMedia.jsx: Cinematic Lightbox for screenshots.
SimilarGames.jsx: Priority Engine -> Developer Matches (Shuffle) > Tag Matches (Shuffle).
📂 Critical Logic References
Mobile Floating Bar Logic (src/components/store/GameHero.jsx)

React

// Auto-hide on scroll to prevent reading obstruction
useEffect(() => {
  const handleScroll = () => setShowFloatingBar(window.scrollY < 100);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
Developer Priority Sorting (src/app/view/[slug]/page.js)

JavaScript

// 1. Priority A: Developer Matches (Exact match, ignore "Unknown")
const devMatches = allGames.filter(g => g.developer === data.developer);
// 2. Priority B: Tag Matches (Deduplicated)
const tagMatches = allGames.filter(g => !devMatches.includes(g) && hasTagOverlap(g));
// 3. Shuffle & Slice
const final = [...shuffle(devMatches), ...shuffle(tagMatches)].slice(0, 4);
🚀 Next Development Priorities (Phase 1)
Wishlist Page (/wishlist):

Goal: A dedicated page to view saved items.
Tech: localStorage reading.
UI: Grid layout using GameCard.
Features: "Remove" button, Empty State illustration.
SEO & Metadata:

Dynamic generateMetadata for /view/[slug] to show Game Title/Image on Discord/Twitter embeds.
Publisher Page (/publish):

Static guide for submitting content.