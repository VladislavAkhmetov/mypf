import { figmaPlugins } from "./figma-plugins";
import type { Locale } from "@/lib/i18n";

export type ToolPlatform = "figma" | "illustrator" | "web" | "template";

export interface ToolItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  platform: ToolPlatform;
  platformLabel: string;
  version: string;
  updatedAt: string;
  /** Published Figma Community plugin (shown in the Explorer and the portfolio plugin strip). */
  community?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
  problem: string;
  solution: string;
  highlights: string[];
  primaryAction: {
    label: string;
    url?: string;
  };
  caseStudySlug?: string;
  instructions: string[];
  compatibility: string;
}

const communityPlugins = (locale: Locale): ToolItem[] => figmaPlugins.map(plugin => ({
  id: `plugin-${plugin.id}`,
  slug: plugin.id,
  title: plugin.name,
  tagline: plugin.caption[locale],
  platform: "figma",
  platformLabel: locale === "en" ? "Figma • Plugin" : "Figma • Плагин",
  version: "Community",
  updatedAt: "2026-10-01",
  community: true,
  problem: plugin.pain[locale],
  solution: plugin.solution[locale],
  highlights: locale === "en"
    ? ["Works right inside Figma", "One-click install from Community"]
    : ["Работает прямо в Figma", "Устанавливается в один клик из Community"],
  primaryAction: { label: locale === "en" ? "Open in Figma Community" : "Открыть в Figma Community", url: plugin.url },
  instructions: locale === "en"
    ? ["Open the plugin page in Figma Community.", "Click Open in… or Save.", `Run it from Plugins → ${plugin.name}.`]
    : ["Откройте страницу плагина в Figma Community.", "Нажмите Open in… или Save.", `Запускайте через меню Plugins → ${plugin.name}.`],
  compatibility: "Figma Desktop / Browser",
}));

// Only real, published tools. Add a new one here (or in figma-plugins.ts for Community plugins) when it ships.
export function toolsFor(locale: Locale): ToolItem[] {
  return [...communityPlugins(locale)];
}

/** Russian copy; use for slugs and lookups, and toolsFor(locale) for anything shown on screen. */
export const toolsList: ToolItem[] = toolsFor("ru");
