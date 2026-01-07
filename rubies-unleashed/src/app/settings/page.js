"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { 
  User, Shield, Cpu, AlertTriangle, Save, Loader2, Check, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";

// --- TABS CONFIG ---
const TABS = [
  { id: 'profile', label: 'Identity', icon: User },
  { id: 'archetype', label: 'Protocol', icon: Cpu },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
];


export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    coverUrl: "", 
    isPublicProfile: true,
    isPublicWishlist: true,
    archetype: "hunter"
  });

  // Load Data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || profile.username || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatar_url || "",
        coverUrl: profile.cover_url || "", // ✅ Ensure empty string fallback
        isPublicProfile: profile.profile_visibility === 'public',
        isPublicWishlist: profile.is_public_wishlist ?? true,
        archetype: profile.archetype || "hunter"
      });
    }
  }, [profile]);

  // Helper: Verify Image URL
  const validateImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg("");

    // 1. Validate Avatar
    if (formData.avatarUrl && formData.avatarUrl.length > 0) {
        const isValid = await validateImage(formData.avatarUrl);
        if (!isValid) {
            alert("Avatar URL is invalid or unreachable.");
            setLoading(false);
            return;
        }
    }

    // 2. Validate Cover
    if (formData.coverUrl && formData.coverUrl.length > 0) {
        const isValid = await validateImage(formData.coverUrl);
        if (!isValid) {
            alert("Cover Image URL is invalid or unreachable.");
            setLoading(false);
            return;
        }
    }

    try {
      const updates = {
        display_name: formData.displayName,
        bio: formData.bio,
        avatar_url: formData.avatarUrl,
        cover_url: formData.coverUrl,
        profile_visibility: formData.isPublicProfile ? 'public' : 'private',
        is_public_wishlist: formData.isPublicWishlist,
        archetype: formData.archetype,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMsg("System Updated Successfully.");
      
      // Force Theme Update if Archetype Changed
      if (formData.archetype !== profile.archetype) {
         window.location.reload();
      }

    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // AuthProvider redirects

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      <main className="pt-32 px-6 max-w-6xl mx-auto pb-20">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">
            Control <span className="text-(--user-accent)">Panel</span>
          </h1>
          <p className="text-slate-400">Manage your identity, visibility, and system preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR TABS --- */}
          <aside className="lg:w-64 shrink-0 space-y-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                    isActive 
                      ? "bg-(--user-accent) text-white shadow-(--user-accent-glow)" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 bg-[#161b2c] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            
            {/* Success Toast */}
            {successMsg && (
                <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white text-center text-xs font-bold py-2 animate-in slide-in-from-top-full">
                    {successMsg}
                </div>
            )}

            {/* Content Switcher */}
            <div className="space-y-8">
                {activeTab === 'profile' && (
                    <ProfileSettings formData={formData} setFormData={setFormData}  profile={profile}  />
                )}
                {activeTab === 'archetype' && (
                    <ArchetypeSettings formData={formData} setFormData={setFormData} />
                )}
                {activeTab === 'security' && (
                    <SecuritySettings formData={formData} setFormData={setFormData} />
                )}
            </div>

            {/* Save Bar */}
            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-(--user-accent) text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProfileSettings({ formData, setFormData, profile }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Public Identity</h2>
            
            {/* Display Name */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Display Name</label>
                <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none"
                />
            </div>

            {/* Bio */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Bio</label>
                <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none h-32 resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar URL */}
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Avatar URL</label>
                    <input 
                        type="text" 
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none text-xs font-mono"
                        placeholder="https://..."
                    />
                </div>

                {/* ✅ NEW: Cover URL */}
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Cover Image URL</label>
                    <input 
                        type="text" 
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none text-xs font-mono"
                        placeholder="https://..."
                    />
                </div>
            </div>
            
            {/* Live Preview */}
            <div className="mt-8">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Live Preview</p>
                
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f131f] h-48 group">
                    {/* Cover Background */}
                    <div className="absolute inset-0">
                        {formData.coverUrl ? (
                            <>
                                <img src={formData.coverUrl} className="w-full h-full object-cover opacity-60" alt="Cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-[#0f131f] via-[#0f131f]/40 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-(--user-accent)/10" />
                        )}
                    </div>

                    {/* Avatar & Info Composition */}
                    <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
                        <div className="w-20 h-20 rounded-full bg-linear-to-tr from-(--user-accent) to-slate-600 p-1 shadow-2xl overflow-hidden">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} className="w-full h-full object-cover rounded-full bg-[#0b0f19]" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#0b0f19] flex items-center justify-center text-white">
                                    <User size={24} />
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight shadow-black drop-shadow-md">
                                {formData.displayName || "Display Name"}
                            </h3>
                            <p className="text-xs text-slate-300 font-bold opacity-80">@{profile?.username || "username"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchetypeSettings({ formData, setFormData }) {
    // Reusing the Archetype definitions, but simplified for settings
    const archetypes = ['hunter', 'netrunner', 'curator', 'phantom'];
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Operational Directive</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {archetypes.map(id => (
                    <button
                        key={id}
                        onClick={() => setFormData({...formData, archetype: id})}
                        className={`
                            p-4 rounded-xl border-2 text-left capitalize font-bold transition-all
                            ${formData.archetype === id 
                                ? 'border-(--user-accent) bg-(--user-accent)/10 text-white' 
                                : 'border-white/10 text-slate-400 hover:bg-white/5'}
                        `}
                    >
                        {id}
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
                Changing your archetype will update your dashboard feed and interface theme immediately upon save.
            </p>
        </div>
    );
}

function SecuritySettings({ formData, setFormData }) {
    return (
        <div className="space-y-8">
            {/* Privacy Toggles */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Privacy & Visibility</h2>
                
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div>
                        <p className="font-bold text-white">Public Profile</p>
                        <p className="text-xs text-slate-500">Allow others to view your profile page.</p>
                    </div>
                    <Toggle 
                        checked={formData.isPublicProfile} 
                        onChange={(val) => setFormData({...formData, isPublicProfile: val})} 
                    />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div>
                        <p className="font-bold text-white">Public Wishlist</p>
                        <p className="text-xs text-slate-500">Show your saved items on your profile.</p>
                    </div>
                    <Toggle 
                        checked={formData.isPublicWishlist} 
                        onChange={(val) => setFormData({...formData, isPublicWishlist: val})} 
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div>
                <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} /> Danger Zone
                </h2>
                <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="font-bold text-white text-sm">Delete Account</p>
                        <p className="text-xs text-slate-400">Permanently remove your identity and data.</p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-(--user-accent)' : 'bg-slate-700'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    );
}