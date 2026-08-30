/**
 * Seeds the Airtable base from the menu that used to be hard-coded.
 *
 * Run with `npm run seed:airtable`. Idempotent: every table is upserted on its
 * Key field, so running it twice changes nothing and running it after an edit
 * in Airtable overwrites that edit with what is in `lib/catalog/seed/`. That
 * last part is the point — this is a one-way import to get the base populated,
 * not a sync. Once the owner starts editing in Airtable, stop running it.
 *
 * Photos are uploaded only where a record has none, so re-running does not
 * replace a photo the owner swapped in.
 *
 * Executed by Node's built-in TypeScript stripping (Node 24), so the seed data
 * modules are imported directly and nothing needs compiling.
 */

import { readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { CATEGORIES } from "../lib/catalog/seed/categories.ts";
import { ITEMS } from "../lib/catalog/seed/items.ts";
import { MODIFIER_GROUPS } from "../lib/catalog/seed/modifiers.ts";

const TABLES = {
  categories: "tblgca4oYPD3dFrMu",
  items: "tblScotkD7tAvhJXS",
  groups: "tbl2wVNxBqmp9Kkfi",
  options: "tblqiFKneIcoKbP6q",
} as const;

const PHOTO_FIELD_IDS = {
  categories: "fldtZq6xEJZyZyNDa",
  items: "fld2AMnEj4qjmQJw3",
} as const;

const API_ROOT = "https://api.airtable.com/v0";
const CONTENT_ROOT = "https://content.airtable.com/v0";

/** Airtable allows 5 requests/second per base. Stay comfortably under it. */
const REQUEST_INTERVAL_MS = 220;

loadEnvLocal();

const API_KEY = required("AIRTABLE_API_KEY");
const BASE_ID = required("AIRTABLE_BASE_ID");

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

let lastRequestAt = 0;

await main();

async function main(): Promise<void> {
  // Categories first, then options, then groups (which link options), then
  // items (which link both). Each step needs the record ids from the last.
  const categoryIds = await upsert(
    "Menu Categories",
    TABLES.categories,
    CATEGORIES.map((category, index) => ({
      Key: category.id,
      Name: category.name,
      Slug: category.slug,
      Description: category.description,
      "Image Fallback Path": category.image ?? "",
      "Sort Order": (index + 1) * 10,
      Status: "Active",
    })),
  );

  const optionIds = await upsert(
    "Modifier Options",
    TABLES.options,
    dedupeByKey(
      MODIFIER_GROUPS.flatMap((group) =>
        group.options.map((option, index) => ({
          Key: option.id,
          Name: option.name,
          "Price Delta": option.priceDelta / 100,
          "Is Default": option.isDefault === true,
          "Sort Order": (index + 1) * 10,
          Status: "Active",
        })),
      ),
    ),
  );

  const groupIds = await upsert(
    "Modifier Groups",
    TABLES.groups,
    MODIFIER_GROUPS.map((group, index) => ({
      Key: group.id,
      Name: group.name,
      Hint: group.hint ?? "",
      Selection: group.selection,
      Required: group.required,
      Min: group.min ?? null,
      Max: group.max ?? null,
      Options: group.options.map((option) => recordId(optionIds, option.id)),
      "Sort Order": (index + 1) * 10,
    })),
  );

  // Drinks share one photo per series, so only the mochi donut items carry a
  // photo of their own; the rest inherit their category's. Keeping the item
  // photo blank is what makes swapping a series shot a one-cell edit.
  const itemsWithOwnPhoto = new Set(
    ITEMS.filter((item) => item.categoryId === "mochi-donuts").map((item) => item.id),
  );

  const itemsPerCategory = new Map<string, number>();

  await upsert(
    "Menu Items",
    TABLES.items,
    ITEMS.map((item) => {
      const position = (itemsPerCategory.get(item.categoryId) ?? 0) + 1;
      itemsPerCategory.set(item.categoryId, position);

      return {
        Key: item.id,
        Name: item.name,
        Slug: item.slug,
        Description: item.description,
        "Base Price": item.basePrice / 100,
        Category: [recordId(categoryIds, item.categoryId)],
        "Image Fallback Path": itemsWithOwnPhoto.has(item.id) ? (item.image ?? "") : "",
        Tags: item.tags,
        "Modifier Groups": item.modifierGroupIds.map((id) => recordId(groupIds, id)),
        "Sort Order": position * 10,
        Status: "Active",
        "Square Catalog Object ID": item.squareCatalogObjectId ?? "",
      };
    }),
  );

  await uploadPhotos(
    "Menu Categories",
    TABLES.categories,
    PHOTO_FIELD_IDS.categories,
    CATEGORIES.filter((category) => category.image).map((category) => ({
      recordId: recordId(categoryIds, category.id),
      path: category.image as string,
    })),
  );

  const itemRecordIds = await keysToRecordIds(TABLES.items);
  await uploadPhotos(
    "Menu Items",
    TABLES.items,
    PHOTO_FIELD_IDS.items,
    ITEMS.filter((item) => itemsWithOwnPhoto.has(item.id) && item.image).map((item) => ({
      recordId: recordId(itemRecordIds, item.id),
      path: item.image as string,
    })),
  );

  console.log("\nDone. The site reads from Airtable now.");
}

/**
 * Creates or updates records, matching on Key.
 *
 * Airtable's upsert takes 10 records per request and returns them in order,
 * which is how the Key → record id map below is built without a second read.
 */
async function upsert(
  label: string,
  tableId: string,
  rows: Array<Record<string, unknown>>,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();

  for (const batch of chunk(rows, 10)) {
    const response = await request<{ records: AirtableRecord[] }>(
      `${API_ROOT}/${BASE_ID}/${tableId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          performUpsert: { fieldsToMergeOn: ["Key"] },
          // `typecast` lets select fields accept a name that does not exist
          // yet, which is what makes a new tag or status value just work.
          typecast: true,
          records: batch.map((fields) => ({ fields })),
        }),
      },
    );

    for (const record of response.records) {
      ids.set(String(record.fields.Key), record.id);
    }
  }

  console.log(`${label}: ${rows.length} records`);
  return ids;
}

/** Reads back Key → record id, for tables written before their ids were needed. */
async function keysToRecordIds(tableId: string): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100", "fields[]": "Key" });
    if (offset) params.set("offset", offset);

    const page = await request<{ records: AirtableRecord[]; offset?: string }>(
      `${API_ROOT}/${BASE_ID}/${tableId}?${params.toString()}`,
      { method: "GET" },
    );

    for (const record of page.records) {
      if (record.fields.Key) ids.set(String(record.fields.Key), record.id);
    }
    offset = page.offset;
  } while (offset);

  return ids;
}

/**
 * Uploads local photos into an attachment field.
 *
 * Skips any record that already has one, so a photo the owner uploaded is never
 * clobbered by a re-run. Airtable's upload endpoint takes base64 and caps a
 * file at 5MB — every image in /public is well under that.
 */
async function uploadPhotos(
  label: string,
  tableId: string,
  fieldId: string,
  targets: Array<{ recordId: string; path: string }>,
): Promise<void> {
  let uploaded = 0;

  for (const target of targets) {
    const existing = await request<AirtableRecord>(
      `${API_ROOT}/${BASE_ID}/${tableId}/${target.recordId}`,
      { method: "GET" },
    );
    const current = existing.fields[fieldId] ?? existing.fields.Photo;
    if (Array.isArray(current) && current.length > 0) continue;

    const file = join(process.cwd(), "public", target.path.replace(/^\//, ""));
    const bytes = readFileSync(file);

    await request(
      `${CONTENT_ROOT}/${BASE_ID}/${target.recordId}/${fieldId}/uploadAttachment`,
      {
        method: "POST",
        body: JSON.stringify({
          contentType: contentTypeFor(file),
          file: bytes.toString("base64"),
          filename: basename(file),
        }),
      },
    );
    uploaded += 1;
  }

  console.log(`${label}: ${uploaded} photos uploaded, ${targets.length - uploaded} already present`);
}

async function request<T = unknown>(url: string, init: RequestInit): Promise<T> {
  // Airtable rate-limits at 5 req/sec per base and answers a burst with a 429
  // and a 30-second lockout, which is far more expensive than pacing.
  const wait = lastRequestAt + REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Airtable ${response.status} on ${url}\n${detail.slice(0, 500)}`);
  }

  return (await response.json()) as T;
}

function recordId(ids: Map<string, string>, key: string): string {
  const id = ids.get(key);
  if (!id) throw new Error(`No Airtable record for key "${key}" — seed order is wrong.`);
  return id;
}

/** The donut flavour groups share one option list, so keys repeat across groups. */
function dedupeByKey(
  rows: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const seen = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const key = String(row.Key);
    if (!seen.has(key)) seen.set(key, row);
  }
  return [...seen.values()];
}

function chunk<T>(values: readonly T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    batches.push(values.slice(index, index + size));
  }
  return batches;
}

function contentTypeFor(file: string): string {
  const extension = extname(file).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}

/** `next dev` loads .env.local for us; a bare `node` run has to do it itself. */
function loadEnvLocal(): void {
  let contents: string;
  try {
    contents = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!match) continue;
    const [, name, rawValue] = match;
    process.env[name] ??= rawValue.replace(/^["']|["']$/g, "");
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.local.`);
  return value;
}
