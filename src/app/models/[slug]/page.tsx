import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import DownloadButton from "./DownloadButton";

type ModelPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ModelPage({
  params,
}: ModelPageProps) {
  const { slug } = await params;

  const { data: model, error } = await supabase
    .from("assets")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !model) {
    notFound();
  }

  let imageUrl: string | null = null;

  if (model.image) {
    const { data: imageData } = await supabase.storage
      .from("assets")
      .createSignedUrl(model.image, 60 * 60);

    imageUrl = imageData?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <a
          href="/models"
          className="inline-flex items-center text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Back to Models
        </a>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={model.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                  <span className="text-sm text-zinc-600">
                    No preview available
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              3D Model
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {model.name}
            </h1>

            <p className="mt-3 text-zinc-500">
              by {model.creator}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">
                {model.category || "Uncategorized"}
              </span>

              <span className="text-lg font-medium">
                {model.price === "0" ? "Free" : model.price}
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium">
                Description
              </h2>

              <p className="mt-3 leading-7 text-zinc-400">
                {model.description || "No description provided."}
              </p>
            </div>

            <DownloadButton filePath={model.file ?? null} />
          </div>
        </div>
      </div>
    </main>
  );
}