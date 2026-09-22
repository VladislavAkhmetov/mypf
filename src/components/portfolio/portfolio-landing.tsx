"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";
import { PORTFOLIO_DIRECTIONS, type FocusDirection } from "@/lib/xp/navigation";
import styles from "./portfolio-landing.module.css";

interface PortfolioLandingProps {
  projects: Project[];
  focus: FocusDirection | null;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onFocusChange: (focus: FocusDirection | null) => void;
  onOpenProject: (slug: string) => void;
  notFound?: boolean;
}

/** Original vector sculpture: reflective ribbons, independent of project imagery. */
function ChromeSculpture() {
  const id = useId().replaceAll(":", "");
  return (
    <svg viewBox="0 0 860 520" fill="none" className={styles.sculpture} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-metal`} x1="355" y1="72" x2="505" y2="432" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f3fdff" /><stop offset=".17" stopColor="#a6c5d1" />
          <stop offset=".28" stopColor="#f7ffff" /><stop offset=".36" stopColor="#7095a8" />
          <stop offset=".44" stopColor="#213c50" /><stop offset=".48" stopColor="#091b2f" />
          <stop offset=".5" stopColor="#d1f2ff" /><stop offset=".6" stopColor="#fff" />
          <stop offset=".72" stopColor="#7099b0" /><stop offset=".85" stopColor="#132c40" />
          <stop offset="1" stopColor="#b5dded" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="205" y1="130" x2="650" y2="380" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" /><stop offset=".4" stopColor="#437f99" />
          <stop offset=".6" stopColor="#e9ffff" /><stop offset="1" stopColor="#567b90" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-50%" width="160%" height="220%">
          <feDropShadow dx="0" dy="25" stdDeviation="17" floodColor="#001326" floodOpacity=".55" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path fill={`url(#${id}-metal)`} fillRule="evenodd" clipRule="evenodd" d="M430 92C591 31 751 83 739 208C727 331 553 444 383 439C216 434 116 352 160 256C179 215 224 190 281 184C211 226 211 278 269 307C347 347 486 318 571 259C643 209 645 161 596 147C555 135 499 147 453 171L430 92Z" />
        <path d="M430 92C591 31 751 83 739 208C727 331 553 444 383 439C216 434 116 352 160 256" stroke={`url(#${id}-edge)`} strokeWidth="3" />
        <path fill={`url(#${id}-metal)`} fillRule="evenodd" clipRule="evenodd" d="M304 95C366 32 445 52 490 142L601 365C622 408 601 449 561 455C525 461 502 439 484 404L376 190C365 168 354 163 344 175L261 277L187 259L304 95Z" />
        <path d="M305 96C365 36 442 54 486 143L597 367C614 402 601 438 568 449" stroke={`url(#${id}-edge)`} strokeWidth="3" />
        <path d="M249 300C300 330 362 342 434 334C530 324 619 269 661 215" stroke="#edffff" strokeOpacity=".65" strokeWidth="2" />
        <path d="M334 170C352 144 368 146 384 176L492 391" stroke="#f2fcff" strokeOpacity=".7" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function PortfolioLanding({ projects, focus, scrollContainer, onFocusChange, onOpenProject, notFound }: PortfolioLandingProps) {
  const { t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState(true);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const draggedDistanceRef = useRef(0);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = el.scrollLeft;
    setCanScrollPrev(current > 2);
    setCanScrollNext(current < maxScroll - 2);
    setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, current / maxScroll)) : 0);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (maxScroll <= 0) return;

      const scrollingRight = e.deltaY > 0;
      const scrollingLeft = e.deltaY < 0;

      const canRight = slider.scrollLeft < maxScroll - 2;
      const canLeft = slider.scrollLeft > 2;

      if ((scrollingRight && canRight) || (scrollingLeft && canLeft)) {
        e.preventDefault();
        slider.scrollLeft = Math.max(0, Math.min(maxScroll, slider.scrollLeft + e.deltaY));
        updateScrollState();
      }
    };

    slider.addEventListener("wheel", onWheel, { passive: false });
    slider.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    updateScrollState();

    return () => {
      slider.removeEventListener("wheel", onWheel);
      slider.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [projects]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    updateScrollState();
  }, [focus, projects]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const slider = sliderRef.current;
    if (!slider) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = slider.scrollLeft;
    draggedDistanceRef.current = 0;
    slider.style.cursor = "grabbing";
    slider.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const slider = sliderRef.current;
    if (!slider) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = x - startXRef.current;
    draggedDistanceRef.current = Math.abs(walk);
    slider.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "";
      sliderRef.current.style.userSelect = "";
    }
  };

  const handleCardClick = (slug: string) => {
    if (draggedDistanceRef.current > 6) {
      return;
    }
    onOpenProject(slug);
  };

  const scrollByAmount = (direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector<HTMLElement>(`.${styles.carouselCard}`);
    const step = card ? card.offsetWidth + 26 : 380;
    slider.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: effects && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant",
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    const viewport = scrollContainer.current;
    if (!root || !viewport) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = new ResizeObserver(() => root.style.setProperty("--portfolio-viewport-height", `${viewport.clientHeight}px`));
    root.style.setProperty("--portfolio-viewport-height", `${viewport.clientHeight}px`);
    resize.observe(viewport);
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const paint = () => {
      frame = 0;
      const shift = Math.min(viewport.scrollTop, 1000);
      root.style.setProperty("--scene-shift", `${shift * .18}px`);
      root.style.setProperty("--scene-turn", `${shift * -.012}deg`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const configure = () => {
      observer?.disconnect();
      viewport.removeEventListener("scroll", onScroll);
      root.dataset.motion = String(effects && !preference.matches);
      if (effects && !preference.matches) {
        viewport.addEventListener("scroll", onScroll, { passive: true });
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).dataset.revealed = "true";
              if (entry.target === worksRef.current) {
                worksRef.current?.querySelectorAll("[data-reveal]").forEach(el => {
                  (el as HTMLElement).dataset.revealed = "true";
                });
              }
              observer?.unobserve(entry.target);
            }
          });
        }, { root: viewport, threshold: .08 });
        root.querySelectorAll("[data-reveal]").forEach(element => observer?.observe(element));
        if (worksRef.current) observer.observe(worksRef.current);
        paint();
      } else {
        root.style.setProperty("--scene-shift", "0px");
        root.style.setProperty("--scene-turn", "0deg");
      }
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      resize.disconnect();
      viewport.removeEventListener("scroll", onScroll);
      preference.removeEventListener("change", configure);
      cancelAnimationFrame(frame);
    };
  }, [effects, scrollContainer, focus]);

  const jumpTo = (target: HTMLElement | null) => {
    const viewport = scrollContainer.current;
    if (!target || !viewport) return;
    const top = viewport.scrollTop + target.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
    viewport.scrollTo({ top, behavior: effects && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
  };

  return (
    <div ref={rootRef} className={styles.landing} data-effects={effects}>
      <section className={styles.hero} aria-label="Влад Ахметов — портфолио">
        <div className={styles.atmosphere} aria-hidden="true" />
        <header className={styles.header}>
          <span className={styles.wordmark}>
            amazi<span className={styles.asterisk}>✳</span>
          </span>
          <nav aria-label="Разделы портфолио">
            <button type="button" onClick={() => jumpTo(worksRef.current)}>Работы</button>
            <button type="button" onClick={() => jumpTo(contactRef.current)} className={styles.contactNav}>
              Связаться <span className={styles.statusDot} />
            </button>
          </nav>
        </header>

        <div className={styles.heroTitle}>
          <h1>
            Влад Ахметов<span className={styles.titleDot} aria-hidden="true">↗</span>
          </h1>
        </div>

        <div className={styles.artwork}>
          <ChromeSculpture />
        </div>

        <div className={styles.heroBottom}>
          <button
            type="button"
            className={styles.discover}
            onClick={() => jumpTo(worksRef.current)}
            aria-label="К работам"
          >
            <span className={styles.discoverArrow} aria-hidden="true">↙</span>
          </button>
          <button
            type="button"
            className={styles.fxToggle}
            aria-pressed={effects}
            aria-label={effects ? "Выключить эффекты" : "Включить эффекты"}
            onClick={() => setEffects((value) => !value)}
          >
            FX
          </button>
        </div>

        <div className={styles.scanlines} aria-hidden="true" />
      </section>

      <section ref={worksRef} className={styles.works} aria-label="Проекты">
        <div className={styles.sectionHeading}>
          <h2>
            Работы<span>{projects.length.toString().padStart(2, "0")}</span>
          </h2>
        </div>

        <div className={styles.filters} role="group" aria-label="Направления работ">
          <button type="button" aria-pressed={!focus} onClick={() => onFocusChange(null)}>
            Все проекты <sup>{projects.length}</sup>
          </button>
          <button
            type="button"
            aria-pressed={focus === "communication"}
            onClick={() => onFocusChange("communication")}
          >
            Коммуникационный дизайн <sup>{PORTFOLIO_DIRECTIONS.communication.slugs.length}</sup>
          </button>
          <button
            type="button"
            aria-pressed={focus === "engineering"}
            onClick={() => onFocusChange("engineering")}
          >
            Интерфейсы и прототипы <sup>{PORTFOLIO_DIRECTIONS.engineering.slugs.length}</sup>
          </button>
        </div>

        {notFound && (
          <p className={styles.notice} role="alert">
            Проект не найден. Здесь можно посмотреть другие работы.
          </p>
        )}

        <div className={styles.carouselWrapper}>
          <div
            ref={sliderRef}
            className={styles.carouselSlider}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {projects.map((project, index) => (
              <article className={styles.carouselCard} key={project.slug} data-reveal>
                <button
                  type="button"
                  className={styles.projectButton}
                  onClick={() => handleCardClick(project.slug)}
                  aria-label={`Открыть кейс ${project.title}`}
                >
                  <div
                    className={styles.projectImage}
                    onMouseEnter={(e) => {
                      const v = e.currentTarget.querySelector("video");
                      if (v) v.play().catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      const v = e.currentTarget.querySelector("video");
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
                    <Image
                      src={project.cover}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 85vw, 420px"
                      className={styles.cover}
                      unoptimized
                      draggable={false}
                    />
                    {project.video && (
                      <video
                        src={project.video}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={styles.videoPreview}
                        aria-hidden="true"
                      />
                    )}
                    {project.motif === "honeycomb" && (
                      <div className={styles.honeyCardGlow} aria-hidden="true" />
                    )}
                    <div className={styles.projectImageHeader}>
                      <span className={styles.projectNumber}>
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <span className={styles.openProject} aria-hidden="true">↗</span>
                  </div>

                  <div className={styles.projectCaption}>
                    <h3>{project.title}</h3>
                    <p>{t(project.kicker)}</p>
                  </div>
                </button>
              </article>
            ))}
          </div>

          <div className={styles.carouselBottomBar}>
            <div className={styles.carouselTrack}>
              <div
                className={styles.carouselThumb}
                style={{
                  width: `${Math.max(15, 100 / Math.max(1, projects.length))}%`,
                  transform: `translateX(${
                    scrollProgress * (projects.length > 1 ? (projects.length - 1) * 100 : 0)
                  }%)`,
                }}
              />
            </div>

            <div className={styles.roundButtonsGroup}>
              <button
                type="button"
                className={styles.roundNavBtn}
                onClick={() => scrollByAmount("prev")}
                disabled={!canScrollPrev}
                aria-label="Предыдущие проекты"
                title="Предыдущие"
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.roundNavBtn}
                onClick={() => scrollByAmount("next")}
                disabled={!canScrollNext}
                aria-label="Следующие проекты"
                title="Следующие"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer ref={contactRef} className={styles.contact}>
        <a className={styles.contactTitle} href={site.telegram} target="_blank" rel="noreferrer">
          Telegram<span>↗</span>
        </a>
        <div className={styles.contactBottom}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <button
            type="button"
            onClick={() => scrollContainer.current?.scrollTo({ top: 0, behavior: "instant" })}
            aria-label="Наверх"
          >
            ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
