export type Meal = "breakfast" | "lunch" | "dinner" | "dessert";
export type Protein = "chicken" | "meat" | "fish" | "veggie";
export type Source = "home" | "out";
export type Mood = "light" | "heavy" | "comfort" | "healthy" | "quick" | "sweet" | "spicy" | "fresh";

export interface Dish {
  id: string;
  name: string;
  nameAr: string;
  blurb: string;
  origin: string;
  meals: Meal[];
  protein: Protein[];
  source: Source[];
  moods: Mood[];
}

export interface Filters {
  meal: Meal | null;
  protein: Protein[];
  source: Source | null;
  moods: Mood[];
}

export const EMPTY_FILTERS: Filters = { meal: null, protein: [], source: null, moods: [] };

export interface HistoryEntry {
  id: string;
  at: number;
}
