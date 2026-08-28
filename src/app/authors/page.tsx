import { supabase } from "@/lib/supabase";
import AuthorsSearch from "@/components/AuthorsSearch";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default async function AuthorsPage() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, bio"
    )
    .not("username", "is", null)
    .order("created_at", {
      ascending: false,
    });

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

        {profiles && profiles.length > 0 ? (
          <AuthorsSearch
            profiles={profiles as Profile[]}
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium">
              No authors yet
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Creators will appear here when they create a profile.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}