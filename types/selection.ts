/**
 * Selection Engine - Type Definitions
 * 
 * Types for the food selection and scoring system.
 */

import { Food } from '@/types/food';
import { FoodAttributes } from './attributes';

/**
 * User preferences for food selection
 */
export interface UserPreferences {
  /** Multi-dimensional attributes (timeOfDay, dietType, source) */
  attributes?: FoodAttributes;
  /** Existing mood/vibe tags (comfy, healthy, light, etc.) */
  tags?: string[];
}

/**
 * Weight configuration for a single dimension
 */
export interface DimensionWeight {
  /** Bonus points for matching this dimension */
  matchBonus: number;
  /** Penalty points for mismatch (negative number or 0 for no penalty) */
  mismatchPenalty: number;
}

/**
 * Complete weight configuration for all dimensions
 */
export interface SelectionWeights {
  /** Weights for multi-dimensional attributes */
  attributes: Record<string, DimensionWeight>;
  /** Weight for each matching mood/vibe tag */
  tagMatchBonus: number;
}

/**
 * Per-dimension scoring breakdown for transparency
 */
export interface DimensionScore {
  dimension: string;
  userValues: string[];
  itemValues: string[] | undefined;
  matched: boolean;
  score: number;
  reason: string;
}

/**
 * Detailed scoring information for a single food item
 */
export interface ScoredFood {
  food: Food;
  finalScore: number;
  baseScore: number;
  dimensionScores: DimensionScore[];
  tagScore: number;
  matchedTags: string[];
  hardFiltered: boolean;
  filterReason?: string;
}

/**
 * Selection result with ranked items
 */
export interface SelectionResult {
  items: ScoredFood[];
  totalItems: number;
  filteredCount: number;
  debugInfo?: {
    userPreferences: UserPreferences;
    weights: SelectionWeights;
  };
}
