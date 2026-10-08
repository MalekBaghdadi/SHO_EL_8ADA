import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dishes } from "./data/dishes";
import type { Dish, Filters, HistoryEntry } from "./types";
import { EMPTY_FILTERS } from "./types";
import { buildDeck, learn, matches, type Taste } from "./lib/engine";
import { usePersisted } from "./lib/storage";
import Deck, { type Dir } from "./components/Deck";
import FilterBar from "./components/Filters";
import Shuffle from "./components/Shuffle";
import Decided from "./components/Decided";
import Saved from "./components/Saved";
import About from "./components/About";
import { CheckIcon, DiceIcon, HeartIcon, InfoIcon, UndoIcon, XIcon } from "./components/Icons";

const HISTORY_MAX = 60;

type LastAction = { dish: Dish; dir: Dir; taste: Taste };

export default function App() {
  const [filters, setFilters] = usePersisted<Filters>("filters", EMPTY_FILTERS);
  const [favorites, setFavorites] = usePersisted<string[]>("favorites", []);
  const [history, setHistory] = usePersisted<HistoryEntry[]>("history", []);
  const [taste, setTaste] = usePersisted<Taste>("taste", {});
  const [hintSeen, setHintSeen] = usePersisted("hint-seen", false);

  const [skipped, setSkipped] = useState<Set<string>>(() => new Set());
  const [deck, setDeck] = useState<Dish[]>([]);
  const [exitDir, setExitDir] = useState<Dir>("left");
  const [last, setLast] = useState<LastAction | null>(null);
  const [decided, setDecided] = useState<{ dish: Dish; celebrate: boolean } | null>(null);
  const [shuffle, setShuffle] = useState<{ pool: Dish[]; winner: Dish } | null>(null);
  const [sheet, setSheet] = useState<"saved" | "about" | null>(null);

  const matchCount = useMemo(() => dishes.filter((d) => matches(d, filters)).length, [filters]);

  // Rebuild the deck only when filters change (or it's reshuffled), so cards don't jump mid-swipe.
  const rebuild = useCallback(
    (exclude: Set<string>) => setDeck(buildDeck(dishes, filters, { taste, favorites, history, exclude })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters],
  );
  useEffect(() => rebuild(skipped), [rebuild]); // eslint-disable-line react-hooks/exhaustive-deps

  const record = (d: Dish) => setHistory((h) => [{ id: d.id, at: Date.now() }, ...h].slice(0, HISTORY_MAX));

  const swipe = useCallback(
    (dish: Dish, dir: Dir) => {
      setExitDir(dir);
      setDeck((dk) => dk.filter((d) => d.id !== dish.id));
      setLast({ dish, dir, taste });
      setTaste(learn(taste, dish, dir === "right"));
      setHintSeen(true);
      if (dir === "left") {
        setSkipped((s) => new Set(s).add(dish.id));
      } else {
        record(dish);
        setDecided({ dish, celebrate: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taste],
  );

  const undo = () => {
    if (!last) return;
    setTaste(last.taste);
    setSkipped((s) => {
      const n = new Set(s);
      n.delete(last.dish.id);
      return n;
    });
    if (last.dir === "right") setHistory((h) => (h[0]?.id === last.dish.id ? h.slice(1) : h));
    setDeck((dk) => [last.dish, ...dk.filter((d) => d.id !== last.dish.id)]);
    setLast(null);
  };

  const decide = () => {
    if (!deck.length) return;
    const winner = deck[Math.floor(Math.random() * Math.min(5, deck.length))];
    const others = deck.filter((d) => d.id !== winner.id);
    const pool = others.length ? Array.from({ length: 16 }, (_, i) => others[i % others.length]) : [winner];
    setShuffle({ pool, winner });
  };

  const finishShuffle = () => {
    if (!shuffle) return;
    const { winner } = shuffle;
    setShuffle(null);
    setExitDir("right");
    setDeck((dk) => dk.filter((d) => d.id !== winner.id));
    setTaste((t) => learn(t, winner, true));
    setLast(null);
    record(winner);
    setDecided({ dish: winner, celebrate: true });
  };

  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f]));

  const startOver = () => {
    const fresh = new Set<string>();
    setSkipped(fresh);
    rebuild(fresh);
  };

  // Keyboard: ← skip, → pick, D decide, U / Backspace undo.
  const overlayOpen = !!(decided || shuffle || sheet);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlayOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" && deck[0]) swipe(deck[0], "left");
      else if (e.key === "ArrowRight" && deck[0]) swipe(deck[0], "right");
      else if (e.key.toLowerCase() === "d") decide();
      else if (e.key.toLowerCase() === "u" || e.key === "Backspace") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const top = deck[0];

  return (
    <div className="app">
      <header className="header">
        <div className="wordmark" aria-label="Sho el 8ada?">
          Sho el 8ada<span className="q">?</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setSheet("saved")} aria-label="Favorites and history">
            <HeartIcon />
            {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </button>
          <button className="icon-btn" onClick={() => setSheet("about")} aria-label="About">
            <InfoIcon />
          </button>
        </div>
      </header>

      <FilterBar filters={filters} onChange={setFilters} count={matchCount} />

      <main className="deck">
        {top ? (
          <Deck deck={deck} favorites={favorites} onToggleFav={toggleFav} onSwipe={swipe} exitDir={exitDir} />
        ) : matchCount === 0 ? (
          <div className="empty">
            <div className="big">🤷</div>
            <h2>Nothing fits all that</h2>
            <p>No dish matches every filter. Loosen one up, or clear them all.</p>
            <button className="btn primary" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="empty">
            <div className="big">🍽️</div>
            <h2>You've seen them all</h2>
            <p>That's every dish for these filters. Go around again? Your skips still count toward what it learned.</p>
            <button className="btn primary" onClick={startOver}>
              Shuffle again
            </button>
          </div>
        )}
      </main>

      <div className="actions">
        <button className="round small" onClick={undo} disabled={!last} aria-label="Undo last swipe">
          <UndoIcon />
        </button>
        <button className="round no" onClick={() => top && swipe(top, "left")} disabled={!top} aria-label="Skip">
          <XIcon />
        </button>
        <button className="decide-btn" onClick={decide} disabled={!top}>
          <DiceIcon /> Decide
        </button>
        <button className="round yes" onClick={() => top && swipe(top, "right")} disabled={!top} aria-label="This one">
          <CheckIcon />
        </button>
      </div>

      <p className="hint">{hintSeen ? " " : "Swipe right if it sounds good, left to skip, or let the app decide."}</p>

      <AnimatePresence>{shuffle && <Shuffle pool={shuffle.pool} winner={shuffle.winner} onDone={finishShuffle} />}</AnimatePresence>

      <AnimatePresence>
        {decided && (
          <Decided
            key={decided.dish.id}
            dish={decided.dish}
            celebrate={decided.celebrate}
            fav={favorites.includes(decided.dish.id)}
            onToggleFav={() => toggleFav(decided.dish.id)}
            onClose={() => setDecided(null)}
            onAgain={decided.celebrate ? () => setDecided(null) : undefined}
          />
        )}
      </AnimatePresence>

      <Saved
        open={sheet === "saved"}
        onClose={() => setSheet(null)}
        favorites={favorites}
        history={history}
        onOpenDish={(d) => {
          setSheet(null);
          setDecided({ dish: d, celebrate: false });
        }}
        onClearHistory={() => setHistory([])}
      />
      <About
        open={sheet === "about"}
        onClose={() => setSheet(null)}
        onResetTaste={() => {
          setTaste({});
          setSheet(null);
        }}
      />
    </div>
  );
}
