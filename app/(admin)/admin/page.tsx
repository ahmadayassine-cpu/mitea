import type { Metadata } from "next";
import { Card, Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Owner tools",
  robots: { index: false, follow: false },
};

/**
 * Placeholder reserving the owner-management surface.
 *
 * Deliberately NOT built — owner management is a later phase. This exists only
 * so the route group has a home and a future admin layout has somewhere to
 * attach without moving the public pages around. There is no authentication
 * here because there is nothing yet to protect; auth is the first thing the
 * real build needs.
 */
export default function AdminPlaceholderPage() {
  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="text-4xl" aria-hidden>
          🔧
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold">Owner tools — not built yet</h1>
        <p className="mt-3 text-content-muted text-pretty">
          Menu editing, order management and reporting land in a later phase, along with
          the sign-in that should gate them. Orders placed on the site are currently
          written to <code className="font-mono text-sm">.data/orders.json</code>.
        </p>
      </Card>
    </Container>
  );
}
