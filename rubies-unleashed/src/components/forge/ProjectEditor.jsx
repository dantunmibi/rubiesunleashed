'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToastContext } from '@/components/providers/ToastProvider';
import { notifyProjectUpdated } from '@/lib/projectNotifications';
import { supabase } from '@/lib/supabase'; // Client Singleton
import { 
  Upload, Link as LinkIcon, Image as ImageIcon, Check, Loader2, Tag, 
  Monitor, Smartphone, Command, Apple, Globe, Box, X, Plus, 
  Youtube, Layers, ShieldCheck, User, Calendar, Save, Cpu, Keyboard, AlertTriangle, Lightbulb,
  Gamepad2, AppWindow, Play, Scale, ArrowLeft, ArrowRight
} from 'lucide-react';
import { 
  PROJECT_STATUSES, 
  detectProjectStatus, 
  injectStatusTag 
} from "@/lib/game-utils";

/**
 * 🎨 CONSTANTS & CONFIGURATION
 * Defines section tabs, placeholder images, and tag lists.
 */
const PLACEHOLDER_COVER = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=900";

const SECTIONS = [
  { id: 'basics', label: 'Identity', icon: User },
  { id: 'media', label: 'Media Assets', icon: ImageIcon },
  { id: 'tech', label: 'Technical Specs', icon: Layers },
  { id: 'safety', label: 'Safety & Ratings', icon: ShieldCheck },
  { id: 'distribution', label: 'Distribution', icon: Globe },
];

const PLATFORM_OPTIONS = [
  { id: 'Windows', icon: Monitor }, { id: 'Mac', icon: Command },
  { id: 'Linux', icon: Box }, { id: 'Web', icon: Globe },
  { id: 'Android', icon: Smartphone }, { id: 'iOS', icon: Apple }
];

// Tag categories for intelligent filtering based on Archetype
const GAME_TAGS = [
  "Action", "Adventure", "RPG", "Strategy", "Simulation", "Puzzle", 
  "Shooter", "Platformer", "Visual Novel", "Fighting", "Racing", "Sports", 
  "Horror", "Sci-Fi", "Fantasy", "Cyberpunk"
];

const APP_TAGS = [
  "Utility", "Productivity", "Development", "Design", "System", "Tool", 
  "Social", "Education", "Multimedia", "Security", "Open Source"
];

const UNIVERSAL_TAGS = [
  "Pixel Art", "Retro", "Cozy", "Minimalist", "Family Friendly", 
  "PWA", "2D", "3D", "VR", "Mobile"
];

const LICENSES = ["Free", "Demo", "Paid", "Open Source"];

/**
 * 🛠️ PROJECT EDITOR COMPONENT
 * The core metadata editor for "The Forge".
 * Handles:
 * - Multi-step form navigation
 * - Dynamic Game/App schema switching
 * - File uploads (Cover/Screenshots)
 * - Autosave tracking (Dirty state)
 */
