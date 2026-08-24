import { supabase } from "@/lib/supabase";

export default async function ModelsPage() {
  const { data: modelAssets, error } = await supabase
    .from("assets")
    .select("*")
    .eq("type", "model")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10">
            <h1 className="text-2xl font-semibold">
              Unable to load models
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            3D Marketplace
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Models
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
            Discover 3D models created by independent artists and creators.
          </p>
        </div>

        {modelAssets && modelAssets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modelAssets.map((model) => (
              <article
                key={model.slug}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-zinc-900">
                  {model.image ? (
                    <img
                      src={model.image}
                      alt={model.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium">
                        {model.name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        by {model.creator}
                      </p>
                    </div>

                    <span className="text-sm font-medium">
                      {model.price}
                    </span>
                  </div>

                  <a
                    href={`/models/${model.slug}`}
                    className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
                  >
                    View model
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium">
              No models yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              New models will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}