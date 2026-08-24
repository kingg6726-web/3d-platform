import { supabase } from "@/lib/supabase";

export default async function SupabaseTestPage() {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">
            Supabase connection error
          </h1>

          <p className="mt-4 text-red-400">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Supabase test
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Database connection works
        </h1>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-medium">
            {data.name}
          </h2>

          <p className="mt-2 text-zinc-400">
            Creator: {data.creator}
          </p>

          <p className="mt-1 text-zinc-400">
            Type: {data.type}
          </p>

          <p className="mt-1 text-zinc-400">
            Price: {data.price}
          </p>
        </div>
      </div>
    </main>
  );
}