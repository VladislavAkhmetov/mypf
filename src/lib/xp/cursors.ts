// Windows XP Authentic SVG Cursors with exact hotspots

function toDataUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

// 1. Classic Windows XP Default Arrow Cursor (hotspot: 0, 0)
const defaultCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.38" />
    </filter>
  </defs>
  <path filter="url(#xp-shadow)" d="M1 1 L1 22 L6.5 17.5 L11 27 L14 25.5 L9.5 16 L16 16 Z" fill="#ffffff" stroke="#000000" stroke-width="1.2" stroke-linejoin="round" />
</svg>`;

// 2. Classic Windows XP Hand / Pointer Cursor (hotspot: 6, 1)
const pointerCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-hand-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.35" />
    </filter>
  </defs>
  <g filter="url(#xp-hand-shadow)">
    <path d="M7 11 L7 1 C7 0 8 -0.2 9 0.5 C10 1.2 10.5 2 10.5 4 L10.5 10 L13 10 C14 10 14.5 10.5 14.5 11.5 L14.5 13 L16.5 13 C17.5 13 18 13.8 18 14.8 L18 16.5 L20 16.5 C21 16.5 21.5 17.3 21.5 18.5 L21.5 22 C21.5 27 18 30 13 30 C9 30 5.5 27 4.5 23 L2 18 C1.2 16.5 2.5 15 4 16 L6 17.5 L6 11 Z" fill="#ffffff" stroke="#000000" stroke-width="1.1" stroke-linejoin="round"/>
    <rect x="7" y="27" width="8" height="3" fill="#2563eb" rx="1" />
  </g>
</svg>`;

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
  default: `${toDataUri(defaultCursorSvg)} 0 0, default`,
  pointer: `${toDataUri(pointerCursorSvg)} 6 1, pointer`,
  move: `${toDataUri(moveCursorSvg)} 16 16, move`,
  ewResize: `${toDataUri(ewResizeSvg)} 16 16, ew-resize`,
  nsResize: `${toDataUri(nsResizeSvg)} 16 16, ns-resize`,
  nwseResize: `${toDataUri(nwseResizeSvg)} 16 16, nwse-resize`,
  neswResize: `${toDataUri(neswResizeSvg)} 16 16, nesw-resize`,
  wait: `${toDataUri(waitCursorSvg)} 16 16, wait`,
  text: "text",
};
