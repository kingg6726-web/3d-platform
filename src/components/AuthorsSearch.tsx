"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type AuthorsSearchProps = {
  profiles: Profile[];
};

export default function AuthorsSearch({
  profiles,
}: AuthorsSearchProps) {
  const [query, setQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return profiles;
    }

    return profiles.filter((profile) => {
      const searchableText = [
        profile.display_name,
        profile.username,
        profile.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [profiles, query]);

  return (
    <>
      <div className="mb-10">
        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search authors..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-600 hover:border-white/20 focus:border-white/25 focus:bg-white/[0.04]"
          />
        </div>
      </div>

      {filteredProfiles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => {
            const name =
              profile.display_name ||
              profile.username ||
              "User";

            const username =
              profile.username || "user";

            const initial =
              name.charAt(0).toUpperCase();

            return (
              <article
                key={profile.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-semibold text-black">
                    {initial}
                  </div>
                )}

                <h2 className="mt-5 text-xl font-medium">
                  {name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  @{username}
                </p>

                <p className="mt-3 line-clamp-2 text-sm text-zinc-500">
                  {profile.bio || "3D Creator"}
                </p>

                <Link
                  href={`/authors/${encodeURIComponent(username)}`}
                  className="mt-6 block w-full rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                >
                  View profile
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-lg font-medium">
            No authors found
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Try searching for another creator.
          </p>
        </div>
      )}
    </>
  );
}