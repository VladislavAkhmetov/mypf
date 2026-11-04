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
      ru: "Комплексная предпечатная подготовка макетов: автоматический расчёт припусков под обрез (BleedBox, TrimBox), калиброванная CMYK-конвертация по профилям ISO 12647 (FOGRA39, SWOP, GRACoL), аудит эффективного DPI растра и генерация плашечных каналов для ножей вырубки и биговки.",
      en: "Full-cycle print prepress inside Figma: automated bleed margin setup (BleedBox, TrimBox), ISO 12647 CMYK color conversion (FOGRA39, SWOP, GRACoL), effective DPI asset auditing, and spot color channels for cutting and creasing dielines.",
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
      ru: "Бортевой мёд, прополис и дикорастущие травы. Интерактивная витрина с тонкой микрофизикой и живым ритмом природы.",
      en: "Wild-hive honey, propolis, and medicinal herbs. An interactive showcase blending organic rhythm with modern craft.",
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
      ru: "Браузер и главная страница для тех, у кого открыто слишком много вкладок. Без красных счётчиков, бесконечных лент и штрафов за перенос дел.",
      en: "A browser and a home screen for people with too many tabs open. No red badges, no endless feeds, no penalties for rescheduling.",
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
      ru: "Дизайнеры делали карточки товаров для ритейлера электроники и делили артикулы в общем чате. Теперь артикул закрепляется за человеком одним нажатием, а этап виден всей команде.",
      en: "Designers made product cards for an electronics retailer and split the articles in a group chat. Now an article is claimed with one tap and its stage is visible to the whole team.",
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
      ru: "Приложение для изучения иностранного языка. У персонажа свои дела: он зовёт в гости, теряет мяч, хочет есть, а помочь ему можно на языке, который вы учите.",
      en: "An app for learning a foreign language. A character has plans of its own: it invites you over, loses a ball, gets hungry, and you help it in the language you are learning.",
    },
    tags: {
      ru: ["персонажи", "мобильное", "продукт"],
      en: ["characters", "mobile", "product"],
    },
    href: "https://t.me/vladakhmetov",
    linkLabel: { ru: "Узнать о выходе", en: "Get notified" },
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
