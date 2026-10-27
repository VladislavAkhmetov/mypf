"use client";

import { useEffect, useRef, useState } from "react";
import { getMakingOf } from "@/data/making-of";
import { MakingOfSection } from "./making-of";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { toolsList, type ToolItem } from "@/data/tools";
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
  { name: "Макеты", title: "От формата до припусков", description: "Пресеты полиграфии, размеры в миллиметрах и направляющие для безопасной области. Подготовка начинается прямо на холсте Figma.", image: "tab_properties_2x.png" },
  { name: "Цвет", title: "Цвет под контролем", description: "Конвертация экранного цвета в CMYK, выбор ICC-профиля и проверка палитры документа перед передачей в печать.", image: "tab_colors_2x.png" },
  { name: "Разрешение", title: "Каждый пиксель на месте", description: "Проверка эффективного разрешения растровых изображений с учётом масштаба макета. Проблемные слои можно найти до отправки в типографию.", image: "tab_dpi_2x.png" },
  { name: "Проверка", title: "Последний взгляд перед печатью", description: "Проверка тонких линий, шрифтов, безопасных полей и наложения краски в одном рабочем процессе.", image: "tab_health_2x.png" },
  { name: "Упаковка", title: "Не только плоский лист", description: "Разметка линий резки и биговки, технические слои для отделки и плашечные каналы для подготовки упаковки.", image: "tab_packaging_2x.png" },
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

function ProjectExperiment({ slug }: { slug: string }) {
  const [size, setSize] = useState(48);
  const [sample, setSample] = useState("Форма начинается с буквы.");
  const [band, setBand] = useState("VHF");
  const [room, setRoom] = useState(0);
  if (!["kora", "signalatlas", "noclip"].includes(slug)) return null;
  return <section className={styles.experiment} aria-label="Интерактивный эскиз">
    <div className={styles.sectionHeading}><span className={styles.eyebrow}>02 / Взаимодействие</span><h2>Попробуйте сами<span>.</span></h2></div>
    <div className={styles.experimentSurface}>
      {slug === "kora" ? <>
        <div className={styles.experimentBar}><span>Типографический эскиз</span><label>Размер <input aria-label="Размер текста" type="range" min="24" max="80" value={size} onChange={event => setSize(Number(event.target.value))} /><span>{size}px</span></label></div>
        <textarea aria-label="Текст типографического эскиза" className={styles.typeInput} value={sample} onChange={event => setSample(event.target.value)} style={{ fontSize: size }} rows={3} spellCheck={false} />
        <p className={styles.hint}>Напишите свой текст и измените масштаб.</p>
      </> : slug === "signalatlas" ? <>
        <div className={styles.experimentBar}><span>Карта радиотишины</span><div className={styles.segmented}>{["VHF", "UHF", "AM"].map(value => <button type="button" key={value} aria-pressed={band === value} onClick={() => setBand(value)}>{value}</button>)}</div></div>
        <div className={styles.signal} aria-label={`Диапазон ${band}`}>{[40, 65, 30, 85, 20, 95, 75, 50, 80, 45, 60, 90, 35, 70, 55, 88].map((height, i) => <i key={i} style={{ height: `${band === "VHF" ? height : band === "UHF" ? Math.min(100, height * 1.2) : height * .7}%` }} />)}</div>
        <p className={styles.hint}>Визуальный эскиз · {band} · {band === "VHF" ? "14.2" : band === "UHF" ? "28.6" : "8.1"} dBµV</p>
      </> : <>
        <div className={styles.experimentBar}><span>Пространственная навигация</span><div className={styles.segmented}>{[0, 1, 2].map(value => <button type="button" key={value} aria-pressed={room === value} onClick={() => setRoom(value)}>Зал {value + 1}</button>)}</div></div>
        <div className={styles.room}><span>0{room + 1}</span><p>{["Зал античных рукописей. Проекция на пол отображает сетку координат фонда.", "Зал оптических приборов. Стенд синхронизирован с гироскопом посетителя.", "Зал акустических следов. Интерактивная зона затухания реверберации."][room]}</p></div>
      </>}
    </div>
  </section>;
}

