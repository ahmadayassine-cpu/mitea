import { getItem, getModifierGroups } from "@/lib/catalog";
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
export function priceCartLine(line: CartLine): PricedLine | null {
  const item = getItem(line.itemId);
  if (!item) return null;

  const groups = getModifierGroups(item.modifierGroupIds);
  return priceLine(item, groups, line.selections, line.quantity);
}

/**
 * Totals a cart. Tax is rounded once on the subtotal rather than per line, so
 * the displayed total always equals subtotal + tax exactly.
 */
export function priceOrder(lines: readonly CartLine[]): OrderTotals {
  const subtotal = lines.reduce((sum, line) => {
    const priced = priceCartLine(line);
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
  item: MenuItem,
  selections: Readonly<Record<string, readonly string[]>>,
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const group of getModifierGroups(item.modifierGroupIds)) {
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
export function defaultSelections(item: MenuItem): Record<string, string[]> {
  const selections: Record<string, string[]> = {};

  for (const group of getModifierGroups(item.modifierGroupIds)) {
    const preset = group.options.find((option) => option.isDefault);
    selections[group.id] = preset ? [preset.id] : [];
  }

  return selections;
}
