export interface WallpaperItem {
  id: string;
  name: string;
  src: string;
  desc: string;
  region?: string;
  isGradient?: boolean;
  isColor?: boolean;
}

export const DEFAULT_WALLPAPER_SRC = "/images/bliss.jpg";

export const WALLPAPERS: WallpaperItem[] = [
  {
    id: "bliss",
    name: "Bliss (Безмятежность)",
    src: "/images/bliss.jpg",
    desc: "Холмы Сономы, Калифорния (Чарльз О'Риэр, 1996)",
    region: "США, Северная Америка и глобальный стандарт",
  },
  {
    id: "autumn",
    name: "Autumn (Золотая осень)",
    src: "/images/wallpapers/autumn.svg",
    desc: "Золотые кроны и ностальгический тихий лес",
    region: "Россия, Беларусь, Казахстан и страны СНГ",
  },
  {
    id: "stonehenge",
    name: "Stonehenge (Стоунхендж)",
    src: "/images/wallpapers/stonehenge.svg",
    desc: "Древние мегалиты под туманным небом Солсбери",
    region: "Великобритания, Ирландия и Западная Европа",
  },
  {
    id: "azul",
    name: "Azul (Лазурный берег)",
    src: "/images/wallpapers/azul.svg",
    desc: "Бирюзовая гладь моря и золотистый солнечный пляж",
    region: "Средиземноморье, Южная Европа и побережья",
  },
  {
    id: "desert",
    name: "Red Moon Desert (Красная пустыня)",
    src: "/images/wallpapers/desert.svg",
    desc: "Красные песчаные дюны и драматичный лунный пейзаж",
    region: "Ближний Восток, Северная Африка и Австралия",
  },
  {
    id: "crystal",
    name: "Crystal (Кристальное озеро)",
    src: "/images/wallpapers/crystal.svg",
    desc: "Ледниковые пики, северное сияние и зеркальная гладь",
    region: "Скандинавия, северные страны и Канада",
  },
  {
    id: "swiss",
    name: "Swiss Modernist Grid",
    src: "radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)",
    desc: "Типографическая сетка и монохромная подложка",
    region: "Швейцария, Австрия и дизайн-студии",
    isGradient: true,
  },
  {
    id: "royale",
    name: "Energy Blue (Royale)",
    src: "linear-gradient(135deg, #0b4f8c 0%, #1783cf 50%, #032b57 100%)",
    desc: "Абстрактный векторный градиент Media Center",
    region: "Windows Media Center Edition",
    isGradient: true,
  },
  {
    id: "classic",
    name: "Classic Teal (2000)",
    src: "#008080",
    desc: "Эталонный бирюзовый монохром рабочей станции",
    region: "Windows 2000 / NT Classic",
    isColor: true,
  },
  {
    id: "dark",
    name: "Midnight Onyx",
    src: "#090d16",
    desc: "Бескомпромиссный глубокий темный фон",
    region: "Темная тема",
    isColor: true,
  },
];

export const DEFAULT_WALLPAPER = WALLPAPERS[0];

const COUNTRY_WALLPAPER_MAP: Record<string, string> = {
  // CIS / Eastern Europe -> Autumn
  RU: "autumn",
  BY: "autumn",
  KZ: "autumn",
  UA: "autumn",
  AM: "autumn",
  GE: "autumn",
  AZ: "autumn",
  UZ: "autumn",
  KG: "autumn",
  TJ: "autumn",
  MD: "autumn",

  // Western & Central Europe -> Stonehenge
  GB: "stonehenge",
  IE: "stonehenge",
  FR: "stonehenge",
  DE: "stonehenge",
  NL: "stonehenge",
  BE: "stonehenge",
  AT: "stonehenge",
  CH: "stonehenge",
  PL: "stonehenge",
  CZ: "stonehenge",
  SK: "stonehenge",
  HU: "stonehenge",

  // Mediterranean & Southern Europe & Latin America -> Azul
  ES: "azul",
  IT: "azul",
  PT: "azul",
  GR: "azul",
  CY: "azul",
  TR: "azul",
  BR: "azul",
  MX: "azul",
  AR: "azul",
  CL: "azul",
  CO: "azul",
  PE: "azul",

  // Middle East, Africa, Desert, Australia -> Desert
  AE: "desert",
  SA: "desert",
  QA: "desert",
  KW: "desert",
  OM: "desert",
  BH: "desert",
  EG: "desert",
  IL: "desert",
  ZA: "desert",
  MA: "desert",
  AU: "desert",
  NZ: "desert",

  // Nordic, Northern Latitudes, Canada -> Crystal
  NO: "crystal",
  SE: "crystal",
  FI: "crystal",
  IS: "crystal",
  EE: "crystal",
  LV: "crystal",
  LT: "crystal",
  CA: "crystal",

  // Americas / Default -> Bliss
  US: "bliss",
};

/**
 * Returns the matching WallpaperItem for a given 2-letter ISO country code.
 * Falls back to Bliss if unmapped, unknown or empty.
 */
export function getWallpaperForCountry(countryCode?: string | null): WallpaperItem {
  if (!countryCode) {
    return DEFAULT_WALLPAPER;
  }

  const normalized = countryCode.trim().toUpperCase();
  const wallpaperId = COUNTRY_WALLPAPER_MAP[normalized];

  if (wallpaperId) {
    const found = WALLPAPERS.find((wp) => wp.id === wallpaperId);
    if (found) {
      return found;
    }
  }

  return DEFAULT_WALLPAPER;
}

/**
 * Helper to lookup a wallpaper item by its src or id.
 */
export function findWallpaper(srcOrId: string): WallpaperItem | undefined {
  return WALLPAPERS.find((wp) => wp.src === srcOrId || wp.id === srcOrId);
}
