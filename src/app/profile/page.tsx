"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Profile = {
  username: string | null;
  bio: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, bio")
        .eq("id", user.id)
        .single();

      setProfile(profile);

      setUsername(profile?.username || "");
      setBio(profile?.bio || "");

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    if (!user) return;

    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          username: username.trim() || null,
          bio: bio.trim() || null,
        },
        {
          onConflict: "id",
        }
      )
      .select("username, bio")
      .single();

    if (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
      setSaving(false);
      return;
    }

    setProfile(data);
    setUsername(data.username || "");
    setBio(data.bio || "");

    setEditing(false);
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">Not signed in</h1>

          <p className="mt-3 text-zinc-400">
            Please sign in first.
          </p>
        </div>
      </main>
    );
  }

  const displayUsername =
    profile?.username || "username not set";

  const displayBio =
    profile?.bio || "bio not set";

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-4xl font-semibold text-black">
                K
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                  Creator profile
                </p>

                <h1 className="mt-2 text-4xl font-semibold">
                  King
                </h1>

                <p className="mt-2 text-zinc-400">
                  @{displayUsername}
                </p>
              </div>
            </div>

            {!editing && (
              <button
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
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => {
                    setUsername(profile?.username || "");
                    setBio(profile?.bio || "");
                    setEditing(false);
                  }}
                  disabled={saving}
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
      </div>
    </main>
  );
}