/**
 * The thin Airtable REST client the catalog is read through.
 *
 * Deliberately not the official SDK: all this needs is a paginated GET with a
 * bearer token, and going through `fetch` directly is what lets Next cache the
 * response and lets `revalidateTag` drop it the moment the owner saves an edit.
 *
 * Reads are opt-in cached (`force-cache`): Next does not cache requests that
 * carry an `Authorization` header unless asked to.
 */

const API_ROOT = "https://api.airtable.com/v0";

/** Everything the catalog reads shares one tag, so one call refreshes the menu. */
export const CATALOG_TAG = "catalog";

/**
 * How long a cached read survives without anyone asking for a refresh.
 *
 * The admin surface calls `revalidateTag(CATALOG_TAG)` after a write, so this
 * is only the backstop for edits made in Airtable itself. It is also what keeps
 * attachment URLs usable: Airtable expires them after about two hours, and a
 * five-minute window means the URLs handed to the browser are always fresh.
 */
export const CATALOG_REVALIDATE_SECONDS = 300;

export interface Attachment {
  id: string;
  url: string;
  filename: string;
  type: string;
  width?: number;
  height?: number;
}

export interface AirtableRecord<Fields> {
  id: string;
  createdTime: string;
  fields: Partial<Fields>;
}

interface ListResponse<Fields> {
  records: Array<AirtableRecord<Fields>>;
  offset?: string;
}

function credentials(): { apiKey: string; baseId: string } {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error(
      "Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env.local — see README.",
    );
  }

  return { apiKey, baseId };
}

/**
 * Every record in a table, following Airtable's `offset` pagination.
 *
 * Airtable caps a page at 100 records, so the whole menu is one or two round
 * trips. Both are cached under the same tag, so a revalidation invalidates the
 * pages together and the catalog can never be assembled from two generations.
 */
export async function listRecords<Fields>(
  tableId: string,
  options: { sort?: Array<{ field: string; direction?: "asc" | "desc" }> } = {},
): Promise<Array<AirtableRecord<Fields>>> {
  const { apiKey, baseId } = credentials();
  const records: Array<AirtableRecord<Fields>> = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);
    options.sort?.forEach((entry, index) => {
      params.set(`sort[${index}][field]`, entry.field);
      params.set(`sort[${index}][direction]`, entry.direction ?? "asc");
    });

    const response = await fetch(
      `${API_ROOT}/${baseId}/${tableId}?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "force-cache",
        next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
      },
    );

    if (!response.ok) {
      // The body carries Airtable's own error type ("NOT_FOUND",
      // "INVALID_PERMISSIONS"), which is the difference between a typo in a
      // table id and a token missing a scope. Worth keeping in the message.
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Airtable ${response.status} reading ${tableId}: ${detail.slice(0, 300)}`,
      );
    }

    const page = (await response.json()) as ListResponse<Fields>;
    records.push(...page.records);
    offset = page.offset;
  } while (offset);

  return records;
}

/** First attachment's URL, or null. Extra attachments are ignored by design. */
export function attachmentUrl(value: Attachment[] | undefined): string | null {
  return value?.[0]?.url ?? null;
}
