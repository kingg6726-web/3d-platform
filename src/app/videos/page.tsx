"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Video = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  creator: string | null;
  video: string;
  thumbnail: string | null;
  created_at: string;
  videoUrl: string;
  thumbnailUrl: string | null;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const [videosResult, profilesResult] =
          await Promise.all([
            supabase
              .from("videos")
              .select(
                "id, slug, title, description, creator, video, thumbnail, created_at"
              )
              .order("created_at", {
                ascending: false,
              }),

            supabase
              .from("profiles")
              .select(
                "id, username, display_name, avatar_url, bio"
              )
              .not("username", "is", null)
              .order("created_at", {
                ascending: false,
              }),
          ]);

        if (cancelled) {
          return;
        }

        if (videosResult.error) {
          console.error(
            "VIDEOS LOAD ERROR:",
            videosResult.error
          );

          setErrorMessage(
            "Unable to load videos right now."
          );

          setLoading(false);
          return;
        }

        if (profilesResult.error) {
          console.error(
            "PROFILES LOAD ERROR:",
            profilesResult.error
          );
        }

        const videosWithUrls =
          (videosResult.data ?? []).map((video) => {
            const { data: videoUrl } =
              supabase.storage
                .from("assets")
                .getPublicUrl(video.video);

            const thumbnailUrl = video.thumbnail
              ? supabase.storage
                  .from("assets")
                  .getPublicUrl(
                    video.thumbnail
                  ).data.publicUrl
              : null;

            return {
              ...video,
              videoUrl: videoUrl.publicUrl,
              thumbnailUrl,
            };
          });

        setVideos(videosWithUrls);
        setProfiles(
          (profilesResult.data ??
            []) as Profile[]
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "VIDEOS LOAD ERROR:",
          error
        );

        setErrorMessage(
          "Unable to load videos right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = searchQuery
    .trim()
    .toLowerCase();

  const filteredVideos = videos.filter(
    (video) => {
      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        video.title,
        video.description,
        video.creator,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery
      );
    }
  );

  const filteredProfiles =
    normalizedQuery.length > 0
      ? profiles.filter((profile) => {
          const searchableText = [
            profile.username,
            profile.display_name,
            profile.bio,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        })
      : [];

  function getProfileName(profile: Profile) {
    return (
      profile.display_name ||
      profile.username ||
      "User"
    );
  }

  function getProfileInitial(profile: Profile) {
    return getProfileName(profile)
      .charAt(0)
      .toUpperCase();
  }

  function getProfileHref(profile: Profile) {
    if (!profile.username) {
      return "/authors";
    }

    return `/authors/${encodeURIComponent(
      profile.username
    )}`;
  }

  function findCreatorProfile(
    creator: string | null
  ) {
    if (!creator) {
      return null;
    }

    const normalizedCreator =
      creator.trim().toLowerCase();

    return (
      profiles.find((profile) => {
        const username =
          profile.username?.trim().toLowerCase();

        const displayName =
          profile.display_name
            ?.trim()
            .toLowerCase();

        return (
          username === normalizedCreator ||
          displayName === normalizedCreator
        );
      }) ?? null
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              3D Platform
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Videos
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
              Discover tutorials, workflows, VFX
              and other 3D content from the
              community.
            </p>
          </div>

          <Link
            href="/videos/upload"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200"
          >
            Upload Video
          </Link>
        </div>

        <div className="mb-10">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search videos or creators..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-13 pr-5 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        {normalizedQuery.length > 0 &&
          filteredProfiles.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Creators
                </h2>

                <span className="text-xs text-zinc-600">
                  {filteredProfiles.length}{" "}
                  {filteredProfiles.length === 1
                    ? "creator"
                    : "creators"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProfiles
                  .slice(0, 6)
                  .map((profile) => (
                    <Link
                      key={profile.id}
                      href={getProfileHref(profile)}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={getProfileName(profile)}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                          {getProfileInitial(
                            profile
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {getProfileName(profile)}
                        </p>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          @{profile.username || "user"}
                        </p>
                      </div>

                      <span className="ml-auto text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium">
              Loading videos...
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Loading the latest community videos.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h2 className="text-2xl font-semibold">
              Unable to load videos
            </h2>

            <p className="mt-3 text-sm text-red-300">
              {errorMessage}
            </p>
          </div>
        ) : filteredVideos.length > 0 ? (
          <>
            {normalizedQuery.length > 0 && (
              <div className="mb-5">
                <p className="text-sm text-zinc-500">
                  {filteredVideos.length}{" "}
                  {filteredVideos.length === 1
                    ? "video"
                    : "videos"}{" "}
                  found
                </p>
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video) => {
                const creatorProfile =
                  findCreatorProfile(
                    video.creator
                  );

                return (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <Link
                      href={`/videos/${encodeURIComponent(
                        video.slug
                      )}`}
                    >
                      <div className="group relative aspect-video overflow-hidden bg-zinc-950">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            src={video.videoUrl}
                            muted
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:scale-105">
                            <span className="ml-1 text-lg">
                              ▶
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      {creatorProfile ? (
                        <Link
                          href={getProfileHref(
                            creatorProfile
                          )}
                          className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                          {video.creator}
                        </Link>
                      ) : (
                        <p className="text-sm text-zinc-500">
                          {video.creator ||
                            "Unknown creator"}
                        </p>
                      )}

                      <h2 className="mt-2 line-clamp-2 text-xl font-medium">
                        {video.title}
                      </h2>

                      {video.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                          {video.description}
                        </p>
                      )}

                      <Link
                        href={`/videos/${encodeURIComponent(
                          video.slug
                        )}`}
                        className="mt-6 block w-full rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-300 transition-all hover:bg-white hover:text-black"
                      >
                        Watch video
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <p className="text-xl font-medium">
              No videos found
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}