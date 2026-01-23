"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { User, Calendar, Edit, Shield, Diamond, Loader2, Cpu, Crown, Ghost, LayoutDashboard, Heart, Share2, AlertTriangle, RefreshCw, ChevronRight, Box } from "lucide-react";
import Link from "next/link";
import GameGrid from "@/components/explore/GameGrid"; 
import { fetchGameById } from "@/lib/blogger";

const ArchetypeIcon = ({ type, size = 20 }) => {
    switch (type) {
        case 'hunter': return <Diamond size={size} />;
        case 'netrunner': return <Cpu size={size} />;
        case 'curator': return <Crown size={size} />;
        case 'phantom': return <Ghost size={size} />;
        case 'architect': return <LayoutDashboard size={size} />;
        default: return <User size={size} />;
    }
};

export default function ProfileClient() {
  const { user, initialized } = useAuth();
  const params = useParams();
  const targetUsername = decodeURIComponent(params.username);
  
  const [profile, setProfile] = useState(null);
  const [wishlistPreview, setWishlistPreview] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [projectsPreview, setProjectsPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [timeout, setTimeoutState] = useState(false);

  // Load Profile Logic
  useEffect(() => {
    if (!targetUsername) return;
    if (!initialized) return;

    let isMounted = true;
    setLoading(true);
    setError(false);
    setTimeoutState(false);

    const safetyTimer = setTimeout(() => {
        if (isMounted && loading) {
            setTimeoutState(true);
            setLoading(false); 
        }
    }, 10000);

    async function loadProfile() {
      try {
        // 1. Fetch Profile
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', targetUsername)
            .single();
        
        if (error) {
            if (error.code !== 'PGRST116') {
                console.warn("Profile Load Error:", error.message);
            }
            if (isMounted) setError(true);
            return;
        }
        
        if (data && isMounted) {
            setProfile(data);
            
            // 2. Fetch Wishlist (Only if public or owner)
            if (data.is_public_wishlist !== false || (user && user.id === data.id)) {
                setWishlistLoading(true);
                
                // Get total count
                const { count } = await supabase
                    .from('wishlists')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', data.id);
                
                const finalCount = count || 0;
                setWishlistCount(finalCount);
                console.log('📊 Wishlist count:', finalCount);

// Get preview (6 items)
                if (finalCount > 0) {
                    const { data: wishData } = await supabase
                        .from('wishlists')
                        .select('game_id')
                        .eq('user_id', data.id)
                        .order('added_at', { ascending: false })
                        .limit(6);
                    
                    if (wishData && wishData.length > 0) {
                        console.log('📋 Fetching wishlist preview:', wishData.length, 'items');
                        
                        const games = await Promise.all(
                            wishData.map(async (item) => {
                                try {
                                    // First try to fetch from Supabase projects
                                    const { data: project, error: projectError } = await supabase
                                        .from('projects')
                                        .select('*')
                                        .eq('id', item.game_id)
                                        .eq('status', 'published')
                                        .single();
                                    
                                    if (project && !projectError) {
                                        console.log('✅ Project loaded from Supabase:', project.title);
                                        return {
                                            id: project.id,
                                            title: project.title,
                                            slug: project.slug,
                                            description: project.description,
                                            image: project.cover_url,
                                            type: project.type || 'Game',
                                            tags: project.tags || [],
                                            developer: project.developer,
                                            version: project.version
                                        };
                                    }
                                    
                                    // If not found in projects, try Blogger API
                                    const game = await fetchGameById(item.game_id);
                                    if (game) {
                                        console.log('✅ Game loaded from Blogger:', game.title);
                                        return game;
                                    }
                                    
                                    console.warn('❌ Item not found:', item.game_id);
                                    return null;
                                } catch (err) {
                                    console.error('Error fetching item:', item.game_id, err);
                                    return null;
                                }
                            })
                        );
                        
                        const validGames = games.filter(Boolean);
                        console.log('✅ Valid items loaded:', validGames.length);
                        
                        if (isMounted) {
                            setWishlistPreview(validGames);
                        }
                    }
                }
                
                setWishlistLoading(false);
            }

            // 3. Fetch Published Projects (Architects Only)
            if (data.role === 'architect') {
                // Get count
                const { count: projectCount } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', data.id)
                    .eq('status', 'published');
                
                const finalProjectCount = projectCount || 0;
                console.log('📊 Published projects count:', finalProjectCount);
                setPublishedCount(finalProjectCount);
                
                // Get preview (3 recent projects)
                if (finalProjectCount > 0) {
                    const { data: projectsData } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('user_id', data.id)
                        .eq('status', 'published')
                        .order('created_at', { ascending: false })
                        .limit(5);
                    
                    if (projectsData && projectsData.length > 0) {
                        const processedProjects = projectsData.map(p => ({
                            id: p.id,
                            title: p.title,
                            slug: p.slug,
                            description: p.description,
                            image: p.cover_url,
                            type: p.type || 'Game',
                            tags: p.tags || [],
                            developer: p.developer,
                            version: p.version
                        }));
                        console.log('✅ Projects preview loaded:', processedProjects.length);
                        if (isMounted) {
                            setProjectsPreview(processedProjects);
                        }
                    }
                }
            }
        }
      } catch (err) {
        console.error("Profile Unexpected Error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) {
            setLoading(false);
            clearTimeout(safetyTimer);
        }
      }
    }

    loadProfile();

    return () => { 
        isMounted = false; 
        clearTimeout(safetyTimer);
    };
  }, [targetUsername, initialized, user?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${profile?.username}'s Profile - Rubies Unleashed`;

    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (e) {}
  };

  // ✅ 1. INITIALIZING STATE
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-slate-600" size={48} />
        <p className="text-slate-500 text-sm tracking-widest uppercase animate-pulse">Establishing Link...</p>
      </div>
    );
  }

  // ✅ 2. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-ruby" size={48} />
        <p className="text-slate-500 text-sm tracking-widest uppercase animate-pulse">Decrypting Identity...</p>
      </div>
    );
  }

  // ✅ 3. TIMEOUT STATE
  if (timeout) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-6 text-center px-4">
            <AlertTriangle className="text-amber-500" size={48} />
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Connection Interrupted</h2>
                <p className="text-slate-400 text-sm">The network is unresponsive.</p>
            </div>
            <button 
                onClick={() => window.location.reload()} 
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold uppercase text-xs tracking-widest transition-all"
            >
                <RefreshCw size={16} /> Retry Connection
            </button>
        </div>
      );
  }

  // ✅ 4. ERROR / 404 STATE
  if (error || !profile) {
      return (
        <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-500 gap-4">
            <Ghost size={48} className="text-slate-700" />
            <div className="text-center">
                <h1 className="text-xl font-bold text-slate-400">User Not Found</h1>
                <p className="text-sm text-slate-600 mt-1">The requested identity could not be resolved.</p>
            </div>
            <Link href="/" className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
                Return to Base
            </Link>
        </div>
      );
  }

  const isOwner = user && user.id === profile.id;

  if (profile.profile_visibility === 'private' && !isOwner) {
      return (
        <div className="min-h-screen bg-background pt-24 text-slate-200 font-sans selection:bg-(--user-accent)/30 flex flex-col">
          <BackgroundEffects />
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="bg-[#161b2c] border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-2xl">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                    <Shield size={40} className="text-slate-500" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Private Profile</h1>
                <p className="text-slate-400">@{profile.username} has restricted access to their profile.</p>
             </div>
          </main>
          <Footer />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-(--user-accent)/30">
      <BackgroundEffects />
      <Navbar />

      <main className="pb-20">
        
        {/* --- HERO HEADER --- */}
        <section className="relative pt-32 pb-8 px-6 border-b border-white/5 bg-[#0f131f] overflow-hidden">
           <div className="absolute inset-0 z-0">
              {profile.cover_url ? (
                <>
                    <img 
                        src={profile.cover_url} 
                        className="w-full h-full object-cover object-center opacity-80"
                        alt="Cover" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0f131f] via-[#0f131f]/80 via-40% to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-(--user-accent)/5" />
              )}
           </div>
           
           <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10">
              <div className="relative group shrink-0">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-tr from-(--user-accent) to-slate-600 p-1 shadow-2xl overflow-hidden">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full bg-[#0b0f19]" alt={profile.username} />
                    ) : (
                        <div className="w-full h-full rounded-full bg-[#0b0f19] flex items-center justify-center text-white">
                            <User size={48} />
                        </div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-(--user-accent) rounded-xl flex items-center justify-center border-4 border-[#0b0f19] shadow-lg">
                   <ArchetypeIcon type={profile.archetype} size={18} />
                 </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-1 pb-2">
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                        {profile.display_name || profile.username}
                    </h1>
                    {profile.role === 'architect' && (
                      <a href={`/${profile.username}/projects` || "#"}>
                        <span className="px-3 py-1 bg-linear-to-r from-emerald-500/20 to-emerald-400/20 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                            <LayoutDashboard size={12} /> Developer
                        </span>
                      </a>
                    )}
                    {isOwner && (
                        <Link href="/settings" className="p-2 text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-white/30">
                            <Edit size={16} />
                        </Link>
                    )}
                </div>

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <span className="flex items-center gap-2 bg-(--user-accent)/10 text-(--user-accent) border border-(--user-accent)/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_var(--user-accent-glow)] backdrop-blur-md">
                       <ArchetypeIcon type={profile.archetype} size={14} />
                       {profile.archetype || "Member"}
                    </span>
                    
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <Calendar size={14} /> Joined {new Date(profile.created_at || Date.now()).getFullYear()}
                    </span>
                 </div>
              </div>

              <div className="flex gap-3 pb-2">
                 <button 
                    onClick={handleShare}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                 >
                    <Share2 size={16} /> {copied ? "Copied" : "Share"}
                 </button>
              </div>
           </div>
        </section>

        {/* --- BIO --- */}
        <section className="px-6 py-12 max-w-5xl mx-auto">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Bio</h3>
                <p className="text-slate-300 leading-relaxed text-lg font-light border-l-2 border-(--user-accent)/30 pl-6 italic">
                    "{profile.bio || "This user prefers to remain mysterious."}"
                    {isOwner && (
                        <Link href="/settings" className="float-right ml-4 text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-white/30 p-1">
                            <Edit size={16} />
                        </Link>
                    )}
                </p>
            </div>
        </section>

        {/* --- STATS GRID --- */}
        {(wishlistCount > 0 || profile.role === 'architect') && (
          <section className="px-6 pb-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {(profile.is_public_wishlist !== false || isOwner) && wishlistCount > 0 && (
                <div className="p-6 bg-[#161b2c] border border-white/5 rounded-2xl hover:border-red-500/30 transition-colors group">
                  <Heart className="text-red-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-2xl font-black text-white">{wishlistCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Saved Items</div>
                </div>
              )}

              {profile.role === 'architect' && (
                <div className="p-6 bg-[#161b2c] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                  <LayoutDashboard className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-2xl font-black text-white">{publishedCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Published</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- DEVELOPER SHOWCASE --- */}
        {profile.role === 'architect' && (
          <section className="px-6 pb-12 max-w-7xl mx-auto border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <LayoutDashboard size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Published Works</h2>
                  <p className="text-xs text-slate-500">
                    {publishedCount} {publishedCount === 1 ? 'project' : 'projects'} available
                  </p>
                </div>
              </div>
              {publishedCount > 0 && (
                <Link 
                  href={`/${profile.username}/projects`}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  View All
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
            
            {publishedCount === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
                <Box size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
                  No Published Projects Yet
                </p>
                <p className="text-slate-600 text-xs">
                  {isOwner 
                    ? "Projects you publish will appear here" 
                    : "This developer hasn't published any projects yet"}
                </p>
                {isOwner && (
                  <Link
                    href={`/${profile.username}/dashboard`}
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </Link>
                )}
              </div>
            ) : projectsPreview.length > 0 ? (
              <GameGrid games={projectsPreview} />
            ) : (
              <div className="text-center text-slate-500 py-8">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-xs">Loading projects...</p>
              </div>
            )}
          </section>
        )}

        {/* --- RECENT SAVES --- */}
        {wishlistCount > 0 && (profile.is_public_wishlist !== false || isOwner) && (
          <section className="px-6 pb-20 max-w-7xl mx-auto border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Heart size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Saves</h2>
                  <p className="text-xs text-slate-500">
                    {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} in collection
                  </p>
                </div>
              </div>
              <Link 
                href={`/${profile.username}/wishlist`} 
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>
            
            {wishlistPreview.length > 0 ? (
              <GameGrid games={wishlistPreview} />
            ) : wishlistLoading ? (
              <div className="text-center text-slate-500 py-8">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-xs">Loading saves...</p>
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                <Heart size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
                  Unable to Load Saves
                </p>
                <p className="text-slate-600 text-xs">
                  Some items in the wishlist couldn't be found
                </p>
              </div>
            )}
          </section>
        )}
        
        {/* --- PRIVATE WISHLIST NOTICE --- */}
        {profile.is_public_wishlist === false && !isOwner && (
          <section className="px-6 pb-20 max-w-7xl mx-auto border-t border-white/5 pt-12">
            <div className="border border-white/5 rounded-2xl p-12 text-center">
              <Shield size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
                Private Collection
              </p>
              <p className="text-slate-600 text-xs">
                {profile.username} has set their wishlist to private
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}