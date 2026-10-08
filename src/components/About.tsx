import { dishById, dishes } from "../data/dishes";
import { allCredits } from "../lib/photos";
import Sheet from "./Sheet";

export default function About({ open, onClose, onResetTaste }: { open: boolean; onClose: () => void; onResetTaste: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Sho el 8ada?">
      <div className="about">
        <p>
          The daily question, answered. Set a few filters if you want, then swipe: <b>right</b> if it sounds good, <b>left</b> to skip. Or hit{" "}
          <b>Decide</b> and let the app choose from {dishes.length} dishes.
        </p>
        <p>
          It learns as you go. Skips and picks quietly shift what comes up next, favorites appear more often, and things you had recently take a short
          break.
        </p>
        <p>Everything stays on this device. No account, no tracking.</p>
        <p>
          <button className="text-btn" onClick={onResetTaste}>
            Reset what it learned about my taste
          </button>
        </p>

        <div className="section-label">Photo credits</div>
        <p style={{ fontSize: 13 }}>
          Photos come from Wikimedia Commons and Openverse under free licenses. Thank you to the photographers:
        </p>
        <ul className="credits-list">
          {allCredits().map(([id, c]) => (
            <li key={id}>
              {dishById.get(id)?.name}:{" "}
              <a href={c.source} target="_blank" rel="noreferrer">
                {c.author}
              </a>
              , {c.license}
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
