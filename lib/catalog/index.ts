import type { MenuCategory, MenuItem } from "@/lib/types";
import { CATEGORIES } from "./categories";
import { ITEMS } from "./items";

export { CATEGORIES } from "./categories";
export { ITEMS } from "./items";
export {
  MODIFIER_GROUPS,
  getModifierGroup,
  getModifierGroups,
} from "./modifiers";

const ITEMS_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const ITEMS_BY_SLUG = new Map(ITEMS.map((item) => [item.slug, item]));

export function getItem(id: string): MenuItem | undefined {
  return ITEMS_BY_ID.get(id);
}

export function getItemBySlug(slug: string): MenuItem | undefined {
  return ITEMS_BY_SLUG.get(slug);
}

/** Categories in menu order, each with its items. Drives /menu and its nav. */
export function getMenu(): Array<{ category: MenuCategory; items: MenuItem[] }> {
  return [...CATEGORIES]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({
      category,
      items: ITEMS.filter((item) => item.categoryId === category.id),
    }));
}

/** The home page's "Most ordered" rail. */
export function getPopularItems(): MenuItem[] {
  return ITEMS.filter((item) => item.tags.includes("popular"));
}

/** True when the item has any choice to make, so a card can show "$X +". */
export function hasChoices(item: MenuItem): boolean {
  return item.modifierGroupIds.length > 0;
}
