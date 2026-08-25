"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Model");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  async function publishAsset() {
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter an asset name.");
      return;
    }

    if (!preview) {
      setMessage("Please select a preview image.");
      return;
    }

    if (!assetFile) {
      setMessage("Please select the asset file.");
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

      const timestamp = Date.now();

      const previewPath = `${user.id}/${timestamp}-preview-${preview.name}`;
      const assetPath = `${user.id}/${timestamp}-${assetFile.name}`;

      const { error: previewError } = await supabase.storage
        .from("assets")
        .upload(previewPath, preview);

      if (previewError) {
        throw previewError;
      }

      const { error: assetError } = await supabase.storage
        .from("assets")
        .upload(assetPath, assetFile);

      if (assetError) {
        throw assetError;
      }

      const slug =
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") +
        "-" +
        timestamp;

      const { error: databaseError } = await supabase
        .from("assets")
        .insert({
          slug,
          name: name.trim(),
          type,
          category: category.trim(),
          creator: "King",
          price: price || "0",
          rating: "0",
          description: description.trim(),
          image: previewPath,
          file: assetPath,
          user_id: user.id,
        });

      if (databaseError) {
        throw databaseError;
      }

      setMessage("Asset published successfully!");

      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setPreview(null);
      setAssetFile(null);
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
              Upload Asset
            </h1>

            <p className="mt-3 text-zinc-400">
              Share your 3D work with the community.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <label className="text-sm text-zinc-400">
                Asset name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dragon Obsidian"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-400">
                  Type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                >
                  <option value="Model">Model</option>
                  <option value="Material">Material</option>
                  <option value="Brush">Brush</option>
                  <option value="HDRI">HDRI</option>
                  <option value="Texture">Texture</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">
                  Category
                </label>

                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Environment"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your asset..."
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Preview image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPreview(e.target.files?.[0] || null)
                }
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
              />

              {preview && (
                <p className="mt-2 text-sm text-zinc-500">
                  Selected: {preview.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Asset file
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setAssetFile(e.target.files?.[0] || null)
                }
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
              />

              {assetFile && (
                <p className="mt-2 text-sm text-zinc-500">
                  Selected: {assetFile.name}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={publishAsset}
              disabled={publishing}
              className="w-full rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Asset"}
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