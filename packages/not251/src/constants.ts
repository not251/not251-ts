export type Note = {
  semitone: number;
  cents: number;
};

export type Language = "en" | "it" | "semitone";

export type NoteNames = {
  [key in Language]: string;
};

export type AlteredNoteName = {
  name: string;
  base?: NoteNames;
  alterations?: string;
  cents?: string;
};

/**
 * First two are 50 cents, second two are 25 cents, third two are for cents > 0 and centrs < 0, last is symbol for "cents"
 */
export const AlterationSymbols = {
  sharp: "♯",
  flat: "♭",
  halfsharp: "𝄲",
  halfflat: "𝄳",
  positive: "↑",
  negative: "↓",
  cents: "¢",
};

export const NoteNames: NoteNames[] = [
  {
    en: "C",
    it: "Do",
    semitone: "0",
  },
  {
    en: "D",
    it: "Re",
    semitone: "2",
  },
  {
    en: "E",
    it: "Mi",
    semitone: "4",
  },
  {
    en: "F",
    it: "Fa",
    semitone: "5",
  },
  {
    en: "G",
    it: "Sol",
    semitone: "7",
  },
  {
    en: "A",
    it: "La",
    semitone: "9",
  },
  {
    en: "B",
    it: "Si",
    semitone: "11",
  },
];
