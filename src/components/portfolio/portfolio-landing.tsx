"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { site } from "@/data/site";
import { figmaPlugins } from "@/data/figma-plugins";
import { useLocale } from "@/lib/i18n";
import { PORTFOLIO_DIRECTIONS, type FocusDirection } from "@/lib/xp/navigation";
import styles from "./portfolio-landing.module.css";
import { CareerTimeline } from "./career-timeline";

interface PortfolioLandingProps {
  projects: Project[];
  focus: FocusDirection | null;
  scrollContainer: RefObject<HTMLDivElement | null>;
  onFocusChange: (focus: FocusDirection | null) => void;
  onOpenProject: (slug: string) => void;
  onOpenTool: (slug: string) => void;
  notFound?: boolean;
}

const intro = {
  ru: "Создаю визуальные системы и интерфейсы. Соединяю дизайн и код, чтобы идеи становились работающими вещами.",
  en: "I build visual systems and interfaces, bringing design and code together so ideas become working things.",
};

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}

export function PortfolioLanding({ projects, focus, scrollContainer, onFocusChange, onOpenProject, notFound }: PortfolioLandingProps) {
  const { t, tr, locale } = useLocale();
  const introRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [openPlugin, setOpenPlugin] = useState<string | null>(null);
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

  const endDrag = () => {
    drag.current.active = false;
    if (sliderRef.current) sliderRef.current.dataset.dragging = "false";
  };

  return (
    <div className={styles.landing}>
      <section className={styles.about} aria-label={tr("Обо мне", "About me")}>
        <div ref={introRef} className={styles.intro}>
          <h1>{tr(site.name, site.nameEn)}<span className={styles.nameDot}>.</span></h1>
          <p className={styles.introText}>{t(intro).split(" ").map((word, index) => (
            <span key={index}>{index === 5 && <span className={styles.orangeObject} aria-hidden="true" />}<span data-word>{word}</span>{" "}</span>
          ))}</p>
        </div>
      </section>
      <section className={styles.works} aria-label={tr("Проекты", "Projects")}>
        {focus && <div className={styles.focusNotice}>{t(PORTFOLIO_DIRECTIONS[focus].title)}<button type="button" onClick={() => onFocusChange(null)}>{tr("Все проекты ↗", "All projects ↗")}</button></div>}
        {notFound && <p className={styles.notice} role="alert">{tr("Проект не найден. Здесь можно посмотреть другие работы.", "Project not found. Here are other works.")}</p>}
        <div ref={sliderRef} className={styles.carousel} role="region" aria-roledescription={tr("карусель", "carousel")} aria-label={tr("Лента проектов", "Projects")} tabIndex={0}
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
              <button type="button" className={styles.projectButton} aria-label={`${tr("Открыть кейс", "Open case")} ${project.title}`} onClick={() => onOpenProject(project.slug)} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) goToCard(index); }}>
                <Image src={project.cover} alt="" fill sizes="(max-width: 640px) 75vw, 390px" className={styles.cover} unoptimized draggable={false} />
                <span className={styles.cardTop}><span>{String(index + 1).padStart(2, "0")}</span><span>{project.year}</span></span>
                <span className={styles.projectCaption}><span className={styles.projectCategory}>{project.tags[locale].slice(0, 2).join(" / ")}</span><span className={styles.projectTitle}>{project.title}</span><span className={styles.projectDescription}>{t(project.kicker)}</span></span>
                <span className={styles.openProject} aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
        <div className={styles.carouselBottom}>
          <div className={styles.carouselControls}>
            <button type="button" aria-label={tr("Предыдущие проекты", "Previous projects")} disabled={activeIndex <= 0} onClick={() => goToCard(activeIndex - 1)}>←</button>
            <button type="button" aria-label={tr("Следующие проекты", "Next projects")} disabled={activeIndex >= projects.length - 1} onClick={() => goToCard(activeIndex + 1)}>→</button>
          </div>
          <span className={styles.counter} aria-live="polite" aria-atomic="true">{String(activeIndex + 1).padStart(2, "0")} <span>/ {String(projects.length).padStart(2, "0")}</span></span>
        </div>
      </section>
      <CareerTimeline scrollContainer={scrollContainer} />
      <section className={styles.tools} aria-labelledby="portfolio-tools-title">
        <h2 id="portfolio-tools-title">{tr("Меньше рутины.", "Less routine.")}<br />{tr("Больше", "More")} <span>{tr("дизайна.", "design.")}</span></h2>
        <div className={styles.plugins}>
          <div className={styles.pluginsHead}><span>{tr("Мои плагины", "My plugins")}</span><span>Figma Community</span></div>
          <ul className={styles.pluginList}>
            {figmaPlugins.map(plugin => {
              const open = openPlugin === plugin.id;
              return (
                <li key={plugin.id} className={styles.pluginItem} data-open={open}>
                  <button type="button" className={styles.pluginRow} aria-expanded={open} aria-controls={`plugin-${plugin.id}`} onClick={() => setOpenPlugin(open ? null : plugin.id)}>
                    <span className={styles.pluginName}>{plugin.name}</span>
                    <span className={styles.pluginCaption}>{t(plugin.caption)}</span>
                    <span className={styles.pluginArrow} aria-hidden="true">+</span>
                  </button>
                  <div id={`plugin-${plugin.id}`} className={styles.pluginPanel} role="region" aria-label={plugin.name} inert={!open}>
                    <div className={styles.pluginPanelInner}>
                      <div><h3>{tr("Боль", "Pain")}</h3><p>{t(plugin.pain)}</p></div>
                      <div><h3>{tr("Решение", "Solution")}</h3><p>{t(plugin.solution)}</p></div>
                      <a className={styles.pluginLink} href={plugin.url} target="_blank" rel="noopener noreferrer">{tr("Открыть в Figma Community", "Open in Figma Community")} <span aria-hidden="true">↗</span></a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <footer className={styles.contact}>
        <div><span className={styles.contactLabel}>{tr("Есть интересная задача?", "Have an interesting project?")}</span><a className={styles.contactTitle} href={site.telegram} target="_blank" rel="noreferrer">{tr("Давайте обсудим", "Let's talk")} <span aria-hidden="true">↗</span></a></div>
        <div className={styles.contactBottom}><span>© {tr(site.name, site.nameEn)} · {new Date().getFullYear()}</span><a href={`mailto:${site.email}`}>{site.email}</a><button type="button" onClick={() => scrollContainer.current?.scrollTo({ top: 0, behavior: scrollBehavior() })}>{tr("Наверх ↑", "Back to top ↑")}</button></div>
      </footer>
    </div>
  );
}
