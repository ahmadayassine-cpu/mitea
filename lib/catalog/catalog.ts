import type { MenuCategory, MenuItem, ModifierGroup } from "@/lib/types";

/**
 * The catalog as a value.
 *
 * Before Airtable this module was a set of top-level `const`s that any file
 * could import, on the server or in the browser. A remote catalog cannot work
 * that way — it arrives asynchronously — so the menu is now passed around as
 * one object: fetched once per request on the server (`lib/catalog/airtable.ts`)
 * and handed to the browser once by `<CatalogProvider>`.
 *
 * Everything here is pure and isomorphic. Keep it that way: this module is in
 * the client bundle, so nothing that reads `process.env` or talks to Airtable
 * belongs in it.
 */

/** The plain, serialisable shape that crosses the server/client boundary. */
export interface CatalogData {
  categories: MenuCategory[];
  items: MenuItem[];
  groups: ModifierGroup[];
}

export interface Catalog extends CatalogData {
  getItem(id: string): MenuItem | undefined;
  getItemBySlug(slug: string): MenuItem | undefined;
  getCategory(id: string): MenuCategory | undefined;
  /** Resolves group ids to groups, silently dropping unknown ids. */
  getModifierGroups(ids: readonly string[]): ModifierGroup[];
  /** Categories in menu order, each with its items. Drives /menu and its nav. */
  getMenu(): Array<{ category: MenuCategory; items: MenuItem[] }>;
  /** The home page's "Most ordered" rail. */
  getPopularItems(): MenuItem[];
}

/**
 * Wraps fetched data in lookup indexes.
 *
 * Cheap enough to run on every render of the provider — three Maps over a few
 * dozen records — but `useMemo`d there anyway so referential identity is stable
 * for the components that depend on it.
 */
export function createCatalog(data: CatalogData): Catalog {
  const itemsById = new Map(data.items.map((item) => [item.id, item]));
  const itemsBySlug = new Map(data.items.map((item) => [item.slug, item]));
  const categoriesById = new Map(
    data.categories.map((category) => [category.id, category]),
  );
  const groupsById = new Map(data.groups.map((group) => [group.id, group]));

  return {
    ...data,
    getItem: (id) => itemsById.get(id),
    getItemBySlug: (slug) => itemsBySlug.get(slug),
    getCategory: (id) => categoriesById.get(id),
    getModifierGroups: (ids) =>
      ids
        .map((id) => groupsById.get(id))
        .filter((group): group is ModifierGroup => group !== undefined),
    getMenu: () =>
      data.categories.map((category) => ({
        category,
        items: data.items.filter((item) => item.categoryId === category.id),
      })),
    getPopularItems: () => data.items.filter((item) => item.tags.includes("popular")),
  };
}

/** True when the item has any choice to make, so a card can show "$X +". */
export function hasChoices(item: MenuItem): boolean {
  return item.modifierGroupIds.length > 0;
}
