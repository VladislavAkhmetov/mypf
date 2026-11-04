import type { Bi } from "./dombro";

export const kroomiLinks = {
  // No store pages yet: the app is still in development. Updates go through Telegram.
  notify: "https://t.me/vladakhmetov",
};

// Two species, drawn as clean silhouettes without eyes (from the approved character drawings). The landing paints the body
// colour through a mask and draws live eyes on top. `eye` is the eye pair box in % of the image; `d` is one eye's width in % of the pair.
export const kroomiSpecies = {
  cat: { src: "pet-cat", ratio: 0.9808, eye: { x: 26.68, y: 29.65, w: 47.13, d: 45.4 } },
  hedgehog: { src: "pet-hedgehog", ratio: 0.9667, eye: { x: 27.87, y: 44.6, w: 44.09, d: 47.1 } },
} as const;

export const kroomiPets = {
  sweet: { species: "hedgehog", body: "#ffb442", iris: "#ff8ed8" },
  sarcastic: { species: "hedgehog", body: "#40dace", iris: "#244bff" },
  dramatic: { species: "cat", body: "#ff8ed8", iris: "#9866ff" },
  lazy: { species: "cat", body: "#dfff00", iris: "#29303a" },
  hyper: { species: "cat", body: "#ff9555", iris: "#dfff00" },
  scholar: { species: "cat", body: "#9866ff", iris: "#dfff00" },
} as const;
export type KroomiPetId = keyof typeof kroomiPets;

export const kroomiCopy = {
  status: { ru: "В разработке", en: "In development" } satisfies Bi,
  title: { ru: "Заведи персонажа. Заговори на иностранном.", en: "Make a character. Speak a language." } satisfies Bi,
  // Hero headline, set as three oversized rows: [word + small stacked aside], word, word + arrow.
  hero: {
    row1: { ru: "Заведи", en: "Make" } satisfies Bi,
    aside: { ru: ["своего", "персонажа"], en: ["a character", "of your own"] },
    row2: { ru: "Заговори на", en: "Speak a" } satisfies Bi,
    row3: { ru: "иностранном", en: "language" } satisfies Bi,
  },
  lead: { ru: "Иностранный язык вместе с персонажем.", en: "A foreign language, together with a character." } satisfies Bi,
  notify: { ru: "Узнать о выходе", en: "Get notified" } satisfies Bi,
  soon: { ru: "скоро", en: "soon" } satisfies Bi,
  greetings: ["Come in!", "Entrez !", "Komm rein!", "¡Pasa!", "Entra!"],
  scroll: { ru: "Листай", en: "Scroll" } satisfies Bi,

  nav: [
    { ru: "Заведи персонажа", en: "Meet your character" },
    { ru: "Приходи в гости", en: "Come visit" },
    { ru: "Говори на иностранном", en: "Speak a language" },
  ] satisfies Bi[],

  // Cursor hints: {braces} mark the accent word, like the typed tips next to the cursor.
  cur: {
    hero: { ru: "Попробуй {скролл}", en: "Try the {scroll}" },
    pet: { ru: "Нажми на {него}", en: "Click the {character}" },
    cta: { ru: "Узнай {первым}", en: "Hear it {first}" },
    loop: { ru: "Листай {дальше}", en: "Keep {scrolling}" },
    picker: { ru: "Крути {список}", en: "Spin the {list}" },
    facts: { ru: "Всё {честно}", en: "No {tricks}" },
    finale: { ru: "Напиши {мне}", en: "Message {me}" },
    chars: { ru: "Потыкай {характер}", en: "Poke a {character}" },
  } satisfies Record<string, Bi>,

  stepsTitle: { ru: "Так это работает", en: "How it works" } satisfies Bi,
  steps: [
    {
      img: "app-home", pet: "hyper",
      words: { ru: ["Он", "зовёт"], en: ["It", "invites"] },
    },
    {
      img: "app-clues", pet: "scholar",
      words: { ru: ["Ты", "учишь"], en: ["You", "learn"] },
    },
    {
      img: "app-find", pet: "dramatic",
      words: { ru: ["Ты", "делаешь"], en: ["You", "act"] },
    },
    {
      img: "app-learn", pet: "lazy",
      words: { ru: ["Оно", "остаётся"], en: ["It", "stays"] },
    },
  ] satisfies { img: string; pet: KroomiPetId; words: { ru: string[]; en: string[] } }[],

  featuresTitle: { ru: "Что внутри", en: "What is inside" } satisfies Bi,
  features: [
    { img: "app-home", word: { ru: "Дом", en: "Home" } },
    { img: "app-snack", word: { ru: "Забота", en: "Care" } },
    { img: "app-together", word: { ru: "Игры", en: "Games" } },
    { img: "app-learn", word: { ru: "Фразы", en: "Phrases" } },
    { img: "app-passport", word: { ru: "Паспорт", en: "Passport" } },
    { img: "app-night", word: { ru: "Ночь", en: "Night" } },
  ] satisfies { img: string; word: Bi }[],

  characters: {
    title: { ru: ["Персонажи", "с характером"], en: ["Characters", "with attitude"] },
    cast: [
      { id: "hyper", bg: "#dfff00" }, { id: "dramatic", bg: "#9866ff" }, { id: "lazy", bg: "#40dace" },
      { id: "sarcastic", bg: "#244bff" }, { id: "scholar", bg: "#ffd23a" }, { id: "sweet", bg: "#ff8ed8" },
    ] satisfies { id: KroomiPetId; bg: string }[],
  },

  facts: [
    { big: "0", color: "#ff8ed8", label: { ru: "рекламы", en: "ads" } },
    { big: "∞", color: "#6fd3ff", label: { ru: "терпения", en: "patience" } },
  ],

  finale: {
    word: { ru: "Скоро", en: "Soon" } satisfies Bi,
    aside: { ru: ["на iOS", "и Android"], en: ["on iOS", "and Android"] },
  },
  footer: { ru: "kroomi · в разработке", en: "kroomi · in development" } satisfies Bi,
};
