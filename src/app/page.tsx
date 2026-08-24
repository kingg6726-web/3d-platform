import FeaturedModels from "@/components/FeaturedModels";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Hero />
      <FeaturedModels />
    </main>
  );
}