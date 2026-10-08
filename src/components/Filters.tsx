import { useState } from "react";
import type { Filters, Mood, Protein } from "../types";
import { EMPTY_FILTERS } from "../types";
import { MEALS, MOODS, PROTEINS, SOURCES } from "../lib/labels";
import { activeFilterCount } from "../lib/engine";
import Sheet from "./Sheet";

type Group = "meal" | "protein" | "source" | "mood";

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function summary(f: Filters, g: Group): string | null {
  switch (g) {
    case "meal":
      return f.meal ? MEALS.find((m) => m.value === f.meal)!.label : null;
    case "source":
      return f.source ? (f.source === "home" ? "Home-cooked" : "Order out") : null;
    case "protein":
      if (!f.protein.length) return null;
      return PROTEINS.find((p) => p.value === f.protein[0])!.label.split(" ")[0] + (f.protein.length > 1 ? ` +${f.protein.length - 1}` : "");
    case "mood":
      if (!f.moods.length) return null;
      return MOODS.find((m) => m.value === f.moods[0])!.label + (f.moods.length > 1 ? ` +${f.moods.length - 1}` : "");
  }
}

const TITLES: Record<Group, string> = { meal: "Meal", protein: "Protein", source: "Where", mood: "Mood" };

export default function FilterBar({ filters, onChange, count }: { filters: Filters; onChange: (f: Filters) => void; count: number }) {
  const [open, setOpen] = useState<Group | null>(null);
  const active = activeFilterCount(filters);

  return (
    <>
      <div className="filters" role="toolbar" aria-label="Filters">
        {(["meal", "protein", "source", "mood"] as Group[]).map((g) => {
          const s = summary(filters, g);
          return (
            <button key={g} className={`chip ${s ? "on" : ""}`} onClick={() => setOpen(g)} aria-haspopup="dialog">
              {s ?? TITLES[g]}
              <span className="caret">▼</span>
            </button>
          );
        })}
        {active > 0 && (
          <button className="chip ghost" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear
          </button>
        )}
      </div>
      <div className="match-count" aria-live="polite">
        {active === 0 ? `All ${count} dishes in the mix` : count === 1 ? "1 dish fits" : `${count} dishes fit`}
      </div>

      <Sheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? TITLES[open] : ""}
        footer={
          <>
            <button
              className="btn"
              onClick={() => {
                clearGroup(open!, filters, onChange);
                setOpen(null);
              }}
            >
              Any
            </button>
            <button className="btn primary" onClick={() => setOpen(null)}>
              {count === 0 ? "No matches" : `Show ${count}`}
            </button>
          </>
        }
      >
        {open === "meal" && (
          <div className="option-grid">
            {MEALS.map((m) => (
              <Option
                key={m.value}
                on={filters.meal === m.value}
                emoji={m.emoji}
                label={m.label}
                sub={m.hint}
                onClick={() => {
                  onChange({ ...filters, meal: filters.meal === m.value ? null : m.value });
                  setOpen(null);
                }}
              />
            ))}
          </div>
        )}
        {open === "source" && (
          <div className="option-grid">
            {SOURCES.map((s) => (
              <Option
                key={s.value}
                on={filters.source === s.value}
                emoji={s.emoji}
                label={s.label}
                sub={s.hint}
                onClick={() => {
                  onChange({ ...filters, source: filters.source === s.value ? null : s.value });
                  setOpen(null);
                }}
              />
            ))}
          </div>
        )}
        {open === "protein" && (
          <>
            <div className="option-grid">
              {PROTEINS.map((p) => (
                <Option
                  key={p.value}
                  on={filters.protein.includes(p.value)}
                  emoji={p.emoji}
                  label={p.label}
                  onClick={() => onChange({ ...filters, protein: toggle<Protein>(filters.protein, p.value) })}
                />
              ))}
            </div>
            <p className="sheet-note">Pick everything you're up for. Nothing picked means anything goes.</p>
          </>
        )}
        {open === "mood" && (
          <>
            <div className="option-grid">
              {MOODS.map((m) => (
                <Option
                  key={m.value}
                  on={filters.moods.includes(m.value)}
                  emoji={m.emoji}
                  label={m.label}
                  onClick={() => onChange({ ...filters, moods: toggle<Mood>(filters.moods, m.value) })}
                />
              ))}
            </div>
            <p className="sheet-note">Dishes matching more of your moods show up first.</p>
          </>
        )}
      </Sheet>
    </>
  );
}

function clearGroup(g: Group, f: Filters, onChange: (f: Filters) => void) {
  if (g === "meal") onChange({ ...f, meal: null });
  if (g === "source") onChange({ ...f, source: null });
  if (g === "protein") onChange({ ...f, protein: [] });
  if (g === "mood") onChange({ ...f, moods: [] });
}

function Option({ on, emoji, label, sub, onClick }: { on: boolean; emoji: string; label: string; sub?: string; onClick: () => void }) {
  return (
    <button className={`option ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
      <span className="emo">{emoji}</span>
      <span className="lbl">{label}</span>
      {sub && <span className="sub">{sub}</span>}
    </button>
  );
}
