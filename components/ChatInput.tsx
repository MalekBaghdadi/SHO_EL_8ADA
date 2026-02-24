"use client";

import { useState } from "react";

interface Intent {
  tags: string[];
  exclude?: string[];
}

interface ChatInputProps {
  onIntentResolved: (tags: string[]) => void;
  onFullIntent: (intent: Intent) => void;
}

export default function ChatInput({ onIntentResolved, onFullIntent }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setIsLoading(true);
    setInput("");

    try {
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const intent: Intent = await response.json();

      // Pass tags to parent (as per spec)
      onIntentResolved(intent.tags);

      // Pass full intent for excludes handling
      onFullIntent(intent);
    } catch (error) {
      console.error("Failed to get intent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kteb shi 3an el 8ada..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-green disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-6 py-2 bg-brand-green hover:bg-brand-green/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}
