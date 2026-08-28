"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Comment = {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profile: Profile | null;
  likes: number;
  liked: boolean;
};

type VideoCommentsProps = {
  videoId: string;
  authorId: string;
};

export default function VideoComments({
  videoId,
  authorId,
}: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadComments() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data: commentsData, error: commentsError } =
        await supabase
          .from("video_comments")
          .select(
            "id, video_id, user_id, content, parent_id, created_at"
          )
          .eq("video_id", videoId)
          .order("created_at", { ascending: true });

      if (commentsError) {
        console.error(
          "Comments loading error:",
          commentsError.message,
          commentsError.details,
          commentsError.hint
        );
        return;
      }

      const rawComments = commentsData ?? [];

      const userIds = [
        ...new Set(rawComments.map((comment) => comment.user_id)),
      ];

      let profilesData: {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
      }[] = [];

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } =
          await supabase
            .from("profiles")
            .select(
              "id, username, display_name, avatar_url"
            )
            .in("id", userIds);

        if (profilesError) {
          console.error(
            "Profiles loading error:",
            profilesError.message,
            profilesError.details,
            profilesError.hint
          );
        } else {
          profilesData = profiles ?? [];
        }
      }

      const commentIds = rawComments.map(
        (comment) => comment.id
      );

      let likesData: {
        comment_id: string;
        user_id: string;
      }[] = [];

      if (commentIds.length > 0) {
        const { data: likes, error: likesError } =
          await supabase
            .from("video_comment_likes")
            .select("comment_id, user_id")
            .in("comment_id", commentIds);

        if (likesError) {
          console.error(
            "Comment likes loading error:",
            likesError.message,
            likesError.details,
            likesError.hint
          );
        } else {
          likesData = likes ?? [];
        }
      }

      const formattedComments: Comment[] = rawComments.map(
        (comment) => {
          const profile = profilesData.find(
            (item) => item.id === comment.user_id
          );

          const commentLikes = likesData.filter(
            (like) => like.comment_id === comment.id
          );

          return {
            id: comment.id,
            video_id: comment.video_id,
            user_id: comment.user_id,
            content: comment.content,
            parent_id: comment.parent_id,
            created_at: comment.created_at,
            profile: profile
              ? {
                  username: profile.username,
                  display_name: profile.display_name,
                  avatar_url: profile.avatar_url,
                }
              : null,
            likes: commentLikes.length,
            liked: user
              ? commentLikes.some(
                  (like) => like.user_id === user.id
                )
              : false,
          };
        }
      );

      setComments(formattedComments);
    } catch (error) {
      console.error("Comments loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [videoId]);

  async function addComment(
    parentId: string | null = null
  ) {
    const text = parentId
      ? replyText.trim()
      : newComment.trim();

    if (!text || submitting) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in to comment.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("video_comments")
        .insert({
          video_id: videoId,
          user_id: user.id,
          content: text,
          parent_id: parentId,
        });

      if (error) {
        console.error(
          "Comment creation error:",
          error.message,
          error.details,
          error.hint
        );

        alert("Failed to post comment.");
        return;
      }

      if (parentId) {
        setReplyText("");
        setReplyTo(null);
      } else {
        setNewComment("");
      }

      await loadComments();
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(commentId: string) {
    const text = editingText.trim();

    if (!text || !userId) {
      return;
    }

    const { error } = await supabase
      .from("video_comments")
      .update({
        content: text,
      })
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Comment edit error:",
        error.message,
        error.details,
        error.hint
      );

      alert("Failed to edit comment.");
      return;
    }

    setEditingId(null);
    setEditingText("");

    await loadComments();
  }

  async function deleteComment(commentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    const comment = comments.find(
      (item) => item.id === commentId
    );

    if (!comment || !userId) {
      return;
    }

    const isOwner = comment.user_id === userId;
    const isAuthor = authorId === userId;

    if (!isOwner && !isAuthor) {
      alert(
        "You do not have permission to delete this comment."
      );
      return;
    }

    const { error } = await supabase
      .from("video_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(
        "Comment delete error:",
        error.message,
        error.details,
        error.hint
      );

      alert("Failed to delete comment.");
      return;
    }

    await loadComments();
  }

  async function toggleLike(commentId: string) {
    if (!userId) {
      alert("Please sign in to like comments.");
      return;
    }

    const comment = comments.find(
      (item) => item.id === commentId
    );

    if (!comment) {
      return;
    }

    if (comment.liked) {
      const { error } = await supabase
        .from("video_comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Comment unlike error:",
          error.message,
          error.details,
          error.hint
        );
        return;
      }
    } else {
      const { error } = await supabase
        .from("video_comment_likes")
        .insert({
          comment_id: commentId,
          user_id: userId,
        });

      if (error) {
        console.error(
          "Comment like error:",
          error.message,
          error.details,
          error.hint
        );
        return;
      }
    }

    await loadComments();
  }

  function getDisplayName(comment: Comment) {
    return (
      comment.profile?.display_name ||
      comment.profile?.username ||
      "User"
    );
  }

  function getUsername(comment: Comment) {
    return comment.profile?.username || "user";
  }

  function getInitial(comment: Comment) {
    return getDisplayName(comment)
      .charAt(0)
      .toUpperCase();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function renderComment(
    comment: Comment,
    isReply = false
  ) {
    const replies = comments.filter(
      (item) => item.parent_id === comment.id
    );

    const isOwner = comment.user_id === userId;
    const isAuthor = comment.user_id === authorId;

    return (
      <div
        key={comment.id}
        className={isReply ? "ml-10 mt-4" : "mt-5"}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start gap-4">
            {comment.profile?.avatar_url ? (
              <img
                src={comment.profile.avatar_url}
                alt={getDisplayName(comment)}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                {getInitial(comment)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">
                  {getDisplayName(comment)}
                </span>

                <span className="text-sm text-zinc-600">
                  @{getUsername(comment)}
                </span>

                {isAuthor && (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
                    Author
                  </span>
                )}

                <span className="text-sm text-zinc-600">
                  {formatDate(comment.created_at)}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="mt-4">
                  <textarea
                    value={editingText}
                    onChange={(event) =>
                      setEditingText(event.target.value)
                    }
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        saveEdit(comment.id)
                      }
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {comment.content}
                </p>
              )}

              {editingId !== comment.id && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleLike(comment.id)
                    }
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      comment.liked
                        ? "bg-white text-black"
                        : "border border-white/10 text-zinc-500 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {comment.liked ? "♥" : "♡"}{" "}
                    {comment.likes}
                  </button>

                  {!isReply && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(
                          replyTo === comment.id
                            ? null
                            : comment.id
                        );
                        setReplyText("");
                      }}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-500 transition hover:bg-white/10 hover:text-white"
                    >
                      Reply
                    </button>
                  )}

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingText(
                          comment.content
                        );
                      }}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-500 transition hover:bg-white/10 hover:text-white"
                    >
                      Edit
                    </button>
                  )}

                  {(isOwner || isAuthor) && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteComment(comment.id)
                      }
                      className="rounded-full border border-red-500/10 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {replyTo === comment.id && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <textarea
                value={replyText}
                onChange={(event) =>
                  setReplyText(event.target.value)
                }
                placeholder={`Reply to ${getDisplayName(comment)}...`}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addComment(comment.id)
                  }
                  disabled={submitting}
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  {submitting
                    ? "Posting..."
                    : "Post reply"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText("");
                  }}
                  className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="border-l border-white/10">
            {replies.map((reply) =>
              renderComment(reply, true)
            )}
          </div>
        )}
      </div>
    );
  }

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_id
  );

  return (
    <section className="mt-12 border-t border-white/10 pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">
          Comments
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Share your thoughts, ask questions or reply to
          other creators.
        </p>
      </div>

      {userId ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <textarea
            value={newComment}
            onChange={(event) =>
              setNewComment(event.target.value)
            }
            placeholder="Write a comment..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => addComment()}
              disabled={
                submitting || !newComment.trim()
              }
              className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? "Posting..."
                : "Post comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center">
          <p className="text-sm text-zinc-400">
            Sign in to leave a comment.
          </p>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-zinc-500">
            Loading comments...
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) =>
            renderComment(comment)
          )
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
            <p className="text-sm text-zinc-400">
              No comments yet.
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Be the first to start the conversation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}