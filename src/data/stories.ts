import type { Localized, Motif } from "./projects";

export type StorySlide = {
  kicker: Localized;
  title: Localized;
  glow: [string, string];
  motif: Motif;
  image: string;
};

export type Story = {
  id: string;
  cover: string;
  label: Localized;
  slides: StorySlide[];
};

export const stories: Story[] = [
  {
    id: "kora-drop",
    cover: "/placeholders/stories/kora-drop.jpg",
    label: { ru: "Kora", en: "Kora" },
    slides: [
      {
        kicker: { ru: "сейчас", en: "now" },
        title: { ru: "Выход гарнитуры Kora", en: "Kora specimen drop" },
        glow: ["#ff5c3a", "#3a1208"],
        motif: "bezier",
        image: "/placeholders/stories/kora-drop.jpg",
      },
      {
        kicker: { ru: "pdf", en: "pdf" },
        title: { ru: "12 полос, мокрый край", en: "12 pages, wet edge" },
        glow: ["#ff8a5c", "#2a0c08"],
        motif: "fold",
        image: "/placeholders/stories/kora-drop-2.jpg",
      },
    ],
  },
  {
    id: "yerevan",
    cover: "/placeholders/stories/yerevan.jpg",
    label: { ru: "Ереван", en: "Yerevan" },
    slides: [
      {
        kicker: { ru: "лекция", en: "talk" },
        title: { ru: "Знаки, которые не надо читать", en: "Signs you should not read" },
        glow: ["#6ec8ff", "#081525"],
        motif: "grid",
        image: "/placeholders/stories/yerevan.jpg",
      },
      {
        kicker: { ru: "гости", en: "guests" },
        title: { ru: "NPAK, короткий вечер", en: "NPAK, a short evening" },
        glow: ["#9b7bff", "#14082a"],
        motif: "iris",
        image: "/placeholders/stories/yerevan-2.jpg",
      },
    ],
  },
  {
    id: "afterimage",
    cover: "/placeholders/stories/afterimage.jpg",
    label: { ru: "Afterimage", en: "Afterimage" },
    slides: [
      {
        kicker: { ru: "день 2", en: "day 2" },
        title: { ru: "Знак уже потерял заливку", en: "The mark already lost its fill" },
        glow: ["#ff4fa3", "#2a0518"],
        motif: "spark",
        image: "/placeholders/stories/afterimage.jpg",
      },
      {
        kicker: { ru: "день 3", en: "day 3" },
        title: { ru: "Остаётся контур зала", en: "Only the hall outline remains" },
        glow: ["#ff7ad4", "#1a0410"],
        motif: "wave",
        image: "/placeholders/stories/afterimage-2.jpg",
      },
    ],
  },
  {
    id: "studio",
    cover: "/placeholders/stories/studio.jpg",
    label: { ru: "Студия", en: "Studio" },
    slides: [
      {
        kicker: { ru: "открыто", en: "open" },
        title: { ru: "Четверг, 18–21, без записи", en: "Thursday 18–21, no booking" },
        glow: ["#3dffc5", "#06241c"],
        motif: "orbit",
        image: "/placeholders/stories/studio.jpg",
      },
    ],
  },
  {
    id: "noclip",
    cover: "/placeholders/covers/noclip.jpg",
    label: { ru: "Noclip", en: "Noclip" },
    slides: [
      {
        kicker: { ru: "зал", en: "hall" },
        title: { ru: "ОС, которая живёт в пространстве", en: "An OS that lives in the room" },
        glow: ["#6ec8ff", "#081525"],
        motif: "grid",
        image: "/placeholders/covers/noclip.jpg",
      },
    ],
  },
  {
    id: "sieve",
    cover: "/placeholders/covers/sieve.jpg",
    label: { ru: "Sieve", en: "Sieve" },
    slides: [
      {
        kicker: { ru: "протокол", en: "protocol" },
        title: { ru: "Знаки для задержки и шума", en: "Signs for delay and noise" },
        glow: ["#d4ff3f", "#1a2204"],
        motif: "binary",
        image: "/placeholders/covers/sieve.jpg",
      },
    ],
  },
];
