"use client";

import { useEffect, useRef, useState } from "react";
import { getMakingOf } from "@/data/making-of";
import { MakingOfSection } from "./making-of";
import { DombroCase } from "./dombro-case";
import { TaskerCase } from "./tasker-case";
import { KroomiCase } from "./kroomi-case";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { toolsFor, type ToolItem } from "@/data/tools";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";
import styles from "./portfolio-detail.module.css";

interface PortfolioDetailProps {
  project?: Project;
  tool?: ToolItem;
  nextProject?: Project | null;
  nextTool?: ToolItem | null;
  onBack: () => void;
  onOpenProject: (slug: string) => void;
  onOpenTool: (slug: string) => void;
}

const printforgeFeatures = [
  { name: { ru: "Макеты", en: "Layouts" }, title: { ru: "От формата до припусков", en: "From format to bleed" }, description: { ru: "Пресеты полиграфии, размеры в миллиметрах и направляющие для безопасной области. Подготовка начинается прямо на холсте Figma.", en: "Print presets, sizes in millimetres and safe-area guides. Prep starts right on the Figma canvas." }, image: "tab_properties_2x.png" },
  { name: { ru: "Цвет", en: "Colour" }, title: { ru: "Цвет под контролем", en: "Colour under control" }, description: { ru: "Конвертация экранного цвета в CMYK, выбор ICC-профиля и проверка палитры документа перед передачей в печать.", en: "Screen colour converted to CMYK, ICC profile selection and a palette check before the file goes to print." }, image: "tab_colors_2x.png" },
  { name: { ru: "Разрешение", en: "Resolution" }, title: { ru: "Каждый пиксель на месте", en: "Every pixel in place" }, description: { ru: "Проверка эффективного разрешения растровых изображений с учётом масштаба макета. Проблемные слои можно найти до отправки в типографию.", en: "Effective resolution check for raster images at the layout's scale. Problem layers show up before the file reaches the printer." }, image: "tab_dpi_2x.png" },
  { name: { ru: "Проверка", en: "Preflight" }, title: { ru: "Последний взгляд перед печатью", en: "A last look before print" }, description: { ru: "Проверка тонких линий, шрифтов, безопасных полей и наложения краски в одном рабочем процессе.", en: "Hairlines, fonts, safe margins and ink overprint checked in one workflow." }, image: "tab_health_2x.png" },
  { name: { ru: "Упаковка", en: "Packaging" }, title: { ru: "Не только плоский лист", en: "More than a flat sheet" }, description: { ru: "Разметка линий резки и биговки, технические слои для отделки и плашечные каналы для подготовки упаковки.", en: "Cut and crease lines, technical layers for finishing and spot channels for packaging prep." }, image: "tab_packaging_2x.png" },
];

function ToolArtwork({ platform }: { platform: ToolItem["platform"] }) {
  return <div className={styles.toolArtwork} data-platform={platform} aria-hidden="true">
    <span className={styles.artCorner}>amazi / tools</span>
    {platform === "web" ? <div className={styles.swatches}>{["#422c27", "#814330", "#b95337", "#ec6843", "#f88c68", "#f8b69a", "#f8dbcb"].map(color => <i key={color} style={{ background: color }} />)}</div>
      : platform === "illustrator" ? <div className={styles.vectorArt}><span>✳</span><i /><i /><i /></div>
      : <span className={styles.typeArt}>{platform === "template" ? "Ag" : "Аа"}</span>}
    <span className={styles.artBottom}>{platform === "web" ? "COLOR / IN BALANCE" : platform === "illustrator" ? "FORM / IN PIECES" : "TYPE / IN DETAIL"}<span>↗</span></span>
  </div>;
}

