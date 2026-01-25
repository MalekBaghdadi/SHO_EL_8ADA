/**
 * Migration Utilities for Multi-Dimensional Attributes
 * 
 * Safe, incremental migration tools for adding attributes to existing food items.
 */

import { Food } from '@/types/food';
import { FoodAttributes } from '@/types/attributes';
import { validateAttributes, validateAttributesStrict } from './attributeValidator';

/**
 * Migration mode options
 */
export enum MigrationMode {
  /** Abort on first validation error */
  STRICT = 'STRICT',
  /** Skip invalid items and continue */
  LENIENT = 'LENIENT',
  /** Dry run - validate but don't apply changes */
  DRY_RUN = 'DRY_RUN',
}

/**
 * Result of a migration operation
 */
export interface MigrationResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: Array<{
    itemId: number;
    itemName: string;
    errors: Array<{ message: string }>;
  }>;
}

/**
 * Adds attributes to a single food item with validation
 * 
 * @param food - The food item to update
 * @param attributes - The attributes to add
 * @param validate - Whether to validate (default: true)
 * @returns Updated food item or throws if invalid
 */
export function addAttributesToFood(
  food: Food,
  attributes: FoodAttributes,
  validate: boolean = true
): Food {
  if (validate) {
    validateAttributesStrict(attributes);
  }

  return {
    ...food,
    attributes,
  };
}

/**
 * Bulk migration helper for adding attributes to multiple food items
 * 
 * @param foods - Array of food items
 * @param attributeMap - Map of food ID to attributes
 * @param mode - Migration mode (strict, lenient, dry run)
 * @returns Migration result with success/failure counts
 */
export function bulkAddAttributes(
  foods: Food[],
  attributeMap: Map<number, FoodAttributes>,
  mode: MigrationMode = MigrationMode.STRICT
): MigrationResult {
  const result: MigrationResult = {
    total: foods.length,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const food of foods) {
    const attributes = attributeMap.get(food.id);

    // Skip items without attributes in the map
    if (!attributes) {
      result.skipped++;
      continue;
    }

    try {
      // Validate attributes
      const validationResult = validateAttributes(attributes);

      if (!validationResult.valid) {
        const error = {
          itemId: food.id,
          itemName: food.name3ar,
          errors: validationResult.errors,
        };

        result.errors.push(error);
        result.failed++;

        // In strict mode, abort on first error
        if (mode === MigrationMode.STRICT) {
          throw new Error(
            `Migration aborted at item ${food.name3ar} (ID: ${food.id}). ` +
            `Validation errors:\n${validationResult.errors.map(e => e.message).join('\n')}`
          );
        }

        // In lenient mode, skip this item and continue
        continue;
      }

      // In dry run mode, don't actually modify
      if (mode !== MigrationMode.DRY_RUN) {
        food.attributes = attributes;
      }

      result.succeeded++;
    } catch (error: any) {
      // Catch unexpected errors
      result.errors.push({
        itemId: food.id,
        itemName: food.name3ar,
        errors: [{ message: error.message }],
      });
      result.failed++;

      if (mode === MigrationMode.STRICT) {
        throw error;
      }
    }
  }

  return result;
}

/**
 * Validates all food items in a dataset
 * Useful for validating existing data before migration
 * 
 * @param foods - Array of food items to validate
 * @returns Validation summary
 */
export function validateFoodDataset(foods: Food[]): {
  valid: boolean;
  totalItems: number;
  itemsWithAttributes: number;
  invalidItems: Array<{
    itemId: number;
    itemName: string;
    errors: Array<{ message: string }>;
  }>;
} {
  const invalidItems: Array<{
    itemId: number;
    itemName: string;
    errors: Array<{ message: string }>;
  }> = [];

  let itemsWithAttributes = 0;

  for (const food of foods) {
    if (food.attributes) {
      itemsWithAttributes++;
      const result = validateAttributes(food.attributes);

      if (!result.valid) {
        invalidItems.push({
          itemId: food.id,
          itemName: food.name3ar,
          errors: result.errors,
        });
      }
    }
  }

  return {
    valid: invalidItems.length === 0,
    totalItems: foods.length,
    itemsWithAttributes,
    invalidItems,
  };
}

/**
 * Removes attributes from food items
 * Useful for rollback scenarios
 * 
 * @param foods - Array of food items
 * @param foodIds - Optional array of specific IDs to remove attributes from
 * @returns Number of items modified
 */
export function removeAttributes(
  foods: Food[],
  foodIds?: number[]
): number {
  let modifiedCount = 0;

  for (const food of foods) {
    // If specific IDs provided, only remove from those
    if (foodIds && !foodIds.includes(food.id)) {
      continue;
    }

    if (food.attributes) {
      delete food.attributes;
      modifiedCount++;
    }
  }

  return modifiedCount;
}

/**
 * Preview migration changes without applying them
 * 
 * @param foods - Array of food items
 * @param attributeMap - Map of food ID to attributes
 * @returns Preview of what would change
 */
export function previewMigration(
  foods: Food[],
  attributeMap: Map<number, FoodAttributes>
): {
  itemsToUpdate: number;
  itemsToSkip: number;
  potentialErrors: Array<{
    itemId: number;
    itemName: string;
    errors: Array<{ message: string }>;
  }>;
} {
  const result = bulkAddAttributes(foods, attributeMap, MigrationMode.DRY_RUN);

  return {
    itemsToUpdate: result.succeeded,
    itemsToSkip: result.skipped,
    potentialErrors: result.errors,
  };
}
