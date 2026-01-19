"use client";

interface FilterPillsProps {
  tags: string[];
  activeTags: string[];
  onTagClick: (tag: string) => void;
}

export default function FilterPills({
  tags,
  activeTags,
  onTagClick,
}: FilterPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-green text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
