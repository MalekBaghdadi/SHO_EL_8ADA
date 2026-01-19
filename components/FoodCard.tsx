"use client";

import Image from "next/image";
import { Food } from "@/types/food";
import { useState } from "react";

interface FoodCardProps {
  food: Food;
}

export default function FoodCard({ food }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto border border-gray-700">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-white mb-2">{food.name3ar}</h2>
        <p className="text-base text-gray-400">{food.nameAr}</p>
      </div>
      <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
        {imageError ? (
          <div className="text-gray-500 text-center p-4">
            <svg
              className="w-24 h-24 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        ) : (
          <Image
            src={food.image}
            alt={food.name3ar}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
