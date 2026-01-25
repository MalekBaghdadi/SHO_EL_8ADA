import { Food } from "@/types/food";

export type SelectionMode = "SURPRISE" | "FILTERED";

/**
 * Session-level bias for soft preference learning.
 * Values are clamped between -15 and +15.
 */
export interface SessionBias {
  attributes: Record<string, number>;
  tags: Record<string, number>;
}

export const EMPTY_SESSION_BIAS: SessionBias = {
  attributes: {},
  tags: {},
};

export interface SelectionParams {
  foods: Food[];
  selectedTags: string[];
  aiIntent?: {
    exclude?: string[];
  } | null;
  lastFoodId?: number;
  excludedFoodIds?: number[];
  sessionBias?: SessionBias;
  decisionTightness?: number;
}

export interface SelectionResult {
  selectedFood: Food | null;
  debug: {
    mode: SelectionMode;
    poolSize: number;
    filteredCount?: number;
    excludedLastFood: boolean;
    excludedCount?: number;
    appliedBias?: number;
    decisionTightness: number;
    effectiveBiasMultiplier: number;
    effectivePenaltyMultiplier: number;
  };
}

/**
 * Selects a food item based on the current mode.
 * 
 * Mode Determination:
 * - SURPRISE: When no tags are selected. Ignores all filters/weights.
 * - FILTERED: When tags are selected. Applies tag filters and intent exclusions.
 */
export function selectFood({
  foods,
  selectedTags,
  aiIntent,
  lastFoodId,
  excludedFoodIds,
  sessionBias,
  decisionTightness: rawTightness,
}: SelectionParams): SelectionResult {
  // 1. Determine Mode and Guardrails
  const mode: SelectionMode = selectedTags.length === 0 ? "SURPRISE" : "FILTERED";
  const tightness = Math.max(0, Math.min(1, rawTightness ?? 0.6));

  // Multipliers based on tightness
  // Tight (1.0) -> Strong bias (2x), Strong penalty (1.5x)
  // Loose (0.0) -> Weak bias (0.5x), Weak penalty (0.2x)
  const biasMultiplier = 0.5 + (tightness * 1.5);
  const penaltyMultiplier = 0.2 + (tightness * 1.3);

  let candidateFoods = foods;

  // 2. Apply Logic based on Mode
  if (mode === "SURPRISE") {
    // Surprise Mode: Use full list, ignore all filters
    // (We still exclude the last shown food to avoid immediate repetition, handled by getRandomFood)
    candidateFoods = foods;
  } else {
    // Filtered Mode: Apply existing filtering logic

    // Apply tag filter (OR logic)
    if (selectedTags.length > 0) {
      candidateFoods = candidateFoods.filter((food) =>
        selectedTags.some((tag) => food.tags.includes(tag))
      );
    }

    // Apply AI intent exclusions
    if (aiIntent?.exclude && aiIntent.exclude.length > 0) {
      candidateFoods = candidateFoods.filter(
        (food) => !aiIntent.exclude!.includes(food.category)
      );
    }

    // Fallback: If no foods match filters, use all foods (preserving existing behavior)
    if (candidateFoods.length === 0) {
      candidateFoods = foods;
    }
  }

  // 3. Apply Session-Level Rejections
  // User-driven "Not this" exclusions for current session
  let excludedCount = 0;
  if (excludedFoodIds && excludedFoodIds.length > 0) {
    const beforeExclusion = candidateFoods.length;
    const filteredCandidates = candidateFoods.filter(
      (food) => !excludedFoodIds.includes(food.id)
    );

    // Only apply exclusion if we still have candidates
    if (filteredCandidates.length > 0) {
      candidateFoods = filteredCandidates;
      excludedCount = beforeExclusion - filteredCandidates.length;
    }
    // Otherwise, keep original candidates (fallback: allow rejected if no other option)
  }

  // 4. Apply Anti-Repeat Exclusion
  // Prevent the same food from appearing consecutively
  let excludedLastFood = false;
  if (lastFoodId) {
    const filteredCandidates = candidateFoods.filter(
      (food) => food.id !== lastFoodId
    );

    // Only apply exclusion if we still have candidates after filtering
    if (filteredCandidates.length > 0) {
      candidateFoods = filteredCandidates;
      excludedLastFood = true;
    }
    // Otherwise, keep original candidates (fallback: allow repeat if no other option)
  }

  // 5. Select Food (with optional bias weighting)
  // In SURPRISE mode, ignore bias entirely
  let selectedFood: Food | null = null;
  let appliedBias = 0;

  if (candidateFoods.length > 0) {
    if (mode === "SURPRISE" || !sessionBias) {
      // Pure random selection
      const randomIndex = Math.floor(Math.random() * candidateFoods.length);
      selectedFood = candidateFoods[randomIndex];
    } else {
      // Weighted selection based on session bias
      const scores = candidateFoods.map((food) => {
        let score = 100; // Base score

        // Apply attribute bias
        if (food.attributes) {
          for (const [key, values] of Object.entries(food.attributes)) {
            if (Array.isArray(values)) {
              for (const val of values) {
                const bias = sessionBias.attributes[`${key}:${val}`] || 0;
                score += bias * biasMultiplier;
              }
            }
          }
        }

        // Apply tag bias
        for (const tag of food.tags) {
          const bias = sessionBias.tags[tag] || 0;
          score += bias * biasMultiplier;
        }

        return { food, score: Math.max(score, 1) }; // Minimum score of 1
      });

      // Calculate total applied bias for debug
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      appliedBias = avgScore - 100;

      // Weighted random selection
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      let random = Math.random() * totalScore;

      for (const { food, score } of scores) {
        random -= score;
        if (random <= 0) {
          selectedFood = food;
          break;
        }
      }

      // Fallback if something went wrong
      if (!selectedFood) {
        selectedFood = candidateFoods[0];
      }
    }
  }

  return {
    selectedFood,
    debug: {
      mode,
      poolSize: candidateFoods.length,
      filteredCount: foods.length - candidateFoods.length,
      excludedLastFood,
      excludedCount,
      appliedBias: mode === "FILTERED" ? appliedBias : undefined,
      decisionTightness: tightness,
      effectiveBiasMultiplier: biasMultiplier,
      effectivePenaltyMultiplier: penaltyMultiplier,
    },
  };
}

