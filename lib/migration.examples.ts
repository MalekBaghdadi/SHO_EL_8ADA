/**
 * Example: Adding Attributes to Existing Food Data
 * 
 * This file demonstrates how to safely migrate existing food items
 * to include multi-dimensional attributes.
 */

import { Food } from '@/types/food';
import { FoodAttributes } from '@/types/attributes';
import {
  bulkAddAttributes,
  MigrationMode,
  validateFoodDataset,
  previewMigration,
  addAttributesToFood,
} from './migrationUtils';

// ============================================================================
// EXAMPLE 1: Adding attributes to specific items
// ============================================================================

// Existing food item (before migration)
const hummus: Food = {
  id: 1,
  name3ar: '7mous',
  nameAr: 'حمص',
  category: 'breakfast',
  tags: ['comfy', 'healthy', 'light'],
  image: '/images/hummus.jpg',
  // No attributes field yet
};

// Add attributes to this specific item
const hummusWithAttributes = addAttributesToFood(hummus, {
  timeOfDay: ['tarwee2a', '8ada'], // Good for breakfast and lunch
  dietType: ['vegan'],
  source: ['homecooking', 'delivery'],
});

console.log('Hummus with attributes:', hummusWithAttributes);

// ============================================================================
// EXAMPLE 2: Bulk migration with attribute map
// ============================================================================

// Your existing food dataset
const existingFoods: Food[] = [
  {
    id: 1,
    name3ar: '7mous',
    nameAr: 'حمص',
    category: 'breakfast',
    tags: ['comfy', 'healthy', 'light'],
    image: '/images/hummus.jpg',
  },
  {
    id: 7,
    name3ar: 'Shawarma',
    nameAr: 'شاورما',
    category: 'main',
    tags: ['trendy', 'sare3', 'beshabe3'],
    image: '/images/shawarma.jpg',
  },
  {
    id: 18,
    name3ar: 'Knefeh',
    nameAr: 'كنافة',
    category: 'dessert',
    tags: ['sweet', 'trendy', 'te2lidi'],
    image: '/images/knefeh.jpg',
  },
];

// Create attribute map for items you want to update
const attributeMap = new Map<number, FoodAttributes>([
  [1, {
    timeOfDay: ['tarwee2a', '8ada'],
    dietType: ['vegan'],
    source: ['homecooking', 'delivery'],
  }],
  [7, {
    timeOfDay: ['8ada', '3asha'],
    dietType: ['chicken'],
    source: ['delivery'],
  }],
  [18, {
    timeOfDay: ['3asha'],
    dietType: ['vegan'], // Knefeh is typically vegan
    source: ['delivery'],
  }],
]);

// Preview migration before applying
console.log('\n=== PREVIEW MIGRATION ===');
const preview = previewMigration(existingFoods, attributeMap);
console.log('Items to update:', preview.itemsToUpdate);
console.log('Items to skip:', preview.itemsToSkip);
console.log('Potential errors:', preview.potentialErrors);

// Run migration in LENIENT mode (skip errors, continue)
console.log('\n=== RUNNING MIGRATION (LENIENT) ===');
const result = bulkAddAttributes(
  existingFoods,
  attributeMap,
  MigrationMode.LENIENT
);

console.log(`Total: ${result.total}`);
console.log(`Succeeded: ${result.succeeded}`);
console.log(`Failed: ${result.failed}`);
console.log(`Skipped: ${result.skipped}`);

if (result.errors.length > 0) {
  console.log('\nErrors encountered:');
  result.errors.forEach(error => {
    console.log(`- ${error.itemName} (ID ${error.itemId}):`);
    error.errors.forEach(e => console.log(`  ${e.message}`));
  });
}

// ============================================================================
// EXAMPLE 3: Incremental migration strategy
// ============================================================================

/**
 * Strategy: Migrate in phases
 * Phase 1: Breakfast items
 * Phase 2: Main dishes
 * Phase 3: Desserts and snacks
 */

function migrateByCategory(
  foods: Food[],
  category: string,
  attributeMap: Map<number, FoodAttributes>
): void {
  console.log(`\n=== Migrating ${category} items ===`);

  const categoryFoods = foods.filter(f => f.category === category);
  const result = bulkAddAttributes(
    categoryFoods,
    attributeMap,
    MigrationMode.LENIENT
  );

  console.log(`${category}: ${result.succeeded}/${result.total} updated`);

  if (result.failed > 0) {
    console.warn(`${result.failed} items failed validation`);
  }
}

