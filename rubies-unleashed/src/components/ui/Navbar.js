/**
 * ================================================================
 * NAVBAR - Hybrid Modern Navigation (Identity Integrated)
 * ================================================================
 *
 * Purpose:
 * - Central navigation hub that adapts to User Archetype and Device.
 * - Handles Search, Notifications, User Menu, and Mobile Drawer.
 *
 * Features:
 * - Identity-Aware: UI accents adapt to User Archetype (Supabase Profile).
 * - Guest Persistence: Supports "Epic_Seeker_830" localStorage accounts via userManager.
 * - Hybrid Layout: Transparent on Home, Fixed Glass on Explore.
 * - Robust: Handles both Auth Provider and Legacy Guest logic simultaneously.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { getUnreadCount } from "@/lib/notificationManager";
import NotificationPanel from "./NotificationPanel";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  Heart,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Activity,
  LayoutDashboard,
  Bell,
  Search,
  ChevronDown,
  Contact,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchGames } from "@/lib/blogger";
import { useSearch } from "@/hooks/useSearch";
import SearchDropdown from "./SearchDropdown";
import SearchCommandCenter from "./SearchCommandCenter";
import { getCurrentUser } from "@/lib/userManager"; // ✅ RESTORED IMPORT
import { useMigration } from "@/hooks/useMigration"; // ✅ Import
import { supabase } from "@/lib/supabase"; // ✅ Added missing import for Logout

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allGames, setAllGames] = useState([]);
  const { query, setQuery, results, isSearching, clearSearch } =
    useSearch(allGames);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [isLoggingOut, setIsLoggingOut] = useState(false); 

  // --- Auth Integration ---
  // ✅ FIX: Grab 'initialized' to prevent UI flicker
  const { user, profile, signOut, isArchitect, initialized } = useAuth();
  const [guestUser, setGuestUser] = useState(null);

  // 1. Listen for Guest Updates (LocalStorage via userManager)
  useEffect(() => {
    // Only look for guest data if we are initialized and NO user is found
    if (initialized && !user) {
        const loadGuest = () => {
          const guest = getCurrentUser(); 
          setGuestUser(guest);
        };
    
        loadGuest(); // Initial check
        window.addEventListener("userChanged", loadGuest);
    
        return () => {
          window.removeEventListener("userChanged", loadGuest);
        };
    }
  }, [user, initialized]); // Added initialized dependency

  // Construct Unified User Object
  // ✅ This logic is perfect, keeping it exactly as is.
  const currentUser = user
    ? {
        username:
          user.user_metadata?.username ||
          profile?.username ||
          user.email?.split("@")[0] ||
          "User",
        avatar: profile?.avatar_url || "👤",
        role: profile?.role || "Member",
        isGuest: false,
        themeColor: "var(--user-accent)",
      }
    : guestUser
    ? {
        ...guestUser,
        role: "Guest",
        isGuest: true,
        themeColor: "#e0115f", // Guests are Ruby by default
      }
    : null;

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === "/";
  const isFixedNavbar = !isHomePage || (isHomePage && currentUser && !currentUser.isGuest);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [isHomePage]);

  // 3. Scroll Lock & Click Outside
  useEffect(() => {
    // A. Handle Body Scroll Lock
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // B. Handle Click Outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setUserDropdownOpen(false);
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      )
        setNotificationPanelOpen(false);
    };

    if (userDropdownOpen || notificationPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.body.style.overflow = ''; // Ensure scroll is restored
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, userDropdownOpen, notificationPanelOpen]);


    // ✅ ADD THIS MISSING HELPER FUNCTION
  const updateUnreadCount = () => setUnreadCount(getUnreadCount());

  useEffect(() => {
    updateUnreadCount();
    const handleNotificationChange = () => {
      updateUnreadCount();
    };
    window.addEventListener("notificationsChanged", handleNotificationChange);
    return () =>
      window.removeEventListener(
        "notificationsChanged",
        handleNotificationChange
      );
  }, []);

  // 5. Data Prefetch
  useEffect(() => {
    // Only fetch if search is interacting?
    // Or fetch reduced payload?
    async function loadNavbarData() {
      try {
        const data = await fetchGames(1000);
        setAllGames(data);
      } catch (error) {
        console.error("❌ Navbar data load failed:", error);
      }
    }
    
    // loadNavbarData(); // Maybe delay this?
    const timeout = setTimeout(loadNavbarData, 2000); // ✅ Delay fetch to unblock paint
    return () => clearTimeout(timeout);
  }, []);


  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      if (currentUser?.isGuest) {
        localStorage.removeItem("ruby_user_data");
        setGuestUser(null);
        window.dispatchEvent(new Event("userChanged"));
        window.location.reload();
      } else {
        await signOut();
      }
      setMenuOpen(false);
      setUserDropdownOpen(false);
    }
  };

  const handleUpgrade = () => {
    setUserDropdownOpen(false);
    router.push("/signup");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vault", href: "/explore" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Publish", href: "/publish" },
  ];

  const getNavbarBackground = () => {
    if (isFixedNavbar)
      return "bg-surface/95 backdrop-blur-md border-b border-white/5 shadow-2xl";
    if (isHomePage)
      return scrolled
        ? "bg-[#0b0f19]/80 backdrop-blur-md shadow-2xl border-b border-white/5"
        : "bg-transparent";
    return "bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5";
  };

  useMigration(); // ✅ Invoke the migration hook

  // ✅ Updated Handler: Just opens modal
  const handleLogoutClick = () => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
    setShowLogoutModal(true);
  };

  // ✅ Actual Logout Logic
  const confirmLogout = async () => {
    setIsLoggingOut(true); 
    
    // 1. Nuke LocalStorage (Supabase tokens start with 'sb-')
    if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.startsWith('ruby_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // 2. Attempt Supabase Logout (Fire and Forget)
    try {
        if (!currentUser?.isGuest) {
            // Don't await. Just send the signal.
            supabase.auth.signOut(); 
        }
    } catch (e) {
        // Ignore errors
    }

    // 3. Force Reload immediately
    window.location.href = '/';
  };

  return (
    <>
      <SearchCommandCenter
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        allGames={allGames}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-40 w-full ${
          isFixedNavbar ? "h-16" : "h-24"
        } ${getNavbarBackground()} transition-all duration-300 ease-in-out`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center justify-between relative">
          <div className="flex items-center gap-3 md:gap-4 z-50">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 hover:bg-white/5 rounded-full transition-all relative group ${
                isFixedNavbar
                  ? "text-slate-400 hover:text-(--user-accent) block"
                  : "text-white hover:text-(--user-accent) md:hidden"
              }`}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
              {isFixedNavbar && (
                <div className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-(--user-accent) border-2 border-surface rounded-full group-hover:scale-125 transition-transform" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center h-full">
                <img
                  src="/ru-logo.png"
                  alt="Rubies Unleashed"
                  className={`w-auto object-contain drop-shadow-[0_0_15px_rgba(224,17,95,0.6)] group-hover:scale-105 transition-transform duration-300 ${
                    isFixedNavbar ? "h-10 md:h-10" : "h-12 md:h-16"
                  }`}
                />
              </div>
              <div className="flex flex-col justify-center h-full pt-1">
                <h1
                  className={`font-black leading-none tracking-tighter text-white drop-shadow-md hidden min-[360px]:block ${
                    isFixedNavbar ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                  }`}
                >
                  RUBIES
                </h1>
                <span
                  className={`font-bold tracking-[0.25em] text-(--user-accent) uppercase leading-none mt-1 pl-0.5 hidden min-[360px]:block ${
                    isFixedNavbar ? "text-[8px]" : "text-[8px] md:text-[10px]"
                  }`}
                >
                  UNLEASHED
                </span>
              </div>
            </Link>
          </div>

          {isFixedNavbar ? (
            <div className="hidden md:flex flex-1 max-w-md mx-10 relative z-50">
              <div className="w-full relative group">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                    searchOpen
                      ? "text-(--user-accent)"
                      : "text-slate-500 group-focus-within:text-(--user-accent)"
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
                  className="w-full bg-background border border-white/5 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-(--user-accent)/50 focus:ring-1 focus:ring-(--user-accent)/20 transition-all placeholder:text-slate-600"
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
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target={item.target}
                  rel={
                    item.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors relative py-2 group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-(--user-accent) transition-all duration-300 group-hover:w-full shadow-[0_0_10px_var(--user-accent-glow)]" />
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2 z-50">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-(--user-accent) hover:bg-white/5 rounded-full transition-all"
            >
              <Search size={22} />
            </button>

            {/* ✅ CRITICAL FIX: Loading State for Identity Section */}
            {!initialized ? (
               <div className="flex items-center gap-2 px-2">
                 {/* Skeleton for Notifications */}
                 <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                 {/* Skeleton for User Avatar */}
                 <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse border border-white/5" />
               </div>
            ) : currentUser ? (
              <>
                <div className="flex items-center gap-1">
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() =>
                        setNotificationPanelOpen(!notificationPanelOpen)
                      }
                      className="p-2 text-slate-400 hover:text-(--user-accent) hover:bg-white/5 rounded-full transition-all relative"
                    >
                      <Bell size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-(--user-accent) text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-surface">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationPanel
                      isOpen={notificationPanelOpen}
                      onClose={() => setNotificationPanelOpen(false)}
                    />
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                <div className="relative block" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 transition-all group p-1 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10"
                  >
                    <div className={`w-9 h-9 rounded-full bg-linear-to-tr ${currentUser.isGuest ? 'from-ruby to-pink-500' : 'from-(--user-accent) to-slate-500'} flex items-center justify-center text-lg shadow-lg transition-transform group-hover:scale-110 text-white overflow-hidden`}>
                      {currentUser.avatar && currentUser.avatar.startsWith('http') ? (
                          <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          currentUser.avatar === '👤' ? <User size={18} /> : currentUser.avatar
                      )}
                    </div>
                    <span className="hidden lg:block max-w-32 truncate text-sm font-bold text-slate-300 group-hover:text-white">
                      {currentUser.username}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform hidden lg:block ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 md:w-56 bg-[#161b2c] border border-(--user-accent)/20 rounded-xl shadow-[0_0_40px_var(--user-accent-glow)] overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="h-px bg-linear-to-r from-transparent via-(--user-accent) to-transparent" />
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-linear-to-tr ${currentUser.isGuest ? 'from-ruby to-pink-500' : 'from-(--user-accent) to-slate-500'} flex items-center justify-center text-xl shadow-lg text-white overflow-hidden`}>
                              {currentUser.avatar && currentUser.avatar.startsWith('http') ? (
                                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                  currentUser.avatar === '👤' ? <User size={20} /> : currentUser.avatar
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {currentUser.username}
                            </p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              {currentUser.isGuest
                                ? "Guest Account"
                                : profile?.archetype || "Member"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        {!currentUser.isGuest && (
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

                        {currentUser.isGuest ? (
                          <>
                            <DropdownItem
                              icon={<Upload size={16} />}
                              label="Publish Project"
                              onClick={() => {
                                setUserDropdownOpen(false);
                                router.push("/publish");
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
                              onClick={() => router.push("/publish")}
                            />
                            {isArchitect && (
                              <DropdownItem
                                icon={<LayoutDashboard size={16} />}
                                label="The Forge"
                                onClick={() => router.push("/dashboard")}
                              />
                            )}
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

                        {currentUser.isGuest && (
                          <button
                            onClick={handleUpgrade}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-ruby hover:bg-ruby/10 transition-colors"
                          >
                            <Sparkles size={16} /> Upgrade Account
                          </button>
                        )}

                        <button
                          onClick={handleLogoutClick}
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
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:block bg-(--user-accent) text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg hover:shadow-(--user-accent-glow) active:scale-95"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar and Logout Modal logic remains unchanged but now uses safe currentUser */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-45 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0b0f19] border-r border-(--user-accent)/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-125 bg-(--user-accent)/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-surface/50 backdrop-blur-md">
          <span className="text-xs font-black text-(--user-accent) uppercase tracking-[0.2em]">
            Navigation
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative p-4 flex flex-col gap-1 h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
          {/* ✅ SKELETON or USER CHECK in Sidebar */}
          {!initialized ? (
             <div className="mb-6 pb-6 border-b border-white/10 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-24" />
                        <div className="h-2 bg-white/5 rounded w-16" />
                    </div>
                </div>
             </div>
          ) : currentUser && (
            <div className="mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-linear-to-tr ${currentUser.isGuest ? 'from-ruby to-pink-500' : 'from-(--user-accent) to-slate-500'} flex items-center justify-center text-lg shadow-lg transition-transform group-hover:scale-110 text-white overflow-hidden`}>
                  {currentUser.avatar && currentUser.avatar.startsWith('http') ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      currentUser.avatar === '👤' ? <User size={18} /> : currentUser.avatar
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    @{currentUser.username}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {currentUser.isGuest
                      ? "Guest Account"
                      : profile?.archetype || "Member"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <SidebarLink
            href="/"
            icon={<Activity size={18} />}
            label="Home Feed"
            onClick={() => setMenuOpen(false)}
            active={pathname === "/"}
          />
          <SidebarLink
            href="/explore"
            icon={<LayoutDashboard size={18} />}
            label="The Vault"
            onClick={() => setMenuOpen(false)}
            active={pathname === "/explore"}
          />
          <div className="h-px bg-white/5 my-4 mx-2" />

          {currentUser && (
            <>
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                Library
              </p>
              <SidebarLink
                href={`/${currentUser.username}/wishlist`}
                icon={<Heart size={18} />}
                label="My Wishlist"
                onClick={() => setMenuOpen(false)}
                active={pathname === `/${currentUser.username}/wishlist`}
              />
            </>
          )}

          <SidebarLink
            href="/contact"
            icon={<Contact size={18} />}
            label="Contact Us"
            onClick={() => setMenuOpen(false)}
            active={pathname === "/contact"}
          />
          <SidebarLink
            href="/help"
            icon={<HelpCircle size={18} />}
            label="Help & Support"
            onClick={() => setMenuOpen(false)}
            active={pathname === "/help"}
          />
          <div className="h-px bg-white/5 my-4 mx-2" />

          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
            Creator Tools
          </p>
          <SidebarLink
            href="#"
            icon={<Upload size={18} />}
            label="Publish Project"
            onClick={() => {
              setMenuOpen(false);
              router.push("/publish");
            }}
            active={false}
          />

          {isArchitect && (
            <SidebarLink
              href="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="The Forge"
              onClick={() => setMenuOpen(false)}
              active={pathname === "/dashboard"}
            />
          )}

          <div className="mt-auto pt-6 flex flex-col gap-2 pb-8">
            {!initialized ? null : currentUser ? (
              <>
                {currentUser.isGuest && (
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
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full bg-(--user-accent) text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_var(--user-accent-glow)] active:scale-95 transition-all text-center text-sm"
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
      
      {/* Logout Modal - Preserved unchanged */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLogoutModal(false)}
          />
          
          <div className="relative w-full max-w-sm bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] text-center animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent opacity-50" />

            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
               <LogOut size={32} className="text-red-500 ml-1" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
              Terminate <span className="text-red-500">Session?</span>
            </h3>
            
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              You are about to disconnect from the Vault. Local data will be cleared.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={confirmLogout} 
                disabled={isLoggingOut} 
                className={`
                  flex-1 bg-red-600 hover:bg-red-500 py-3.5 rounded-xl font-bold text-white uppercase tracking-wider text-xs shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2
                  ${isLoggingOut ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </button>
               <button 
                 onClick={() => setShowLogoutModal(false)} 
                 className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-xl font-bold text-slate-300 uppercase tracking-wider text-xs active:scale-95 transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

function SidebarLink({ href, icon, label, onClick, active = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
        active
          ? "bg-(--user-accent)/10 text-white border border-(--user-accent)/20 shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`${
          active ? "text-(--user-accent)" : "group-hover:text-(--user-accent)"
        } transition-colors`}
      >
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-(--user-accent) shadow-[0_0_8px_currentColor]" />
      )}
    </Link>
  );
}