export default function ProjectEditor({ project = null, mode = 'create' }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToastContext();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false); // ✅ Add this

  // Auth State
  const [authToken, setAuthToken] = useState(null);
  const [showSessionError, setShowSessionError] = useState(false);

  // --- TOKEN CACHING LOGIC (Robust Fix) ---
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthToken(session?.access_token);
      } else {
        setAuthToken(null);
      }
    };
    getToken();
  }, [user]);

  // --- HELPER: AUTH TOKEN REFRESHER ---
  const getAuthToken = async () => {
      // 1. Try Cached first (Fast)
      if (authToken) return authToken;
      
      // 2. If missing, try fresh getSession (Fallback)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
          if (confirm("Session expired. Reload page to re-authenticate?")) {
              window.location.reload();
          }
          throw new Error("AUTH_EXPIRED");
      }
      return session.access_token;
  };
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('basics');
  const [isDirty, setIsDirty] = useState(false);
  const [projectStatus, setProjectStatus] = useState('stable');

  // ✅ ADD THIS: Block editing for banned projects
  const isBanned = project?.status === 'banned';
  
  // ✅ ADD THIS: Fetch ban reason
  const [banReason, setBanReason] = useState(null);
  
  useEffect(() => {
    if (isBanned && project?.id) {
      const fetchBanReason = async () => {
        const { data } = await supabase
          .from('moderation_actions')
          .select('reason, created_at, admin_username')
          .eq('project_id', project.id)
          .eq('action_type', 'ban')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) setBanReason(data);
      };
      fetchBanReason();
    }
  }, [isBanned, project?.id]);

  // --- STATE INITIALIZATION ---
  // Hydrates from existing project prop or sets defaults for new creation.
  const [formData, setFormData] = useState({
    title: project?.title || "",
    developer: project?.developer || "",
    version: project?.version || "1.0",
    license: project?.license || "Free",
    description: project?.description || "", // Short (Card)
    full_description: project?.full_description || project?.description || "", // Full (Page)
    tags: project?.tags || [],
    type: project?.type || (project?.tags?.includes('App') ? 'App' : 'Game'), // Inferred Type
    
    // Media
    cover_url: project?.cover_url || "",
    video_url: project?.video_url || "",
    screenshots: project?.screenshots || [],
    
    // Tech
    features: project?.features || [],
    requirements: project?.requirements || [],
    controls: project?.controls || [],
    how_it_works: project?.how_it_works || [],
    
    // Distribution (Array of {platform, url})
    download_links: project?.download_links || [],
    social_links: project?.social_links || [], 
    html5_embed_url: project?.html5_embed_url || "",
    
    // Safety
    size: project?.size || "",
    age_rating: project?.age_rating || "All Ages",
    content_warning: (() => {
    const warning = project?.content_warning;
    // Handle empty array string, actual empty arrays, null, or whitespace
    if (!warning || 
        warning === '[]' || 
        warning === '' || 
        (Array.isArray(warning) && warning.length === 0) ||
        (typeof warning === 'string' && warning.trim() === '')) {
      return "";
    }
    // If it's an array, join it
    if (Array.isArray(warning)) {
      return warning.join('\n');
    }
    // Return as-is if it's a valid string
    return warning;
  })()
  });

  // Temporary inputs for adding to arrays
  const [inputs, setInputs] = useState({
    tag: "",
    feature: "",
    req: "",
    control: "",
    howTo: "",
    screenshot: "",
    socialLabel: "Website",
    socialUrl: "",
    dlPlatform: "Windows",
    dlUrl: ""
  });

  // --- THEME LOGIC (Based on Global CSS Variables) ---
  const isApp = formData.type === 'App';
  
  // Dynamic class construction based on archetype
  // These map to your globals.css variables (e.g. text-netrunner -> var(--color-netrunner))
  const themeText = isApp ? 'text-netrunner' : 'text-ruby';
  const themeBg = isApp ? 'bg-netrunner' : 'bg-ruby';
  const themeBorder = isApp ? 'border-netrunner' : 'border-ruby';
  const themeFocus = isApp ? 'focus:border-netrunner' : 'focus:border-ruby';
  const themeBgLight = isApp ? 'bg-netrunner/10' : 'bg-ruby/10';
  const themeBorderLight = isApp ? 'border-netrunner/30' : 'border-ruby/30';

  if (authLoading) return null;

  // ✅ ADD THIS: Return early if banned
  if (isBanned) {
    return (
      <div className="min-h-screen bg-background pt-32 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-400 mb-3">
                  Editing Disabled
                </h1>
                <p className="text-slate-300 mb-4">
                  This project has been banned and cannot be edited until reviewed by an administrator.
                </p>
                
                {banReason && (
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                      Moderation Reason
                    </p>
                    <p className="text-slate-300 text-sm mb-3">{banReason.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Banned by: <span className="text-red-400 font-mono">{banReason.admin_username}</span></span>
                      <span>•</span>
                      <span>{new Date(banReason.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/${user?.user_metadata?.username}/dashboard/project/${project.id}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-bold uppercase text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Cockpit
                  </button>
                  
                  <button
                    onClick={() => router.push('/contact')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-colors font-bold uppercase text-sm"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HANDLERS ---

  // Helper to update state and mark dirty
  const handleChange = (setter) => {
      setter();
      setIsDirty(true);
  };

  // Navigation Logic
  const handleNextSection = () => {
      const idx = SECTIONS.findIndex(s => s.id === activeSection);
      if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id);
  };

  const handlePrevSection = () => {
      const idx = SECTIONS.findIndex(s => s.id === activeSection);
      if (idx > 0) setActiveSection(SECTIONS[idx - 1].id);
  };

  // Safe Back Button (Alerts on unsaved changes)
  const handleBack = () => {
      if (isDirty) {
          setShowUnsavedModal(true);
      } else {
          router.push(`/${user?.user_metadata?.username}/dashboard/project/${project.id}`);
      }
  };

  // ✅ Add this helper function:
  const confirmDiscard = () => {
      setShowUnsavedModal(false);
      router.push(`/${user.username}/dashboard/project/${project.id}`);
  };

  // Generic Array Add Handler
  const handleArrayAdd = (field, inputKey) => {
    const val = inputs[inputKey]?.trim();
    if (!val) return;
    handleChange(() => {
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), val] }));
        setInputs(prev => ({ ...prev, [inputKey]: "" }));
    });
  };

  // Generic Array Remove Handler
  const handleArrayRemove = (field, index) => {
    handleChange(() => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    });
  };

  // Toggle Tag Selection
  const toggleTag = (tag) => {
    handleChange(() => {
        setFormData(prev => {
            const exists = prev.tags.includes(tag);
            return {
                ...prev,
                tags: exists ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
            };
        });
    });
  };

  // Social Link Handler
  const handleAddSocial = () => {
    if (!inputs.socialUrl) return;
    handleChange(() => {
        setFormData(prev => ({
            ...prev,
            social_links: [...(prev.social_links || []), { label: inputs.socialLabel, url: inputs.socialUrl }]
        }));
        setInputs(prev => ({ ...prev, socialUrl: "" }));
    });
  };

  // Download Link Handler
  const handleAddDownload = () => {
    if (!inputs.dlUrl) return;
    handleChange(() => {
        setFormData(prev => ({
            ...prev,
            download_links: [...(prev.download_links || []), { platform: inputs.dlPlatform, url: inputs.dlUrl }]
        }));
        setInputs(prev => ({ ...prev, dlUrl: "" }));
    });
  };

  // Archetype Toggle (Resets tags slightly to match context)
  const toggleType = (type) => {
    handleChange(() => {
        setFormData(prev => ({
            ...prev,
            type,
            // Keep existing tags but ensure proper primary tag exists
            tags: type === 'App' 
                ? [...prev.tags.filter(t => t !== 'Game'), 'App'] 
                : [...prev.tags.filter(t => t !== 'App'), 'Game']
        }));
    });
  };

  // Specific field update helper
  const updateField = (field, value) => {
      handleChange(() => {
          setFormData(prev => ({ ...prev, [field]: value }));
      });
  };

  // File Upload Handler (Direct to Supabase Storage API)
  const handleFileUpload = async (e, type) => {
      const file = e.target.files[0];
      if (!file) return;
      e.target.value = ''; 

      if (!project?.id) { showToast("Please save project first.", "error"); return; }

      setUploading(true);
      try {
          // Use helper to get valid token
          const token = await getAuthToken();

          const fd = new FormData();
          fd.append('file', file);
          fd.append('projectId', project.id);
          fd.append('type', type === 'cover' ? 'cover' : 'screenshot');

          const res = await fetch('/api/projects/upload-image', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: fd
          });

          if (!res.ok) {
              if (res.status === 401) {
                  setShowSessionError(true);
                  throw new Error("AUTH_EXPIRED");
              }
              const errData = await res.json();
              throw new Error(errData.error || "Upload failed");
          }
          
          const { url } = await res.json();

          handleChange(() => {
              if (type === 'cover') setFormData(prev => ({ ...prev, cover_url: url }));
              else setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, url] }));
          });
          showToast("Image uploaded!", "success");
      } catch (err) {
          if (err.message !== "AUTH_EXPIRED") {
              console.error(err);
              showToast(err.message || "Upload failed", "error");
          }
      } finally {
          setUploading(false);
      }
  };
  // Main Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSaveSuccess(false);

    try {
      if (!formData.title) throw new Error("Title is required.");
      
      // 1. Get Token (might throw AUTH_EXPIRED)
      const token = await getAuthToken();

      const endpoint = mode === 'create' ? '/api/projects/create' : '/api/projects/update';
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const primaryPlatform = formData.download_links?.[0]?.platform || "Windows";

      const payload = {
        ...formData,
        platform: primaryPlatform,
        id: project?.id
      };

      // 2. Perform Request
      const response = await fetch(endpoint, {
          method,
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
      });

      // 3. Check Response
      if (!response.ok) {
          // Explicitly check for 401 Unauthorized here too
          if (response.status === 401) {
              throw new Error("AUTH_EXPIRED");
          }
          const err = await response.json();
          throw new Error(err.error || "Save failed");
      }

      const data = await response.json();
      
      // 4. Success State
      setIsDirty(false);
      setSaveSuccess(true);
      if (mode === 'edit') {
          notifyProjectUpdated(data.project);
      }
      showToast(mode === 'create' ? "Project initialized!" : "Changes saved successfully!", "success");
      setTimeout(() => setSaveSuccess(false), 2000);
      
      if (mode === 'create') {
          router.push(`/${user.username}/dashboard/project/${data.project.id}/edit`);
      } else {
          router.refresh();
      }

    } catch (err) {
        // 5. Error Handling & Overlay Trigger
        console.error("Save Error:", err);
        
        if (err.message === "AUTH_EXPIRED" || err.message.includes("jwt")) {
            setShowSessionError(true); // <--- TRIGGERS OVERLAY
        } else {
            showToast(err.message, "error");
        }
    } finally {
        setLoading(false); // <--- STOPS SPINNER ALWAYS
    }
  };
  // Tagging Logic Helper
  const getVisibleTags = () => {
    const typeTags = isApp ? APP_TAGS : GAME_TAGS;
    return [...typeTags, ...UNIVERSAL_TAGS];
  };

    // --- HELPER: LIST HANDLER FACTORY ---
  const listHandler = (field, key) => ({
      items: formData[field],
      onRemove: (i) => handleArrayRemove(field, i),
      inputValue: inputs[key],
      onInputChange: (v) => setInputs(p => ({ ...p, [key]: v })),
      onAdd: () => handleArrayAdd(field, key)
  });

