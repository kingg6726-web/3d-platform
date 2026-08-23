export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <section className="flex flex-1 items-center justify-center px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
              3D Platform
            </p>

            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Create.
              <br />
              Share.
              <br />
              <span className="text-zinc-400">Build the future of 3D.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              A platform built for 3D artists, designers and creators to
              discover, share and sell their work.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button className="h-12 rounded-full bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                Explore models
              </button>

              <button className="h-12 rounded-full border border-white/15 px-7 text-sm font-medium text-white transition-colors hover:bg-white/5">
                Start creating
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}