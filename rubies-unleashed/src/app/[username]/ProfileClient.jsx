"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import BackgroundEffects from "@/components/ui/BackgroundEffects";
import { User, Calendar, Edit, Shield, Diamond, Cpu, Crown, Ghost, LayoutDashboard, Heart, Share2, Image as ImageIcon } from "lucide-react";
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

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const targetUsername = decodeURIComponent(params.username);
  
  const [profile, setProfile] = useState(null);
  const [wishlistPreview, setWishlistPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load Profile Logic
  useEffect(() => {
    // 1. Reset State immediately when username changes to prevent stale data
    setProfile(null);
    setWishlistPreview([]);
    setLoading(true);

    async function loadProfile() {
      try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', targetUsername)
            .single();
        
        if (error) throw error;
        
        if (data) {
            setProfile(data);
            
            // Fetch Wishlist
            const { data: wishData } = await supabase
                .from('wishlists')
                .select('game_id')
                .eq('user_id', data.id)
                .order('added_at', { ascending: false })
                .limit(4);
                
            if (wishData) {
                const games = await Promise.all(wishData.map(item => fetchGameById(item.game_id)));
                setWishlistPreview(games.filter(Boolean));
            }
        }
      } catch (err) {
        console.warn("Profile Load Error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [targetUsername]); // Dependency ensures re-run

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${profile?.username}'s Profile - Rubies Unleashed`;

    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  if (loading) return <div className="min-h-screen bg-[#0b0f19]" />;
  if (!profile) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-500">User Not Found</div>;

  const isOwner = user && user.id === profile.id;

  // ✅ PRIVACY SHIELD
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
        
        {/* --- 1. HERO HEADER (Polished) --- */}
        <section className="relative pt-32 pb-8 px-6 border-b border-white/5 bg-[#0f131f] overflow-hidden">
           
           {/* Cover Image Background */}
           <div className="absolute inset-0 z-0">
              {profile.cover_url ? (
                <>
                    <img 
                        src={profile.cover_url} 
                        className="w-full h-full object-cover object-center opacity-80" // Higher opacity
                        alt="Cover" 
                    />
                    {/* Darker bottom gradient to ensure text readability against bright images */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#0f131f] via-[#0f131f]/80 via-40% to-transparent" />                </>
              ) : (
                <div className="w-full h-full bg-(--user-accent)/5" />
              )}
           </div>
           
           <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-8 relative z-10">
              
              {/* Avatar Ring */}
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
                 {/* Status Dot */}
                 <div className="absolute bottom-3 right-3 w-6 h-6 bg-[#0b0f19] rounded-full flex items-center justify-center z-20">
                    <div className="w-3 h-3 bg-(--user-accent) rounded-full animate-pulse" />
                 </div>
              </div>

              {/* Info Block */}
              <div className="flex-1 text-center md:text-left space-y-1 pb-2">
                 <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                       {profile.display_name || profile.username}
                    </h1>
                    {isOwner && (
                        <Link href="/settings" className="p-2 text-slate-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-white/30">
                            <Edit size={16} />
                        </Link>
                    )}
                 </div>
                 
                 {profile.display_name && (
                    <p className="text-sm font-bold text-slate-300 mb-3 opacity-80">@{profile.username}</p>
                 )}

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

              {/* Action Buttons */}
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

        {/* --- 2. BIO & STATS --- */}
        <section className="px-6 py-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Bio Column */}
            <div className="md:col-span-2 space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Bio</h3>
                <p className="text-slate-300 leading-relaxed text-lg font-light border-l-2 border-(--user-accent)/30 pl-6 italic">
                    "{profile.bio || "This user prefers to remain mysterious."}"
                </p>
            </div>

            {/* Stats Column */}
            <div className="space-y-4">
                <div className="p-6 bg-[#161b2c] border border-white/5 rounded-2xl flex items-center gap-4 shadow-lg">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                        <Heart size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">{wishlistPreview.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Saved Items</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- 3. RECENT SAVES --- */}
        {wishlistPreview.length > 0 && (profile.is_public_wishlist !== false || isOwner) && (
            <section className="px-6 pb-20 max-w-7xl mx-auto border-t border-white/5 pt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Heart size={20} className="text-red-500" /> Recent Saves
                    </h2>
                    <Link href={`/${profile.username}/wishlist`} className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1">
                        View Full Collection
                    </Link>
                </div>
                
                <GameGrid games={wishlistPreview} />
            </section>
        )}
        
        {profile.is_public_wishlist === false && !isOwner && (
             <div className="px-6 pb-20 max-w-7xl mx-auto border-t border-white/5 pt-12 text-center text-slate-500 italic">
                This user has set their wishlist to private.
             </div>
        )}

      </main>
      <Footer />
    </div>
  );
}