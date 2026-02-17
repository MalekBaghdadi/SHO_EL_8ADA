"use client";

export default function FoodCardSkeleton() {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto border border-gray-700 animate-pulse">
            <div className="text-center mb-4">
                <div className="h-10 bg-gray-700 rounded-lg w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-600 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
    );
}
