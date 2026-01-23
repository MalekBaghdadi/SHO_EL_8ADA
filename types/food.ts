import { FoodAttributes } from './attributes';

export type FoodCategory = "breakfast" | "main" | "snack" | "dessert";

export type Food = {
  id: number;
  name3ar: string;
  nameAr: string;
  category: FoodCategory;
  tags: string[];
  image: string;
  attributes?: FoodAttributes;
};
