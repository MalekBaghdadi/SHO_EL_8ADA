# Selection Engine Documentation

## Overview

The selection engine filters and ranks food items based on user preferences using hard filtering for conflicts and soft scoring for preference matching.

## Architecture

```
types/selection.ts           → Type definitions
lib/selectionWeights.ts      → Weight configuration
lib/selectionEngine.ts       → Core engine
lib/selection.examples.ts    → Usage examples
```

---

## Core Concepts

### Two-Phase Selection

**Phase 1: Hard Filtering**
- Excludes items that violate conflict rules
- Uses existing `findConflicts()` utility
- Runs before scoring
- Binary decision: include or exclude

**Phase 2: Soft Scoring**
- Ranks remaining items by preference match
- Starts with base score (100)
- Adds/subtracts based on dimension matching
- Configurable weights

---

## Usage

### Basic Selection

```typescript
import { selectFoods } from '@/lib/selectionEngine';
import { UserPreferences } from '@/types/selection';

const preferences: UserPreferences = {
  attributes: {
    timeOfDay: ['8ada'],
    dietType: ['vegan'],
  },
  tags: ['healthy'],
};

const result = selectFoods(foods, preferences);

// Get ranked items
result.items.forEach((item) => {
  console.log(`${item.food.name3ar}: ${item.finalScore}`);
});
```

### With Custom Weights

```typescript
import { STRICT_DIET_WEIGHTS } from '@/lib/selectionWeights';

const result = selectFoods(foods, preferences, STRICT_DIET_WEIGHTS);
```

### Debug Mode

```typescript
const result = selectFoods(foods, preferences, undefined, true);

// See detailed scoring breakdown
result.items.forEach((item) => {
  console.log(item.food.name3ar);
  item.dimensionScores.forEach((ds) => {
    console.log(`  ${ds.dimension}: ${ds.score} (${ds.reason})`);
  });
});
```

---

## Scoring Logic

### Base Score
All items start with: **100 points**

### Dimension Score
For each user-selected dimension:

| Item State | Action | Example |
|------------|--------|---------|
| Missing dimension | Neutral (0) | Item has no `timeOfDay` → +0 |
| Matching value | Apply bonus | `timeOfDay` matches → +30 |
| Mismatch | Apply penalty | `timeOfDay` mismatch → -15 |

### Tag Score
For each matching mood/vibe tag: **+5 points** (default)

### Final Score
```
Final Score = Base Score + Σ(Dimension Scores) + Tag Score
```

---

## Matching Logic

### OR Logic Within Dimension
User wants: `timeOfDay: ['tarwee2a', '8ada']`
- Item has `['tarwee2a']` → **Match** ✅
- Item has `['8ada']` → **Match** ✅
- Item has `['3asha']` → **Mismatch** ❌
- Item has `['tarwee2a', '3asha']` → **Match** ✅ (contains at least one)

### AND Logic Across Dimensions
User wants:
- `timeOfDay: ['8ada']`
- `dietType: ['vegan']`

Item must score on BOTH dimensions independently.

---

## Weight Configuration

### Default Weights

```typescript
{
  attributes: {
    timeOfDay: {
      matchBonus: 30,
      mismatchPenalty: -15,
    },
    dietType: {
      matchBonus: 40,
      mismatchPenalty: -5,
    },
    source: {
      matchBonus: 10,
      mismatchPenalty: 0,
    },
  },
  tagMatchBonus: 5,
}
```

### Available Presets

**STRICT_DIET_WEIGHTS**: High penalties for diet mismatches
```typescript
import { STRICT_DIET_WEIGHTS } from '@/lib/selectionWeights';
```

**TIME_PRIORITY_WEIGHTS**: Prioritize time of day
```typescript
import { TIME_PRIORITY_WEIGHTS } from '@/lib/selectionWeights';
```

**EXPLORATORY_WEIGHTS**: Low penalties, encourage diversity
```typescript
import { EXPLORATORY_WEIGHTS } from '@/lib/selectionWeights';
```

### Custom Weights

```typescript
import { createWeights } from '@/lib/selectionWeights';

const customWeights = createWeights({
  attributes: {
    dietType: {
      matchBonus: 50,
      mismatchPenalty: -25,
    },
  },
  tagMatchBonus: 10,
});
```

---

## Helper Functions

### getRankedFoods
Get just the Food objects in ranked order:
```typescript
import { getRankedFoods } from '@/lib/selectionEngine';

const foods = getRankedFoods(allFoods, preferences);
```

### selectRandomFromTop
Select random from top N items:
```typescript
import { selectRandomFromTop } from '@/lib/selectionEngine';

const randomFood = selectRandomFromTop(allFoods, preferences, 5);
// Returns random food from top 5 ranked items
```

