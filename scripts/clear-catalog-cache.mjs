/**
 * Drops Next's cached Airtable reads so the next request re-fetches the menu.
 *
 * The catalog is cached for five minutes (`CATALOG_REVALIDATE_SECONDS`), which
 * is the right latency in production but a nuisance while working: edit a price
 * in Airtable and the running server keeps serving the old one until the window
 * lapses. Deleting the cache directory collapses that wait to zero.
 *
 * The two servers keep their caches in different places, and neither is cleared
 * by restarting — both survive on disk — so both are removed here.
 *
 * This is a development convenience. In production the admin tools call
 * `updateCatalog()` (lib/catalog/revalidate.ts) instead, which expires the same
 * data through Next rather than by deleting files under it.
 */

import { rmSync } from "node:fs";

const CACHES = [
  ".next/dev/cache", // next dev
  ".next/cache", // next build / next start
];

for (const path of CACHES) {
  rmSync(path, { recursive: true, force: true });
  console.log(`cleared ${path}`);
}

console.log(
  "\nRestart the server (or just reload, if it is already running) and the menu re-reads Airtable.",
);
