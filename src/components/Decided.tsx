import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Dish } from "../types";
import { photoCredit } from "../lib/photos";
import DishImage from "./DishImage";
import { BookIcon, HeartIcon, PinIcon, ShareIcon, XIcon } from "./Icons";

interface Props {
  dish: Dish;
  celebrate: boolean;
  fav: boolean;
  onToggleFav: () => void;
  onClose: () => void;
  onAgain?: () => void;
}

const KICKERS = ["Yalla, decided!", "Khalas, that's lunch.", "Sa7tein in advance!", "Done. No more arguing."];
const CONFETTI = ["🎉", "✨", "🥳", "🧡", "🍋", "🌿"];

export default function Decided({ dish, celebrate, fav, onToggleFav, onClose, onAgain }: Props) {
  const credit = photoCredit(dish.id);
  const [kicker] = useState(() => (celebrate ? KICKERS[Math.floor(Math.random() * KICKERS.length)] : dish.origin));
  const [copied, setCopied] = useState(false);
  const cookFirst = dish.source[0] === "home";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = encodeURIComponent(dish.name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const recipeUrl = `https://www.google.com/search?q=${q}+recipe`;

  const share = async () => {
    const text = `Sho el 8ada? ${dish.name} 🍽️ (${dish.nameAr})`;
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) await navigator.share({ title: "Sho El 8ada", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  };

  const nearby = (
    <a className={`btn ${cookFirst ? "" : "primary"}`} href={mapsUrl} target="_blank" rel="noreferrer">
      <PinIcon /> Find nearby
    </a>
  );
  const recipe = (
    <a className={`btn ${cookFirst ? "primary" : ""}`} href={recipeUrl} target="_blank" rel="noreferrer">
      <BookIcon /> Recipe
    </a>
  );

  return (
    <motion.div
      className="decided"
      role="dialog"
      aria-modal="true"
      aria-label={dish.name}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {celebrate && <Confetti />}
      <div className="decided-inner">
        <div className="decided-hero">
          <DishImage key={dish.id} dish={dish} eager />
          <button className="close-x" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
          <button className={`fav-btn ${fav ? "on" : ""}`} onClick={onToggleFav} aria-label={fav ? "Remove from favorites" : "Add to favorites"} aria-pressed={fav}>
            <HeartIcon filled={fav} />
          </button>
        </div>

        <div className="decided-kicker">{kicker}</div>
        <h1>{dish.name}</h1>
        <div className="ar" dir="rtl" lang="ar">
          {dish.nameAr}
        </div>
        <p className="blurb">{dish.blurb}</p>

        <div className="decided-actions">
          {cookFirst ? recipe : nearby}
          {cookFirst ? nearby : recipe}
          <button className="btn" onClick={share}>
            <ShareIcon /> {copied ? "Copied!" : "Share"}
          </button>
          <button className="btn" onClick={onAgain ?? onClose}>
            {onAgain ? "Nah, pick again" : "Back"}
          </button>
        </div>

        {credit && (
          <p className="credit">
            Photo: {credit.author} ·{" "}
            <a href={credit.source} target="_blank" rel="noreferrer">
              source
            </a>{" "}
            ·{" "}
            {credit.licenseUrl ? (
              <a href={credit.licenseUrl} target="_blank" rel="noreferrer">
                {credit.license}
              </a>
            ) : (
              credit.license
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function Confetti() {
  const [bits] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      e: CONFETTI[i % CONFETTI.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.6 + Math.random() * 1.2,
      rot: (Math.random() - 0.5) * 540,
    })),
  );
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          style={{ left: `${b.left}%` }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: "105vh", rotate: b.rot, opacity: [1, 1, 0] }}
          transition={{ duration: b.dur, delay: b.delay, ease: "easeIn" }}
        >
          {b.e}
        </motion.span>
      ))}
    </div>
  );
}
