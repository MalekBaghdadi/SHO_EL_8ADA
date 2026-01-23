/**
 * Food Selection Engine
 * 
 * Filters and ranks food items based on user preferences.
 * Uses hard filtering for conflicts and soft scoring for preferences.
 */

import { Food } from '@/types/food';
import { FoodAttributes } from '@/types/attributes';
import {
  UserPreferences,
  SelectionWeights,
  ScoredFood,
  SelectionResult,
  DimensionScore,
} from '@/types/selection';
import { findConflicts } from './attributeValidator';
import { getValidDimensions } from './dimensionRegistry';
import { DEFAULT_SELECTION_WEIGHTS } from './selectionWeights';

/**
 * Base score for all items before adjustments
 */
const BASE_SCORE = 100;

/**
 * Main selection engine - filters and ranks food items
 * 
 * @param foods - Array of food items to select from
 * @param preferences - User preferences (attributes and/or tags)
 * @param weights - Optional custom weights (uses defaults if not provided)
 * @param includeDebug - Whether to include debug information
 * @returns Ranked selection results
 */
export function selectFoods(
  foods: Food[],
  preferences: UserPreferences,
  weights: SelectionWeights = DEFAULT_SELECTION_WEIGHTS,
  includeDebug: boolean = false
): SelectionResult {
  const scoredFoods: ScoredFood[] = [];
  let filteredCount = 0;

  for (const food of foods) {
    // Phase 1: Hard Filtering
    const filterResult = hardFilter(food, preferences);

    if (filterResult.filtered) {
      filteredCount++;

      // Optionally include filtered items in results with flag
      if (includeDebug) {
        scoredFoods.push({
          food,
          finalScore: 0,
          baseScore: 0,
          dimensionScores: [],
          tagScore: 0,
          matchedTags: [],
          hardFiltered: true,
          filterReason: filterResult.reason,
        });
      }
      continue;
    }

    // Phase 2: Soft Scoring
    const scoreResult = softScore(food, preferences, weights);

    scoredFoods.push({
      food,
      finalScore: scoreResult.finalScore,
      baseScore: BASE_SCORE,
      dimensionScores: scoreResult.dimensionScores,
      tagScore: scoreResult.tagScore,
      matchedTags: scoreResult.matchedTags,
      hardFiltered: false,
    });
  }

  // Sort by final score (highest first)
  scoredFoods.sort((a, b) => b.finalScore - a.finalScore);

  return {
    items: scoredFoods,
    totalItems: foods.length,
    filteredCount,
    debugInfo: includeDebug
      ? { userPreferences: preferences, weights }
      : undefined,
  };
}

/**
 * Hard filtering - exclude items that violate conflict rules
 * 
 * @param food - Food item to check
 * @param preferences - User preferences
 * @returns Filter result with reason if filtered
 */
function hardFilter(
  food: Food,
  preferences: UserPreferences
): { filtered: boolean; reason?: string } {
  // No user attributes = no filtering
  if (!preferences.attributes || !food.attributes) {
    return { filtered: false };
  }

  // Use existing conflict detection utility
  const conflicts = findConflicts(preferences.attributes, food.attributes);

  if (conflicts.length > 0) {
    return {
      filtered: true,
      reason: conflicts.join('; '),
    };
  }

  return { filtered: false };
}

/**
 * Soft scoring - rank items based on preference matching
 * 
 * @param food - Food item to score
 * @param preferences - User preferences
 * @param weights - Weight configuration
 * @returns Scoring breakdown
 */