export function PortfolioDetail({ project, tool, nextProject, nextTool, onBack, onOpenProject, onOpenTool }: PortfolioDetailProps) {
  const { t, locale } = useLocale();
  const [feature, setFeature] = useState(0);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = tool?.title ?? project?.title ?? "";
  const isPrintforge = project?.slug === "printforge";
  const relatedTools = project ? toolsList.filter(item => item.caseStudySlug === project.slug) : [];
  const featureInfo = printforgeFeatures[feature];
  const makingOfData = getMakingOf(project?.slug);
  // Existing generic Community/Telegram URLs are not download links.
  const toolUrl = tool?.primaryAction.url;
  const hasDirectToolLink = !!toolUrl && toolUrl !== site.telegram && !/^https:\/\/www\.figma\.com\/community\/?$/.test(toolUrl);
  const actionHref = tool ? (hasDirectToolLink ? toolUrl : site.telegram) : project?.href;
  const actionLabel = tool ? (hasDirectToolLink ? tool.primaryAction.label : "Запросить инструмент") : (project?.linkLabel ? t(project.linkLabel) : "Смотреть проект");

  useEffect(() => {
    if (zoom) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [zoom]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopyStatus("Ссылка скопирована"); }
    catch { setCopyStatus("Не удалось скопировать. Ссылка доступна в адресной строке браузера."); }
  };

  return <article className={styles.page} data-portfolio-detail={tool ? "tool" : "project"}>
    <header className={styles.header}>
      <button type="button" onClick={onBack} className={styles.wordmark} aria-label="На главную портфолио">amazi<span>✳</span></button>
      <nav aria-label="Навигация по кейсу"><button type="button" onClick={onBack}>← К портфолио</button><a href={site.telegram} target="_blank" rel="noreferrer">Связаться <span>↗</span></a></nav>
    </header>
    <section className={styles.hero}>
      <div className={styles.heroTop}><span className={styles.eyebrow}>{tool ? "Инструмент для дизайнеров" : isPrintforge ? "Проект / Инструмент для дизайнеров" : "Избранный проект"}</span><span className={styles.heroIndex}>{tool ? tool.version : project?.year}</span></div>
      <div className={styles.titleRow}><h1>{title}</h1><span className={styles.heroArrow} aria-hidden="true">↗</span></div>
      <div className={styles.heroBottom}><p>{tool?.tagline ?? (project ? t(project.kicker) : "")}</p><div className={styles.actions}>
        {actionHref && <a className={styles.primaryButton} href={actionHref} target="_blank" rel="noreferrer" data-ym-goal="portfolio_external_link" data-ym-params={JSON.stringify({ slug: tool?.slug ?? project?.slug, href: actionHref })}>{actionLabel} <span aria-hidden="true">↗</span></a>}
        <button type="button" className={styles.textButton} onClick={copyLink} data-ym-goal="portfolio_copy_link">Скопировать ссылку <span aria-hidden="true">＋</span></button>
        <span className={styles.copyStatus} role="status">{copyStatus}</span>
      </div></div>
      <dl className={styles.metadata}>
        <div><dt>{tool ? "Платформа" : "Направление"}</dt><dd>{tool?.platformLabel ?? project?.tags[locale].slice(0, 2).join(" / ")}</dd></div>
        <div><dt>{tool ? "Обновление" : "Год"}</dt><dd>{tool ? tool.updatedAt.split("-").reverse().join(".") : project?.year}</dd></div>
        <div><dt>Автор</dt><dd>{site.name} / amazi</dd></div>
      </dl>
    </section>
    <div className={styles.coverArea}>
      {tool ? <ToolArtwork platform={tool.platform} /> : project && <button type="button" className={styles.coverButton} onClick={() => setZoom({ src: project.cover, alt: project.title })} aria-label={`Увеличить обложку ${project.title}`}>
        <Image src={project.cover} alt={project.title} width={1600} height={1000} className={styles.coverImage} unoptimized priority />
        <span className={styles.zoomHint}>Рассмотреть <span>↗</span></span>
      </button>}
    </div>
    <div className={styles.paper}>
      <section className={styles.overview}>
        <div><span className={styles.eyebrow}>01 / {tool ? "Зачем это нужно" : "О проекте"}</span><h2>{tool ? <>Рутину —<br />инструменту<span>.</span></> : <>От идеи<br />к форме<span>.</span></>}</h2></div>
        <div className={styles.overviewBody}><p className={styles.lead}>{tool?.solution ?? (project ? t(project.body) : "")}</p>{tool && <div className={styles.problem}><span>Задача</span><p>{tool.problem}</p></div>}</div>
      </section>

      {tool && <>
        <section className={styles.features} aria-label="Возможности инструмента"><div className={styles.sectionHeading}><span className={styles.eyebrow}>02 / Возможности</span><h2>Маленькие детали.<br />Большая разница<span>.</span></h2></div><div className={styles.featureGrid}>{tool.highlights.map((highlight, index) => <div key={highlight}><span>0{index + 1} <i>↗</i></span><p>{highlight}</p></div>)}</div></section>
        <section className={styles.instructions}><div><span className={styles.eyebrow}>03 / Первые шаги</span><h2>Начать просто<span>.</span></h2><p className={styles.compatibility}>{tool.compatibility}</p></div><ol>{tool.instructions.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol></section>
        {tool.caseStudySlug && <button type="button" className={styles.relatedProject} onClick={() => onOpenProject(tool.caseStudySlug!)}><span>Инструмент в контексте проекта</span><strong>Посмотреть кейс <span>↗</span></strong></button>}
      </>}

      {project && <ProjectExperiment slug={project.slug} />}
      {project?.video && <section className={styles.demo}><div className={styles.sectionHeading}><span className={styles.eyebrow}>02 / В движении</span><h2>Посмотрите, как это работает<span>.</span></h2></div><video controls playsInline preload="none" poster={project.cover} aria-label={`Видео проекта ${project.title}`}><source src={project.video} type="video/webm" /></video><p className={styles.hint}>Демонстрация проекта · Запустите видео, чтобы посмотреть взаимодействия.</p></section>}

      {isPrintforge && <section className={styles.productFeatures} aria-label="Возможности PrintForge">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>03 / Внутри продукта</span><h2>Из Figma —<br />в готовый тираж<span>.</span></h2></div>
        <div className={styles.featureTabs} role="group" aria-label="Разделы PrintForge">{printforgeFeatures.map((item, index) => <button type="button" key={item.name} aria-pressed={index === feature} onClick={() => setFeature(index)}>{item.name}</button>)}</div>
        <div className={styles.productPanel}><div><span className={styles.panelIndex}>0{feature + 1} / 05</span><h3>{featureInfo.title}</h3><p>{featureInfo.description}</p></div><button type="button" className={styles.screenshotButton} onClick={() => setZoom({ src: "/placeholders/covers/printforge/" + featureInfo.image, alt: featureInfo.title })} aria-label={`Увеличить: ${featureInfo.title}`}><Image src={"/placeholders/covers/printforge/" + featureInfo.image} alt={featureInfo.title} width={1000} height={1200} unoptimized /><span className={styles.zoomHint}>Рассмотреть ↗</span></button></div>
      </section>}

      {project?.slug === "altyn-solok" && <section className={styles.gallery}><div className={styles.sectionHeading}><span className={styles.eyebrow}>03 / Детали проекта</span><h2>Природа в цифровой форме<span>.</span></h2></div><div className={styles.galleryGrid}>{[
        { src: "/placeholders/covers/altyn-solok-products.jpg", alt: "Витрина продуктов" },
        { src: "/placeholders/covers/altyn-solok-cards.jpg", alt: "Карточки и детали" },
      ].map(item => <button type="button" key={item.src} onClick={() => setZoom(item)}><Image src={item.src} alt={item.alt} width={1000} height={800} unoptimized /><span>{item.alt}<span>↗</span></span></button>)}</div><details className={styles.fullPage}><summary>Весь сайт целиком <span>＋</span></summary><Image src="/placeholders/covers/altyn-solok-fullpage.jpg" alt="Полная страница Алтын Солок" width={1920} height={10039} unoptimized /></details></section>}

      {makingOfData && <MakingOfSection data={makingOfData} onZoom={setZoom} />}

      {relatedTools.length > 0 && <section className={styles.relatedTools}><h2>Инструменты рядом с проектом<span>.</span></h2>{relatedTools.map(item => <button type="button" key={item.slug} onClick={() => onOpenTool(item.slug)}><span>{item.title}<small>{item.platformLabel}</small></span><span>↗</span></button>)}</section>}
    </div>
    <footer className={styles.footer}>
      {(nextProject || nextTool) && <button type="button" className={styles.next} onClick={() => nextTool ? onOpenTool(nextTool.slug) : nextProject && onOpenProject(nextProject.slug)}><span className={styles.eyebrow}>{nextTool ? "Следующий инструмент" : "Следующий проект"}</span><span className={styles.nextTitle}>{nextTool?.title ?? nextProject?.title}<span>↗</span></span></button>}
      <div className={styles.footerBottom}><button type="button" onClick={onBack}>← Все проекты и инструменты</button><a href={site.telegram} target="_blank" rel="noreferrer">Обсудим вашу задачу ↗</a><span>amazi / {site.name}</span></div>
    </footer>
    <dialog ref={dialogRef} className={styles.lightbox} onClose={() => setZoom(null)} onClick={event => { if (event.target === event.currentTarget) setZoom(null); }} aria-label={zoom?.alt ?? "Просмотр изображения"}>
      <button type="button" onClick={() => setZoom(null)} className={styles.closeLightbox} aria-label="Закрыть изображение">Закрыть ×</button>
      {zoom && <Image src={zoom.src} alt={zoom.alt} width={1920} height={1400} unoptimized className={styles.zoomImage} />}
    </dialog>
  </article>;
}
