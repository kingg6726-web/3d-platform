export type AssetType =
  | "model"
  | "material"
  | "hdri"
  | "texture"
  | "brush";

export interface Model {
  slug: string;
  name: string;
  type: AssetType;
  category: string;
  creator: string;
  price: string;
  rating: string;
  description: string;
  image: string;
}

export const models: Model[] = [
  {
    slug: "donut",
    name: "Donut",
    type: "model",
    category: "Models",
    creator: "Kingg",
    price: "$0",
    rating: "—",
    description: "A 3D donut model created for the marketplace.",
    image: "/images/donut.jpg",
  },

  {
    slug: "dragon-obsidian",
    name: "Dragon Obsidian",
    type: "material",
    category: "Materials",
    creator: "Kingg",
    price: "$0",
    rating: "—",
    description: "A custom Dragon Obsidian material.",
    image: "",
  },

  {
    slug: "cyberpunk-helmet",
    name: "Cyberpunk Helmet",
    type: "model",
    category: "Models",
    creator: "Creator",
    price: "$24",
    rating: "4.9",
    description: "A futuristic cyberpunk helmet.",
    image: "",
  },

  {
    slug: "modern-chair",
    name: "Modern Chair",
    type: "model",
    category: "Models",
    creator: "Studio North",
    price: "$18",
    rating: "4.8",
    description: "A modern furniture asset.",
    image: "",
  },

  {
    slug: "sci-fi-vehicle",
    name: "Sci-Fi Vehicle",
    type: "model",
    category: "Models",
    creator: "Daniel Park",
    price: "$32",
    rating: "5.0",
    description: "A futuristic science-fiction vehicle.",
    image: "",
  },
];