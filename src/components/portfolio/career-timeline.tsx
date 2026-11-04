"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { careerMilestones } from "@/data/career";
import { CareerLogo } from "./career-logo";
import styles from "./portfolio-landing.module.css";
import { useLocale } from "@/lib/i18n";

export function CareerTimeline({ scrollContainer }: { scrollContainer: RefObject<HTMLDivElement | null> }) {
  const { t, tr } = useLocale();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const element = section.current;
    const rail = track.current;
    const viewport = scrollContainer.current;
    if (!element || !rail || !viewport) return;

    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    }, { root: viewport });
    observer.observe(element);

    // When the stages don't fit (mobile), scrolling the page down moves the rail left.
    let frame = 0;
    const sync = () => {
      frame = 0;
      const overflow = rail.scrollWidth - rail.clientWidth;
      if (overflow <= 0) return;
      const box = element.getBoundingClientRect();
      const view = viewport.getBoundingClientRect();
      // 0 once ~80% of the section is on screen, 1 as it starts leaving at the top.
      const start = view.bottom - box.height * 0.8;
      const end = view.top - box.height * 0.15;
      const progress = Math.min(1, Math.max(0, (start - box.top) / Math.max(1, start - end)));
      rail.scrollLeft = progress * overflow;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };

    viewport.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(rail);
    sync();

    return () => {
      observer.disconnect();
      resize.disconnect();
      viewport.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, [scrollContainer]);

  return (
    <section ref={section} className={styles.career} aria-labelledby="career-title" data-visible="false">
      <h2 id="career-title" className={styles.visuallyHidden}>{tr("Путь в дизайне", "Path in design")}</h2>
      <ol ref={track} className={styles.careerTrack} aria-label={tr("Этапы карьеры", "Career stages")}>
        {careerMilestones.map((milestone, index) => (
          <li
            key={milestone.year.ru}
            className={styles.careerItem}
            data-current={!!milestone.current}
            style={{ "--phase": `${index * -3.7}s` } as CSSProperties}
          >
            <div className={styles.scaleHeader}>
              <div className={styles.scaleMeta}>
                <span className={styles.careerYear}>{t(milestone.year)}</span>
              </div>
              <div className={styles.scaleTrack} aria-hidden="true">
                <span className={styles.nodeDot} />
                <div className={styles.scaleTicks}>
                  {Array.from({ length: 7 }, (_, tick) => (
                    <span key={tick} className={styles.scaleTick} data-mid={tick === 3 || undefined} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.careerCard}>
              <div className={styles.logoStage} aria-hidden="true">
                <CareerLogo kind={milestone.logo} />
              </div>
              <h3 className={styles.careerCompany}>{t(milestone.company)}</h3>
              <p className={styles.careerRole}>{t(milestone.role)}</p>
              <p className={styles.careerDescription}>{t(milestone.description)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
