"use client";

import { createContext, use, useCallback, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isThemeId,
  type ThemeId,
} from "./presets";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The selected preset lives in localStorage and on `<html data-theme>`, not in
 * React — the inline script below applies it before React has even loaded. So
 * it is read with `useSyncExternalStore` rather than mirrored into state by an
 * effect: React reads the real value on every render, the server snapshot is
 * the default, and a change in another tab arrives through the same path.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // `storage` fires for other tabs only, which is exactly the case a local
  // setTheme cannot cover; `notify()` handles this tab.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

function getSnapshot(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // Storage unavailable (private mode, blocked cookies). Fall through to the
    // attribute, which `setTheme` writes regardless of whether storage worked —
    // so the switcher still tracks the applied theme for this visit.
  }
  const applied = document.documentElement.getAttribute("data-theme");
  return isThemeId(applied) ? applied : DEFAULT_THEME;
}

function getServerSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

/**
 * Applies the stored preset to <html> before first paint.
 *
 * The server cannot know which preset this visitor picked, so without this the
 * page would paint in the default palette and then snap to theirs. Kept tiny
 * and failure-tolerant — a browser with storage blocked keeps the default.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: ThemeId) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the choice just won't survive a reload. The attribute above
      // has already taken effect, so the switch still works for this visit.
    }
    notify();
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }
  return context;
}