// ============================================================================
// EXAMPLE 4: Validating dataset after migration
// ============================================================================

console.log('\n=== VALIDATING DATASET ===');
const validation = validateFoodDataset(existingFoods);

console.log(`Total items: ${validation.totalItems}`);
console.log(`Items with attributes: ${validation.itemsWithAttributes}`);
console.log(`Valid: ${validation.valid}`);

if (!validation.valid) {
  console.error('Invalid items found:');
  validation.invalidItems.forEach(item => {
    console.error(`- ${item.itemName} (ID ${item.itemId})`);
    item.errors.forEach(e => console.error(`  ${e.message}`));
  });
}

// ============================================================================
// EXAMPLE 5: Handling invalid data during migration
// ============================================================================

const invalidAttributeMap = new Map<number, FoodAttributes>([
  [1, {
    timeOfDay: ['breakfast'], // ❌ Invalid value (should be 'tarwee2a')
    dietType: ['vegan'],
  } as FoodAttributes],
]);

console.log('\n=== TESTING STRICT MODE (will throw) ===');
try {
  bulkAddAttributes(
    existingFoods,
    invalidAttributeMap,
    MigrationMode.STRICT
  );
} catch (error: any) {
  console.error('Migration aborted:', error.message);
}

console.log('\n=== TESTING LENIENT MODE (will skip) ===');
const lenientResult = bulkAddAttributes(
  existingFoods,
  invalidAttributeMap,
  MigrationMode.LENIENT
);
console.log(`Succeeded: ${lenientResult.succeeded}`);
console.log(`Failed: ${lenientResult.failed}`);
console.log('Failed items:', lenientResult.errors);

// ============================================================================
// PRODUCTION MIGRATION PATTERN
// ============================================================================

/**
 * Recommended pattern for production migrations
 */
async function safeProductionMigration(
  foods: Food[],
  attributeMap: Map<number, FoodAttributes>
) {
  console.log('\n=== PRODUCTION MIGRATION ===');

  // Step 1: Preview
  console.log('Step 1: Previewing changes...');
  const preview = previewMigration(foods, attributeMap);

  if (preview.potentialErrors.length > 0) {
    console.error('❌ Preview found errors. Fix data before migration.');
    preview.potentialErrors.forEach(err => {
      console.error(`- ${err.itemName}:`, err.errors);
    });
    return false;
  }

  console.log(`✅ Preview OK: ${preview.itemsToUpdate} items to update`);

  // Step 2: Validate current dataset
  console.log('\nStep 2: Validating current dataset...');
  const currentValidation = validateFoodDataset(foods);

  if (!currentValidation.valid) {
    console.error('❌ Current dataset has invalid items');
    return false;
  }

  console.log('✅ Current dataset is valid');

  // Step 3: Dry run
  console.log('\nStep 3: Dry run...');
  const dryRunResult = bulkAddAttributes(
    foods,
    attributeMap,
    MigrationMode.DRY_RUN
  );

  if (dryRunResult.failed > 0) {
    console.error('❌ Dry run failed');
    return false;
  }

  console.log('✅ Dry run successful');

  // Step 4: Actual migration (Lenient mode for safety)
  console.log('\nStep 4: Applying migration...');
  const finalResult = bulkAddAttributes(
    foods,
    attributeMap,
    MigrationMode.LENIENT // Use lenient to not break on minor issues
  );

  console.log(`✅ Migration complete: ${finalResult.succeeded}/${finalResult.total}`);

  if (finalResult.failed > 0) {
    console.warn(`⚠️  ${finalResult.failed} items failed (check logs)`);
  }

  // Step 5: Post-migration validation
  console.log('\nStep 5: Post-migration validation...');
  const postValidation = validateFoodDataset(foods);

  if (!postValidation.valid) {
    console.error('❌ Post-migration validation failed!');
    return false;
  }

  console.log('✅ Migration validated successfully');
  return true;
}

// Run the production migration
// safeProductionMigration(existingFoods, attributeMap);
