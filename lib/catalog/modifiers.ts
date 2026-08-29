import type { ModifierGroup } from "@/lib/types";

/**
 * Shared modifier groups, referenced by id from `items.ts`.
 *
 * TODO(owner): every upcharge below is a placeholder. The source menu document
 * lists drink prices only — it says nothing about size, milk or topping
 * pricing, and it does not name the mochi donut flavours. Confirm this whole
 * file before launch; the drink base prices in `items.ts` ARE from the document
 * and should not be touched.
 */
export const MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: "size",
    name: "Size",
    selection: "single",
    required: true,
    options: [
      { id: "size-regular", name: "Regular", priceDelta: 0, isDefault: true },
      { id: "size-large", name: "Large", priceDelta: 75 },
    ],
  },
  {
    id: "sugar",
    name: "Sugar level",
    selection: "single",
    required: true,
    options: [
      { id: "sugar-0", name: "0%", priceDelta: 0 },
      { id: "sugar-25", name: "25%", priceDelta: 0 },
      { id: "sugar-50", name: "50%", priceDelta: 0 },
      { id: "sugar-75", name: "75%", priceDelta: 0 },
      { id: "sugar-100", name: "100%", priceDelta: 0, isDefault: true },
    ],
  },
  {
    id: "ice",
    name: "Ice level",
    selection: "single",
    required: true,
    options: [
      { id: "ice-none", name: "No ice", priceDelta: 0 },
      { id: "ice-less", name: "Less ice", priceDelta: 0 },
      { id: "ice-regular", name: "Regular ice", priceDelta: 0, isDefault: true },
      { id: "ice-extra", name: "Extra ice", priceDelta: 0 },
    ],
  },
  {
    id: "milk",
    name: "Milk",
    selection: "single",
    required: true,
    options: [
      { id: "milk-standard", name: "House creamer", priceDelta: 0, isDefault: true },
      { id: "milk-whole", name: "Whole milk", priceDelta: 0 },
      { id: "milk-oat", name: "Oat milk", priceDelta: 75 },
      { id: "milk-almond", name: "Almond milk", priceDelta: 75 },
    ],
  },
  {
    id: "toppings",
    name: "Toppings",
    hint: "Pick up to 4",
    selection: "multiple",
    required: false,
    min: 0,
    max: 4,
    options: [
      { id: "top-boba", name: "Boba", priceDelta: 75 },
      { id: "top-lychee-jelly", name: "Lychee jelly", priceDelta: 75 },
      { id: "top-grass-jelly", name: "Grass jelly", priceDelta: 75 },
      { id: "top-aloe", name: "Aloe vera", priceDelta: 75 },
      { id: "top-popping", name: "Popping boba", priceDelta: 85 },
      { id: "top-red-bean", name: "Red bean", priceDelta: 85 },
      { id: "top-pudding", name: "Egg pudding", priceDelta: 85 },
      { id: "top-cheese-foam", name: "Cheese foam", priceDelta: 125 },
    ],
  },
];

/**
 * Mochi donut flavour picking.
 *
 * A box is one catalog item whose flavour group has `min === max === box size`,
 * so a 6-box forces exactly six picks. `multiple` selection means the same
 * flavour cannot be chosen twice — an acceptable simplification for the
 * skeleton. Per-flavour counts ("four ube, two matcha") would need a quantity
 * widget per option; revisit once the owner confirms how they take box orders.
 */
const DONUT_FLAVOURS: ModifierGroup["options"] = [
  { id: "donut-original", name: "Original glazed", priceDelta: 0 },
  { id: "donut-matcha", name: "Matcha", priceDelta: 0 },
  { id: "donut-strawberry", name: "Strawberry", priceDelta: 0 },
  { id: "donut-ube", name: "Ube", priceDelta: 0 },
  { id: "donut-chocolate", name: "Chocolate", priceDelta: 0 },
  { id: "donut-black-sesame", name: "Black sesame", priceDelta: 0 },
  { id: "donut-taro", name: "Taro", priceDelta: 0 },
  { id: "donut-cookies-cream", name: "Cookies & cream", priceDelta: 0 },
];

function donutFlavourGroup(count: number): ModifierGroup {
  return {
    id: `donut-flavors-${count}`,
    name: count === 1 ? "Flavour" : "Flavours",
    hint: count === 1 ? "Pick 1" : `Pick exactly ${count}`,
    selection: count === 1 ? "single" : "multiple",
    required: true,
    min: count,
    max: count,
    options: DONUT_FLAVOURS,
  };
}

for (const count of [1, 3, 6, 12]) {
  MODIFIER_GROUPS.push(donutFlavourGroup(count));
}

const GROUPS_BY_ID = new Map(MODIFIER_GROUPS.map((group) => [group.id, group]));

export function getModifierGroup(id: string): ModifierGroup | undefined {
  return GROUPS_BY_ID.get(id);
}

/** Resolves an item's group ids to groups, silently dropping unknown ids. */
export function getModifierGroups(ids: readonly string[]): ModifierGroup[] {
  return ids
    .map((id) => GROUPS_BY_ID.get(id))
    .filter((group): group is ModifierGroup => group !== undefined);
}