// Initialize project status from tags when project loads
useEffect(() => {
  if (project?.tags) {
    const initialStatus = detectProjectStatus(project.tags);
    setProjectStatus(initialStatus);
  }
}, [project?.id]);
  
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Top Navigation / Breadcrumb */}
        <div>
            <button 
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                {isDirty ? 'Discard & Back' : 'Back to Cockpit'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: FORM EDITOR --- */}
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8 bg-[#161b2c] border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col min-h-150">
                    
                    {/* Theme Accent Bar */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${themeBg} opacity-50`} />

                    {/* Section Tabs Navigation */}
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5 pb-4">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                                    ${activeSection === section.id 
                                        ? `${themeBg} text-white shadow-lg` 
                                        : "text-slate-500 hover:text-white bg-white/5"}
                                `}
                            >
                                <section.icon size={12} /> {section.label}
                            </button>
                        ))}
                    </div>

                    {/* Header Action (Save) */}
                    <div className="flex justify-end items-center mb-2">
<button
    type="submit"
    disabled={loading || (!isDirty && mode !== 'create' && !saveSuccess)}
    className={`hidden md:flex ${saveSuccess ? 'bg-green-500 border-green-600' : themeBg} hover:opacity-90 text-white font-bold uppercase text-xs px-4 py-2 rounded-xl transition-all items-center gap-2 disabled:opacity-50`}
