"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart/context";
import { useCatalog } from "@/lib/catalog/context";
import {
  defaultSelections,
  formatMoney,
  priceLine,
  validateSelections,
} from "@/lib/pricing";
import type { MenuItem, ModifierGroup } from "@/lib/types";
import { MediaSlot } from "@/components/ui/media-slot";
import { Button } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

/**
 * The customisation dialog.
 *
 * Built on native `<dialog>` + `showModal()`, which gives focus trapping, the
 * Escape key, inert background content and the backdrop for free — all things
 * a hand-rolled modal gets subtly wrong.
 *
 * The price shown here is computed with the same `priceLine` the server uses at
 * checkout, so what the customer reads is what they are charged.
 */
export function ItemCustomizer({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const { addLine } = useCart();
  const catalog = useCatalog();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const groups = useMemo(
    () => catalog.getModifierGroups(item.modifierGroupIds),
    [catalog, item],
  );
  const [selections, setSelections] = useState(() => defaultSelections(catalog, item));
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const { valid, errors } = validateSelections(catalog, item, selections);
  const { unitPrice, lineTotal } = priceLine(item, groups, selections, quantity);

  function toggle(group: ModifierGroup, optionId: string) {
    setSelections((current) => {
      const chosen = current[group.id] ?? [];

      if (group.selection === "single") {
        return { ...current, [group.id]: [optionId] };
      }

      if (chosen.includes(optionId)) {
        return { ...current, [group.id]: chosen.filter((id) => id !== optionId) };
      }

      // At the cap, a further pick is ignored rather than silently evicting an
      // earlier one — the disabled state below already explains why.
      const max = group.max ?? group.options.length;
      if (chosen.length >= max) return current;

      return { ...current, [group.id]: [...chosen, optionId] };
    });
  }

  function submit() {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    addLine({
      itemId: item.id,
      quantity,
      selections,
      notes: notes.trim() || undefined,
    });
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="customizer-title"
      className="m-auto w-[min(34rem,92vw)] max-w-none rounded-card bg-surface-raised p-0 text-content shadow-overlay"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="relative">
          <MediaSlot
            src={item.image}
            alt={item.name}
            seed={item.slug}
            // Square-cornered, unlike a standalone image: the dialog itself has
            // a 0px radius, so rounding this would expose the panel behind it.
            className="h-40 w-full"
          />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-pill bg-surface-raised text-lg shadow-control hover:bg-surface-sunken"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <h2 id="customizer-title" className="font-display text-2xl font-bold text-balance">
            {item.name}
          </h2>
          <p className="mt-1 text-content-muted text-pretty">{item.description}</p>
          <p className="mt-2 font-semibold tabular-nums">{formatMoney(item.basePrice)}</p>

          {groups.map((group) => {
            const chosen = selections[group.id] ?? [];
            const max = group.max ?? (group.selection === "single" ? 1 : group.options.length);
            const atCap = group.selection === "multiple" && chosen.length >= max;
            const error = showErrors ? errors[group.id] : undefined;

            return (
              <fieldset key={group.id} className="mt-6 border-t border-border pt-5">
                <legend className="sr-only">{group.name}</legend>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {group.name}
                    {group.required ? (
                      <span className="ml-2 text-xs font-medium text-content-subtle">Required</span>
                    ) : null}
                  </span>
                  {group.hint ? (
                    <span className="text-xs text-content-subtle">{group.hint}</span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.options.map((option) => {
                    const active = chosen.includes(option.id);
                    const disabled = option.soldOut === true || (atCap && !active);

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-control border px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? "border-primary bg-primary-soft text-on-primary-soft font-semibold"
                            : "border-border bg-surface-raised hover:border-border-highlight"
                        } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                      >
                        <input
                          type={group.selection === "single" ? "radio" : "checkbox"}
                          name={group.id}
                          value={option.id}
                          checked={active}
                          disabled={disabled}
                          onChange={() => toggle(group, option.id)}
                          className="sr-only"
                        />
                        <span>{option.name}</span>
                        {option.soldOut ? (
                          <span className="text-xs opacity-80">Sold out</span>
                        ) : option.priceDelta > 0 ? (
                          <span className="text-xs tabular-nums opacity-80">
                            +{formatMoney(option.priceDelta)}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {error ? (
                  <p role="alert" className="mt-2 text-sm font-medium text-danger-fg">
                    {error}
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <div className="mt-6 border-t border-border pt-5">
            <label htmlFor="line-notes" className="font-semibold">
              Special instructions
            </label>
            <textarea
              id="line-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={280}
              rows={2}
              placeholder="Allergies, how you'd like it made…"
              className="mt-2 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm placeholder:text-content-subtle"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-surface-sunken px-5 py-4 sm:px-6">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button
            type="button"
            size="lg"
            onClick={submit}
            className="flex-1 justify-between"
            aria-disabled={!valid}
          >
            <span>Add to cart</span>
            <span className="tabular-nums">{formatMoney(lineTotal)}</span>
          </Button>
        </div>

        <p className="sr-only" aria-live="polite">
          {formatMoney(unitPrice)} each
        </p>
      </div>
    </dialog>
  );
}
