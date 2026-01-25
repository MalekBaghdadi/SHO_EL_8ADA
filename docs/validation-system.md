# Validation System Documentation

## Overview

The validation system enforces strict rules for multi-dimensional food item attributes. All validation is registry-driven, ensuring consistency and extensibility.

## Architecture

```
types/attributes.ts          → Type definitions
lib/dimensionRegistry.ts     → Dimension configuration (single source of truth)
lib/attributeValidator.ts    → Validation engine
lib/validation.examples.ts   → Usage examples
```

## Key Files

### `types/attributes.ts`
Defines TypeScript types for:
- `DimensionDefinition` - Configuration for a single dimension
- `DimensionRegistry` - Complete registry type
- `FoodAttributes` - Attributes object on food items
- `ValidationError` - Detailed error information
- `ValidationResult` - Validation outcome

### `lib/dimensionRegistry.ts`
The authoritative registry containing:
- **timeOfDay**: `['tarwee2a', '8ada', '3asha']` (multi-select allowed)
- **dietType**: `['chicken', 'meat', 'fish', 'vegan']` (single-select, mutual exclusivity)
- **source**: `['homecooking', 'delivery']` (multi-select allowed)

### `lib/attributeValidator.ts`
Core validation functions:
- `validateAttributes(attributes)` - Returns validation result
- `validateAttributesStrict(attributes)` - Throws on error
- `validateDimension(dimension, values)` - Single dimension validation
- `findConflicts(attrs1, attrs2)` - Detect conflicts between two attribute sets

## Validation Rules

### 1. Dimension Integrity
✅ Only dimensions in registry are allowed  
❌ Unknown dimensions trigger `UNKNOWN_DIMENSION` error

```typescript
// ❌ INVALID
{ spiceLevel: ['mild'] }  // spiceLevel not in registry

// ✅ VALID
{ timeOfDay: ['8ada'] }
```

### 2. Value Whitelisting
✅ Values must exist in dimension's `values` array  
❌ Invalid values trigger `INVALID_VALUE` error

```typescript
// ❌ INVALID
{ timeOfDay: ['breakfast'] }  // Should be 'tarwee2a'

// ✅ VALID
{ timeOfDay: ['tarwee2a'] }
```

### 3. Array Enforcement
✅ All dimension values must be arrays  
❌ Non-arrays trigger `NOT_AN_ARRAY` error

```typescript
// ❌ INVALID
{ dietType: 'vegan' }  // Must be array

// ✅ VALID
{ dietType: ['vegan'] }
```

### 4. Multi-Select Rules
✅ If `multiSelect = false`, array length must be ≤ 1  
❌ Multiple values trigger `MULTI_SELECT_VIOLATION` error

```typescript
// ❌ INVALID (dietType.multiSelect = false)
{ dietType: ['chicken', 'fish'] }

// ✅ VALID
{ dietType: ['chicken'] }
```

### 5. Mutual Exclusivity
✅ If `mutuallyExclusive = true`, only one value allowed  
❌ Multiple values trigger `MUTUAL_EXCLUSIVITY_VIOLATION` error

```typescript
// ❌ INVALID (dietType.mutuallyExclusive = true)
{ dietType: ['vegan', 'chicken'] }

// ✅ VALID
{ dietType: ['vegan'] }
```

### 6. Conflict Detection
✅ Conflict rules prevent incompatible combinations  
❌ Conflicts trigger `CONFLICT_VIOLATION` error

```typescript
// ❌ INVALID (vegan conflicts with chicken/meat/fish)
{ dietType: ['vegan', 'chicken'] }

// ✅ VALID
{ dietType: ['vegan'] }
```

### 7. Missing Data
✅ All dimensions are optional  
✅ Missing dimension = neutral  
❌ Empty arrays are invalid (`EMPTY_ARRAY` error)

```typescript
// ✅ VALID - omit dimension entirely
{ dietType: ['vegan'] }

// ❌ INVALID - empty array
{ dietType: [], source: ['delivery'] }

// ✅ VALID - no attributes at all
{}
```

## Usage Examples

### API Endpoint Validation
```typescript
import { validateAttributes } from '@/lib/attributeValidator';

export async function POST(request: Request) {
  const body = await request.json();
  
  const result = validateAttributes(body.attributes);
  
  if (!result.valid) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.errors },
      { status: 400 }
    );
  }
  
  // Proceed with creation
  const food = await createFood(body);
  return NextResponse.json(food);
}
```

### Bulk Import with Strict Validation
```typescript
import { validateAttributesStrict } from '@/lib/attributeValidator';

function importFoods(foods: any[]) {
  for (const food of foods) {
    try {
      validateAttributesStrict(food.attributes);
      // Insert into database
    } catch (error) {
      console.error(`Validation failed for ${food.name}:`, error.message);
      // Log and skip
    }
  }
}
```

### Conflict Detection
```typescript
import { findConflicts } from '@/lib/attributeValidator';

const userPrefs = { dietType: ['vegan'] };
const foodItem = { dietType: ['chicken'] };

const conflicts = findConflicts(userPrefs, foodItem);
if (conflicts.length > 0) {
  // Exclude this item from results
  console.log('Conflicts:', conflicts);
}
```

## Error Types

| Error Type | Trigger | Example |
|------------|---------|---------|
| `UNKNOWN_DIMENSION` | Dimension not in registry | `{ spiceLevel: ['mild'] }` |
| `INVALID_VALUE` | Value not in dimension's values | `{ timeOfDay: ['breakfast'] }` |
| `NOT_AN_ARRAY` | Value is not an array | `{ dietType: 'vegan' }` |
| `EMPTY_ARRAY` | Array has no values | `{ source: [] }` |
| `MULTI_SELECT_VIOLATION` | Multiple values when disallowed | `{ dietType: ['chicken', 'fish'] }` |
| `MUTUAL_EXCLUSIVITY_VIOLATION` | Multiple values in exclusive dimension | `{ dietType: ['vegan', 'chicken'] }` |
| `CONFLICT_VIOLATION` | Conflicting values present | `{ dietType: ['vegan', 'meat'] }` |

## Extension Guide

To add a new dimension:

1. **Update registry** (`lib/dimensionRegistry.ts`):
```typescript
export const DIMENSION_REGISTRY: DimensionRegistry = {
  // ... existing dimensions
  spiceLevel: {
    label: 'Spice Level',
    values: ['mild', 'medium', 'spicy'],
    multiSelect: false,
    mutuallyExclusive: false,
  },
};
```

2. **No code changes needed** - validation automatically works for new dimensions

3. **Update food items** (optional, gradual):
```typescript
{
  id: 1,
  name: 'Shawarma',
  attributes: {
    spiceLevel: ['medium'], // New dimension
  },
}
```

## Best Practices

### ✅ DO
- Always validate before persistence
- Return detailed errors to API consumers
- Use `validateAttributesStrict()` for fail-fast scenarios
- Check conflicts before filtering items
- Add dimensions to registry, not in code

### ❌ DON'T
- Hardcode dimension names in business logic
- Silently fix invalid data
- Allow empty arrays (omit dimension instead)
- Bypass validation "just this once"
- Mix validation logic outside the validator

## Testing Validation

Run examples to see validation in action:
```bash
npx tsx lib/validation.examples.ts
```

This will demonstrate all validation rules with real examples.
