"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadVideoPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  async function publishVideo() {
    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter a video title.");
      return;
    }

    if (!videoFile) {
      setMessage("Please select a video file.");
      return;
    }

    setPublishing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be signed in.");
        setPublishing(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const creator = profile?.username || "user";

      const timestamp = Date.now();

      const videoPath = `${user.id}/videos/${timestamp}-${videoFile.name}`;

      const { error: videoError } = await supabase.storage
        .from("assets")
        .upload(videoPath, videoFile);

      if (videoError) {
        throw videoError;
      }

      let thumbnailPath: string | null = null;

      if (thumbnail) {
        thumbnailPath = `${user.id}/videos/${timestamp}-thumbnail-${thumbnail.name}`;

        const { error: thumbnailError } = await supabase.storage
          .from("assets")
          .upload(thumbnailPath, thumbnail);

        if (thumbnailError) {
          throw thumbnailError;
        }
      }

      const slug =
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") +
        "-" +
        timestamp;

      const { error: databaseError } = await supabase
        .from("videos")
        .insert({
          slug,
          title: title.trim(),
          description: description.trim(),
          creator,
          video: videoPath,
          thumbnail: thumbnailPath,
          user_id: user.id,
        });

      if (databaseError) {
        throw databaseError;
      }

      setMessage("Video published successfully!");

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnail(null);

      const videoInput = document.getElementById(
        "video-file"
      ) as HTMLInputElement | null;

      const thumbnailInput = document.getElementById(
        "thumbnail-file"
      ) as HTMLInputElement | null;

      if (videoInput) {
        videoInput.value = "";
      }

      if (thumbnailInput) {
        thumbnailInput.value = "";
      }
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(`Publish failed: ${error.message}`);
      } else {
        setMessage("Publish failed.");
      }
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Creator tools
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Upload Video
            </h1>

            <p className="mt-3 text-zinc-400">
              Share tutorials, workflows, VFX and other 3D content.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <label className="text-sm text-zinc-400">
                Video title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How I made this material"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what this video is about..."
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Video file
              </label>

              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setVideoFile(e.target.files?.[0] || null)
                }
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
              />

              {videoFile && (
                <p className="mt-2 text-sm text-zinc-500">
                  Selected: {videoFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Thumbnail
              </label>

              <input
                id="thumbnail-file"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files?.[0] || null)
                }
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
              />

              {thumbnail && (
                <p className="mt-2 text-sm text-zinc-500">
                  Selected: {thumbnail.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={publishVideo}
              disabled={publishing}
              className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Video"}
            </button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-zinc-300">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}