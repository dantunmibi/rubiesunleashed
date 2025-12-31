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
ALWAYS REQUEST FOR CONTEXTUAL FILES BEFORE IMPLEMENTING NEW FEATURES
DO NOT GENERATE AY PIECE OF CODE UNLESS GIVEN SPECIFIC INSTRUCTIONS TO DO SO
DO NOT BREAK ANY CURRENT LOGIC OR RECREATE EXISTING LOGICS OR COMPONENTS TO ENSURE FULL MODULARITY
DO NOT STRIP OR TRIM MY CODE IN ANYWAY INCLUDING REMOVING COMMENTS
ENSURE A SUMMARY OF THE FILE IS INCLUDED AND COMMENTED AT THE TOP OF THE FILE

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


Goal: A dedicated page to view saved items.
Tech: localStorage reading.
UI: Grid layout using GameCard.
Features: "Remove" button, Empty State illustration.
SEO & Metadata:

Dynamic generateMetadata for /view/[slug] to show Game Title/Image on Discord/Twitter embeds.
Publisher Page (/publish):

Static guide for submitting content.

 ┣ 📂public
 ┃ ┣ 📜file.svg
 ┃ ┣ 📜globe.svg
 ┃ ┣ 📜next.svg
 ┃ ┣ 📜ru-logo.png
 ┃ ┣ 📜vercel.svg
 ┃ ┗ 📜window.svg
 ┣ 📂scripts
 ┃ ┗ 📜update-snapshot.js
📦src
 ┣ 📂app
 ┃ ┣ 📂api
 ┃ ┃ ┗ 📂games
 ┃ ┃ ┃ ┗ 📜route.js
 ┃ ┣ 📂contact
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂explore
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂privacy
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂terms
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂view
 ┃ ┃ ┗ 📂[slug]
 ┃ ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📂wishlist
 ┃ ┃ ┗ 📜page.js
 ┃ ┣ 📜favicon.ico
 ┃ ┣ 📜globals.css
 ┃ ┣ 📜layout.js
 ┃ ┗ 📜page.js
 ┣ 📂components
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
 ┃ ┣ 📂store
 ┃ ┃ ┣ 📜ContentWarningModal.jsx
 ┃ ┃ ┣ 📜DownloadCallout.jsx
 ┃ ┃ ┣ 📜GameCard.jsx
 ┃ ┃ ┣ 📜GameContent.jsx
 ┃ ┃ ┣ 📜GameHero.jsx
 ┃ ┃ ┣ 📜GameMedia.jsx
 ┃ ┃ ┣ 📜GameSidebar.jsx
 ┃ ┃ ┗ 📜SimilarGames.jsx
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜AboutSection.js
 ┃ ┃ ┣ 📜BackgroundEffects.js
 ┃ ┃ ┣ 📜FeatureTriangles.js
 ┃ ┃ ┣ 📜Footer.js
 ┃ ┃ ┣ 📜GameModal.js
 ┃ ┃ ┣ 📜GameVault.js
 ┃ ┃ ┣ 📜GiantRuby.js
 ┃ ┃ ┣ 📜Hero.js
 ┃ ┃ ┗ 📜Navbar.js
 ┃ ┗ 📂wishlist
 ┃ ┃ ┣ 📜EmptyWishlist.jsx
 ┃ ┃ ┗ 📜WishlistGrid.jsx
 ┣ 📂hooks
 ┃ ┣ 📜useGameFilters.js
 ┃ ┗ 📜useScrollBehavior.js
 ┗ 📂lib
 ┃ ┣ 📂config
 ┃ ┃ ┗ 📜platforms.js
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜collectionMatchers.js
 ┃ ┃ ┣ 📜gameFilters.js
 ┃ ┃ ┣ 📜platformUtils.js
 ┃ ┃ ┣ 📜tagExtractor.js
 ┃ ┃ ┗ 📜textUtils.js
 ┃ ┣ 📜backup-data.json
 ┃ ┣ 📜blogger.js
 ┃ ┗ 📜game-utils.js
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

