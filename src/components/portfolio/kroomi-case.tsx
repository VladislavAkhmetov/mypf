"use client";

import Image from "next/image";
import { useWindowManager } from "@/components/xp/window-manager-context";
import { getPrimaryWindowBounds } from "@/lib/xp/navigation";
import { xpSound } from "@/lib/xp/sound";
import { CaseClip } from "./case-clip";
import styles from "./kroomi-case.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

type Zoom = (image: { src: string; alt: string }) => void;

const media = (name: string) => `/images/kroomi-case/${name}`;

const facts = (tr: Tr): Array<[string, string]> => [
  [tr("Роль", "Role"), tr("Продукт, дизайн, разработка", "Product, design, development")],
  [tr("Статус", "Status"), tr("В разработке", "In development")],
  [tr("Платформа", "Platform"), tr("iOS и Android", "iOS and Android")],
  [tr("Стек", "Stack"), "React, TypeScript, Motion"],
];

const screens = (tr: Tr): Array<{ name: string; alt: string }> => [
  { name: "app-together", alt: tr("Вкладка «Вместе»: игры и разговоры с персонажем", "The Together tab: games and chats with the character") },
  { name: "app-passport", alt: tr("Паспорт персонажа и путь знакомства", "The character passport and the getting-to-know path") },
  { name: "app-snack", alt: tr("Перекус: выбор угощения для персонажа", "Snack time: picking a treat for the character") },
];

export function KroomiCase({ onZoom }: { onZoom: Zoom }) {
  const { tr } = useLocale();
  const { openWindow } = useWindowManager();
  const openLanding = () => {
    xpSound.click();
    openWindow({ id: "kroomi", type: "kroomi", title: "kroomi — языки с персонажем", iconType: "kroomi", ...getPrimaryWindowBounds() });
  };

  return (
    <div className={styles.wrap}>
      <figure className={styles.brand}>
        <Image className={styles.logo} src="/images/kroomi/logo-wide.svg" alt="kroomi" width={756} height={146} unoptimized priority />
        <Image className={styles.appIcon} src="/images/kroomi/icon.svg" alt={tr("Иконка приложения kroomi", "kroomi app icon")} width={288} height={288} unoptimized />
      </figure>

      <section className={styles.intro}>
        <dl className={styles.facts}>{facts(tr).map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
        <div className={styles.introText}>
          <p>{tr("kroomi — приложение для изучения иностранного языка. В нём живёт персонаж со своим характером и своими делами: он зовёт в гости, теряет мяч, хочет есть.", "kroomi is an app for learning a foreign language. It is home to a character with its own personality and plans: it invites you over, loses a ball, gets hungry.")}</p>
          <p>{tr("Чтобы ему помочь, нужно понять, о чём он просит, и ответить на языке, который вы учите.", "To help it, you need to understand what it asks for and answer in the language you are learning.")}</p>
        </div>
      </section>

      <figure className={styles.figure}>
        <CaseClip src={media("hedgehog.mp4")} poster={media("hedgehog-poster.webp")} ratio="16 / 10" label={tr("Ёжик здоровается, пьёт из чашки, радуется и засыпает", "The hedgehog says hi, drinks from a cup, cheers and falls asleep")} />
      </figure>

      <figure className={styles.figure}>
        <Image className={styles.cast} src={media("cast.webp")} alt={tr("Шесть персонажей: два вида в разных цветах", "Six characters: two species in different colours")} width={1600} height={330} unoptimized />
      </figure>

      <figure className={styles.figure}>
        <div className={styles.screens}>
          {screens(tr).map(screen => (
            <button key={screen.name} type="button" className={styles.phone} onClick={() => onZoom({ src: `/images/kroomi/${screen.name}.webp`, alt: screen.alt })} aria-label={`${tr("Увеличить", "Zoom")}: ${screen.alt}`}>
              <Image src={`/images/kroomi/${screen.name}.webp`} alt={screen.alt} width={780} height={1688} unoptimized />
            </button>
          ))}
        </div>
      </figure>

      <section className={styles.tech}>
        <span className={styles.label}>{tr("Технически", "Under the hood")}</span>
        <div>
          <p>{tr("React, TypeScript, Zustand и Motion. Персонаж — это SVG: силуэт, глаза, ушки и конечности считаются в коде, поэтому одно тело умеет много движений, а глаза следят за касанием.", "React, TypeScript, Zustand and Motion. The character is an SVG: the silhouette, eyes, ears and limbs are computed in code, so one body can do many moves and the eyes follow your touch.")}</p>
          <div className={styles.links}>
            <button type="button" onClick={openLanding} data-ym-goal="kroomi_case_landing">{tr("Лендинг kroomi", "kroomi landing page")} <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}
