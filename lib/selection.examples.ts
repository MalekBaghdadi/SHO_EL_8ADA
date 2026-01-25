/**
 * Selection Engine - Comprehensive Examples
 * 
 * Demonstrates all selection patterns with detailed output.
 */

import { Food } from '@/types/food';
import {
  selectFoods,
  selectRandomFromTop,
  getRankedFoods,
  hasAvailableFoods,
} from './selectionEngine';
import {
  DEFAULT_SELECTION_WEIGHTS,
  STRICT_DIET_WEIGHTS,
  TIME_PRIORITY_WEIGHTS,
  EXPLORATORY_WEIGHTS,
} from './selectionWeights';
import { UserPreferences } from '@/types/selection';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleFoods: Food[] = [
  {
    id: 1,
    name3ar: '7mous',
    nameAr: 'حمص',
    category: 'breakfast',
    tags: ['comfy', 'healthy', 'light'],
    image: '/images/hummus.jpg',
    attributes: {
      timeOfDay: ['tarwee2a', '8ada'],
      dietType: ['vegan'],
      source: ['homecooking', 'delivery'],
    },
  },
  {
    id: 7,
    name3ar: 'Shawarma',
    nameAr: 'شاورما',
    category: 'main',
    tags: ['trendy', 'sare3', 'beshabe3'],
    image: '/images/shawarma.jpg',
    attributes: {
      timeOfDay: ['8ada', '3asha'],
      dietType: ['chicken'],
      source: ['delivery'],
    },
  },
  {
    id: 18,
    name3ar: 'Knefeh',
    nameAr: 'كنافة',
    category: 'dessert',
    tags: ['sweet', 'trendy', 'te2lidi'],
    image: '/images/knefeh.jpg',
    attributes: {
      timeOfDay: ['3asha'],
      dietType: ['vegan'],
      source: ['delivery'],
    },
  },
  {
    id: 4,
    name3ar: 'Fattoush',
    nameAr: 'فتوش',
    category: 'main',
    tags: ['fresh', 'healthy', 'light'],
    image: '/images/fattoush.jpg',
    attributes: {
      timeOfDay: ['8ada'],
      dietType: ['vegan'],
      source: ['homecooking'],
    },
  },
  {
    id: 10,
    name3ar: 'Mjaddara',
    nameAr: 'مجدرة',
    category: 'main',
    tags: ['comfy', 'te2lidi', 'beshabe3'],
    image: '/images/mujaddara.jpg',
    // No attributes - should still work!
  },
];

// ============================================================================
// EXAMPLE 1: Basic Selection
// ============================================================================

console.log('=== EXAMPLE 1: Basic Selection ===\n');

const prefs1: UserPreferences = {
  attributes: {
    timeOfDay: ['8ada'], // Looking for lunch
    dietType: ['vegan'],
  },
  tags: ['healthy'],
};

const result1 = selectFoods(sampleFoods, prefs1, DEFAULT_SELECTION_WEIGHTS, true);

console.log(`Total items: ${result1.totalItems}`);
console.log(`Filtered out: ${result1.filteredCount}`);
console.log(`Available: ${result1.items.filter(i => !i.hardFiltered).length}\n`);

console.log('Ranked results:');
result1.items
  .filter((item) => !item.hardFiltered)
  .forEach((item, index) => {
    console.log(`${index + 1}. ${item.food.name3ar} - Score: ${item.finalScore}`);
    console.log(`   Base: ${item.baseScore}`);
    item.dimensionScores.forEach((ds) => {
      console.log(`   ${ds.dimension}: ${ds.score} (${ds.reason})`);
    });
    if (item.matchedTags.length > 0) {
      console.log(`   Tags: +${item.tagScore} (${item.matchedTags.join(', ')})`);
    }
    console.log();
  });

// Expected ranking:
// 1. Fattoush (matches both timeOfDay:8ada AND dietType:vegan, plus healthy tag)
// 2. Hummus (matches dietType:vegan, partial timeOfDay match, healthy tag)
// 3. Knefeh (matches dietType:vegan, but wrong time of day)
// 4. Mjaddara (no attributes, neutral)
// Shawarma is HARD FILTERED (chicken conflicts with vegan)

// ============================================================================
// EXAMPLE 2: Hard Filtering in Action
// ============================================================================

console.log('\n=== EXAMPLE 2: Hard Filtering (Vegan User) ===\n');

