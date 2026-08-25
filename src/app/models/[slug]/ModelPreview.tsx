"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ModelPreviewProps = {
  imagePath: string | null;
  alt: string;
};

export default function ModelPreview({
  imagePath,
  alt,
}: ModelPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImage() {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.storage
        .from("assets")
        .createSignedUrl(imagePath, 60 * 60);

      if (error) {
        console.error("IMAGE ERROR:", error);
        setLoading(false);
        return;
      }

      setImageUrl(data?.signedUrl ?? null);
      setLoading(false);
    }

    loadImage();
  }, [imagePath]);

  return (
    <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm text-zinc-600">
            Loading preview...
          </span>
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
          <span className="text-sm text-zinc-600">
            No preview available
          </span>
        </div>
      )}
    </div>
  );
}