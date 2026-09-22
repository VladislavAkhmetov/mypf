"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { site } from "@/data/site";
import { toolsList } from "@/data/tools";
import { useLocale } from "@/lib/i18n";
import { PORTFOLIO_DIRECTIONS, type FocusDirection } from "@/lib/xp/navigation";
import styles from "./portfolio-landing.module.css";

interface PortfolioLandingProps {
  projects: Project[];
  focus: FocusDirection | null;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onFocusChange: (focus: FocusDirection | null) => void;
  onOpenProject: (slug: string) => void;
  onOpenTool: (slug: string) => void;
  notFound?: boolean;
}

const intro = "Создаю визуальные системы и интерфейсы. Соединяю дизайн и код, чтобы идеи становились работающими вещами.";
const toolPresentation: Record<string, { art: string; title: string; caption: string }> = {
  "figma-auto-kern": { art: "Аа", title: "Auto-Bézier Kern", caption: "Кернинг без ручных правок" },
  "ai-vector-slicer": { art: "✳", title: "Vector Slicer", caption: "Кривые точно по направляющим" },
  "oklch-harmonizer": { art: "", title: "Oklch Palette", caption: "Цвет с правильным контрастом" },
  "specimen-blueprint": { art: "Ag", title: "Type Specimen", caption: "Сетка для шрифтовых каталогов" },
};

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}