function softScore(
  food: Food,
  preferences: UserPreferences,
  weights: SelectionWeights
): {
  finalScore: number;
  dimensionScores: DimensionScore[];
  tagScore: number;
  matchedTags: string[];
} {
  let totalScore = BASE_SCORE;
  const dimensionScores: DimensionScore[] = [];
  let tagScore = 0;
  const matchedTags: string[] = [];

  // Score multi-dimensional attributes
  if (preferences.attributes) {
    const validDimensions = getValidDimensions();

    for (const dimension of validDimensions) {
      const userValues = preferences.attributes[dimension];

      // Skip if user hasn't specified this dimension
      if (!userValues || userValues.length === 0) {
        continue;
      }

      const itemValues = food.attributes?.[dimension];
      const weight = weights.attributes[dimension];

      // Skip if no weight configured for this dimension
      if (!weight) {
        continue;
      }

      let dimensionScore = 0;
      let matched = false;
      let reason = '';

      if (!itemValues || itemValues.length === 0) {
        // Missing dimension on item = neutral (no bonus, no penalty)
        reason = 'Item missing dimension (neutral)';
      } else {
        // Check for match (OR logic within dimension)
        const hasMatch = userValues.some((userVal) =>
          itemValues.includes(userVal)
        );

        if (hasMatch) {
          // Matching value → apply bonus
          dimensionScore = weight.matchBonus;
          matched = true;
          reason = `Matched (${weight.matchBonus > 0 ? '+' : ''}${weight.matchBonus})`;
        } else {
          // Mismatch → apply penalty
          dimensionScore = weight.mismatchPenalty;
          reason = `Mismatch (${weight.mismatchPenalty >= 0 ? '+' : ''}${weight.mismatchPenalty})`;
        }
      }

      totalScore += dimensionScore;

      dimensionScores.push({
        dimension,
        userValues,
        itemValues,
        matched,
        score: dimensionScore,
        reason,
      });
    }
  }

  // Score mood/vibe tags
  if (preferences.tags && preferences.tags.length > 0) {
    for (const tag of preferences.tags) {
      if (food.tags.includes(tag)) {
        tagScore += weights.tagMatchBonus;
        matchedTags.push(tag);
      }
    }
    totalScore += tagScore;
  }

  return {
    finalScore: totalScore,
    dimensionScores,
    tagScore,
    matchedTags,
  };
}

/**
 * Select a single random food from the top N ranked items
 * Useful for variety while respecting preferences
 * 
 * @param foods - Array of food items
 * @param preferences - User preferences
 * @param topN - Number of top items to randomly select from (default: 5)
 * @param weights - Optional custom weights
 * @returns Single random food from top N, or null if none available
 */
export function selectRandomFromTop(
  foods: Food[],
  preferences: UserPreferences,
  topN: number = 5,
  weights: SelectionWeights = DEFAULT_SELECTION_WEIGHTS
): Food | null {
  const result = selectFoods(foods, preferences, weights, false);

  // Filter out hard-filtered items
  const availableItems = result.items.filter((item) => !item.hardFiltered);

  if (availableItems.length === 0) {
    return null;
  }

  // Take top N items
  const topItems = availableItems.slice(0, Math.min(topN, availableItems.length));

  // Randomly select one
  const randomIndex = Math.floor(Math.random() * topItems.length);
  return topItems[randomIndex].food;
}

/**
 * Get only the food items (without scoring details)
 * 
 * @param foods - Array of food items
 * @param preferences - User preferences
 * @param weights - Optional custom weights
 * @returns Array of foods in ranked order
 */
export function getRankedFoods(
  foods: Food[],
  preferences: UserPreferences,
  weights: SelectionWeights = DEFAULT_SELECTION_WEIGHTS
): Food[] {
  const result = selectFoods(foods, preferences, weights, false);

  return result.items
    .filter((item) => !item.hardFiltered)
    .map((item) => item.food);
}

/**
 * Check if any foods would be available given preferences
 * Useful for validation before showing UI
 * 
 * @param foods - Array of food items
 * @param preferences - User preferences
 * @returns True if at least one food passes hard filtering
 */
export function hasAvailableFoods(
  foods: Food[],
  preferences: UserPreferences
): boolean {
  for (const food of foods) {
    const filterResult = hardFilter(food, preferences);
    if (!filterResult.filtered) {
      return true;
    }
  }
  return false;
}
