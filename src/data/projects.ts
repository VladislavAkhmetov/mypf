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
  | "spark";

export type Localized = { ru: string; en: string };

export type Project = {
  slug: string;
  year: number;
  span: string;
  cover: string;
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
    slug: "kora",
    year: 2026,
    span: "col-span-6 row-span-2 md:col-span-4",
    cover: cover("kora"),
    glow: ["#ff5c3a", "#3a1208"],
    motif: "bezier",
    title: "Kora",
    kicker: {
      ru: "Шрифт для государственного архива",
      en: "Typeface for a state archive",
    },
    body: {
      ru: "Гротеск с корой вместо засечек: края букв слоятся, как бумажный фонд. Набор для описей, ярлыков и фасада.",
      en: "A grotesque whose edges flake like paper stock. Cut for inventories, labels, and the building face.",
    },
    tags: {
      ru: ["шрифт", "носители"],
      en: ["typeface", "wayfinding"],
    },
    href: "https://t.me/amazi",
    linkLabel: { ru: "Смотреть", en: "View" },
  },
  {
    slug: "signalatlas",
    year: 2026,
    span: "col-span-6 md:col-span-4",
    cover: cover("signalatlas"),
    glow: ["#3dffc5", "#06241c"],
    motif: "atlas",
    title: "Signalatlas",
    kicker: {
      ru: "Картография радиотишины",
      en: "Cartography of radio silence",
    },
    body: {
      ru: "Карты мест, где связь рвётся. Легенда построена на помехах, а не на дорогах.",
      en: "Maps of where the signal dies. The legend is interference, not roads.",
    },
    tags: {
      ru: ["карты", "издание"],
      en: ["maps", "print"],
    },
  },
  {
    slug: "noclip",
    year: 2025,
    span: "col-span-6 md:col-span-4",
    cover: cover("noclip"),
    glow: ["#6ec8ff", "#081525"],
    motif: "grid",
    title: "Noclip",
    kicker: {
      ru: "Пространственная ОС музея",
      en: "Spatial OS for a museum",
    },
    body: {
      ru: "Интерфейс, который живёт в зале, а не в телефоне. Залы как окна, этикетки как системные вызовы.",
      en: "An interface that lives in the hall, not the phone. Rooms as windows, labels as syscalls.",
    },
    tags: {
      ru: ["product", "пространство"],
      en: ["product", "spatial"],
    },
  },
  {
    slug: "sieve",
    year: 2026,
    span: "col-span-6 md:col-span-4",
    cover: cover("sieve"),
    glow: ["#d4ff3f", "#1a2204"],
    motif: "binary",
    title: "Sieve",
    kicker: {
      ru: "Визуальный язык протокола",
      en: "Visual language for a protocol",
    },
    body: {
      ru: "Как выглядит сообщение, пока оно ещё не доставлено. Система знаков для задержки, шума и отказа.",
      en: "What a message looks like before it arrives. A sign system for delay, noise, and refusal.",
    },
    tags: {
      ru: ["система", "software"],
      en: ["system", "software"],
    },
  },
  {
    slug: "afterimage",
    year: 2025,
    span: "col-span-6 md:col-span-4",
    cover: cover("afterimage"),
    glow: ["#ff4fa3", "#2a0518"],
    motif: "spark",
    title: "Afterimage",
    kicker: {
      ru: "Айдентика, которая выцветает",
      en: "Identity that decays in three days",
    },
    body: {
      ru: "Фестиваль, чей знак каждый день теряет слой. К финалу остаётся только контур зала.",
      en: "A festival mark that sheds a layer each day. By the last night, only the hall’s outline remains.",
    },
    tags: {
      ru: ["айдентика", "движение"],
      en: ["identity", "motion"],
    },
  },
  {
    slug: "voltform",
    year: 2025,
    span: "col-span-6 md:col-span-3",
    cover: cover("voltform"),
    glow: ["#ffb23c", "#2a1400"],
    motif: "orbit",
    title: "Voltform",
    kicker: {
      ru: "Кооператив энергии",
      en: "Energy cooperative identity",
    },
    body: {
      ru: "Не логотип лампочки. Сетка напряжения как модульная система: счета, щитки, форма рабочих.",
      en: "Not a lightbulb mark. A voltage grid as a modular system: bills, cabinets, workwear.",
    },
    tags: {
      ru: ["айдентика", "носители"],
      en: ["identity", "collateral"],
    },
  },
  {
    slug: "hearth",
    year: 2024,
    span: "col-span-6 md:col-span-3",
    cover: cover("hearth"),
    glow: ["#c8a07a", "#1c120c"],
    motif: "fold",
    title: "Hearth",
    kicker: {
      ru: "Упаковка ферментационной лаборатории",
      en: "Packaging for a fermentation lab",
    },
    body: {
      ru: "Банки как приборы. Этикетка считает дни культуры, а не маркетинговые смыслы.",
      en: "Jars as instruments. The label counts culture days, not slogans.",
    },
    tags: {
      ru: ["упаковка"],
      en: ["packaging"],
    },
  },
  {
    slug: "dockyard",
    year: 2025,
    span: "col-span-6 md:col-span-3",
    cover: cover("dockyard"),
    glow: ["#4d7aff", "#0a1228"],
    motif: "bars",
    title: "Dockyard",
    kicker: {
      ru: "Дизайн-система портовой логистики",
      en: "Harbour logistics design system",
    },
    body: {
      ru: "Интерфейс для людей в перчатках. Крупные состояния, мало текста, свет как сигнал.",
      en: "An interface for people in gloves. Large states, almost no copy, light as signal.",
    },
    tags: {
      ru: ["дизайн-система"],
      en: ["design system"],
    },
  },
  {
    slug: "iris-gate",
    year: 2026,
    span: "col-span-6 md:col-span-3",
    cover: cover("iris-gate"),
    glow: ["#9b7bff", "#14082a"],
    motif: "iris",
    title: "Iris Gate",
    kicker: {
      ru: "Билеты и графика планетария",
      en: "Planetarium tickets and spatial graphics",
    },
    body: {
      ru: "Билет как диафрагма. Чем ближе сеанс, тем шире отверстие на носителе.",
      en: "The ticket is an aperture. Closer to showtime, the wider the hole in the print.",
    },
    tags: {
      ru: ["пространство", "билеты"],
      en: ["spatial", "tickets"],
    },
  },
  {
    slug: "ledgerfold",
    year: 2024,
    span: "col-span-6 md:col-span-4",
    cover: cover("ledgerfold"),
    glow: ["#ff6a4a", "#220c08"],
    motif: "pulp",
    title: "Ledgerfold",
    kicker: {
      ru: "Судебные протоколы как pulp",
      en: "Court transcripts as a pulp magazine",
    },
    body: {
      ru: "Годовой отчёт, свёрстанный как дешёвый роман. Шрифт кричит, факты остаются сухими.",
      en: "An annual report set like a cheap novel. The type shouts; the facts stay dry.",
    },
    tags: {
      ru: ["редактура", "издание"],
      en: ["editorial", "print"],
    },
  },
  {
    slug: "soft-lock",
    year: 2024,
    span: "col-span-6 md:col-span-4",
    cover: cover("soft-lock"),
    glow: ["#7ee0d6", "#061616"],
    motif: "lock",
    title: "Soft Lock",
    kicker: {
      ru: "Коммуникация слесарного коллектива",
      en: "Communication for a locksmith collective",
    },
    body: {
      ru: "Ключи без геральдики. Инструкция, которая читается пальцами: фаски, насечки, короткие фразы.",
      en: "Keys without heraldry. Instructions meant to be read with fingers: bevels, notches, short lines.",
    },
    tags: {
      ru: ["носители", "объект"],
      en: ["collateral", "object"],
    },
  },
  {
    slug: "pulp-index",
    year: 2025,
    span: "col-span-6 md:col-span-4",
    cover: cover("pulp-index"),
    glow: ["#ff8a5c", "#1a0804"],
    motif: "wave",
    title: "Pulp Index",
    kicker: {
      ru: "Каталог как волна тиража",
      en: "A catalogue as a print-run wave",
    },
    body: {
      ru: "Каждый экземпляр чуть другой плотности. Индекс не список, а прилив краски.",
      en: "Each copy has a slightly different density. The index is not a list — it is a tide of ink.",
    },
    tags: {
      ru: ["издание", "система"],
      en: ["print", "system"],
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
