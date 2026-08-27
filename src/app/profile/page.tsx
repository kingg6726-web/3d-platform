"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import MyVideoCard from "./MyVideoCard";

type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type Asset = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  price: string;
  image: string | null;
  imageUrl: string | null;
};

type Video = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  creator: string | null;
  video: string;
  thumbnail: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  async function loadVideos(userId: string) {
    const { data } = await supabase
      .from("videos")
      .select(
        "id, slug, title, description, creator, video, thumbnail"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setVideos(data ?? []);
  }

  async function loadProfileData(userId: string) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, bio, avatar_url")
      .eq("id", userId)
      .single();

    setProfile(profileData);
    setUsername(profileData?.username || "");
    setBio(profileData?.bio || "");
  }

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      await loadProfileData(currentUser.id);

      const { data: userAssets } = await supabase
        .from("assets")
        .select("id, slug, name, type, category, price, image")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      const assetsWithImages = await Promise.all(
        (userAssets ?? []).map(async (asset) => {
          if (!asset.image) {
            return {
              ...asset,
              imageUrl: null,
            };
          }

          const { data: imageData } = await supabase.storage
            .from("assets")
            .createSignedUrl(asset.image, 60 * 60);

          return {
            ...asset,
            imageUrl: imageData?.signedUrl ?? null,
          };
        })
      );

      setAssets(assetsWithImages);
      await loadVideos(currentUser.id);

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleAvatarUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      console.error("Authentication error:", userError);
      alert("You are not authenticated. Please sign in again.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Avatar must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${currentUser.id}/avatar.${extension}`;

      console.log("Uploading avatar:", {
        userId: currentUser.id,
        filePath,
        bucket: "avatar",
      });

      const { error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        alert(
          `Failed to upload avatar: ${uploadError.message}`
        );
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatar")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?v=${Date.now()}`;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", currentUser.id);

      if (profileError) {
        console.error(
          "Avatar profile update error:",
          profileError
        );

        alert(
          "Avatar uploaded, but profile could not be updated."
        );

        return;
      }

      setUser(currentUser);

      setProfile((current) => ({
        username: current?.username ?? null,
        bio: current?.bio ?? null,
        avatar_url: avatarUrl,
      }));
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert(
        "Something went wrong while uploading the avatar."
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  }

  async function saveProfile() {
    if (!user) return;

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      alert("Username cannot be empty.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          username: cleanUsername,
          bio: bio.trim() || null,
        },
        {
          onConflict: "id",
        }
      )
      .select("username, bio, avatar_url")
      .single();

    if (error) {
      console.error("Error saving profile:", error);

      if (error.code === "23505") {
        alert("This username is already taken.");
      } else {
        alert("Failed to save profile.");
      }

      setSaving(false);
      return;
    }

    setProfile(data);
    setUsername(data.username || "");
    setBio(data.bio || "");
    setEditing(false);
    setSaving(false);
  }

  async function handleVideosChanged() {
    if (!user) return;
    await loadVideos(user.id);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-400">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">
            Not signed in
          </h1>

          <p className="mt-3 text-zinc-400">
            Please sign in first.
          </p>
        </div>
      </main>
    );
  }

  const displayUsername =
    profile?.username || "user";

  const displayBio =
    profile?.bio || "bio not set";

  const avatarLetter =
    displayUsername.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="relative">

                <div className="flex h-24 w-24 shrink-0 overflow-hidden items-center justify-center rounded-full bg-white text-4xl font-semibold text-black">

                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayUsername}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarLetter
                  )}

                </div>

                {editing && (
                  <label
                    className={`absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black bg-white text-black shadow-lg transition hover:bg-zinc-200 ${
                      uploadingAvatar
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    {uploadingAvatar ? (
                      <span className="text-xs">
                        ...
                      </span>
                    ) : (
                      <span className="text-lg leading-none">
                        +
                      </span>
                    )}

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                )}

              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  Creator profile
                </p>

                <h1 className="mt-2 text-4xl font-semibold">
                  {displayUsername}
                </h1>

                <p className="mt-2 text-zinc-400">
                  @{displayUsername}
                </p>
              </div>

            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Edit Profile
              </button>
            )}

          </div>

          {editing ? (
            <div className="mt-10 space-y-6">

              <div>
                <label className="text-sm text-zinc-400">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Enter your username"
                  maxLength={30}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  This name will be visible to other users.
                </p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Tell people about yourself"
                  rows={4}
                  maxLength={300}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Avatar
                </label>

                <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-4">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-sm text-white">
                        Profile picture
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        JPG, PNG, WEBP or GIF. Maximum 5 MB.
                      </p>
                    </div>

                    <label
                      className={`inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black ${
                        uploadingAvatar
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                    >
                      {uploadingAvatar
                        ? "Uploading..."
                        : "Choose image"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>

                  </div>

                </div>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={
                    saving || uploadingAvatar
                  }
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUsername(
                      profile?.username || ""
                    );
                    setBio(profile?.bio || "");
                    setEditing(false);
                  }}
                  disabled={
                    saving || uploadingAvatar
                  }
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-zinc-500">
                    Email
                  </p>

                  <p className="mt-2 break-all text-white">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <p className="text-sm text-zinc-500">
                    Username
                  </p>

                  <p className="mt-2 text-white">
                    {displayUsername}
                  </p>
                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-zinc-500">
                  Bio
                </p>

                <p className="mt-2 text-white">
                  {displayBio}
                </p>
              </div>
            </>
          )}

        </div>

        <section className="mt-12">

          <div className="mb-6 flex items-center justify-between gap-4">

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Creator
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                My Assets
              </h2>
            </div>

            <a
              href="/upload"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              + Add Asset
            </a>

          </div>

          {assets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
                >

                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">

                    {asset.imageUrl ? (
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                        <span className="text-sm text-zinc-600">
                          No preview
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h3 className="font-medium text-white">
                          {asset.name}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          {asset.category || asset.type}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-white">
                        {asset.price === "0"
                          ? "Free"
                          : asset.price}
                      </span>

                    </div>

                    <a
                      href={`/models/${asset.slug}`}
                      className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                    >
                      View asset
                    </a>

                  </div>

                </article>
              ))}

            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">

              <p className="text-lg font-medium text-white">
                No assets yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Upload your first asset and start creating.
              </p>

              <a
                href="/upload"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Add your first asset
              </a>

            </div>
          )}

        </section>

        <section className="mt-16">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                Creator
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                My Videos
              </h2>
            </div>

            <a
              href="/videos/upload"
              className="inline-flex shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              + Upload Video
            </a>

          </div>

          {videos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {videos.map((video) => (
                <MyVideoCard
                  key={video.id}
                  video={video}
                  onDeleted={handleVideosChanged}
                />
              ))}

            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">

              <p className="text-lg font-medium text-white">
                No videos yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Upload your first video and share it with the community.
              </p>

              <a
                href="/videos/upload"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Upload your first video
              </a>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}