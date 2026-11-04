import type { Bi } from "./dombro";

export type CareerLogoKind = "spark" | "ochkarik" | "hygear" | "tsekh";

/** Each stage: where, which role, and what I did there (not what the company does). */
export const careerMilestones: Array<{ year: Bi; company: Bi; role: Bi; description: Bi; logo: CareerLogoKind; current?: boolean }> = [
  {
    year: { ru: "2011–2019", en: "2011–2019" },
    company: { ru: "Маркетинг", en: "Marketing" },
    role: { ru: "Графический и веб-дизайнер", en: "Graphic & web designer" },
    description: {
      ru: "Рекламные кампании, полиграфия, сайты и лендинги.",
      en: "Ad campaigns, print, websites and landing pages.",
    },
    logo: "spark",
  },
  {
    year: { ru: "2020–2022", en: "2020–2022" },
    company: { ru: "Очкарик", en: "Ochkarik" },
    role: { ru: "Коммуникационный дизайнер", en: "Communication designer" },
    description: {
      ru: "Рекламные кампании, оформление салонов и цифровые каналы сети.",
      en: "Ad campaigns, in-store design and the chain's digital channels.",
    },
    logo: "ochkarik",
  },
  {
    year: { ru: "2022–2023", en: "2022–2023" },
    company: { ru: "Hygear Fit", en: "Hygear Fit" },
    role: { ru: "Коммуникационный и веб-дизайнер", en: "Communication & web designer" },
    description: {
      ru: "Сайт, рекламные кампании и материалы для запуска умных тренажёров.",
      en: "Website, ad campaigns and launch materials for smart fitness gear.",
    },
    logo: "hygear",
  },
  {
    year: { ru: "2023 — н. в.", en: "2023 — now" },
    company: { ru: "Цех", en: "Tsekh" },
    role: { ru: "Коммуникационный дизайнер", en: "Communication designer" },
    description: {
      ru: "Коммуникации для клиентов студии и рабочие прототипы с ИИ-агентами.",
      en: "Communications for studio clients and working prototypes with AI agents.",
    },
    logo: "tsekh",
    current: true,
  },
];
