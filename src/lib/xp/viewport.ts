import { useSyncExternalStore } from "react";

// Compact mode: windows fill the screen (phones in portrait, and phones in landscape
// where a desktop-sized window would not fit). Keep in sync with the media query in xp.css.
export const COMPACT_VIEWPORT_QUERY = "(max-width: 767px), (max-height: 520px) and (pointer: coarse)";

export function isCompactViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;
}


const subscribeCompact = (onChange: () => void) => {
  const media = window.matchMedia(COMPACT_VIEWPORT_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/** True while windows fill the screen (phones, landscape phones). */
export function useCompactViewport(): boolean {
  return useSyncExternalStore(subscribeCompact, isCompactViewport, () => false);
}
