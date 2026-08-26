"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type DeleteVideoButtonProps = {
  videoId: string;
  videoPath: string;
  thumbnailPath: string | null;
  onDeleted: () => void;
};

export default function DeleteVideoButton({
  videoId,
  videoPath,
  thumbnailPath,
  onDeleted,
}: DeleteVideoButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in.");
      }

      const { data: video, error: videoError } = await supabase
        .from("videos")
        .select("user_id")
        .eq("id", videoId)
        .single();

      if (videoError) {
        throw videoError;
      }

      if (!video) {
        throw new Error("Video not found.");
      }

      if (video.user_id !== user.id) {
        throw new Error("You can only delete your own videos.");
      }

      const filesToDelete = [videoPath];

      if (thumbnailPath) {
        filesToDelete.push(thumbnailPath);
      }

      const { error: storageError } = await supabase.storage
        .from("assets")
        .remove(filesToDelete);

      if (storageError) {
        throw storageError;
      }

      const { error: databaseError } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)
        .eq("user_id", user.id);

      if (databaseError) {
        throw databaseError;
      }

      onDeleted();
    } catch (error) {
      console.error("DELETE VIDEO ERROR:", error);

      if (error instanceof Error) {
        window.alert(`Delete failed: ${error.message}`);
      } else {
        window.alert("Delete failed.");
      }

      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="mt-3 w-full rounded-full border border-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete video"}
    </button>
  );
}