"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FavoriteAsset = {
  id: string;
  slug: string;
  name: string;
  type: string;
  creator: string | null;
  price: string | null;
  image: string | null;
};

type FavoriteAssetWithImage = FavoriteAsset & {
  imageUrl: string | null;
};

export default function FavoritesPage() {
  const [assets, setAssets] = useState<FavoriteAssetWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Sign in to view your favorites.");
        setLoading(false);
        return;
      }

      const { data: favorites, error: favoritesError } =
        await supabase
          .from("favorites")
          .select("asset_id")
          .eq("user_id", user.id);

      if (favoritesError) {
        console.error(favoritesError);
        setMessage(favoritesError.message);
        setLoading(false);
        return;
      }

      const assetIds =
        favorites?.map((favorite) => favorite.asset_id) ?? [];

      if (assetIds.length === 0) {
        setAssets([]);
        setLoading(false);
        return;
      }

      const { data: assetData, error: assetError } =
        await supabase
          .from("assets")
          .select(
            "id, slug, name, type, creator, price, image"
          )
          .in("id", assetIds);

      if (assetError) {
        console.error(assetError);
        setMessage(assetError.message);
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

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-400">
            Loading favorites...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Your collection
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Favorites
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Models you have saved for later.
          </p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10">
            <p className="text-zinc-400">
              {message}
            </p>

            <Link
              href="/signin"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Sign in
            </Link>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                <Link href={`/models/${asset.slug}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    {asset.imageUrl ? (
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                        <span className="text-sm text-zinc-600">
                          No preview
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
                        {asset.type}
                      </p>

                      <h2 className="mt-2 font-medium">
                        {asset.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        by {asset.creator}
                      </p>
                    </div>

                    {asset.price && (
                      <span className="text-sm font-medium">
                        {asset.price === "0"
                          ? "Free"
                          : asset.price}
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
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-20 text-center">
            <div className="text-5xl text-zinc-700">
              ♡
            </div>

            <p className="mt-5 text-xl font-medium">
              No favorites yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Save models you like and they will appear here.
            </p>

            <Link
              href="/models"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Explore Models
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}