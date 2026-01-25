# Data Migration Strategy

## Overview

This document outlines the safe, incremental migration strategy for adding multi-dimensional attributes to existing food items.

## Key Principles

1. **Non-Destructive**: Existing data continues to work unchanged
2. **Incremental**: Migrate items gradually, not all at once
3. **Re-runnable**: Migrations can be safely re-executed
4. **Validating**: All changes are validated before persistence
5. **Reversible**: Can roll back if needed

---

## Current State

### Before Migration
```typescript
{
  id: 1,
  name3ar: "7mous",
  nameAr: "حمص",
  category: "breakfast",
  tags: ["comfy", "healthy", "light"],
  image: "/images/hummus.jpg"
  // No attributes field
}
```

### After Migration
```typescript
{
  id: 1,
  name3ar: "7mous",
  nameAr: "حمص",
  category: "breakfast",
  tags: ["comfy", "healthy", "light"],
  image: "/images/hummus.jpg",
  attributes: {  // ✅ Optional field added
    timeOfDay: ["tarwee2a", "8ada"],
    dietType: ["vegan"],
    source: ["homecooking", "delivery"]
  }
}
```

---

## Migration Phases

### Phase 1: Foundation (Complete)
- ✅ Type definitions created
- ✅ Validation system implemented
- ✅ Migration utilities created
- ✅ `Food` type updated with optional `attributes` field

### Phase 2: Selective Migration (Current)
**Goal**: Add attributes to specific high-priority items

**Strategy**:
1. Create attribute map for items to migrate
2. Preview changes with `previewMigration()`
3. Run dry run with `MigrationMode.DRY_RUN`
4. Apply in lenient mode
5. Validate results

**Example**:
```typescript
import { bulkAddAttributes, MigrationMode } from '@/lib/migrationUtils';
import { foods } from '@/data/foods';

const attributeMap = new Map([
  [1, { timeOfDay: ['tarwee2a'], dietType: ['vegan'] }],
  [7, { timeOfDay: ['8ada'], dietType: ['chicken'] }],
]);

const result = bulkAddAttributes(foods, attributeMap, MigrationMode.LENIENT);
```

### Phase 3: Category-Based Migration
**Goal**: Migrate entire categories systematically

**Order**:
1. Breakfast items (simpler, lower risk)
2. Main dishes (most complex)
3. Snacks
4. Desserts

### Phase 4: Complete Coverage
**Goal**: All items have attributes

**Timeline**: Gradual, no rush

---

## Migration Modes

### STRICT Mode
```typescript
MigrationMode.STRICT
```
- **Behavior**: Abort on first validation error
- **Use Case**: Production migrations where data quality is critical
- **Risk**: Low (fails fast)
- **When**: After thorough testing

### LENIENT Mode
```typescript
MigrationMode.LENIENT
```
- **Behavior**: Skip invalid items, continue migration
- **Use Case**: Initial migrations, incomplete data
- **Risk**: Medium (some items may fail silently)
- **When**: Development, testing, gradual rollout

### DRY_RUN Mode
```typescript
MigrationMode.DRY_RUN
```
- **Behavior**: Validate without applying changes
- **Use Case**: Testing, previewing
- **Risk**: None (read-only)
- **When**: Always run before real migration

---

## Step-by-Step Migration Guide

### Step 1: Prepare Attribute Data
Create a mapping of food IDs to their attributes:

```typescript
const attributeMap = new Map<number, FoodAttributes>([
  [1, {
    timeOfDay: ['tarwee2a', '8ada'],
    dietType: ['vegan'],
    source: ['homecooking', 'delivery'],
  }],
  // ... more items
]);
```

### Step 2: Preview
Check what will change without modifying data:

```typescript
import { previewMigration } from '@/lib/migrationUtils';

const preview = previewMigration(foods, attributeMap);
console.log('Items to update:', preview.itemsToUpdate);
console.log('Potential errors:', preview.potentialErrors);
```

### Step 3: Dry Run
Validate all changes:

```typescript
const dryRun = bulkAddAttributes(
  foods,
  attributeMap,
  MigrationMode.DRY_RUN
);

if (dryRun.failed > 0) {
  console.error('Dry run found errors!');
  dryRun.errors.forEach(e => console.error(e));
  return; // Don't proceed
}
```

### Step 4: Apply Migration
Run actual migration in lenient mode:

```typescript
const result = bulkAddAttributes(
  foods,
  attributeMap,
  MigrationMode.LENIENT
);

console.log(`Success: ${result.succeeded}/${result.total}`);
```

