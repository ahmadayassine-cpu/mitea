import { JsonFileOrderStore } from "./json-store";
import type { NewOrder, Order } from "./types";

/**
 * How orders are persisted.
 *
 * This interface is the seam for the Square POS work. When that is built, the
 * adapter either implements `OrderStore` directly or wraps the store below and
 * pushes to Square inside `create` — and `getOrderStore()` is the only line in
 * the codebase that has to change. Nothing that calls this knows or cares where
 * an order ends up. See docs/square-integration.md.
 */
export interface OrderStore {
  create(input: NewOrder): Promise<Order>;
  get(id: string): Promise<Order | null>;
}

let store: OrderStore | null = null;

export function getOrderStore(): OrderStore {
  store ??= new JsonFileOrderStore();
  return store;
}
