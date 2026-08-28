"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Theme = "dark" | "light" | "system";
type ViewMode = "comfortable" | "compact";
type Language = "English" | "Русский" | "Հայերեն";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`relative flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-all duration-200 ${
        enabled
          ? "bg-[var(--foreground)]"
          : "bg-zinc-700"
      }`}
    >
      <span
        className={`block h-5 w-5 rounded-full transition-transform duration-200 ${
          enabled
            ? "translate-x-5 bg-[var(--background)]"
            : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [viewMode, setViewMode] =
    useState<ViewMode>("comfortable");

  const [language, setLanguage] =
    useState<Language>("English");

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    alert(
      "Account deletion will be available once the account management system is connected."
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
            Account
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Manage how 3D Platform works and looks for you.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <h2 className="text-xl font-medium">
                Appearance
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Choose the appearance of the platform.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {(["dark", "light", "system"] as Theme[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                      theme === option
                        ? "border-[var(--foreground)] bg-[var(--surface-strong)] text-[var(--foreground)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]/20 hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {option}
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {option === "dark" &&
                        "Dark interface"}

                      {option === "light" &&
                        "Light interface"}

                      {option === "system" &&
                        "Follow your device"}
                    </p>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <h2 className="text-xl font-medium">
                Notifications
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Choose which activity you want to be notified about.
              </p>
            </div>

            <div className="mt-6 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between gap-6 py-5 first:pt-0">
                <div>
                  <p className="font-medium">
                    Email notifications
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Receive important updates about your account.
                  </p>
                </div>

                <Toggle
                  enabled={emailNotifications}
                  onChange={() =>
                    setEmailNotifications(
                      !emailNotifications
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-6 py-5">
                <div>
                  <p className="font-medium">
                    Comment notifications
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Get notified when someone replies to your comments.
                  </p>
                </div>

                <Toggle
                  enabled={commentNotifications}
                  onChange={() =>
                    setCommentNotifications(
                      !commentNotifications
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-6 py-5 last:pb-0">
                <div>
                  <p className="font-medium">
                    Like notifications
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Get notified when people like your content.
                  </p>
                </div>

                <Toggle
                  enabled={likeNotifications}
                  onChange={() =>
                    setLikeNotifications(
                      !likeNotifications
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <h2 className="text-xl font-medium">
                Playback
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Control how videos behave while browsing the platform.
              </p>
            </div>

            <div className="mt-6 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between gap-6 py-5 first:pt-0">
                <div>
                  <p className="font-medium">
                    Autoplay videos
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Automatically play videos when they appear on screen.
                  </p>
                </div>

                <Toggle
                  enabled={autoplayVideos}
                  onChange={() =>
                    setAutoplayVideos(!autoplayVideos)
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-6 py-5 last:pb-0">
                <div>
                  <p className="font-medium">
                    Reduce motion
                  </p>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Reduce animations and movement across the interface.
                  </p>
                </div>

                <Toggle
                  enabled={reduceMotion}
                  onChange={() =>
                    setReduceMotion(!reduceMotion)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <h2 className="text-xl font-medium">
                Content
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Choose how assets are displayed while browsing.
              </p>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">
                Asset view
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode("comfortable")
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                    viewMode === "comfortable"
                      ? "border-[var(--foreground)] bg-[var(--surface-strong)]"
                      : "border-[var(--border)] hover:border-[var(--foreground)]/20 hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  <p className="font-medium">
                    Comfortable
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Larger cards with more visual space.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("compact")
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                    viewMode === "compact"
                      ? "border-[var(--foreground)] bg-[var(--surface-strong)]"
                      : "border-[var(--border)] hover:border-[var(--foreground)]/20 hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  <p className="font-medium">
                    Compact
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    More assets visible at once.
                  </p>
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div>
              <h2 className="text-xl font-medium">
                Language
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Choose the language used by the interface.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {(
                [
                  "English",
                  "Русский",
                  "Հայերեն",
                ] as Language[]
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                    language === option
                      ? "border-[var(--foreground)] bg-[var(--surface-strong)] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]/20 hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <p className="font-medium">
                    {option}
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {option === "English" &&
                      "English interface"}

                    {option === "Русский" &&
                      "Русский интерфейс"}

                    {option === "Հայերեն" &&
                      "Հայերեն ինտերֆեյս"}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <div>
              <h2 className="text-xl font-medium text-red-400">
                Danger Zone
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                These actions can permanently affect your account.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Delete account
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Permanently delete your account and associated data.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="shrink-0 rounded-full border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
              >
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}