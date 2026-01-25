/**
 * Validation System Usage Examples and Tests
 * 
 * This file demonstrates how to use the validation system
 * and serves as a reference for common validation scenarios.
 */

import { validateAttributes, validateAttributesStrict, findConflicts } from './attributeValidator';
import { FoodAttributes } from '@/types/attributes';

// ============================================================================
// VALID EXAMPLES
// ============================================================================

console.log('=== VALID EXAMPLES ===\n');

// Example 1: Valid breakfast item with chicken
const validBreakfast: FoodAttributes = {
  timeOfDay: ['tarwee2a'],
  dietType: ['chicken'],
  source: ['homecooking', 'delivery'],
};
console.log('Valid breakfast:', validateAttributes(validBreakfast));
// Result: { valid: true, errors: [] }

// Example 2: Valid vegan dinner
const validVeganDinner: FoodAttributes = {
  timeOfDay: ['3asha'],
  dietType: ['vegan'],
  source: ['delivery'],
};
console.log('Valid vegan dinner:', validateAttributes(validVeganDinner));
// Result: { valid: true, errors: [] }

// Example 3: Valid lunch item available multiple times
const validLunch: FoodAttributes = {
  timeOfDay: ['tarwee2a', '8ada'], // Can be breakfast or lunch
  dietType: ['fish'],
  source: ['homecooking'],
};
console.log('Valid lunch:', validateAttributes(validLunch));
// Result: { valid: true, errors: [] }

// Example 4: Missing attributes is valid
const noAttributes: FoodAttributes = {};
console.log('No attributes:', validateAttributes(noAttributes));
// Result: { valid: true, errors: [] }

// Example 5: Undefined attributes is valid
console.log('Undefined attributes:', validateAttributes(undefined));
// Result: { valid: true, errors: [] }

// ============================================================================
// INVALID EXAMPLES - Rule Violations
// ============================================================================

console.log('\n=== INVALID EXAMPLES ===\n');

// Error 1: Unknown dimension
const unknownDimension: FoodAttributes = {
  timeOfDay: ['8ada'],
  spiceLevel: ['mild'], // ❌ Not in registry
};
console.log('Unknown dimension:', validateAttributes(unknownDimension));
// Result: { valid: false, errors: [{ type: 'UNKNOWN_DIMENSION', ... }] }

// Error 2: Invalid value
const invalidValue: FoodAttributes = {
  timeOfDay: ['breakfast'], // ❌ Should be 'tarwee2a'
  dietType: ['chicken'],
};
console.log('Invalid value:', validateAttributes(invalidValue));
// Result: { valid: false, errors: [{ type: 'INVALID_VALUE', ... }] }

// Error 3: Not an array
const notArray: any = {
  timeOfDay: 'tarwee2a', // ❌ Must be array
  dietType: ['chicken'],
};
console.log('Not an array:', validateAttributes(notArray));
// Result: { valid: false, errors: [{ type: 'NOT_AN_ARRAY', ... }] }

// Error 4: Empty array
const emptyArray: FoodAttributes = {
  timeOfDay: [], // ❌ Cannot be empty
  dietType: ['vegan'],
};
console.log('Empty array:', validateAttributes(emptyArray));
// Result: { valid: false, errors: [{ type: 'EMPTY_ARRAY', ... }] }

// Error 5: Multi-select violation
const multiSelectViolation: FoodAttributes = {
  timeOfDay: ['tarwee2a'],
  dietType: ['chicken', 'fish'], // ❌ dietType.multiSelect = false
};
console.log('Multi-select violation:', validateAttributes(multiSelectViolation));
// Result: { valid: false, errors: [{ type: 'MULTI_SELECT_VIOLATION', ... }] }

// Error 6: Mutual exclusivity violation
const mutualExclusivityViolation: FoodAttributes = {
  timeOfDay: ['tarwee2a'],
  dietType: ['chicken', 'vegan'], // ❌ dietType.mutuallyExclusive = true
};
console.log('Mutual exclusivity:', validateAttributes(mutualExclusivityViolation));
// Result: { valid: false, errors: [{ type: 'MUTUAL_EXCLUSIVITY_VIOLATION', ... }] }

