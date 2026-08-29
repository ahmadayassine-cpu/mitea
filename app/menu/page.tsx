import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { Container } from "@/components/ui/primitives";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Menu",
  description: `Browse the full ${SITE.name} menu — milk teas, fruit teas, Chizu cheese-foam drinks, smoothies and mochi donuts. Order online for pickup.`,
};

export default function MenuPage() {
  return (
    <>
      <div className="bg-surface-container py-12 sm:py-16">
        <Container>
          <h1 className="font-display text-4xl font-bold text-balance sm:text-5xl">
            Order online
          </h1>
          <p className="mt-3 max-w-xl text-lg text-content-muted text-pretty">
            Pick it up at the counter. Everything is made to order — sugar, ice and
            toppings are yours to choose.
          </p>
        </Container>
      </div>

      <MenuBrowser />
    </>
  );
}
