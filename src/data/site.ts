export const site = {
  name: "Влад Ахметов",
  nameEn: "Vlad Akhmetov",
  avatar: "/placeholders/profile.jpg",
  handle: "@vladakhmetov",
  email: "mail@vladakhmetov.com",
  telegram: "https://t.me/vladakhmetov",
  instagram: null,
  role: {
    ru: "Software Designer & AI Prototyper",
    en: "Software Designer & AI Prototyper",
  },
  roleDescription: {
    ru: "Проектирую программы целиком и быстро довожу идеи до работающих прототипов с ИИ-агентами.",
    en: "I design software end to end and turn ideas into working prototypes with AI agents.",
  },
  workplaceLabel: {
    ru: "место",
    en: "studio",
  },
  workplace: {
    ru: "Студия «Цех»",
    en: "Tsekh Studio",
  },
  now: {
    ru: "Сейчас — живые прототипы: модель, код и форма в одном контуре",
    en: "Now: live prototypes where model, code, and form share one loop",
  },
  note: {
    ru: "Собираю системы, которые можно пощупать: шрифт, пространство, интерфейс. Дизайн как инженерная дисциплина, не как слайд.",
    en: "I build systems you can touch: type, space, interface. Design as an engineering discipline, not a slide.",
  },
  stack: [
    { ru: "шрифт", en: "type" },
    { ru: "шейдеры", en: "shaders" },
    { ru: "AI-продукты", en: "AI products" },
    { ru: "motion", en: "motion" },
    { ru: "spatial", en: "spatial" },
    { ru: "Next.js", en: "Next.js" },
    { ru: "GLSL", en: "GLSL" },
    { ru: "Figma", en: "Figma" },
  ],
  contact: {
    telegram: { ru: "Telegram", en: "Telegram" },
    email: { ru: "Почта", en: "Email" },
  },
  location: {
    ru: "Уфа · удалённо",
    en: "Remote",
  },
  ui: {
    back: { ru: "Назад", en: "Back" },
    open: { ru: "Открыть", en: "Open" },
    stories: { ru: "Истории", en: "Stories" },
  },
};

/** Browser tab title, description, and Open Graph metadata for each language */
export function siteMeta(locale: "ru" | "en") {
  const isEn = locale === "en";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vladakhmetov.com";
  const title = isEn
    ? `${site.nameEn} — ${site.role.en} | Portfolio`
    : `${site.name} — ${site.role.ru} | Портфолио`;
  const description = isEn
    ? `${site.role.en}. ${site.roleDescription.en}`
    : `${site.role.ru}. ${site.roleDescription.ru}`;
  const pageUrl = isEn ? `${siteUrl}/en/` : `${siteUrl}/`;
  const ogImage = isEn ? `${siteUrl}/og-en.png` : `${siteUrl}/og-ru.png`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    authors: [{ name: isEn ? site.nameEn : site.name, url: siteUrl }],
    creator: isEn ? site.nameEn : site.name,
    openGraph: {
      type: "website" as const,
      locale: isEn ? "en_US" : "ru_RU",
      url: pageUrl,
      siteName: isEn ? `${site.nameEn} — Portfolio (Windows XP)` : `${site.name} — Портфолио (Windows XP)`,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
      creator: site.handle,
    },
    icons: {
      // PNG first, stable URL, no query hash. Google Search does not use SVG
      // and replaces an undecodable ICO with the default globe.
      icon: [
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
  };
}
