import { useState } from "react";
import type { Dish, HistoryEntry } from "../types";
import { dishById } from "../data/dishes";
import DishImage from "./DishImage";
import Sheet from "./Sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  favorites: string[];
  history: HistoryEntry[];
  onOpenDish: (d: Dish) => void;
  onClearHistory: () => void;
}

const when = (t: number) => {
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export default function Saved({ open, onClose, favorites, history, onOpenDish, onClearHistory }: Props) {
  const [tab, setTab] = useState<"fav" | "hist">("fav");
  const favDishes = favorites.map((id) => dishById.get(id)).filter((d): d is Dish => !!d);
  const histRows = history.map((h) => ({ h, d: dishById.get(h.id) })).filter((r): r is { h: HistoryEntry; d: Dish } => !!r.d);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Your food"
      below={
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "fav"} className={tab === "fav" ? "on" : ""} onClick={() => setTab("fav")}>
            Favorites · {favDishes.length}
          </button>
          <button role="tab" aria-selected={tab === "hist"} className={tab === "hist" ? "on" : ""} onClick={() => setTab("hist")}>
            History · {histRows.length}
          </button>
        </div>
      }
    >
      {tab === "fav" &&
        (favDishes.length ? (
          favDishes.map((d) => <Row key={d.id} dish={d} sub={d.blurb} onClick={() => onOpenDish(d)} />)
        ) : (
          <p className="list-empty">
            No favorites yet.
            <br />
            Tap the ♡ on any dish to keep it here. Favorites also show up a bit more often.
          </p>
        ))}
      {tab === "hist" &&
        (histRows.length ? (
          <>
            {histRows.map(({ h, d }) => (
              <Row key={h.at} dish={d} sub={when(h.at)} onClick={() => onOpenDish(d)} />
            ))}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button className="text-btn" onClick={onClearHistory}>
                Clear history
              </button>
            </div>
          </>
        ) : (
          <p className="list-empty">
            Nothing decided yet.
            <br />
            Dishes you pick land here, and the app avoids repeating them for a few days.
          </p>
        ))}
    </Sheet>
  );
}

function Row({ dish, sub, onClick }: { dish: Dish; sub: string; onClick: () => void }) {
  return (
    <button className="dish-row" onClick={onClick}>
      <div className="thumb">
        <DishImage dish={dish} compact />
      </div>
      <div className="meta">
        <div className="nm">{dish.name}</div>
        <div className="sb">{sub}</div>
      </div>
    </button>
  );
}
