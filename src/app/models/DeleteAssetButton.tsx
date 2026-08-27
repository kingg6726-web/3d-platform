"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type DeleteAssetButtonProps = {
  assetId: string;
  assetFile: string | null;
  imageFile: string | null;
};

const ADMIN_USER_ID = "86c0ce00-4bd4-4305-9b4e-8a3837d362b4";

export default function DeleteAssetButton({
  assetId,
  assetFile,
  imageFile,
}: DeleteAssetButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
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

      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("user_id")
        .eq("id", assetId)
        .single();

      if (assetError) {
        throw assetError;
      }

      if (!asset) {
        throw new Error("Asset not found.");
      }

      const isOwner = asset.user_id === user.id;
      const isAdmin = user.id === ADMIN_USER_ID;

      if (!isOwner && !isAdmin) {
        throw new Error("You can only delete your own assets.");
      }

      const filesToDelete: string[] = [];

      if (assetFile) {
        filesToDelete.push(assetFile);
      }

      if (imageFile) {
        filesToDelete.push(imageFile);
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("assets")
          .remove(filesToDelete);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: databaseError } = await supabase
        .from("assets")
        .delete()
        .eq("id", assetId);

      if (databaseError) {
        throw databaseError;
      }

      router.push("/models");
      router.refresh();
    } catch (error) {
      console.error("DELETE ASSET ERROR:", error);

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
      {deleting ? "Deleting..." : "Delete asset"}
    </button>
  );
}