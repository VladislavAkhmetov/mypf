import type { Locale } from "@/lib/i18n";

// Window and icon titles are stored as Russian strings when a window opens.
// They are translated at render time, so switching the language updates open windows too.
const TITLES: Record<string, string> = {
  "Обо мне": "About me",
  "Портфолио": "Portfolio",
  "Мой компьютер": "My Computer",
  "Визуализатор": "Visualizer",
  "Журнал": "Journal",
  "Косынка": "Solitaire",
  "Сапёр": "Minesweeper",
  "Инструменты": "Tools",
  "Справка": "Help",
  "Новая папка": "New Folder",
  "Заметка.txt": "Note.txt",
  "Резюме_Влад_Ахметов.pdf — Executive Summary": "Resume_Vlad_Akhmetov.pdf — Executive Summary",
  "Резюме_Влад_Ахметов.pdf — Резюме": "Resume_Vlad_Akhmetov.pdf — Resume",
  "Мои документы — Проекты": "My Documents — Projects",
  "Документы — Влад Ахметов": "Documents — Vlad Akhmetov",
  "dombro — браузер и спокойный дашборд": "dombro — a browser with a calm dashboard",
  "kroomi — языки с персонажем": "kroomi — languages with a character",
  "Центр справки и поддержки": "Help and Support Center",
  "Портфолио — Internet Explorer": "Portfolio — Internet Explorer",
  "C:\\Projects — Мои проекты": "C:\\Projects — My Projects",
  "D:\\Stories — Процессы и кадры": "D:\\Stories — Process and frames",
  "Windows Media Player — Атлас волн": "Windows Media Player — Wave Atlas",
  "Блокнот — Безымянный": "Notepad — Untitled",
  "Командная строка — cmd.exe": "Command Prompt — cmd.exe",
  "Командная строка": "Command Prompt",
  "Свойства: Экран и темы": "Display Properties: Themes",
  "Свойства: Экран": "Display Properties",
  "Элемент": "Item",
  "Хочешь стать дизайнером?": "Want to be a designer?",
};

export function localizeTitle(title: string, locale: Locale): string {
  if (locale === "ru") return title;
  if (TITLES[title]) return TITLES[title];
  if (title.endsWith(" - Блокнот")) return `${localizeTitle(title.slice(0, -" - Блокнот".length), locale)} - Notepad`;
  if (title.startsWith("Свойства: ")) return `Properties: ${localizeTitle(title.slice("Свойства: ".length), locale)}`;
  return title;
}
