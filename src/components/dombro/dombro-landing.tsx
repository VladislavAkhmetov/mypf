"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Cormorant } from "next/font/google";
import { useLocale } from "@/lib/i18n";
import { dombroCopy as copy, dombroLinks } from "@/data/dombro";
import styles from "./dombro-landing.module.css";
import { FitStage, StageItem } from "./stage";
import { ContinuePlate, DockPlate, plateFont, ReadingPlate, TasksPlate, TopbarPlate } from "./plates";
import { Story } from "./story";

// Large high-contrast serif for display type; has Cyrillic.
const serif = Cormorant({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap", variable: "--font-dombro-serif" });

const img = (name: string) => `/images/dombro/${name}.webp`;

export function DombroLanding() {
  const { t, locale, setLocale } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const words = t(copy.title).split(" ");

  // Narrow windows keep the same dashboard layout, just a more compact canvas that scales down as one app window.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const resize = new ResizeObserver(() => setNarrow(node.clientWidth < 720));
    resize.observe(node);
    return () => resize.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`${styles.root} ${serif.variable} ${plateFont}`}>
      <header className={styles.bar}>
        <a className={styles.brand} href={dombroLinks.repo} target="_blank" rel="noopener noreferrer" aria-label="dombro">
          <Image className={styles.brandLogo} src="/images/dombro/logo.svg" alt="" width={479} height={69} unoptimized />
        </a>
        <div className={styles.barRight}>
          <div className={styles.lang} role="group" aria-label="Language">
            {(["ru", "en"] as const).map(code => (
              <button key={code} type="button" aria-pressed={locale === code} onClick={() => setLocale(code)}>{code.toUpperCase()}</button>
            ))}
          </div>
          <a className={styles.barLink} href={dombroLinks.all} target="_blank" rel="noopener noreferrer">{t(copy.releasesShort)} <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className={styles.hero}>
        <Image className={styles.heroBg} src={img("meadow")} alt="" fill priority sizes="100vw" unoptimized draggable={false} />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <h1 className={styles.title} key={`h-${locale}`} aria-label={t(copy.title)}>
            {words.map((word, index) => (
              <span key={index} aria-hidden="true">
                <span className={styles.word} style={{ "--i": index } as CSSProperties}>{word}</span>{" "}
              </span>
            ))}
          </h1>
          <p className={styles.lead} key={`l-${locale}`}>{t(copy.lead)}</p>
          <div className={styles.cta}>
            <a className={styles.primary} href={dombroLinks.latest} target="_blank" rel="noopener noreferrer">{t(copy.download)}<span aria-hidden="true">↓</span></a>
            <a className={styles.ghost} href={dombroLinks.all} target="_blank" rel="noopener noreferrer">{t(copy.allVersions)}<span aria-hidden="true">↗</span></a>
          </div>
        </div>

        {/* The home screen as in the app: one grid, equal row heights; on phones the whole window scales down */}
        {narrow ? (
          <FitStage key="compact" designW={720} designH={790} minW={0} calm className={styles.heroStage}>
            <StageItem x={0} y={0} w={720} i={0}><TopbarPlate /></StageItem>
            <StageItem x={0} y={140} w={346} h={322} i={1}><ContinuePlate /></StageItem>
            <StageItem x={374} y={140} w={346} h={322} i={2}><TasksPlate /></StageItem>
            <StageItem x={0} y={490} w={720} h={196} i={3}><ReadingPlate initial="grid" /></StageItem>
            <StageItem x={150} y={736} w={420} i={4}><DockPlate /></StageItem>
          </FitStage>
        ) : (
          <FitStage key="wide" designW={1040} designH={800} minW={0} calm className={styles.heroStage}>
            <StageItem x={0} y={0} w={1040} i={0}><TopbarPlate /></StageItem>
            <StageItem x={0} y={140} w={506} h={300} i={1}><ContinuePlate /></StageItem>
            <StageItem x={534} y={140} w={506} h={300} i={2}><TasksPlate /></StageItem>
            <StageItem x={0} y={468} w={1040} h={218} i={3}><ReadingPlate initial="grid" /></StageItem>
            <StageItem x={260} y={724} w={520} i={4}><DockPlate /></StageItem>
          </FitStage>
        )}
      </section>

      <Story scrollRef={rootRef} />

      <footer className={styles.foot}>
        <Image className={`${styles.heroBg} ${styles.footBg}`} src={img("meadow")} alt="" fill sizes="100vw" unoptimized draggable={false} />
        <div className={styles.footPanel}>
          <div className={styles.footTop}>
            <h2>{t(copy.footTitle)}</h2>
            <p>{t(copy.footText)}</p>
            <a className={styles.primary} href={dombroLinks.latest} target="_blank" rel="noopener noreferrer">{t(copy.download)}<span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.footMeta}>
            <span>© dombro · {new Date().getFullYear()}</span><i aria-hidden="true" />
            <a href={dombroLinks.repo} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={dombroLinks.all} target="_blank" rel="noopener noreferrer">{t(copy.releasesShort)}</a>
            <span>{t(copy.footNote)}</span>
          </div>
          <div className={styles.wordmark} aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
