export default function HdriPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          3D Marketplace
        </p>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          HDRI
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500 sm:text-lg">
          HDR environments for lighting and rendering 3D scenes.
        </p>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-lg font-medium">
            No HDRI yet
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            New HDR environments will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}