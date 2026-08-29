import type { Money } from "@/lib/types";

/**
 * An order as it is stored and returned.
 *
 * Note what a line records: not just ids, but the item name, option names and
 * prices as they were **at the moment of the order**. A menu edit six months
 * from now must not retroactively change what someone was charged, and the
 * confirmation page has to render without re-resolving a catalog that may have
 * moved on.
 */

export interface OrderLineOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: Money;
}

export interface OrderLine {
  itemId: string;
  itemName: string;
  quantity: number;
  basePrice: Money;
  options: OrderLineOption[];
  unitPrice: Money;
  lineTotal: Money;
  notes?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export type OrderStatus = "received";

export interface Order {
  id: string;
  /** Short, spoken at the counter, e.g. "MT-4Q7X". */
  pickupCode: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  /** A value from `PICKUP_WINDOWS`, stored as given. */
  pickupWindow: string;
  pickupWindowLabel: string;
  notes?: string;
  lines: OrderLine[];
  subtotal: Money;
  tax: Money;
  total: Money;
  /**
   * Reserved for the Square POS integration (not built). Stays null until an
   * adapter pushes the order and records the id it came back with.
   * See docs/square-integration.md.
   */
  squareOrderId: string | null;
}

export type NewOrder = Omit<Order, "id" | "pickupCode" | "createdAt" | "status">;
