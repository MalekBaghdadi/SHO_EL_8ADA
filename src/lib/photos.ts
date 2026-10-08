import credits from "../data/photos.json";

export interface Credit {
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

const table = credits as Record<string, Credit>;

export const photoCredit = (id: string): Credit | undefined => table[id];

export const photoUrl = (id: string): string | null =>
  table[id] ? `${import.meta.env.BASE_URL}photos/${id}.webp` : null;

export const allCredits = () => Object.entries(table);
