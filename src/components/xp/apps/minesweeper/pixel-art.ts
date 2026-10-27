// Pixel-art engine for the "Meadow" minesweeper: 10×10 art pixels per cell, NES-like palette.
// Textures are generated once (seeded) and tile seamlessly across cells, so the field reads
// as one continuous meadow instead of a grid of squares.

export const ART = 10; // art pixels per cell; textures tile every 4 cells

export type Palette = Record<string, string>;

function bitmapPaths(rows: string[], palette: Palette): string {
  const runs: Record<string, string[]> = {};
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === char) end++;
      if (palette[char]) (runs[char] ||= []).push(`M${x} ${y}h${end - x}v1h-${end - x}z`);
      x = end;
    }
  });
  return Object.entries(runs)
    .map(([char, parts]) => `<path fill="${palette[char]}" d="${parts.join("")}"/>`)
    .join("");
}

export function pixelSvg(rows: string[], palette: Palette): string {
  const width = Math.max(...rows.map(row => row.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${rows.length}" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges">${bitmapPaths(rows, palette)}</svg>`;
}

export function svgUrl(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const cache = new Map<string, string>();
function memo(key: string, build: () => string): string {
  let value = cache.get(key);
  if (!value) {
    value = build();
    cache.set(key, value);
  }
  return value;
}

// ---------- Palette ----------
export const MEADOW = {
  grass: "#5bab3f",
  grassMid: "#4c9a37",
  grassDark: "#367a2b",
  grassLight: "#9bd65a",
  soil: "#d6b47a",
  soilDark: "#b78f55",
  soilShadow: "#a77d47",
  soilLight: "#ecd39b",
  pebble: "#8f6a3e",
  hedge: "#2c6630",
  hedgeDark: "#1b4721",
  hedgeLight: "#4e8d3a",
  forest: "#3f8a35",
  ink: "#0c0c14",
  white: "#fcfcfc",
  red: "#e8372c",
  redDark: "#9c1c18",
  yellow: "#f8b800",
  orange: "#fc7a1c",
};

// ---------- Seeded textures ----------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(size: number, fill: string): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

function put(grid: string[][], x: number, y: number, char: string) {
  const size = grid.length;
  grid[((y % size) + size) % size][((x % size) + size) % size] = char;
}

function texture(key: string, size: number, palette: Palette, draw: (grid: string[][], random: () => number) => void): string {
  return memo(key, () => {
    const grid = canvas(size, "a");
    draw(grid, rng(key.length * 7919 + size));
    return svgUrl(pixelSvg(grid.map(row => row.join("")), palette));
  });
}

/** Tall grass covering closed cells (40×40 art px = 4×4 cells). */
export function grassTexture(): string {
  return texture("grass", 40, { a: MEADOW.grass, m: MEADOW.grassMid, d: MEADOW.grassDark, l: MEADOW.grassLight }, (g, r) => {
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) if (r() < 0.035) put(g, x, y, "m");
    for (let gy = 0; gy < 40; gy += 5) {
      for (let gx = 0; gx < 40; gx += 5) {
        if (r() < 0.38) continue;
        const x = gx + ((gy / 5) % 2) * 2 + Math.floor(r() * 2);
        const y = gy + Math.floor(r() * 2);
        put(g, x, y - 1, "l");
        put(g, x + 2, y - 1, "l");
        put(g, x, y, "d");
        put(g, x + 2, y, "d");
        put(g, x + 1, y + 1, "d");
      }
    }
  });
}

/** Dug soil of opened cells. */
export function soilTexture(): string {
  return texture("soil", 40, { a: MEADOW.soil, d: MEADOW.soilDark, l: MEADOW.soilLight, p: MEADOW.pebble }, (g, r) => {
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 40; x++) {
        const v = r();
        if (v < 0.05) put(g, x, y, "d");
        else if (v < 0.09) put(g, x, y, "l");
      }
    }
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(r() * 40);
      const y = Math.floor(r() * 40);
      put(g, x, y, "p");
      put(g, x + 1, y, "d");
      put(g, x, y - 1, "l");
    }
  });
}

/** Hedge that frames the field. */
export function hedgeTexture(): string {
  return texture("hedge", 20, { a: MEADOW.hedge, d: MEADOW.hedgeDark, l: MEADOW.hedgeLight }, (g, r) => {
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(r() * 20);
      const y = Math.floor(r() * 20);
      put(g, x, y, "l");
      put(g, x + 1, y, "l");
      put(g, x, y + 1, "d");
      put(g, x + 1, y + 1, "d");
      put(g, x + 2, y + 1, "d");
    }
  });
}

/** Meadow outside the hedge: shorter grass with scattered flowers (80×80 art px). */
export function forestTexture(): string {
  return texture("forest", 80, { a: MEADOW.forest, d: MEADOW.grassDark, l: MEADOW.grassLight, w: MEADOW.white, y: MEADOW.yellow }, (g, r) => {
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(r() * 80);
      const y = Math.floor(r() * 80);
      put(g, x, y, "d");
      put(g, x + 2, y, "d");
      put(g, x + 1, y + 1, "d");
    }
    for (let i = 0; i < 9; i++) {
      const x = Math.floor(r() * 80);
      const y = Math.floor(r() * 80);
      put(g, x, y - 1, "w");
      put(g, x - 1, y, "w");
      put(g, x + 1, y, "w");
      put(g, x, y + 1, "w");
      put(g, x, y, "y");
    }
  });
}

/** Grass blades hanging over the top edge of a dug cell. */
export function fringeTexture(): string {
  return memo("fringe", () =>
    svgUrl(
      pixelSvg(["aaaaaaaaaa", "daslaasdla", "ssssssssss"], {
        a: MEADOW.grass,
        d: MEADOW.grassDark,
        l: MEADOW.grassLight,
        s: MEADOW.soilShadow,
      }),
    ),
  );
}

// ---------- Sprites (8×8 unless noted) ----------
const SPRITES: Record<string, { rows: string[]; palette: Palette }> = {
  flag: {
    rows: [
      "...prr..",
      "...prrrr",
      "...prrRR",
      "...pR...",
      "...p....",
      "...p....",
      "..dpd...",
      ".ddddd..",
    ],
    palette: { p: "#4a3a2a", r: MEADOW.red, R: MEADOW.redDark, d: MEADOW.grassDark },
  },
  mine: {
    rows: [
      "......y.",
      ".....f.o",
      "...kkf..",
      "..kkkkk.",
      ".kwkkkkk",
      ".kgkkkkk",
      ".kkkkkkk",
      "..kkkkk.",
    ],
    palette: { k: "#141418", w: MEADOW.white, g: "#6b6b78", f: "#c9a26a", y: MEADOW.yellow, o: MEADOW.orange },
  },
  crater: {
    rows: [
      "..ssss..",
      ".sdddds.",
      "sdkkkkds",
      "sdkkkkds",
      "sdkkkkds",
      "sdkkkkds",
      ".sdddds.",
      "..ssss..",
    ],
    palette: { s: "#8a5a2c", d: "#5a3418", k: "#241208" },
  },
  cross: {
    rows: ["r......r", ".r....r.", "..r..r..", "...rr...", "...rr...", "..r..r..", ".r....r.", "r......r"],
    palette: { r: MEADOW.red },
  },
  question: {
    rows: ["..yyyy..", ".yy..yy.", ".....yy.", "....yy..", "...yy...", "........", "...yy...", "........"],
    palette: { y: MEADOW.yellow },
  },
  brackets: {
    rows: ["www....www", "w........w", "w........w", "..........", "..........", "..........", "..........", "w........w", "w........w", "www....www"],
    palette: { w: MEADOW.white },
  },
  clock: {
    rows: ["..wwww..", ".w....w.", "w..k...w", "w..k...w", "w..kkk.w", "w......w", ".w....w.", "..wwww.."],
    palette: { w: MEADOW.white, k: MEADOW.yellow },
  },
  trophy: {
    rows: ["yyyyyyyy", "yyyyyyyy", ".yyyyyy.", "..yyyy..", "...yy...", "...yy...", "..yyyy..", ".oooooo."],
    palette: { y: MEADOW.yellow, o: MEADOW.orange },
  },
  shovel: {
    rows: [".....ww.", "......w.", ".....p..", "....p...", "..ss....", ".ssss...", ".sss....", "..s....."],
    palette: { w: "#c9a26a", p: "#8a6a3a", s: "#c8ccd8" },
  },
  pointer: {
    rows: ["w...", "ww..", "www.", "wwww", "www.", "ww..", "w..."],
    palette: { w: MEADOW.yellow },
  },
};

export function spriteUrl(name: keyof typeof SPRITES | string): string {
  const sprite = SPRITES[name];
  if (!sprite) return "none";
  return memo(`sprite:${name}`, () => svgUrl(pixelSvg(sprite.rows, sprite.palette)));
}

/** Sprite centred on a full cell (ART×ART) so it keeps a margin inside the cell. */
export function cellSpriteUrl(name: keyof typeof SPRITES | string): string {
  const sprite = SPRITES[name];
  if (!sprite) return "none";
  return memo(`cell-sprite:${name}`, () => {
    const width = Math.max(...sprite.rows.map(row => row.length));
    const left = Math.floor((ART - width) / 2);
    const top = Math.floor((ART - sprite.rows.length) / 2);
    const rows = Array.from({ length: ART }, (_, y) => {
      const row = sprite.rows[y - top] ?? "";
      return ".".repeat(left) + row.padEnd(width, ".") + ".".repeat(Math.max(0, ART - left - width));
    });
    return svgUrl(pixelSvg(rows, sprite.palette));
  });
}

// Bold 6×7 digits, centred in the cell with a 1px soil shadow underneath.
const DIGITS: Record<number, string[]> = {
  1: ["..XX..", ".XXX..", "..XX..", "..XX..", "..XX..", "..XX..", ".XXXX."],
  2: [".XXXX.", "XX..XX", "....XX", "..XXX.", ".XX...", "XX....", "XXXXXX"],
  3: [".XXXX.", "XX..XX", "....XX", "..XXX.", "....XX", "XX..XX", ".XXXX."],
  4: ["...XX.", "..XXX.", ".XXXX.", "XX.XX.", "XXXXXX", "...XX.", "...XX."],
  5: ["XXXXXX", "XX....", "XXXXX.", "....XX", "....XX", "XX..XX", ".XXXX."],
  6: [".XXXX.", "XX....", "XXXXX.", "XX..XX", "XX..XX", "XX..XX", ".XXXX."],
  7: ["XXXXXX", "....XX", "...XX.", "..XX..", "..XX..", "..XX..", "..XX.."],
  8: [".XXXX.", "XX..XX", "XX..XX", ".XXXX.", "XX..XX", "XX..XX", ".XXXX."],
};

export const DIGIT_COLORS: Record<number, string> = {
  1: "#1f4fd8",
  2: "#18782a",
  3: "#c8221e",
  4: "#4b1fa0",
  5: "#8a3008",
  6: "#0d7480",
  7: "#18181c",
  8: "#5c5c66",
};

export function digitUrl(value: number): string {
  return memo(`digit:${value}`, () => {
    const glyph = DIGITS[value];
    const grid = canvas(ART, ".");
    glyph.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== "X") return;
        if (grid[y + 2][x + 2] === ".") grid[y + 2][x + 2] = "s";
        grid[y + 1][x + 2] = "X";
      }),
    );
    return svgUrl(pixelSvg(grid.map(r => r.join("")), { X: DIGIT_COLORS[value], s: MEADOW.soilShadow }));
  });
}

// 12×12 face for the restart button.
const FACE_BASE = [
  "....kkkk....",
  "..kkyyyykk..",
  ".kyyyyyyyyk.",
  ".kyyyyyyyyk.",
  "kyyyyyyyyyyk",
  "kyyyyyyyyyyk",
  "kyyyyyyyyyyk",
  "kyyyyyyyyyyk",
  "kyyyyyyyyyyk",
  ".kyyyyyyyyk.",
  "..kkyyyykk..",
  "....kkkk....",
];

function face(overrides: Record<number, string>): string[] {
  return FACE_BASE.map((row, y) => overrides[y] ?? row);
}

const FACES: Record<string, string[]> = {
  ready: face({ 4: "kyykyyyykyyk", 5: "kyykyyyykyyk", 7: "kykyyyyyykyk", 8: "kyykkkkkkyyk" }),
  pressing: face({ 4: "kyykyyyykyyk", 5: "kyykyyyykyyk", 7: "kyyyykkyyyyk", 8: "kyyykyykyyyk", 9: ".kyyykkyyyk." }),
  won: face({ 3: ".kyyyyyyyyk.", 4: "kkkkkkkkkkkk", 5: "kykkkyykkkyk", 6: "kyykyyyykyyk", 7: "kykyyyyyykyk", 8: "kyykkkkkkyyk" }),
  lost: face({ 4: "kykykyykykyk", 5: "kyykyyyykyyk", 6: "kykykyykykyk", 8: "kyyykkkkyyyk", 9: ".kykyyyykyk." }),
};

export function faceUrl(state: "ready" | "playing" | "won" | "lost", pressing: boolean): string {
  const key = pressing && (state === "ready" || state === "playing") ? "pressing" : state === "playing" ? "ready" : state;
  return memo(`face:${key}`, () => svgUrl(pixelSvg(FACES[key], { k: MEADOW.ink, y: MEADOW.yellow })));
}
