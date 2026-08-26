"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteCardHeartProps = {
  assetId: string;
};

export default function FavoriteCardHeart({
  assetId,
}: FavoriteCardHeartProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("asset_id", assetId)
        .maybeSingle();

      if (error) {
        console.error("Error checking favorite:", error);
        return;
      }

      setIsFavorite(!!data);
    }

    checkFavorite();
  }, [assetId]);

  if (!isFavorite) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 shadow-lg backdrop-blur-sm"
      aria-label="Added to favorites"
    >
      <span className="text-2xl leading-none text-red-500">
        ♥
      </span>
    </div>
  );
}