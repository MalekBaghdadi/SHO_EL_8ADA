import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import type { Dish } from "../types";
import { MOODS, SOURCES } from "../lib/labels";
import DishImage from "./DishImage";
import { HeartIcon } from "./Icons";

export type Dir = "left" | "right";

interface Props {
  deck: Dish[];
  favorites: string[];
  onToggleFav: (id: string) => void;
  onSwipe: (dish: Dish, dir: Dir) => void;
  exitDir: Dir;
}

const VISIBLE = 3;

export default function Deck({ deck, favorites, onToggleFav, onSwipe, exitDir }: Props) {
  const shown = deck.slice(0, VISIBLE);
  return (
    <AnimatePresence custom={exitDir}>
      {shown
        .map((d, i) => (
          <SwipeCard
            key={d.id}
            dish={d}
            depth={i}
            fav={favorites.includes(d.id)}
            onToggleFav={() => onToggleFav(d.id)}
            onSwipe={(dir) => onSwipe(d, dir)}
          />
        ))
        .reverse()}
    </AnimatePresence>
  );
}

const exitVariants = {
  exit: (dir: Dir) => ({
    x: dir === "right" ? 520 : -520,
    rotate: dir === "right" ? 18 : -18,
    opacity: 0,
    transition: { duration: 0.32, ease: "easeIn" as const },
  }),
};

function SwipeCard({
  dish,
  depth,
  fav,
  onToggleFav,
  onSwipe,
}: {
  dish: Dish;
  depth: number;
  fav: boolean;
  onToggleFav: () => void;
  onSwipe: (dir: Dir) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const yesOpacity = useTransform(x, [20, 110], [0, 1]);
  const noOpacity = useTransform(x, [-110, -20], [1, 0]);
  const top = depth === 0;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power > 120) onSwipe("right");
    else if (power < -120) onSwipe("left");
  };

  const moods = dish.moods.slice(0, 3).map((m) => MOODS.find((x) => x.value === m)!);
  const where = dish.source.length === 2 ? "Home or out" : SOURCES.find((s) => s.value === dish.source[0])!.label;

  return (
    <motion.article
      className={`card ${top ? "top" : ""}`}
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={{ scale: 0.88, y: 28, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 16, opacity: depth < 2 ? 1 : 0.7 }}
      exit="exit"
      variants={exitVariants}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      drag={top ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      aria-hidden={!top}
      aria-label={top ? `${dish.name}. ${dish.blurb}` : undefined}
    >
      <div className="card-media">
        <DishImage dish={dish} eager={depth < 2} />
      </div>
      <div className="card-shade" />
      {top && (
        <>
          <motion.div className="stamp yes" style={{ opacity: yesOpacity }}>
            YALLA
          </motion.div>
          <motion.div className="stamp no" style={{ opacity: noOpacity }}>
            NAH
          </motion.div>
        </>
      )}
      <button
        className={`fav-btn ${fav ? "on" : ""}`}
        onClick={onToggleFav}
        onPointerDownCapture={(e) => e.stopPropagation()}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={fav}
        tabIndex={top ? 0 : -1}
      >
        <HeartIcon filled={fav} />
      </button>
      <div className="card-body">
        <div className="card-origin">{dish.origin}</div>
        <h2 className="card-name">{dish.name}</h2>
        <div className="card-ar" dir="rtl" lang="ar">
          {dish.nameAr}
        </div>
        <p className="card-blurb">{dish.blurb}</p>
        <div className="tags">
          <span className="tag">{where}</span>
          {moods.map((m) => (
            <span key={m.value} className="tag">
              {m.emoji} {m.label}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
