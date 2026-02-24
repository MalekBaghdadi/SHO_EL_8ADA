"use client";

import { useState, useMemo } from "react";
import { Food } from "@/types/food";
import { UserPreferences, SelectionResult } from "@/types/selection";
import { selectFoods } from "@/lib/selectionEngine";
import { DEFAULT_SELECTION_WEIGHTS } from "@/lib/selectionWeights";
import { DIMENSION_REGISTRY } from "@/lib/dimensionRegistry";

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_FOODS: Food[] = [
  {
    id: 1,
    name3ar: "7mous",
    nameAr: "حمص",
    mealType: "appetizer",
    tags: ["healthy", "light", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["tarwee2a", "8ada"],
      dietType: ["vegan"],
      source: ["homecooking", "delivery"],
    },
  },
  {
    id: 2,
    name3ar: "Shawarma Chicken",
    nameAr: "شاورما دجاج",
    mealType: "main",
    tags: ["quick", "trendy", "heavy"],
    imageUrl: "https://images.unsplash.com/photo-1662116765994-1e4200c43589?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["8ada", "3asha"],
      dietType: ["chicken"],
      source: ["delivery"],
    },
  },
  {
    id: 3,
    name3ar: "Shawarma Meat",
    nameAr: "شاورما لحمة",
    mealType: "main",
    tags: ["quick", "trendy", "heavy"],
    imageUrl: "https://images.unsplash.com/photo-1529006557870-1748259bd77e?q=80&w=2000&auto=format&fit=crop",
    attributes: {
      timeOfDay: ["8ada", "3asha"],
      dietType: ["meat"],
      source: ["delivery"],
    },
  },
  {
    id: 4,
    name3ar: "Fattoush",
    nameAr: "فتوش",
    mealType: "appetizer",
    tags: ["fresh", "healthy", "light"],
    imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["8ada"],
      dietType: ["vegan"],
      source: ["homecooking"],
    },
  },
  {
    id: 5,
    name3ar: "Knefeh",
    nameAr: "كنافة",
    mealType: "dessert",
    tags: ["sweet", "trendy", "traditional"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/10/Kunafa-Kanafeh.jpg",
    attributes: {
      timeOfDay: ["tarwee2a", "3asha"], // Breakfast or dinner/dessert
      dietType: ["vegan"], // Usually vegan-friendly base, cheese is dairy but not meat
      source: ["delivery"],
    },
  },
  {
    id: 6,
    name3ar: "Mjaddara",
    nameAr: "مجدرة",
    mealType: "main",
    tags: ["heavy", "comfort", "traditional"],
    imageUrl: "https://images.unsplash.com/photo-153806655523d-718915520970?auto=format&fit=crop&q=80&w=800",
    attributes: {
      // Missing timeOfDay - should be neutral
      dietType: ["vegan"],
      source: ["homecooking"],
    },
  },
  {
    id: 7,
    name3ar: "Sayadieh",
    nameAr: "صيادية",
    mealType: "main",
    tags: ["healthy", "heavy", "traditional"],
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Fish_Sayadieh.jpg",
    attributes: {
      timeOfDay: ["8ada"],
      dietType: ["fish"],
      source: ["homecooking"],
    },
  },
  {
    id: 8,
    name3ar: "Man2oushe Zaatar",
    nameAr: "منقوشة زعتر",
    mealType: "appetizer",
    tags: ["quick", "trendy", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["tarwee2a"],
      dietType: ["vegan"],
      source: ["delivery", "homecooking"],
    },
  },
  {
    id: 9,
    name3ar: "Man2oushe Jebneh",
    nameAr: "منقوشة جبنة",
    mealType: "appetizer",
    tags: ["quick", "trendy", "comfort"],
    imageUrl: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["tarwee2a", "3asha"],
      dietType: ["vegan"], // Technically vegetarian, but we use vegan for non-meat
      source: ["delivery"],
    },
  },
  {
    id: 10,
    name3ar: "Mystery Item",
    nameAr: "؟؟؟",
    mealType: "main",
    tags: [],
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
    // No attributes at all
  },
  {
    id: 11,
    name3ar: "Mixed Grill",
    nameAr: "مشاوي",
    mealType: "main",
    tags: ["heavy", "trendy", "traditional"],
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["8ada", "3asha"],
      dietType: ["meat", "chicken"], // Mixed!
      source: ["delivery"],
    },
  },
  {
    id: 12,
    name3ar: "Falafel",
    nameAr: "فلافل",
    mealType: "main",
    tags: ["quick", "trendy", "heavy"],
    imageUrl: "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?auto=format&fit=crop&q=80&w=800",
    attributes: {
      timeOfDay: ["8ada", "3asha"],
      dietType: ["vegan"],
      source: ["delivery"],
    },
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function SelectionPlayground() {
  // State
  const [preferences, setPreferences] = useState<UserPreferences>({
    attributes: {
      timeOfDay: [],
      dietType: [],
      source: [],
    },
    tags: [],
  });

  const [debugMode, setDebugMode] = useState(true);

  // Handlers
  const toggleAttribute = (dimension: string, value: string) => {
    setPreferences((prev) => {
      const currentValues = prev.attributes?.[dimension] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [dimension]: newValues,
        },
      };
    });
  };

  // Selection Logic
  const result: SelectionResult = useMemo(() => {
    return selectFoods(
      MOCK_FOODS,
      preferences,
      DEFAULT_SELECTION_WEIGHTS,
      true // Always request debug info, toggle visibility in UI
    );
  }, [preferences]);

  // Render Helpers
  const renderCheckbox = (dimension: string, value: string) => {
    const isChecked = preferences.attributes?.[dimension]?.includes(value);
    return (
      <label key={value} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleAttribute(dimension, value)}
          className="w-4 h-4"
        />
        <span className="text-gray-300">{value}</span>
      </label>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8 text-brand-green">
        Selection Engine Playground
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS SIDEBAR */}
        <div className="lg:col-span-4 space-y-8 bg-gray-800 p-6 rounded-lg h-fit">
          <div>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              Preferences
            </h2>

            {/* Time of Day */}
            <div className="mb-6">
              <h3 className="text-brand-green font-bold mb-2">Time of Day</h3>
              <div className="space-y-2">
                {DIMENSION_REGISTRY.timeOfDay.values.map((val) =>
                  renderCheckbox("timeOfDay", val)
                )}
              </div>
            </div>

            {/* Diet Type */}
            <div className="mb-6">
              <h3 className="text-brand-green font-bold mb-2">Diet Type</h3>
              <div className="space-y-2">
                {DIMENSION_REGISTRY.dietType.values.map((val) =>
                  renderCheckbox("dietType", val)
                )}
              </div>
            </div>

            {/* Source */}
            <div className="mb-6">
              <h3 className="text-brand-green font-bold mb-2">Source</h3>
              <div className="space-y-2">
                {DIMENSION_REGISTRY.source.values.map((val) =>
                  renderCheckbox("source", val)
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
              Settings
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Enable Debug Mode</span>
            </label>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 p-4 rounded text-sm">
            <p>Total Items: {result.totalItems}</p>
            <p>Filtered Out: {result.filteredCount}</p>
            <p>Available: {result.items.filter(i => !i.hardFiltered).length}</p>
          </div>
        </div>

        {/* RESULTS AREA */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            Ranked Results ({result.items.filter(i => !i.hardFiltered).length})
          </h2>

          {result.items.map((item) => {
            if (item.hardFiltered) {
              if (!debugMode) return null; // Hide filtered items unless debug mode
              return (
                <div
                  key={item.food.id}
                  className="bg-red-900/20 border border-red-800 p-4 rounded opacity-75"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-red-400">
                      {item.food.name3ar} <span className="text-sm font-normal">(Filtered)</span>
                    </h3>
                    <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs">
                      EXCLUDED
                    </span>
                  </div>
                  <p className="text-red-300 mt-2 text-sm">
                    Reason: {item.filterReason}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={item.food.id}
                className="bg-gray-800 border border-gray-700 p-4 rounded hover:border-brand-green transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {item.food.name3ar}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-brand-green">
                      {item.finalScore}
                    </span>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>

                {/* Debug Breakdown */}
                {debugMode && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 mb-1">Base Score</p>
                        <p className="font-mono">{item.baseScore}</p>
                      </div>

                      {item.dimensionScores.map((ds) => (
                        <div key={ds.dimension}>
                          <p className="text-gray-500 mb-1 capitalize">
                            {ds.dimension}
                          </p>
                          <p className={`font-mono ${ds.score > 0 ? 'text-green-400' : ds.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {ds.score > 0 ? '+' : ''}{ds.score} ({ds.reason})
                          </p>
                        </div>
                      ))}

                      {item.tagScore > 0 && (
                        <div>
                          <p className="text-gray-500 mb-1">Tags</p>
                          <p className="font-mono text-green-400">
                            +{item.tagScore} ({item.matchedTags.join(', ')})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
