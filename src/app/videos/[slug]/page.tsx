import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VideoLikeButton from "@/components/VideoLikeButton";
import VideoComments from "@/components/VideoComments";

type VideoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VideoPage({
  params,
}: VideoPageProps) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug);

  const { data: video, error } = await supabase
    .from("videos")
    .select(
      "id, slug, title, description, creator, video, thumbnail, created_at, views, user_id"
    )
    .eq("slug", decodedSlug)
    .single();

  if (error || !video) {
    notFound();
  }

  const { data: videoUrl } = supabase.storage
    .from("assets")
    .getPublicUrl(video.video);

  const thumbnailUrl = video.thumbnail
    ? supabase.storage
        .from("assets")
        .getPublicUrl(video.thumbnail).data.publicUrl
    : null;

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/videos"
          className="inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white hover:text-black"
        >
          ← Back to Videos
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="bg-black">
            <video
              src={videoUrl.publicUrl}
              controls
              poster={thumbnailUrl ?? undefined}
              className="aspect-video w-full"
            />
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <span>{video.creator}</span>

              <span>•</span>

              <span>
                {video.views}{" "}
                {video.views === 1 ? "view" : "views"}
              </span>

              <VideoLikeButton videoId={video.id} />
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {video.title}
            </h1>

            {video.description && (
              <p className="mt-5 max-w-3xl whitespace-pre-wrap text-base leading-7 text-zinc-400">
                {video.description}
              </p>
            )}
          </div>
        </div>

        <VideoComments
          videoId={video.id}
          authorId={video.user_id}
        />
      </div>
    </main>
  );
}