const veganPrefs: UserPreferences = {
  attributes: {
    dietType: ['vegan'],
  },
};

const veganResult = selectFoods(sampleFoods, veganPrefs, DEFAULT_SELECTION_WEIGHTS, true);

console.log('Available items:');
veganResult.items
  .filter((item) => !item.hardFiltered)
  .forEach((item) => {
    console.log(`- ${item.food.name3ar} (Score: ${item.finalScore})`);
  });

console.log('\nFiltered items:');
veganResult.items
  .filter((item) => item.hardFiltered)
  .forEach((item) => {
    console.log(`- ${item.food.name3ar} (Reason: ${item.filterReason})`);
  });

// Expected: Shawarma filtered out due to chicken/vegan conflict

// ============================================================================
// EXAMPLE 3: Different Weight Presets
// ============================================================================

console.log('\n=== EXAMPLE 3: Weight Presets ===\n');

const timePrefs: UserPreferences = {
  attributes: {
    timeOfDay: ['tarwee2a'],
    dietType: ['vegan'],
  },
};

console.log('Default Weights:');
const defaultResult = selectFoods(sampleFoods, timePrefs, DEFAULT_SELECTION_WEIGHTS, false);
defaultResult.items
  .filter(i => !i.hardFiltered)
  .slice(0, 3)
  .forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.food.name3ar}: ${item.finalScore}`);
  });

console.log('\nTime Priority Weights:');
const timeResult = selectFoods(sampleFoods, timePrefs, TIME_PRIORITY_WEIGHTS, false);
timeResult.items
  .filter(i => !i.hardFiltered)
  .slice(0, 3)
  .forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.food.name3ar}: ${item.finalScore}`);
  });

console.log('\nStrict Diet Weights:');
const strictResult = selectFoods(sampleFoods, timePrefs, STRICT_DIET_WEIGHTS, false);
strictResult.items
  .filter(i => !i.hardFiltered)
  .slice(0, 3)
  .forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.food.name3ar}: ${item.finalScore}`);
  });

console.log('\nExploratory Weights:');
const exploratoryResult = selectFoods(sampleFoods, timePrefs, EXPLORATORY_WEIGHTS, false);
exploratoryResult.items
  .filter(i => !i.hardFiltered)
  .slice(0, 3)
  .forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.food.name3ar}: ${item.finalScore}`);
  });

// ============================================================================
// EXAMPLE 4: Missing Dimensions are Neutral
// ============================================================================

console.log('\n=== EXAMPLE 4: Missing Dimensions (Neutral) ===\n');

const strictPrefs: UserPreferences = {
  attributes: {
    timeOfDay: ['8ada'],
    dietType: ['vegan'],
    source: ['delivery'],
  },
};

const result4 = selectFoods(sampleFoods, strictPrefs, DEFAULT_SELECTION_WEIGHTS, true);

console.log('Mjaddara (no attributes):');
const mjaddara = result4.items.find((i) => i.food.name3ar === 'Mjaddara');
if (mjaddara) {
  console.log(`Score: ${mjaddara.finalScore}`);
  console.log('Dimension scores:');
  mjaddara.dimensionScores.forEach((ds) => {
    console.log(`  ${ds.dimension}: ${ds.score} (${ds.reason})`);
  });
}

// Expected: Mjaddara gets base score (100) with no bonuses or penalties

// ============================================================================
// EXAMPLE 5: OR Logic Within Dimension
// ============================================================================

console.log('\n=== EXAMPLE 5: OR Logic Within Dimension ===\n');

const multiTimePrefs: UserPreferences = {
  attributes: {
    timeOfDay: ['tarwee2a', '8ada'], // Breakfast OR lunch
  },
};

const result5 = selectFoods(sampleFoods, multiTimePrefs, DEFAULT_SELECTION_WEIGHTS, false);

console.log('User wants: tarwee2a OR 8ada\n');
result5.items
  .filter(i => !i.hardFiltered)
  .forEach((item) => {
    const timeScore = item.dimensionScores.find(
      (ds) => ds.dimension === 'timeOfDay'
    );
    console.log(
      `${item.food.name3ar}: ${timeScore?.reason || 'no time dimension'}`
    );
  });

// Expected: Items with EITHER tarwee2a OR 8ada get bonus

// ============================================================================
// EXAMPLE 6: Helper Functions
// ============================================================================

