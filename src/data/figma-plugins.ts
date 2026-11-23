import type { Bi } from "./dombro";

export interface FigmaPlugin {
  id: string;
  name: string;
  caption: Bi;
  description: Bi;
  features: Bi;
  url: string;
}

const community = (id: string, slug: string) => `https://www.figma.com/community/plugin/${id}/${slug}`;

// My plugins in Figma Community.
export const figmaPlugins: FigmaPlugin[] = [
  {
    id: "printplix",
    name: "Printplix",
    caption: { ru: "Экспорт в CMYK, TIFF и PDF, цветовые профили", en: "CMYK, TIFF, and PDF export, color profiles" },
    description: {
      ru: "Готовит макеты к печати прямо в Figma: переводит цвета в CMYK, генерирует развёртки коробок и проверяет файл на ошибки препресса.",
      en: "Prepares print-ready files right in Figma: converts colors to CMYK, generates box dielines, and runs preflight checks.",
    },
    features: {
      ru: "Поддержка профилей FOGRA39 и US Web Coated, контроль вылетов под обрез, проверка растра на 300 DPI и экспорт векторных штампов.",
      en: "Supports FOGRA39 and US Web Coated profiles, checks bleeds, audits raster assets for 300 DPI, and exports vector die-cut paths.",
    },
    url: community("1571945796791441342", "printplix-cmyk-export-packaging-dielines-preflight-check"),
  },
  {
    id: "deckplix",
    name: "Deckplix",
    caption: { ru: "Сборка презентаций и слайдов", en: "Presentation and slide deck builder" },
    description: {
      ru: "Автоматизирует сборку колод: генерирует слайды нужного формата, подставляет контентные сетки и держит единый стиль презентации.",
      en: "Automates deck assembly: generates standardized slides, inserts content grids, and keeps visual styling aligned throughout the presentation.",
    },
    features: {
      ru: "Сетки в формате 16:9 и 4:3, библиотека типовых структур слайдов, готовые автолейаут-контейнеры и быстрая смена нумерации.",
      en: "16:9 and 4:3 grid presets, library of standard slide structures, adaptive autolayout containers, and quick slide numbering.",
    },
    url: community("1583698726607655546", "deckplix"),
  },
  {
    id: "fixmaster",
    name: "Fixmaster",
    caption: { ru: "Аудит и пакетная чистка макетов", en: "Layout audit and batch cleanup" },
    description: {
      ru: "Проверяет макеты перед передачей в разработку: находит дефекты верстки, удаляет технический мусор и нормализует слои.",
      en: "Audits layouts before developer handoff: detects layout flaws, purges technical clutter, and normalizes layer structure.",
    },
    features: {
      ru: "Поиск оторванных стилей и скрытых слоев, удаление пустых фреймов, сброс дробных координат и валидация отступов в автолейаутах.",
      en: "Detects detached styles and hidden layers, removes empty frames, rounds subpixel coordinates, and validates autolayout paddings.",
    },
    url: community("1639529711723577723", "fixmaster"),
  },
  {
    id: "pixelpress",
    name: "Pixelpress",
    caption: { ru: "Пакетное сжатие изображений", en: "Batch image compression" },
    description: {
      ru: "Сжимает растровые изображения прямо на холсте без выгрузки во внешние сервисы и потери привязок к компонентам.",
      en: "Compresses raster images directly on the canvas without third-party services or breaking component overrides.",
    },
    features: {
      ru: "Оптимизация PNG и JPEG, настройка степени сжатия, пакетная обработка выделенных слоев и уменьшение нагрузки на оперативную память Figma.",
      en: "PNG and JPEG optimization, customizable compression levels, batch processing of selected layers, and reduced memory pressure in Figma.",
    },
    url: community("1682411010074444640", "pixelpress"),
  },
];
