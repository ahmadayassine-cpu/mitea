"use client";

import { useEffect, useRef, useState } from "react";
import { getMenu } from "@/lib/catalog";
import type { MenuItem } from "@/lib/types";
import { Container } from "@/components/ui/primitives";
import { ItemCard } from "./item-card";
import { ItemCustomizer } from "./item-customizer";

/**
 * The full menu: sticky category nav over one long scroller, matching the
 * reference site's shape.
 *
 * The catalog is imported rather than passed as props because the cart already
 * pulls it into the client bundle to price lines — passing it down again would
 * serialise all 44 items into the RSC payload for no gain.
 */
export function MenuBrowser() {
  const menu = getMenu();
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState(menu[0]?.category.slug ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll-spy. The negative top margin accounts for the two sticky bars above
  // the content, so a section counts as "current" once it clears them rather
  // than the moment it touches the viewport edge.
  useEffect(() => {
    const sections = menu
      .map(({ category }) => document.getElementById(category.slug))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveCategory(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [menu]);

  // Keep the active chip in view as the page scrolls past categories.
  useEffect(() => {
    const chip = navRef.current?.querySelector<HTMLElement>(`[data-slug="${activeCategory}"]`);
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeCategory]);

  return (
    <>
      <div
        ref={navRef}
        className="sticky top-[6.5rem] z-30 border-b border-border bg-surface/95 backdrop-blur"
      >
        <Container className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menu.map(({ category }) => (
            <a
              key={category.slug}
              href={`#${category.slug}`}
              data-slug={category.slug}
              aria-current={activeCategory === category.slug ? "true" : undefined}
              className={`shrink-0 rounded-control px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === category.slug
                  ? "bg-primary text-on-primary"
                  : "bg-surface-raised text-content-muted hover:bg-primary-soft hover:text-on-primary-soft"
              }`}
            >
              {category.name}
            </a>
          ))}
        </Container>
      </div>

      <Container className="pb-20">
        {menu.map(({ category, items }) => (
          <section
            key={category.id}
            id={category.slug}
            // Anchors land under two sticky bars; this pushes the heading clear.
            className="scroll-mt-44 pt-12"
            aria-labelledby={`${category.slug}-heading`}
          >
            <h2
              id={`${category.slug}-heading`}
              className="font-display text-2xl font-bold sm:text-3xl"
            >
              {category.name}
            </h2>
            <p className="mt-1 max-w-2xl text-content-muted text-pretty">
              {category.description}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onSelect={setActiveItem} />
              ))}
            </div>
          </section>
        ))}
      </Container>

      {/* Keyed so reopening a different item resets the dialog's own state. */}
      {activeItem ? (
        <ItemCustomizer
          key={activeItem.id}
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      ) : null}
    </>
  );
}
