"use client";

import { Food } from "@/types/food";
import { foods } from "@/data/foods";
import Image from "next/image";

interface FoodHistoryProps {
    history: number[];
    onSelect: (id: number) => void;
    favorites: number[];
    onToggleFavorite: (id: number) => void;
    onClearHistory: () => void;
}

export default function FoodHistory({ history, onSelect, favorites, onToggleFavorite, onClearHistory }: FoodHistoryProps) {
    if (history.length === 0) return null;

    return (
        <div className="mt-8 mb-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Recently Accepted</h3>
                <button
                    onClick={onClearHistory}
                    className="text-[10px] text-gray-500 hover:text-red-400 uppercase tracking-tighter transition-colors border border-gray-700/50 px-2 py-0.5 rounded-md hover:border-red-500/30"
                >
                    Clear All
                </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {history.map(id => {
                    const food = foods.find(f => f.id === id);
                    if (!food) return null;
                    const isFavorite = favorites.includes(id);

                    return (
                        <div
                            key={id}
                            className="flex-shrink-0 w-32 group cursor-pointer"
                            onClick={() => onSelect(id)}
                        >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 mb-2 border border-gray-700 group-hover:border-brand-green transition-all">
                                <Image
                                    src={food.imageUrl}
                                    alt={food.name3ar}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(id);
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-black/40 backdrop-blur-sm rounded-full text-white hover:text-red-500 transition-colors"
                                >
                                    <svg
                                        className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-center text-gray-300 truncate font-medium">{food.name3ar}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
