export type Bi = { ru: string; en: string };

export const dombroLinks = {
  // Binaries (installer and portable build) and updates are published here, not the sources.
  repo: "https://github.com/VladislavAkhmetov/dombro-releases",
  latest: "https://github.com/VladislavAkhmetov/dombro-releases/releases/latest",
  all: "https://github.com/VladislavAkhmetov/dombro-releases/releases",
};

export const dombroCopy = {
  title: { ru: "Тихое место, откуда легко продолжить.", en: "A quiet place to pick up where you left off." } satisfies Bi,
  lead: {
    ru: "dombro сохраняет контекст работы, подсказывает следующий шаг и убирает с экрана всё остальное.",
    en: "dombro keeps your work context, suggests the next step and clears everything else off the screen.",
  } satisfies Bi,
  download: { ru: "Скачать для Windows", en: "Download for Windows" } satisfies Bi,
  allVersions: { ru: "Все версии и обновления", en: "All versions and updates" } satisfies Bi,
  releasesShort: { ru: "Релизы", en: "Releases" } satisfies Bi,

  calmTitle: { ru: "Меньше шума. Больше воздуха.", en: "Less noise. More air." } satisfies Bi,

  uiTitle: { ru: "Всё нужное утром на одном экране.", en: "Everything you need, on one screen." } satisfies Bi,
  cards: [
    {
      id: "continue",
      title: { ru: "Продолжить", en: "Continue" },
      text: { ru: "Пространство хранит вкладки, файлы и следующий шаг. Вернулись и нажали «Продолжить».", en: "A space keeps tabs, files and your next step. Come back and press “Continue”." },
    },
    {
      id: "tasks",
      title: { ru: "Дела на день", en: "Today’s tasks" },
      text: { ru: "День выполнения, срок и напоминание независимы: «на завтра» не значит «напомнить».", en: "Due day, deadline and reminder are independent, so “tomorrow” never means “nag me”." },
    },
    {
      id: "focus",
      title: { ru: "Фокус", en: "Focus" },
      text: { ru: "Одно дело и таймер на 15, 30 или 60 минут. Больше ничего.", en: "One task and a 15, 30 or 60 minute timer. Nothing more." },
    },
    {
      id: "capture",
      title: { ru: "Записать", en: "Capture" },
      text: { ru: "Мысль, дело или напоминание в одном поле. Можно голосом.", en: "A thought, a task or a reminder in a single field. Voice works too." },
    },
    {
      id: "reading",
      title: { ru: "Почитать", en: "Read later" },
      text: { ru: "Отложенное чтение без ленты: список или плитки, по пространствам.", en: "Reading without a feed: a list or tiles, grouped by space." },
    },
    {
      id: "space",
      title: { ru: "Пространства", en: "Spaces" },
      text: { ru: "Контекст работы, а не доска с колонками: вкладки, файлы и программы рядом.", en: "A work context, not a board with columns: tabs, files and apps side by side." },
    },
    {
      id: "today",
      title: { ru: "Сегодня", en: "Today" },
      text: { ru: "Вкладки без пространства собираются здесь. Утром чистый лист, вчерашнее уходит в «Прошлые дни».", en: "Tabs without a space land here. Every morning starts clean; yesterday moves to “Past days”." },
    },
    {
      id: "dock",
      title: { ru: "Док", en: "Dock" },
      text: { ru: "Запись, фокус и музыка под рукой, но не на виду.", en: "Capture, focus and music within reach, never in the way." },
    },
  ] satisfies Array<{ id: string; title: Bi; text: Bi }>,

  footTitle: { ru: "Готовы продолжить?", en: "Ready to continue?" } satisfies Bi,
  footText: {
    ru: "Установщик и portable-версия для Windows 11. Новые версии выходят на странице релизов.",
    en: "Installer and portable build for Windows 11. New versions are published on the releases page.",
  } satisfies Bi,
  footNote: { ru: "Проект Влада Ахметова", en: "A project by Vlad Akhmetov" } satisfies Bi,
};

