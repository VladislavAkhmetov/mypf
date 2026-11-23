"use client";

import { useEffect, useRef, useState } from "react";
import { getMakingOf } from "@/data/making-of";
import { MakingOfSection } from "./making-of";
import { DombroCase } from "./dombro-case";
import { TaskerCase } from "./tasker-case";
import { KroomiCase } from "./kroomi-case";
import { DeviceMockupDuo } from "./device-mockup";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { toolsFor, type ToolItem } from "@/data/tools";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "@/components/xp/window-manager-context";
import { getPrimaryWindowBounds } from "@/lib/xp/navigation";
import { xpSound } from "@/lib/xp/sound";
import styles from "./portfolio-detail.module.css";

interface PortfolioDetailProps {
  project?: Project;
  tool?: ToolItem;
  prevProject?: Project | null;
  prevTool?: ToolItem | null;
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
    {platform === "web" ? <div className={styles.swatches}>{["#422c27", "#814330", "#b95337", "#ec6843", "#f88c68", "#f8b69a", "#f8dbcb"].map(color => <i key={color} style={{ background: color }} />)}</div>
      : platform === "illustrator" ? <div className={styles.vectorArt}><i /><i /><i /></div>
      : <span className={styles.typeArt}>{platform === "template" ? "Ag" : "Аа"}</span>}
  </div>;
}

