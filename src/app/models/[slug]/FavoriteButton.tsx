"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FavoriteButtonProps = {
  assetId: string;
};

export default function FavoriteButton({
  assetId,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadFavorite() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("asset_id", assetId)
        .maybeSingle();

      if (error) {
        console.error("Error loading favorite:", error);
      }

      setIsFavorite(!!data);
      setLoading(false);
    }

    loadFavorite();
  }, [assetId]);

  async function toggleFavorite() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sign in to add favorites.");
      return;
    }

    setSaving(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("asset_id", assetId);

        if (error) {
          throw error;
        }

        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            asset_id: assetId,
          });

        if (error) {
          throw error;
        }

        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Favorite error:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Unable to update favorite.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading || saving}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all ${
          isFavorite
            ? "border-white bg-white text-black"
            : "border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/[0.05]"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="text-lg leading-none">
          {isFavorite ? "♥" : "♡"}
        </span>

        {saving
          ? "Saving..."
          : isFavorite
          ? "Added to Favorites"
          : "Add to Favorites"}
      </button>

      {message && (
        <p className="mt-2 text-center text-sm text-zinc-500">
          {message}
        </p>
      )}
    </div>
  );
}