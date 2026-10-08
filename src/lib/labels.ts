import type { Meal, Mood, Protein, Source } from "../types";

export const MEALS: { value: Meal; label: string; emoji: string; hint: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🍳", hint: "Terwi2a" },
  { value: "lunch", label: "Lunch", emoji: "🍲", hint: "8ada" },
  { value: "dinner", label: "Dinner", emoji: "🌙", hint: "3asha" },
  { value: "dessert", label: "Dessert", emoji: "🍰", hint: "Shi 7elo" },
];

export const PROTEINS: { value: Protein; label: string; emoji: string }[] = [
  { value: "chicken", label: "Chicken", emoji: "🍗" },
  { value: "meat", label: "Meat", emoji: "🥩" },
  { value: "fish", label: "Fish & seafood", emoji: "🐟" },
  { value: "veggie", label: "Veggie", emoji: "🥗" },
];

export const SOURCES: { value: Source; label: string; emoji: string; hint: string }[] = [
  { value: "home", label: "Cook at home", emoji: "🏠", hint: "Tabkha" },
  { value: "out", label: "Order / eat out", emoji: "🛵", hint: "Delivery" },
];

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "light", label: "Light", emoji: "🪶" },
  { value: "heavy", label: "Heavy", emoji: "🏋️" },
  { value: "comfort", label: "Comfort", emoji: "🫶" },
  { value: "healthy", label: "Healthy", emoji: "💪" },
  { value: "quick", label: "Quick", emoji: "⚡" },
  { value: "sweet", label: "Sweet", emoji: "🍯" },
  { value: "spicy", label: "Spicy", emoji: "🌶️" },
  { value: "fresh", label: "Fresh", emoji: "🌿" },
];

export const moodLabel = (m: Mood) => MOODS.find((x) => x.value === m)!;
export const proteinLabel = (p: Protein) => PROTEINS.find((x) => x.value === p)!;
