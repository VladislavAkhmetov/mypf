export type ChangelogType = "tool" | "project" | "document" | "system";

export interface ChangelogEntry {
  id: string;
  date: string;
  monthGroup: string;
  type: ChangelogType;
  typeLabel: string;
  title: string;
  summary: string;
  targetType: "tool" | "project" | "document" | "app";
  targetId: string;
}

export const changelogList: ChangelogEntry[] = [
  {
    id: "log-2026-09-13-solitaire",
    date: "2026-09-13",
    monthGroup: "Сентябрь 2026",
    type: "system",
    typeLabel: "Игра / Интерактив",
    title: "Релиз авторской «Косынки» (Solitaire)",
    summary:
      "Завершена авторская типографическая колода с монограммами Rex, Regina, Miles, сенсорным управлением и 60 FPS Canvas-салютом победы.",
    targetType: "app",
    targetId: "solitaire",
  },
  {
    id: "log-2026-09-08-autokern",
    date: "2026-09-08",
    monthGroup: "Сентябрь 2026",
    type: "tool",
    typeLabel: "Новый инструмент",
    title: "Плагин Auto-Bézier Kern v1.3.0 для Figma",
    summary:
      "Выпущен плагин оптической компенсации кириллических диграфов на основе анализа формы кривых Безье.",
    targetType: "tool",
    targetId: "auto-bezier-kern",
  },
  {
    id: "log-2026-08-24-vectorslicer",
    date: "2026-08-24",
    monthGroup: "Август 2026",
    type: "tool",
    typeLabel: "Обновление инструмента",
    title: "Illustrator Vector Slicer обновлен до v2.1.0",
    summary:
      "Добавлена поддержка автоматического замыкания контуров для плоттерной и лазерной резки без паразитных опорных точек.",
    targetType: "tool",
    targetId: "vector-slicer",
  },
  {
    id: "log-2026-08-10-oklch",
    date: "2026-08-10",
    monthGroup: "Август 2026",
    type: "tool",
    typeLabel: "Новый инструмент",
    title: "Калькулятор Oklch Palette Harmonizer",
    summary:
      "Инструмент построения перцептивно равномерных шкал контраста с экспортом в Tailwind v4 и CSS Variables.",
    targetType: "tool",
    targetId: "palette-harmonizer",
  },
  {
    id: "log-2026-07-28-kora",
    date: "2026-07-28",
    monthGroup: "Июль 2026",
    type: "project",
    typeLabel: "Новый кейс",
    title: "Публикация шрифтового досье Kora",
    summary:
      "Архитектура и интерактивный тестер гротеска со слоистыми краями, созданного для государственного архивного фонда.",
    targetType: "project",
    targetId: "kora",
  },
  {
    id: "log-2026-07-15-specimen",
    date: "2026-07-15",
    monthGroup: "Июль 2026",
    type: "tool",
    typeLabel: "Шаблон",
    title: "Type Specimen Blueprint для Figma",
    summary:
      "Модульная 12-колоночная сетка для верстки шрифтовых каталогов и проверки расширенной кириллицы.",
    targetType: "tool",
    targetId: "specimen-blueprint",
  },
];
