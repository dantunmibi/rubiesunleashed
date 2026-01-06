/**
 * ================================================================
 * NAVBAR - Hybrid Modern Navigation
 * ================================================================
 * 
 * Purpose:
 * - Adaptive navbar that changes based on page context
 * - Tall transparent design on home/landing pages
 * - Compact fixed design with search on explore page
 * - Sidebar drawer for mobile navigation
 * 
 * Features:
 * - Detects current page and adapts layout
 * - Scroll-aware transparency on Home (Cinematic effect)
 * - Large logo + text on home, compact on explore
 * - Centered nav links on home, search bar on explore
 * - User dropdown with guest/premium differentiation
 * - Sidebar for mobile (replaces fullscreen overlay)
 * - Auto-updates on user login
 * 
 * Event Listeners:
 * - "userChanged" - Fired when user logs in or guest account created
 * 
 * Design Modes:
 * - Home Mode: h-24, transparent (glass on scroll), centered links
 * - Explore Mode: h-14, fixed, search bar, always visible
 * 
 * Z-Index Stratification:
 * - Sidebar Drawer: z-50 (Must be above navbar)
 * - Sidebar Backdrop: z-45
 * - Navbar: z-40 (Stays below sidebar/modals)
 * ================================================================
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { getUnreadCount } from "@/lib/notificationManager";
import NotificationPanel from "./NotificationPanel";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, User, Heart, Upload, Settings, 
  HelpCircle, LogOut, Sparkles, Activity, LayoutDashboard,
  Bell, Search, ChevronDown, Contact // ❌ Users icon removed from imports
} from "lucide-react";
import { getCurrentUser } from "@/lib/userManager";
import { fetchGames } from "@/lib/blogger"; // ✅ IMPORT THIS
import { useSearch } from "@/hooks/useSearch"; // ✅ IMPORT THIS
import SearchDropdown from "./SearchDropdown"; // ✅ IMPORT THIS
import SearchCommandCenter from "./SearchCommandCenter"; // ✅ NEW IMPORT

export default function Navbar() {
  // State Management
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false); // Tracks scroll for home page transparency
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allGames, setAllGames] = useState([]); // Store fetched games
  const { query, setQuery, results, isSearching, clearSearch } = useSearch(allGames);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // ✅ NEW STATE for Mobile Search Overlay
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); 

  const searchInputRef = useRef(null);

  // Refs for click-outside detection
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Routing Hooks
  const pathname = usePathname();
  const router = useRouter();

  // Determine navbar mode based on current page
  const isHomePage = pathname === '/';
  const isFixedNavbar = !isHomePage; // Formerly "isExplorePage" - now applies to everything except Home

  // =================================================================
  // EFFECTS
  // =================================================================

  // 1. Load User on Mount & Listen for Changes
  useEffect(() => {
    loadUser(); // Initial load

    const handleUserChange = () => {
      loadUser();
    };

    window.addEventListener("userChanged", handleUserChange);
    
    return () => {
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  const loadUser = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  const isGuest = currentUser?.isGuest || currentUser?.id?.startsWith('temp_');

  // 2. Scroll Listener for Home Page Transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
      // Cleanup
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // On non-home pages, always treat as "scrolled" (solid/glass background)
      setScrolled(true);
    }
  }, [isHomePage]);

  // 3. Close Dropdowns on Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // User Dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      // Notification Panel
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationPanelOpen(false);
      }
    };

    if (userDropdownOpen || notificationPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, notificationPanelOpen]);

  // 4. Notification Updates
  useEffect(() => {
    updateUnreadCount();
    
    const handleNotificationChange = () => {
      updateUnreadCount();
    };

    window.addEventListener("notificationsChanged", handleNotificationChange);
    
    return () => {
      window.removeEventListener("notificationsChanged", handleNotificationChange);
    };
  }, []);

  const updateUnreadCount = () => {
    setUnreadCount(getUnreadCount());
  };

  // ✅ 5. LOAD GAMES USING SHARED FETCHER
  useEffect(() => {
    async function loadNavbarData() {
      try {
        // Fetch 1000 games just like ExploreContent does
        const data = await fetchGames(1000); 
        setAllGames(data);
      } catch (error) {
        console.error("❌ Navbar data load failed:", error);
      }
    }
    loadNavbarData();
  }, []);

  // =================================================================
  // HANDLERS
  // =================================================================

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("ruby_user_data");
      setMenuOpen(false);
      setUserDropdownOpen(false);
      window.dispatchEvent(new Event("userChanged"));
      window.location.href = "/";
    }
  };

  const handleUpgrade = () => {
    setUserDropdownOpen(false);
    router.push("/signup");
  };

  // Navigation Links Configuration
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vault", href: "/explore" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Publish", href: "https://forms.gle/i7X2sUJ5cnqsUciA6", target: "_blank" },
  ];

  // Dynamic Background Logic
  const getNavbarBackground = () => {
    if (isFixedNavbar) {
      return 'bg-surface/95 backdrop-blur-md border-b border-white/5 shadow-2xl';
    }
    // On Home: Transparent initially, then Glass on scroll
    if (isHomePage) {
      return scrolled 
        ? 'bg-[#0b0f19]/80 backdrop-blur-md shadow-2xl border-b border-white/5' 
        : 'bg-transparent';
    }
    // Default fallback
    return 'bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5';
  };

  return (
    <>
      {/* ✅ MOBILE SEARCH OVERLAY (The "Spotlight") */}
      <SearchCommandCenter 
        isOpen={mobileSearchOpen} 
        onClose={() => setMobileSearchOpen(false)}
        allGames={allGames}
      />

      {/* ========================================
          NAVBAR - MAIN COMPONENT
          Z-Index: 40 (Sits below the Sidebar which is Z-50)
          ======================================== */}
      <nav 
        className={`
          fixed top-0 left-0 right-0 z-40 w-full
          ${isFixedNavbar ? 'h-16' : 'h-24'}
          ${getNavbarBackground()}
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center justify-between relative">
          
          {/* ========================================
              LEFT SECTION: LOGO & MENU TOGGLE
              ======================================== */}
          <div className="flex items-center gap-3 md:gap-4 z-50">
            {/* 
               Hamburger Menu Button 
               - Always visible on Mobile (md:hidden)
               - Visible on Desktop ONLY if in Fixed/Explore Mode
            */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`
                p-2 hover:bg-white/5 rounded-full transition-all relative group
                ${isFixedNavbar ? 'text-slate-400 hover:text-ruby block' : 'text-white hover:text-ruby md:hidden'}
              `}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
              {isFixedNavbar && (
                <div className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-ruby border-2 border-surface rounded-full group-hover:scale-125 transition-transform" />
              )}
            </button>
            
            {/* 
               PROMINENT LOGO 
               - Unified design for Mobile & Desktop
               - No boxes or constraints on mobile
            */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center h-full">
                <img
                  src="/ru-logo.png"
                  alt="Rubies Unleashed"
                  className={`
                    w-auto object-contain drop-shadow-[0_0_15px_rgba(224,17,95,0.6)] group-hover:scale-105 transition-transform duration-300
                    ${isFixedNavbar ? 'h-10 md:h-10' : 'h-12 md:h-16'}
                  `}
                />
              </div>
              <div className="flex flex-col justify-center h-full pt-1">
                {/* Text hidden on very small watches/devices, visible on standard phones */}
                <h1 className={`
                  font-black leading-none tracking-tighter text-white drop-shadow-md hidden min-[360px]:block
                  ${isFixedNavbar ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}
                `}>
                  RUBIES
                </h1>
                <span className={`
                  font-bold tracking-[0.25em] text-ruby uppercase leading-none mt-1 pl-0.5 hidden min-[360px]:block
                  ${isFixedNavbar ? 'text-[8px]' : 'text-[8px] md:text-[10px]'}
                `}>
                  UNLEASHED
                </span>
              </div>
            </Link>
          </div>

          {/* ========================================
              CENTER SECTION: LINKS OR SEARCH
              ======================================== */}
{isFixedNavbar ? (
    <div className="hidden md:flex flex-1 max-w-md mx-10 relative z-50">
      <div className="w-full relative group">
        <Search 
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${
            searchOpen ? 'text-ruby' : 'text-slate-500 group-focus-within:text-ruby'
          }`} 
          size={16} 
        />
        <input 
          ref={searchInputRef}
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!searchOpen) setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search the Vault..." 
          className="w-full bg-background border border-white/5 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-all placeholder:text-slate-600"
        />
        
        {query && (
          <button
            onClick={() => {
              clearSearch();
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <SearchDropdown
        isOpen={searchOpen && (query.length > 0 || isSearching)}
        results={results}
        query={query}
        isSearching={isSearching}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  ) : (
            /* Nav Links (Home Mode - Desktop Only) */
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors relative py-2 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ruby transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(224,17,95,0.5)]" />
                </Link>
              ))}
            </div>
          )}

          {/* ========================================
              RIGHT SECTION: USER & ACTIONS
              ======================================== */}
          <div className="flex items-center gap-1 sm:gap-2 z-50">
            
            {/* ✅ ADDED: Mobile Search Trigger (Top Level - visible to all) */}
            {/* Left of the Notification Bell */}
            <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-ruby hover:bg-white/5 rounded-full transition-all"
                aria-label="Open Search"
            >
                <Search size={22} />
            </button>

            {currentUser ? (
              <>
                {/* 
                    Notifications 
                    - Now VISIBLE on Mobile (Flex instead of Hidden)
                */}
                <div className="flex items-center gap-1">
                  {/* Notification Bell with Panel */}
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                      className="p-2 text-slate-400 hover:text-ruby hover:bg-white/5 rounded-full transition-all relative"
                    >
                      <Bell size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-ruby text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-surface">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <NotificationPanel 
                      isOpen={notificationPanelOpen} 
                      onClose={() => setNotificationPanelOpen(false)} 
                    />
                  </div>
                  
                  {/* ❌ REMOVED: Friends/Users Icon */}
                </div>
                
                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
                
                {/* User Dropdown */}
                <div className="relative block" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`
                      flex items-center gap-2 transition-all group
                      p-1 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10
                    `}
                  >
                    <div className={`
                      w-9 h-9
                      rounded-full bg-linear-to-tr from-ruby to-pink-500 
                      flex items-center justify-center 
                      text-lg
                      shadow-lg transition-transform group-hover:scale-110
                    `}>
                      {currentUser.avatar || "👤"}
                    </div>
                    {/* Username hidden on Mobile to save space */}
                    <span className="hidden lg:block max-w-32 truncate text-sm font-bold text-slate-300 group-hover:text-white">
                      {currentUser.username}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`text-slate-400 transition-transform hidden lg:block ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 md:w-56 bg-[#161b2c] border border-ruby/20 rounded-xl shadow-[0_0_40px_rgba(224,17,95,0.2)] overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="h-px bg-linear-to-r from-transparent via-ruby to-transparent" />

                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{currentUser.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {currentUser.username}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              {isGuest ? "Guest Account" : "Premium Member"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        {!isGuest && (
                            <DropdownItem 
                            icon={<User size={16} />} 
                            label="Profile" 
                            onClick={() => {
                                setUserDropdownOpen(false);
                                router.push(`/${currentUser.username}`);
                            }}
                            />
                        )}
                        <DropdownItem 
                          icon={<Heart size={16} />} 
                          label="Wishlist" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push(`/${currentUser.username}/wishlist`);
                          }}
                        />

                        {/* ✅ GUEST MENU UPDATED */}
                        {isGuest ? (
                             <>
                               <DropdownItem 
                                icon={<Upload size={16} />} 
                                label="Publish Project" 
                                onClick={() => {
                                    setUserDropdownOpen(false);
                                    window.open("https://forms.gle/i7X2sUJ5cnqsUciA6", "_blank", "noopener,noreferrer"); // Or external link if preferred
                                }}
                               />
                               <DropdownItem 
                                icon={<Contact size={16} />} 
                                label="Contact Us" 
                                onClick={() => {
                                    setUserDropdownOpen(false);
                                    router.push("/contact");
                                }}
                               />
                             </>
                        ) : (
                            <>
                                <div className="h-px bg-white/10 my-1" />
                                <DropdownItem 
                                    icon={<Upload size={16} />} 
                                    label="Publish Project" 
                                    onClick={() => router.push("https://forms.gle/i7X2sUJ5cnqsUciA6")} 
                                />
                                <DropdownItem 
                                    icon={<LayoutDashboard size={16} />} 
                                    label="Creator Dashboard" 
                                    onClick={() => router.push("/dashboard")} 
                                />
                                <div className="h-px bg-white/10 my-1" />
                                <DropdownItem 
                                    icon={<Settings size={16} />} 
                                    label="Settings" 
                                    onClick={() => router.push("/settings")} 
                                />
                            </>
                        )}
                        
                        <div className="h-px bg-white/10 my-1" />
                        
                        <DropdownItem 
                          icon={<HelpCircle size={16} />} 
                          label="Help & Support" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/help");
                          }}
                        />

                        {isGuest && (
                          <button 
                            onClick={handleUpgrade}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ruby hover:bg-ruby/10 transition-colors"
                          >
                            <Sparkles size={16} /> Upgrade Account
                          </button>
                        )}

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut size={16} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not Logged In */
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="hidden sm:block bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-ruby hover:text-white transition-all shadow-lg hover:shadow-ruby/50 active:scale-95"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================
          SIDEBAR (Mobile Navigation)
          Z-Index: 50 (Sits ABOVE Navbar)
          ======================================== */}
      
      {/* Backdrop Overlay (Z-45) */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-45 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer (Z-50) */}
      <aside 
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 
          bg-[#0b0f19] border-r border-ruby/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute top-0 left-0 w-full h-125 bg-ruby/5 blur-[100px] pointer-events-none rounded-full" />
        
        {/* Sidebar Header with Close Button */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-surface/50 backdrop-blur-md">
           <span className="text-xs font-black text-ruby uppercase tracking-[0.2em]">Navigation</span>
           <button 
            onClick={() => setMenuOpen(false)} 
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full"
           >
             <X size={20} />
           </button>
        </div>

        <div className="relative p-4 flex flex-col gap-1 h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
          {/* Mobile User Info (if logged in) */}
          {currentUser && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-ruby to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                  {currentUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    @{currentUser.username}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {isGuest ? "Guest Account" : "Premium Member"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation with Active States */}
          <SidebarLink 
            href="/" 
            icon={<Activity size={18} />} 
            label="Home Feed" 
            onClick={() => setMenuOpen(false)} 
            active={pathname === '/'}
          />
          <SidebarLink 
            href="/explore" 
            icon={<LayoutDashboard size={18} />} 
            label="The Vault" 
            onClick={() => setMenuOpen(false)} 
            active={pathname === '/explore'}
          />
          {currentUser && !isGuest && (
            <SidebarLink 
              href="/activity" 
              icon={<Sparkles size={18} />} 
              label="Live Activity" 
              onClick={() => setMenuOpen(false)} 
              active={pathname === '/activity'}
            />
          )}
          
          <div className="h-px bg-white/5 my-4 mx-2" />
          
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
            Library
          </p>
          {currentUser && (
            <SidebarLink 
              href={`/${currentUser.username}/wishlist`}
              icon={<Heart size={18} />} 
              label="My Wishlist" 
              onClick={() => setMenuOpen(false)} 
              active={pathname === `/${currentUser.username}/wishlist`}
            />
          )}
          
          {/* Contact & Support (Guest Friendly) */}
          <SidebarLink 
            href="/contact" 
            icon={<Contact size={18} />} 
            label="Contact Us" 
            onClick={() => setMenuOpen(false)} 
            active={pathname === '/contact'}
          />
          <SidebarLink 
            href="/help" 
            icon={<HelpCircle size={18} />} 
            label="Help & Support" 
            onClick={() => setMenuOpen(false)} 
            active={pathname === '/help'}
          />

          <div className="h-px bg-white/5 my-4 mx-2" />
          
          {/* ✅ PUBLISH LINK FOR EVERYONE */}
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
              Creator Tools
          </p>
          <SidebarLink
            href="#"
            icon={<Upload size={18} />}
            label="Publish Project"
            onClick={() => {
              setMenuOpen(false); // close sidebar
              window.open(
                "https://forms.gle/i7X2sUJ5cnqsUciA6",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            active={false} // external links usually don’t need active styling
          />


          {!isGuest && currentUser && (
             <>
                 <SidebarLink 
                    href="/dashboard" 
                    icon={<LayoutDashboard size={18} />} 
                    label="Creator Dashboard" 
                    onClick={() => setMenuOpen(false)} 
                    active={pathname === '/dashboard'}
                />
             </>
          )}

          {/* Bottom Section - FIXED SPACING */}
          <div className="mt-auto pt-6 flex flex-col gap-2 pb-8"> {/* ✅ Added pb-8 */}
            
            {currentUser ? (
              <>
                {isGuest && (
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/signup");
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-ruby hover:bg-ruby/10 transition-all text-sm font-bold text-left"
                  >
                    <Sparkles size={18} /> UPGRADE ACCOUNT
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold text-left"
                >
                  <LogOut size={18} /> SIGN OUT
                </button>
              </>
            ) : (
              /* Guest Auth Buttons */
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full bg-ruby text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(224,17,95,0.3)] active:scale-95 transition-all text-center text-sm"
                >
                  Join The Vault
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors text-center pb-2"
                >
                  Member Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * Dropdown Menu Item Component
 */
function DropdownItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
    >
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}

/**
 * Sidebar Link Component
 */
function SidebarLink({ href, icon, label, onClick, active = false }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
        active 
          ? 'bg-ruby/10 text-white border border-ruby/20 shadow-[inset_0_0_12px_rgba(224,17,95,0.1)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={`${active ? 'text-ruby' : 'group-hover:text-pink-500'} transition-colors`}>
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ruby shadow-[0_0_8px_#e0115f]" />
      )}
    </Link>
  );
}