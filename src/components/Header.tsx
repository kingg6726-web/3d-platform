export default function Header() {
  return (
    <header className="w-full border-b border-white/10">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
        >
          3D Platform
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#models"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Models
          </a>

          <a
            href="#creators"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Creators
          </a>

          <a
            href="#videos"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Videos
          </a>
        </nav>

        <button className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
          Sign in
        </button>
      </div>
    </header>
  );
}