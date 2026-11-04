import type { Bi } from "./dombro";

export interface FigmaPlugin {
  id: string;
  name: string;
  caption: Bi;
  pain: Bi;
  solution: Bi;
  url: string;
}

const community = (id: string, slug: string) => `https://www.figma.com/community/plugin/${id}/${slug}`;

// My plugins in Figma Community.
export const figmaPlugins: FigmaPlugin[] = [
  {
    id: "printplix",
    name: "Printplix",
    caption: { ru: "CMYK-экспорт, дилайны упаковки и префлайт", en: "CMYK export, packaging dielines and preflight" },
    pain: {
      ru: "Макет в Figma живёт в RGB, а типография ждёт CMYK, дилайны и чистые файлы. Подготовка к печати превращается в ручную рутину и правки после отказа препресса.",
      en: "A Figma layout lives in RGB, while the print shop expects CMYK, dielines and clean files. Print prep turns into manual routine and fixes after prepress rejects the file.",
    },
    solution: {
      ru: "Конвертирует цвета в CMYK, помогает собрать дилайны упаковки и проверяет макет перед отправкой в печать.",
      en: "Converts colours to CMYK, helps build packaging dielines and checks the layout before it goes to print.",
    },
    url: community("1571945796791441342", "printplix-cmyk-export-packaging-dielines-preflight-check"),
  },
  {
    id: "deckplix",
    name: "Deckplix",
    caption: { ru: "Презентации в Figma без рутины", en: "Figma presentations without the routine" },
    pain: {
      ru: "Презентации в Figma собираются вручную: одинаковые слайды, выравнивание, бесконечное копирование блоков.",
      en: "Presentations in Figma are assembled by hand: identical slides, alignment, endless copying of blocks.",
    },
    solution: {
      ru: "Плагин берёт сборку слайдов на себя, чтобы вы занимались идеей и подачей, а не рутиной.",
      en: "The plugin takes over slide assembly, so you can focus on the idea and the delivery instead of routine.",
    },
    url: community("1583698726607655546", "deckplix"),
  },
  {
    id: "fixmaster",
    name: "Fixmaster",
    caption: { ru: "Быстрые правки макетов в один клик", en: "One-click layout fixes" },
    pain: {
      ru: "Перед передачей макета всегда находятся мелкие огрехи: съехавшие отступы, лишние слои, несогласованные стили. Искать их глазами долго.",
      en: "Before handoff there are always small flaws: shifted spacing, stray layers, inconsistent styles. Finding them by eye takes ages.",
    },
    solution: {
      ru: "Находит типовые проблемы и исправляет их быстро, без ручного обхода каждого фрейма.",
      en: "Finds common problems and fixes them fast, without going through every frame by hand.",
    },
    url: community("1639529711723577723", "fixmaster"),
  },
  {
    id: "pixelpress",
    name: "Pixelpress",
    caption: { ru: "Лёгкие изображения для макетов и экспорта", en: "Lightweight images for layouts and export" },
    pain: {
      ru: "Тяжёлые изображения раздувают файлы и замедляют экспорт, а оптимизировать их приходится вне Figma.",
      en: "Heavy images bloat files and slow down export, and you have to optimise them outside Figma.",
    },
    solution: {
      ru: "Сжимает изображения прямо в Figma, сохраняя качество, и ускоряет работу с макетом и экспорт.",
      en: "Compresses images right in Figma without losing quality, and speeds up working with the layout and exporting it.",
    },
    url: community("1682411010074444640", "pixelpress"),
  },
];
