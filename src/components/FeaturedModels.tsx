"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FavoriteCardHeart from "./FavoriteCardHeart";

type AssetType =
  | "model"
  | "material"
  | "hdri"
  | "texture"
  | "brush";

type Asset = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  creator: string | null;
  price: string | null;
  rating: string | null;
  description: string | null;
  image: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

interface FeaturedModelsProps {
  query?: string;
}

const filters: {
  label: string;
  value: "all" | AssetType;
}[] = [
  { label: "All", value: "all" },
  { label: "Models", value: "model" },
  { label: "Materials", value: "material" },
  { label: "HDRI", value: "hdri" },
  { label: "Textures", value: "texture" },
  { label: "Brushes", value: "brush" },
];

export default function FeaturedModels({
  query = "",
}: FeaturedModelsProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "all" | AssetType
  >("all");

  const [searchQuery, setSearchQuery] = useState(query);

  const [imageUrls, setImageUrls] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const [assetsResult, profilesResult] =
          await Promise.all([
            Promise.race([
              supabase
                .from("assets")
                .select(
                  "id, slug, name, type, category, creator, price, rating, description, image, created_at"
                )
                .order("created_at", {
                  ascending: false,
                }),

              new Promise<never>((_, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new Error("Assets request timed out.")
                    ),
                  10000
                )
              ),
            ]),

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

        const { data, error } = assetsResult;

        if (error) {
          console.error(
            "FEATURED ASSETS ERROR:",
            error
          );

          setErrorMessage(
            "Unable to load assets right now."
          );

          setLoading(false);
          return;
        }

        if (profilesResult.error) {
          console.error(
            "FEATURED PROFILES ERROR:",
            profilesResult.error
          );
        }

        const loadedAssets = (data ?? []) as Asset[];
        const loadedProfiles =
          (profilesResult.data ?? []) as Profile[];

        setAssets(loadedAssets);
        setProfiles(loadedProfiles);
        setLoading(false);

        const urls: Record<string, string> = {};

        for (const asset of loadedAssets) {
          if (!asset.image) {
            continue;
          }

          const { data: imageData } =
            supabase.storage
              .from("assets")
              .getPublicUrl(asset.image);

          if (imageData?.publicUrl) {
            urls[asset.id] = imageData.publicUrl;
          }
        }

        if (!cancelled) {
          setImageUrls(urls);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "FEATURED ASSETS LOAD ERROR:",
          error
        );

        setErrorMessage(
          "Unable to load assets right now."
        );

        setLoading(false);
      }
    }

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = searchQuery
    .trim()
    .toLowerCase();

  const filteredAssets = assets.filter((asset) => {
    const normalizedType =
      asset.type?.toLowerCase();

    const matchesFilter =
      activeFilter === "all" ||
      normalizedType === activeFilter;

    const searchableText = [
      asset.name,
      asset.category,
      asset.creator,
      asset.type,
      asset.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedQuery === "" ||
      searchableText.includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });

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

          return searchableText.includes(normalizedQuery);
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
    <section
      id="models"
      className="px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Discover
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Digital assets
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Search models, materials, HDRI maps, textures,
            brushes and creators.
          </p>
        </div>

        <div className="mb-8">
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
              placeholder="Search digital assets or creators..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-13 pr-5 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        {normalizedQuery.length > 0 &&
          filteredProfiles.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Creators
                </h3>

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
                          {getProfileInitial(profile)}
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

        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive =
              activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.value)
                }
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              Loading assets...
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Loading the latest creations.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white hover:text-black"
            >
              Try again
            </button>
          </div>
        ) : filteredAssets.length > 0 ? (
          <>
            {normalizedQuery.length > 0 && (
              <div className="mb-5">
                <p className="text-sm text-zinc-500">
                  {filteredAssets.length}{" "}
                  {filteredAssets.length === 1
                    ? "asset"
                    : "assets"}{" "}
                  found
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => {
                const creatorProfile =
                  findCreatorProfile(
                    asset.creator
                  );

                return (
                  <article
                    key={asset.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      {imageUrls[asset.id] ? (
                        <img
                          src={imageUrls[asset.id]}
                          alt={asset.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                          <span className="text-xs text-zinc-600">
                            No preview
                          </span>
                        </div>
                      )}

                      <FavoriteCardHeart
                        assetId={asset.id}
                      />
                    </div>

                    <div className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-white">
                            {asset.name}
                          </h3>

                          <p className="mt-1 text-sm text-zinc-500">
                            {asset.category ||
                              "Uncategorized"}
                          </p>

                          {creatorProfile ? (
                            <Link
                              href={getProfileHref(
                                creatorProfile
                              )}
                              className="mt-1 inline-block text-xs text-zinc-600 transition-colors hover:text-white"
                            >
                              by{" "}
                              {asset.creator ||
                                "Unknown"}
                            </Link>
                          ) : (
                            <p className="mt-1 text-xs text-zinc-600">
                              by{" "}
                              {asset.creator ||
                                "Unknown"}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-sm font-medium text-white">
                          {asset.price === "0"
                            ? "Free"
                            : asset.price || "Free"}
                        </span>
                      </div>

                      <div className="mb-4 text-xs text-zinc-500">
                        {asset.rating || "0"}
                      </div>

                      <Link
                        href={`/models/${asset.slug}`}
                        className="flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-white hover:text-black"
                      >
                        View asset
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              No assets found
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search or choose a different
              category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}