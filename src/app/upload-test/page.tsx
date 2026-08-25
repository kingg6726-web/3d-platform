"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadFile() {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You must be signed in.");
      setUploading(false);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("assets")
      .upload(filePath, file);

    if (error) {
      console.error(error);
      setMessage(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    setMessage("File uploaded successfully!");
    setUploading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Storage test
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Upload Test
          </h1>

          <p className="mt-3 text-zinc-400">
            Select a file and upload it to Supabase Storage.
          </p>

          <div className="mt-8">
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setMessage("");
              }}
              className="block w-full rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />
          </div>

          {file && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-500">
                Selected file
              </p>

              <p className="mt-1 break-all text-white">
                {file.name}
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <button
            onClick={uploadFile}
            disabled={uploading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>

          {message && (
            <p className="mt-5 text-sm text-zinc-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}