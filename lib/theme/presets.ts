/**
 * Brand presets. Each id matches a `[data-theme="…"]` block in
 * `styles/tokens.css`; the provider writes the id onto <html> and CSS does the
 * rest. Adding a preset is two edits — a block there, an entry here — and no
 * component changes.
 */

export const THEME_PRESETS = [
  {
    id: "mitea",
    name: "MiTea",
    note: "The logo palette: cocoa brown, donut pink, cream.",
  },
  { id: "blossom", name: "Blossom", note: "Pink-led, like the shop walls." },
  { id: "matcha", name: "Matcha", note: "Led by the green cup lid." },
  { id: "taro", name: "Taro", note: "Purple, for a different direction." },
] as const;

export type ThemeId = (typeof THEME_PRESETS)[number]["id"];

/** The shop's real branding, sampled from its logo. */
export const DEFAULT_THEME: ThemeId = "mitea";

/** localStorage key. Bump the suffix if the preset ids ever change meaning. */
export const THEME_STORAGE_KEY = "mitea.theme.v1";

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_PRESETS.some((preset) => preset.id === value);
}
