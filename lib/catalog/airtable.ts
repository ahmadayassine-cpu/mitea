import { attachmentUrl, listRecords, type Attachment } from "@/lib/airtable/client";
import type {
  MenuCategory,
  MenuItem,
  MenuItemTag,
  ModifierGroup,
  ModifierOption,
} from "@/lib/types";
import { type Catalog, type CatalogData, createCatalog } from "./catalog";

/**
 * Reads the menu out of Airtable and maps it onto the domain types.
 *
 * **Server only.** It reads `process.env` and holds the API token; importing it
 * from a `"use client"` file would try to ship both to the browser. Client code
 * gets the catalog from `<CatalogProvider>` instead.
 *
 * The mapping is forgiving on purpose. A shop owner editing a spreadsheet will
 * leave a cell blank, and the site should degrade to a sane default rather than
 * 500 — so a missing Status reads as Active, a missing Sort Order sorts last,
 * and a missing Key falls back to the slug. The one thing it will not do is
 * invent a price: an item with no Base Price is dropped, because rendering it
 * at $0.00 would let someone order it for nothing.
 */

/**
 * Table ids are baked in rather than looked up by name, so renaming a table in
 * Airtable does not take the menu down. Field names are read as written below;
 * they are the one thing in the base that must not be renamed casually.
 */
const TABLES = {
  categories: "tblgca4oYPD3dFrMu",
  items: "tblScotkD7tAvhJXS",
  groups: "tbl2wVNxBqmp9Kkfi",
  options: "tblqiFKneIcoKbP6q",
} as const;

interface CategoryFields {
  Name: string;
  Key: string;
  Slug: string;
  Description: string;
  Photo: Attachment[];
  "Image Fallback Path": string;
  "Sort Order": number;
  Status: string;
}

interface ItemFields {
  Name: string;
  Key: string;
  Slug: string;
  Description: string;
  "Base Price": number;
  Category: string[];
  Photo: Attachment[];
  "Image Fallback Path": string;
  Tags: string[];
  "Modifier Groups": string[];
  "Sort Order": number;
  Status: string;
  "Square Catalog Object ID": string;
}

interface GroupFields {
  Name: string;
  Key: string;
  Hint: string;
  Selection: string;
  Required: boolean;
  Min: number;
  Max: number;
  Options: string[];
  "Sort Order": number;
}

interface OptionFields {
  Name: string;
  Key: string;
  "Price Delta": number;
  "Is Default": boolean;
  "Sort Order": number;
  Status: string;
}

const KNOWN_TAGS: MenuItemTag[] = ["popular", "new", "vegan", "seasonal"];

/**
 * The whole menu, in one call.
 *
 * Four table reads, all cached under the same tag by `listRecords`, so a warm
 * cache costs nothing and `revalidateTag("catalog")` refreshes them together.
 */
export async function getCatalog(): Promise<Catalog> {
  return createCatalog(await fetchCatalogData());
}