export function PortfolioDetail({ project, tool, prevProject, prevTool, nextProject, nextTool, onBack, onOpenProject, onOpenTool }: PortfolioDetailProps) {
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
  const { openWindow } = useWindowManager();

  const openKroomiLanding = () => {
    xpSound.click();
    openWindow({
      id: "kroomi",
      type: "kroomi",
      title: "kroomi — языки с персонажем",
      iconType: "kroomi",
      ...getPrimaryWindowBounds(),
    });
  };

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

  return <article className={styles.page} data-portfolio-detail={tool ? "tool" : "project"} data-slug={tool?.slug ?? project?.slug}>
    <section className={styles.hero}>
      <div className={styles.titleRow}><h1>{title}</h1></div>
      <div className={styles.heroBottom}><p>{tool?.tagline ?? (project ? t(project.kicker) : "")}</p><div className={styles.actions}>
        {project?.slug === "kroomi" ? (
          <>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openKroomiLanding}
              data-ym-goal="kroomi_case_landing"
            >
              {tr("Лендинг kroomi", "kroomi landing page")}
            </button>
            {project.href && (
              <a
                className={styles.textButton}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                data-ym-goal="portfolio_external_link"
                data-ym-params={JSON.stringify({ slug: "kroomi", href: project.href })}
              >
                {tr("Узнать о выходе", "Get notified")}
              </a>
            )}
          </>
        ) : (
          actionHref && <a className={styles.primaryButton} href={actionHref} target="_blank" rel="noreferrer" data-ym-goal="portfolio_external_link" data-ym-params={JSON.stringify({ slug: tool?.slug ?? project?.slug, href: actionHref })}>{actionLabel}</a>
        )}
        <button type="button" className={styles.textButton} onClick={copyLink} data-ym-goal="portfolio_copy_link">{tr("Скопировать ссылку", "Copy link")}</button>
        <span className={styles.copyStatus} role="status">{copyStatus}</span>
      </div></div>
    </section>
    <div className={styles.coverArea} data-slug={tool?.slug ?? project?.slug}>
      {tool ? (
        <ToolArtwork platform={tool.platform} />
      ) : project && (
        project.slug === "tasker" ? (
          <div className={styles.taskerHero}>
            <button
              type="button"
              className={styles.taskerDesktopBtn}
              onClick={() => setZoom({ src: "/images/tasker-case/window-transparent.png", alt: tr("Таскер — дашборд", "Tasker — dashboard") })}
              aria-label={`${tr("Увеличить дашборд", "Zoom dashboard")} ${project.title}`}
            >
              <Image
                src="/images/tasker-case/window-transparent.png"
                alt={tr("Таскер — дашборд", "Tasker — dashboard")}
                width={1480}
                height={952}
                className={styles.taskerDesktopImg}
                unoptimized
                priority
              />
            </button>
            <button
              type="button"
              className={styles.taskerPhoneBtn}
              onClick={() => setZoom({ src: "/images/tasker-case/phone-transparent.png", alt: tr("Таскер — Telegram-приложение", "Tasker — Telegram app") })}
              aria-label={`${tr("Увеличить мобильное приложение", "Zoom mobile app")} ${project.title}`}
            >
              <Image
                src="/images/tasker-case/phone-transparent.png"
                alt={tr("Таскер — Telegram-приложение", "Tasker — Telegram app")}
                width={644}
                height={1368}
                className={styles.taskerPhoneImg}
                unoptimized
                priority
              />
            </button>
          </div>
        ) : (
          <button type="button" className={styles.coverButton} onClick={() => setZoom({ src: project.heroImage ?? project.cover, alt: project.title })} aria-label={`${tr("Увеличить обложку", "Zoom cover")} ${project.title}`}>
            <Image src={project.heroImage ?? project.cover} alt={project.title} width={1600} height={1000} className={styles.coverImage} unoptimized priority />
          </button>
        )
      )}
    </div>
    <div className={styles.paper}>
      {!["dombro", "tasker", "kroomi"].includes(project?.slug ?? "") && (
        <section className={styles.overview}>
          <p className={styles.lead}>{tool?.solution ?? (project ? t(project.body) : "")}</p>
          {tool && <div className={styles.problem}><span>{tr("Задача", "Task")}</span><p>{tool.problem}</p></div>}
        </section>
      )}

      {tool && <>
        <section className={styles.features} aria-label={tr("Возможности инструмента", "Tool features")}><div className={styles.sectionHeading}><h2>{tr("Маленькие детали", "Small details")}<br />{tr("Большая разница", "Big difference")}</h2></div><div className={styles.featureGrid}>{tool.highlights.map(highlight => <div key={highlight}><p>{highlight}</p></div>)}</div></section>
        <section className={styles.instructions}><div><h2>{tr("Начать просто", "Easy to start")}</h2><p className={styles.compatibility}>{tool.compatibility}</p></div><ol>{tool.instructions.map(step => <li key={step}><p>{step}</p></li>)}</ol></section>
        {tool.caseStudySlug && <button type="button" className={styles.relatedProject} onClick={() => onOpenProject(tool.caseStudySlug!)}><span>{tr("Инструмент в контексте проекта", "The tool in a project")}</span><strong>{tr("Посмотреть кейс", "View case")}</strong></button>}
      </>}

      {project?.slug === "dombro" && <DombroCase onZoom={setZoom} />}
      {project?.slug === "tasker" && <TaskerCase />}
      {project?.slug === "kroomi" && <KroomiCase onZoom={setZoom} />}
      {project?.video && (
        <section className={styles.demo}>
          <video controls playsInline preload="none" poster={project.cover} aria-label={`${tr("Видео проекта", "Project video")} ${project.title}`}>
            <source src={project.video} type="video/webm" />
          </video>
        </section>
      )}

      {isPrintforge && <section className={styles.productFeatures} aria-label={tr("Возможности PrintForge", "PrintForge features")}>
        <div className={styles.sectionHeading}><h2>{tr("Из Figma —", "From Figma —")}<br />{tr("в готовый тираж", "to the final print run")}</h2></div>
        <div className={styles.featureTabs} role="group" aria-label={tr("Разделы PrintForge", "PrintForge sections")}>{printforgeFeatures.map((item, index) => <button type="button" key={item.image} aria-pressed={index === feature} onClick={() => setFeature(index)}>{t(item.name)}</button>)}</div>
        <div className={styles.productPanel}><div><h3>{t(featureInfo.title)}</h3><p>{t(featureInfo.description)}</p></div><button type="button" className={styles.screenshotButton} onClick={() => setZoom({ src: "/placeholders/covers/printforge/" + featureInfo.image, alt: t(featureInfo.title) })} aria-label={`${tr("Увеличить", "Zoom")}: ${t(featureInfo.title)}`}><Image src={"/placeholders/covers/printforge/" + featureInfo.image} alt={t(featureInfo.title)} width={1000} height={1200} unoptimized /></button></div>
      </section>}

      {project?.slug === "altyn-solok" && (
        <section className={styles.gallery}>
          <DeviceMockupDuo
            theme="altyn-solok"
            tablet={{
              src: "/placeholders/covers/altyn-solok-desktop-catalog.jpg",
              alt: tr("Десктопный каталог продукции", "Desktop product catalog"),
            }}
            phone={{
              src: "/placeholders/covers/altyn-solok-mobile.png",
              alt: tr("Мобильный экран «Собрано природой»", "Mobile screen «Gathered by Nature»"),
            }}
            onZoom={setZoom}
          />
          <details className={styles.fullPage}>
            <summary>{tr("Весь сайт целиком", "The whole site")}</summary>
            <Image
              src="/placeholders/covers/altyn-solok-fullpage.jpg"
              alt={tr("Полная страница Алтын Солок", "Full Altyn Solok page")}
              width={1920}
              height={10039}
              unoptimized
            />
          </details>
        </section>
      )}

      {makingOfData && <MakingOfSection data={makingOfData} onZoom={setZoom} />}

      {relatedTools.length > 0 && <section className={styles.relatedTools}><h2>{tr("Инструменты рядом с проектом", "Tools next to this project")}</h2>{relatedTools.map(item => <button type="button" key={item.slug} onClick={() => onOpenTool(item.slug)}><span>{item.title}<small>{item.platformLabel}</small></span></button>)}</section>}
    </div>
    <footer className={styles.footer}>
      {(prevProject || prevTool) && (
        <button
          type="button"
          className={`${styles.navItem} ${styles.navItemPrev}`}
          onClick={() => prevTool ? onOpenTool(prevTool.slug) : prevProject && onOpenProject(prevProject.slug)}
        >
          <span className={styles.navLabel}>
            {prevTool ? tr("← Предыдущий инструмент", "← Previous tool") : tr("← Предыдущий проект", "← Previous project")}
          </span>
          <span className={styles.navTitle}>
            {prevTool?.title ?? prevProject?.title}
          </span>
        </button>
      )}

      {(nextProject || nextTool) && (
        <button
          type="button"
          className={`${styles.navItem} ${styles.navItemNext}`}
          onClick={() => nextTool ? onOpenTool(nextTool.slug) : nextProject && onOpenProject(nextProject.slug)}
        >
          <span className={styles.navLabel}>
            {nextTool ? tr("Следующий инструмент →", "Next tool →") : tr("Следующий проект →", "Next project →")}
          </span>
          <span className={styles.navTitle}>
            {nextTool?.title ?? nextProject?.title}
          </span>
        </button>
      )}
    </footer>
    <dialog ref={dialogRef} className={styles.lightbox} onClose={() => setZoom(null)} onClick={event => { if (event.target === event.currentTarget) setZoom(null); }} aria-label={zoom?.alt ?? tr("Просмотр изображения", "Image viewer")}>
      <button type="button" onClick={() => setZoom(null)} className={styles.closeLightbox} aria-label={tr("Закрыть изображение", "Close image")}>{tr("Закрыть ×", "Close ×")}</button>
      {zoom && <Image src={zoom.src} alt={zoom.alt} width={1920} height={1400} unoptimized className={styles.zoomImage} />}
    </dialog>
  </article>;
}