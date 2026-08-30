import type { MenuCategory } from "@/lib/types";

/**
 * Menu categories, in the order the source document lists them — which is also
 * the order they appear on /menu and in the sticky category nav.
 */
export const CATEGORIES: MenuCategory[] = [
  {
    id: "mochi-donuts",
    slug: "mochi-donuts",
    name: "Mochi Donuts",
    description: "Chewy, glazed and fried to order. Boxed by the three, six or dozen.",
    image: "/images/mochi-donuts.jpg",
    sortOrder: 1,
  },
  {
    id: "brown-sugar",
    slug: "brown-sugar-series",
    name: "Brown Sugar Series",
    description: "Slow-cooked syrup striped down the cup, over fresh-boiled pearls.",
    image: "/images/brown-sugar-series.jpg",
    sortOrder: 2,
  },
  {
    id: "energy",
    slug: "energy-series",
    name: "Energy Series",
    description: "Fruit infusions with a lift, built for the afternoon slump.",
    image: "/images/energy-series.jpg",
    sortOrder: 3,
  },
  {
    id: "fresh-fruit-tea",
    slug: "fresh-fruit-tea",
    name: "Fresh Fruit Tea",
    description: "Real fruit shaken into green tea. Light, tart and cold.",
    image: "/images/fresh-fruit-tea.jpg",
    sortOrder: 4,
  },
  {
    id: "milk-tea",
    slug: "milk-tea",
    name: "Milk Tea",
    description: "The classics, brewed by the batch through the day.",
    image: "/images/milk-tea.jpg",
    sortOrder: 5,
  },
  {
    id: "smoothie",
    slug: "smoothie-series",
    name: "Smoothie Series",
    description: "Blended thick. Add mitea and it becomes dessert.",
    image: "/images/smoothie-series.jpg",
    sortOrder: 6,
  },
  {
    id: "tea",
    slug: "tea-series",
    name: "Tea Series",
    description: "Straight tea, no milk. The leaf on its own terms.",
    image: "/images/tea-series.jpg",
    sortOrder: 7,
  },
  {
    id: "chizu",
    slug: "chizu-series",
    name: "Chizu Series",
    description: "Our signature cheese-foam caps, whipped fresh and salted just enough.",
    image: null,
    sortOrder: 8,
  },
];
