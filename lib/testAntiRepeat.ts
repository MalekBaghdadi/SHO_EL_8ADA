import { selectFood } from './foodSelector';
import { Food } from '@/types/food';

// Mock Data
const mockFoods: Food[] = [
  { id: 1, name3ar: "Burger", nameAr: "برجر", mealType: "main", tags: ["heavy"], imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1200&auto=format&fit=crop", attributes: {} },
  { id: 2, name3ar: "Salad", nameAr: "سلطة", mealType: "appetizer", tags: ["light", "fresh"], imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800", attributes: {} },
  { id: 3, name3ar: "Pizza", nameAr: "بيتزا", mealType: "main", tags: ["heavy", "comfort"], imageUrl: "https://images.unsplash.com/photo-1564936281291-294551497d81?q=80&w=1200&auto=format&fit=crop", attributes: {} },
];

console.log("=== Testing Anti-Repeat Logic ===\n");

// Test 1: No last food (first selection)
console.log("Test 1: First Selection (No Last Food)");
const result1 = selectFood({
  foods: mockFoods,
  selectedTags: [],
  aiIntent: null,
  lastFoodId: undefined,
});
console.log(`Selected: ${result1.selectedFood?.name3ar}`);
console.log(`Excluded Last Food: ${result1.debug.excludedLastFood}`);
if (!result1.debug.excludedLastFood) {
  console.log("✅ PASS: No exclusion on first selection");
} else {
  console.log("❌ FAIL: Should not exclude on first selection");
}
console.log("\n");

// Test 2: With last food (should exclude)
console.log("Test 2: Second Selection (With Last Food)");
const lastId = result1.selectedFood?.id;
const result2 = selectFood({
  foods: mockFoods,
  selectedTags: [],
  aiIntent: null,
  lastFoodId: lastId,
});
console.log(`Last Food ID: ${lastId}`);
console.log(`Selected: ${result2.selectedFood?.name3ar} (ID: ${result2.selectedFood?.id})`);
console.log(`Excluded Last Food: ${result2.debug.excludedLastFood}`);
if (result2.debug.excludedLastFood && result2.selectedFood?.id !== lastId) {
  console.log("✅ PASS: Excluded last food successfully");
} else {
  console.log("❌ FAIL: Did not exclude last food");
}
console.log("\n");

// Test 3: Edge case - only one food
console.log("Test 3: Edge Case (Only One Food Available)");
const singleFood: Food[] = [{ id: 1, name3ar: "Only Food", nameAr: "طعام", mealType: "main", tags: ["comfort"], imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800", attributes: {} }];
const result3 = selectFood({
  foods: singleFood,
  selectedTags: [],
  aiIntent: null,
  lastFoodId: 1,
});
console.log(`Selected: ${result3.selectedFood?.name3ar}`);
console.log(`Excluded Last Food: ${result3.debug.excludedLastFood}`);
if (result3.selectedFood?.id === 1 && !result3.debug.excludedLastFood) {
  console.log("✅ PASS: Fallback triggered (returned same food when no alternatives)");
} else {
  console.log("❌ FAIL: Should return the only food available");
}
console.log("\n");

// Test 4: Multiple consecutive selections
console.log("Test 4: Multiple Consecutive Selections");
let currentId = undefined;
let consecutiveRepeats = 0;
for (let i = 0; i < 10; i++) {
  const result = selectFood({
    foods: mockFoods,
    selectedTags: [],
    aiIntent: null,
    lastFoodId: currentId,
  });
  if (result.selectedFood?.id === currentId) {
    consecutiveRepeats++;
  }
  console.log(`Selection ${i + 1}: ${result.selectedFood?.name3ar} (Excluded: ${result.debug.excludedLastFood})`);
  currentId = result.selectedFood?.id;
}
if (consecutiveRepeats === 0) {
  console.log("✅ PASS: No consecutive repeats in 10 selections");
} else {
  console.log(`❌ FAIL: Found ${consecutiveRepeats} consecutive repeat(s)`);
}
