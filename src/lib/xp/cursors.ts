// Windows XP Authentic SVG Cursors with exact hotspots

function toDataUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

// Pixel bitmaps of the original XP cursors. B = black outline, W = white fill.
// Rendered 1:1 on a 32px canvas with a soft offset shadow, like the XP originals.
const ARROW_BITMAP = [
  "B",
  "BB",
  "BWB",
  "BWWB",
  "BWWWB",
  "BWWWWB",
  "BWWWWWB",
  "BWWWWWWB",
  "BWWWWWWWB",
  "BWWWWWWWWB",
  "BWWWWWWWWWB",
  "BWWWWWWBBBBB",
  "BWWWBWWB",
  "BWWBBWWB",
  "BWB..BWWB",
  "BB...BWWB",
  "B.....BWWB",
  "......BWWB",
  ".......BB",
];

// "Link select" hand: index finger up, knuckle lines, thumb on the left.
const HAND_BITMAP = [
  ".....BB",
  "....BWWB",
  "....BWWB",
  "....BWWB",
  "....BWWB",
  "....BWWBBB",
  "....BWWBWWBBB",
  "....BWWBWWBWWBB",
  ".BB.BWWBWWBWWBWB",
  "BWWBBWWWWWWWWBWB",
  "BWWWBWWWWWWWWWWB",
  ".BWWWWWWWWWWWWWB",
  "..BWWWWWWWWWWWWB",
  "..BWWWWWWWWWWWWB",
  "...BWWWWWWWWWWB",
  "...BWWWWWWWWWWB",
  "....BWWWWWWWWB",
  "....BWWWWWWWWB",
  "....BBBBBBBBBB",
];

function bitmapToSvg(bitmap: string[], originX: number, originY: number): string {
  const cells = (char: string) =>
    bitmap
      .flatMap((row, y) => [...row].map((c, x) => (c === char ? `M${x + originX} ${y + originY}h1v1h-1z` : "")))
      .join("");
  const shadow = bitmap
    .flatMap((row, y) => [...row].map((c, x) => (c === "." ? "" : `M${x + originX + 2} ${y + originY + 2}h1v1h-1z`)))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.7"/></filter></defs>
  <path d="${shadow}" fill="#000" fill-opacity="0.28" filter="url(#s)"/>
  <path d="${cells("W")}" fill="#fff"/>
  <path d="${cells("B")}" fill="#000"/>
</svg>`;
}

// 1. Default arrow (hotspot at the tip)
const defaultCursorSvg = bitmapToSvg(ARROW_BITMAP, 1, 1);

// 2. Hand / pointer (hotspot at the fingertip)
const pointerCursorSvg = bitmapToSvg(HAND_BITMAP, 1, 1);

// 3. Move / 4-way arrow cursor (hotspot: 16, 16)
const moveCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-m-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>
  <g filter="url(#xp-m-shadow)" stroke="#000" stroke-width="1.2" fill="#fff">
    <path d="M16 2 L12 7 L15 7 L15 15 L7 15 L7 12 L2 16 L7 20 L7 17 L15 17 L15 25 L12 25 L16 30 L20 25 L17 25 L17 17 L25 17 L25 20 L30 16 L25 12 L25 15 L17 15 L17 7 L20 7 Z" />
  </g>
</svg>`;

// 4. EW Resize cursor (hotspot: 16, 16)
const ewResizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g stroke="#000" stroke-width="1.2" fill="#fff">
    <path d="M2 16 L8 11 L8 14 L24 14 L24 11 L30 16 L24 21 L24 18 L8 18 L8 21 Z" />
  </g>
</svg>`;

// 5. NS Resize cursor (hotspot: 16, 16)
const nsResizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g stroke="#000" stroke-width="1.2" fill="#fff">
    <path d="M16 2 L11 8 L14 8 L14 24 L11 24 L16 30 L21 24 L18 24 L18 8 L21 8 Z" />
  </g>
</svg>`;

// 6. NWSE Resize cursor (hotspot: 16, 16)
const nwseResizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g stroke="#000" stroke-width="1.2" fill="#fff" transform="rotate(45 16 16)">
    <path d="M16 2 L11 8 L14 8 L14 24 L11 24 L16 30 L21 24 L18 24 L18 8 L21 8 Z" />
  </g>
</svg>`;

// 7. NESW Resize cursor (hotspot: 16, 16)
const neswResizeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g stroke="#000" stroke-width="1.2" fill="#fff" transform="rotate(-45 16 16)">
    <path d="M16 2 L11 8 L14 8 L14 24 L11 24 L16 30 L21 24 L18 24 L18 8 L21 8 Z" />
  </g>
</svg>`;

// 8. Hourglass / Wait cursor (hotspot: 16, 16)
const waitCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <path d="M8 4 L24 4 L24 7 L18 14 L18 18 L24 25 L24 28 L8 28 L8 25 L14 18 L14 14 L8 7 Z" fill="#e0f2fe" stroke="url(#glass)" stroke-width="2" />
  <path d="M10 6 L22 6 L17 13 L15 13 Z" fill="#facc15" />
  <path d="M12 26 L20 26 L17 21 L15 21 Z" fill="#facc15" />
</svg>`;

export const xpCursors = {
  default: `${toDataUri(defaultCursorSvg)} 1 1, default`,
  pointer: `${toDataUri(pointerCursorSvg)} 7 1, pointer`,
  move: `${toDataUri(moveCursorSvg)} 16 16, move`,
  ewResize: `${toDataUri(ewResizeSvg)} 16 16, ew-resize`,
  nsResize: `${toDataUri(nsResizeSvg)} 16 16, ns-resize`,
  nwseResize: `${toDataUri(nwseResizeSvg)} 16 16, nwse-resize`,
  neswResize: `${toDataUri(neswResizeSvg)} 16 16, nesw-resize`,
  wait: `${toDataUri(waitCursorSvg)} 16 16, wait`,
  text: "text",
};

/** Exposes the XP cursors as CSS variables used by globals.css and CSS modules. */
export function applyXpCursorVariables(root: HTMLElement = document.documentElement): void {
  root.style.setProperty("--xp-cursor-default", xpCursors.default);
  root.style.setProperty("--xp-cursor-pointer", xpCursors.pointer);
}
