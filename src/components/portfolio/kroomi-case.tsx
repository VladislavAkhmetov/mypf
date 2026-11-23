"use client";

import Image from "next/image";
import { CaseClip } from "./case-clip";
import styles from "./kroomi-case.module.css";
import { useLocale } from "@/lib/i18n";

type Tr = (ru: string, en: string) => string;

type Zoom = (image: { src: string; alt: string }) => void;

const media = (name: string) => `/images/kroomi-case/${name}`;

const screens = (tr: Tr): Array<{ name: string; alt: string }> => [
  { name: "app-together", alt: tr("Вкладка «Вместе»: игры и разговоры с персонажем", "The Together tab: games and chats with the character") },
  { name: "app-passport", alt: tr("Паспорт персонажа и путь знакомства", "The character passport and the getting-to-know path") },
  { name: "app-snack", alt: tr("Перекус: выбор угощения для персонажа", "Snack time: picking a treat for the character") },
];

export function KroomiCase({ onZoom }: { onZoom: Zoom }) {
  const { tr } = useLocale();

  return (
    <div className={styles.wrap}>
      <figure className={styles.brand}>
        <Image className={styles.logo} src="/images/kroomi/logo-wide.svg" alt="kroomi" width={756} height={146} unoptimized priority />
        <Image className={styles.appIcon} src="/images/kroomi/icon.svg" alt={tr("Иконка приложения kroomi", "kroomi app icon")} width={288} height={288} unoptimized />
      </figure>

      <section className={styles.intro}>
        <p className={styles.lead}>
          {tr(
            "kroomi — приложение для изучения иностранного языка через заботу о живом интерактивном персонаже. Моя роль — продукт, дизайн и разработка.",
            "kroomi is a language learning app built around caring for a living interactive character. My role: product, design, and development."
          )}
        </p>
      </section>

      <figure className={styles.figure}>
        <CaseClip
          src={media("guitar-jam.mp4")}
          poster={media("guitar-jam-poster.webp")}
          sound
          shadow={false}
          className={styles.heroClip}
          label={tr(
            "Скринкаст: персонаж пытается играть на гитаре, стоя в комнате",
            "Screencast: companion tries to play guitar while standing in their room"
          )}
        />
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
    </div>
  );
}
