/**
 * Multi-Dimensional Attribute System - Type Definitions
 * 
 * This module defines the core types for the registry-driven validation system.
 */

/**
 * Conflict rule defining which values are incompatible with each other
 */
export interface ConflictRule {
  /** The value that triggers the conflict check */
  values: string[];
  /** Values that cannot coexist with the trigger values */
  incompatibleWith: string[];
}

/**
 * Definition of a single dimension in the registry
 */
export interface DimensionDefinition {
  /** Human-readable label for the dimension */
  label: string;
  /** Allowed values for this dimension */
  values: string[];
  /** Whether multiple values can be selected */
  multiSelect: boolean;
  /** Whether values in this dimension are mutually exclusive */
  mutuallyExclusive: boolean;
  /** Optional conflict rules for specific value combinations */
  conflicts?: ConflictRule[];
}

/**
 * The complete dimension registry
 * Key = dimension name, Value = dimension definition
 */
export type DimensionRegistry = Record<string, DimensionDefinition>;

/**
 * Attributes object on a food item
 * Key = dimension name, Value = array of dimension values
 */
export type FoodAttributes = Record<string, string[]>;

/**
 * Validation error types
 */
export enum ValidationErrorType {
  UNKNOWN_DIMENSION = 'UNKNOWN_DIMENSION',
  INVALID_VALUE = 'INVALID_VALUE',
  NOT_AN_ARRAY = 'NOT_AN_ARRAY',
  EMPTY_ARRAY = 'EMPTY_ARRAY',
  MULTI_SELECT_VIOLATION = 'MULTI_SELECT_VIOLATION',
  MUTUAL_EXCLUSIVITY_VIOLATION = 'MUTUAL_EXCLUSIVITY_VIOLATION',
  CONFLICT_VIOLATION = 'CONFLICT_VIOLATION',
}

/**
 * Detailed validation error information
 */
export interface ValidationError {
  type: ValidationErrorType;
  dimension: string;
  message: string;
  invalidValues?: string[];
  conflictingValues?: string[];
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Extended Food type with attributes
 */
export interface Food {
  id: number;
  name3ar: string;
  nameAr: string;
  category: string;
  tags: string[]; // Existing mood/vibe tags
  image: string;
  attributes?: FoodAttributes; // Optional multi-dimensional attributes
}
