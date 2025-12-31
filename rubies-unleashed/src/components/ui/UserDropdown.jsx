/**
 * ================================================================
 * USER DROPDOWN - Profile Menu Component
 * ================================================================
 * 
 * Purpose:
 * - Dropdown menu for logged-in users and guests
 * - Different menu items based on user type
 * - Click outside to close
 * 
 * Features:
 * - Detects real users vs guests
 * - Shows different options for each
 * - Smooth animations
 * - Keyboard accessible (ESC to close)
 * 
 * Menu Structure:
 * - Real Users: Full menu with Activity, Creator Dashboard
 * - Guests: Limited menu with Upgrade Account option
 * ================================================================
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Heart, Activity, Upload, LayoutDashboard, 
  Settings, HelpCircle, LogOut, ChevronDown, Sparkles 
} from "lucide-react";

export default function UserDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const isGuest = user?.isGuest || user?.id?.startsWith('temp_');

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleLogout = () => {
    // 🔮 FUTURE: Call API logout endpoint
    // await fetch('/api/auth/logout', { method: 'POST' });
    
    // For now: Clear localStorage and reload
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("ruby_user_data");
      window.location.href = "/";
    }
  };

  const handleUpgrade = () => {
    setIsOpen(false);
    router.push("/signup");
  };

  const MenuItem = ({ href, icon: Icon, label, onClick, divider = false }) => (
    <>
      {divider && <div className="h-px bg-white/10 my-1" />}
      {onClick ? (
        <button
          onClick={() => {
            onClick();
            setIsOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
        >
          <Icon size={16} className="text-slate-500" />
          {label}
        </button>
      ) : (
        <Link
          href={href}
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Icon size={16} className="text-slate-500" />
          {label}
        </Link>
      )}
    </>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">
          {user.avatar}
        </span>
        <span className="max-w-32 truncate hidden lg:block">
          {user.username}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 hidden lg:block ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-[#161b2c] border border-ruby/20 rounded-xl shadow-[0_0_40px_rgba(224,17,95,0.2)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top border glow */}
          <div className="h-px bg-linear-to-r from-transparent via-ruby to-transparent" />

          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  {isGuest ? "Guest Account" : "Premium Member"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Common Items */}
            <MenuItem 
              href={`/${user.username}`} 
              icon={User} 
              label="Profile" 
            />
            <MenuItem 
              href={`/${user.username}/wishlist`} 
              icon={Heart} 
              label="Wishlist" 
            />

            {/* Real User Only */}
            {!isGuest && (
              <MenuItem 
                href="/activity" 
                icon={Activity} 
                label="Activity" 
              />
            )}

            {/* Upload Section */}
            <MenuItem 
              href="/publish" 
              icon={Upload} 
              label="Upload Project" 
              divider={true}
            />

            {/* Real User Only */}
            {!isGuest && (
              <MenuItem 
                href="/dashboard" 
                icon={LayoutDashboard} 
                label="Creator Dashboard" 
              />
            )}

            {/* Settings & Help */}
            <MenuItem 
              href="/settings" 
              icon={Settings} 
              label="Settings" 
              divider={true}
            />
            <MenuItem 
              href="/help" 
              icon={HelpCircle} 
              label="Help & Support" 
            />

            {/* Guest: Upgrade Account */}
            {isGuest && (
              <MenuItem 
                onClick={handleUpgrade}
                icon={Sparkles} 
                label="Upgrade Account" 
                divider={true}
              />
            )}

            {/* Logout */}
            <MenuItem 
              onClick={handleLogout}
              icon={LogOut} 
              label="Log Out" 
              divider={!isGuest}
            />
          </div>
        </div>
      )}
    </div>
  );
}