"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ModelCardImageProps = {
  imagePath: string | null;
  alt: string;
};

export default function ModelCardImage({
  imagePath,
  alt,
}: ModelCardImageProps) {
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
        console.error("MODEL IMAGE ERROR:", error);
        setLoading(false);
        return;
      }

      setImageUrl(data?.signedUrl ?? null);
      setLoading(false);
    }

    loadImage();
  }, [imagePath]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900">
        <span className="text-sm text-zinc-600">
          Loading preview...
        </span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
        <span className="text-sm text-zinc-600">
          No preview
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className="h-full w-full object-cover"
    />
  );
}