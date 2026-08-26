"use client";

import { useEffect, useState } from "react";
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
  const [activeFilter, setActiveFilter] = useState<
    "all" | AssetType
  >("all");

  const [imageUrls, setImageUrls] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      setLoading(true);

      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("FEATURED ASSETS ERROR:", error);
        setLoading(false);
        return;
      }

      setAssets(data ?? []);

      const urls: Record<string, string> = {};

      for (const asset of data ?? []) {
        if (!asset.image) {
          continue;
        }

        const { data: imageData } =
          await supabase.storage
            .from("assets")
            .createSignedUrl(asset.image, 60 * 60);

        if (imageData?.signedUrl) {
          urls[asset.id] = imageData.signedUrl;
        }
      }

      setImageUrls(urls);
      setLoading(false);
    }

    loadAssets();
  }, []);

  const normalizedQuery = query
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
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchableText.includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });

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
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive =
              activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() =>
                  setActiveFilter(filter.value)
                }
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
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
        ) : filteredAssets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <article
                key={asset.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
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

                  <FavoriteCardHeart assetId={asset.id} />
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-white">
                        {asset.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {asset.category ||
                          "Uncategorized"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        by {asset.creator || "Unknown"}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-white">
                      {asset.price === "0"
                        ? "Free"
                        : asset.price || "Free"}
                    </span>
                  </div>

                  <div className="mb-4 text-xs text-zinc-500">
                    ★ {asset.rating || "0"}
                  </div>

                  <a
                    href={`/models/${asset.slug}`}
                    className="flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
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
              This category is waiting for new content.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}