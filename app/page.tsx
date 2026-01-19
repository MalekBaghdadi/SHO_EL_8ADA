"use client";

import { useState, useEffect, useMemo } from "react";
import { Food } from "@/types/food";
import { foods } from "@/data/foods";
import { getRandomFood } from "@/lib/getRandomFood";
import Logo from "@/components/Logo";
import FoodCard from "@/components/FoodCard";
import FilterPills from "@/components/FilterPills";
import ChatInput from "@/components/ChatInput";

// Canonical tag list - single source of truth for UI
const TAGS = [
  "ra7a",
  "se7i",
  "khafeef",
  "shab3an",
  "sare3",
  "mashhour",
  "ta2lidi",
  "te2il",
  "taza",
  "7elw"
];

interface Intent {
  tags: string[];
  exclude?: string[];
}

export default function Home() {
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [aiIntent, setAiIntent] = useState<Intent | null>(null);

  // Extract unique tags from all foods
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    foods.forEach((food) => {
      food.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Get filtered foods based on active tags and AI intent
  const filteredFoods = useMemo(() => {
    let result = foods;

    // Apply selected tags filter (OR logic)
    if (selectedTags.length > 0) {
      result = result.filter((food) =>
        selectedTags.some((tag) => food.tags.includes(tag))
      );
    }

    // Apply AI intent filters (exclude only)
    if (aiIntent) {
      // Exclude categories
      if (aiIntent.exclude && aiIntent.exclude.length > 0) {
        result = result.filter(
          (food) => !aiIntent.exclude!.includes(food.category)
        );
      }
    }

    return result;
  }, [selectedTags, aiIntent]);

  useEffect(() => {
    // Initialize with a random food on mount
    const foodsToUse = filteredFoods.length > 0 ? filteredFoods : foods;
    setCurrentFood(getRandomFood(foodsToUse));
  }, [filteredFoods]);

  const handleNextFood = () => {
    const lastFoodId = currentFood?.id;
    const foodsToUse = filteredFoods.length > 0 ? filteredFoods : foods;
    setCurrentFood(getRandomFood(foodsToUse, lastFoodId));
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
    <main className="min-h-screen bg-bg-dark py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Logo />
        <p className="text-center text-gray-400 mb-4 text-lg">
          Sho el 8ada? Kheberna 3alek!
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
        <FilterPills
          tags={availableTags}
          activeTags={selectedTags}
          onTagClick={handleTagClick}
        />
        <FoodCard food={currentFood} />
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={handleNextFood}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-md"
          >
            3a2bel tani
          </button>

          <button onClick={() => setSelectedTags([])}>
            Reset tags
          </button>
        </div>
      </div>
    </main>
  );
}
