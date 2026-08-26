"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteVideoButton from "@/app/videos/DeleteVideoButton";

type MyVideoCardProps = {
  video: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    creator: string | null;
    video: string;
    thumbnail: string | null;
  };
  onDeleted: () => void;
};

export default function MyVideoCard({
  video,
  onDeleted,
}: MyVideoCardProps) {
  const thumbnailUrl = video.thumbnail
    ? supabase.storage
        .from("assets")
        .getPublicUrl(video.thumbnail).data.publicUrl
    : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <Link href={`/videos/${encodeURIComponent(video.slug)}`}>
        <div className="aspect-video overflow-hidden bg-zinc-950">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
              No thumbnail
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="text-sm text-zinc-500">
          {video.creator}
        </p>

        <h3 className="mt-2 text-xl font-medium text-white">
          {video.title}
        </h3>

        <Link
          href={`/videos/${encodeURIComponent(video.slug)}`}
          className="mt-5 block w-full rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
        >
          Watch video
        </Link>

        <DeleteVideoButton
          videoId={video.id}
          videoPath={video.video}
          thumbnailPath={video.thumbnail}
          onDeleted={onDeleted}
        />
      </div>
    </article>
  );
}