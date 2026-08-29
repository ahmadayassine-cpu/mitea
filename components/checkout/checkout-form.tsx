"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import { formatMoney } from "@/lib/pricing";
import { PICKUP_WINDOWS } from "@/lib/site-config";
import type { Order } from "@/lib/orders/types";
import { Button, ButtonLink, Card, Container } from "@/components/ui/primitives";

/**
 * Pickup checkout.
 *
 * The totals rendered here are the client's estimate. The server re-prices the
 * whole order from item ids on submit, so the confirmation page shows the
 * authoritative figure — if the two ever disagree, the server's wins by
 * construction rather than by convention.
 */
export function CheckoutForm() {
  const router = useRouter();
  const { lines, totals, ready, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupWindow, setPickupWindow] = useState<string>(PICKUP_WINDOWS[0].value);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <Container className="py-24">
        <p className="text-content-muted">Loading your order…</p>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <p className="mt-2 text-content-muted">Your cart is empty.</p>
        <ButtonLink href="/menu" size="lg" className="mt-6">
          Browse the menu
        </ButtonLink>
      </Container>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email },
          pickupWindow,
          notes: notes.trim() || undefined,
          // Ids and quantities only. Nothing about price is sent — see the
          // note at the top of app/api/orders/route.ts.
          lines: lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            selections: line.selections,
            notes: line.notes,
          })),
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "error" in body
            ? String((body as { error: unknown }).error)
            : "We couldn't place that order. Please try again.";
        setError(message);
        setSubmitting(false);
        return;
      }

      const order = (await response.json()) as Order;
      // Clear before navigating so a back-button return doesn't re-offer a cart
      // that has already been ordered.
      clear();
      router.push(`/checkout/${order.id}`);
    } catch {
      setError("We couldn't reach the kitchen. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-12 lg:py-16">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-content-muted">
        Pickup only. We&apos;ll have it ready at the counter under your name.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Your details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="name"
              label="Name"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
              required
            />
            <div className="sm:col-span-2">
              <Field
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="pickup" className="text-sm font-semibold">
              Pickup time
            </label>
            <select
              id="pickup"
              value={pickupWindow}
              onChange={(event) => setPickupWindow(event.target.value)}
              className="mt-1.5 w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm"
            >
              {PICKUP_WINDOWS.map((window) => (
                <option key={window.value} value={window.value}>
                  {window.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="order-notes" className="text-sm font-semibold">
              Notes for the shop <span className="font-normal text-content-subtle">(optional)</span>
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={280}
              rows={3}
              className="mt-1.5 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm placeholder:text-content-subtle"
              placeholder="Anything we should know?"
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-control bg-danger-bg px-4 py-3 text-sm font-medium text-danger-fg"
            >
              {error}
            </p>
          ) : null}
        </Card>

        <Card className="p-5 lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-bold">
            {lines.length} {lines.length === 1 ? "item" : "items"}
          </h2>

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

          <Button type="submit" size="lg" disabled={submitting} className="mt-5 w-full">
            {submitting ? "Placing order…" : "Place order"}
          </Button>

          <p className="mt-3 text-xs text-content-subtle">
            {/* Honest about what this build does: no card is taken here yet. */}
            Payment is taken at the counter when you collect.
          </p>
        </Card>
      </form>
    </Container>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-1.5 w-full rounded-control border border-border bg-surface px-3 py-2.5 text-sm"
      />
    </div>
  );
}
