"use client";

import { THEME_PRESETS } from "@/lib/theme/presets";
import { useTheme } from "@/lib/theme/provider";

/**
 * Brand preset switcher.
 *
 * Not a customer feature — it exists so the owner can see the site in each
 * palette before picking one. Rendered only when
 * `NEXT_PUBLIC_SHOW_THEME_PICKER=1`, so it can be enabled on a preview
 * deployment and stays out of the production bundle's markup otherwise.
 *
 * The env var is read in the layout rather than here: `process.env` is inlined
 * at build time, and keeping the check at the boundary means this component is
 * never mounted at all when the flag is off.
 */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-card border border-border-strong bg-surface-raised p-3 shadow-overlay">
      <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.14em] text-content-subtle uppercase">
        Brand preset
      </p>
      <div className="flex gap-1.5">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setTheme(preset.id)}
            title={`${preset.name} — ${preset.note}`}
            aria-pressed={theme === preset.id}
            className={`rounded-control px-3 py-1.5 text-xs font-semibold transition-colors ${
              theme === preset.id
                ? "bg-primary text-on-primary"
                : "bg-surface-sunken text-content-muted hover:bg-primary-soft hover:text-on-primary-soft"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
