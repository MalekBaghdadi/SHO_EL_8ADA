import { FoodAttributes } from './attributes';
export type MealType = "appetizer" | "main" | "dessert";

export type Food = {
  id: number;
  name3ar: string;
  nameAr: string;
  mealType: MealType;
  tags: string[];
  imageUrl: string;
  attributes?: FoodAttributes;
};
