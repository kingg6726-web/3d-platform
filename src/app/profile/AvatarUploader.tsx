"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type AvatarUploaderProps = {
  userId: string;
  avatarUrl: string | null;
  username: string;
  onUploaded: (avatarUrl: string) => void;
};

export default function AvatarUploader({
  userId,
  avatarUrl,
  username,
  onUploaded,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const initial = username.charAt(0).toUpperCase();

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("AVATAR UPLOAD ERROR:", uploadError);
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatar")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("PROFILE AVATAR ERROR:", profileError);
      setError("Avatar uploaded, but profile could not be updated.");
      setUploading(false);
      return;
    }

    onUploaded(publicUrl);

    setUploading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 overflow-hidden items-center justify-center rounded-full bg-white text-4xl font-semibold text-black">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </button>

          <p className="mt-2 text-xs text-zinc-600">
            JPG, PNG, WEBP or GIF. Maximum 5 MB.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}