"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DeleteAssetButtonProps = {
  assetId: string;
  assetFile: string | null;
  assetImage: string | null;
  ownerId: string;
};

const ADMIN_ID = "86c0ce00-4bd4-4305-9b4e-8a3837d362b4";

export default function DeleteAssetButton({
  assetId,
  assetFile,
  assetImage,
  ownerId,
}: DeleteAssetButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.alert("You must be signed in.");
      return;
    }

    const isOwner = user.id === ownerId;
    const isAdmin = user.id === ADMIN_ID;

    if (!isOwner && !isAdmin) {
      window.alert("You do not have permission to delete this asset.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const filesToDelete: string[] = [];

      if (assetFile) {
        filesToDelete.push(assetFile);
      }

      if (assetImage) {
        filesToDelete.push(assetImage);
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