export async function fetchCatalogData(): Promise<CatalogData> {
  const [categoryRecords, itemRecords, groupRecords, optionRecords] = await Promise.all([
    listRecords<CategoryFields>(TABLES.categories),
    listRecords<ItemFields>(TABLES.items),
    listRecords<GroupFields>(TABLES.groups),
    listRecords<OptionFields>(TABLES.options),
  ]);

  // ── Options, indexed by record id so groups can resolve their links ──
  const optionsByRecordId = new Map<string, ModifierOption>();
  const optionOrder = new Map<string, number>();

  for (const record of optionRecords) {
    const key = idFor(record.fields.Key, record.fields.Name, record.id);

    optionsByRecordId.set(record.id, {
      id: key,
      name: record.fields.Name ?? key,
      priceDelta: toCents(record.fields["Price Delta"] ?? 0),
      ...(record.fields["Is Default"] ? { isDefault: true } : {}),
      ...(isSoldOut(record.fields.Status) ? { soldOut: true } : {}),
    });
    optionOrder.set(record.id, sortKey(record.fields["Sort Order"]));
  }

  // ── Groups ──
  const groups: ModifierGroup[] = [];
  const groupKeyByRecordId = new Map<string, string>();
  const groupSortByRecordId = new Map<string, number>();

  for (const record of sortByOrder(groupRecords)) {
    const key = idFor(record.fields.Key, record.fields.Name, record.id);

    const options = (record.fields.Options ?? [])
      .slice()
      .sort((a, b) => sortKey(optionOrder.get(a)) - sortKey(optionOrder.get(b)))
      .map((recordId) => optionsByRecordId.get(recordId))
      .filter((option): option is ModifierOption => option !== undefined);

    // A group with no options is a dead end in the customiser: a required one
    // could never be satisfied, so the item would be unaddable. Drop it.
    if (options.length === 0) continue;

    groupKeyByRecordId.set(record.id, key);
    groupSortByRecordId.set(record.id, sortKey(record.fields["Sort Order"]));

    groups.push({
      id: key,
      name: record.fields.Name ?? key,
      ...(record.fields.Hint ? { hint: record.fields.Hint } : {}),
      selection: record.fields.Selection === "multiple" ? "multiple" : "single",
      required: record.fields.Required === true,
      ...(typeof record.fields.Min === "number" ? { min: record.fields.Min } : {}),
      ...(typeof record.fields.Max === "number" ? { max: record.fields.Max } : {}),
      options,
    });
  }

  // ── Categories ──
  const categories: MenuCategory[] = [];
  const categoryByRecordId = new Map<string, MenuCategory>();

  for (const record of sortByOrder(categoryRecords)) {
    if (isHidden(record.fields.Status)) continue;

    const key = idFor(record.fields.Key, record.fields.Slug ?? record.fields.Name, record.id);

    const category: MenuCategory = {
      id: key,
      slug: record.fields.Slug ?? key,
      name: record.fields.Name ?? key,
      description: record.fields.Description ?? "",
      image: resolveImage(record.fields.Photo, record.fields["Image Fallback Path"]),
      sortOrder: sortKey(record.fields["Sort Order"]),
    };

    categories.push(category);
    categoryByRecordId.set(record.id, category);
  }

  // ── Items ──
  const items: MenuItem[] = [];

  for (const record of sortByOrder(itemRecords)) {
    if (isHidden(record.fields.Status)) continue;

    const price = record.fields["Base Price"];
    if (typeof price !== "number") continue;

    const category = categoryByRecordId.get(record.fields.Category?.[0] ?? "");
    // An item whose section is hidden, missing or unset has nowhere to render.
    if (!category) continue;

    const key = idFor(record.fields.Key, record.fields.Slug ?? record.fields.Name, record.id);

    const modifierGroupIds = (record.fields["Modifier Groups"] ?? [])
      .slice()
      .sort(
        (a, b) => sortKey(groupSortByRecordId.get(a)) - sortKey(groupSortByRecordId.get(b)),
      )
      .map((recordId) => groupKeyByRecordId.get(recordId))
      .filter((groupKey): groupKey is string => groupKey !== undefined);

    items.push({
      id: key,
      slug: record.fields.Slug ?? key,
      name: record.fields.Name ?? key,
      description: record.fields.Description ?? "",
      basePrice: toCents(price),
      categoryId: category.id,
      // Most drinks carry no photo of their own and inherit the series shot,
      // which is the convention the printed menu already uses.
      image:
        resolveImage(record.fields.Photo, record.fields["Image Fallback Path"]) ??
        category.image ??
        null,
      tags: (record.fields.Tags ?? []).filter((tag): tag is MenuItemTag =>
        (KNOWN_TAGS as string[]).includes(tag),
      ),
      modifierGroupIds,
      ...(isSoldOut(record.fields.Status) ? { soldOut: true } : {}),
      squareCatalogObjectId: record.fields["Square Catalog Object ID"] ?? null,
    });
  }

  return { categories, items, groups };
}

/** Airtable stores dollars for the owner's sake; the app is integer cents. */
function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function isHidden(status: string | undefined): boolean {
  return status === "Hidden";
}

function isSoldOut(status: string | undefined): boolean {
  return status === "Sold out";
}

/** A blank Sort Order sorts last rather than first, where 0 would put it. */
function sortKey(value: number | undefined): number {
  return value ?? Number.MAX_SAFE_INTEGER;
}

/**
 * The app-level id for a record.
 *
 * Prefers the explicit Key so ids stay stable across renames, but falls back
 * through the slug and a slugified name to the record id, so a row typed
 * straight into Airtable with nothing but a name and a price still renders.
 */
function idFor(
  key: string | undefined,
  fallback: string | undefined,
  recordId: string,
): string {
  const candidate = key?.trim() || slugify(fallback ?? "");
  return candidate || recordId;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Uploaded photo wins; the /public path is the safety net if it is empty. */
function resolveImage(
  photo: Attachment[] | undefined,
  fallbackPath: string | undefined,
): string | null {
  return attachmentUrl(photo) ?? fallbackPath?.trim() ?? null;
}

function sortByOrder<T extends { fields: { "Sort Order"?: number } }>(
  records: readonly T[],
): T[] {
  return records
    .slice()
    .sort((a, b) => sortKey(a.fields["Sort Order"]) - sortKey(b.fields["Sort Order"]));
}
