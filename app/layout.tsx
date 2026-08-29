import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { MobileCartBar } from "@/components/cart/mobile-cart-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemePicker } from "@/components/ui/theme-picker";
import { CartProvider } from "@/lib/cart/context";
import { SITE } from "@/lib/site-config";
import { ThemeProvider, ThemeScript } from "@/lib/theme/provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Headings.
 *
 * The logo wordmark is a soft, rounded, chunky sans, so the display face is
 * rounded to match. (An earlier pass used Source Serif because the Square
 * theme config names `fontset: "sourceserif"` — but that is the same default
 * config that carries the mint the brand never uses, so it is not evidence of
 * anything the shop chose.)
 */
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

/**
 * Gated at the boundary rather than inside the component: `process.env` is
 * inlined at build time, so when the flag is off the picker is not mounted and
 * its markup never reaches a customer.
 */
const showThemePicker = process.env.NEXT_PUBLIC_SHOW_THEME_PICKER === "1";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${baloo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <MobileCartBar />
            {showThemePicker ? <ThemePicker /> : null}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
