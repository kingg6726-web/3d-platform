"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VideoLikeButtonProps = {
  videoId: string;
};

export default function VideoLikeButton({
  videoId,
}: VideoLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    async function loadLikeState() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: likeCount, error: countError } =
          await supabase.rpc("get_video_like_count", {
            video_id: videoId,
          });

        if (countError) {
          console.error("Like count error:", countError);
        } else {
          setLikes(
            typeof likeCount === "number" ? likeCount : 0
          );
        }

        if (user) {
          const { data: userLike, error: userLikeError } =
            await supabase
              .from("video_likes")
              .select("video_id")
              .eq("video_id", videoId)
              .eq("user_id", user.id)
              .maybeSingle();

          if (userLikeError) {
            console.error(
              "User like error:",
              userLikeError
            );
          }

          setLiked(!!userLike);
        }
      } catch (error) {
        console.error("Like loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLikeState();
  }, [videoId]);

  async function handleLike() {
    if (liking) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in to like videos.");
      return;
    }

    setLiking(true);

    try {
      const { data, error } = await supabase.rpc(
        "toggle_video_like",
        {
          p_video_id: videoId,
        }
      );

      if (error) {
        console.error("Like error:", error);
        alert("Failed to update like.");
        return;
      }

      const isLiked =
        typeof data === "object" &&
        data !== null &&
        "liked" in data
          ? Boolean(data.liked)
          : false;

      setLiked(isLiked);

      const { data: likeCount, error: countError } =
        await supabase.rpc("get_video_like_count", {
          video_id: videoId,
        });

      if (countError) {
        console.error(
          "Like count error:",
          countError
        );
        return;
      }

      setLikes(
        typeof likeCount === "number" ? likeCount : 0
      );
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLiking(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading || liking}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        liked
          ? "border-white bg-white text-black"
          : "border-white/10 text-zinc-400 hover:bg-white hover:text-black"
      } ${
        loading || liking
          ? "cursor-not-allowed opacity-50"
          : ""
      }`}
    >
      <span className="text-base">
        {liked ? "♥" : "♡"}
      </span>

      <span>
        {likes} {likes === 1 ? "like" : "likes"}
      </span>
    </button>
  );
}