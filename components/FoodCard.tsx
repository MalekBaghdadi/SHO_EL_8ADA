"use client";

import Image from "next/image";
import { Food } from "@/types/food";
import { resolveFoodImage } from "@/lib/imageResolver";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FoodCardProps {
  food: Food;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export default function FoodCard({ food, isFavorite, onToggleFavorite }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const imagePath = resolveFoodImage(food);

  return (
    <div className="relative max-w-md mx-auto min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={food.id}
          initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            x: 50,
            filter: "blur(20px)",
            transition: { duration: 0.4, ease: "easeIn" }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 w-full relative"
        >
          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(food.id)}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-900/60 backdrop-blur-md rounded-full text-white hover:text-red-500 transition-all shadow-lg border border-white/10"
          >
            <svg
              className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image not available</p>
              </div>
            ) : (
              <Image
                src={imagePath}
                alt={food.name3ar}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                onError={() => setImageError(true)}
                priority
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
