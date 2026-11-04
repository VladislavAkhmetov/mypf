import type { Bi } from "./dombro";
import { getTaskbarHeight, type WindowBounds } from "@/lib/xp/navigation";

export type MiniGameId = "baltika" | "designer-game";

export interface MiniGame {
  id: MiniGameId;
  /** Desktop label and window title (stored in Russian, translated by localizeTitle). */
  title: string;
  name: Bi;
  icon: string;
  /** Where the game is deployed on this server, as its own folder. Change here when it moves. */
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
    url: "/games/baltika-garret-surf/",
    screen: ["#103f58", "#1f7fa8"],
  },
  "designer-game": {
    id: "designer-game",
    title: "Хочешь стать дизайнером?",
    name: { ru: "Хочешь стать дизайнером?", en: "Want to be a designer?" },
    icon: "/icons/xp/designer-game.svg",
    url: "/games/designer/",
    screen: ["#ffb21a", "#ffe75e"],
  },
};

/** A phone-shaped window: tall, narrow, centred; full screen on small viewports. */
export function getMobileGameWindowBounds(): WindowBounds {
  const screenW = typeof window === "undefined" ? 1280 : window.innerWidth;
  const screenH = typeof window === "undefined" ? 800 : window.innerHeight;
  const availH = Math.max(320, screenH - getTaskbarHeight());
  if (screenW < 768) return { x: 0, y: 0, width: screenW, height: availH };
  const height = Math.min(900, availH - 24);
  // Phone screen 9:19.5 plus bezel and the window title bar.
  const width = Math.round((height - 30 - 28) * (9 / 19.5) + 28 + 8);
  return { x: Math.round((screenW - width) / 2), y: Math.max(0, Math.round((availH - height) / 2)), width, height };
}
