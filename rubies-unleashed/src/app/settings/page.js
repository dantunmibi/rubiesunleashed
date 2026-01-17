"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import SessionErrorOverlay from "@/components/ui/SessionErrorOverlay";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { 
  User, Shield, Cpu, AlertTriangle, Save, Loader2, RefreshCw, LayoutDashboard, Plus, X, Ghost
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToastContext } from "@/components/providers/ToastProvider";

// --- TABS CONFIG ---
const TABS = [
  { id: 'profile', label: 'Identity', icon: User },
  { id: 'archetype', label: 'Protocol', icon: Cpu },
  { id: 'architect', label: 'Architect Profile', icon: LayoutDashboard, role: 'architect' },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
];

export const dynamic = "force-dynamic";

// --- 1. MAIN EXPORT (WRAPPER) ---
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-500" size={48} />
        <p className="text-slate-500 text-sm tracking-widest uppercase animate-pulse">Loading System...</p>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

// --- 2. LOGIC COMPONENT ---
function SettingsContent() {
  const { user, profile, initialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const initialTab = searchParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const { showSessionError, checkApiError, validateSession, triggerError } = useSessionGuard();
  const { showToast } = useToastContext();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    developerName: "",
    avatarUrl: "",
    coverUrl: "", 
    isPublicProfile: true,
    isPublicWishlist: true,
    archetype: "hunter",
    socialLinks: [],
    architectBio: ""
  });

  // Redirect if not logged in
  useEffect(() => {
    if (initialized && !user) router.push('/login');
  }, [initialized, user, router]);

  // Load Data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.display_name || profile.username || "",
        bio: profile.bio || "",
        developerName: profile.developer_name || "",
        avatarUrl: profile.avatar_url || "",
        coverUrl: profile.cover_url || "", 
        isPublicProfile: profile.profile_visibility === 'public',
        isPublicWishlist: profile.is_public_wishlist ?? true,
        archetype: profile.archetype || "hunter",
        socialLinks: profile.social_links || [],
        architectBio: profile.architect_bio || ""
      });
    }
  }, [profile]);

  // Safety Valve
  useEffect(() => {
    let timer;
    if (loading) {
        timer = setTimeout(() => {
            console.warn("Save timed out. Triggering session recovery.");
            setLoading(false);
            if (triggerError) triggerError();
        }, 5000);
    }
    return () => clearTimeout(timer);
  }, [loading, triggerError]);

  // Initial Load Safety Valve
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!initialized) {
            console.warn("Auth initialization timed out (5s).");
            triggerError(); 
        }
    }, 5000);
    return () => clearTimeout(timer);
  }, [initialized, triggerError]);

  const validateImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const handleSave = async () => {
    if (!(await validateSession())) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      if (formData.avatarUrl && formData.avatarUrl.length > 0) {
          if (!(await validateImage(formData.avatarUrl))) throw new Error("Invalid Avatar URL.");
      }
      if (formData.coverUrl && formData.coverUrl.length > 0) {
          if (!(await validateImage(formData.coverUrl))) throw new Error("Invalid Cover URL.");
      }

      const { data: { session } } = await supabase.auth.getSession();

      const updates = {
        display_name: formData.displayName,
        bio: formData.bio,
        developer_name: formData.developerName,
        avatar_url: formData.avatarUrl,
        cover_url: formData.coverUrl,
        profile_visibility: formData.isPublicProfile ? 'public' : 'private',
        is_public_wishlist: formData.isPublicWishlist,
        archetype: formData.archetype,
        social_links: formData.socialLinks,
        architect_bio: formData.architectBio,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (checkApiError(response)) return;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Update failed");
      }

      const result = await response.json();

      if (formData.developerName && formData.developerName.trim()) {
        try {
          const projectsResponse = await fetch('/api/projects/update-developer', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ 
              developer_name: formData.developerName.trim() 
            })
          });

          if (projectsResponse.ok) {
            const projectsResult = await projectsResponse.json();
            console.log(`✅ Updated ${projectsResult.updated_count} projects with new developer name`);
          } else {
            console.warn('Failed to update existing projects');
          }
        } catch (projectError) {
          console.warn('Project update failed:', projectError);
        }
      }

      if (result.data && result.data[0]) {
        const updated = result.data[0];
        setFormData(prev => ({
          ...prev,
          displayName: updated.display_name || updated.username || "",
          bio: updated.bio || "",
          avatarUrl: updated.avatar_url || "",
          coverUrl: updated.cover_url || "",
          isPublicProfile: updated.profile_visibility === 'public',
          isPublicWishlist: updated.is_public_wishlist ?? true,
          archetype: updated.archetype || "hunter",
          socialLinks: updated.social_links || [],
          architectBio: updated.architect_bio || ""
        }));
      }

      showToast("Settings saved! Refreshing...", "success");
      setSuccessMsg("System Updated Successfully.");
      
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error("Save Error:", error);
      if (!showSessionError) showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // LOADING SKELETON
  if ((!initialized || !user) && !showSessionError) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-500" size={48} />
        <p className="text-slate-500 text-sm tracking-widest uppercase animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (showSessionError) {
      return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <SessionErrorOverlay show={true} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      <main className="pt-32 px-6 max-w-6xl mx-auto pb-20">
        
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
              const isHidden = 
                tab.role === 'architect' && 
                profile?.role !== 'architect' && 
                profile?.role !== 'admin';

              if (isHidden) {
                  return null;
              }

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
            
            {successMsg && (
                <div className="absolute top-0 left-0 w-full bg-emerald-500 text-white text-center text-xs font-bold py-2 animate-in slide-in-from-top-full z-10">
                    {successMsg}
                </div>
            )}

            <div className="space-y-8">
                {activeTab === 'profile' && (
                    <ProfileSettings formData={formData} setFormData={setFormData} profile={profile} />
                )}
                {activeTab === 'archetype' && (
                    <ArchetypeSettings formData={formData} setFormData={setFormData} />
                )}
                {activeTab === 'architect' && (
                    <ArchitectProfileSettings formData={formData} setFormData={setFormData} />
                )}
                {activeTab === 'security' && (
                    <SecuritySettings formData={formData} setFormData={setFormData} />
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-(--user-accent) text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

          </div>
        </div>
      </main>

      {/* ✅ SINGLE SESSION ERROR OVERLAY */}
      <SessionErrorOverlay show={showSessionError} />
      
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProfileSettings({ formData, setFormData, profile }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Public Identity</h2>
            
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Display Name</label>
                <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Bio</label>
                <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none h-32 resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="mt-8">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Live Preview</p>
                
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0f131f] h-48 group">
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

function ArchitectProfileSettings({ formData, setFormData }) {
    const [inputs, setInputs] = useState({ label: "Website", url: "" });

    const handleUrlChange = (e) => {
        const val = e.target.value;
        
        const lower = val.toLowerCase();
        let detectedLabel = "Website";
        if (lower.includes('twitter.com') || lower.includes('x.com')) detectedLabel = 'X(Twitter)';
        else if (lower.includes('github.com')) detectedLabel = 'GitHub';
        else if (lower.includes('linkedin.com')) detectedLabel = 'LinkedIn';
        else if (lower.includes('discord.gg') || lower.includes('discord.com')) detectedLabel = 'Discord';
        else if (lower.includes('youtube.com')) detectedLabel = 'YouTube';
        else if (lower.includes('instagram.com')) detectedLabel = 'Instagram';

        setInputs({ label: detectedLabel, url: val });
    };

    const detectLabelFromUrl = (url) => {
      const lower = url.toLowerCase();
      if (lower.includes('twitter.com') || lower.includes('x.com')) return 'X(Twitter)';
      if (lower.includes('github.com')) return 'GitHub';
      if (lower.includes('linkedin.com')) return 'LinkedIn';
      if (lower.includes('discord')) return 'Discord';
      if (lower.includes('youtube.com')) return 'YouTube';
      if (lower.includes('instagram.com')) return 'Instagram';
      return 'Website';
    };

    const handleAddSocial = () => {
      if (!inputs.url) return;

      setFormData({
        ...formData,
        socialLinks: [
          ...(formData.socialLinks || []),
          {
            url: inputs.url,
            label: detectLabelFromUrl(inputs.url),
          },
        ],
      });

      setInputs({ label: "Website", url: "" });
    };

    const handleRemoveSocial = (index) => {
        setFormData({
            ...formData,
            socialLinks: formData.socialLinks.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Architect Portfolio</h2>
                <p className="text-sm text-slate-400">Configure your public developer presence.</p>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    Developer Name (Universal)
                </label>
                <input 
                    type="text" 
                    value={formData.developerName || ""}
                    onChange={(e) => setFormData({...formData, developerName: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none"
                    placeholder="Your developer/studio name"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Used automatically in all your projects. Updates existing projects when changed.
                </p>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Developer Bio</label>
                <textarea 
                    value={formData.architectBio || ""}
                    onChange={(e) => setFormData({...formData, architectBio: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-(--user-accent) focus:outline-none h-32 resize-none placeholder:text-slate-600"
                    placeholder="Describe your development philosophy, tools, or studio mission..."
                />
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Connect Links</label>
                <div className="flex gap-2">
                    <select 
                        value={inputs.label} 
                        onChange={e => setInputs({...inputs, label: e.target.value})}
                        className="bg-[#0b0f19] text-white text-xs border border-white/10 rounded-xl px-3 outline-none focus:border-(--user-accent)"
                    >
                        <option>Website</option><option>GitHub</option><option>X(Twitter)</option><option>LinkedIn</option><option>Discord</option><option>YouTube</option><option>Instagram</option>
                    </select>
                    <input 
                        type="url" 
                        value={inputs.url} 
                        onChange={handleUrlChange} 
                        className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-(--user-accent) focus:outline-none"
                        placeholder="https://..."
                    />
                    <button type="button" onClick={handleAddSocial} className="bg-white/10 hover:bg-white/20 px-4 rounded-xl text-white transition-colors">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2">
                    {formData.socialLinks?.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#0b0f19] rounded-lg border border-white/5 text-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-400 font-bold w-20">{s.label}:</span>
                                <span className="text-(--user-accent) truncate font-mono text-xs">{s.url}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveSocial(i)}><X size={14} className="text-slate-600 hover:text-red-400"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ArchetypeSettings({ formData, setFormData }) {
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
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Privacy & Visibility</h2>

                {formData.archetype === 'phantom' && (
                    <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Ghost size={20} className="text-violet-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-violet-400 mb-1">Phantom Protocol Active</h4>
                                <p className="text-xs text-slate-400">
                                    As a Phantom, your profile defaults to private. You can make it public below if you choose.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
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