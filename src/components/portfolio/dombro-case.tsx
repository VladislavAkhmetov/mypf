"use client";

import Image from "next/image";
import { useWindowManager } from "@/components/xp/window-manager-context";
import { getPrimaryWindowBounds } from "@/lib/xp/navigation";
import { xpSound } from "@/lib/xp/sound";
import styles from "./dombro-case.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

type Zoom = (image: { src: string; alt: string }) => void;

const RELEASES = "https://github.com/VladislavAkhmetov/dombro-releases/releases";
const src = (name: string) => `/images/dombro-case/${name}.webp`;

const facts = (tr: Tr): Array<[string, string]> => [
  [tr("Роль", "Role"), tr("Продукт, дизайн, разработка", "Product, design, development")],
  [tr("Платформа", "Platform"), "Windows 11"],
  [tr("Стек", "Stack"), "Electron, React, TypeScript"],
];

function Shot({ name, alt, onZoom, title, text, half }: { name: string; alt: string; onZoom: Zoom; title?: string; text?: string; half?: boolean }) {
  const { tr } = useLocale();
  return (
    <figure className={styles.figure}>
      <button type="button" className={styles.shot} onClick={() => onZoom({ src: src(name), alt })} aria-label={`${tr("Увеличить", "Zoom")}: ${alt}`}>
        <Image src={src(name)} alt={alt} width={half ? 1500 : 2000} height={half ? 938 : 1250} unoptimized />
      </button>
      {title && <figcaption className={styles.caption}><b>{title}</b><span>{text}</span></figcaption>}
    </figure>
  );
}

export function DombroCase({ onZoom }: { onZoom: Zoom }) {
  const { tr } = useLocale();
  const { openWindow } = useWindowManager();
  const openLanding = () => {
    xpSound.click();
    openWindow({ id: "dombro", type: "dombro", title: "dombro — браузер и спокойный дашборд", iconType: "dombro", ...getPrimaryWindowBounds() });
  };

  return (
    <div className={styles.wrap}>
      <figure className={styles.brand}>
        <Image className={styles.logo} src="/images/dombro/logo.svg" alt="dombro" width={479} height={69} unoptimized priority />
        <Image className={styles.appIcon} src="/images/dombro/icon.svg" alt={tr("Иконка приложения dombro", "dombro app icon")} width={288} height={288} unoptimized />
      </figure>

      <section className={styles.intro}>
        <dl className={styles.facts}>{facts(tr).map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        <div className={styles.introText}>
          <p>{tr("Браузер и главная страница для тех, у кого открыто слишком много вкладок. В нём нет красных счётчиков, бесконечных лент и штрафов за перенос дел: главная помогает начать, а не требует ухода.", "A browser and a home page for people with too many tabs open. No red badges, endless feeds or penalties for moving tasks: the home page helps you start instead of demanding attention.")}</p>
          <p>{tr("Продукт, интерфейс и приложение я сделал сам.", "I made the product, the interface and the app myself.")}</p>
        </div>
      </section>

      <Shot name="space" alt={tr("Страница пространства в dombro", "A space page in dombro")} onZoom={onZoom} title={tr("Пространства", "Spaces")} text={tr("Вкладки, файлы и программы одной задачи лежат вместе. Неактивные вкладки выгружаются из памяти, звук и недозаполненные формы сохраняются.", "Tabs, files and programs for one task stay together. Idle tabs are unloaded from memory, while sound and half-filled forms are kept.")} />
      <Shot name="capture-full" alt={tr("Быстрая запись распознаёт «завтра в 12»", "Quick capture understands “tomorrow at 12”")} onZoom={onZoom} title={tr("Быстрая запись", "Quick capture")} text={tr("«Позвонить в типографию завтра в 12» становится делом на завтра, 12:00.", "“Call the print shop tomorrow at 12” becomes a task for tomorrow, 12:00.")} />
      <Shot name="focus-full" alt={tr("Выбор дела и таймера для фокуса", "Picking a task and a focus timer")} onZoom={onZoom} title={tr("Фокус", "Focus")} text={tr("Одно дело и таймер на 15, 30 или 60 минут, остальное размыто.", "One task and a 15, 30 or 60 minute timer; everything else is blurred.")} />
      <Shot name="today-full" alt={tr("Страница «Сегодня»", "The Today page")} onZoom={onZoom} title={tr("Сегодня", "Today")} text={tr("Вкладки без пространства собираются здесь. После 04:00 день начинается заново, вчерашнее хранится 14 дней.", "Tabs without a space gather here. After 04:00 the day starts over; yesterday is kept for 14 days.")} />

      <figure className={styles.figure}>
        <div className={styles.pair}>
          <button type="button" className={styles.shot} onClick={() => onZoom({ src: src("theme-dusk"), alt: tr("dombro на фоне «Сумерки»", "dombro on the Dusk background") })} aria-label={tr("Увеличить: фон «Сумерки»", "Zoom: Dusk background")}><Image src={src("theme-dusk")} alt={tr("dombro на фоне «Сумерки»", "dombro on the Dusk background")} width={1500} height={938} unoptimized /></button>
          <button type="button" className={styles.shot} onClick={() => onZoom({ src: src("theme-ocean"), alt: tr("dombro на фоне «Океан»", "dombro on the Ocean background") })} aria-label={tr("Увеличить: фон «Океан»", "Zoom: Ocean background")}><Image src={src("theme-ocean")} alt={tr("dombro на фоне «Океан»", "dombro on the Ocean background")} width={1500} height={938} unoptimized /></button>
        </div>
        <figcaption className={styles.caption}><b>{tr("Фоны", "Backgrounds")}</b><span>{tr("Рассвет, сумерки, океан, облака, луг. Стеклянные карточки читаются на любом.", "Dawn, dusk, ocean, clouds, meadow. The glass cards stay readable on any of them.")}</span></figcaption>
      </figure>

      <section className={styles.tech}>
        <span className={styles.label}>{tr("Технически", "Under the hood")}</span>
        <div>
          <p>{tr("Electron, React и TypeScript, локальная база SQLite, блокировка рекламы на Ghostery, режим чтения на Readability, календари iCal и интеграция с окнами Windows через koffi. Релизы собирает GitHub Actions: установщик, который сам проверяет обновления, и portable-файл.", "Electron, React and TypeScript, a local SQLite database, ad blocking with Ghostery, reader mode with Readability, iCal calendars and Windows window integration through koffi. GitHub Actions builds the releases: an installer that checks for updates itself, and a portable file.")}</p>
          <div className={styles.links}>
            <button type="button" onClick={openLanding} data-ym-goal="dombro_case_landing">{tr("Лендинг dombro", "dombro landing page")} <span aria-hidden="true">↗</span></button>
            <a href={RELEASES} target="_blank" rel="noreferrer">{tr("Все версии", "All releases")} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
