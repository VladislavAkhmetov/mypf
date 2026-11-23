export type Motif =
  | "bezier"
  | "binary"
  | "grid"
  | "bars"
  | "iris"
  | "orbit"
  | "fold"
  | "wave"
  | "lock"
  | "atlas"
  | "pulp"
  | "spark"
  | "honeycomb";

export type Localized = { ru: string; en: string };

export type Project = {
  slug: string;
  year: number;
  span: string;
  cover: string;
  /** Wide image for the top of the case page (the card keeps `cover`). */
  heroImage?: string;
  video?: string;
  glow: [string, string];
  motif: Motif;
  title: string;
  kicker: Localized;
  body: Localized;
  tags: { ru: string[]; en: string[] };
  href?: string;
  linkLabel?: Localized;
};

function cover(slug: string) {
  return `/placeholders/covers/${slug}.jpg`;
}

export const projects: Project[] = [
  {
    slug: "printforge",
    year: 2026,
    span: "col-span-6 row-span-2 md:col-span-4",
    cover: cover("printforge"),
    video: "/placeholders/covers/printforge.webm",
    glow: ["#0d99ff", "#e11d48"],
    motif: "fold",
    title: "PrintForge",
    kicker: {
      ru: "Prepress-плагин и облачный пайплайн для полиграфии в Figma",
      en: "Figma prepress plugin & cloud CMYK pipeline",
    },
    body: {
      ru: "Prepress-плагин и пайплайн подготовки макетов к печати в Figma: расчёт припусков, CMYK-конвертация и генерация плашечных каналов. Моя роль — продукт, дизайн и разработка.",
      en: "Prepress Figma plugin and print prep pipeline: automated bleed margins, CMYK conversion, and spot dieline generation. My role: product, design, and development.",
    },
    tags: {
      ru: ["figma-плагин", "prepress", "cmyk", "упаковка", "software"],
      en: ["figma plugin", "prepress", "cmyk", "packaging", "software"],
    },
    href: "http://localhost:3005",
    linkLabel: { ru: "Локальный запуск", en: "Local Preview" },
  },
  {
    slug: "altyn-solok",
    year: 2026,
    span: "col-span-6 row-span-2 md:col-span-4",
    cover: cover("altyn-solok"),
    video: "/placeholders/covers/altyn-solok.webm",
    glow: ["#f59e0b", "#1c382b"],
    motif: "honeycomb",
    title: "Алтын Солок",
    kicker: {
      ru: "Витрина апифитопродукции Башкортостана",
      en: "Bashkir apiphytotherapy digital showcase",
    },
    body: {
      ru: "Алтын Солок — инновационная компания Республики Башкортостан, создающая натуральную продукцию на основе бортевого мёда, дикорастущих трав и прополиса. Моя роль — дизайн и фронтенд.",
      en: "Altyn Solok is an innovative company from the Republic of Bashkortostan crafting natural products from wild-hive honey, wild herbs, and propolis. My role: design and frontend.",
    },
    tags: {
      ru: ["веб-витрина", "айдентика", "e-commerce"],
      en: ["web showcase", "identity", "e-commerce"],
    },
    href: "https://altyn-solok-demo.website.yandexcloud.net/",
    linkLabel: { ru: "Смотреть сайт", en: "Live Site" },
  },
  {
    slug: "dombro",
    year: 2026,
    span: "col-span-6 row-span-2 md:col-span-4",
    cover: cover("dombro"),
    heroImage: "/images/dombro-case/hero.webp",
    glow: ["#ffb36b", "#2a4a3a"],
    motif: "spark",
    title: "dombro",
    kicker: {
      ru: "Браузер и спокойный дашборд для Windows 11",
      en: "A browser and a calm dashboard for Windows 11",
    },
    body: {
      ru: "Браузер и главная страница для тех, у кого открыто слишком много вкладок. Без красных счётчиков, бесконечных лент и штрафов за перенос дел. Моя роль — продукт, дизайн и разработка.",
      en: "A browser and calm home screen for people with too many tabs open. No red badges, no endless feeds. My role: product, design, and development.",
    },
    tags: {
      ru: ["продукт", "интерфейс", "десктоп"],
      en: ["product", "interface", "desktop"],
    },
    href: "https://github.com/VladislavAkhmetov/dombro-releases/releases/latest",
    linkLabel: { ru: "Скачать для Windows", en: "Download for Windows" },
  },
  {
    slug: "tasker",
    year: 2026,
    span: "col-span-6 md:col-span-4",
    cover: cover("tasker"),
    heroImage: "/images/tasker-case/hero.webp",
    glow: ["#c8ee94", "#0a0b0d"],
    motif: "grid",
    title: "Таскер",
    kicker: {
      ru: "Telegram-приложение для студии карточек товаров",
      en: "A Telegram app for a product-card studio",
    },
    body: {
      ru: "Telegram-приложение для распределения карточек товаров между дизайнерами студии в один клик. Артикул закрепляется за человеком, этап виден всей команде. Моя роль — продукт, дизайн и разработка.",
      en: "A Telegram mini-app for one-tap product card task dispatch across studio designers. Claimed in one tap, visible to the whole team. My role: product, design, and development.",
    },
    tags: {
      ru: ["интерфейс", "telegram", "продукт"],
      en: ["interface", "telegram", "product"],
    },
  },
  {
    slug: "kroomi",
    year: 2026,
    span: "col-span-6 md:col-span-4",
    cover: cover("kroomi"),
    heroImage: "/images/kroomi-case/hero.webp",
    glow: ["#a35bff", "#17112b"],
    motif: "spark",
    title: "kroomi",
    kicker: {
      ru: "Приложение, где язык нужен, чтобы помочь персонажу",
      en: "An app where a language is how you help a character",
    },
    body: {
      ru: "Приложение для изучения иностранных языков через заботу о живом интерактивном персонаже. Моя роль — продукт, дизайн и разработка.",
      en: "A language learning app built around caring for a living interactive character. My role: product, design, and development.",
    },
    tags: {
      ru: ["персонажи", "мобильное", "продукт"],
      en: ["characters", "mobile", "product"],
    },
    href: "https://t.me/vladakhmetov",
    linkLabel: { ru: "Лендинг kroomi", en: "kroomi landing page" },
  },
];

const catalogExcluded = new Set(["printforge"]);

export const catalogProjects = projects.filter(project => !catalogExcluded.has(project.slug));

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string) {
  const i = catalogProjects.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: catalogProjects[0] ?? null };
  return {
    prev: catalogProjects[(i - 1 + catalogProjects.length) % catalogProjects.length],
    next: catalogProjects[(i + 1) % catalogProjects.length],
  };
}
