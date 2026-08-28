export const dynamic = "force-dynamic";

const plans = [
  {
    name: "Free",
    description: "For everyone discovering the world of 3D.",
    features: [
      "Discover 3D assets",
      "Download free assets",
      "Save favorites",
      "Explore creators",
    ],
    featured: false,
  },
  {
    name: "Creator",
    description: "For artists who want to create and share more.",
    features: [
      "Everything in Free",
      "More creator tools",
      "Enhanced profile",
      "Advanced creator features",
    ],
    featured: true,
  },
  {
    name: "Professional",
    description: "For serious artists and professional workflows.",
    features: [
      "Everything in Creator",
      "Advanced tools",
      "Premium features",
      "Professional creator features",
    ],
    featured: false,
  },
];

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            3D Platform
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Subscriptions
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            More tools, more possibilities, and more ways to create.
            Choose the plan that fits your creative journey.
          </p>

          <div className="mx-auto mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-zinc-300">
            ✦ Subscriptions are coming soon
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-7 transition-transform duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? "border-white/30 bg-white/[0.08] shadow-2xl shadow-white/[0.05]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.featured && (
                <div className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-zinc-200">
                  Most Popular
                </div>
              )}

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {plan.name}
                </p>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                  {plan.name}
                </h2>

                <p className="mt-4 min-h-[56px] text-sm leading-6 text-zinc-400">
                  {plan.description}
                </p>
              </div>

              <div className="my-8 h-px bg-white/10" />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <span className="mt-0.5 text-zinc-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <div
                  className={`flex w-full items-center justify-center rounded-full py-3 text-sm font-medium ${
                    plan.featured
                      ? "bg-white text-black"
                      : "border border-white/10 text-zinc-300"
                  }`}
                >
                  Coming Soon
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-20 max-w-3xl text-center">
          <p className="text-sm leading-6 text-zinc-500">
            We are building the next generation of tools for 3D artists.
            Subscriptions will become available as the platform grows.
          </p>
        </section>
      </div>
    </main>
  );
}