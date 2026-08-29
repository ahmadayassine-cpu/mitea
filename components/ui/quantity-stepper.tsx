"use client";

import { MAX_LINE_QUANTITY } from "@/lib/cart/reducer";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  /** 0 lets the minus button remove the line, which is what the cart wants. */
  min?: number;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-control border border-border-strong bg-surface-raised"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="flex size-9 items-center justify-center rounded-control text-lg leading-none text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_LINE_QUANTITY}
        className="flex size-9 items-center justify-center rounded-control text-lg leading-none text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        +
      </button>
    </div>
  );
}
