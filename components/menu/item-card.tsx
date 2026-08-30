"use client";

import { hasChoices } from "@/lib/catalog/catalog";
import { formatMoney } from "@/lib/pricing";
import type { MenuItem } from "@/lib/types";
import { MediaSlot } from "@/components/ui/media-slot";
import { Badge } from "@/components/ui/primitives";

const TAG_LABELS: Record<string, string> = {
  popular: "Most ordered",
  new: "New",
  vegan: "Vegan",
  seasonal: "Seasonal",
};

export function ItemCard({
  item,
  onSelect,
  layout = "grid",
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  /** `rail` is the fixed-width variant used by the home page's horizontal scroller. */
  layout?: "grid" | "rail";
}) {
  // Sold out outranks a tag: "Most ordered" on something nobody can order
  // reads as a bug.
  const badge = item.tags[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      disabled={item.soldOut}
      className={`group flex flex-col overflow-hidden rounded-card border border-border-soft bg-surface-raised text-left shadow-card transition-all duration-200 ${
        layout === "rail" ? "w-64 shrink-0" : "w-full"
      } ${
        item.soldOut
          ? "cursor-not-allowed opacity-55 grayscale"
          : "hover:-translate-y-0.5 hover:border-border-highlight hover:shadow-card-hover"
      }`}
    >
      <div className="relative">
        <MediaSlot
          src={item.image}
          alt={item.name}
          seed={item.slug}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
        />
        <span className="absolute top-3 left-3">
          {item.soldOut ? (
            <Badge tone="neutral">Sold out</Badge>
          ) : badge ? (
            <Badge tone={badge === "vegan" ? "success" : "accent"}>
              {TAG_LABELS[badge] ?? badge}
            </Badge>
          ) : null}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug font-bold text-balance">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-content-muted text-pretty">
          {item.description}
        </p>
        <p className="mt-3 font-semibold tabular-nums">
          {formatMoney(item.basePrice)}
          {/* The trailing "+" is the same convention the reference site uses:
              this price is a starting point, options can raise it. */}
          {hasChoices(item) ? <span className="text-content-subtle"> +</span> : null}
        </p>
      </div>
    </button>
  );
}
