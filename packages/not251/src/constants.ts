export type Language = "en" | "it";

export type NoteName = {
  [key in Language]: string;
};

export const NoteNames: NoteName[] = [
  {
    en: "C",
    it: "Do",
  },
  {
    en: "D",
    it: "Re",
  },
  {
    en: "E",
    it: "Mi",
  },
  {
    en: "F",
    it: "Fa",
  },
  {
    en: "G",
    it: "Sol",
  },
  {
    en: "A",
    it: "La",
  },
  {
    en: "B",
    it: "Si",
  },
];