// Bias update constants
const REJECTION_PENALTY = -5;
const ACCEPTANCE_BONUS = 3;
const BIAS_CLAMP_MIN = -15;
const BIAS_CLAMP_MAX = 15;

/**
 * Update session bias based on food rejection.
 * Applies negative bias to rejected food's attributes and tags.
 */
export function updateBiasOnReject(
  currentBias: SessionBias,
  food: Food
): SessionBias {
  const newBias = { ...currentBias };
  newBias.attributes = { ...currentBias.attributes };
  newBias.tags = { ...currentBias.tags };

  // Apply penalty to attributes
  if (food.attributes) {
    for (const [key, values] of Object.entries(food.attributes)) {
      if (Array.isArray(values)) {
        for (const val of values) {
          const biasKey = `${key}:${val}`;
          const current = newBias.attributes[biasKey] || 0;
          newBias.attributes[biasKey] = clamp(current + REJECTION_PENALTY);
        }
      }
    }
  }

  // Apply penalty to tags
  for (const tag of food.tags) {
    const current = newBias.tags[tag] || 0;
    newBias.tags[tag] = clamp(current + REJECTION_PENALTY);
  }

  return newBias;
}

/**
 * Update session bias based on implicit acceptance.
 * Applies positive bias when user moves past a food without rejecting.
 */
export function updateBiasOnAccept(
  currentBias: SessionBias,
  food: Food
): SessionBias {
  const newBias = { ...currentBias };
  newBias.attributes = { ...currentBias.attributes };
  newBias.tags = { ...currentBias.tags };

  // Apply bonus to attributes
  if (food.attributes) {
    for (const [key, values] of Object.entries(food.attributes)) {
      if (Array.isArray(values)) {
        for (const val of values) {
          const biasKey = `${key}:${val}`;
          const current = newBias.attributes[biasKey] || 0;
          newBias.attributes[biasKey] = clamp(current + ACCEPTANCE_BONUS);
        }
      }
    }
  }

  // Apply bonus to tags
  for (const tag of food.tags) {
    const current = newBias.tags[tag] || 0;
    newBias.tags[tag] = clamp(current + ACCEPTANCE_BONUS);
  }

  return newBias;
}

function clamp(value: number): number {
  return Math.max(BIAS_CLAMP_MIN, Math.min(BIAS_CLAMP_MAX, value));
}