>
    {loading ? <Loader2 className="animate-spin" size={14} /> : 
     saveSuccess ? <Check size={14} /> : <Save size={14} />} 
    {saveSuccess ? 'Saved!' : 'Save Changes'}
</button>
                    </div>

                    {/* --- SECTIONS CONTENT --- */}
                    <div className="flex-1">
                        
                        {/* 1. IDENTITY & BASICS */}
                        {activeSection === 'basics' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                
                                {/* Archetype Selector (Game vs App) */}
                                <div className="grid grid-cols-2 gap-4 bg-[#0b0f19] p-1 rounded-xl border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => toggleType('Game')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                            !isApp ? 'bg-ruby text-white shadow-lg' : 'text-slate-500 hover:text-white'
                                        }`}
                                    >
                                        <Gamepad2 size={16} /> Game
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleType('App')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                            isApp ? 'bg-netrunner text-white shadow-lg' : 'text-slate-500 hover:text-white'
                                        }`}
                                    >
                                        <AppWindow size={16} /> App / Tool
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Project Title" value={formData.title} onChange={v => updateField('title', v)} placeholder="e.g. Cyber Runner 2077" required theme={themeFocus} />
                                    {/* Developer Info - Auto-populated */}
                                    <div>
                                        <label className="text-xs p-1 font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                            <User size={14} /> Developer / Studio
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={user?.developerName || formData.developer || ""}
                                                disabled
                                                className="flex-1 bg-slate-600/50 border border-white/5 rounded-xl px-4 py-3 text-slate-300 cursor-not-allowed"
                                            />
                                            {user?.needsDevNameSetup && (
                                                <Link
                                                    href="/settings"
                                                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Set Name
                                                </Link>
                                            )}
                                        </div>
                                        {user?.needsDevNameSetup && (
                                            <p className="text-xs text-amber-400 mt-1">
                                                Using fallback: {user?.profile?.display_name || user?.profile?.username}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                            <Scale size={14} /> License
                                        </label>
                                        <select
                                            value={formData.license}
                                            onChange={(e) => updateField('license', e.target.value)}
                                            className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white ${themeFocus} outline-none cursor-pointer`}
                                        >
                                            {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Build Version" value={formData.version} onChange={v => updateField('version', v)} placeholder="1.0.0" theme={themeFocus} />
                                </div>

                                {/* Project Status Dropdown */}
<div className="space-y-2">
  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
    <AlertTriangle size={14} /> Project Status
  </label>
  <select
    value={projectStatus}
    onChange={(e) => {
      const newStatus = e.target.value;
      setProjectStatus(newStatus);
      
      // Auto-inject status tag
      const updatedTags = injectStatusTag(formData.tags, newStatus);
      handleChange(() => setFormData(prev => ({ ...prev, tags: updatedTags })));
    }}
    className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white ${themeFocus} outline-none appearance-none cursor-pointer`}
  >
    {PROJECT_STATUSES.map(status => (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    ))}
  </select>
  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
    <Lightbulb size={12} className="text-amber-500" />
    {PROJECT_STATUSES.find(s => s.value === projectStatus)?.description || 'Set development stage'}
  </p>
</div>

                                <Input area label="Short Summary (Card)" value={formData.description} onChange={v => updateField('description', v)} placeholder="Brief hook (1-2 sentences)..." theme={themeFocus} h="h-24" />
                                <Input area label="Full Description (Markdown)" value={formData.full_description} onChange={v => updateField('full_description', v)} placeholder="Deep dive, story, instructions..." theme={themeFocus} h="h-40" />

                                {/* Tagging System */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">
                                        {isApp ? 'App' : 'Game'} Classification
                                    </label>
                                    <div className="flex flex-wrap gap-2 bg-[#0b0f19] p-3 rounded-xl border border-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                                        {getVisibleTags().map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${
                                                    formData.tags.includes(tag)
                                                    ? `${themeBg} text-white border-transparent shadow-md`
                                                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <ListEditor 
                                        label="Custom Tags" 
                                        items={formData.tags.filter(t => !getVisibleTags().includes(t))} 
                                        onRemove={(i) => {
                                            const val = formData.tags.filter(t => !getVisibleTags().includes(t))[i];
                                            toggleTag(val);
                                        }} 
                                        inputValue={inputs.tag} 
                                        onInputChange={(v) => setInputs({...inputs, tag: v})}
                                        onAdd={() => handleArrayAdd('tags', 'tag')}
                                        placeholder="Type custom tag & Enter..."
                                        theme={themeFocus}
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="pt-4 border-t border-white/5">
                                    <Input label="Social Links" isSocialEditor 
                                        socialLinks={formData.social_links}
                                        inputs={inputs}
                                        setInputs={setInputs}
                                        onAdd={handleAddSocial}
                                        onRemove={(i) => handleArrayRemove('social_links', i)}
                                        theme={themeFocus}
                                    />
                                </div>
                            </div>
                        )}

