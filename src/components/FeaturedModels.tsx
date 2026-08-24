"use client";

import { useState } from "react";

const models = [
  {
    name: "Cyberpunk Helmet",
    category: "Characters",
    creator: "Alex Morgan",
    price: "$24",
    rating: "4.9",
  },
  {
    name: "Modern Chair",
    category: "Furniture",
    creator: "Studio North",
    price: "$18",
    rating: "4.8",
  },
  {
    name: "Sci-Fi Vehicle",
    category: "Vehicles",
    creator: "Daniel Park",
    price: "$32",
    rating: "5.0",
  },
];

export default function FeaturedModels() {
  const [query, setQuery] = useState("");

  const filteredModels = models.filter((model) => {
    const searchText = `${model.name} ${model.category} ${model.creator}`.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  return (
    <section id="models" className="px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Discover
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Featured models
            </h2>
          </div>

          <a
            href="#models"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            View all models →
          </a>
        </div>

        <div className="mb-8 w-full max-w-2xl">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 3D models..."
            className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20"
          />
        </div>

        {filteredModels.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <article
                key={model.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-white">
                        {model.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {model.category}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        by {model.creator}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-white">
                      {model.price}
                    </span>
                  </div>

                  <div className="mb-4 text-xs text-zinc-500">
                    ★ {model.rating}
                  </div>

                  <a
  href={`/models/${model.name.toLowerCase().replaceAll(" ", "-")}`}
  className="flex w-full items-center justify-center rounded-full border border-white/10 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white hover:text-black"
>
  View model
</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              No models found
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search term.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}