### hasAvailableFoods
Check if any items pass filtering:
```typescript
import { hasAvailableFoods } from '@/lib/selectionEngine';

const available = hasAvailableFoods(allFoods, preferences);
if (!available) {
  console.log('No foods match your preferences');
}
```

---

## Hard Filtering Rules

### Conflict Detection

Uses existing `findConflicts()` from validation system:

```typescript
// User wants vegan
preferences = { attributes: { dietType: ['vegan'] } }

// Item has chicken
food = { attributes: { dietType: ['chicken'] } }

// Result: HARD FILTERED (vegan conflicts with chicken)
```

### No False Positives

Missing dimensions do NOT cause filtering:

```typescript
// User wants vegan
preferences = { attributes: { dietType: ['vegan'] } }

// Item has no dietType
food = { attributes: { timeOfDay: ['8ada'] } }

// Result: PASSES filter (missing ≠ conflict)
```

---

## Determinism

The engine is **fully deterministic**:
- Same inputs → Same outputs
- No randomness in scoring
- Stable sort order

```typescript
const run1 = selectFoods(foods, preferences);
const run2 = selectFoods(foods, preferences);

// run1 and run2 produce identical results
```

Only `selectRandomFromTop()` introduces randomness.

---

## Example Scenarios

### Scenario 1: Vegan User at Lunch
```typescript
const preferences = {
  attributes: {
    timeOfDay: ['8ada'],
    dietType: ['vegan'],
  },
};

const result = selectFoods(foods, preferences);
```

**Expected Behavior:**
- ❌ Shawarma (chicken) - Hard filtered
- ✅ Fattoush (vegan, lunch) - High score
- ✅ Hummus (vegan, multi-time) - Medium score
- ✅ Items without attributes - Base score (neutral)

### Scenario 2: Dinner, Any Diet
```typescript
const preferences = {
  attributes: {
    timeOfDay: ['3asha'],
  },
};
```

**Expected Behavior:**
- No hard filtering (no conflicts)
- Dinner items get bonus
- Non-dinner items get penalty
- All items ranked by score

### Scenario 3: Tags Only
```typescript
const preferences = {
  tags: ['healthy', 'light'],
};
```

**Expected Behavior:**
- No hard filtering
- Items ranked by tag matches
- Items with both tags score higher

---

## Performance Considerations

### Time Complexity
- Hard filtering: O(n × m) where n = foods, m = dimensions
- Soft scoring: O(n × m)
- Overall: **O(n × m)** - linear in food count

### Optimization Tips
1. Filter large datasets before selection
2. Use `hasAvailableFoods()` for early validation
3. Cache weights configuration
4. Disable debug mode in production

---

## Testing Selection

Run examples to see engine in action:
```bash
npx tsx lib/selection.examples.ts
```

This demonstrates:
- Basic selection
- Hard filtering
- Weight presets
- Missing dimensions
- OR logic
- Determinism
- Helper functions
- Complex scenarios

---

## Extension

### Adding New Dimensions

When new dimensions are added to the registry:

1. **Add weights** to `selectionWeights.ts`:
```typescript
export const DEFAULT_SELECTION_WEIGHTS = {
  attributes: {
    // ... existing
    spiceLevel: {
      matchBonus: 15,
      mismatchPenalty: -5,
    },
  },
  tagMatchBonus: 5,
};
```

2. **Done!** Engine automatically uses new dimension.

No code changes needed in `selectionEngine.ts`.

---

## Best Practices

### ✅ DO
- Use default weights as starting point
- Test with real user scenarios
- Enable debug mode during development
- Adjust weights based on user feedback
- Use presets for common patterns

### ❌ DON'T
- Hardcode weights in business logic
- Skip hard filtering phase
- Assume missing dimensions mean exclusion
- Use random selection without top-N limiting
- Modify base score constant

---

## Integration Example

```typescript
// In an API route
import { selectFoods } from '@/lib/selectionEngine';
import { foods } from '@/data/foods';

export async function POST(request: Request) {
  const { preferences } = await request.json();
  
  const result = selectFoods(foods, preferences);
  
  return Response.json({
    items: result.items
      .filter(i => !i.hardFiltered)
      .slice(0, 10) // Top 10
      .map(i => i.food),
  });
}
```

---

## Summary

The selection engine provides:
- ✅ Hard filtering for safety (conflicts)
- ✅ Soft scoring for preferences (ranking)
- ✅ Configurable weights (flexibility)
- ✅ Deterministic results (testability)
- ✅ Debug transparency (development)
- ✅ Helper utilities (convenience)

All without modifying validation or registry systems.