{/* SECTION: MEDIA */}
{activeSection === 'media' && (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
        
        {/* ✅ GLOBAL UPLOAD PROGRESS INDICATOR */}
        {uploading && (
            <div className="fixed top-24 right-6 z-50 bg-[#161b2c] border-2 border-emerald-500 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <div>
                        <p className="text-white font-bold text-sm uppercase tracking-wider">Uploading Media...</p>
                        <p className="text-slate-400 text-xs">Processing your file</p>
                    </div>
                </div>
            </div>
        )}

        {/* Compact Cover Upload */}
        <div className="flex gap-6 items-start p-4 bg-[#0b0f19] border border-white/5 rounded-xl">
            {/* THUMBNAIL: Matches GameCard ratio (2:3) */}
            <div className={`relative group w-32 aspect-3/4.5 bg-black rounded-lg overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center hover:${themeBorder} transition-colors shrink-0 shadow-lg`}>
                {formData.cover_url ? (
                    <img src={formData.cover_url} className="w-full h-full object-contain" />
                ) : (
                    <div className="text-center p-2">
                        <Upload className="mx-auto mb-1 text-slate-500 w-6 h-6" />
                        <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest">2:3</span>
                    </div>
                )}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'cover')} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    disabled={uploading} 
                />
                {/* ✅ LOCAL OVERLAY (Optional - shows on cover only when uploading cover) */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-3">
                <div>
                    <label className="text-xs font-bold uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                        <ImageIcon size={14} className={themeText} /> Project Icon
                    </label>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                        The face of your project. Used in cards and search.
                        <br/>
                        <span className="text-slate-500">Recommended: <strong>600x900px</strong> (Portrait).</span>
                    </p>
                </div>
                <div className="pt-2">
                    <Input value={formData.cover_url} onChange={v => updateField('cover_url', v)} placeholder="Or paste URL..." theme={themeFocus} />
                </div>
            </div>
        </div>
        
        {/* Screenshots Section */}
        <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex justify-between items-end">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Screenshots Gallery</label>
                <span className="text-[10px] text-slate-600 font-mono">1920x1080px (16:9)</span>
            </div>
                            
            <div className="grid grid-cols-2 gap-3">
                {formData.screenshots.map((url, i) => (
                    <div key={i} className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10 group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => handleChange(() => setFormData(p => ({...p, screenshots: p.screenshots.filter((_, idx) => idx !== i)})))} 
                            className="absolute top-1 right-1 bg-red-500/80 p-1.5 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X size={12}/>
                        </button>
                    </div>
                ))}
                
                {/* ✅ UPLOAD BUTTON - Now shows loading state */}
                <div className={`aspect-video bg-[#0b0f19] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center hover:${themeBorder} transition-colors relative cursor-pointer group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                    {uploading ? (
                        <>
                            <Loader2 className="text-emerald-500 animate-spin mb-1" size={24} />
                            <span className="text-[10px] text-emerald-500 font-bold tracking-widest">PROCESSING...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="text-slate-600 group-hover:text-white transition-colors mb-1" />
                            <span className="text-[10px] text-slate-600 font-bold tracking-widest group-hover:text-slate-400">ADD IMAGE</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'screenshot')} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        disabled={uploading} 
                    />
                </div>
            </div>
        </div>

        <Input label="Trailer / Video URL" value={formData.video_url} onChange={v => updateField('video_url', v)} placeholder="https://youtube.com/..." icon={Youtube} theme={themeFocus} />
    </div>
)}

                        {/* 3. TECH SPECS */}
                        {activeSection === 'tech' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
      <Scale size={14} /> Install Size
    </label>
    <input
      type="text"
      value={formData.size}
      onChange={(e) => {
        const val = e.target.value.toUpperCase();

        // Allow digits, space, and valid letters for units only
        if (/^[0-9\sKMGTPB]*$/i.test(val) || val === '') {
          updateField('size', val);
        }
      }}
      onBlur={() => {
        // Extract number and valid unit
        const match = formData.size.trim().match(/^(\d+)\s*([KMGT]?B)?$/i);
        if (match) {
          const number = match[1];
          let unit = match[2]?.toUpperCase() || 'GB';

          // Restrict unit to only allowed ones
          const allowedUnits = ['KB', 'MB', 'GB', 'TB', 'PB'];
          if (!allowedUnits.includes(unit)) unit = 'GB';

          updateField('size', `${number} ${unit}`);
        }
      }}
      placeholder="e.g. 3 GB"
      className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs ${themeFocus}`}
    />
    <p className="text-xs text-slate-400">
      Example: <strong>3 GB</strong>. Only numbers and units KB, MB, GB, TB, PB allowed.
    </p>
  </div>
