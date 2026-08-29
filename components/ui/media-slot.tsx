import Image from "next/image";

/**
 * The image slot used everywhere on the site.
 *
 * Most of the menu has no photography yet, so a slot without a `src` falls
 * back to a branded placeholder: a gradient mixed from the active preset's own
 * tokens, with an emoji picked from the item's name. The point is that the
 * *layout* is final — when real photos arrive, setting `src` swaps them in with
 * no other change, and nothing has to be re-laid-out around a different aspect
 * ratio.
 *
 * The gradient is seeded from `seed`, so each item gets a visibly different
 * tile rather than forty identical rectangles, while still being drawn purely
 * from `--primary-soft` and `--accent-soft` — swap the theme and the whole grid
 * follows.
 */

interface MediaSlotProps {
  src?: string | null;
  alt: string;
  /** Stable string — a slug — that decides the placeholder's gradient. */
  seed: string;
  /** Emoji override. Otherwise inferred from `alt`. */
  glyph?: string;
  className?: string;
  /** Passed to next/image; use for above-the-fold art. */
  priority?: boolean;
  sizes?: string;
}

export function MediaSlot({
  src,
  alt,
  seed,
  glyph,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: MediaSlotProps) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const mix = 20 + (hash(seed) % 61); // 20–80%, so neither token ever vanishes
  const angle = 120 + (hash(`${seed}-angle`) % 121); // 120–240deg

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, color-mix(in oklab, var(--primary-soft) ${mix}%, var(--accent-soft)), color-mix(in oklab, var(--surface-container) ${100 - mix}%, var(--primary-soft)))`,
        // The glyph is sized in `cqi` so one placeholder works at every scale,
        // from a 56px cart thumbnail to a full-bleed hero.
        containerType: "inline-size",
      }}
    >
      <span aria-hidden className="text-[clamp(2rem,18cqi,5rem)] opacity-80 select-none">
        {glyph ?? glyphFor(alt)}
      </span>
    </div>
  );
}

/** djb2. Small, stable across runs, and good enough to spread 44 slugs. */
function hash(value: string): number {
  let h = 5381;
  for (let i = 0; i < value.length; i += 1) {
    h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * First matching keyword wins, so order matters: "Banana Strawberry" should
 * read as banana, and "Chizu Strawberry" as cheese foam.
 */
const GLYPHS: Array<[RegExp, string]> = [
  [/donut|mochi/i, "🍩"],
  [/chizu|cheese|brûlée|brulee/i, "🧁"],
  [/banana/i, "🍌"],
  [/blueberry/i, "🫐"],
  [/strawberry/i, "🍓"],
  [/peach/i, "🍑"],
  [/pineapple|colada/i, "🍍"],
  [/mango/i, "🥭"],
  [/coconut/i, "🥥"],
  [/pear/i, "🍐"],
  [/lemon/i, "🍋"],
  [/raspberry|energy|infusion/i, "⚡"],
  [/matcha/i, "🍵"],
  [/taro/i, "🟣"],
  [/brown sugar|caramel|hazelnut/i, "🟤"],
  [/smoothie/i, "🥤"],
  [/milk tea|latte|milk/i, "🧋"],
  [/tea/i, "🍵"],
];

function glyphFor(text: string): string {
  for (const [pattern, glyph] of GLYPHS) {
    if (pattern.test(text)) return glyph;
  }
  return "🧋";
}
