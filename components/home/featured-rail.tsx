"use client";

import { useState } from "react";
import { getPopularItems } from "@/lib/catalog";
import type { MenuItem } from "@/lib/types";
import { ItemCard } from "@/components/menu/item-card";
import { ItemCustomizer } from "@/components/menu/item-customizer";
import { Container, Eyebrow } from "@/components/ui/primitives";

/**
 * "Most ordered" — a horizontal scroller that breaks out of the page gutter on
 * small screens so cards run to the edge and read as swipeable.
 *
 * Cards open the same customiser as the menu page, so the home page is a real
 * ordering surface rather than a link farm.
 */
export function FeaturedRail() {
  const items = getPopularItems();
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  return (
    <section className="bg-surface py-16 sm:py-20">
      <Container>
        <Eyebrow>Most ordered</Eyebrow>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          What everyone gets
        </h2>
      </Container>

      <div className="mt-8 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max max-w-6xl gap-5 px-5 sm:px-8">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onSelect={setActiveItem} layout="rail" />
          ))}
        </div>
      </div>

      {activeItem ? (
        <ItemCustomizer
          key={activeItem.id}
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      ) : null}
    </section>
  );
}
