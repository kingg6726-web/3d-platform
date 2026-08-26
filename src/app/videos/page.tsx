import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function VideosPage() {
  const { data: videos, error } = await supabase
    .from("videos")
    .select(
      "id, slug, title, description, creator, video, thumbnail, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load videos
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const videosWithUrls = (videos ?? []).map((video) => {
    const { data: videoUrl } = supabase.storage
      .from("assets")
      .getPublicUrl(video.video);

    const thumbnailUrl = video.thumbnail
      ? supabase.storage
          .from("assets")
          .getPublicUrl(video.thumbnail).data.publicUrl
      : null;

    return {
      ...video,
      videoUrl: videoUrl.publicUrl,
      thumbnailUrl,
    };
  });

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
              Discover tutorials, workflows, VFX and other 3D content
              from the community.
            </p>
          </div>

          <Link
            href="/videos/upload"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Upload Video
          </Link>
        </div>

        {videosWithUrls.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {videosWithUrls.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                <Link href={`/videos/${encodeURIComponent(video.slug)}`}>
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <video
                        src={video.videoUrl}
                        muted
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl">
                        <span className="ml-1 text-lg">▶</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-6">
                  <p className="text-sm text-zinc-500">
                    {video.creator}
                  </p>

                  <h2 className="mt-2 line-clamp-2 text-xl font-medium">
                    {video.title}
                  </h2>

                  {video.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                      {video.description}
                    </p>
                  )}

                  <Link
                    href={`/videos/${encodeURIComponent(video.slug)}`}
                    className="mt-6 block w-full rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                  >
                    Watch video
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <p className="text-xl font-medium">
              No videos yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Be the first creator to publish a video.
            </p>

            <Link
              href="/videos/upload"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Upload your first video
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}