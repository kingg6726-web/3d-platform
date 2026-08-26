"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  }

  return (
    <header className="w-full border-b border-[var(--border)]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]"
        >
          3D Platform
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/models"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Models
          </a>

          <a
            href="#creators"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Creators
          </a>

          <a
            href="#videos"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Videos
          </a>
        </nav>

        {email ? (
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-[var(--border)] px-2 py-1.5 transition-colors hover:bg-[var(--surface)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)] text-xs font-semibold text-[var(--background)]">
                {email.charAt(0).toUpperCase()}
              </div>

              <span className="hidden max-w-[180px] truncate text-sm text-[var(--muted)] sm:block">
                {email}
              </span>

              <span className="px-1 text-xs text-[var(--muted)]">
                ▼
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 w-52 pt-3">
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="truncate text-xs text-[var(--muted)]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm text-[var(--foreground)]">
                      {email}
                    </p>
                  </div>

                  <div className="p-2">
                    <a
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                      Profile
                    </a>

                    <a
                      href="/assets"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                      My Assets
                    </a>

                    <a
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                      Settings
                    </a>

                    <div className="my-2 border-t border-[var(--border)]" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a
              href="/signin"
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition-colors hover:opacity-80"
            >
              Sign up
            </a>
          </div>
        )}
      </div>
    </header>
  );
}