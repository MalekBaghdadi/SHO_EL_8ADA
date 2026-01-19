import { Food } from "@/types/food";

export function getRandomFood(
  foods: Food[],
  lastFoodId?: number
): Food {
  if (foods.length === 0) {
    throw new Error("Foods array cannot be empty");
  }

  // If there's only one food and it's the last one, return it anyway
  if (foods.length === 1) {
    return foods[0];
  }

  // Filter out the last food if lastFoodId is provided
  const availableFoods = lastFoodId
    ? foods.filter((food) => food.id !== lastFoodId)
    : foods;

  // Select a random food from available foods
  const randomIndex = Math.floor(Math.random() * availableFoods.length);
  return availableFoods[randomIndex];
}
