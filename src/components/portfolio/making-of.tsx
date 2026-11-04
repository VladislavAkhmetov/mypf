import React from "react";
import Image from "next/image";
import type { MakingOf } from "@/data/making-of";
import styles from "./making-of.module.css";
import { useLocale } from "@/lib/i18n";

/** tr("Как это сделано", "How it was made"): the process behind a case, in the case page's own visual language. */
export function MakingOfSection({ data, onZoom }: { data: MakingOf; onZoom?: (image: { src: string; alt: string }) => void }) {
  const { tr } = useLocale();
  return (
    <section className={styles.section} aria-label={tr("Как это сделано", "How it was made")}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>{tr("Процесс", "Process")}</span>
        <h2>{tr("Как это сделано", "How it was made")}<span>.</span></h2>
      </div>

      <div className={styles.split}>
        <div className={styles.card}>
          <span>{tr("Проблема", "Problem")}</span>
          <p>{data.problem}</p>
        </div>
        <div className={`${styles.card} ${styles.cardAccent}`}>
          <span>{tr("Решение", "Solution")}</span>
          <p>{data.solution}</p>
        </div>
      </div>

      <ol className={styles.steps}>
        {data.steps.map((step, index) => (
          <li key={step.title}>
            <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.prompt && (
                <figure className={styles.prompt}>
                  <figcaption>{tr("Промпт", "Prompt")}</figcaption>
                  <pre>{step.prompt}</pre>
                </figure>
              )}
              {step.image && (
                <button type="button" className={styles.image} onClick={() => onZoom?.(step.image!)}>
                  <Image src={step.image.src} alt={step.image.alt} width={1200} height={750} unoptimized />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {data.results && data.results.length > 0 && (
        <dl className={styles.results}>
          {data.results.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {data.lessons && data.lessons.length > 0 && (
        <div className={styles.lessons}>
          <span>{tr("Что я вынес", "What I learned")}</span>
          <ul>{data.lessons.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
