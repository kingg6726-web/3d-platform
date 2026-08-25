"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type DownloadButtonProps = {
  filePath: string | null;
};

export default function DownloadButton({
  filePath,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!filePath || loading) {
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.storage
        .from("assets")
        .download(filePath);

      if (error || !data) {
        console.error("DOWNLOAD ERROR:", error);
        return;
      }

      const blobUrl = URL.createObjectURL(data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filePath.split("/").pop() || "download";
      document.body.appendChild(link);

      link.click();

      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!filePath) {
    return (
      <button
        type="button"
        disabled
        className="mt-10 w-full cursor-not-allowed rounded-full bg-zinc-800 px-6 py-3.5 text-sm font-medium text-zinc-500"
      >
        File unavailable
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="mt-10 flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
    >
      {loading ? "Downloading..." : "Download"}
    </button>
  );
}