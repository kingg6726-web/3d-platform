"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DeleteVideoButton from "./DeleteVideoButton";

type ConditionalDeleteVideoButtonProps = {
  videoId: string;
  videoUserId: string;
  videoPath: string;
  thumbnailPath: string | null;
};

const ADMIN_ID = "86c0ce00-4bd4-4305-9b4e-8a3837d362b4";

export default function ConditionalDeleteVideoButton({
  videoId,
  videoUserId,
  videoPath,
  thumbnailPath,
}: ConditionalDeleteVideoButtonProps) {
  const [canDelete, setCanDelete] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCanDelete(false);
        setChecking(false);
        return;
      }

      const isOwner = user.id === videoUserId;
      const isAdmin = user.id === ADMIN_ID;

      setCanDelete(isOwner || isAdmin);
      setChecking(false);
    }

    checkPermission();
  }, [videoUserId]);

  if (checking || !canDelete) {
    return null;
  }

  return (
    <DeleteVideoButton
      videoId={videoId}
      videoPath={videoPath}
      thumbnailPath={thumbnailPath}
      onDeleted={() => {
        window.location.href = "/videos";
      }}
    />
  );
}