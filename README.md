# Mitea

Online ordering site for Mitea — a boba tea and mochi donut shop. Customers
browse the menu, customise drinks (sugar, ice, size, milk, toppings) and place
a pickup order.

Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen && tsc --noEmit` |

To preview the brand presets, start the dev server with
`NEXT_PUBLIC_SHOW_THEME_PICKER=1` and a switcher appears in the bottom-right.
It is not part of the customer-facing site.

## How it's put together

```
app/                 routes (home, menu, cart, checkout, content pages, /api/orders)
components/          UI, grouped by where it's used
lib/catalog/         the menu: categories, items, modifier groups
lib/cart/            cart state (useReducer + localStorage)
lib/orders/          order persistence behind the OrderStore interface
lib/pricing.ts       pricing — shared by the client cart AND the server
lib/site-config.ts   hours, address, phone, tax rate
styles/tokens.css    the design token system
docs/                notes on planned work
```

Three things worth knowing before changing anything:

**Money is integer cents everywhere.** Dollars appear only in `formatMoney`.

**Prices are computed on the server.** The checkout request carries item ids,
option ids and quantities — nothing about price. `app/api/orders/route.ts`
re-prices the whole order from the catalog and ignores anything the client
claims a drink costs. Both sides call the same `lib/pricing.ts`, so the number
on screen and the number charged cannot drift apart.

**Components never name a colour.** See below.

## Theming

`styles/tokens.css` has three layers:

1. **Primitives** — the only literal hex values in the codebase.
2. **Semantic tokens** — `--primary`, `--surface-raised`, `--content-muted`…
   This is the only layer a theme overrides, and the only layer a component may
   reference.
3. **Presets** — `[data-theme="mitea" | "blossom" | "matcha" | "taro"]`,
   each re-declaring a subset of layer 2. A preset must set `--on-primary`
   alongside `--primary` — changing one without the other is how a themeable
   site ends up with unreadable buttons.

The default preset, **mitea**, is sampled from the shop's own logo
(`public/images/logo.png`) rather than picked by eye:

| Sampled from the logo | Value | Where it lands |
| --- | --- | --- |
| "MiTea" wordmark and outlines | `#5a412b` | `--primary`, `--focus`, shadow tint |
| mochi donut | `#fc9994` | `--border-highlight`; pink section bands |
| boba cup body | `#fee7c5` | `--on-primary`, `--on-inverse` |
| milk tea in the cup | `#edc391` | warm surface step |
| cup lid | `#bfd1ab` | success / vegan states |
| straw | `#fab58b` | accent tint |
| banh mi crust | `#f0b66d` | warning state |

Pink is a **fill**, never ink: `#fc9994` is too light to set type on. Text that
should read as brand-adjacent uses `--content-accent` (a darker step of the
same ramp). Every text/background pair across all four presets clears WCAG AA —
`--content-subtle` is nudged off its even ramp step specifically to get there.

> The Square site publishes `primaryColor: #cdf4cf`, a pale mint, along with
> `fontset: sourceserif` and 0px corners. That is Square's default theme, not
> the shop's: the same config generates an app icon that is a mint circle with
> the site title in Inter, and the mint appears nowhere in the logo or the shop.
> An earlier pass of this site was built on those values; it is not any more.
> If the flat, square-cornered look is wanted, the `--shape-*` tokens are the
> only edit.

`@theme inline` maps layer 2 onto Tailwind utilities (`bg-surface-raised`,
`text-content-muted`, `shadow-card`), keeping the `var()` indirection so a
preset swap takes effect at runtime.

**To rebrand:** edit the primitives, or add a preset block plus an entry in
`lib/theme/presets.ts`. No component file should need to change. If a component
wants a colour that layer 2 doesn't name, add the token — don't inline a hex.

## Not built yet

Both are deliberate — see `docs/square-integration.md` for the seams left open.

- **Square POS push.** No Square code or credentials in this repo. Orders go to
  `.data/orders.json` through `OrderStore`; `getOrderStore()` is the single line
  the future adapter changes.
- **Owner management.** `/admin` is a placeholder reserving the route, with no
  authentication and no functionality.

Also absent by design: online payment (the confirmation page says payment is
taken at the counter), delivery, accounts and rewards.

## Before this goes live

Search the codebase for `TODO(owner)`. The menu document supplied item names and
prices and nothing else, so these are placeholders:

- Item descriptions — draft copy, in `lib/catalog/items.ts`
- Topping, size and milk upcharges, and the mochi donut flavour list —
  `lib/catalog/modifiers.ts`
- Sales tax rate, phone, email, hours, social links — `lib/site-config.ts`
  (the address is real; the tax rate is **not** the Golden Valley / Hennepin
  County rate and must be confirmed before launch)
- Testimonials and catering packages — `components/home/sections.tsx`,
  `app/catering/page.tsx`
- Photography — the logo, shop interior and mochi donut photos are real (pulled
  from the Square site); every other image slot is still a placeholder. See
  `public/images/.gitkeep`

Item **names and prices** are transcribed from the owner's document and should
only change against a new source.

### The catalog is missing most of the real menu

Reading the live Square site turned up something the menu document did not show:
the shop sells **food as well as drinks**, and its own description reads
"bubble tea, mochi donuts, banh mi, and more — all under one roof."

The Square site publishes **17** categories. This catalog has **8**. Missing:

| Missing category | Kind |
| --- | --- |
| VIETNAMESE BANH MI | food |
| KOREAN EGG DROP SANDWICHES | food |
| SANDWICHES | food |
| LATTE SERIES | drinks |
| FRUIT MILK SERIES | drinks |
| SIGNATURE SERIES | drinks |
| NO CAFFINE SERIES | drinks |
| SOFT DRINKS | drinks |
| NEW DRINK ALERT | drinks |

Only the category names are in the Square page's HTML — item names and prices
load over an API afterwards, so they could not be read from the same fetch and
are **not** guessable. Getting them needs either the Square catalog via an
authenticated API call, or a menu export from the owner.

Nothing about the site's structure blocks this: adding a category is an entry in
`lib/catalog/categories.ts` plus its items in `lib/catalog/items.ts`. Food items
would want their own modifier groups (bread, protein, spice) rather than the
drink ones — the `ModifierGroup` model already supports that.
