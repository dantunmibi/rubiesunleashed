"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export function useMigration() {
  const { user } = useAuth();

  useEffect(() => {
    async function migrateWishlist() {
      if (!user) return;

      // 1. Check for local guest wishlist
      const localData = localStorage.getItem("ruby_wishlist");
      if (!localData) return;

      try {
        const guestWishlist = JSON.parse(localData);
        if (!Array.isArray(guestWishlist) || guestWishlist.length === 0) return;

        console.log("🔄 Migrating Guest Wishlist to Cloud...", guestWishlist);

        // 2. Format for Database
        const rows = guestWishlist.map(gameId => ({
          user_id: user.id,
          game_id: gameId,
          added_at: new Date().toISOString()
        }));

        // 3. Upsert to Supabase (Ignore duplicates)
        const { error } = await supabase
          .from('wishlists')
          .upsert(rows, { onConflict: 'user_id, game_id', ignoreDuplicates: true });

        if (error) throw error;

        // 4. Clear Local Storage on Success
        localStorage.removeItem("ruby_wishlist");
        console.log("✅ Migration Complete. Local storage cleared.");
        
        // Optional: Trigger a UI refresh or Toast here

      } catch (err) {
        console.error("Migration Failed:", err);
      }
    }

    migrateWishlist();
  }, [user]);
}