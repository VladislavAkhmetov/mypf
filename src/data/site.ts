export const site = {
  name: "Влад Ахметов",
  nameEn: "Vlad Akhmetov",
  avatar: "/placeholders/profile.jpg",
  handle: "@vladakhmetov",
  email: "vl.akhmetov@gmail.com",
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
    ru: "Amazi, независимая практика",
    en: "Amazi, independent practice",
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

/** Browser tab title and description for each language; used by the layouts and on a live language switch. */
export function siteMeta(locale: "ru" | "en") {
  return locale === "en"
    ? { title: `${site.nameEn} — ${site.role.en} | Portfolio`, description: `${site.role.en}. ${site.roleDescription.en}` }
    : { title: `${site.name} — ${site.role.ru} | Портфолио`, description: `${site.role.ru}. ${site.roleDescription.ru}` };
}
