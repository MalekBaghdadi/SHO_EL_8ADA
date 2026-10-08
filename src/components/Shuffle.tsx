import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Dish } from "../types";
import DishImage from "./DishImage";

/** Slot-machine style flicker through candidates that slows down and lands on `winner`. */
export default function Shuffle({ pool, winner, onDone }: { pool: Dish[]; winner: Dish; onDone: () => void }) {
  const [current, setCurrent] = useState(pool[0] ?? winner);
  const [landed, setLanded] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let t = 0;
    const steps = reduce ? 0 : 16;
    for (let i = 0; i < steps; i++) {
      t += 55 + i * i * 1.6; // eases out
      const d = pool[(i + 1) % pool.length];
      timers.push(window.setTimeout(() => setCurrent(d), t));
    }
    timers.push(window.setTimeout(() => { setCurrent(winner); setLanded(true); }, t + 160));
    timers.push(window.setTimeout(() => doneRef.current(), t + 1000));
    return () => timers.forEach(clearTimeout);
  }, [pool, winner]);

  return (
    <motion.div className="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="assertive">
      <div>
        <motion.div className="shuffle-card" animate={landed ? { scale: [1, 1.07, 1], rotate: [0, -2, 0] } : {}} transition={{ duration: 0.45 }}>
          <DishImage key={current.id} dish={current} eager />
          <div className="shuffle-name">{current.name}</div>
        </motion.div>
        <div className="shuffle-label">{landed ? "Yalla! 🎉" : "Sho el 8ada…?"}</div>
      </div>
    </motion.div>
  );
}
