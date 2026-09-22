"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { careerMilestones } from "@/data/career";
import styles from "./portfolio-landing.module.css";

export function CareerTimeline({ scrollContainer }: { scrollContainer: RefObject<HTMLDivElement | null> }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0 });
  const [paused, setPaused] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const element = section.current;
    const rail = track.current;
    if (!element || !rail) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    }, { root: scrollContainer.current });
    observer.observe(element);
    const measure = () => setEdges({ start: rail.scrollLeft < 2, end: rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2 });
    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    rail.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { observer.disconnect(); resize.disconnect(); rail.removeEventListener("scroll", measure); };
  }, [scrollContainer]);

  const move = (direction: number) => {
    const rail = track.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? 300) + parseFloat(getComputedStyle(rail).columnGap)), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <section ref={section} className={styles.career} aria-labelledby="career-title" data-paused={paused} data-visible="false">
      <div className={styles.careerHeading}>
        <div><p className={styles.careerEyebrow}>2011 — н. в. / Профессиональный путь</p><h2 id="career-title">Путь в дизайне<span>.</span></h2></div>
        <div className={styles.careerActions}>
          <button type="button" className={styles.motionToggle} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Вращать лого" : "Пауза лого"}</button>
          <div className={styles.carouselControls}>
            <button type="button" aria-label="Предыдущий этап карьеры" disabled={edges.start} onClick={() => move(-1)}>←</button>
            <button type="button" aria-label="Следующий этап карьеры" disabled={edges.end} onClick={() => move(1)}>→</button>
          </div>
        </div>
      </div>
      <ol ref={track} className={styles.careerTrack} tabIndex={0} aria-label="Этапы карьеры — черновик"
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          if (event.key === "Home" || event.key === "End") event.currentTarget.scrollTo({ left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth, behavior: "instant" });
          else move(event.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={event => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = { active: true, x: event.clientX, left: event.currentTarget.scrollLeft };
        }}
        onPointerMove={event => {
          if (!drag.current.active || Math.abs(event.clientX - drag.current.x) < 5) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.dragging = "true";
          event.currentTarget.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
        }}
        onPointerUp={event => {
          drag.current.active = false;
          event.currentTarget.dataset.dragging = "false";
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={event => { drag.current.active = false; event.currentTarget.dataset.dragging = "false"; }}
        onLostPointerCapture={event => { drag.current.active = false; event.currentTarget.dataset.dragging = "false"; }}
      >
        {careerMilestones.map((milestone, index) => (
          <li key={milestone.year} className={styles.careerItem} style={{ "--phase": `${index * -3.7}s` } as CSSProperties}>
            <p className={styles.careerYear}>{milestone.year}</p>
            <div className={styles.logoStage} aria-hidden="true">
              <div className={styles.logoCube}>
                {Array.from({ length: 6 }, (_, face) => <span key={face} className={styles.logoFace}>{milestone.mark}</span>)}
              </div>
            </div>
            <h3>{milestone.company}</h3>
            <p className={styles.careerDescription}>{milestone.description}</p>
          </li>
        ))}
      </ol>
      <p className={styles.careerDraft}>Черновик: компании, промежуточные даты и описания — для примера.</p>
    </section>
  );
}
