import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AuthorsPage() {
  const { data: assets, error } = await supabase
    .from("assets")
    .select("creator");

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load authors
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const authors = Array.from(
    new Set(
      (assets ?? [])
        .map((asset) => asset.creator)
        .filter(Boolean)
    )
  );

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            3D Marketplace
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Authors
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Discover creators and explore their digital work.
          </p>
        </div>

        {authors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <article
                key={author}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-semibold text-black">
                  {author.charAt(0).toUpperCase()}
                </div>

                <h2 className="mt-5 text-xl font-medium">
                  {author}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  3D Creator
                </p>

                <Link
                  href={`/authors/${encodeURIComponent(author)}`}
                  className="mt-6 block w-full rounded-full border border-white/10 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                >
                  View profile
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium">
              No authors yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Creators will appear here when they publish assets.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}