"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export function useMigration() {
  const { user } = useAuth();

  useEffect(() => {
    async function migrateWishlist() {
      if (!user) return;

      // ✅ 1. Check for local guest DATA (not just wishlist)
      const localData = localStorage.getItem("ruby_user_data");
      if (!localData) return;

      try {
        const guestData = JSON.parse(localData);
        // ✅ 2. Extract wishlist from the user data structure
        const guestWishlist = guestData.wishlist || [];

        if (!Array.isArray(guestWishlist) || guestWishlist.length === 0) {
            // No wishlist items? Just clear the user data to prevent re-checks
            // Or maybe keep preferences? For now, let's assume clear.
            // localStorage.removeItem("ruby_user_data");
            return;
        }

        console.log("🔄 Migrating Guest Wishlist...", guestWishlist.length);

        // 3. Format for Database
        const rows = guestWishlist.map(item => {
            // Handle Object vs ID
            const gameId = typeof item === 'string' ? item : item.id;
            const addedAt = item.addedAt ? new Date(item.addedAt).toISOString() : new Date().toISOString();
            
            return {
                user_id: user.id,
                game_id: String(gameId),
                added_at: addedAt
            };
        }).filter(row => row.game_id && row.game_id !== "undefined");

        if (rows.length === 0) return;

        // 4. Upsert to Supabase
        const { error } = await supabase
          .from('wishlists')
          .upsert(rows, { onConflict: 'user_id, game_id', ignoreDuplicates: true });

        if (error) throw error;

        // 5. Clear Local Storage on Success
        localStorage.removeItem("ruby_user_data");
        // Also clear legacy key if it exists
        localStorage.removeItem("ruby_wishlist");
        
        console.log("✅ Migration Complete.");
        
        // Notify app to refresh
        window.dispatchEvent(new Event("wishlistUpdated"));

      } catch (err) {
        console.error("Migration Failed:", err);
      }
    }

    migrateWishlist();
  }, [user]);
}