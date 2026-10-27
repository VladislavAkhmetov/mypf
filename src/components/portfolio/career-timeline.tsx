"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { careerMilestones } from "@/data/career";
import styles from "./portfolio-landing.module.css";

export function CareerTimeline({ scrollContainer }: { scrollContainer: RefObject<HTMLDivElement | null> }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const drag = useRef({ active: false, x: 0, left: 0, moved: false });
  const [edges, setEdges] = useState({ start: true, end: false });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const element = section.current;
    const rail = track.current;
    if (!element || !rail) return;

    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    }, { root: scrollContainer.current });
    observer.observe(element);

    const measure = () => {
      const isStart = rail.scrollLeft < 4;
      const isEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
      setEdges({ start: isStart, end: isEnd });

      const cards = Array.from(rail.children) as HTMLElement[];
      const railLeft = rail.scrollLeft;
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, idx) => {
        const diff = Math.abs(card.offsetLeft - railLeft - 32);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    };

    const resize = new ResizeObserver(measure);
    resize.observe(rail);
    rail.addEventListener("scroll", measure, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      resize.disconnect();
      rail.removeEventListener("scroll", measure);
    };
  }, [scrollContainer]);

  const move = (direction: number) => {
    const rail = track.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(rail).columnGap || "28");
    const shift = (card?.offsetWidth ?? 280) + gap;
    rail.scrollBy({
      left: direction * shift,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const rail = track.current;
    if (!rail) return;
    const cards = rail.children;
    const target = cards[index] as HTMLElement | null;
    if (!target) return;
    const padLeft = parseFloat(getComputedStyle(rail).paddingLeft || "32");
    rail.scrollTo({
      left: target.offsetLeft - padLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const endDrag = () => {
    drag.current.active = false;
    if (track.current) track.current.dataset.dragging = "false";
  };

  return (
    <section ref={section} className={styles.career} aria-labelledby="career-title" data-visible="false">
      <div className={styles.careerHeading}>
        <div>
          <p className={styles.careerEyebrow}>2011 — н. в. / Профессиональный путь</p>
          <h2 id="career-title">Путь в дизайне<span>.</span></h2>
        </div>
        <div className={styles.careerActions}>
          <div className={styles.carouselControls}>
            <button type="button" aria-label="Предыдущий этап карьеры" disabled={edges.start} onClick={() => move(-1)}>←</button>
            <button type="button" aria-label="Следующий этап карьеры" disabled={edges.end} onClick={() => move(1)}>→</button>
          </div>
        </div>
      </div>

      <ol
        ref={track}
        className={styles.careerTrack}
        tabIndex={0}
        aria-label="Этапы карьеры"
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          if (event.key === "Home") scrollToIndex(0);
          else if (event.key === "End") scrollToIndex(careerMilestones.length - 1);
          else move(event.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={event => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = { active: true, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={event => {
          if (!drag.current.active) return;
          const diff = event.clientX - drag.current.x;
          if (Math.abs(diff) > 5) {
            drag.current.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.dataset.dragging = "true";
            event.currentTarget.scrollLeft = drag.current.left - diff;
          }
        }}
        onPointerUp={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          endDrag();
        }}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onClickCapture={event => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {careerMilestones.map((milestone, index) => {
          const isCurrent = milestone.year === "Сейчас" || milestone.year.toLowerCase().includes("сейчас");
          const isActive = index === activeIndex;
          return (
            <li
              key={milestone.year}
              className={styles.careerItem}
              data-active={isActive}
              data-current={isCurrent}
              style={{ "--phase": `${index * -3.7}s` } as CSSProperties}
              onClick={() => scrollToIndex(index)}
            >
              <div className={styles.scaleHeader}>
                <div className={styles.scaleMeta}>
                  <span className={styles.careerYear}>{milestone.year}</span>
                </div>
                <div className={styles.scaleTrack} aria-hidden="true">
                  <span className={styles.nodeDot} />
                  <div className={styles.scaleTicks}>
                    <span className={styles.scaleTick} />
                    <span className={styles.scaleTick} />
                    <span className={styles.scaleTick} />
                    <span className={styles.scaleTick} data-mid="true" />
                    <span className={styles.scaleTick} />
                    <span className={styles.scaleTick} />
                    <span className={styles.scaleTick} />
                  </div>
                </div>
              </div>

              <div className={styles.careerCard}>
                <div className={styles.logoStage} aria-hidden="true">
                  <div className={styles.logoCube}>
                    {Array.from({ length: 6 }, (_, face) => (
                      <span key={face} className={styles.logoFace}>
                        {milestone.mark}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className={styles.careerCompany}>{milestone.company}</h3>
                <p className={styles.careerDescription}>{milestone.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={styles.careerDraft}>Черновик: компании, промежуточные даты и описания — для примера.</p>
    </section>
  );
}
