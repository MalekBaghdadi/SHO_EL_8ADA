/**
 * Selection Weights Configuration
 * 
 * Default weight configuration for the food selection engine.
 * All bonuses and penalties are configurable.
 */

import { SelectionWeights } from '@/types/selection';

/**
 * Default selection weights
 * 
 * These values can be adjusted based on:
 * - User testing
 * - ML training
 * - A/B testing
 * - User-specific preferences
 */
export const DEFAULT_SELECTION_WEIGHTS: SelectionWeights = {
  attributes: {
    // Time of day - important but flexible
    timeOfDay: {
      matchBonus: 30,
      mismatchPenalty: -15,
    },

    // Diet type - very important for safety/preference
    dietType: {
      matchBonus: 40,
      mismatchPenalty: -5, // Gentle penalty, conflicts are hard-filtered
    },

    // Source - convenience factor, less critical
    source: {
      matchBonus: 10,
      mismatchPenalty: 0, // No penalty for wrong source
    },
  },

  // Mood/vibe tags - moderate importance
  tagMatchBonus: 5,
};

/**
 * Create custom weights by merging with defaults
 * 
 * @param overrides - Partial weights to override defaults
 * @returns Complete weight configuration
 */
export function createWeights(
  overrides?: Partial<SelectionWeights>
): SelectionWeights {
  if (!overrides) {
    return DEFAULT_SELECTION_WEIGHTS;
  }

  return {
    attributes: {
      ...DEFAULT_SELECTION_WEIGHTS.attributes,
      ...overrides.attributes,
    },
    tagMatchBonus: overrides.tagMatchBonus ?? DEFAULT_SELECTION_WEIGHTS.tagMatchBonus,
  };
}

/**
 * Preset: Strict dietary preferences
 * High penalties for mismatches
 */
export const STRICT_DIET_WEIGHTS: SelectionWeights = {
  attributes: {
    timeOfDay: {
      matchBonus: 20,
      mismatchPenalty: -10,
    },
    dietType: {
      matchBonus: 60, // Very high bonus for matching
      mismatchPenalty: -30, // High penalty for mismatch
    },
    source: {
      matchBonus: 5,
      mismatchPenalty: 0,
    },
  },
  tagMatchBonus: 3,
};

/**
 * Preset: Time-sensitive selection
 * Prioritize time of day over other factors
 */
export const TIME_PRIORITY_WEIGHTS: SelectionWeights = {
  attributes: {
    timeOfDay: {
      matchBonus: 50, // Very high bonus
      mismatchPenalty: -25, // Strong penalty
    },
    dietType: {
      matchBonus: 20,
      mismatchPenalty: -5,
    },
    source: {
      matchBonus: 10,
      mismatchPenalty: 0,
    },
  },
  tagMatchBonus: 5,
};

/**
 * Preset: Exploratory mode
 * Low penalties, encourage diversity
 */
export const EXPLORATORY_WEIGHTS: SelectionWeights = {
  attributes: {
    timeOfDay: {
      matchBonus: 15,
      mismatchPenalty: 0, // No penalty
    },
    dietType: {
      matchBonus: 25,
      mismatchPenalty: 0, // No penalty
    },
    source: {
      matchBonus: 10,
      mismatchPenalty: 0,
    },
  },
  tagMatchBonus: 8,
};
