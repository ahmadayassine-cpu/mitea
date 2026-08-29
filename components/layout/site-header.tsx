"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/context";
import { SITE } from "@/lib/site-config";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native dialog from state so a route change can close it too.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/90 backdrop-blur">
      <div className="bg-surface-inverse py-1.5 text-center text-xs text-on-inverse">
        {SITE.hoursSummary} · Order ahead and skip the line
      </div>

      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-control px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary-soft text-on-primary-soft"
                    : "text-content-muted hover:bg-surface-sunken hover:text-content"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-control border border-border-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-border-highlight hover:bg-surface-sunken"
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {/* `ready` gates the badge: the server always renders 0, so showing a
                stored count before hydration would be a mismatch. */}
            {ready && count > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-pill bg-accent text-[0.6875rem] font-bold text-on-accent tabular-nums">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
            <span className="sr-only">
              {ready && count > 0 ? `${count} items in cart` : "Cart is empty"}
            </span>
          </Link>

          <Link
            href="/menu"
            className="hidden rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover sm:inline-flex"
          >
            Order online
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex size-10 items-center justify-center rounded-control text-xl hover:bg-surface-sunken lg:hidden"
          >
            ☰
          </button>
        </div>
      </Container>

      <dialog
        ref={dialogRef}
        onClose={() => setMenuOpen(false)}
        className="m-0 ml-auto h-full max-h-none w-[min(20rem,85vw)] max-w-none bg-surface-raised p-0 text-content"
      >
        <div className="flex h-full flex-col p-5">
          <div className="mb-6 flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-control text-xl hover:bg-surface-sunken"
            >
              ✕
            </button>
          </div>

          {/* Each link closes the drawer on click rather than an effect watching
              `pathname`: navigating is the event, so handling it here avoids a
              state update during render-after-navigation. */}
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-control px-3 py-3 font-semibold hover:bg-surface-sunken"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/menu"
            onClick={() => setMenuOpen(false)}
            className="mt-auto rounded-control bg-primary px-5 py-3 text-center font-semibold text-on-primary"
          >
            Order online
          </Link>
        </div>
      </dialog>
    </header>
  );
}
