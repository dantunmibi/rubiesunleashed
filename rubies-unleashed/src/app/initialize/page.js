"use client";

/* 
  💎 RUBIES UNLEASHED - Initialization Protocol
  ---------------------------------------------
  - Mandatory onboarding step.
  - User selects their Archetype Class.
  - Updates Supabase Profile & Redirects.
*/

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Diamond, Cpu, Crown, Ghost, Check, Loader2 } from "lucide-react";

// ✅ ARCHETYPES Config
const ARCHETYPES = [
  {
    id: 'hunter',
    colorKey: 'ruby', // ✅ Maps 'hunter' to '--color-ruby'
    name: 'The Hunter',
    icon: Diamond,
    desc: 'Acquire & Execute. Priority access to games.',
    quote: 'For those who play to win.'
  },
  {
    id: 'netrunner',
    colorKey: 'netrunner',
    name: 'The Netrunner',
    icon: Cpu,
    desc: 'Optimize & Hack. Focused on tools and utilities.',
    quote: 'Efficiency is the only metric.'
  },
  {
    id: 'curator',
    colorKey: 'curator',
    name: 'The Curator',
    icon: Crown,
    desc: 'Index & Preserve. Building the archives.',
    quote: 'History must be saved.'
  },
  {
    id: 'phantom',
    colorKey: 'phantom',
    name: 'The Phantom',
    icon: Ghost,
    desc: 'Observe & Vanish. Privacy and the underground. Your profile is private by default.', 
    quote: 'Leave no trace.'
  }
];

export default function InitializePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

const handleConfirm = async () => {
  if (!selected || !user) return;
  setLoading(true);

  try {
    // 1. Update archetype
    const { error } = await supabase.rpc('update_archetype', { 
      new_archetype: selected 
    });

    if (error) throw error;

    // 2. Trigger welcome email
    try {
      const emailResponse = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (emailResponse.ok) {
        console.log('✅ Welcome email sent successfully');
      } else {
        console.error('⚠️ Welcome email failed, but continuing...');
      }
    } catch (emailError) {
      console.error('❌ Email trigger error:', emailError);
    }

    // ✅ 3. Get username and redirect to profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile?.username) {
      window.location.href = `/${profile.username}`;
    } else {
      window.location.href = '/';
    }
    
  } catch (err) {
    console.error("Initialization Failed:", err.message);
    setLoading(false);
  }
};

  // Helper to get selected color key
  const selectedColorKey = ARCHETYPES.find(a => a.id === selected)?.colorKey;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="z-10 w-full max-w-6xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Initialize Protocol
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your identity defines your experience. Choose your operational directive.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ARCHETYPES.map((arch) => {
            const isSelected = selected === arch.id;
            
            return (
              <button
                key={arch.id}
                onClick={() => setSelected(arch.id)}
                // Apply data-theme to the button to activate its specific variables
                data-theme={arch.id} 
                className={`
                  relative group p-6 rounded-2xl border-2 text-left transition-all duration-300
                  ${isSelected 
                    ? `border-(--user-accent) bg-[#161b2c] scale-105 shadow-[0_0_30px_var(--user-accent-glow)] z-10` 
                    : `border-white/10 bg-surface/50 hover:border-(--user-accent) hover:bg-(--user-accent)/10`
                  }
                `}
              >
                {/* Icon uses dynamic accent color */}
                <div className={`mb-4 text-(--user-accent)`}>
                  <arch.icon size={32} />
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                  {arch.name}
                </h3>
                
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                  {arch.desc}
                </p>
                
                <p className="text-slate-500 text-sm italic font-serif">
                  "{arch.quote}"
                </p>

                {/* Selection Ring */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? `border-(--user-accent) text-(--user-accent)` : 'border-white/10'}`}>
                  {isSelected && <div className={`w-3 h-3 rounded-full bg-current`} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Action */}
        <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            // ✅ Dynamic theme for the Confirm button using mapped colorKey
            style={{ 
                '--btn-bg': selectedColorKey ? `var(--color-${selectedColorKey})` : '#334155',
                '--btn-shadow': selectedColorKey ? `var(--color-${selectedColorKey}-glow)` : 'transparent'
            }}
            className={`
              px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 text-white
              ${selected 
                ? "bg-(--btn-bg) hover:scale-105 shadow-[0_0_20px_var(--btn-shadow)] cursor-pointer" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Check />}
            Confirm Identity
          </button>
        </div>

        <div>
          <p className="flex justify-center animate-in fade-in duration-1000 delay-500 text-white p-5">
            You can change your directive at any time.
          </p>
        </div>

      </div>
    </div>
  );
}