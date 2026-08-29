"use client";

import Link from "next/link";
import { getItem, getModifierGroups } from "@/lib/catalog";
import { useCart } from "@/lib/cart/context";
import { formatMoney, priceCartLine } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";
import { MediaSlot } from "@/components/ui/media-slot";
import { ButtonLink, Card, Container } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export function CartView() {
  const { lines, totals, ready, setQuantity, removeLine, clear } = useCart();

  // Nothing renders until the localStorage read lands, so the page never flashes
  // "your cart is empty" at someone who has a cart.
  if (!ready) {
    return (
      <Container className="py-24">
        <p className="text-content-muted">Loading your cart…</p>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container className="py-24 text-center">
        <p className="text-5xl" aria-hidden>
          🧋
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-content-muted">Pick a drink and we&apos;ll start it fresh.</p>
        <ButtonLink href="/menu" size="lg" className="mt-6">
          Browse the menu
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-12 lg:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Your order</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-semibold text-content-subtle underline underline-offset-4 hover:text-danger-fg"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <ul className="space-y-4">
          {lines.map((line) => (
            <CartRow
              key={line.lineId}
              line={line}
              onQuantityChange={(quantity) => setQuantity(line.lineId, quantity)}
              onRemove={() => removeLine(line.lineId)}
            />
          ))}
        </ul>

        <Card className="p-5 lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-bold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Estimated tax</dt>
              <dd className="tabular-nums">{formatMoney(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
            </div>
          </dl>

          <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
            Checkout
          </ButtonLink>
          <Link
            href="/menu"
            className="mt-3 block text-center text-sm font-semibold text-content-muted hover:text-content"
          >
            Add more items
          </Link>
        </Card>
      </div>
    </Container>
  );
}

function CartRow({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const item = getItem(line.itemId);
  // `loadCart` drops lines whose item has left the menu, so this is a guard for
  // an item removed mid-session rather than an expected state.
  if (!item) return null;

  const priced = priceCartLine(line);
  const groups = getModifierGroups(item.modifierGroupIds);

  // Flattened to a readable summary: "Large · 50% · Boba, Cheese foam".
  const chosen = groups
    .flatMap((group) =>
      (line.selections[group.id] ?? [])
        .map((optionId) => group.options.find((option) => option.id === optionId)?.name)
        .filter((name): name is string => Boolean(name)),
    )
    .join(" · ");

  return (
    <li>
      <Card className="flex gap-4 p-4">
        <MediaSlot
          src={item.image}
          alt={item.name}
          seed={item.slug}
          className="size-20 shrink-0 rounded-image"
          sizes="80px"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg leading-snug font-bold">{item.name}</h2>
            <p className="shrink-0 font-semibold tabular-nums">
              {formatMoney(priced?.lineTotal ?? 0)}
            </p>
          </div>

          {chosen ? <p className="mt-1 text-sm text-content-muted">{chosen}</p> : null}
          {line.notes ? (
            <p className="mt-1 text-sm text-content-subtle italic">“{line.notes}”</p>
          ) : null}

          <div className="mt-3 flex items-center gap-3">
            <QuantityStepper value={line.quantity} onChange={onQuantityChange} min={0} />
            <button
              type="button"
              onClick={onRemove}
              className="text-sm font-semibold text-content-subtle underline underline-offset-4 hover:text-danger-fg"
            >
              Remove
            </button>
          </div>
        </div>
      </Card>
    </li>
  );
}
