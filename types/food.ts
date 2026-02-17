import { FoodAttributes } from './attributes';

export type FoodCategory = "breakfast" | "main" | "snack" | "dessert";

export type Food = {
  id: number;
  name3ar: string;
  nameAr: string;
  category: FoodCategory;
  tags: string[];
  image?: string; // @deprecated - use imageKey and resolveFoodImage(food)
  imageKey: string; // Required for deterministic resolution
  attributes?: FoodAttributes;
};
