"use client";

import { useState, useEffect, useCallback } from "react";
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
import FoodCardSkeleton from "@/components/FoodCardSkeleton";
import FoodHistory from "@/components/FoodHistory";
import { usePersistence } from "@/lib/hooks/usePersistence";
import { foods as allFoods } from "@/data/foods";
import DecisionExplanation from "@/components/DecisionExplanation";

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
  "7elo",
  "tarwee2a",
  "8ada",
  "3asha"
];

interface Intent {
  tags: string[];
  exclude?: string[];
}

export default function Home() {
  const {
    favorites,
    history,
    settings,
    isLoaded: persistenceLoaded,
    toggleFavorite,
    addToHistory,
    clearHistory,
    updateSettings
  } = usePersistence();

  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [includedTags, setIncludedTags] = useState<string[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [aiIntent, setAiIntent] = useState<Intent | null>(null);
  const [selectionDebug, setSelectionDebug] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [excludedFoodIds, setExcludedFoodIds] = useState<number[]>([]);
  const [sessionBias, setSessionBias] = useState<SessionBias>(EMPTY_SESSION_BIAS);
  const [decisionTightness, setDecisionTightness] = useState(0.6);

  // Sync persistent settings to local state
  useEffect(() => {
    if (persistenceLoaded && settings.persistentExcludedTags.length > 0) {
      setExcludedTags(prev => Array.from(new Set([...prev, ...settings.persistentExcludedTags])));
    }
  }, [persistenceLoaded, settings.persistentExcludedTags]);

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
  const updateFoodSelection = useCallback((lastId?: number, overrides?: Partial<any>) => {
    const result = selectFood({
      foods,
      selectedTags: includedTags,
      excludedTags,
      aiIntent,
      lastFoodId: lastId,
      excludedFoodIds,
      sessionBias,
      decisionTightness,
      favorites,
      history,
      ...overrides
    });

    if (result.selectedFood) {
      setCurrentFood(result.selectedFood);
      setSelectionDebug(result.debug);
    }

    // Slight delay for skeleton visibility and "feeling" of AI thinking
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    // Debug logging for analytics/validation
    if (process.env.NODE_ENV === 'development') {
      console.log("Selection Debug:", result.debug);
    }
  }, [includedTags, excludedTags, aiIntent, excludedFoodIds, sessionBias, decisionTightness, favorites, history]);

  // Update selection when filters change
  useEffect(() => {
    // Reset exclusions and bias when preferences change
    setExcludedFoodIds([]);
    setSessionBias(EMPTY_SESSION_BIAS);
    setIsTransitioning(true);
    // Explicitly use empty values for this immediate selection to avoid stale state
    updateFoodSelection(undefined, { excludedFoodIds: [], sessionBias: EMPTY_SESSION_BIAS });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedTags, excludedTags, aiIntent]);

  const handleNextFood = () => {
    // Implicit acceptance - user didn't reject current food
    if (currentFood) {
      setSessionBias(prev => updateBiasOnAccept(prev, currentFood));
      addToHistory(currentFood.id);
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

    if (includedTags.includes(tag)) {
      // Transition: Included -> Excluded
      setIncludedTags(prev => prev.filter(t => t !== tag));
      setExcludedTags(prev => Array.from(new Set([...prev, tag])));
      // Persistent part: If we want every exclusion to be persistent
      if (!settings.persistentExcludedTags.includes(tag)) {
        updateSettings({
          persistentExcludedTags: [...settings.persistentExcludedTags, tag]
        });
      }
    } else if (excludedTags.includes(tag)) {
      // Transition: Excluded -> None
      setExcludedTags(prev => prev.filter(t => t !== tag));
      // Remove from persistence as well
      if (settings.persistentExcludedTags.includes(tag)) {
        updateSettings({
          persistentExcludedTags: settings.persistentExcludedTags.filter(t => t !== tag)
        });
      }
    } else {
      // Transition: None -> Included
      setIncludedTags(prev => [...prev, tag]);
      // Safety: ensure it's not in excluded
      setExcludedTags(prev => prev.filter(t => t !== tag));
      if (settings.persistentExcludedTags.includes(tag)) {
        updateSettings({
          persistentExcludedTags: settings.persistentExcludedTags.filter(t => t !== tag)
        });
      }
    }
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
            // Only include AI tags that aren't currently explicitly excluded
            const normalized = TAGS.filter(tag =>
              aiTags.includes(tag) && !excludedTags.includes(tag)
            );
            console.log("Normalized tags:", normalized);
            setIncludedTags(normalized);
          }}
          onFullIntent={(intent) => setAiIntent(intent)}
        />
        <div className="w-full mb-6">
          {/* Active Filters Summary (when collapsed) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Group Pills */}
            {Object.entries(TAG_GROUPS).map(([key, group]) => {
              const isExpanded = expandedGroup === key;
              const groupIncluded = includedTags.filter(t => group.tags.includes(t));
              const groupExcluded = excludedTags.filter(t => group.tags.includes(t));
              const hasSelection = groupIncluded.length > 0 || groupExcluded.length > 0;

              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${groupIncluded.length > 0
                        ? 'bg-brand-green text-white shadow-sm'
                        : groupExcluded.length > 0
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    <span>{group.label}</span>
                    {hasSelection && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                        {groupIncluded.length + groupExcluded.length}
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
                  const isIncluded = includedTags.includes(tag);
                  const isExcluded = excludedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-all border
                        ${isIncluded
                          ? 'bg-brand-green/20 text-brand-green border-brand-green'
                          : isExcluded
                            ? 'bg-red-500/20 text-red-500 border-red-500'
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
          {!expandedGroup && (includedTags.length > 0 || excludedTags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in duration-200">
              {includedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 rounded-full text-xs bg-brand-green/10 text-brand-green border border-brand-green/30 hover:bg-brand-green/20"
                >
                  {tag} ✕
                </button>
              ))}
              {excludedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                >
                  {tag} (no) ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Decision Tightness Control */}
        {(includedTags.length > 0 || excludedTags.length > 0) && (
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

        {isTransitioning ? (
          <FoodCardSkeleton />
        ) : currentFood ? (
          <>
            <FoodCard
              food={currentFood}
              isFavorite={favorites.includes(currentFood.id)}
              onToggleFavorite={toggleFavorite}
            />
            {selectionDebug && (
              <div className="flex flex-col items-center mt-2">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-widest font-bold transition-colors py-2"
                >
                  {showExplanation ? "Hide Logic" : "Why this decision?"}
                </button>
                <div className="w-full">
                  <DecisionExplanation
                    debug={selectionDebug}
                    isVisible={showExplanation}
                    onClose={() => setShowExplanation(false)}
                  />
                </div>
              </div>
            )}
          </>
        ) : null}

        <FoodHistory
          history={history}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onClearHistory={clearHistory}
          onSelect={(id) => {
            const food = foods.find(f => f.id === id);
            if (food) {
              setCurrentFood(food);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
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
            onClick={() => {
              setIncludedTags([]);
              setExcludedTags([]);
            }}
            className="text-white/60 hover:text-white text-sm transition-colors mt-2"
          >
            Reset tags
          </button>
        </div>
      </div>
    </main>
  );
}
