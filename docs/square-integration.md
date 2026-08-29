# Square POS integration — planned, not built

Pushing online orders into the shop's local Square POS is a later phase. **No
Square code, SDK or credentials exist in this repo.** This note records the
seams that were left open for it, so the future work is an addition rather than
a refactor.

## The one edit site

`lib/orders/store.ts` defines:

```ts
export interface OrderStore {
  create(input: NewOrder): Promise<Order>;
  get(id: string): Promise<Order | null>;
}
```

Everything that touches orders — the API route, the confirmation page — depends
on that interface and on `getOrderStore()`. Nothing else knows where an order
goes. The adapter can therefore be either:

- **A wrapper.** `SquareOrderStore` holds the existing store, calls `create` on
  it first so the order is durably ours, then pushes to Square and records the
  returned id. A Square outage then degrades to "the order exists, it just
  hasn't reached the POS yet" instead of losing it.
- **A replacement.** A store that writes only to Square. Simpler, but the site
  can no longer render a confirmation if Square is down.

The wrapper is the better default. Either way `getOrderStore()` is the only
line that changes.

## What already lines up

The catalog was modelled against Square's shapes rather than invented freely:

| Mitea (`lib/types.ts`) | Square |
| --- | --- |
| `ModifierGroup.selection: "single"` | modifier list, `SINGLE_SELECTION` |
| `ModifierGroup.selection: "multiple"` | modifier list, `MULTIPLE_SELECTION` |
| `ModifierGroup.min` / `.max` | modifier list selection limits |
| `ModifierOption.priceDelta` (cents) | modifier `price_money.amount` |
| `MenuItem.basePrice` (cents) | item variation `price_money.amount` |

Two fields exist purely for this work and are `null` everywhere today:

- `MenuItem.squareCatalogObjectId` — set when the catalog is synced, so an order
  line can name the POS object directly instead of matching on name.
- `Order.squareOrderId` — set by the adapter after a successful push.

Money is integer cents throughout, which is also Square's unit. No conversion.

## What still has to be decided

- **Catalog direction.** Is `lib/catalog/` the source of truth and pushed to
  Square, or is Square the source and pulled into the site? The `squareCatalogObjectId`
  field supports either, but the sync job differs entirely.
- **Local vs cloud.** "Local Square POS" suggests the terminal on the counter.
  Reaching it may mean the Orders API plus a device push rather than a direct
  connection to hardware on the shop's LAN.
- **Payment.** The site currently takes no payment — the confirmation page says
  payment happens at the counter. If orders should be paid online, that is a
  Square Payments decision that also changes the checkout flow.
- **Failure handling.** What the customer sees when Square rejects a push, and
  whether staff get a queue of unsynced orders to retry.

## Owner management

Also a later phase. `app/(admin)/admin/page.tsx` is a placeholder reserving the
route group and nothing more — no authentication, no functionality. Whatever
that build needs (order queue, menu editing, hours) will read through the same
`OrderStore` and `lib/catalog/` modules the public site uses.
