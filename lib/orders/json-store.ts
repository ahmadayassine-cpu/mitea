import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { OrderStore } from "./store";
import type { NewOrder, Order } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

/**
 * Orders on disk as a single JSON array.
 *
 * Deliberately the simplest thing that works for a skeleton: it survives a dev
 * server restart, needs no service to install, and is trivial to read while
 * testing. It is **not** a production store — it holds every order in memory on
 * each write and serialises all writes through one promise chain. Swap it via
 * `getOrderStore()` when the real backing arrives.
 */
export class JsonFileOrderStore implements OrderStore {
  /**
   * Writes are chained rather than run concurrently. Two checkouts landing in
   * the same tick would otherwise both read the same array and the second write
   * would drop the first order.
   */
  #queue: Promise<unknown> = Promise.resolve();

  async create(input: NewOrder): Promise<Order> {
    const order: Order = {
      ...input,
      id: randomUUID(),
      pickupCode: pickupCode(),
      createdAt: new Date().toISOString(),
      status: "received",
    };

    const write = this.#queue.then(async () => {
      const orders = await readOrders();
      orders.push(order);
      await writeOrders(orders);
    });

    // Keep the chain alive even if this write fails, so one bad write does not
    // wedge every subsequent order.
    this.#queue = write.catch(() => undefined);
    await write;

    return order;
  }

  async get(id: string): Promise<Order | null> {
    const orders = await readOrders();
    return orders.find((order) => order.id === id) ?? null;
  }
}

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

/**
 * Write to a temp file and rename over the target. A crash mid-write then
 * leaves the previous orders.json intact rather than a truncated one.
 */
async function writeOrders(orders: Order[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${ORDERS_FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(orders, null, 2), "utf8");
  await rename(temp, ORDERS_FILE);
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/**
 * A short code for the counter. Excludes I, O, 0 and 1 — this gets read aloud
 * and written on a cup, and those are the characters people get wrong.
 */
function pickupCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MT-${code}`;
}
