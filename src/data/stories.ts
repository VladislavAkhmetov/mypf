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
    id: "dombro-release",
    cover: "/placeholders/covers/dombro.jpg",
    label: { ru: "dombro", en: "dombro" },
    slides: [
      {
        kicker: { ru: "сейчас", en: "now" },
        title: { ru: "Выход dombro для Windows 11", en: "dombro for Windows 11 is out" },
        glow: ["#ffb36b", "#2a4a3a"],
        motif: "spark",
        image: "/placeholders/covers/dombro.jpg",
      },
      {
        kicker: { ru: "portable", en: "portable" },
        title: { ru: "Один файл, без установки", en: "One file, no installer" },
        glow: ["#8fd3a6", "#10261d"],
        motif: "wave",
        image: "/images/dombro-case/dock.webp",
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
];
