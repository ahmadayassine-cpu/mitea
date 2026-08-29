"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { priceOrder } from "@/lib/pricing";
import type { CartLine, OrderTotals } from "@/lib/types";
import { INITIAL_CART_STATE, cartReducer } from "./reducer";
import { loadCart, saveCart } from "./storage";

interface CartContextValue {
  lines: CartLine[];
  /** Total drinks and donuts, not lines — this is the header badge number. */
  count: number;
  totals: OrderTotals;
  /**
   * False until the localStorage read has run. Components that render a count
   * must not show one before this flips, or the server HTML (always 0) and the
   * first client render disagree and React logs a hydration mismatch.
   */
  ready: boolean;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateLine: (lineId: string, line: Omit<CartLine, "lineId">) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [{ lines, ready }, dispatch] = useReducer(cartReducer, INITIAL_CART_STATE);

  useEffect(() => {
    dispatch({ type: "hydrate", lines: loadCart() });
  }, []);

  useEffect(() => {
    // `ready` guards the first pass: without it the initial empty state would
    // overwrite a stored cart in the window before hydration lands.
    if (!ready) return;
    saveCart(lines);
  }, [lines, ready]);

  const addLine = useCallback((line: Omit<CartLine, "lineId">) => {
    dispatch({ type: "add", line: { ...line, lineId: newLineId() } });
  }, []);

  const updateLine = useCallback(
    (lineId: string, line: Omit<CartLine, "lineId">) => {
      dispatch({ type: "update", lineId, line });
    },
    [],
  );

  const setQuantity = useCallback((lineId: string, quantity: number) => {
    dispatch({ type: "setQuantity", lineId, quantity });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    dispatch({ type: "remove", lineId });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      totals: priceOrder(lines),
      ready,
      addLine,
      updateLine,
      setQuantity,
      removeLine,
      clear,
    }),
    [lines, ready, addLine, updateLine, setQuantity, removeLine, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = use(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  return context;
}

function newLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
