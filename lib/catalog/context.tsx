"use client";

import { createContext, use, useMemo } from "react";
import { type Catalog, type CatalogData, createCatalog } from "./catalog";

/**
 * The catalog, in the browser.
 *
 * The cart lives on the client and has to price itself — a line is stored as
 * ids, and turning those into money needs the menu. So the root layout fetches
 * the catalog once on the server and hands it down through this provider,
 * rather than every component fetching for itself.
 *
 * The whole menu therefore rides in the RSC payload on every page. That is the
 * same data the old hard-coded catalog put in the JavaScript bundle on every
 * page, so it is a wash in bytes — and it now updates without a deploy.
 */
const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({
  data,
  children,
}: {
  data: CatalogData;
  children: React.ReactNode;
}) {
  // Rebuilding the lookup maps on every render would hand every consumer a new
  // object identity and re-run their memos with it.
  const catalog = useMemo(() => createCatalog(data), [data]);

  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

export function useCatalog(): Catalog {
  const catalog = use(CatalogContext);
  if (!catalog) {
    throw new Error("useCatalog must be used inside <CatalogProvider>.");
  }
  return catalog;
}
