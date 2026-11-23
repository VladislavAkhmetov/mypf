import type { Bi } from "./dombro";
import { getTaskbarHeight, type WindowBounds } from "@/lib/xp/navigation";

export type MiniGameId = "baltika" | "designer-game" | "hyper-packer";

export interface MiniGame {
  id: MiniGameId;
  /** Desktop label and window title (stored in Russian, translated by localizeTitle). */
  title: string;
  name: Bi;
  icon: string;
  /** Where the game is deployed on this server, as its own folder or file. */
  url: string;
  /** Colours of the phone screen while the game loads or is not deployed yet. */
  screen: [string, string];
}

export const miniGames: Record<MiniGameId, MiniGame> = {
  baltika: {
    id: "baltika",
    title: "Garret Surf",
    name: { ru: "GARRET — на волне!", en: "GARRET — ride the wave!" },
    icon: "/icons/xp/baltika.webp",
    url: "/games/baltika-garret-surf/index.html",
    screen: ["#103f58", "#1f7fa8"],
  },
  "designer-game": {
    id: "designer-game",
    title: "Хочешь стать дизайнером?",
    name: { ru: "Хочешь стать дизайнером?", en: "Want to be a designer?" },
    icon: "/icons/xp/designer-game.svg",
    url: "/games/designer/index.html",
    screen: ["#ffb21a", "#ffe75e"],
  },
  "hyper-packer": {
    id: "hyper-packer",
    title: "Hyper Packer",
    name: { ru: "Hyper Packer", en: "Hyper Packer" },
    icon: "/icons/xp/hyper-packer.png",
    url: "/games/hyper-packer/index.html",
    screen: ["#155DFC", "#052E99"],
  },
};

/** A narrow mobile window: tall, centered, formatted for phone aspect ratio; full screen on mobile viewports. */
export function getMobileGameWindowBounds(): WindowBounds {
  const screenW = typeof window === "undefined" ? 1280 : window.innerWidth;
  const screenH = typeof window === "undefined" ? 800 : window.innerHeight;
  const availH = Math.max(320, screenH - getTaskbarHeight());
  if (screenW < 768) return { x: 0, y: 0, width: screenW, height: availH };
  const height = Math.min(840, availH - 24);
  const titleBarH = 30;
  const contentH = Math.max(480, height - titleBarH);
  // Clean mobile width (approx iPhone 14/15/16 ~ 400-420px)
  const targetContentW = Math.min(420, Math.max(380, Math.round(contentH * (9 / 16))));
  const width = Math.min(screenW - 24, targetContentW);
  return {
    x: Math.round((screenW - width) / 2),
    y: Math.max(8, Math.round((availH - height) / 2)),
    width,
    height,
  };
}
