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
 * - Home Mode: h-24, transparent, centered links, scrolls away
 * - Explore Mode: h-14, fixed, search bar, always visible
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
  Bell, Users, Search, ChevronDown, Contact
} from "lucide-react";
import { getCurrentUser } from "@/lib/userManager";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
const notificationRef = useRef(null);

  // Determine navbar mode based on current page
  const isExplorePage = pathname === '/explore';
  const isHomePage = pathname === '/';

  // Load current user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Listen for user changes
  useEffect(() => {
    const handleUserChange = () => {
      console.log("🔄 Navbar detected user change");
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
    console.log("👤 Navbar user state:", user ? user.username : "No user");
  };

  const isGuest = currentUser?.isGuest || currentUser?.id?.startsWith('temp_');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Vault", href: "/explore" },
    { name: "About", href: "/#about" },
    { name: "Publish", href: "https://forms.gle/i7X2sUJ5cnqsUciA6", target: "_blank" },
  ];

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
  // Add effect to load unread count
useEffect(() => {
  updateUnreadCount();
}, []);

// Listen for notification changes
useEffect(() => {
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

// Close notification panel on click outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setNotificationPanelOpen(false);
    }
  };

  if (notificationPanelOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [notificationPanelOpen]);

  return (
    <>
      {/* ========================================
          NAVBAR - ADAPTIVE DESIGN
          ======================================== */}
      <nav 
        className={`
          ${isExplorePage ? 'fixed' : 'absolute'} 
          top-0 left-0 right-0 z-100 w-full border-none
          ${isExplorePage 
            ? 'h-14 bg-surface/95 backdrop-blur-md border-b border-white/5 shadow-2xl' 
            : 'h-24 bg-linear-to-b from-black/60 to-transparent'
          }
          transition-all duration-300
        `}
      >
        <div className={`${isExplorePage ? 'max-w-full' : 'max-w-7xl'} mx-auto px-4 lg:px-6 h-full flex items-center justify-between relative`}>
          
          {/* ========================================
              LEFT SECTION
              ======================================== */}
          <div className="flex items-center gap-2 z-50">
            {/* Menu Button (Mobile + Explore Mode) */}
            {(isExplorePage || menuOpen) && (
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`
                  p-2 hover:bg-white/5 rounded-full transition-all relative group
                  ${isExplorePage ? 'text-slate-400 hover:text-ruby' : 'text-white hover:text-ruby md:hidden'}
                `}
                aria-label="Toggle Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
                {isExplorePage && (
                  <div className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-ruby border-2 border-surface rounded-full group-hover:scale-125 transition-transform" />
                )}
              </button>
            )}

            {/* Mobile Menu Button (Home Mode) */}
            {!isExplorePage && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-white hover:text-ruby transition-colors p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10"
                aria-label="Toggle Menu"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            )}
            
            {/* Logo */}
            <Link href="/" className={`flex items-center group ${isExplorePage ? 'gap-2.5 ml-2' : 'gap-1'}`}>
              {isExplorePage ? (
                /* Compact Logo (Explore Mode) */
                <>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(224,17,95,0.4)] transition-transform group-hover:scale-105">
                                      
                    <img
                      src="/ru-logo.png"
                      alt="Rubies Unleashed"
                      className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(224,17,95,0.6)] group-hover:scale-105 transition-transform duration-300"
                    />
                  
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-white font-black text-[13px] leading-none tracking-tighter">
                      RUBIES
                    </span>
                    <span className="text-ruby font-bold text-[8px] leading-none tracking-[0.2em] uppercase mt-0.5">
                      Unleashed
                    </span>
                  </div>
                </>
              ) : (
                /* Full Logo (Home Mode) */
                <>
                  <div className="flex items-center justify-center h-full">
                    <img
                      src="/ru-logo.png"
                      alt="Rubies Unleashed"
                      className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(224,17,95,0.6)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="hidden md:flex flex-col justify-center h-full pt-1">
                    <h1 className="font-black text-2xl leading-none tracking-tighter text-white drop-shadow-md">
                      RUBIES
                    </h1>
                    <span className="font-bold text-[10px] tracking-[0.25em] text-ruby uppercase leading-none mt-1.5 pl-0.5">
                      UNLEASHED
                    </span>
                  </div>
                </>
              )}
            </Link>
          </div>

          {/* ========================================
              CENTER SECTION - ADAPTIVE
              ======================================== */}
          {isExplorePage ? (
            /* Search Bar (Explore Mode) */
            <div className="hidden md:flex flex-1 max-w-md mx-10">
              <div className="w-full relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-ruby transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search the Vault..." 
                  className="w-full bg-background border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-ruby/50 focus:ring-1 focus:ring-ruby/20 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          ) : (
            /* Nav Links (Home Mode) */
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
              RIGHT SECTION
              ======================================== */}
          <div className="flex items-center gap-1 sm:gap-2 z-50">
            {currentUser ? (
              <>
                {/* Notification Icons (Only on Explore + Desktop) */}
{isExplorePage && (
  <div className="hidden sm:flex items-center gap-1">
    {/* Notification Bell with Panel */}
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
        className="p-2 text-slate-400 hover:text-ruby hover:bg-white/5 rounded-full transition-all relative"
      >
        <Bell size={20} />
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
    
    <button className="p-2 text-slate-400 hover:text-ruby hover:bg-white/5 rounded-full transition-all">
      <Users size={20} />
    </button>
  </div>
)}
                
                {isExplorePage && (
                  <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
                )}
                
                {/* User Dropdown */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`
                      flex items-center gap-2 transition-all group
                      ${isExplorePage 
                        ? 'p-1 pr-2 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10' 
                        : 'text-sm font-bold text-slate-300 hover:text-white'
                      }
                    `}
                  >
                    <div className={`
                      ${isExplorePage ? 'w-8 h-8' : 'w-9 h-9'} 
                      rounded-full bg-linear-to-tr from-ruby to-pink-500 
                      flex items-center justify-center 
                      ${isExplorePage ? 'text-lg' : 'text-2xl'} 
                      shadow-lg transition-transform group-hover:scale-110
                    `}>
                      {currentUser.avatar || "👤"}
                    </div>
                    <span className={`${isExplorePage ? 'hidden sm:block' : 'max-w-32'} truncate hidden lg:block`}>
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
                    <div className="absolute top-full right-0 mt-3 w-56 bg-[#161b2c] border border-ruby/20 rounded-xl shadow-[0_0_40px_rgba(224,17,95,0.2)] overflow-hidden z-110 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        <DropdownItem 
                          icon={<User size={16} />} 
                          label="Profile" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push(`/${currentUser.username}`);
                          }}
                        />
                        <DropdownItem 
                          icon={<Heart size={16} />} 
                          label="Wishlist" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push(`/${currentUser.username}/wishlist`);
                          }}
                        />

                        {!isGuest && (
                          <DropdownItem 
                            icon={<Activity size={16} />} 
                            label="Activity" 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              router.push("/activity");
                            }}
                          />
                        )}

                        <div className="h-px bg-white/10 my-1" />

                        <DropdownItem 
                          icon={<Upload size={16} />} 
                          label="Upload Project" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/publish");
                          }}
                        />

                        {!isGuest && (
                          <DropdownItem 
                            icon={<LayoutDashboard size={16} />} 
                            label="Creator Dashboard" 
                            onClick={() => {
                              setUserDropdownOpen(false);
                              router.push("/dashboard");
                            }}
                          />
                        )}

                        <div className="h-px bg-white/10 my-1" />

                        <DropdownItem 
                          icon={<Contact size={16} />} 
                          label="Contact Us" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/contact");
                          }}
                        />
                        <DropdownItem 
                          icon={<HelpCircle size={16} />} 
                          label="Help & Support" 
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/help");
                          }}
                        />

                        <div className="h-px bg-white/10 my-1" />

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
                  className="hidden md:block text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="hidden md:block bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-ruby hover:text-white transition-all shadow-lg hover:shadow-ruby/50 active:scale-95"
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
          ======================================== */}
      <aside 
        className={`
          fixed ${isExplorePage ? 'top-14' : 'top-0'} left-0 bottom-0 z-90 w-72 
          bg-surface border-r border-white/5 
          transform transition-transform duration-500 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="absolute top-0 left-0 w-full h-125 bg-ruby/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative p-6 flex flex-col gap-1 h-full overflow-y-auto custom-scrollbar">
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

          {/* Main Navigation */}
          <SidebarLink 
            href="/" 
            icon={<Activity size={18} />} 
            label="Home Feed" 
            onClick={() => setMenuOpen(false)} 
            active={isHomePage}
          />
          <SidebarLink 
            href="/explore" 
            icon={<LayoutDashboard size={18} />} 
            label="The Vault" 
            onClick={() => setMenuOpen(false)} 
            active={isExplorePage}
          />
          {currentUser && !isGuest && (
            <SidebarLink 
              href="/activity" 
              icon={<Sparkles size={18} />} 
              label="Live Activity" 
              onClick={() => setMenuOpen(false)} 
            />
          )}
          
          <div className="h-px bg-white/5 my-6 mx-2" />
          
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
            Library
          </p>
          {currentUser && (
            <SidebarLink 
              href={`/${currentUser.username}/wishlist`}
              icon={<Heart size={18} />} 
              label="My Wishlist" 
              onClick={() => setMenuOpen(false)} 
            />
          )}
          <SidebarLink 
            href="/publish" 
            icon={<Upload size={18} />} 
            label="Publish Project" 
            onClick={() => setMenuOpen(false)} 
          />

          {currentUser && !isGuest && (
            <SidebarLink 
              href="/dashboard" 
              icon={<LayoutDashboard size={18} />} 
              label="Creator Dashboard" 
              onClick={() => setMenuOpen(false)} 
            />
          )}
          
          {/* Bottom Section */}
          <div className="mt-auto pt-6 flex flex-col gap-2">
            <SidebarLink 
              href="/settings" 
              icon={<Settings size={18} />} 
              label="Settings" 
              onClick={() => setMenuOpen(false)} 
            />
            <SidebarLink 
              href="/help" 
              icon={<HelpCircle size={18} />} 
              label="Help & Support" 
              onClick={() => setMenuOpen(false)} 
            />
            
            {currentUser && (
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
            )}
            
            {/* Guest Auth Buttons */}
            {!currentUser && (
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
                  className="text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors text-center"
                >
                  Member Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-80 backdrop-blur-sm transition-opacity duration-500" 
          onClick={() => setMenuOpen(false)}
        />
      )}
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