/**
 * Everything about the shop that isn't the menu.
 *
 * The address is real. TODO(owner): the phone number, email, hours and social
 * handles are still placeholders — the menu document supplied the drinks and
 * their prices and nothing else. Replace them before the site goes live; they
 * are collected here so it is one edit rather than a hunt through JSX.
 */

/**
 * Sales tax, applied to the whole subtotal at checkout.
 *
 * TODO(owner): 8.25% is a placeholder, NOT the rate for this address. The shop
 * is in Golden Valley (Hennepin County, MN), so the real figure is the Minnesota
 * state rate plus the county and metro-area local taxes that apply to prepared
 * food and beverages. Confirm the combined rate with the MN Department of
 * Revenue and set it here — this number is charged to customers.
 */
export const TAX_RATE = 0.0825;

export interface DayHours {
  /** Display label, e.g. "Mon – Thu". */
  days: string;
  /** Display value, e.g. "11:00 AM – 9:00 PM". */
  hours: string;
}

export const SITE = {
  name: "MiTea",
  /**
   * The shop's own strapline on its Square site is:
   *
   *   "MiTea: Golden Valley's home for bubble tea, mochi donuts, banh mi,
   *    and more — all under one roof."
   *
   * That is the line to use — but NOT until the catalog carries the food. The
   * menu here is drinks and donuts only (see the README), and promising banh mi
   * on a site that cannot sell it is worse branding than a narrower true claim.
   * Swap both strings below once the food categories land.
   */
  tagline: "MiTea, brewed fresh. Mochi donuts, fried to order.",
  description:
    "MiTea serves fresh-brewed milk teas, fruit teas, cheese-foam Chizu drinks and mochi donuts made through the day. Order online for pickup.",

  phone: "(555) 010-0100",
  email: "hello@mitea.example",

  address: {
    street: "7724 Olson Mem Hwy",
    city: "Golden Valley",
    state: "MN",
    zip: "55427",
  },

  hours: [
    { days: "Monday – Thursday", hours: "11:00 AM – 9:00 PM" },
    { days: "Friday – Saturday", hours: "11:00 AM – 10:00 PM" },
    { days: "Sunday", hours: "12:00 PM – 8:00 PM" },
  ] satisfies DayHours[],

  /** Shown in the header strip. Keep short. */
  hoursSummary: "Open daily · 11 AM – 9 PM",

  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    facebook: "https://facebook.com/",
  },
} as const;

export function formattedAddress(): string {
  const { street, city, state, zip } = SITE.address;
  return `${street}, ${city}, ${state} ${zip}`;
}

/**
 * Pickup windows offered at checkout. Relative minutes from "now" rather than
 * wall-clock times, so the list never goes stale and never needs the shop's
 * timezone. TODO(owner): confirm the shortest realistic prep time.
 */
export const PICKUP_WINDOWS = [
  { value: "asap", label: "As soon as possible (about 15 min)" },
  { value: "30", label: "In 30 minutes" },
  { value: "45", label: "In 45 minutes" },
  { value: "60", label: "In 1 hour" },
  { value: "90", label: "In 1 hour 30 minutes" },
] as const;
