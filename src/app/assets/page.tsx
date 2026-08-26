"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Asset = {
  id: string;
  slug: string;
  name: string;
  type: string;
  creator: string | null;
  price: string | null;
  image: string | null;
};

type AssetWithImage = Asset & {
  imageUrl: string | null;
};

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<AssetWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssets() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .select(
          "id, slug, name, type, creator, price, image"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (assetError) {
        console.error("Error loading assets:", assetError);
        setError(assetError.message);
        setLoading(false);
        return;
      }

      const assetsWithImages = await Promise.all(
        (assetData ?? []).map(async (asset) => {
          if (!asset.image) {
            return {
              ...asset,
              imageUrl: null,
            };
          }

          const { data: imageData } = await supabase.storage
            .from("assets")
            .createSignedUrl(asset.image, 60 * 60);

          return {
            ...asset,
            imageUrl: imageData?.signedUrl ?? null,
          };
        })
      );

      setAssets(assetsWithImages);
      setLoading(false);
    }

    loadAssets();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-400">Loading assets...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Creator dashboard
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              My Assets
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-500">
              Manage your 3D models and uploads.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            + Add Model
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h2 className="text-xl font-medium">
              Unable to load assets
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                  {asset.imageUrl ? (
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                      <span className="text-sm text-zinc-600">
                        No preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium">
                        {asset.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        {asset.type}
                      </p>
                    </div>

                    {asset.price && (
                      <span className="text-sm font-medium">
                        {asset.price}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/models/${asset.slug}`}
                    className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                  >
                    View model
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
            <p className="text-lg font-medium">
              No assets yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Upload your first 3D model to get started.
            </p>

            <Link
              href="/upload"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Add Model
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}