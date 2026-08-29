import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderStore } from "@/lib/orders/store";
import { formatMoney } from "@/lib/pricing";
import { SITE, formattedAddress } from "@/lib/site-config";
import { ButtonLink, Card, Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

/**
 * Order confirmation.
 *
 * Reads the store directly rather than fetching its own `/api/orders/[id]` —
 * this is a Server Component, so a round trip through HTTP back into the same
 * process would buy nothing.
 *
 * Everything shown comes from the stored order, which recorded names and prices
 * at the time of purchase. It renders correctly even if the menu changes later.
 */
export default async function ConfirmationPage({
  params,
}: PageProps<"/checkout/[orderId]">) {
  const { orderId } = await params;
  const order = await getOrderStore().get(orderId);

  if (!order) notFound();

  return (
    <Container className="py-14 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-card bg-success-bg px-6 py-5 text-success-fg">
          <p className="text-3xl" aria-hidden>
            ✅
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Order received</h1>
          <p className="mt-1">
            Thanks, {order.customer.name}. We&apos;ve started on it.
          </p>
        </div>

        <Card className="mt-6 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-sm text-content-muted">Pickup code</p>
              <p className="font-display text-3xl font-bold tracking-wide">
                {order.pickupCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-content-muted">Ready</p>
              <p className="font-semibold">{order.pickupWindowLabel}</p>
            </div>
          </div>

          <p className="mt-4 border-t border-border pt-4 text-sm text-content-muted">
            Give that code at the counter at {formattedAddress()}. Payment is taken on
            collection.
          </p>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-display text-xl font-bold">Your order</h2>

          <ul className="mt-4 divide-y divide-border">
            {order.lines.map((line, index) => (
              <li key={`${line.itemId}-${index}`} className="flex gap-4 py-4">
                <span className="font-semibold tabular-nums text-content-muted">
                  {line.quantity}×
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{line.itemName}</p>
                  {line.options.length > 0 ? (
                    <p className="mt-0.5 text-sm text-content-muted">
                      {line.options.map((option) => option.optionName).join(" · ")}
                    </p>
                  ) : null}
                  {line.notes ? (
                    <p className="mt-0.5 text-sm text-content-subtle italic">
                      “{line.notes}”
                    </p>
                  ) : null}
                </div>
                <span className="font-semibold tabular-nums">
                  {formatMoney(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-content-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-content-muted">Tax</dt>
              <dd className="tabular-nums">{formatMoney(order.tax)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total)}</dd>
            </div>
          </dl>

          {order.notes ? (
            <p className="mt-4 border-t border-border pt-4 text-sm text-content-muted">
              <span className="font-semibold text-content">Notes: </span>
              {order.notes}
            </p>
          ) : null}
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/menu" size="lg">
            Order something else
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Back to {SITE.name}
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