💎 RUBIES UNLEASHED - Master Project Prompt (v13.0 - Universal & Immersive)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Base: Deep Slate (bg-[#0b0f19])
Accent: Ruby Rose (#E0115F) for Games/Primary
Secondary: Cyan/Teal for Apps/Tools
Effects: Glassmorphism (backdrop-blur-xl), Ambient Glows, Parallax Backgrounds
Mobile Experience: "Native App Feel" → Hidden Global Navbar on Details, Floating Action Bars, Swipe-friendly
⚠️ CRITICAL CODING RULES
1. Z-Index Stratification
text

z-100: Toasts, Top-level notifications
z-50: Modals, Overlays
z-40: Mobile Floating Action Bars (must sit below Modals/Menus)
z-30: Sticky Headers, Floating Back Buttons
z-0 to z-20: Page Content
2. Tailwind v4 Syntax (STRICT)
❌ NEVER USE:

bg-gradient-to-b → ✅ Use bg-linear-to-b
w-[500px] → ✅ Use w-125
min-w-[280px] → ✅ Use min-w-70
z-[100] → ✅ Use z-100
3. Safety Rules
✅ Validate all objects: game?.tags || []
✅ Never crash on missing data
✅ ALWAYS request contextual files before implementing features
✅ DO NOT generate code unless given specific instructions
✅ DO NOT break current logic or recreate existing components
✅ DO NOT strip or trim code in any way (preserve all comments)
✅ ENSURE a summary of the file is included and commented at the top of every file
4. Navigation Hygiene
On Mobile Details Page (/view/[slug]), HIDE the global Navbar to prevent "Double Header" clutter. Use the Hero's internal navigation instead.

🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Context-Aware Parsing:

Extracts Content Warnings (<h3>Warning:</h3>)
Extracts Social Links (Discord, Patreon, Developer sites)
Detects Platform via Image Alt Text & Filenames
Fail-Safe: Returns backup-data.json if API fails
Features Extracted:

Cover Image (by alt text: "Game Cover", "Cover", "Icon")
Screenshots (excludes cover, tiny icons, download buttons)
Download Links (platform detection via URL + alt text)
Developer metadata
Features, Requirements, Controls, How It Works
Age Rating, Content Warnings
Videos, Game Embeds
2. Logic Brain (src/lib/game-utils.js)
Smart Classification:

isApp: Checks tags for "App", "Tool", "Software"
Visuals: Swaps Gamepad2 (Game) for Box (App)
Colors: Apps get Blue/Teal accents; Games get Ruby
3. User System (src/lib/userManager.js)
Temporary Guest Accounts:

Auto-generates usernames (e.g., "Ruby_Gamer_42")
Random avatar emojis (💎🎮⚡)
Persistent localStorage
Backend-ready structure for real auth migration
NO auto-creation - only creates user when explicitly requested via createGuestUser()
Functions:

JavaScript

getCurrentUser()          // Returns null if no user
createGuestUser()         // Explicitly creates guest account
getWishlist()             // Returns user's wishlist
addToWishlist(game)       // Adds game (requires user)
removeFromWishlist(id)    // Removes game
isInWishlist(id)          // Check if game is wishlisted
clearWishlist()           // Clear all
getWishlistStats()        // Stats (total, games, apps)
🗺️ Core Page Structure
1. Home Page (/)
Hero section with giant ruby logo
Featured games carousel
About section
Call-to-action for Vault
2. Explore Vault (/explore)
Features:

Deep Linking (?q=search)
Dynamic Tag Ribbon (Auto-Centers Active Tag)
Smart Search (Title + Tag + Developer)
UX: Sticky Filter Header, Auto-scroll to Vault on interaction
3. Item Details (/view/[slug])
Hybrid Layout:

Mobile: Immersive "App" Mode
Global Navbar Hidden
Floating Back Button (Top Left)
Floating Action Bar (Bottom Fixed)
Desktop: Cinematic Widescreen Mode
Standard Sidebar Layout
Scroll Targets:

#download-section
#about-section
Components:

GameHero.jsx: Responsive Hybrid Layout + Share Logic
GameMedia.jsx: Cinematic Lightbox for screenshots
GameContent.jsx: Description, features, requirements
GameSidebar.jsx: Metadata, tags, developer info
DownloadCallout.jsx: Download buttons with platform detection
SimilarGames.jsx: Priority Engine (Developer Matches > Tag Matches)
ContentWarningModal.jsx: Age-gate overlay
4. Wishlist (/[username]/wishlist)
Features:

Username-based routing
Live search within wishlist
Sort options (Date ↑↓, A-Z, Z-A, Type)
Filter chips (All/Games/Apps)
Stats cards (Total, Games, Apps)
Share functionality (native + fallback)
Clear All with confirmation modal
Platform badges always visible
"Added X ago" timestamps
5. Authentication Pages
Login (/login):

Email/password form
Placeholder for real auth
Link to signup
Signup (/signup):

Username, email, password form
Placeholder for real auth
Link to login
🔐 Authentication System
Auth Flow:
text

User clicks ❤️ Wishlist
    ↓
Is user logged in?
    ├─ YES (Real Auth) → Add to wishlist via API [FUTURE]
    ├─ NO (Has Guest Session) → Add to guest wishlist
    └─ NO (First Time) → Show Auth Modal
            ↓
        User chooses:
        ├─ Sign Up → Navigate to /signup [Placeholder]
        ├─ Log In → Navigate to /login [Placeholder]
        └─ Continue as Guest → Create temp user + add to wishlist ✅
Auth Components:
AuthModal.jsx:

Beautiful ruby-themed modal
3 options: Sign Up, Log In, Continue as Guest
ESC key support
Body scroll lock
useAuth.js Hook:

Detects user type (real vs guest)
isGuest, isRealUser, isAuthenticated states
Backend-ready structure
useWishlist.js Hook:

Triggers auth modal if no user
Handles wishlist toggle
Shows toast notifications
Dispatches userChanged event
Event System:
JavaScript

// After guest creation or login:
window.dispatchEvent(new Event("userChanged"));

// Navbar listens and auto-updates:
window.addEventListener("userChanged", loadUser);
🎉 Toast Notification System
Components:
Toast.jsx: Individual toast with auto-dismiss
ToastContainer.jsx: Manages multiple toasts (top-right)
ToastProvider.jsx: Global context provider
useToast.js: Hook for showing toasts
Usage:
JavaScript

const { showToast } = useToastContext();
showToast("Added to wishlist!", "wishlist");
Toast Types:
success: Green with check icon
error: Red with alert icon
wishlist: Ruby with heart icon
info: Blue with info icon
Styling:
Ruby theme for wishlist actions
Auto-dismiss after 3 seconds
Click to dismiss
Slide-in animation from right
Fixed positioning: top-4 right-4 md:right-6 z-100
🚀 Development Roadmap
Phase 1: User Features (Completed ✅)
✅ Wishlist Page (/[username]/wishlist)
✅ Auth Gate System (Guest accounts)
✅ Toast Notifications
✅ Share functionality
✅ Search/Sort/Filter in wishlist
Phase 2: Production Polish
⏳ SEO & Metadata (Dynamic generateMetadata)
⏳ Loading Skeletons (Replace spinners with pulsing shapes)
⏳ Error Handling (Custom error.js and not-found.js)
⏳ Static Pages:
/publish: Guide for submission
/about: Mission statement
Phase 3: Real Authentication
⏳ Backend API for auth (/api/auth/login, /api/auth/signup)
⏳ OAuth providers (Google, Discord)
⏳ Email verification
⏳ Password reset
⏳ Migrate guest wishlists to real accounts
Phase 4: Maintenance Tools
⏳ Report Broken Link (under download button)
⏳ PWA Manifest (Install to Home Screen)
⏳ Admin dashboard for content moderation
📂 Project Structure
text

src/
├── app/
│   ├── api/
│   │   └── games/route.js          # Blogger API proxy
│   ├── view/[slug]/page.js         # Game details (hybrid auth)
│   ├── explore/page.js             # Vault with filters
│   ├── [username]/wishlist/page.js # User wishlist
│   ├── login/page.js               # Login placeholder
│   ├── signup/page.js              # Signup placeholder
│   ├── contact/page.js
│   ├── privacy/page.js
│   ├── terms/page.js
│   ├── layout.js                   # Root (wraps ToastProvider)
│   └── page.js                     # Home
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx           # Auth gate popup
│   ├── explore/
│   │   ├── ExploreContent.jsx
│   │   ├── GameGrid.jsx
│   │   ├── GenreFilter.jsx
│   │   ├── VaultFilters.jsx
│   │   └── ...
│   ├── providers/
│   │   └── ToastProvider.jsx       # Global toast context
│   ├── store/
│   │   ├── GameHero.jsx            # Hybrid hero (auth-aware)
│   │   ├── GameCard.jsx
│   │   ├── GameMedia.jsx
│   │   ├── SimilarGames.jsx
│   │   └── ContentWarningModal.jsx
│   ├── ui/
│   │   ├── Navbar.js               # Auto-updates on userChanged
│   │   ├── Toast.jsx               # Individual toast
│   │   ├── ToastContainer.jsx      # Toast manager
│   │   ├── GameModal.js            # Modal (auth-aware)
│   │   └── Footer.js
│   └── wishlist/
│       ├── WishlistGrid.jsx
│       ├── WishlistStats.jsx
│       ├── WishlistControls.jsx
│       └── EmptyWishlist.jsx
├── hooks/
│   ├── useAuth.js                  # Auth state management
│   ├── useWishlist.js              # Wishlist + auth gate
│   ├── useToast.js                 # Toast management
│   ├── useGameFilters.js
│   └── useScrollBehavior.js
├── lib/
│   ├── blogger.js                  # API parser (15+ features)
│   ├── game-utils.js               # Classification logic
│   ├── userManager.js              # Guest account system
│   ├── backup-data.json            # Fallback data
│   └── config/
│       └── platforms.js
└── ...
🎯 Blogger Post Template
Required Structure:
HTML

<!-- 1. COVER IMAGE -->
<img src="..." alt="Game Cover" />

<!-- 2. DESCRIPTION -->
<p>First paragraph...</p>

<!-- 3. METADATA BOX -->
<div>
    Developer – <a href="https://dev.com">Name</a>
    Version – 1.0
    Build – Windows, Mac, Linux, Android, iOS, Web
    Audience – 13+
</div>

<!-- 4. CONTENT WARNING (Optional) -->
<h3>Content Warning:</h3>
<ul>
    <li>Violence</li>
</ul>

<!-- 5. FEATURES -->
<h3>Features:</h3>
<ul>
    <li>Feature 1</li>
</ul>

<!-- 6. SYSTEM REQUIREMENTS (Optional) -->
<h3>System Requirements:</h3>
<ul>
    <li>OS: Windows 10+</li>
</ul>

<!-- 7. CONTROLS (Games) -->
<h3>Controls:</h3>
<ul>
    <li>WASD: Move</li>
</ul>

<!-- 8. HOW IT WORKS (Apps) -->
<h3>How It Works:</h3>
<ul>
    <li>Step 1...</li>
</ul>

<!-- 9. SOCIAL LINKS (Optional) -->
<h3>Support This Project:</h3>
<a href="https://patreon.com/...">Patreon</a>

<!-- 10. TRAILER (Optional) -->
<h3>Trailer:</h3>
<iframe src="https://youtube.com/embed/..."></iframe>

<!-- 11. SCREENSHOTS -->
<h3>Screenshots:</h3>
<img src="..." alt="Gameplay Screenshot 1" />

<!-- 12. DOWNLOAD SECTION -->
<h3>Download:</h3>
<a href="https://play.google.com/...">
    <img alt="Download for Android" src="button.png" />
</a>
<a href="https://github.com/.../game-windows.exe">
    <img alt="Download for Windows" src="button.png" />
</a>
<a href="https://github.com/.../game-mac.zip">
    <img alt="Download for Mac" src="button.png" />
</a>
Critical Rules:
✅ Cover image must have alt="Game Cover"
✅ Download button alt text must match platform (e.g., alt="Download for Windows")
✅ Mac files should include -mac, -macos, or .dmg in URL
✅ Developer link goes in metadata box (not wrapped in download button)
✅ Google Play links auto-detect as Android
✅ App Store links auto-detect as iOS
🔄 Snapshot System
Build Process:
Bash

npm run build
  ↓
1. Run update-snapshot.js → Fetch ALL posts (pagination) → Save to backup-data.json
2. Run next build → Use snapshot for static generation
Live Fallback:
If post not in snapshot → Fetch from Blogger RSS (last 100 posts)
New posts appear automatically (within 100 most recent)
Older posts require deployment to update snapshot
Files:
scripts/update-snapshot.js: Fetches all posts with pagination
src/lib/backup-data.json: Snapshot cache
src/app/api/games/route.js: Live API proxy
🎨 Design Tokens
Colors:
JavaScript

ruby: '#E0115F'
background: '#0b0f19'
surface: '#161b2c'
Typography:
Headings: Font-black, Uppercase, Tracking-tight
Body: Font-medium, Line-height 1.6
Labels: Font-bold, Uppercase, Tracking-widest, Text-xs
Spacing:
Sections: py-20
Cards: p-6 to p-8
Gaps: gap-4 to gap-12
Borders:
Default: border-white/10
Hover: border-ruby/30
Active: border-ruby
Shadows:
Cards: shadow-[0_0_60px_rgba(224,17,95,0.15)]
Buttons: shadow-[0_0_20px_rgba(224,17,95,0.3)]
🚨 Migration Path to Real Auth
Current (Guest System):
JavaScript

// userManager.js
getCurrentUser() // Returns temp user from localStorage

Future (Real Auth):
JavaScript

// Replace with API call
const res = await fetch('/api/auth/me');
const realUser = await res.json();
Backend-Ready Structure:
JavaScript

{
  currentUser: {
    id: "user_12345",           // Will be DB ID
    username: "RealUser_42",    // User-chosen
    avatar: "🎮",               // User-chosen
    email: "user@example.com",  // NEW
    authProvider: "google",     // NEW (google, discord, email)
    createdAt: 1234567890,
    isGuest: false              // Flag to differentiate
  },
  wishlist: [...],              // Will sync to DB
  preferences: {...}            // Will sync to DB
}
📝 Code Standards
File Headers:
Every file must have:

JavaScript

/**
 * ================================================================
 * FILE NAME - Brief Purpose
 * ================================================================
 * 
 * Purpose:
 * - Main responsibility
 * - Key features
 * 
 * Usage:
 * - How to use this component/function
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * ================================================================
 */
Comments:
✅ Keep ALL existing comments
✅ Add // ✅ NEW: for new features
✅ Add // 🔮 FUTURE: for backend placeholders
✅ Add // ⚠️ WARNING: for critical sections
Logging:
JavaScript

console.log('✅ Success:', data);
console.warn('⚠️ Warning:', issue);
console.error('❌ Error:', error);
console.log('🔍 Debug:', value);
🎯 Current System Status
Feature	Status	Notes
Blogger API Parser	✅ Production	15+ features extracted
Snapshot System	✅ Production	Pagination support
Live Fallback	✅ Production	RSS feed for new posts
Guest Accounts	✅ Production	Auto-generates usernames
Auth Gate	✅ Production	Modal before wishlist
Toast System	✅ Production	Ruby-themed notifications
Wishlist CRUD	✅ Production	Add/Remove/Clear
Platform Detection	✅ Production	URL + alt text analysis
Cover Image Exclusion	✅ Production	No duplicates in gallery
Social Link Parsing	✅ Production	Patreon, Discord, etc.
Navbar Auto-Update	✅ Production	Event-driven refresh
Real Authentication	⏳ Placeholder	Login/Signup pages ready
🔧 Environment Variables
Bash

# Optional (for direct Blogger API - not currently used)
NEXT_PUBLIC_BLOG_ID=rubyapks.blogspot.com
NEXT_PUBLIC_BLOGGER_KEY=your-api-key

# Uses public RSS feed instead (no key required)
🚀 Quick Start Commands
Bash

# Development
npm run dev

# Build (updates snapshot)
npm run build

# Manual snapshot update
node scripts/update-snapshot.js

# Production
npm run start
📌 Remember
ALWAYS request contextual files before implementing
NEVER strip comments or code
ALWAYS use Tailwind v4 syntax (bg-linear-to-b, min-w-70, z-100)
ALWAYS add file header summaries
NEVER break existing logic
ALWAYS validate objects with optional chaining
NEVER use arbitrary values (w-[500px])
End of Master Prompt v13.0 💎