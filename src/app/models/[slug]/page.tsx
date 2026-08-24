import { supabase } from "@/lib/supabase";

interface ModelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;

  const { data: model, error } = await supabase
    .from("assets")
    .select("*")
    .eq("slug", slug)
    .eq("type", "model")
    .single();

  if (error || !model) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">Asset not found</h1>

          <p className="mt-3 text-zinc-500">
            The asset you are looking for does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
            {model.image ? (
              <img
                src={model.image}
                alt={model.name}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              {model.category}
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {model.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              by {model.creator}
            </p>

            <p className="mt-8 max-w-xl leading-7 text-zinc-400">
              {model.description}
            </p>

            <div className="mt-8 flex items-center gap-6">
              <span className="text-2xl font-medium">{model.price}</span>

              <span className="text-sm text-zinc-500">
                ★ {model.rating}
              </span>
            </div>

            <button className="mt-8 h-12 rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
              Get this asset
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}