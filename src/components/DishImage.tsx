import { useState } from "react";
import type { Dish } from "../types";
import { photoUrl } from "../lib/photos";

// Warm gradients for dishes without a photo; picked by a stable hash of the id.
const GRADIENTS = [
  ["#f6a03b", "#d9481f"],
  ["#e9b949", "#b8651b"],
  ["#8fb85a", "#3f7a2a"],
  ["#e47b5c", "#9c2f3a"],
  ["#d9a066", "#7a4a26"],
  ["#f2c46d", "#e0482a"],
];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Hand-picked emoji for dishes that use the illustrated card.
const EMOJI: Record<string, string> = {
  rakakat: "🧀", "znoud-el-sit": "🍮", osmalieh: "🥧", ghraybeh: "🍪", "riz-djej": "🍗", "samke-harra": "🐟",
  "kibbeh-labanieh": "🥣", hindbeh: "🥬", "fattet-batenjan": "🍆", moussaka: "🍆", balila: "🫘", "eggs-awarma": "🍳",
};

function dishEmoji(d: Dish): string {
  if (EMOJI[d.id]) return EMOJI[d.id];
  if (d.meals.length === 1 && d.meals[0] === "dessert") return "🍰";
  if (d.meals.length === 1 && d.meals[0] === "breakfast") return "🍳";
  const p = d.protein[0];
  return p === "fish" ? "🐟" : p === "chicken" ? "🍗" : p === "meat" ? "🥘" : "🥗";
}

/** Photo when we have one (and it loads), otherwise an illustrated card. */
export default function DishImage({ dish, eager = false, compact = false }: { dish: Dish; eager?: boolean; compact?: boolean }) {
  const src = photoUrl(dish.id);
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={dish.name}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    );
  }

  const [a, b] = GRADIENTS[hash(dish.id) % GRADIENTS.length];
  return (
    <div className="art" style={{ background: `linear-gradient(150deg, ${a}, ${b})` }} role="img" aria-label={dish.name}>
      {!compact && <div className="art-ar" dir="rtl">{dish.nameAr}</div>}
      <div className="art-emoji">{dishEmoji(dish)}</div>
    </div>
  );
}
