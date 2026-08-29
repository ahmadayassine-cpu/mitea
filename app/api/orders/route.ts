import { z } from "zod";
import { getItem, getModifierGroups } from "@/lib/catalog";
import { priceLine, priceOrder, validateSelections } from "@/lib/pricing";
import { getOrderStore } from "@/lib/orders/store";
import type { OrderLine, OrderLineOption } from "@/lib/orders/types";
import { PICKUP_WINDOWS } from "@/lib/site-config";
import type { CartLine } from "@/lib/types";

/**
 * Order intake.
 *
 * The request carries item ids, option ids and quantities — and nothing else
 * that touches money. Any `price`, `subtotal` or `total` a client sends is
 * ignored outright; every figure below is recomputed here from the catalog via
 * `lib/pricing.ts`, the same module the cart UI uses. That is what keeps the
 * displayed price honest without letting the browser decide what to charge.
 */

const lineSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  selections: z.record(z.string(), z.array(z.string())).default({}),
  notes: z.string().max(280).optional(),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, "Name is required.").max(80),
    phone: z.string().trim().min(7, "A phone number is required.").max(32),
    email: z.email("Enter a valid email address.").max(160),
  }),
  pickupWindow: z.string().min(1),
  notes: z.string().max(280).optional(),
  lines: z.array(lineSchema).min(1, "Your cart is empty.").max(50),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "That order isn't valid.", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { customer, pickupWindow, notes, lines } = parsed.data;

  const window = PICKUP_WINDOWS.find((entry) => entry.value === pickupWindow);
  if (!window) {
    return Response.json({ error: "Unknown pickup time." }, { status: 400 });
  }

  // Resolve and re-price every line. A line naming an item or option that is
  // not on the menu is rejected rather than quietly priced at zero.
  const orderLines: OrderLine[] = [];

  for (const line of lines) {
    const item = getItem(line.itemId);
    if (!item) {
      return Response.json(
        { error: `"${line.itemId}" is no longer on the menu.` },
        { status: 400 },
      );
    }

    const { valid, errors } = validateSelections(item, line.selections);
    if (!valid) {
      return Response.json(
        { error: `Check your choices for ${item.name}.`, issues: errors },
        { status: 400 },
      );
    }

    const groups = getModifierGroups(item.modifierGroupIds);
    const options: OrderLineOption[] = [];

    for (const group of groups) {
      for (const optionId of line.selections[group.id] ?? []) {
        const option = group.options.find((candidate) => candidate.id === optionId);
        // validateSelections already rejected unknown ids; this narrows the type.
        if (!option) continue;
        options.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        });
      }
    }

    const { unitPrice, lineTotal } = priceLine(
      item,
      groups,
      line.selections,
      line.quantity,
    );

    orderLines.push({
      itemId: item.id,
      itemName: item.name,
      quantity: line.quantity,
      basePrice: item.basePrice,
      options,
      unitPrice,
      lineTotal,
      notes: line.notes,
    });
  }

  // Totals come from the same helper the cart uses, fed the validated lines.
  const cartLines: CartLine[] = lines.map((line, index) => ({
    lineId: String(index),
    itemId: line.itemId,
    quantity: line.quantity,
    selections: line.selections,
    notes: line.notes,
  }));
  const { subtotal, tax, total } = priceOrder(cartLines);

  const order = await getOrderStore().create({
    customer,
    pickupWindow: window.value,
    pickupWindowLabel: window.label,
    notes,
    lines: orderLines,
    subtotal,
    tax,
    total,
    squareOrderId: null,
  });

  return Response.json(order, { status: 201 });
}
