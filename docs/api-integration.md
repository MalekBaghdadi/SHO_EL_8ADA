# API Integration Guide - Multi-Dimensional Attributes

## Overview

This guide shows how to integrate attribute validation into API endpoints and services.

---

## Core Principle

**All write operations MUST validate attributes before persistence.**

Use the existing validation system - never implement custom validation.

---

## Import Required Functions

```typescript
import { validateAttributes, validateAttributesStrict } from '@/lib/attributeValidator';
import { FoodAttributes } from '@/types/attributes';
```

---

## Pattern 1: Create Food Item (POST)

### With Error Handling
```typescript
// app/api/foods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAttributesStrict } from '@/lib/attributeValidator';
import { Food } from '@/types/food';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate attributes if provided
  if (body.attributes) {
    try {
      validateAttributesStrict(body.attributes);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Attribute validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }
  }
  
  // Proceed with creation
  const newFood: Food = {
    id: generateId(),
    ...body,
  };
  
  // Save to database/storage
  await saveFood(newFood);
  
  return NextResponse.json(newFood, { status: 201 });
}
```

### With Detailed Errors
```typescript
import { validateAttributes } from '@/lib/attributeValidator';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (body.attributes) {
    const result = validateAttributes(body.attributes);
    
    if (!result.valid) {
      return NextResponse.json(
        {
          error: 'Attribute validation failed',
          validationErrors: result.errors.map(err => ({
            type: err.type,
            dimension: err.dimension,
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
  }
  
  // ... rest of creation logic
}
```

---

## Pattern 2: Update Food Item (PATCH)

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await request.json();
  
  // Fetch existing item
  const existingFood = await getFood(id);
  if (!existingFood) {
    return NextResponse.json(
      { error: 'Food not found' },
      { status: 404 }
    );
  }
  
  // If attributes are being updated, validate them
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
  
  // Merge updates
  const updatedFood: Food = {
    ...existingFood,
    ...body,
  };
  
  await updateFood(id, updatedFood);
  
  return NextResponse.json(updatedFood);
}
```

---

## Pattern 3: Bulk Import

### Strict Mode (Abort on Error)
```typescript
import { bulkAddAttributes, MigrationMode } from '@/lib/migrationUtils';

export async function POST(request: NextRequest) {
  const { items, attributeMap } = await request.json();
  
  try {
    const result = bulkAddAttributes(
      items,
      new Map(Object.entries(attributeMap)),
      MigrationMode.STRICT
    );
    
    return NextResponse.json({
      success: true,
      imported: result.succeeded,
      total: result.total,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Bulk import failed',
        details: error.message,
      },
      { status: 400 }
    );
  }
}
```

### Lenient Mode (Skip Errors)
```typescript
export async function POST(request: NextRequest) {
  const { items, attributeMap } = await request.json();
  
  const result = bulkAddAttributes(
    items,
    new Map(Object.entries(attributeMap)),
    MigrationMode.LENIENT
  );
  
  return NextResponse.json({
    success: result.failed === 0,
    imported: result.succeeded,
    failed: result.failed,
    skipped: result.skipped,
    total: result.total,
    errors: result.errors,
  });
}
```

---

## Pattern 4: AI Auto-Tagging Integration

When AI generates attributes, always validate before applying:

```typescript
// app/api/ai/auto-tag/route.ts
import { validateAttributes } from '@/lib/attributeValidator';

export async function POST(request: NextRequest) {
  const { foodId, prompt } = await request.json();
  
  // Call AI to generate attributes
  const aiAttributes = await generateAttributesWithAI(prompt);
  
  // Validate AI-generated attributes
  const validation = validateAttributes(aiAttributes);
  
  if (!validation.valid) {
    // AI produced invalid attributes - log and return error
    console.error('AI generated invalid attributes:', validation.errors);
    
    return NextResponse.json({
      error: 'AI-generated attributes are invalid',
      details: validation.errors,
      aiResponse: aiAttributes, // For debugging
    }, { status: 422 });
  }
  
  // Apply validated attributes
  await updateFoodAttributes(foodId, aiAttributes);
  
  return NextResponse.json({
    success: true,
    attributes: aiAttributes,
  });
}
```

---

## Pattern 5: Form Validation (Real-time)

For interactive forms, validate as users type:

```typescript
// app/api/validate-attribute/route.ts
import { validateDimension } from '@/lib/attributeValidator';

export async function POST(request: NextRequest) {
  const { dimension, values } = await request.json();
  
  const result = validateDimension(dimension, values);
  
  return NextResponse.json({
    valid: result.valid,
    errors: result.errors,
  });
}
```

---

## Validation Checklist

Before deploying any endpoint that writes food data:

- [ ] Validates `attributes` if present
- [ ] Uses `validateAttributes()` or `validateAttributesStrict()`
- [ ] Returns descriptive errors (400 status)
- [ ] Handles `undefined` attributes (optional field)
- [ ] Does NOT allow empty arrays
- [ ] Does NOT bypass validation

---

## Error Response Format

**Standard format for validation errors:**

```typescript
{
  error: "Attribute validation failed",
  validationErrors: [
    {
      type: "INVALID_VALUE",
      dimension: "timeOfDay",
      message: "Invalid values for dimension \"timeOfDay\": [breakfast]. Valid values: [tarwee2a, 8ada, 3asha]",
      invalidValues: ["breakfast"]
    }
  ]
}
```

---

## Testing Endpoints

### Test Valid Attributes
```bash
curl -X POST http://localhost:3000/api/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name3ar": "Test",
    "attributes": {
      "timeOfDay": ["tarwee2a"],
      "dietType": ["vegan"]
    }
  }'
```

### Test Invalid Attributes
```bash
curl -X POST http://localhost:3000/api/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name3ar": "Test",
    "attributes": {
      "timeOfDay": ["breakfast"],
      "dietType": ["vegan", "chicken"]
    }
  }'
# Should return 400 with validation errors
```

### Test Missing Attributes
```bash
curl -X POST http://localhost:3000/api/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name3ar": "Test"
  }'
# Should succeed (attributes are optional)
```

---

## Best Practices

### ✅ DO
- Always validate before persistence
- Return detailed validation errors
- Use `validateAttributesStrict()` for fail-fast behavior
- Use `validateAttributes()` for detailed error handling
- Log validation failures for monitoring
- Test both valid and invalid inputs

### ❌ DON'T
- Skip validation "just this once"
- Implement custom validation logic
- Silently fix invalid data
- Allow empty attribute arrays
- Return generic error messages
- Trust external data without validation

---

## Complete Example: Full CRUD API

```typescript
// app/api/foods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAttributesStrict } from '@/lib/attributeValidator';
import { Food } from '@/types/food';

// GET all foods
export async function GET() {
  const foods = await getAllFoods();
  return NextResponse.json(foods);
}

// POST create food
export async function POST(request: NextRequest) {
  const body = await request.json();
  
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
  
  const newFood = await createFood(body);
  return NextResponse.json(newFood, { status: 201 });
}

// app/api/foods/[id]/route.ts

// GET single food
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const food = await getFood(parseInt(params.id));
  
  if (!food) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(food);
}

// PATCH update food
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
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
  
  const updated = await updateFood(parseInt(params.id), body);
  return NextResponse.json(updated);
}

// DELETE food
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteFood(parseInt(params.id));
  return NextResponse.json({ success: true });
}
```

---

## Summary

All write operations flow through validation:
1. Parse request body
2. If `attributes` present → validate
3. If invalid → return 400 with errors
4. If valid → proceed with operation

No exceptions, no custom logic, no bypasses.
