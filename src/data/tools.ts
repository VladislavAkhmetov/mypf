export type ToolPlatform = "figma" | "illustrator" | "web" | "template";

export interface ToolItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  platform: ToolPlatform;
  platformLabel: string;
  version: string;
  updatedAt: string;
  isNew?: boolean;
  isUpdated?: boolean;
  problem: string;
  solution: string;
  highlights: string[];
  primaryAction: {
    label: string;
    url?: string;
    isDownload?: boolean;
    downloadFilename?: string;
  };
  caseStudySlug?: string;
  instructions: string[];
  compatibility: string;
}

export const toolsList: ToolItem[] = [
  {
    id: "figma-auto-kern",
    slug: "auto-bezier-kern",
    title: "Auto-Bézier Kern",
    tagline: "Оптическая компенсация и кернинг кириллических пар в текстовых слоях",
    platform: "figma",
    platformLabel: "Figma • Плагин",
    version: "v1.3.0",
    updatedAt: "2026-09-08",
    isNew: true,
    problem:
      "При работе с нестандартными и архивными шрифтами кириллические диграфы (УА, ГД, ТЬ, Ъ) часто распадаются или слипаются, требуя сотен ручных правок в макетах.",
    solution:
      "Плагин анализирует контуры глифов через векторный bounding box, рассчитывает оптический баланс белого поля и автоматически проставляет letter-spacing для проблемных пар.",
    highlights: [
      "Автоматическое сканирование текстовых фреймов любого уровня вложенности",
      "Словарь 140+ сложных кириллических диграфов и акцидентных сочетаний",
      "Недеструктивное применение: сохраняет оригинальные стили текста",
    ],
    primaryAction: {
      label: "Открыть в Figma Community",
      url: "https://www.figma.com/community",
    },
    caseStudySlug: "kora",
    instructions: [
      "Выделите текстовый слой или фрейм с версткой в Figma.",
      "Запустите плагин через меню Plugins → Auto-Bézier Kern.",
      "Выберите профиль компенсации (Дисплейный / Текстовый) и нажмите «Apply Optical Kern».",
    ],
    compatibility: "Figma Desktop / Browser (все версии с API Manifest v2)",
  },
  {
    id: "ai-vector-slicer",
    slug: "vector-slicer",
    title: "Vector Slicer JSX",
    tagline: "Пакетная нарезка кривых по направляющим для плоттера и печати",
    platform: "illustrator",
    platformLabel: "Illustrator • Скрипт",
    version: "v2.1.0",
    updatedAt: "2026-08-24",
    isUpdated: true,
    problem:
      "Подготовка многослойных физических носителей требует разрезания сотен векторных контуров строго по сетке направляющих без появления мусорных опорных точек.",
    solution:
      "JSX-скрипт делит кривые Безье математически точно по координатам активных Guides с сохранением радиусов скруглений и созданием замкнутых технологических контуров.",
    highlights: [
      "Резка кривых любого порядка точно по пересечению с Guides",
      "Автоматическое замыкание контуров для плоттерной резки и лазера",
      "Нулевой прирост паразитных опорных точек на криволинейных сегментах",
    ],
    primaryAction: {
      label: "Скачать скрипт (.jsx)",
      isDownload: true,
      downloadFilename: "vector-slicer-v2.jsx",
      url: "https://t.me/amazi",
    },
    caseStudySlug: "dockyard",
    instructions: [
      "Поместите файл vector-slicer-v2.jsx в папку Illustrator/Presets/Scripts.",
      "Расставьте линейки (Guides) в местах необходимого разреза контуров.",
      "Выделите нужные объекты и выберите File → Scripts → vector-slicer-v2.",
    ],
    compatibility: "Adobe Illustrator CC 2022–2026 (macOS & Windows)",
  },
  {
    id: "oklch-harmonizer",
    slug: "palette-harmonizer",
    title: "Oklch Palette Harmonizer",
    tagline: "Перцептивно равномерные шкалы контраста и дизайн-токены",
    platform: "web",
    platformLabel: "Веб-инструмент",
    version: "v1.0.4",
    updatedAt: "2026-08-10",
    problem:
      "Стандартные цветовые пространства sRGB и HSL искажают субъективную яркость при масштабировании, ломая доступность интерфейса (WCAG APCA).",
    solution:
      "Генератор строит 11-ступенчатые градации яркости с постоянным перцептивным шагом в цветовом пространстве Oklch и мгновенно экспортирует CSS Variables и Tailwind Tokens.",
    highlights: [
      "Математическая модель Oklch с сохранением константной яркости (Lightness)",
      "Проверка контраста по алгоритмам WCAG 2.1 AA/AAA и APCA Silver",
      "Экспорт в один клик в формат CSS Custom Properties и Tailwind v4 config",
    ],
    primaryAction: {
      label: "Открыть инструмент",
      url: "https://t.me/amazi",
    },
    instructions: [
      "Задайте базовый бренд-цвет в формате HEX или Oklch.",
      "Настройте интервал контраста между ступенями (50–950).",
      "Скопируйте сгенерированные токены в буфер обмена.",
    ],
    compatibility: "Работает в любом современном браузере с поддержкой CSS Color Level 4",
  },
  {
    id: "specimen-blueprint",
    slug: "specimen-blueprint",
    title: "Type Specimen Blueprint",
    tagline: "Модульная сетка для верстки шрифтовых каталогов и тест-драйва",
    platform: "template",
    platformLabel: "Figma • Шаблон",
    version: "v1.1.0",
    updatedAt: "2026-07-15",
    problem:
      "Дизайнерам шрифта приходится собирать десятки страниц тест-драйва (каскад кеглей, проверка диакритики, акциденция) с нуля для каждого релиза.",
    solution:
      "Выверенная система автолейаутов по швейцарской сетке 12 колонок с готовыми фреймами для тестирования всех подмножеств Unicode и проверки кернинга.",
    highlights: [
      "Полный охват латиницы, расширенной кириллицы и акцидентных лигатур",
      "Готовые таблицы сравнения весов и оптических размеров (Optical Size)",
      "Автоматическая подстановка названий через Figma Variables",
    ],
    primaryAction: {
      label: "Получить в Figma Community",
      url: "https://www.figma.com/community",
    },
    caseStudySlug: "kora",
    instructions: [
      "Дублируйте файл проекта в свои черновики Figma.",
      "Привяжите тестируемый шрифт к локальным текстовым стилям.",
      "Экспортируйте готовый PDF-спекмен для клиентов или портфолио.",
    ],
    compatibility: "Figma (Community File)",
  },
];
