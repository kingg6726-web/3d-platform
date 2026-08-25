"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <header className="w-full border-b border-white/10">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
        >
          3D Platform
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#models"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Models
          </a>

          <a
            href="#creators"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Creators
          </a>

          <a
            href="#videos"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Videos
          </a>
        </nav>

        {email ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
              {email.charAt(0).toUpperCase()}
            </div>

            <span className="hidden max-w-[180px] truncate text-sm text-zinc-400 sm:block">
              {email}
            </span>

            <button
              onClick={handleSignOut}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white hover:text-black"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a
              href="/signin"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white hover:text-black"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Sign up
            </a>
          </div>
        )}
      </div>
    </header>
  );
}