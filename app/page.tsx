"use client";

import { useState, useEffect, useMemo } from "react";
import { Food } from "@/types/food";
import { foods } from "@/data/foods";
import {
  selectFood,
  SessionBias,
  EMPTY_SESSION_BIAS,
  updateBiasOnReject,
  updateBiasOnAccept
} from "@/lib/foodSelector";
import Logo from "@/components/Logo";
import FoodCard from "@/components/FoodCard";
import ChatInput from "@/components/ChatInput";

// Canonical tag list - single source of truth for UI
const TAGS = [
  "comfy",
  "healthy",
  "light",
  "beshabe3",
  "sare3",
  "trendy",
  "desem",
  "3arabe",
  "desem",
  "7elo"
];

interface Intent {
  tags: string[];
  exclude?: string[];
}

export default function Home() {
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [aiIntent, setAiIntent] = useState<Intent | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [excludedFoodIds, setExcludedFoodIds] = useState<number[]>([]);
  const [sessionBias, setSessionBias] = useState<SessionBias>(EMPTY_SESSION_BIAS);
  const [decisionTightness, setDecisionTightness] = useState(0.6);

  const TAG_GROUPS = {
    when: {
      label: 'When',
      tags: ['tarwee2a', '8ada', '3asha']
    },
    protein: {
      label: 'Protein',
      tags: ['chicken', 'meat', 'fish', 'vegan']
    },
    source: {
      label: 'Source',
      tags: ['homecooking', 'delivery']
    },
    mood: {
      label: 'Mood',
      tags: TAGS
    }
  };

  // Helper to update food selection
  const updateFoodSelection = (lastId?: number) => {
    const result = selectFood({
      foods,
      selectedTags,
      aiIntent,
      lastFoodId: lastId,
      excludedFoodIds,
      sessionBias,
      decisionTightness,
    });

    if (result.selectedFood) {
      setCurrentFood(result.selectedFood);
    }

    // Debug logging for analytics/validation
    if (process.env.NODE_ENV === 'development') {
      console.log("Selection Debug:", result.debug);
    }
  };

  // Update selection when filters change
  useEffect(() => {
    // Reset exclusions and bias when preferences change
    setExcludedFoodIds([]);
    setSessionBias(EMPTY_SESSION_BIAS);
    updateFoodSelection();
  }, [selectedTags, aiIntent]);

  const handleNextFood = () => {
    // Implicit acceptance - user didn't reject current food
    if (currentFood) {
      setSessionBias(prev => updateBiasOnAccept(prev, currentFood));
    }
    updateFoodSelection(currentFood?.id);
  };

  const handleRejectFood = () => {
    if (currentFood) {
      // Apply negative bias and exclude the food
      setSessionBias(prev => updateBiasOnReject(prev, currentFood));
      setExcludedFoodIds(prev => [...prev, currentFood.id]);
      updateFoodSelection(currentFood.id);
    }
  };

  const handleTagClick = (tag: string) => {
    setAiIntent(null);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };


  if (!currentFood) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-center text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg-dark pt-4 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Logo />
        <p className="text-center text-gray-400 mb-1 text-lg">
          Sho el 8ada? Kabse w bten7al!
        </p>
        <ChatInput
          onIntentResolved={(aiTags) => {
            console.log("AI tags:", aiTags);
            const normalized = TAGS.filter(tag => aiTags.includes(tag));
            console.log("Normalized tags:", normalized);
            setSelectedTags(normalized);
          }}
          onFullIntent={(intent) => setAiIntent(intent)}
        />
        <div className="w-full mb-6">
          {/* Active Filters Summary (when collapsed) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Group Pills */}
            {Object.entries(TAG_GROUPS).map(([key, group]) => {
              const isExpanded = expandedGroup === key;
              const groupSelectedTags = selectedTags.filter(t => group.tags.includes(t));
              const hasSelection = groupSelectedTags.length > 0;

              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${hasSelection
                        ? 'bg-brand-green text-white shadow-sm'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    <span>{group.label}</span>
                    {hasSelection && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                        {groupSelectedTags.length}
                      </span>
                    )}
                    <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded Tags Area */}
          <div className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${expandedGroup ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            {expandedGroup && (
              <div className="bg-gray-800/50 rounded-xl p-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                {TAG_GROUPS[expandedGroup as keyof typeof TAG_GROUPS].tags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-all border
                        ${isSelected
                          ? 'bg-brand-green/20 text-brand-green border-brand-green'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'}
                      `}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Tags (Visible when groups collapsed) */}
          {!expandedGroup && selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in duration-200">
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 rounded-full text-xs bg-brand-green/10 text-brand-green border border-brand-green/30 hover:bg-brand-green/20"
                >
                  {tag} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Decision Tightness Control */}
        {selectedTags.length > 0 && (
          <div className="mb-8 px-2">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Adventurous</span>
              <span>Safe</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={decisionTightness}
              onChange={(e) => setDecisionTightness(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
          </div>
        )}

        <FoodCard food={currentFood} />
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={handleNextFood}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            3a2bel tani
          </button>

          <button
            onClick={handleRejectFood}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            مش هيدا
          </button>

          <button
            onClick={() => setSelectedTags([])}
            className="text-white/60 hover:text-white text-sm transition-colors mt-2"
          >
            Reset tags
          </button>
        </div>
      </div>
    </main>
  );
}
