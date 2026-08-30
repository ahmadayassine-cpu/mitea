# The menu lives in Airtable

The menu used to be three TypeScript files. It is now four Airtable tables, so
the owner can change a price, add a drink or mark something sold out without a
deploy. Those TypeScript files still exist under `lib/catalog/seed/`, but only
as the seed the base was populated from — nothing reads them at runtime.

Base: **mitea** (`app9kUOoO7zjSt4nU`).

## The tables

Every table has a **Key** column. That — not Airtable's `rec…` id — is the id
the app uses, and it is the id written into customers' saved carts and into
every stored order. **Renaming a Key orphans past orders and empties carts that
reference it.** Everything else on a record is safe to edit.

### Menu Categories

| Field | Type | Notes |
| --- | --- | --- |
| Name | Text | Section heading |
| Key | Text | `brown-sugar` |
| Slug | Text | URL anchor: `/menu#brown-sugar-series` |
| Description | Long text | Blurb under the heading |
| Photo | Attachment | Series photo, inherited by every drink in it |
| Image Fallback Path | Text | `/images/…` under `public/`, used when Photo is empty |
| Sort Order | Number | Menu order, seeded in tens |
| Status | Select | `Active` / `Hidden` — hiding a section hides its items too |

### Menu Items

| Field | Type | Notes |
| --- | --- | --- |
| Name, Key, Slug, Description | | as above |
| Base Price | Currency | Dollars. The app converts to cents on read |
| Category | Link | Exactly one |
| Photo | Attachment | Usually empty — the drink inherits its series photo |
| Image Fallback Path | Text | Only the mochi donut boxes set this |
| Tags | Multi-select | `popular` also fills the home page's "Most ordered" rail |
| Modifier Groups | Link | Which choices the item offers |
| Sort Order | Number | Order within the category |
| Status | Select | `Active` / `Sold out` / `Hidden` |
| Square Catalog Object ID | Text | Reserved; see [square-integration.md](square-integration.md) |

`Sold out` leaves the item on the menu, greyed out and unclickable, and
`POST /api/orders` rejects it with a 409 — so a cart that was filled before you
flipped the switch cannot check out. `Hidden` removes it from the site entirely.

### Modifier Groups

Size, sugar level, ice, milk, toppings, and one group per mochi donut box size.
`Selection` (`single`/`multiple`) and `Min`/`Max` map onto Square's
SINGLE_SELECTION / MULTIPLE_SELECTION modifier lists, so the eventual POS sync
is a mapping rather than a remodel. A donut box sets `Min = Max = box size`.

Group display order in the customiser comes from the group's own **Sort Order**,
not from the order the links happen to sit in on an item.

### Modifier Options

The individual choices. Options are shared: the eight donut flavours are eight
records linked from all four box-size groups, so renaming a flavour renames it
everywhere. `Status: Sold out` keeps an option visible but unselectable, and the
server rejects it — that is how you 86 oat milk for an afternoon.

## How the site reads it

`lib/catalog/airtable.ts` fetches all four tables and maps them onto the domain
types in `lib/types.ts`. It is **server-only**. Client components get the
catalog from `<CatalogProvider>`, which the root layout fills once per request:
the cart prices itself in the browser, so the menu has to be there too.

The mapping is deliberately forgiving — a blank Status reads as Active, a blank
Sort Order sorts last, a blank Key falls back to the slug — so a row typed
straight into Airtable renders. The one exception is **Base Price**: an item
without one is dropped rather than shown at $0.00.

## Caching

Reads are cached for five minutes and tagged `catalog`
(`CATALOG_TAG` in `lib/airtable/client.ts`). Two consequences:

- An edit made directly in Airtable appears within five minutes. An edit made
  through the admin surface should call `updateCatalog()`
  (`lib/catalog/revalidate.ts`) and appear immediately.
- While developing, an edit in Airtable will not show up until that window
  lapses. `npm run menu:refresh` deletes the cached reads so the next request
  goes to Airtable. The cache lives in `.next/dev/cache` under `next dev` and
  `.next/cache` under `next start`, and **neither is cleared by restarting the
  server** — both are on disk.
- After `npm run menu:refresh`, a production check also needs `npm run build`:
  pages are prerendered, so the HTML is baked at build time and a cleared cache
  alone will not change what `next start` serves.
- Airtable's attachment URLs expire after about two hours. A five-minute cache
  means the URLs handed to browsers are always far inside that window, which is
  why photos can be served straight from Airtable with no copy step. Do not
  raise the cache window past an hour without revisiting this.

## Re-seeding

```bash
npm run seed:airtable
```

Upserts on Key from `lib/catalog/seed/`, and uploads a photo only where a record
has none — so it will not clobber a photo the owner replaced. It **will**
overwrite text and price edits with the seed values. It exists to populate an
empty base; once the owner is editing in Airtable, do not run it again.

Needs a personal access token in `.env.local` with `data.records:read`,
`data.records:write` and `schema.bases:read`, scoped to this base.
