export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            The marketplace for digital 3D
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-8xl">
            Create.
            <br />
            Share.
            <br />
            Sell 3D.
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Discover high-quality 3D models, support independent creators,
            and build your digital world.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#models"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Explore models
            </a>

            <a
              href="#create"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Start creating
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}