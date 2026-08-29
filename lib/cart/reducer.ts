import type { CartLine } from "@/lib/types";

export interface CartState {
  lines: CartLine[];
  /**
   * Flipped by `hydrate`, never back. Lives in reducer state rather than its
   * own `useState` so restoring the cart is a single dispatch — a separate
   * `setReady` in the same effect would be a second synchronous state update,
   * which is the cascading render `react-hooks/set-state-in-effect` warns about.
   */
  ready: boolean;
}

export type CartAction =
  /** Replaces the whole cart. Used once on rehydrate from localStorage. */
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "update"; lineId: string; line: Omit<CartLine, "lineId"> }
  | { type: "remove"; lineId: string }
  | { type: "clear" };

export const MAX_LINE_QUANTITY = 99;

export const INITIAL_CART_STATE: CartState = { lines: [], ready: false };

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === "hydrate") {
    return { lines: action.lines, ready: true };
  }
  return { ...state, lines: linesReducer(state.lines, action) };
}

function linesReducer(
  state: CartLine[],
  action: Exclude<CartAction, { type: "hydrate" }>,
): CartLine[] {
  switch (action.type) {
    case "add": {
      // Identical configurations merge into one line rather than stacking up as
      // separate rows — two "Classic, 50%, boba" reads as "× 2".
      const twin = state.find((line) => isSameConfiguration(line, action.line));
      if (twin) {
        return state.map((line) =>
          line.lineId === twin.lineId
            ? { ...line, quantity: clampQuantity(line.quantity + action.line.quantity) }
            : line,
        );
      }
      return [...state, { ...action.line, quantity: clampQuantity(action.line.quantity) }];
    }

    case "setQuantity": {
      if (action.quantity < 1) {
        return state.filter((line) => line.lineId !== action.lineId);
      }
      return state.map((line) =>
        line.lineId === action.lineId
          ? { ...line, quantity: clampQuantity(action.quantity) }
          : line,
      );
    }

    case "update":
      return state.map((line) =>
        line.lineId === action.lineId
          ? { ...action.line, lineId: line.lineId, quantity: clampQuantity(action.line.quantity) }
          : line,
      );

    case "remove":
      return state.filter((line) => line.lineId !== action.lineId);

    case "clear":
      return [];
  }
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.round(quantity)));
}

/**
 * Two lines are the same configuration when they are the same item with the
 * same options and the same note. Option order is irrelevant, so each group's
 * ids are sorted before comparing.
 */
function isSameConfiguration(a: CartLine, b: CartLine): boolean {
  if (a.itemId !== b.itemId) return false;
  if ((a.notes ?? "") !== (b.notes ?? "")) return false;

  const groupIds = new Set([
    ...Object.keys(a.selections),
    ...Object.keys(b.selections),
  ]);

  for (const groupId of groupIds) {
    const left = [...(a.selections[groupId] ?? [])].sort();
    const right = [...(b.selections[groupId] ?? [])].sort();
    if (left.length !== right.length) return false;
    if (left.some((id, index) => id !== right[index])) return false;
  }

  return true;
}