console.log('\n=== EXAMPLE 6: Helper Functions ===\n');

// Get ranked foods (just the Food objects)
const rankedFoods = getRankedFoods(sampleFoods, prefs1);
console.log('Ranked foods (names only):');
rankedFoods.forEach((food, idx) => {
  console.log(`${idx + 1}. ${food.name3ar}`);
});

// Check if any foods available
const hasAvailable = hasAvailableFoods(sampleFoods, veganPrefs);
console.log(`\nHas available vegan foods: ${hasAvailable}`);

// Select random from top 3
console.log('\nRandom from top 3 (run multiple times):');
for (let i = 0; i < 5; i++) {
  const random = selectRandomFromTop(sampleFoods, prefs1, 3);
  console.log(`  ${i + 1}. ${random?.name3ar || 'none'}`);
}

// ============================================================================
// EXAMPLE 7: Determinism Test
// ============================================================================

console.log('\n=== EXAMPLE 7: Determinism Test ===\n');

const testPrefs: UserPreferences = {
  attributes: {
    dietType: ['vegan'],
  },
  tags: ['healthy'],
};

const run1 = selectFoods(sampleFoods, testPrefs);
const run2 = selectFoods(sampleFoods, testPrefs);
const run3 = selectFoods(sampleFoods, testPrefs);

const scores1 = run1.items.map((i) => i.finalScore);
const scores2 = run2.items.map((i) => i.finalScore);
const scores3 = run3.items.map((i) => i.finalScore);

const isDeterministic =
  JSON.stringify(scores1) === JSON.stringify(scores2) &&
  JSON.stringify(scores2) === JSON.stringify(scores3);

console.log(`Deterministic: ${isDeterministic ? '✅' : '❌'}`);
console.log('Run 1 scores:', scores1);
console.log('Run 2 scores:', scores2);
console.log('Run 3 scores:', scores3);

// Expected: All runs produce identical scores

// ============================================================================
// EXAMPLE 8: Empty Preferences
// ============================================================================

console.log('\n=== EXAMPLE 8: Empty Preferences ===\n');

const emptyPrefs: UserPreferences = {};

const emptyResult = selectFoods(sampleFoods, emptyPrefs);

console.log('With no preferences:');
emptyResult.items.forEach((item) => {
  console.log(`${item.food.name3ar}: ${item.finalScore}`);
});

// Expected: All items get base score (100), no filtering

// ============================================================================
// EXAMPLE 9: Tags Only
// ============================================================================

console.log('\n=== EXAMPLE 9: Tags Only (No Attributes) ===\n');

const tagOnlyPrefs: UserPreferences = {
  tags: ['healthy', 'light'],
};

const tagResult = selectFoods(sampleFoods, tagOnlyPrefs, DEFAULT_SELECTION_WEIGHTS, true);

console.log('Results:');
tagResult.items
  .filter(i => !i.hardFiltered)
  .forEach((item) => {
    console.log(`${item.food.name3ar}: ${item.finalScore} (tags: ${item.matchedTags.join(', ') || 'none'})`);
  });

// Expected: Items ranked by number of matching tags

// ============================================================================
// EXAMPLE 10: Complex Scenario
// ============================================================================

console.log('\n=== EXAMPLE 10: Complex Scenario ===\n');

const complexPrefs: UserPreferences = {
  attributes: {
    timeOfDay: ['8ada', '3asha'], // Lunch or dinner
    dietType: ['vegan'],
    source: ['delivery'],
  },
  tags: ['trendy', 'comfy'],
};

const complexResult = selectFoods(
  sampleFoods,
  complexPrefs,
  DEFAULT_SELECTION_WEIGHTS,
  true
);

console.log('Top 3 for complex preferences:');
complexResult.items
  .filter(i => !i.hardFiltered)
  .slice(0, 3)
  .forEach((item, idx) => {
    console.log(`\n${idx + 1}. ${item.food.name3ar} - Total: ${item.finalScore}`);
    console.log(`   Base: ${item.baseScore}`);
    item.dimensionScores.forEach((ds) => {
      console.log(`   ${ds.dimension}: ${ds.score} (${ds.reason})`);
    });
    if (item.tagScore > 0) {
      console.log(`   Tags: +${item.tagScore} (${item.matchedTags.join(', ')})`);
    }
  });

console.log('\n=== END OF EXAMPLES ===');
