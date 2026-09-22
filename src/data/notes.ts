export type NoteCategory = "Проекты" | "Путешествия" | "Эксперименты";
export interface NoteMedia {
  type: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
}
export interface Note {
  id: string;
  date: string;
  category: NoteCategory;
  text: string;
  demo?: boolean;
  media?: NoteMedia[];
  projectSlug?: string;
  continuation?: { id: string; text: string; media?: NoteMedia[] }[];
}

// Demo copy, not a factual diary. Replace with your own posts before publishing.
// Dates are ISO strings with an explicit timezone; oldest posts come first.
export const notes: Note[] = [
  {
    id: "start", date: "2026-09-01T10:00:00+03:00", category: "Эксперименты", demo: true,
    text: "Не всё становится кейсом.\n\nЗдесь будет то, что обычно остаётся между проектами: находки, поездки, маленькие эксперименты и вещи в процессе. Без презентаций на сорок слайдов.",
  },
  {
    id: "city-notes", date: "2026-09-04T18:30:00+03:00", category: "Путешествия", demo: true,
    text: "Город как бесконечный референс. Вывески, случайные сочетания цвета, буквы, которые никто не выравнивал по сетке.\n\nМесто для будущей заметки из поездки.",
    media: [{ type: "image", src: "/placeholders/stories/yerevan.jpg", alt: "Визуальный пример для заметки о путешествии" }, { type: "image", src: "/placeholders/stories/yerevan-2.jpg", alt: "Второй кадр из примера заметки" }],
  },
  {
    id: "kora-process", date: "2026-09-09T11:20:00+03:00", category: "Проекты", demo: true,
    text: "Люблю момент, когда отдельные буквы начинают работать как система. Уже не набор красивых форм, а голос.\n\nЧерновая заметка о процессе работы над Kora.",
    media: [{ type: "image", src: "/placeholders/stories/kora-drop.jpg", alt: "Графика проекта Kora" }], projectSlug: "kora",
    continuation: [{ id: "detail", text: "А здесь — продолжение мысли в той же ветке. Можно показать деталь, второй вариант или коротко объяснить решение.", media: [{ type: "image", src: "/placeholders/stories/kora-drop-2.jpg", alt: "Деталь графики Kora" }] }],
  },
  {
    id: "unfinished", date: "2026-09-14T16:45:00+03:00", category: "Эксперименты", demo: true,
    text: "Напоминание себе: не каждый эксперимент обязан превращаться в продукт. Иногда достаточно проверить «а что, если?» и оставить красивый след.",
    media: [{ type: "image", src: "/placeholders/stories/afterimage.jpg", alt: "Визуальный эксперимент Afterimage" }],
  },
  {
    id: "small-tools", date: "2026-09-18T13:00:00+03:00", category: "Проекты", demo: true,
    text: "Хороший инструмент не просит внимания. Он просто убирает несколько скучных шагов из рабочего дня.\n\nЗдесь буду показывать, как растут мои плагины и сервисы: от первой идеи до рабочего прототипа.",
  },
  {
    id: "portfolio-in-progress", date: "2026-09-22T12:00:00+03:00", category: "Эксперименты", demo: true,
    media: [{ type: "image", src: "/placeholders/covers/noclip.jpg", alt: "Демообложка: красный зонт и огни вечернего города" }],
    text: "Портфолио — это результат. А мне хочется показывать ещё и путь.\n\nПоэтому рядом с проектами теперь есть этот маленький дневник. Работа, поездки, код и дизайн — всё, что происходит между готовыми кейсами.",
  },
];

export const chronologicalNotes = [...notes].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
export const latestNote = chronologicalNotes.at(-1);
export const newestNotes = [...chronologicalNotes].reverse();
