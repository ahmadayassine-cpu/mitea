/**
 * Domain types for the Mitea catalog, cart and orders.
 *
 * Money is **integer cents** everywhere in this codebase. Dollars only appear
 * at the render edge, via `formatMoney`. Floating-point dollars would drift on
 * a cart of a dozen $6.30 drinks; cents never do.
 */

export type Money = number;

/** A single choice within a modifier group, e.g. "Large" or "Mitea". */
export interface ModifierOption {
  id: string;
  name: string;
  /** Added to the item's base price when selected. May be 0. */
  priceDelta: Money;
  /** Pre-selected when the customiser opens. Only meaningful on `single` groups. */
  isDefault?: boolean;
  /** 86'd for the day: still listed, but greyed out and rejected by the API. */
  soldOut?: boolean;
}

/**
 * A set of choices attached to an item.
 *
 * Shaped to match how Square models modifier lists so the future POS push is a
 * mapping rather than a remodel: `single` corresponds to a
 * SINGLE_SELECTION modifier list, `multiple` to MULTIPLE_SELECTION, and
 * `min`/`max` to its selection limits.
 */
export interface ModifierGroup {
  id: string;
  name: string;
  /** Short helper line under the group heading, e.g. "Pick up to 4". */
  hint?: string;
  selection: "single" | "multiple";
  /** When true the line cannot be added to the cart until `min` is satisfied. */
  required: boolean;
  /** Minimum selections. Defaults to 1 for required groups, 0 otherwise. */
  min?: number;
  /** Maximum selections. For a donut box this is the box size. */
  max?: number;
  options: ModifierOption[];
}

export type MenuItemTag = "popular" | "new" | "vegan" | "seasonal";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: Money;
  categoryId: string;
  /** Path under /public once real photography exists; null renders a placeholder. */
  image?: string | null;
  tags: MenuItemTag[];
  /** Ids of the item's modifier groups, in the order shown in the customiser. */
  modifierGroupIds: string[];
  /** 86'd for the day: still on the menu, greyed out and rejected by the API. */
  soldOut?: boolean;
  /**
   * Reserved for the Square POS integration (not built). When the catalog is
   * synced, this holds the Square CatalogObject id so an order line can name
   * the POS item directly. See docs/square-integration.md.
   */
  squareCatalogObjectId?: string | null;
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string | null;
  sortOrder: number;
}

/**
 * A line in the cart.
 *
 * `selections` maps a group id to the chosen option ids — always an array, even
 * for `single` groups, so the pricing code has one shape to walk.
 */
export interface CartLine {
  lineId: string;
  itemId: string;
  quantity: number;
  selections: Record<string, string[]>;
  notes?: string;
}

export interface PricedLine {
  /** Price of one unit including modifiers. */
  unitPrice: Money;
  /** `unitPrice * quantity`. */
  lineTotal: Money;
}

export interface OrderTotals {
  subtotal: Money;
  tax: Money;
  total: Money;
}
