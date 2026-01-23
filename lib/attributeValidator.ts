/**
 * Multi-Dimensional Attribute System - Validation Engine
 * 
 * Registry-driven validation for food item attributes.
 * Enforces all rules defined in the dimension registry.
 */

import {
  FoodAttributes,
  ValidationResult,
  ValidationError,
  ValidationErrorType,
} from '@/types/attributes';
import {
  DIMENSION_REGISTRY,
  isDimensionValid,
  getDimensionDefinition,
} from './dimensionRegistry';

/**
 * Validates food item attributes against the dimension registry
 * 
 * @param attributes - The attributes object to validate
 * @returns ValidationResult with valid flag and any errors
 */
export function validateAttributes(
  attributes: FoodAttributes | undefined
): ValidationResult {
  const errors: ValidationError[] = [];

  // Missing attributes is valid (all dimensions are optional)
  if (!attributes || Object.keys(attributes).length === 0) {
    return { valid: true, errors: [] };
  }

  // Rule 1: Dimension Integrity
  for (const dimension of Object.keys(attributes)) {
    if (!isDimensionValid(dimension)) {
      errors.push({
        type: ValidationErrorType.UNKNOWN_DIMENSION,
        dimension,
        message: `Unknown dimension "${dimension}". Valid dimensions: ${Object.keys(DIMENSION_REGISTRY).join(', ')}`,
      });
    }
  }

  // If there are unknown dimensions, fail fast
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate each dimension
  for (const [dimension, values] of Object.entries(attributes)) {
    const dimensionDef = getDimensionDefinition(dimension);

    // Rule 3: Array Enforcement
    if (!Array.isArray(values)) {
      errors.push({
        type: ValidationErrorType.NOT_AN_ARRAY,
        dimension,
        message: `Dimension "${dimension}" must be an array. Received: ${typeof values}`,
      });
      continue; // Skip further validation for this dimension
    }

    // Rule 6: Empty arrays are invalid
    if (values.length === 0) {
      errors.push({
        type: ValidationErrorType.EMPTY_ARRAY,
        dimension,
        message: `Dimension "${dimension}" cannot be an empty array. Either omit the dimension or provide values.`,
      });
      continue;
    }

    // Rule 2: Value Whitelisting
    const invalidValues = values.filter(
      (value) => !dimensionDef.values.includes(value)
    );
    if (invalidValues.length > 0) {
      errors.push({
        type: ValidationErrorType.INVALID_VALUE,
        dimension,
        message: `Invalid values for dimension "${dimension}": [${invalidValues.join(', ')}]. Valid values: [${dimensionDef.values.join(', ')}]`,
        invalidValues,
      });
    }

    // Rule 4: Multi-Select Rules
    if (!dimensionDef.multiSelect && values.length > 1) {
      errors.push({
        type: ValidationErrorType.MULTI_SELECT_VIOLATION,
        dimension,
        message: `Dimension "${dimension}" does not allow multiple values. Found ${values.length} values: [${values.join(', ')}]`,
      });
    }

    // Rule 5a: Mutual Exclusivity
    if (dimensionDef.mutuallyExclusive && values.length > 1) {
      errors.push({
        type: ValidationErrorType.MUTUAL_EXCLUSIVITY_VIOLATION,
        dimension,
        message: `Dimension "${dimension}" has mutually exclusive values. Cannot have multiple values: [${values.join(', ')}]`,
        conflictingValues: values,
      });
    }

    // Rule 5b: Conflict Rules
    if (dimensionDef.conflicts) {
      for (const conflict of dimensionDef.conflicts) {
        // Check if any conflict trigger values are present
        const hasTriggerValue = conflict.values.some((v) =>
          values.includes(v)
        );

        if (hasTriggerValue) {
          // Check if any incompatible values are also present
          const incompatiblePresent = values.filter((v) =>
            conflict.incompatibleWith.includes(v)
          );

          if (incompatiblePresent.length > 0) {
            const triggerPresent = values.filter((v) =>
              conflict.values.includes(v)
            );

            errors.push({
              type: ValidationErrorType.CONFLICT_VIOLATION,
              dimension,
              message: `Conflict in dimension "${dimension}": values [${triggerPresent.join(', ')}] are incompatible with [${incompatiblePresent.join(', ')}]`,
              conflictingValues: [...triggerPresent, ...incompatiblePresent],
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates and throws an error if validation fails
 * Useful for fail-fast scenarios
 * 
 * @param attributes - The attributes to validate
 * @throws Error with detailed validation message
 */
export function validateAttributesStrict(
  attributes: FoodAttributes | undefined
): void {
  const result = validateAttributes(attributes);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((err) => `[${err.type}] ${err.message}`)
      .join('\n');

    throw new Error(
      `Attribute validation failed:\n${errorMessages}`
    );
  }
}

/**
 * Validates a single dimension value array
 * Useful for incremental validation during form input
 * 
 * @param dimension - The dimension name
 * @param values - The values to validate
 * @returns ValidationResult for this specific dimension
 */
export function validateDimension(
  dimension: string,
  values: string[]
): ValidationResult {
  return validateAttributes({ [dimension]: values });
}

/**
 * Checks if two attribute sets have conflicting values
 * Useful for comparing user preferences against food items
 * 
 * @param attrs1 - First attribute set (e.g., user preferences)
 * @param attrs2 - Second attribute set (e.g., food item)
 * @returns Array of conflict descriptions
 */
export function findConflicts(
  attrs1: FoodAttributes,
  attrs2: FoodAttributes
): string[] {
  const conflicts: string[] = [];

  // Check each dimension that exists in both sets
  for (const dimension of Object.keys(attrs1)) {
    if (!attrs2[dimension]) continue;

    const dimensionDef = getDimensionDefinition(dimension);
    if (!dimensionDef?.conflicts) continue;

    const values1 = attrs1[dimension];
    const values2 = attrs2[dimension];

    // Check each conflict rule
    for (const conflict of dimensionDef.conflicts) {
      const hasTriggerInSet1 = conflict.values.some((v) =>
        values1.includes(v)
      );
      const hasIncompatibleInSet2 = conflict.incompatibleWith.some((v) =>
        values2.includes(v)
      );

      if (hasTriggerInSet1 && hasIncompatibleInSet2) {
        conflicts.push(
          `Conflict in ${dimension}: ${conflict.values.join(', ')} (preference) incompatible with ${conflict.incompatibleWith.filter(v => values2.includes(v)).join(', ')} (item)`
        );
      }
    }
  }

  return conflicts;
}