export function PortfolioDetail({ project, tool, nextProject, nextTool, onBack, onOpenProject, onOpenTool }: PortfolioDetailProps) {
  const { t, tr, locale } = useLocale();
  const [feature, setFeature] = useState(0);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = tool?.title ?? project?.title ?? "";
  const isPrintforge = project?.slug === "printforge";
  const relatedTools = project ? toolsFor(locale).filter(item => item.caseStudySlug === project.slug) : [];
  const featureInfo = printforgeFeatures[feature];
  const makingOfData = getMakingOf(project?.slug);
  // Existing generic Community/Telegram URLs are not download links.
  const toolUrl = tool?.primaryAction.url;
  const hasDirectToolLink = !!toolUrl && toolUrl !== site.telegram && !/^https:\/\/www\.figma\.com\/community\/?$/.test(toolUrl);
  const actionHref = tool ? (hasDirectToolLink ? toolUrl : site.telegram) : project?.href;
  const actionLabel = tool ? (hasDirectToolLink ? tool.primaryAction.label : tr("Запросить инструмент", "Request the tool")) : (project?.linkLabel ? t(project.linkLabel) : tr("Смотреть проект", "View project"));

  useEffect(() => {
    if (zoom) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [zoom]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopyStatus(tr("Ссылка скопирована", "Link copied")); }
    catch { setCopyStatus(tr("Не удалось скопировать. Ссылка доступна в адресной строке браузера.", "Could not copy. The link is in the browser address bar.")); }
  };

  return <article className={styles.page} data-portfolio-detail={tool ? "tool" : "project"}>
    <header className={styles.header}>
      <button type="button" onClick={onBack} className={styles.wordmark} aria-label={tr("На главную портфолио", "Portfolio home")}>amazi<span>✳</span></button>
      <nav aria-label={tr("Навигация по кейсу", "Case navigation")}><button type="button" onClick={onBack}>{tr("← К портфолио", "← Back to portfolio")}</button><a href={site.telegram} target="_blank" rel="noreferrer">{tr("Связаться", "Get in touch")} <span>↗</span></a></nav>
    </header>
    <section className={styles.hero}>
      <div className={styles.heroTop}><span className={styles.eyebrow}>{tool ? tr("Инструмент для дизайнеров", "A tool for designers") : isPrintforge ? tr("Проект / Инструмент для дизайнеров", "Project / A tool for designers") : tr("Избранный проект", "Featured project")}</span><span className={styles.heroIndex}>{tool ? tool.version : project?.year}</span></div>
      <div className={styles.titleRow}><h1>{title}</h1><span className={styles.heroArrow} aria-hidden="true">↗</span></div>
      <div className={styles.heroBottom}><p>{tool?.tagline ?? (project ? t(project.kicker) : "")}</p><div className={styles.actions}>
        {actionHref && <a className={styles.primaryButton} href={actionHref} target="_blank" rel="noreferrer" data-ym-goal="portfolio_external_link" data-ym-params={JSON.stringify({ slug: tool?.slug ?? project?.slug, href: actionHref })}>{actionLabel} <span aria-hidden="true">↗</span></a>}
        <button type="button" className={styles.textButton} onClick={copyLink} data-ym-goal="portfolio_copy_link">{tr("Скопировать ссылку", "Copy link")} <span aria-hidden="true">＋</span></button>
        <span className={styles.copyStatus} role="status">{copyStatus}</span>
      </div></div>
      <dl className={styles.metadata}>
        <div><dt>{tool ? tr("Платформа", "Platform") : tr("Направление", "Discipline")}</dt><dd>{tool?.platformLabel ?? project?.tags[locale].slice(0, 2).join(" / ")}</dd></div>
        <div><dt>{tool ? tr("Обновление", "Updated") : tr("Год", "Year")}</dt><dd>{tool ? tool.updatedAt.split("-").reverse().join(".") : project?.year}</dd></div>
      </dl>
    </section>
    <div className={styles.coverArea}>
      {tool ? <ToolArtwork platform={tool.platform} /> : project && <button type="button" className={styles.coverButton} onClick={() => setZoom({ src: project.heroImage ?? project.cover, alt: project.title })} aria-label={`${tr("Увеличить обложку", "Zoom cover")} ${project.title}`}>
        <Image src={project.heroImage ?? project.cover} alt={project.title} width={1600} height={1000} className={styles.coverImage} unoptimized priority />
        <span className={styles.zoomHint}>{tr("Рассмотреть", "Zoom in")} <span>↗</span></span>
      </button>}
    </div>
    <div className={styles.paper}>
      {!["dombro", "tasker", "kroomi"].includes(project?.slug ?? "") && <section className={styles.overview}>
        <div><span className={styles.eyebrow}>01 / {tool ? tr("Зачем это нужно", "Why it matters") : tr("О проекте", "About the project")}</span><h2>{tool ? <>{tr("Рутину —", "Routine —")}<br />{tr("инструменту", "to the tool")}<span>.</span></> : <>{tr("От идеи", "From idea")}<br />{tr("к форме", "to form")}<span>.</span></>}</h2></div>
        <div className={styles.overviewBody}><p className={styles.lead}>{tool?.solution ?? (project ? t(project.body) : "")}</p>{tool && <div className={styles.problem}><span>{tr("Задача", "Task")}</span><p>{tool.problem}</p></div>}</div>
      </section>}

      {tool && <>
        <section className={styles.features} aria-label={tr("Возможности инструмента", "Tool features")}><div className={styles.sectionHeading}><span className={styles.eyebrow}>{tr("02 / Возможности", "02 / Features")}</span><h2>{tr("Маленькие детали.", "Small details.")}<br />{tr("Большая разница", "Big difference")}<span>.</span></h2></div><div className={styles.featureGrid}>{tool.highlights.map((highlight, index) => <div key={highlight}><span>0{index + 1} <i>↗</i></span><p>{highlight}</p></div>)}</div></section>
        <section className={styles.instructions}><div><span className={styles.eyebrow}>{tr("03 / Первые шаги", "03 / Getting started")}</span><h2>{tr("Начать просто", "Easy to start")}<span>.</span></h2><p className={styles.compatibility}>{tool.compatibility}</p></div><ol>{tool.instructions.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol></section>
        {tool.caseStudySlug && <button type="button" className={styles.relatedProject} onClick={() => onOpenProject(tool.caseStudySlug!)}><span>{tr("Инструмент в контексте проекта", "The tool in a project")}</span><strong>{tr("Посмотреть кейс", "View case")} <span>↗</span></strong></button>}
      </>}

      {project?.slug === "dombro" && <DombroCase onZoom={setZoom} />}
      {project?.slug === "tasker" && <TaskerCase />}
      {project?.slug === "kroomi" && <KroomiCase onZoom={setZoom} />}
            {project?.video && <section className={styles.demo}><div className={styles.sectionHeading}><span className={styles.eyebrow}>{tr("02 / В движении", "02 / In motion")}</span><h2>{tr("Посмотрите, как это работает", "See how it works")}<span>.</span></h2></div><video controls playsInline preload="none" poster={project.cover} aria-label={`${tr("Видео проекта", "Project video")} ${project.title}`}><source src={project.video} type="video/webm" /></video><p className={styles.hint}>{tr("Демонстрация проекта · Запустите видео, чтобы посмотреть взаимодействия.", "Project demo · Play the video to see the interactions.")}</p></section>}

      {isPrintforge && <section className={styles.productFeatures} aria-label={tr("Возможности PrintForge", "PrintForge features")}>
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>{tr("03 / Внутри продукта", "03 / Inside the product")}</span><h2>{tr("Из Figma —", "From Figma —")}<br />{tr("в готовый тираж", "to the final print run")}<span>.</span></h2></div>
        <div className={styles.featureTabs} role="group" aria-label={tr("Разделы PrintForge", "PrintForge sections")}>{printforgeFeatures.map((item, index) => <button type="button" key={item.image} aria-pressed={index === feature} onClick={() => setFeature(index)}>{t(item.name)}</button>)}</div>
        <div className={styles.productPanel}><div><span className={styles.panelIndex}>0{feature + 1} / 05</span><h3>{t(featureInfo.title)}</h3><p>{t(featureInfo.description)}</p></div><button type="button" className={styles.screenshotButton} onClick={() => setZoom({ src: "/placeholders/covers/printforge/" + featureInfo.image, alt: t(featureInfo.title) })} aria-label={`${tr("Увеличить", "Zoom")}: ${t(featureInfo.title)}`}><Image src={"/placeholders/covers/printforge/" + featureInfo.image} alt={t(featureInfo.title)} width={1000} height={1200} unoptimized /><span className={styles.zoomHint}>{tr("Рассмотреть ↗", "Zoom in ↗")}</span></button></div>
      </section>}

      {project?.slug === "altyn-solok" && <section className={styles.gallery}><div className={styles.sectionHeading}><span className={styles.eyebrow}>{tr("03 / Детали проекта", "03 / Project details")}</span><h2>{tr("Природа в цифровой форме", "Nature in digital form")}<span>.</span></h2></div><div className={styles.galleryGrid}>{[
        { src: "/placeholders/covers/altyn-solok-products.jpg", alt: tr("Витрина продуктов", "Product showcase") },
        { src: "/placeholders/covers/altyn-solok-cards.jpg", alt: tr("Карточки и детали", "Cards and details") },
      ].map(item => <button type="button" key={item.src} onClick={() => setZoom(item)}><Image src={item.src} alt={item.alt} width={1000} height={800} unoptimized /><span>{item.alt}<span>↗</span></span></button>)}</div><details className={styles.fullPage}><summary>{tr("Весь сайт целиком", "The whole site")} <span>＋</span></summary><Image src="/placeholders/covers/altyn-solok-fullpage.jpg" alt={tr("Полная страница Алтын Солок", "Full Altyn Solok page")} width={1920} height={10039} unoptimized /></details></section>}

      {makingOfData && <MakingOfSection data={makingOfData} onZoom={setZoom} />}

      {relatedTools.length > 0 && <section className={styles.relatedTools}><h2>{tr("Инструменты рядом с проектом", "Tools next to this project")}<span>.</span></h2>{relatedTools.map(item => <button type="button" key={item.slug} onClick={() => onOpenTool(item.slug)}><span>{item.title}<small>{item.platformLabel}</small></span><span>↗</span></button>)}</section>}
    </div>
    <footer className={styles.footer}>
      {(nextProject || nextTool) && <button type="button" className={styles.next} onClick={() => nextTool ? onOpenTool(nextTool.slug) : nextProject && onOpenProject(nextProject.slug)}><span className={styles.eyebrow}>{nextTool ? tr("Следующий инструмент", "Next tool") : tr("Следующий проект", "Next project")}</span><span className={styles.nextTitle}>{nextTool?.title ?? nextProject?.title}<span>↗</span></span></button>}
      <div className={styles.footerBottom}><button type="button" onClick={onBack}>{tr("← Все проекты и инструменты", "← All projects and tools")}</button><a href={site.telegram} target="_blank" rel="noreferrer">{tr("Обсудим вашу задачу ↗", "Let's talk about your project ↗")}</a><span>amazi / {site.name}</span></div>
    </footer>
    <dialog ref={dialogRef} className={styles.lightbox} onClose={() => setZoom(null)} onClick={event => { if (event.target === event.currentTarget) setZoom(null); }} aria-label={zoom?.alt ?? tr("Просмотр изображения", "Image viewer")}>
      <button type="button" onClick={() => setZoom(null)} className={styles.closeLightbox} aria-label={tr("Закрыть изображение", "Close image")}>{tr("Закрыть ×", "Close ×")}</button>
      {zoom && <Image src={zoom.src} alt={zoom.alt} width={1920} height={1400} unoptimized className={styles.zoomImage} />}
    </dialog>
  </article>;
}
