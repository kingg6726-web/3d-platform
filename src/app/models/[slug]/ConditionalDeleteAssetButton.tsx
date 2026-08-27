"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DeleteAssetButton from "./DeleteAssetButton";

const ADMIN_USER_ID = "86c0ce00-4bd4-4305-9b4e-8a3837d362b4";

type ConditionalDeleteAssetButtonProps = {
  assetId: string;
  assetFile: string | null;
  assetImage: string | null;
  ownerId: string;
};

export default function ConditionalDeleteAssetButton({
  assetId,
  assetFile,
  assetImage,
  ownerId,
}: ConditionalDeleteAssetButtonProps) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCanDelete(false);
        return;
      }

      const allowed =
        user.id === ADMIN_USER_ID || user.id === ownerId;

      setCanDelete(allowed);
    }

    checkPermission();
  }, [ownerId]);

  if (!canDelete) {
    return null;
  }

  return (
    <DeleteAssetButton
      assetId={assetId}
      assetFile={assetFile}
      assetImage={assetImage}
      ownerId={ownerId}
    />
  );
}