import { Food } from "@/types/food";

/**
 * Resolves the deterministic image path for a food item.
 * Enforces the contract: /images/foods/{imageKey}.webp
 */
export function resolveFoodImage(food: Food): string {
    return `/images/foods/${food.imageKey}.webp`;
}
