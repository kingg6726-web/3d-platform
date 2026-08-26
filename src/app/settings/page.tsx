"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Theme = "dark" | "light" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
            Account
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Settings
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Manage your account and site preferences.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-medium">
              Appearance
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Choose how 3D Platform looks for you.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {(["dark", "light", "system"] as Theme[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                      theme === option
                        ? "border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {option}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {option === "dark" && "Dark interface"}
                      {option === "light" && "Light interface"}
                      {option === "system" && "Follow your device"}
                    </p>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-medium">
              Notifications
            </h2>

            <div className="mt-6 flex items-center justify-between gap-6">
              <div>
                <p className="font-medium">
                  Email notifications
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Receive important updates about your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailNotifications(!emailNotifications)
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  emailNotifications
                    ? "bg-[var(--foreground)]"
                    : "bg-[var(--muted)]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full transition-transform ${
                    emailNotifications
                      ? "translate-x-6 bg-[var(--background)]"
                      : "translate-x-1 bg-[var(--background)]"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-xl font-medium">
              Privacy
            </h2>

            <div className="mt-6 flex items-center justify-between gap-6">
              <div>
                <p className="font-medium">
                  Public profile
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Allow other users to view your creator profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPublicProfile(!publicProfile)
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  publicProfile
                    ? "bg-[var(--foreground)]"
                    : "bg-[var(--muted)]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full transition-transform ${
                    publicProfile
                      ? "translate-x-6 bg-[var(--background)]"
                      : "translate-x-1 bg-[var(--background)]"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}