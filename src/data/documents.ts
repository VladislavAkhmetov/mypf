import type { Bi } from "./dombro";

export interface ProfileDocument {
  title: Bi;
  subtitle: string;
  paragraphs: Bi[];
}

/** The single page shown in the Word window: who I am and where to go next. */
export const profileDocument: ProfileDocument = {
  title: { ru: "Влад Ахметов", en: "Vlad Akhmetov" },
  subtitle: "Software Designer & AI Prototyper",
  paragraphs: [
    {
      ru: "Я проектирую программы целиком, от идеи до рабочей версии, и быстро собираю прототипы с ИИ-агентами. Я пришёл из коммуникационного дизайна, поэтому мне важно и то, как интерфейс работает, и то, как он выглядит и говорит.",
      en: "I design software end to end, from the idea to a working version, and build prototypes fast with AI agents. I come from communication design, so I care both about how an interface works and about how it looks and speaks.",
    },
  ],
};
