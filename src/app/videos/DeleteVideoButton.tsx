"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type DeleteVideoButtonProps = {
  videoId: string;
  videoPath: string;
  thumbnailPath: string | null;
  onDeleted: () => void;
};

const ADMIN_ID = "86c0ce00-4bd4-4305-9b4e-8a3837d362b4";

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

      const isOwner = video.user_id === user.id;
      const isAdmin = user.id === ADMIN_ID;

      if (!isOwner && !isAdmin) {
        throw new Error(
          "You do not have permission to delete this video."
        );
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

      let databaseQuery = supabase
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (!isAdmin) {
        databaseQuery = databaseQuery.eq("user_id", user.id);
      }

      const { error: databaseError } = await databaseQuery;

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