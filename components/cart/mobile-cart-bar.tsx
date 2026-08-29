"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { formatMoney } from "@/lib/pricing";

/**
 * Sticky "view cart" bar for small screens.
 *
 * Hidden on the cart and checkout routes, where it would sit on top of the very
 * thing it links to.
 */
export function MobileCartBar() {
  const { count, totals, ready } = useCart();
  const pathname = usePathname();

  const onOrderingRoute = pathname === "/cart" || pathname.startsWith("/checkout");
  if (!ready || count === 0 || onOrderingRoute) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-raised p-3 shadow-overlay lg:hidden">
      <Link
        href="/cart"
        className="flex items-center justify-between gap-3 rounded-control bg-primary px-5 py-3 font-semibold text-on-primary"
      >
        <span>
          View cart · {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="tabular-nums">{formatMoney(totals.subtotal)}</span>
      </Link>
    </div>
  );
}
