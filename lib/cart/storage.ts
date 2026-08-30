import type { Catalog } from "@/lib/catalog/catalog";
import type { CartLine } from "@/lib/types";

/**
 * localStorage persistence for the cart.
 *
 * The version suffix is load-bearing: when the shape of `CartLine` changes,
 * bumping it makes every existing browser discard its cart instead of feeding
 * a stale shape into the reducer. Reads are additionally validated against the
 * live catalog, because a cart can also go stale without the shape changing —
 * an item pulled from the menu, a topping renamed.
 */
export const CART_STORAGE_KEY = "mitea.cart.v1";

export function loadCart(catalog: Catalog): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((line) => isUsableLine(catalog, line));
  } catch {
    // Corrupt JSON or storage unavailable. An empty cart beats a crash.
    return [];
  }
}

export function saveCart(lines: readonly CartLine[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Quota or private mode. The in-memory cart still works for this visit.
  }
}

/**
 * A persisted line is kept only if it still describes something orderable:
 * the item is on the menu, and every option id still exists in its group.
 * Anything else is dropped silently rather than shown at a wrong price.
 */
function isUsableLine(catalog: Catalog, value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Partial<CartLine>;

  if (typeof line.lineId !== "string" || typeof line.itemId !== "string") {
    return false;
  }
  if (typeof line.quantity !== "number" || !Number.isInteger(line.quantity)) {
    return false;
  }
  if (line.quantity < 1 || line.quantity > 99) return false;
  if (typeof line.selections !== "object" || line.selections === null) return false;
  if (line.notes !== undefined && typeof line.notes !== "string") return false;

  const item = catalog.getItem(line.itemId);
  if (!item) return false;

  const groups = catalog.getModifierGroups(item.modifierGroupIds);
  const groupIds = new Set(groups.map((group) => group.id));

  for (const [groupId, optionIds] of Object.entries(line.selections)) {
    if (!groupIds.has(groupId)) return false;
    if (!Array.isArray(optionIds)) return false;

    const group = groups.find((candidate) => candidate.id === groupId);
    if (!group) return false;

    const known = new Set(group.options.map((option) => option.id));
    if (!optionIds.every((id) => typeof id === "string" && known.has(id))) {
      return false;
    }
  }

  return true;
}
