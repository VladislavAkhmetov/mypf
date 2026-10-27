import React from "react";
import Image from "next/image";
import type { MakingOf } from "@/data/making-of";
import styles from "./making-of.module.css";

/** "Как это сделано": the process behind a case, in the case page's own visual language. */
export function MakingOfSection({ data, onZoom }: { data: MakingOf; onZoom?: (image: { src: string; alt: string }) => void }) {
  return (
    <section className={styles.section} aria-label="Как это сделано">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Процесс</span>
        <h2>Как это сделано<span>.</span></h2>
      </div>

      <div className={styles.split}>
        <div className={styles.card}>
          <span>Проблема</span>
          <p>{data.problem}</p>
        </div>
        <div className={`${styles.card} ${styles.cardAccent}`}>
          <span>Решение</span>
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
                  <figcaption>Промпт</figcaption>
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
          <span>Что я вынес</span>
          <ul>{data.lessons.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
