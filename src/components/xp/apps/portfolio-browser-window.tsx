"use client";

import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { projects, getProject, getAdjacent } from "@/data/projects";
import { toolsList } from "@/data/tools";
import { buildNavigationQuery, parseNavigationParams, PORTFOLIO_DIRECTIONS, type FocusDirection } from "@/lib/xp/navigation";
import { xpSound } from "@/lib/xp/sound";
import { InternetExplorerIcon } from "../xp-icons";
import { PortfolioLanding } from "@/components/portfolio/portfolio-landing";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import styles from "./portfolio-browser-window.module.css";

interface PortfolioBrowserWindowProps {
  initialProjectSlug?: string;
  initialFocus?: FocusDirection;
  notFound?: boolean;
}

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("portfolio:navigate", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("portfolio:navigate", onChange);
  };
}

function readPositions(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem("amazi-portfolio-positions") || "{}"); }
  catch { return {}; }
}

export function PortfolioBrowserWindow({ initialProjectSlug, initialFocus, notFound }: PortfolioBrowserWindowProps) {
  const search = useSyncExternalStore(subscribeToNavigation, () => window.location.search, () => "");
  const fallback = buildNavigationQuery("portfolio", { projectSlug: initialProjectSlug, focus: initialFocus });
  const nav = useMemo(() => parseNavigationParams(search || fallback), [search, fallback]);
  const focus = nav.focus ?? null;
  const currentProject = nav.projectSlug ? getProject(nav.projectSlug) : null;
  const currentTool = toolsList.find(tool => tool.slug === nav.toolSlug) ?? null;
  const detail = !!(currentProject || currentTool);
  const contentRef = useRef<HTMLDivElement>(null);
  const positions = useRef<Record<string, number>>(readPositions());
  const routeKey = currentProject ? "project:" + currentProject.slug : currentTool ? "tool:" + currentTool.slug : "catalog:" + (focus ?? "all");

  // Each page keeps its position across Back/Forward and minimize/restore.
  useLayoutEffect(() => {
    const viewport = contentRef.current;
    if (!viewport) return;
    viewport.scrollTop = positions.current[routeKey] ?? 0;
    const save = () => {
      positions.current[routeKey] = viewport.scrollTop;
      sessionStorage.setItem("amazi-portfolio-positions", JSON.stringify(positions.current));
    };
    viewport.addEventListener("scroll", save, { passive: true });
    return () => viewport.removeEventListener("scroll", save);
  }, [routeKey]);

  const navigate = (options: { projectSlug?: string; toolSlug?: string; focus?: FocusDirection | null }) => {
    xpSound.click();
    if (contentRef.current) positions.current[routeKey] = contentRef.current.scrollTop;
    sessionStorage.setItem("amazi-portfolio-positions", JSON.stringify(positions.current));
    const query = buildNavigationQuery("portfolio", { ...options, otherParams: nav.otherParams });
    window.history.pushState({ view: "portfolio", ...options }, "", window.location.pathname + query);
    window.dispatchEvent(new Event("portfolio:navigate"));
  };
  const openProject = (slug: string) => navigate({ projectSlug: slug, focus });
  const openTool = (slug: string) => navigate({ toolSlug: slug, focus });
  const back = () => navigate({ focus });
  const displayedProjects = useMemo(() => focus
    ? projects.filter(project => PORTFOLIO_DIRECTIONS[focus].slugs.includes(project.slug))
    : projects, [focus]);
  const adjacent = currentProject ? getAdjacent(currentProject.slug) : null;
  const toolIndex = currentTool ? toolsList.indexOf(currentTool) : -1;
  const nextTool = currentTool ? toolsList[(toolIndex + 1) % toolsList.length] : null;
  const address = currentProject ? "portfolio://projects/" + currentProject.slug
    : currentTool ? "portfolio://tools/" + currentTool.slug
    : "portfolio://catalog" + (focus ? "?focus=" + focus : "");

  return (
    <div className={styles.browserContainer}>
      <div className={styles.toolbar}>
        <button type="button" onClick={back} disabled={!detail} data-ym-goal="portfolio_back_to_catalog" className={styles.backBtn} aria-label="Назад к каталогу" title="Назад к каталогу">
          <span aria-hidden="true">←</span><span>Назад</span>
        </button>
        <div className={styles.addressBar} title="Текущий адрес">
          <InternetExplorerIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={styles.addressText}>{address}</span>
        </div>
      </div>
      <div ref={contentRef} className={styles.contentViewport}>
        {currentProject ? (
          <PortfolioDetail key={currentProject.slug} project={currentProject} nextProject={adjacent?.next ?? projects[0]} onBack={back} onOpenProject={openProject} onOpenTool={openTool} />
        ) : currentTool ? (
          <PortfolioDetail key={currentTool.slug} tool={currentTool} nextTool={nextTool} onBack={back} onOpenProject={openProject} onOpenTool={openTool} />
        ) : (
          <PortfolioLanding projects={displayedProjects} focus={focus} scrollContainer={contentRef} onFocusChange={newFocus => navigate({ focus: newFocus })} onOpenProject={openProject} onOpenTool={openTool} notFound={nav.projectNotFound || (!search && notFound)} />
        )}
      </div>
    </div>
  );
}
