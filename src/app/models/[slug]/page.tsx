interface ModelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;

  const modelName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <a
          href="/#models"
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          ← Back to models
        </a>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />

          <div className="flex flex-col justify-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              3D Model
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {modelName}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
              A high-quality 3D model created for digital artists, designers
              and creators.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-2xl font-medium">$24</span>

              <span className="text-sm text-zinc-500">
                ★ 4.9
              </span>
            </div>

            <button className="mt-8 h-12 w-full max-w-sm rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
              Purchase model
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}