### Step 5: Validate Dataset
Verify entire dataset is valid:

```typescript
import { validateFoodDataset } from '@/lib/migrationUtils';

const validation = validateFoodDataset(foods);

if (!validation.valid) {
  console.error('Invalid items:', validation.invalidItems);
}
```

---

## Rollback Strategy

### Remove All Attributes
```typescript
import { removeAttributes } from '@/lib/migrationUtils';

const removed = removeAttributes(foods);
console.log(`Removed attributes from ${removed} items`);
```

### Remove from Specific Items
```typescript
const removed = removeAttributes(foods, [1, 2, 3]); // IDs to rollback
```

---

## API Integration

### Write Operations Must Validate

#### Create Food Item
```typescript
// app/api/foods/route.ts
import { validateAttributesStrict } from '@/lib/attributeValidator';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate attributes if provided
  if (body.attributes) {
    try {
      validateAttributesStrict(body.attributes);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid attributes', details: error.message },
        { status: 400 }
      );
    }
  }
  
  // Proceed with creation
  const food = await createFood(body);
  return NextResponse.json(food);
}
```

#### Update Food Item
```typescript
export async function PATCH(request: Request) {
  const body = await request.json();
  
  // Validate attributes if being updated
  if (body.attributes !== undefined) {
    try {
      validateAttributesStrict(body.attributes);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid attributes', details: error.message },
        { status: 400 }
      );
    }
  }
  
  // Proceed with update
  const food = await updateFood(id, body);
  return NextResponse.json(food);
}
```

---

## Persistence Layer

### Current (Static Data)
Food items are stored in [`data/foods.ts`](file:///Users/malekbaghdadi/Downloads/SHO_EL_8ADA/data/foods.ts):
```typescript
export const foods: Food[] = [
  {
    id: 1,
    // ... existing fields
    attributes: { /* optional */ }
  }
];
```

### Future (Database)
When migrating to a database:

**Option 1: Single Table**
```sql
CREATE TABLE foods (
  id INTEGER PRIMARY KEY,
  name3ar TEXT,
  nameAr TEXT,
  category TEXT,
  tags JSONB,  -- Array of mood tags
  image TEXT,
  attributes JSONB  -- Nullable, multi-dimensional attributes
);
```

**Option 2: Separate Attributes Table** (Better for querying)
```sql
CREATE TABLE foods (
  id INTEGER PRIMARY KEY,
  name3ar TEXT,
  -- ... other fields
);

CREATE TABLE food_attributes (
  food_id INTEGER REFERENCES foods(id),
  dimension TEXT,  -- 'timeOfDay', 'dietType', etc.
  value TEXT,      -- 'tarwee2a', 'vegan', etc.
  PRIMARY KEY (food_id, dimension, value)
);

-- Index for fast lookups
CREATE INDEX idx_food_attributes_dimension_value 
ON food_attributes(dimension, value);
```

---

## Best Practices

### ✅ DO
- Always preview before migrating
- Run dry runs first
- Use lenient mode for initial migrations
- Validate dataset after migration
- Keep attribute maps in version control
- Document why each item has specific attributes

### ❌ DON'T
- Migrate everything at once
- Skip validation
- Modify data without backups
- Use strict mode until confident
- Leave empty `attributes` objects (omit entirely or provide values)
- Hardcode attributes in code

---

## FAQ

**Q: What happens to items without attributes?**
A: They work exactly as before. The `attributes` field is optional.

**Q: Can I mix items with and without attributes?**
A: Yes! The system is designed for incremental adoption.

**Q: How do I know which items need attributes?**
A: Start with items where filtering would be most useful (main dishes, breakfast items).

**Q: What if validation fails during migration?**
A: In LENIENT mode, invalid items are skipped. In STRICT mode, migration aborts. Either way, you get detailed error messages.

**Q: Can I change attributes after migration?**
A: Yes, just update the `attributes` object and re-validate.

**Q: How do I handle items that fit multiple times of day?**
A: Use arrays! `timeOfDay: ['tarwee2a', '8ada', '3asha']` means it works for all meals.

---

## Next Steps

1. Review [lib/migration.examples.ts](file:///Users/malekbaghdadi/Downloads/SHO_EL_8ADA/lib/migration.examples.ts) for detailed patterns
2. Create attribute map for your first batch of items
3. Run preview and dry run
4. Apply migration in lenient mode
5. Validate results
6. Gradually expand coverage

No rush - migrate incrementally as needed!
