import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ModelCardImage from "@/app/models/ModelCardImage";

type AuthorPageProps = {
  params: Promise<{
    creator: string;
  }>;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type Asset = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  price: string | number;
  image: string | null;
};

type Video = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  creator: string | null;
  video: string;
  thumbnail: string | null;
};

export default async function AuthorPage({
  params,
}: AuthorPageProps) {
  const { creator } = await params;
  const username = decodeURIComponent(creator);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("id, slug, name, type, category, price, image")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (assetsError) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load profile
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {assetsError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select(
      "id, slug, title, description, creator, video, thumbnail"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (videosError) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load profile
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {videosError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const videosWithUrls = (videos ?? []).map((video) => {
    const thumbnailUrl = video.thumbnail
      ? supabase.storage
          .from("assets")
          .getPublicUrl(video.thumbnail).data.publicUrl
      : null;

    return {
      ...video,
      thumbnailUrl,
    };
  });

  const displayName =
    profile.display_name ||
    profile.username ||
    "User";

  const usernameText =
    profile.username ||
    "user";

  const firstLetter =
    displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/authors"
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Back to Authors
        </Link>

        <section className="mt-10 border-b border-white/10 pb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-24 w-24 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-semibold text-black">
                {firstLetter}
              </div>
            )}

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Creator profile
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {displayName}
              </h1>

              <p className="mt-2 text-zinc-500">
                @{usernameText}
              </p>

              {profile.bio && (
                <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                  {profile.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
                <span>
                  {(assets ?? []).length}{" "}
                  {(assets ?? []).length === 1
                    ? "asset"
                    : "assets"}
                </span>

                <span>•</span>

                <span>
                  {(videos ?? []).length}{" "}
                  {(videos ?? []).length === 1
                    ? "video"
                    : "videos"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">
              Published assets
            </h2>
          </div>

          {assets && assets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/models/${asset.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                    <ModelCardImage
                      imagePath={asset.image}
                      alt={asset.name}
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-medium">
                      {asset.name}
                    </h3>

                    <div className="mt-2 flex items-center justify-between gap-4 text-sm text-zinc-500">
                      <span>
                        {asset.category ||
                          asset.type ||
                          "Asset"}
                      </span>

                      <span className="text-zinc-300">
                        {String(asset.price) === "0"
                          ? "Free"
                          : `$${asset.price}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <p className="text-lg font-medium text-white">
                No assets yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                This creator has not published any assets yet.
              </p>
            </div>
          )}
        </section>

        <section className="mt-16 border-t border-white/10 pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">
              Published videos
            </h2>
          </div>

          {videosWithUrls.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videosWithUrls.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${encodeURIComponent(video.slug)}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
                        No thumbnail
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <span className="ml-1 text-lg">
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-medium">
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                        {video.description}
                      </p>
                    )}

                    <p className="mt-4 text-sm text-zinc-500">
                      Watch video →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <p className="text-lg font-medium text-white">
                No videos yet
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                This creator has not published any videos yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}