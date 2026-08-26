import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthorPageProps = {
  params: Promise<{
    creator: string;
  }>;
};

export default async function AuthorPage({
  params,
}: AuthorPageProps) {
  const { creator } = await params;
  const authorName = decodeURIComponent(creator);

  const { data: assets, error } = await supabase
    .from("assets")
    .select("id, slug, name, type, category, price, image")
    .eq("creator", authorName);

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load author
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!assets || assets.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/authors"
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Back to Authors
        </Link>

        <section className="mt-10 border-b border-white/10 pb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-semibold text-black">
              {authorName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                3D Creator
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {authorName}
              </h1>

              <p className="mt-3 text-zinc-500">
                {assets.length}{" "}
                {assets.length === 1 ? "asset" : "assets"} published
              </p>
            </div>
          </div>
        </section>

        <section className="pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">
              Published assets
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <Link
                key={asset.id}
                href={`/models/${asset.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                  {asset.image ? (
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                      No preview
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-medium">
                    {asset.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-between gap-4 text-sm text-zinc-500">
                    <span>
                      {asset.category || asset.type || "Asset"}
                    </span>

                    <span className="text-zinc-300">
                      {asset.price === 0
                        ? "Free"
                        : `$${asset.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}