// Error 7: Conflict violation
const conflictViolation: FoodAttributes = {
  timeOfDay: ['8ada'],
  dietType: ['vegan', 'chicken'], // ❌ vegan conflicts with chicken
};
console.log('Conflict violation:', validateAttributes(conflictViolation));
// Result: { valid: false, errors: [{ type: 'CONFLICT_VIOLATION', ... }] }

// ============================================================================
// USAGE IN DIFFERENT CONTEXTS
// ============================================================================

console.log('\n=== USAGE EXAMPLES ===\n');

// Usage 1: API endpoint validation
function createFood(data: any) {
  const result = validateAttributes(data.attributes);

  if (!result.valid) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: result.errors,
      },
    };
  }

  // Proceed with creation
  return { status: 201, body: { success: true } };
}

// Usage 2: Strict validation (throws on error)
function importFoodBatch(foods: any[]) {
  for (const food of foods) {
    try {
      validateAttributesStrict(food.attributes);
      // Insert into database
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to import ${food.name}:`, message);
      // Handle error (skip, log, etc.)
    }
  }
}

// Usage 3: Conflict detection between user preferences and food items
const userPreferences: FoodAttributes = {
  dietType: ['vegan'],
};

const foodItem: FoodAttributes = {
  timeOfDay: ['8ada'],
  dietType: ['chicken'],
  source: ['delivery'],
};

const conflicts = findConflicts(userPreferences, foodItem);
console.log('Conflicts between user and item:', conflicts);
// Result: ["Conflict in dietType: vegan (preference) incompatible with chicken (item)"]

// Usage 4: Form validation during user input
function onDietTypeChange(selectedValues: string[]) {
  const result = validateAttributes({
    dietType: selectedValues,
  });

  if (!result.valid) {
    // Show error message to user
    alert(result.errors[0].message);
  }
}

// ============================================================================
// EDGE CASES
// ============================================================================

console.log('\n=== EDGE CASES ===\n');

// Edge case 1: Multiple errors in one validation
const multipleErrors: FoodAttributes = {
  unknownDim: ['test'], // Unknown dimension
  timeOfDay: ['invalid'], // Invalid value
  dietType: [], // Empty array
};
console.log('Multiple errors:', validateAttributes(multipleErrors));
// Returns all errors at once

// Edge case 2: Valid partial attributes
const partialAttributes: FoodAttributes = {
  dietType: ['vegan'], // Only one dimension is fine
};
console.log('Partial attributes:', validateAttributes(partialAttributes));
// Result: { valid: true, errors: [] }

// Edge case 3: All dimensions populated
const allDimensions: FoodAttributes = {
  timeOfDay: ['tarwee2a', '8ada', '3asha'],
  dietType: ['chicken'],
  source: ['homecooking', 'delivery'],
};
console.log('All dimensions:', validateAttributes(allDimensions));
// Result: { valid: true, errors: [] }

// ============================================================================
// BEST PRACTICES
// ============================================================================

/*
BEST PRACTICES:

1. Always validate before persistence
   ✅ validateAttributesStrict(attributes) // Throws on error
   ✅ const result = validateAttributes(attributes); if (!result.valid) { ... }

2. Use fail-fast for bulk operations
   ✅ validateAttributesStrict() in try/catch

3. Return detailed errors to API consumers
   ✅ Return result.errors array with type and message

4. Check conflicts before filtering
   ✅ Use findConflicts() to exclude incompatible items

5. Don't hardcode dimension names
   ❌ if (attributes.timeOfDay) { ... }
   ✅ Use DIMENSION_REGISTRY to iterate dimensions

6. Don't silently fix invalid data
   ❌ attributes.dietType = attributes.dietType.slice(0, 1) // Silent fix
   ✅ Reject with clear error message

7. Don't allow empty arrays
   ❌ attributes: { timeOfDay: [] }
   ✅ Omit dimension entirely or provide values
*/
