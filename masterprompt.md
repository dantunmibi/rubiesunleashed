💎 RUBIES UNLEASHED - Master Project Prompt (v15.1 - The Complete Source)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
Hosting/Forms: Netlify (Static Export + Form Detection)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Base: Deep Slate (bg-[#0b0f19])
Accent: Ruby Rose (#E0115F) for Games/Primary
Secondary: Cyan/Teal for Apps/Tools
Effects: Glassmorphism (backdrop-blur-xl), Ambient Glows, Parallax Backgrounds
Mobile Experience: "Native App Feel" → Hidden Global Navbar on Details, Floating Action Bars, Swipe-friendly, Horizontal Scroll Command Bars.
⚠️ CRITICAL CODING RULES
1. Z-Index Stratification (UPDATED)
z-100: Toasts, Critical Notifications
z-50: Sidebar Drawer (Mobile), Modals
z-45: Backdrops (Sidebar/Modal overlays)
z-40: Navbar (Fixed)
z-35: Sticky Page Controls (Wishlist/Vault filters) - Sits below Navbar but above content
z-30: Floating Action Buttons, Sticky Headers
z-0 to z-20: Page Content
2. Tailwind v4 Syntax (STRICT CANONICAL MODE)
❌ NEVER USE ARBITRARY VALUES IF A UTILITY EXISTS:

w-[500px] → ✅ Use w-125 (or nearest scale value)
min-w-[280px] → ✅ Use min-w-70
hover:translate-y-[-2px] → ✅ Use hover:-translate-y-0.5
bg-gradient-to-b → ✅ Use bg-linear-to-b
z-[100] → ✅ Use z-100
3. Safety & Process Rules
✅ Validate all objects: game?.tags || []
✅ Never crash on missing data
✅ ALWAYS request contextual files before implementing features
✅ DO NOT generate code unless given specific instructions (Wait for "Go Ahead")
✅ DO NOT break current logic or recreate existing components
✅ DO NOT strip or trim code (preserve all comments and structure)
✅ ENSURE a summary is included and commented at the top of every file
4. Netlify Form Architecture (CRITICAL)
Detection: Forms must be defined in public/__forms.html with data-netlify="true".
Submission: React forms MUST fetch to /__forms.html (NOT /) to bypass Next.js App Router.
Payload: Must be application/x-www-form-urlencoded with a hidden form-name field.
🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Context-Aware Parsing:
Extracts Content Warnings (<h3>Warning:</h3>)
Extracts Social Links (Discord, Patreon, Developer sites)
Detects Platform via Image Alt Text & Filenames
NEW: Extracts Size/Storage (Storage: 104 MB) via Regex.
NEW: Extracts Age Rating (Audience - 7+ or Rated: T).
Fail-Safe: Returns backup-data.json if API fails.
Features Extracted: Cover Image, Screenshots (excludes cover/tiny icons), Download Links, Developer metadata, Features, Requirements, Controls/How-To, Age Rating, Videos.
2. Logic Brain (src/lib/game-utils.js)
Smart Classification:
isApp: Checks tags for "App", "Tool", "Software"
Visuals: Swaps Gamepad2 (Game) for Box (App)
Colors: Apps get Blue/Teal accents; Games get Ruby
3. User System (src/lib/userManager.js)
Guest Accounts: Auto-generates usernames, random emojis, persistent localStorage.
No Auto-Creation: Only creates when requested.
🗺️ Core Page Structure
1. Home Page (/)
Navbar Behavior: Starts Transparent → Fades to Glass on Scroll (Cinematic).
Content: Hero, Featured Carousel, About, Vault CTA.
2. Explore Vault (/explore)
Navbar: Always Fixed/Glass.
Features: Deep Linking (?q=search), Dynamic Tag Ribbon, Smart Search.
3. Item Details (/view/[slug])
Hybrid Layout:
Mobile: Immersive "App" Mode (No Global Nav, Floating Action Bar).
Desktop: Cinematic Widescreen Mode (Sidebar Layout).
Sidebar: Displays Size (HardDrive icon), Version, Developer, Rating, License.
4. Wishlist (/[username]/wishlist)
Mobile UX: "Command Bar" Layout.
Row 1: Search.
Row 2: Horizontal Scroll Toolbar (Sort, Filters, Share, Clear).
Z-Index: Controls sticky at z-35.
5. Contact (/contact)
Tone: Professional, Business-Oriented.
Tech: Uses /__forms.html bypass.
📂 Project Structure (FULL)
text

src/
├── app/
│   ├── api/
│   │   └── games/
│   │       └── route.js          # Blogger API proxy
│   ├── contact/
│   │   └── page.js               # Professional Contact Form
│   ├── explore/
│   │   └── page.js               # Vault Page
│   ├── login/
│   │   └── page.js               # Login Placeholder
│   ├── privacy/
│   │   └── page.js
│   ├── signup/
│   │   └── page.js               # Signup Placeholder
│   ├── terms/
│   │   └── page.js
│   ├── view/
│   │   └── [slug]/
│   │       └── page.js           # Game Details (Hybrid Layout)
│   ├── [username]/
│   │   └── wishlist/
│   │       └── page.js           # User Wishlist
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js                 # Root Layout
│   └── page.js                   # Home Page
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx         # Auth Gate Modal
│   ├── explore/
│   │   ├── ExploreContent.jsx
│   │   ├── GameGrid.jsx
│   │   ├── GenreFilter.jsx
│   │   ├── PlatformSelector.jsx
│   │   ├── ScrollToTopButton.jsx
│   │   ├── SpecialCollections.jsx
│   │   ├── SpotlightHero.jsx
│   │   ├── VaultFilters.jsx
│   │   ├── VaultHeader.jsx
│   │   └── VaultSection.jsx
│   ├── providers/
│   │   └── ToastProvider.jsx
│   ├── store/
│   │   ├── ContentWarningModal.jsx
│   │   ├── DownloadCallout.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameContent.jsx
│   │   ├── GameHero.jsx
│   │   ├── GameMedia.jsx
│   │   ├── GameSidebar.jsx       # Includes Size/Rating logic
│   │   └── SimilarGames.jsx
│   ├── ui/
│   │   ├── AboutSection.js
│   │   ├── BackgroundEffects.js
│   │   ├── FeatureTriangles.js
│   │   ├── Footer.js
│   │   ├── GameModal.js
│   │   ├── GameVault.js
│   │   ├── GiantRuby.js
│   │   ├── Hero.js
│   │   ├── Navbar.js             # Adaptive (Home vs Global) + Mobile Drawer
│   │   ├── NotificationPanel.jsx
│   │   ├── Toast.jsx
│   │   ├── ToastContainer.jsx
│   │   └── UserDropdown.jsx
│   └── wishlist/
│       ├── EmptyWishlist.jsx
│       ├── WishlistControls.jsx  # Mobile Command Bar (z-35)
│       ├── WishlistGrid.jsx
│       └── WishlistStats.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useGameFilters.js
│   ├── useScrollBehavior.js
│   ├── useToast.js
│   └── useWishlist.js
├── lib/
│   ├── config/
│   │   └── platforms.js
│   ├── utils/
│   │   ├── collectionMatchers.js
│   │   ├── gameFilters.js
│   │   ├── platformUtils.js
│   │   ├── tagExtractor.js
│   │   └── textUtils.js
│   ├── backup-data.json
│   ├── blogger.js                # API parser (Size Extraction added)
│   ├── game-utils.js
│   ├── notificationManager.js
│   └── userManager.js
scripts/
└── update-snapshot.js
public/
├── __forms.html                  # Netlify Form Schematic
├── ru-logo.png
└── ...
🎯 Blogger Post Template
Required Structure for Parsing:

HTML

<!-- 1. COVER IMAGE (alt="Game Cover") -->
<img src="..." alt="Game Cover" />

<!-- 2. DESCRIPTION -->
<p>First paragraph...</p>

<!-- 3. METADATA BOX -->
<div>
    Developer – <a href="...">Name</a>
    Version – 1.0
    Build – Windows/Android
    Audience – 7+
</div>

<!-- 4. FEATURES/REQUIREMENTS -->
<h3>Features:</h3>
<ul><li>Feature 1</li></ul>

<h3>System Requirements:</h3>
<ul>
    <li>OS: Windows 10+</li>
    <li>Storage: 104 MB available space</li> <!-- ✅ SIZE DETECTED HERE -->
</ul>

<!-- 5. DOWNLOADS -->
<h3>Download:</h3>
<a href="..."><img alt="Download for Windows" src="button.png" /></a>
🔐 Authentication System
Auth Flow
User clicks ❤️ Wishlist
Is logged in?
YES → Add via API [FUTURE]
NO (Has Guest Session) → Add to guest wishlist
NO (First Time) → Show Auth Modal
Auth Modal Options:
Sign Up / Log In (Placeholders)
Continue as Guest → Create temp user + add to wishlist ✅
Event System
JavaScript

// After guest creation or login:
window.dispatchEvent(new Event("userChanged"));
// Navbar listens and auto-updates:
window.addEventListener("userChanged", loadUser);
🎉 Toast Notification System
Components: Toast.jsx, ToastContainer.jsx, ToastProvider.jsx, useToast.js.
Usage: showToast("Message", "success/error/wishlist").
Z-Index: Always z-100.
🚀 Development Roadmap
Phase 1: User Features (Completed ✅)
✅ Wishlist Page (Command Bar UX)
✅ Auth Gate System (Guest accounts)
✅ Toast Notifications
✅ Netlify Form Integration (Fixed via /__forms.html)
✅ Adaptive Navbar (Transparent/Glass)
✅ Size & Age Rating Extraction
✅ Mobile Drawer & UX Polish
Phase 2: Production Polish (Current 🚧)
⏳ SEO & Metadata (Dynamic generateMetadata)
⏳ Loading Skeletons (Replace spinners with pulsing shapes)
⏳ Error Handling (Custom error.js)
⏳ Static Pages: /publish (Guide), /about (Mission)
Phase 3: Real Authentication
⏳ Backend API for auth (/api/auth/...)
⏳ OAuth providers
⏳ Migrate guest wishlists
🔧 Environment Variables
Bash

NEXT_PUBLIC_BLOG_ID=rubyapks.blogspot.com
NEXT_PUBLIC_BLOGGER_KEY=(Optional for API, not needed for RSS)
🔄 Snapshot System
Build Process: npm run build triggers scripts/update-snapshot.js → Saves to src/lib/backup-data.json.
Live Fallback: If post missing, fetches from RSS.
End of Master Prompt v15.1 💎


💎 RUBIES UNLEASHED - Master Project Prompt (v16.1 - The Complete Source)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
Hosting/Forms: Netlify (Static Export + Form Detection)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Base: Deep Slate (bg-[#0b0f19])
Accent: Ruby Rose (#E0115F) for Games/Primary
Secondary: Cyan/Teal for Apps/Tools
Effects: Glassmorphism (backdrop-blur-xl), Ambient Glows, Parallax Backgrounds
Mobile Experience: "Native App Feel" → Hidden Global Navbar on Details, Floating Action Bars, Swipe-friendly, Horizontal Scroll Command Bars.
⚠️ CRITICAL CODING RULES
1. Z-Index Stratification
z-100: Toasts, Critical Notifications
z-50: Sidebar Drawer (Mobile), Modals
z-45: Backdrops (Sidebar/Modal overlays)
z-40: Navbar (Fixed)
z-35: Sticky Page Controls (Wishlist/Vault filters) - Sits below Navbar but above content
z-30: Floating Action Buttons, Sticky Headers
z-0 to z-20: Page Content
2. Tailwind v4 Syntax (STRICT CANONICAL MODE)
❌ NEVER USE ARBITRARY VALUES IF A UTILITY EXISTS:

w-[500px] → ✅ Use w-125 (or nearest scale value)
min-w-[280px] → ✅ Use min-w-70
hover:translate-y-[-2px] → ✅ Use hover:-translate-y-0.5
bg-gradient-to-b → ✅ Use bg-linear-to-b
z-[100] → ✅ Use z-100
3. Safety & Process Rules
✅ Validate all objects: game?.tags || []
✅ Never crash on missing data
✅ ALWAYS request contextual files before implementing features
✅ DO NOT generate code unless given specific instructions (Wait for "Go Ahead")
✅ DO NOT break current logic or recreate existing components
✅ DO NOT strip or trim code (preserve all comments and structure)
✅ ENSURE a summary is included and commented at the top of every file
4. Netlify Form Architecture (CRITICAL)
Detection: Forms must be defined in public/__forms.html with data-netlify="true".
Submission: React forms MUST fetch to /__forms.html (NOT /) to bypass Next.js App Router.
Payload: Must be application/x-www-form-urlencoded with a hidden form-name field.
🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Context-Aware Parsing:
Extracts Content Warnings (<h3>Warning:</h3>)
Extracts Social Links (Discord, Patreon, Developer sites)
Detects Platform via Image Alt Text & Filenames
NEW: Extracts Size/Storage (Storage: 104 MB) via Regex.
NEW: Extracts Age Rating (Audience - 7+ or Rated: T).
Fail-Safe: Returns backup-data.json if API fails.
Features Extracted: Cover Image, Screenshots (excludes cover/tiny icons), Download Links, Developer metadata, Features, Requirements, Controls/How-To, Age Rating, Videos.
2. Logic Brain (src/lib/game-utils.js)
Smart Classification:
isApp: Checks tags for "App", "Tool", "Software"
Visuals: Swaps Gamepad2 (Game) for Box (App)
Colors: Apps get Blue/Teal accents; Games get Ruby
3. User System (src/lib/userManager.js)
Guest Accounts: Auto-generates usernames, random emojis, persistent localStorage.
No Auto-Creation: Only creates when requested.
🗺️ Core Page Structure
1. Home Page (/)
Navbar Behavior: Starts Transparent → Fades to Glass on Scroll (Cinematic).
Content: Hero, Featured Carousel, About, Vault CTA.
2. Explore Vault (/explore)
Navbar: Always Fixed/Glass.
Features: Deep Linking (?q=search), Dynamic Tag Ribbon, Smart Search.
Future PWA: Install button in desktop Navbar (Left of Bell).
3. Item Details (/view/[slug])
Hybrid Layout:
Mobile: Immersive "App" Mode (No Global Nav, Floating Action Bar).
Desktop: Cinematic Widescreen Mode (Sidebar Layout).
Sidebar: Displays Size (HardDrive icon), Version, Developer, Rating, License.
4. Wishlist (/[username]/wishlist)
Mobile UX: "Command Bar" Layout.
Row 1: Search.
Row 2: Horizontal Scroll Toolbar (Sort, Filters, Share, Clear).
Z-Index: Controls sticky at z-35.
5. Help Center (/help)
Purpose: Self-Service Support ("Solve My Problem").
Design: Search Bar + Category Grid + FAQ Accordion.
Tone: Clear, instructional.
6. Footer (Global)
Structure: 4-Column "Treasure Hunter" Layout.
Brand: Logo + Universal Text ("Games, Apps, Tools").
Treasure Map: Discovery Links.
Guild Hall: Support (Help Center) & Contact.
The Codex: Legal.
📂 Project Structure (FULL)
text

src/
├── app/
│   ├── api/
│   │   └── games/
│   │       └── route.js          # Blogger API proxy
│   ├── contact/
│   │   └── page.js               # Professional Contact Form
│   ├── help/
│   │   └── page.js               # Self-Service Help Center
│   ├── explore/
│   │   └── page.js               # Vault Page
│   ├── login/
│   │   └── page.js               # Login Placeholder
│   ├── privacy/
│   │   └── page.js
│   ├── signup/
│   │   └── page.js               # Signup Placeholder
│   ├── terms/
│   │   └── page.js
│   ├── view/
│   │   └── [slug]/
│   │       └── page.js           # Game Details (Hybrid Layout)
│   ├── [username]/
│   │   └── wishlist/
│   │       └── page.js           # User Wishlist
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js                 # Root Layout
│   └── page.js                   # Home Page
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx         # Auth Gate Modal
│   ├── explore/
│   │   ├── ExploreContent.jsx
│   │   ├── GameGrid.jsx
│   │   ├── GenreFilter.jsx
│   │   ├── PlatformSelector.jsx
│   │   ├── ScrollToTopButton.jsx
│   │   ├── SpecialCollections.jsx
│   │   ├── SpotlightHero.jsx
│   │   ├── VaultFilters.jsx
│   │   ├── VaultHeader.jsx
│   │   └── VaultSection.jsx
│   ├── providers/
│   │   └── ToastProvider.jsx
│   ├── store/
│   │   ├── ContentWarningModal.jsx
│   │   ├── DownloadCallout.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameContent.jsx
│   │   ├── GameHero.jsx
│   │   ├── GameMedia.jsx
│   │   ├── GameSidebar.jsx       # Includes Size/Rating logic
│   │   └── SimilarGames.jsx
│   ├── ui/
│   │   ├── AboutSection.js
│   │   ├── BackgroundEffects.js
│   │   ├── FeatureTriangles.js
│   │   ├── Footer.js             # 4-Column "Treasure Hunter" Layout
│   │   ├── GameModal.js
│   │   ├── GameVault.js
│   │   ├── GiantRuby.js
│   │   ├── Hero.js
│   │   ├── Navbar.js             # Adaptive + Mobile Drawer
│   │   ├── NotificationPanel.jsx
│   │   ├── Toast.jsx
│   │   ├── ToastContainer.jsx
│   │   └── UserDropdown.jsx
│   └── wishlist/
│       ├── EmptyWishlist.jsx
│       ├── WishlistControls.jsx  # Mobile Command Bar (z-35)
│       ├── WishlistGrid.jsx
│       └── WishlistStats.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useGameFilters.js
│   ├── useScrollBehavior.js
│   ├── useToast.js
│   └── useWishlist.js
├── lib/
│   ├── config/
│   │   └── platforms.js
│   ├── utils/
│   │   ├── collectionMatchers.js
│   │   ├── gameFilters.js
│   │   ├── platformUtils.js
│   │   ├── tagExtractor.js
│   │   └── textUtils.js
│   ├── backup-data.json
│   ├── blogger.js                # API parser (Size Extraction added)
│   ├── game-utils.js
│   ├── notificationManager.js
│   └── userManager.js
scripts/
└── update-snapshot.js
public/
├── __forms.html                  # Netlify Form Schematic
├── ru-logo.png
└── ...
🎯 Blogger Post Template
Required Structure for Parsing:

HTML

<!-- 1. COVER IMAGE (alt="Game Cover") -->
<img src="..." alt="Game Cover" />

<!-- 2. DESCRIPTION -->
<p>First paragraph...</p>

<!-- 3. METADATA BOX -->
<div>
    Developer – <a href="...">Name</a>
    Version – 1.0
    Build – Windows/Android
    Audience – 7+
</div>

<!-- 4. FEATURES/REQUIREMENTS -->
<h3>Features:</h3>
<ul><li>Feature 1</li></ul>

<h3>System Requirements:</h3>
<ul>
    <li>OS: Windows 10+</li>
    <li>Storage: 104 MB available space</li> <!-- ✅ SIZE DETECTED HERE -->
</ul>

<!-- 5. DOWNLOADS -->
<h3>Download:</h3>
<a href="..."><img alt="Download for Windows" src="button.png" /></a>
🔐 Authentication System
Auth Flow
User clicks ❤️ Wishlist
Is logged in?
YES → Add via API [FUTURE]
NO (Has Guest Session) → Add to guest wishlist
NO (First Time) → Show Auth Modal
Auth Modal Options:
Sign Up / Log In (Placeholders)
Continue as Guest → Create temp user + add to wishlist ✅
Event System
JavaScript

// After guest creation or login:
window.dispatchEvent(new Event("userChanged"));
// Navbar listens and auto-updates:
window.addEventListener("userChanged", loadUser);
🎉 Toast Notification System
Components: Toast.jsx, ToastContainer.jsx, ToastProvider.jsx, useToast.js.
Usage: showToast("Message", "success/error/wishlist").
Z-Index: Always z-100.
🚀 Development Roadmap
Phase 1: User Features (Completed ✅)
✅ Wishlist Page (Command Bar UX)
✅ Help Center (/help)
✅ Netlify Form Integration (Fixed via /__forms.html)
✅ Adaptive Navbar (Transparent/Glass)
✅ Footer (Brand Aligned)
✅ Size & Age Rating Extraction
✅ Mobile Drawer & UX Polish
Phase 2: Production Polish (Current 🚧)
⏳ SEO & Metadata (Dynamic generateMetadata)
⏳ Loading Skeletons (Replace spinners with pulsing shapes)
⏳ Error Handling (Custom error.js)
⏳ Static Pages: /publish (Guide), /about (Mission)
Phase 3: Real Authentication
⏳ Backend API for auth (/api/auth/...)
⏳ OAuth providers
⏳ Migrate guest wishlists
Phase 4: Maintenance Tools & PWA
⏳ PWA Install Button:
Desktop: In Explore Navbar (Left of Bell).
Mobile: In Sidebar Drawer (Bottom).
⏳ Report Broken Link: Under download button.
⏳ Admin Dashboard.
🔧 Environment Variables
Bash

NEXT_PUBLIC_BLOG_ID=rubyapks.blogspot.com
NEXT_PUBLIC_BLOGGER_KEY=(Optional for API, not needed for RSS)
🔄 Snapshot System
Build Process: npm run build triggers scripts/update-snapshot.js → Saves to src/lib/backup-data.json.
Live Fallback: If post missing, fetches from RSS.
End of Master Prompt v16.1 💎

💎 RUBIES UNLEASHED - Master Project Prompt (v19.0 - The Ultimate Source)
📋 Project Overview
Name: Rubies Unleashed
Type: Universal Digital Marketplace (Games, Apps, Tools, Assets)
Tech Stack: Next.js 15+ (App Router), React, Tailwind CSS v4, Lucide React Icons
Data Source: Blogger API Bridge (Headless CMS via rubyapks.blogspot.com)
Hosting/Forms: Netlify (Static Export + Form Detection)
🎨 Visual Design System (Strict Tailwind v4)
Theme: "Hyper-Professional Cinematic Dark Mode"
Mobile Experience: "Native App Feel" → Hidden Global Navbar on Details, Floating Action Bars, Horizontal Scroll Command Bars.
Design Tokens (Strict)
Colors:
ruby: #E0115F (Primary/Games)
background: #0b0f19 (Deep Slate)
surface: #161b2c (Cards/Modals)
cyan: #06b6d4 (Apps/Tools)
Typography:
Headings: Font-black, Uppercase, Tracking-tight.
Body: Font-medium, Line-height 1.6.
Labels: Font-bold, Uppercase, Tracking-widest, Text-xs.
Borders:
Default: border-white/10
Hover: border-ruby/30
Active: border-ruby
Shadows (Cinematic):
Cards: shadow-[0_0_60px_rgba(224,17,95,0.15)]
Buttons: shadow-[0_0_20px_rgba(224,17,95,0.3)]
Effects:
Glass: backdrop-blur-xl
Glow: bg-linear-to-b (never bg-gradient)
⚠️ CRITICAL CODING RULES
1. Z-Index Stratification (ABSOLUTE)
z-100: Toasts, Critical Overlays
z-50: Mobile Sidebar Drawer, Modals, Search Dropdowns (Must overlay Navbar)
z-45: Backdrops (Sidebar/Modal overlays)
z-40: Navbar (Fixed)
z-35: Sticky Page Controls (Wishlist/Explore Filters) - Sits below Navbar (z-40) but above content
z-30: Floating Action Buttons, Sticky Headers
z-0 to z-20: Page Content
2. Tailwind v4 Syntax (STRICT CANONICAL MODE)
❌ NEVER USE ARBITRARY VALUES IF A UTILITY EXISTS:

w-[500px] → ✅ Use w-125 (or nearest scale value)
min-w-[280px] → ✅ Use min-w-70
hover:translate-y-[-2px] → ✅ Use hover:-translate-y-0.5
bg-gradient-to-b → ✅ Use bg-linear-to-b
z-[100] → ✅ Use z-100
3. Safety & Process Rules
✅ Validate all objects: game?.tags || []
✅ Never crash on missing data: Use fallbacks ("Unknown", placeholder images).
✅ ALWAYS request contextual files before implementing features.
✅ DO NOT generate code unless given specific instructions.
✅ DO NOT strip or trim code (preserve all comments and structure).
✅ ENSURE a summary is included and commented at the top of every file.
4. Netlify Form Architecture
Detection: public/__forms.html (data-netlify="true").
Submission: React forms MUST fetch to /__forms.html (NOT /).
Payload: application/x-www-form-urlencoded + hidden form-name.
🔌 Data Architecture
1. The Bridge (src/lib/blogger.js)
Features Extracted:
Size/Storage: Regex /(?:Storage|Size|Disk Space|HDD|Space):\s*([\d\.]+\s*(?:GB|MB|KB))/i.
Age Rating: Regex Audience - 7+ or Rated: T in metadata/warnings.
Socials: Discord, Patreon, Developer, Itch.io.
Platform: Detected via Image Alt Text, Filenames, and URL patterns.
Fail-Safe: Returns backup-data.json (Snapshot) if API fails.
2. Logic Brain (src/lib/game-utils.js)
Smart Classification: isApp checks tags ("App", "Tool") → Swaps Gamepad icon for Box icon + Cyan accents.
👤 User System & Auth Migration
Current State (Guest System)
Storage: localStorage ("ruby_user_data")
Functions: createGuestUser(), addToWishlist(), getWishlist().
Structure:
JavaScript

{
  id: "temp_12345",
  username: "Ruby_Gamer_42",
  avatar: "💎",
  isGuest: true
}
🔮 Future State (Real Auth Migration)
Goal: Seamless transition from Guest to Cloud Account.
Backend Structure (Ready for DB):
JavaScript

{
  currentUser: {
    id: "user_uuid_v4",         // Permanent DB ID
    username: "RealUser_42",    // User-chosen
    email: "user@example.com",  // Verified
    authProvider: "google",     // google, discord, email
    createdAt: 1234567890,
    isGuest: false,
    preferences: {
       sortBy: "dateAdded-desc"
    }
  },
  wishlist: [
     { gameId: "slug-1", dateAdded: 123456 } // Syncs to DB
  ]
}
Migration Logic: On Sign Up, check for localStorage wishlist -> Push items to DB -> Clear LocalStorage.
🗺️ Core Page Structure
1. Home Page (/)
Navbar: Transparent → Glass (useScrollBehavior).
Content: Hero, Featured Carousel, About, Vault CTA.
2. Explore Vault (/explore)
Navbar: Fixed Glass.
Features: Deep Linking (?q=search), Dynamic Tag Ribbon, Smart Search.
PWA: Install Button (Desktop) appears left of Bell (Phase 4).
3. Item Details (/view/[slug])
Mobile: Immersive "App" Mode (Global Navbar Hidden).
Desktop: Standard Sidebar Layout.
Sidebar (GameSidebar.jsx): Displays Size (HardDrive), Version, Developer, Rating, License.
4. Wishlist (/[username]/wishlist)
Mobile UX: "Command Bar" Layout.
Row 1: Search (Full Width).
Row 2: Horizontal Scroll Toolbar (Sort, Filters, Share, Clear).
Z-Index: Sticky Controls at z-35.
5. Help Center (/help)
Purpose: Self-Service Support ("Solve My Problem").
Design: Search Bar + Category Grid + FAQ Accordion.
CTA: "Still stuck? Contact Support" (links to /contact).
6. Contact (/contact)
Tone: Professional/Business (Partnerships, Support).
Tech: Uses /__forms.html bypass.
7. Footer (Global)
Structure: 4-Column "Treasure Hunter" Layout (Hybrid).
Brand: Logo + "Games, Apps, Tools" text + Legacy Link.
Treasure Map: Discovery Links.
Guild Hall: Support (Help Center) & Contact.
The Codex: Legal.
📂 Project Structure (Verified v19.0)
text

src/
├── app/
│   ├── api/
│   │   └── games/
│   │       └── route.js          # Blogger API proxy (Live + RSS Fallback)
│   ├── contact/
│   │   └── page.js               # Professional Contact Form
│   ├── explore/
│   │   └── page.js               # Vault Page (Sticky Filters)
│   ├── help/
│   │   └── page.js               # Self-Service Help Center
│   ├── login/
│   │   └── page.js               # Login Placeholder
│   ├── privacy/
│   │   └── page.js
│   ├── signup/
│   │   └── page.js               # Signup Placeholder
│   ├── terms/
│   │   └── page.js
│   ├── view/
│   │   └── [slug]/
│   │       └── page.js           # Game Details (Hybrid Layout)
│   ├── [username]/
│   │   └── wishlist/
│   │       └── page.js           # User Wishlist (Command Bar UX)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js                 # Root Layout
│   └── page.js                   # Home Page
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx         # Auth Gate Modal
│   ├── explore/
│   │   ├── ExploreContent.jsx
│   │   ├── GameGrid.jsx
│   │   ├── GenreFilter.jsx
│   │   ├── PlatformSelector.jsx
│   │   ├── ScrollToTopButton.jsx
│   │   ├── SpecialCollections.jsx
│   │   ├── SpotlightHero.jsx
│   │   ├── VaultFilters.jsx
│   │   ├── VaultHeader.jsx
│   │   └── VaultSection.jsx
│   ├── providers/
│   │   └── ToastProvider.jsx     # Global Context
│   ├── store/
│   │   ├── ContentWarningModal.jsx
│   │   ├── DownloadCallout.jsx
│   │   ├── GameCard.jsx
│   │   ├── GameContent.jsx
│   │   ├── GameHero.jsx
│   │   ├── GameMedia.jsx
│   │   ├── GameSidebar.jsx       # Logic: Size, Rating, License
│   │   └── SimilarGames.jsx
│   ├── ui/
│   │   ├── AboutSection.js
│   │   ├── BackgroundEffects.js
│   │   ├── FeatureTriangles.js
│   │   ├── Footer.js             # 4-Column Hybrid Layout
│   │   ├── GameModal.js
│   │   ├── GameVault.js
│   │   ├── GiantRuby.js
│   │   ├── Hero.js
│   │   ├── Navbar.js             # Adaptive + Mobile Drawer
│   │   ├── NotificationPanel.jsx
│   │   ├── Toast.jsx
│   │   └── ToastContainer.jsx
│   └── wishlist/
│       ├── EmptyWishlist.jsx
│       ├── WishlistControls.jsx  # Mobile Command Bar (z-35)
│       ├── WishlistGrid.jsx
│       └── WishlistStats.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useGameFilters.js
│   ├── useScrollBehavior.js
│   ├── useToast.js
│   └── useWishlist.js
├── lib/
│   ├── config/
│   │   └── platforms.js
│   ├── utils/
│   │   ├── collectionMatchers.js
│   │   ├── gameFilters.js
│   │   ├── platformUtils.js
│   │   ├── tagExtractor.js
│   │   └── textUtils.js
│   ├── backup-data.json          # Snapshot Cache
│   ├── blogger.js                # API parser (Size Extraction added)
│   ├── game-utils.js             # Logic Brain
│   ├── notificationManager.js
│   └── userManager.js            # Guest System
scripts/
└── update-snapshot.js            # Build script
public/
├── __forms.html                  # Netlify Form Schematic
├── ru-logo.png
└── ...
🎯 Blogger Post Template
Required Structure for Parsing:

HTML

<!-- 1. COVER IMAGE -->
<img src="..." alt="Game Cover" />

<!-- 2. DESCRIPTION -->
<p>First paragraph...</p>

<!-- 3. METADATA BOX -->
<div>
    Developer – Name
    Version – 1.0
    Build – Windows/Android
    Audience – 7+  <!-- ✅ Age Rating -->
</div>

<!-- 4. REQUIREMENTS (Size Extraction) -->
<h3>System Requirements:</h3>
<ul>
    <li>OS: Windows 10+</li>
    <li>Storage: 104 MB available space</li> <!-- ✅ SIZE DETECTED HERE -->
</ul>

<!-- 5. DOWNLOADS -->
<h3>Download:</h3>
<a href="..."><img alt="Download for Windows" src="button.png" /></a>
🔐 Authentication System
Auth Flow
User clicks ❤️ Wishlist
Is logged in?
YES → Add via API [FUTURE]
NO (Has Guest Session) → Add to guest wishlist
NO (First Time) → Show Auth Modal
Auth Modal Options:
Sign Up / Log In (Placeholders)
Continue as Guest → Create temp user + add to wishlist ✅
🎉 Toast Notification System
Usage: showToast("Message", "success/error/wishlist").
Z-Index: Always z-100.
🚀 Development Roadmap
Phase 1: User Features (Completed ✅)
✅ Wishlist Page (Command Bar UX, Z-Index 35)
✅ Help Center (/help - Self Service)
✅ Netlify Form Integration (/__forms.html bypass)
✅ Adaptive Navbar (Transparent on Home / Fixed Glass on Explore)
✅ Hybrid Footer (4-Column, Brand Aligned)
✅ Size & Age Rating Extraction
✅ Mobile Drawer & UX Polish
Phase 2: Production Polish (Current 🚧)
⏳ SEO & Metadata (Dynamic generateMetadata)
⏳ Loading Skeletons (Replace spinners with pulsing shapes)
⏳ Error Handling (Custom error.js)
⏳ Static Pages: /publish (Guide), /about (Mission)
Phase 3: Real Authentication
⏳ Backend API for auth (/api/auth/...)
⏳ OAuth providers (Google, Discord)
⏳ Migrate guest wishlists to real accounts
Phase 4: Maintenance Tools & PWA
⏳ PWA Install Button:
Desktop: In Explore Navbar (Left of Bell).
Mobile: In Sidebar Drawer (Bottom Button).
⏳ Report Broken Link: Under download button.
⏳ Admin Dashboard.
🔧 Environment Variables
Bash

NEXT_PUBLIC_BLOG_ID=rubyapks.blogspot.com
NEXT_PUBLIC_BLOGGER_KEY=(Optional for API, not needed for RSS)
🔄 Snapshot System
Build Process: npm run build triggers scripts/update-snapshot.js → Saves to src/lib/backup-data.json.
Live Fallback: If post missing, fetches from RSS.
End of Master Prompt v19.0 💎