/** Sample content shown inside the live dombro plates. */
export const demo = {
  months: { ru: "октября", en: "October" } satisfies Bi,
  weekday: { ru: "среда", en: "Wednesday" } satisfies Bi,
  city: { ru: "Уфа", en: "Local time" } satisfies Bi,
  greetings: {
    night: { ru: "Доброй ночи.", en: "Good night." },
    morning: { ru: "Доброе утро.", en: "Good morning." },
    day: { ru: "Добрый день.", en: "Good afternoon." },
    evening: { ru: "Добрый вечер.", en: "Good evening." },
  } satisfies Record<string, Bi>,
  search: { ru: "Поиск или адрес сайта", en: "Search or enter an address" } satisfies Bi,
  browser: { ru: "Браузер", en: "Browser" } satisfies Bi,
  spaces: { ru: "Пространства", en: "Spaces" } satisfies Bi,
  tabs: [
    { ru: "Мой день", en: "My day" },
    { ru: "Сегодня", en: "Today" },
    { ru: "Моё пространство", en: "My space" },
    { ru: "Квартальный отчёт", en: "Quarterly report" },
    { ru: "Отпуск в Грузии", en: "Georgia trip" },
  ] satisfies Bi[],
  space: {
    kicker: { ru: "Пространство", en: "Space" } satisfies Bi,
    title: { ru: "Моё пространство", en: "My space" } satisfies Bi,
    opened: { ru: "Открывали · Сегодня, 18:14", en: "Opened · Today, 6:14 pm" } satisfies Bi,
    nextLabel: { ru: "Дальше:", en: "Next:" } satisfies Bi,
    next: { ru: "Собрать финальные макеты главной", en: "Assemble the final home page layouts" } satisfies Bi,
    cont: { ru: "Продолжить", en: "Continue" } satisfies Bi,
    tabs: { ru: "10 вкладок", en: "10 tabs" } satisfies Bi,
    files: { ru: "4 файла", en: "4 files" } satisfies Bi,
  },
  tasks: {
    today: { ru: "Сегодня", en: "Today" } satisfies Bi,
    tomorrow: { ru: "Завтра", en: "Tomorrow" } satisfies Bi,
    todayList: [
      { t: { ru: "Согласовать hero-блок с клиентом", en: "Align the hero block with the client" }, time: "10:30" },
      { t: { ru: "Экспортировать баннеры для рекламы", en: "Export banners for ads" }, time: "14:00" },
    ] satisfies Array<{ t: Bi; time: string }>,
    tomorrowList: [
      { t: { ru: "Ответить Ане про шрифты", en: "Reply to Anya about fonts" }, time: "09:30" },
      { t: { ru: "Позвонить в типографию", en: "Call the print shop" }, time: "12:00" },
    ] satisfies Array<{ t: Bi; time: string }>,
    all: { ru: "Все дела на этот день · 8", en: "All tasks for this day · 8" } satisfies Bi,
    thoughts: { ru: "Мысли без даты", en: "Thoughts without a date" } satisfies Bi,
  },
  reading: {
    title: { ru: "Почитать", en: "Read later" } satisfies Bi,
    items: [
      { ab: "SM", t: { ru: "Как проектировать карточки товара, которые продают", en: "How to design product cards that sell" }, meta: { ru: "smashingmagazine.com · 8 мин", en: "smashingmagazine.com · 8 min" } },
      { ab: "H", t: { ru: "Типографика интерфейсов: ритм и сетка", en: "Interface typography: rhythm and grid" }, meta: { ru: "habr.com · 9 мин", en: "habr.com · 9 min" } },
      { ab: "CA", t: { ru: "Спокойные технологии: интерфейсы без тревоги", en: "Calm technology: interfaces without anxiety" }, meta: { ru: "calmtech.com · 7 мин", en: "calmtech.com · 7 min" } },
    ] satisfies Array<{ ab: string; t: Bi; meta: Bi }>,
  },
  focus: {
    question: { ru: "На чём сосредоточиться?", en: "What to focus on?" } satisfies Bi,
    minutes: { ru: "мин", en: "min" } satisfies Bi,
    start: { ru: "Начать", en: "Start" } satisfies Bi,
    stop: { ru: "Остановить", en: "Stop" } satisfies Bi,
  },
  capture: {
    phrases: [
      { ru: "Позвонить в типографию завтра в 12", en: "Call the print shop tomorrow at 12" },
      { ru: "Идея: тихий экран без счётчиков", en: "Idea: a quiet screen without badges" },
      { ru: "Напомнить про договор в пятницу", en: "Remind me about the contract on Friday" },
    ] satisfies Bi[],
  },
  dock: {
    capture: { ru: "Записать", en: "Capture" } satisfies Bi,
    focus: { ru: "Фокус", en: "Focus" } satisfies Bi,
    paused: { ru: "Пауза", en: "Paused" } satisfies Bi,
    playing: { ru: "Играет", en: "Playing" } satisfies Bi,
  },
  spacePage: {
    title: { ru: "Квартальный отчёт", en: "Quarterly report" } satisfies Bi,
    tabsTitle: { ru: "Вкладки", en: "Tabs" } satisfies Bi,
    filesTitle: { ru: "Файлы и программы", en: "Files and apps" } satisfies Bi,
    tabs: [
      { ru: "Продажи Q3", en: "Q3 sales" },
      { ru: "Отчёт: структура", en: "Report outline" },
      { ru: "Графики", en: "Charts" },
    ] satisfies Bi[],
    files: [
      { k: "W", n: { ru: "Отчёт_Q3.docx", en: "Report_Q3.docx" } },
      { k: "X", n: { ru: "Продажи.xlsx", en: "Sales.xlsx" } },
      { k: "PDF", n: { ru: "Итоги.pdf", en: "Summary.pdf" } },
    ],
  },
  today: {
    title: { ru: "Сегодня", en: "Today" } satisfies Bi,
    date: { ru: "Среда, 28 октября", en: "Wednesday, October 28" } satisfies Bi,
    hint: { ru: "Вкладки без пространства · утром — с чистого листа", en: "Tabs without a space · fresh start every morning" } satisfies Bi,
    open: { ru: "Открыть браузер", en: "Open browser" } satisfies Bi,
    favorites: { ru: "Избранное", en: "Favorites" } satisfies Bi,
    items: [
      { k: "F", c: "#e0527a", n: { ru: "Figma — все файлы", en: "Figma — all files" } },
      { k: "L", c: "#8a6a3a", n: { ru: "Linear — задачи команды", en: "Linear — team tasks" } },
      { k: "M", c: "#b34a64", n: { ru: "Почта", en: "Mail" } },
      { k: "G", c: "#c4552b", n: { ru: "Госуслуги", en: "Public services" } },
    ] satisfies Array<{ k: string; c: string; n: Bi }>,
  },
};