</div>


                                <ListEditor label="Key Features" placeholder="e.g. Dynamic Lighting" theme={themeFocus} {...listHandler('features', 'feature')} />
                                <ListEditor label="System Requirements" placeholder="e.g. OS: Windows 10" theme={themeFocus} {...listHandler('requirements', 'req')} />
                                
                                {isApp ? (
                                    <ListEditor label="How It Works (Steps)" placeholder="e.g. Install App" theme={themeFocus} {...listHandler('how_it_works', 'howTo')} />
                                ) : (
                                    <ListEditor label="Controls" placeholder="e.g. WASD to move" theme={themeFocus} {...listHandler('controls', 'control')} />
                                )}
                            </div>
                        )}

                        {/* 4. SAFETY */}
                        {activeSection === 'safety' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                                    <p className="text-xs text-amber-200">Disclose mature themes to help users make informed decisions.</p>
                                </div>
                                <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">
                                    Age Rating
                                </label>
                                <select
                                    value={formData.age_rating || 'NR'}
                                    onChange={e => updateField('age_rating', e.target.value)}
                                    className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white ${themeFocus} outline-none`}
                                >
                                    <option value="All Ages">All Ages</option>
                                    <option value="Teen (12+)">Teen (12+)</option>
                                    <option value="Mature (16+)">Mature (16+)</option>
                                    <option value="Adults Only (18+)">Adults Only (18+)</option>
                                </select>
                                </div>

                                <Input area label="Content Warnings" value={formData.content_warning} onChange={v => updateField('content_warning', v)} placeholder="Bullet points: Violence, Flashing Lights, etc..." theme={themeFocus} />
                            </div>
                        )}

                        {/* 5. DISTRIBUTION */}
                        {activeSection === 'distribution' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className={`p-4 ${themeBgLight} ${themeBorderLight} border rounded-xl mb-4 flex items-start gap-3`}>
                                    <ShieldCheck className={themeText} size={20} />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Ensure download links are accessible. You can add multiple platforms.
                                    </p>
                                </div>

                                {/* Download Links */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Download Sources</label>
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <select value={inputs.dlPlatform} onChange={e => setInputs(p => ({...p, dlPlatform: e.target.value}))} className={`bg-[#0b0f19] text-white text-xs border border-white/10 rounded-xl px-3 py-3 outline-none md:w-28 ${themeFocus}`}>
                                            {PLATFORM_OPTIONS.map(p => <option key={p.id}>{p.id}</option>)}
                                        </select>
                                        <input type="url" value={inputs.dlUrl} onChange={e => setInputs(p => ({...p, dlUrl: e.target.value}))} className={`flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono ${themeFocus} focus:outline-none`} placeholder="Download Link URL..." />
                                        <button type="button" onClick={handleAddDownload} className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-white transition-colors flex items-center justify-center"><Plus size={18} /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.download_links.map((link, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#0b0f19] rounded-lg border border-white/5 text-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className={`font-bold uppercase text-[10px] ${themeBgLight} ${themeText} px-2 py-0.5 rounded shrink-0`}>{link.platform}</span>
                                                    <span className="text-slate-400 truncate font-mono text-xs">{link.url}</span>
                                                </div>
                                                <button type="button" onClick={() => handleArrayRemove('download_links', i)}><X size={14} className="text-slate-600 hover:text-red-400"/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* HTML5 Embed */}
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                                        <Globe className="text-blue-400 shrink-0" size={18} />
                                        <p className="text-xs text-blue-300 leading-relaxed">
                                            <strong>Web Game Mode:</strong> Provide a direct URL to your HTML5/WebGL build (e.g. index.html) to enable in-browser play.
                                        </p>
                                    </div>
                                    <Input label="HTML5 Embed URL" value={formData.html5_embed_url} onChange={v => updateField('html5_embed_url', v)} placeholder="https://..." icon={Play} theme={themeFocus} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation Buttons */}
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                        <button type="button" onClick={handlePrevSection} disabled={activeSection === SECTIONS[0].id} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-30 flex items-center gap-2 transition-colors">
                            <ArrowLeft size={14} /> Previous
                        </button>
                        
                        {/* Mobile Save Button */}
                        <button type="submit" disabled={loading} className={`md:hidden ${themeBg} text-white p-3 rounded-full shadow-lg`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        </button>

                        <button type="button" onClick={handleNextSection} disabled={activeSection === SECTIONS[SECTIONS.length - 1].id} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-30 flex items-center gap-2 transition-colors">
                            Next <ArrowRight size={14} />
                        </button>
                    </div>
                </form>
            </div>

{/* --- RIGHT: LIVE PREVIEW --- */}
<div className="hidden lg:block">
    <div className="sticky top-32 space-y-6">
        <p className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2"><Layers size={14}/> Asset Preview</p>
        
{/* Preview Card */}
<div className="bg-[#161b2c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
    
    {/* ASPECT RATIO: 3:4.5 using explicit calculation */}
    <div className="relative w-full bg-black overflow-hidden" style={{ aspectRatio: '3 / 4.5' }}>
        <img 
            src={formData.cover_url || PLACEHOLDER_COVER} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => e.target.src = PLACEHOLDER_COVER}
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-[#161b2c] via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 p-6 w-full z-10">
            <div className="flex gap-2 mb-3">
                <span className={`px-2 py-1 ${themeBgLight} ${themeText} ${themeBorderLight} border rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1`}>
                    {formData.type}
                </span>
                {formData.tags[0] && (
                    <span className="px-2 py-1 bg-white/10 text-slate-300 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {formData.tags[0]}
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-black text-white uppercase leading-none mb-2 line-clamp-2">
                {formData.title || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">
                <User size={12}/> {formData.developer || currentUsername || "You"}
            </div>
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {formData.description || "Project summary will appear here..."}
            </p>
        </div>
    </div>
</div>
                    
                    {/* Status Stats */}
                    <div className="p-4 bg-[#0b0f19] border border-white/5 rounded-xl text-xs text-slate-500 font-mono space-y-1">
                        <div className="flex justify-between">
                            <span>STATUS</span>
                            <span className="text-amber-500">{project?.status?.toUpperCase() || 'DRAFT'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VERSION</span>
                            <span>{formData.version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>LINKS</span>
                            <span>{formData.download_links.length}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
                          {/* SESSION ERROR OVERLAY */}
      {showSessionError && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#161b2c] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Link Severed</h3>
                <p className="text-slate-400 mb-8 text-sm">Your security token has expired. Re-initialization required.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                    <RefreshCw size={18} /> Reconnect
                </button>
            </div>
        </div>
      )}

            {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161b2c] border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <div className="flex justify-center mb-4">
                    <AlertTriangle size={48} className="text-amber-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Unsaved Changes</h3>
                <p className="text-slate-400 text-sm text-center mb-6">
                    You have modifications that haven't been saved. Leaving now will discard them.
                </p>
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowUnsavedModal(false)}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold uppercase text-xs tracking-wider transition-colors"
                    >
                        Stay
                    </button>
                    <button 
                        type="button"
                        onClick={confirmDiscard}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold uppercase text-xs tracking-wider transition-colors shadow-lg"
                    >
                        Discard
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// --- REUSABLE SUB-COMPONENTS ---

function Input({ label, value, onChange, placeholder, required, icon: Icon, theme, area, h, isSocialEditor, socialLinks, inputs, setInputs, onAdd, onRemove }) {
    if (isSocialEditor) {
        return (
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    {Icon && <Icon size={14}/>} {label}
                </label>
                <div className="flex gap-2">
                    <select 
                        value={inputs.socialLabel} 
                        onChange={e => setInputs({...inputs, socialLabel: e.target.value})}
                        className={`bg-[#0b0f19] text-white text-xs border border-white/10 rounded-xl px-3 outline-none focus:${theme}`}
                    >
                        <option>Website</option><option>Discord</option><option>X(Twitter)</option><option>YouTube</option><option>Patreon</option>
                    </select>
                    <input 
                        type="url" 
                        value={inputs.socialUrl} 
                        onChange={e => setInputs({...inputs, socialUrl: e.target.value})}
                        className={`flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:${theme} focus:outline-none`}
                        placeholder="Link URL...https://"
                    />
                    <button type="button" onClick={onAdd} className="bg-white/10 hover:bg-white/20 px-4 rounded-xl text-white transition-colors">
                        <Plus size={18} />
                    </button>
                </div>
                <div className="space-y-2">
                    {socialLinks.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#0b0f19] rounded-lg border border-white/5 text-sm">
                            <span className="text-slate-400 font-bold w-24">{s.label}:</span>
                            <span className={`text-emerald-500 truncate flex-1 font-mono text-xs`}>{s.url}</span>
                            <button type="button" onClick={() => onRemove(i)}><X size={14} className="text-slate-600 hover:text-red-400"/></button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                {Icon && <Icon size={14}/>} {label}
            </label>
            {area ? (
                <textarea required={required} value={value} onChange={e => onChange(e.target.value)} className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white ${theme} outline-none transition-all placeholder:text-slate-700 text-sm leading-relaxed resize-none ${h || 'h-24'}`} placeholder={placeholder} />
            ) : (
                <input required={required} type="text" value={value} onChange={e => onChange(e.target.value)} className={`w-full bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white ${theme} outline-none transition-all placeholder:text-slate-700`} placeholder={placeholder} />
            )}
        </div>
    );
}

function ListEditor({ label, items, onRemove, inputValue, onInputChange, onAdd, placeholder, theme }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">{label}</label>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={e => onInputChange(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
                    className={`flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-3 text-white focus:${theme} focus:outline-none placeholder:text-slate-700`}
                    placeholder={placeholder} 
                />
                <button type="button" onClick={onAdd} className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 rounded-xl text-white transition-colors">
                    <Plus size={18}/>
                </button>
            </div>

            {items.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {items.map((item, i) => (
                        <span key={i} className="bg-[#0b0f19] text-slate-300 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-in zoom-in duration-200">
                            {item}
                            <button type="button" onClick={() => onRemove(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                                <X size={12}/>
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}