import { revalidateTag, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/airtable/client";

/**
 * Dropping the cached menu after an owner edit.
 *
 * The catalog is otherwise cached for five minutes, which is the right latency
 * for an edit made in Airtable itself but far too slow for one made through the
 * owner tools — mark a drink sold out and it should be gone from the site by
 * the time the page reloads. Every admin write should end with one of these.
 */

/**
 * Expires the menu immediately: the next request re-reads Airtable and waits
 * for it. Read-your-own-writes, which is what an owner saving a price expects.
 *
 * Server Actions only — that is the whole surface the owner tools will use.
 */
export function updateCatalog(): void {
  updateTag(CATALOG_TAG);
}

/**
 * The same, from a Route Handler, where `updateTag` cannot be called.
 *
 * Weaker: `"max"` marks the menu stale rather than expiring it, so the next
 * visitor is served the old menu while the new one loads behind them. Fine for
 * a webhook out of Airtable, not for a save the owner is watching.
 */
export function revalidateCatalog(): void {
  revalidateTag(CATALOG_TAG, "max");
}