export function PortfolioLanding({ projects, focus, scrollContainer, onFocusChange, onOpenProject, onOpenTool, notFound }: PortfolioLandingProps) {
  const { t, locale } = useLocale();
  const introRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.min(1, projects.length - 1));
  const activeIndexRef = useRef(activeIndex);
  const drag = useRef({ active: false, start: 0, left: 0, distance: 0 });

  // Scroll progress belongs to the IE window, not the outer desktop page.
  useEffect(() => {
    const viewport = scrollContainer.current;
    const introElement = introRef.current;
    if (!viewport || !introElement) return;
    const words = introElement.querySelectorAll<HTMLElement>("[data-word]");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const bounds = introElement.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, .4 + viewport.scrollTop / Math.max(bounds.height * .85, 1)));
      words.forEach((word, i) => {
        const amount = preference.matches ? 1 : Math.max(0, Math.min(1, progress * 2 - i / words.length));
        word.style.setProperty("--word-opacity", String(.32 + amount * .68));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const resize = new ResizeObserver(schedule);
    resize.observe(viewport);
    viewport.addEventListener("scroll", schedule, { passive: true });
    preference.addEventListener("change", schedule);
    paint();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewport.removeEventListener("scroll", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, [scrollContainer]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const cards = Array.from(slider.querySelectorAll<HTMLElement>("[data-project-card]"));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const center = slider.scrollLeft + slider.clientWidth / 2;
      let nearest = 0;
      let minDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        const proximity = Math.max(0, 1 - distance / (card.offsetWidth * 1.35));
        card.style.setProperty("--card-scale", String(.78 + proximity * .22));
        card.style.setProperty("--card-opacity", String(.55 + proximity * .45));
        if (distance < minDistance) { minDistance = distance; nearest = index; }
      });
      activeIndexRef.current = nearest;
      setActiveIndex(nearest);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const centerCard = (index: number) => {
      const card = cards[index];
      if (card) slider.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - slider.clientWidth / 2, behavior: "instant" });
      measure();
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? slider.clientWidth : 1);
      const max = slider.scrollWidth - slider.clientWidth;
      if ((delta > 0 && slider.scrollLeft < max - 2) || (delta < 0 && slider.scrollLeft > 2)) {
        event.preventDefault();
        slider.scrollLeft += delta;
      }
    };
    centerCard(Math.min(1, cards.length - 1));
    const resize = new ResizeObserver(() => centerCard(activeIndexRef.current));
    resize.observe(slider);
    slider.addEventListener("scroll", schedule, { passive: true });
    slider.addEventListener("wheel", wheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      slider.removeEventListener("scroll", schedule);
      slider.removeEventListener("wheel", wheel);
    };
  }, [projects]);

  const goToCard = (index: number) => {
    const slider = sliderRef.current;
    const card = slider?.querySelectorAll<HTMLElement>("[data-project-card]")[index];
    if (!slider || !card) return;
    slider.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - slider.clientWidth / 2, behavior: scrollBehavior() });
  };

  const jumpTo = (target: HTMLElement | null) => {
    const viewport = scrollContainer.current;
    if (!target || !viewport) return;
    viewport.scrollTo({ top: viewport.scrollTop + target.getBoundingClientRect().top - viewport.getBoundingClientRect().top, behavior: scrollBehavior() });
  };

  const endDrag = () => {
    drag.current.active = false;
    if (sliderRef.current) sliderRef.current.dataset.dragging = "false";
  };

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <a href={site.telegram} target="_blank" rel="noreferrer" className={styles.wordmark} aria-label="amazi — Telegram">amazi<span>✳</span></a>
        <nav aria-label="Разделы портфолио">
          <button type="button" onClick={() => jumpTo(worksRef.current)}>Проекты</button>
          <button type="button" onClick={() => jumpTo(toolsRef.current)}>Инструменты</button>
          <a href={site.telegram} target="_blank" rel="noreferrer">Связаться <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <section className={styles.about} aria-label="Обо мне">
        <div className={styles.sideNote}><span className={styles.spark} aria-hidden="true">✳</span><span>Независимый дизайнер<br />На стыке формы и кода</span></div>
        <div ref={introRef} className={styles.intro}>
          <h1>Влад Ахметов<span className={styles.nameDot}>.</span></h1>
          <p className={styles.introText}>{intro.split(" ").map((word, index) => (
            <span key={index}>{index === 5 && <span className={styles.orangeObject} aria-hidden="true" />}<span data-word>{word}</span>{" "}</span>
          ))}</p>
          <span className={styles.introFootnote}>Дизайн, который не только выглядит, но и работает.</span>
        </div>
      </section>
      <section ref={worksRef} className={styles.works} aria-label="Проекты">
        <div className={styles.sectionLine}><h2>Избранные проекты <span>/{String(projects.length).padStart(2, "0")}</span></h2><span>Листайте и открывайте <span aria-hidden="true">↔</span></span></div>
        {focus && <div className={styles.focusNotice}>{PORTFOLIO_DIRECTIONS[focus].title}<button type="button" onClick={() => onFocusChange(null)}>Все проекты ↗</button></div>}
        {notFound && <p className={styles.notice} role="alert">Проект не найден. Здесь можно посмотреть другие работы.</p>}
        <div ref={sliderRef} className={styles.carousel} role="region" aria-roledescription="карусель" aria-label="Лента проектов" tabIndex={0}
          onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const index = event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : activeIndex + (event.key === "ArrowRight" ? 1 : -1);
            goToCard(Math.max(0, Math.min(projects.length - 1, index)));
          }}
          onPointerDown={event => {
            drag.current.distance = 0;
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            drag.current = { active: true, start: event.clientX, left: event.currentTarget.scrollLeft, distance: 0 };
          }}
          onPointerMove={event => {
            if (!drag.current.active) return;
            const distance = event.clientX - drag.current.start;
            drag.current.distance = Math.max(drag.current.distance, Math.abs(distance));
            if (drag.current.distance > 6) {
              event.currentTarget.dataset.dragging = "true";
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.scrollLeft = drag.current.left - distance;
            }
          }}
          onPointerUp={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            endDrag();
          }}
          onPointerCancel={endDrag} onLostPointerCapture={endDrag}
          onClickCapture={event => { if (drag.current.distance > 6 && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
        >
          {projects.map((project, index) => (
            <article key={project.slug} className={styles.projectCard} data-project-card data-active={index === activeIndex}>
              <button type="button" className={styles.projectButton} aria-label={`Открыть кейс ${project.title}`} onClick={() => onOpenProject(project.slug)} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) goToCard(index); }}>
                <Image src={project.cover} alt="" fill sizes="(max-width: 640px) 75vw, 390px" className={styles.cover} unoptimized draggable={false} />
                <span className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{project.year}</span></span>
                <span className={styles.projectCaption}><span className={styles.projectCategory}>{project.tags[locale].slice(0, 2).join(" / ")}</span><span className={styles.projectTitle}>{project.title}</span><span className={styles.projectDescription}>{t(project.kicker)}</span></span>
                <span className={styles.openProject} aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
        <div className={styles.carouselBottom}>
          <span className={styles.carouselHint}>Идеи, ставшие реальностью</span>
          <div className={styles.carouselControls}>
            <button type="button" aria-label="Предыдущие проекты" disabled={activeIndex <= 0} onClick={() => goToCard(activeIndex - 1)}>←</button>
            <button type="button" aria-label="Следующие проекты" disabled={activeIndex >= projects.length - 1} onClick={() => goToCard(activeIndex + 1)}>→</button>
          </div>
          <span className={styles.counter} aria-live="polite" aria-atomic="true">{String(activeIndex + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span></span>
        </div>
      </section>
      <section ref={toolsRef} className={styles.tools} aria-labelledby="portfolio-tools-title">
        <div className={styles.toolsEyebrow}><span aria-hidden="true">✳</span> Сделано для дизайнеров</div>
        <h2 id="portfolio-tools-title">Меньше рутины.<br />Больше <span>дизайна.</span></h2>
        <p className={styles.toolsIntro}>Инструменты, которых мне не хватало.<br />Теперь ими можете пользоваться и вы.</p>
        <div className={styles.toolsGrid}>
          <button type="button" className={`${styles.toolCard} ${styles.featuredTool}`} onClick={() => onOpenProject("printforge")} aria-label="Подробнее о PrintForge">
            <span className={styles.toolTag}>Figma · Плагин</span><span className={styles.printArt} aria-hidden="true"><i /><i /><i /><i /></span>
            <span className={styles.toolTitle}>PrintForge</span><span className={styles.toolTagline}>Из Figma — в печать</span><span className={styles.toolArrow} aria-hidden="true">↗</span>
          </button>
          {toolsList.map(tool => (
            <button type="button" key={tool.id} className={styles.toolCard} data-tool-art={tool.platform} aria-label={`Подробнее о ${tool.title}`} onClick={() => onOpenTool(tool.slug)}>
              <span className={styles.toolTag}>{tool.platformLabel}</span>
              <span className={styles.toolArt} aria-hidden="true">{toolPresentation[tool.id]?.art}{tool.platform === "web" && <span className={styles.palette}><i /><i /><i /><i /><i /></span>}</span>
              <span className={styles.toolTitle}>{toolPresentation[tool.id]?.title ?? tool.title}</span>
              <span className={styles.toolTagline}>{toolPresentation[tool.id]?.caption ?? tool.tagline}</span>
              <span className={styles.toolArrow} aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div className={styles.toolsBottom}><span>От маленькой задачи — к своему инструменту.</span><span>Figma / Illustrator / Web</span></div>
      </section>
      <footer className={styles.contact}>
        <div><span className={styles.contactLabel}>Есть интересная задача?</span><a className={styles.contactTitle} href={site.telegram} target="_blank" rel="noreferrer">Давайте обсудим <span aria-hidden="true">↗</span></a></div>
        <div className={styles.contactBottom}><span>© {site.name} · {new Date().getFullYear()}</span><a href={`mailto:${site.email}`}>{site.email}</a><button type="button" onClick={() => scrollContainer.current?.scrollTo({ top: 0, behavior: scrollBehavior() })}>Наверх ↑</button></div>
      </footer>
    </div>
  );
}
