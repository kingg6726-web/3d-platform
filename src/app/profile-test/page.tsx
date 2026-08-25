"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfileTestPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Not signed in. Please sign in first.");
        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      setProfile(data);
      setMessage("");
    }

    loadProfile();
  }, []);

  if (message) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">
            Profile test
          </h1>

          <p className="mt-4 text-zinc-400">
            {message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Profile test
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          {profile?.display_name || "No name yet"}
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-zinc-400">
            Email: {email}
          </p>

          <p className="mt-2 text-zinc-400">
            Username: {profile?.username || "Not set"}
          </p>

          <p className="mt-2 text-zinc-400">
            Bio: {profile?.bio || "Not set"}
          </p>
        </div>
      </div>
    </main>
  );
}