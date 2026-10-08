import type { Dish, Filters, HistoryEntry } from "../types";

/** Learned preferences: feature key ("mood:spicy", "protein:fish", "origin:Italian") → score. */
export type Taste = Record<string, number>;

const DAY = 24 * 60 * 60 * 1000;
const TASTE_LIMIT = 4;

export function matches(d: Dish, f: Filters): boolean {
  if (f.meal && !d.meals.includes(f.meal)) return false;
  if (f.protein.length && !d.protein.some((p) => f.protein.includes(p))) return false;
  if (f.source && !d.source.includes(f.source)) return false;
  if (f.moods.length && !d.moods.some((m) => f.moods.includes(m))) return false;
  return true;
}

export function activeFilterCount(f: Filters): number {
  return (f.meal ? 1 : 0) + f.protein.length + (f.source ? 1 : 0) + f.moods.length;
}

const features = (d: Dish) => [
  ...d.moods.map((m) => "mood:" + m),
  ...d.protein.map((p) => "protein:" + p),
  "origin:" + d.origin,
];

/** Nudge the taste profile after a swipe. Small steps so a few skips don't hide whole categories. */
export function learn(taste: Taste, d: Dish, liked: boolean): Taste {
  const next = { ...taste };
  const step = liked ? 0.35 : -0.2;
  for (const k of features(d)) {
    next[k] = Math.max(-TASTE_LIMIT, Math.min(TASTE_LIMIT, (next[k] ?? 0) + step));
  }
  return next;
}

function weight(d: Dish, f: Filters, taste: Taste, favorites: Set<string>, recent: Map<string, number>, now: number) {
  const feats = features(d);
  const t = feats.reduce((s, k) => s + (taste[k] ?? 0), 0) / feats.length;
  let w = Math.exp(t * 0.6);
  // More selected moods matched → better fit.
  if (f.moods.length) w *= 1 + 0.5 * d.moods.filter((m) => f.moods.includes(m)).length;
  if (favorites.has(d.id)) w *= 1.4;
  const last = recent.get(d.id);
  if (last !== undefined) {
    const days = (now - last) / DAY;
    if (days < 7) w *= 0.15 + 0.85 * (days / 7); // ate it recently → less likely
  }
  return w;
}

/** Weighted random order (Efraimidis–Spirakis): heavier dishes tend to come first, but nothing is fixed. */
export function buildDeck(
  dishes: Dish[],
  f: Filters,
  opts: { taste: Taste; favorites: string[]; history: HistoryEntry[]; exclude: Set<string>; now?: number },
): Dish[] {
  const now = opts.now ?? Date.now();
  const fav = new Set(opts.favorites);
  const recent = new Map<string, number>();
  for (const h of opts.history) if (!recent.has(h.id)) recent.set(h.id, h.at);
  return dishes
    .filter((d) => matches(d, f) && !opts.exclude.has(d.id))
    .map((d) => ({ d, key: Math.pow(Math.random(), 1 / weight(d, f, opts.taste, fav, recent, now)) }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.d);
}
