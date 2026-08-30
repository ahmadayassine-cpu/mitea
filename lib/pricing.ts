import type { Catalog } from "@/lib/catalog/catalog";
import { TAX_RATE } from "@/lib/site-config";
import type {
  CartLine,
  MenuItem,
  ModifierGroup,
  Money,
  OrderTotals,
  PricedLine,
} from "@/lib/types";

/**
 * Pricing, shared verbatim by the client cart and `POST /api/orders`.
 *
 * The client's numbers are for display. The server recomputes every line from
 * item and option ids and ignores whatever total was submitted — see
 * `app/api/orders/route.ts`. Both call the functions below so the two can never
 * disagree about what a drink costs.
 *
 * Every function that has to look an id up takes the catalog as its first
 * argument rather than importing it: since the menu moved to Airtable there is
 * no module-level menu to reach for, and passing it makes it obvious that the
 * cart and the server are pricing against the same fetched generation.
 */

/** `$6.30` from `630`. The only place cents become dollars. */
export function formatMoney(cents: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Prices one line.
 *
 * Unknown option ids contribute nothing rather than throwing — a stale cart in
 * someone's browser should degrade to a sane price, not a crash. The server
 * rejects unknown ids separately, before it gets here, so a tampered request
 * never reaches this quietly-forgiving path.
 */
export function priceLine(
  item: MenuItem,
  groups: readonly ModifierGroup[],
  selections: Readonly<Record<string, readonly string[]>>,
  quantity: number,
): PricedLine {
  let unitPrice = item.basePrice;

  for (const group of groups) {
    const chosen = selections[group.id] ?? [];
    for (const optionId of chosen) {
      const option = group.options.find((candidate) => candidate.id === optionId);
      if (option) unitPrice += option.priceDelta;
    }
  }

  return { unitPrice, lineTotal: unitPrice * Math.max(0, quantity) };
}

/** Prices a cart line by id, or `null` if the item is no longer on the menu. */
export function priceCartLine(catalog: Catalog, line: CartLine): PricedLine | null {
  const item = catalog.getItem(line.itemId);
  if (!item) return null;

  const groups = catalog.getModifierGroups(item.modifierGroupIds);
  return priceLine(item, groups, line.selections, line.quantity);
}

/**
 * Totals a cart. Tax is rounded once on the subtotal rather than per line, so
 * the displayed total always equals subtotal + tax exactly.
 */
export function priceOrder(catalog: Catalog, lines: readonly CartLine[]): OrderTotals {
  const subtotal = lines.reduce((sum, line) => {
    const priced = priceCartLine(catalog, line);
    return sum + (priced?.lineTotal ?? 0);
  }, 0);

  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}

/**
 * Whether a line's selections satisfy its groups' `required`/`min`/`max` rules.
 * Used by the customiser to gate "Add to cart" and by the API to reject a
 * hand-built request.
 */
export function validateSelections(
  catalog: Catalog,
  item: MenuItem,
  selections: Readonly<Record<string, readonly string[]>>,
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const group of catalog.getModifierGroups(item.modifierGroupIds)) {
    const chosen = selections[group.id] ?? [];
    const min = group.min ?? (group.required ? 1 : 0);
    const max = group.max ?? (group.selection === "single" ? 1 : group.options.length);

    const unknown = chosen.filter(
      (id) => !group.options.some((option) => option.id === id),
    );
    if (unknown.length > 0) {
      errors[group.id] = `Unrecognised choice in ${group.name}.`;
      continue;
    }

    // A cart can outlive an availability change: someone picks oat milk, the
    // shop runs out, and the line is still sitting in their browser.
    const soldOut = group.options.filter(
      (option) => option.soldOut && chosen.includes(option.id),
    );
    if (soldOut.length > 0) {
      errors[group.id] = `${soldOut.map((option) => option.name).join(" and ")} just sold out.`;
      continue;
    }

    if (new Set(chosen).size !== chosen.length) {
      errors[group.id] = `Duplicate choice in ${group.name}.`;
      continue;
    }

    if (chosen.length < min) {
      errors[group.id] =
        min === max ? `Pick exactly ${min}.` : `Pick at least ${min}.`;
    } else if (chosen.length > max) {
      errors[group.id] = `Pick at most ${max}.`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Default selections for a freshly opened customiser. */
export function defaultSelections(
  catalog: Catalog,
  item: MenuItem,
): Record<string, string[]> {
  const selections: Record<string, string[]> = {};

  for (const group of catalog.getModifierGroups(item.modifierGroupIds)) {
    // A sold-out default would open the dialog on a choice that cannot be
    // ordered, so it is treated as no default at all and the customer picks.
    const preset = group.options.find((option) => option.isDefault && !option.soldOut);
    selections[group.id] = preset ? [preset.id] : [];
  }

  return selections;
}
