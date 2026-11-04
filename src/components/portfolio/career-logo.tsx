import { useId } from "react";
import type { CareerLogoKind } from "@/data/career";
import styles from "./portfolio-landing.module.css";

type Logo = {
  /** Path data in a 100×100 box. */
  d: string;
  /** Draw as a stroke of this width instead of a fill (for line marks). */
  stroke?: number;
  /** Soft gloss: light top, brand colour, darker base. */
  light: string;
  base: string;
  dark: string;
};

/** Simplified, extrudable versions of the company marks. */
const logos: Record<CareerLogoKind, Logo> = {
  // No single company for the marketing years: a Y2K sparkle.
  spark: {
    d: "M50 3C54 33 67 46 97 50C67 54 54 67 50 97C46 67 33 54 3 50C33 46 46 33 50 3Z",
    light: "#ffa27a",
    base: "#ff4b16",
    dark: "#c4300a",
  },
  // Ochkarik: the "Оч" ligature — a ring with the "ч" hooking over its right edge.
  ochkarik: {
    d: "M6 52a35 33 0 1 0 70 0a35 33 0 1 0 -70 0ZM64 46C66 56 71 62 79 61C85 60 90 55 92 49M92 40V84",
    stroke: 7,
    light: "#8ddcff",
    base: "#1aa6ea",
    dark: "#0b74b3",
  },
  // Hygear: trapezoid, Y and two circle segments.
  hygear: {
    d:
      "M14 4H86L78 15H22Z" +
      "M27 25A40 40 0 0 0 44 97.6Q33 62 27 25Z" +
      "M73 25A40 40 0 0 1 56 97.6Q67 62 73 25Z" +
      "M31 24H42L50 44L58 24H69L54 60L51.2 97H48.8L46 60Z",
    light: "#ffffff",
    base: "#d7dae0",
    dark: "#8f959f",
  },
  // Tsekh: the X with horizontal ends, proportions traced from the original mark.
  tsekh: {
    d: "M2 20.2H24.3L50 37.7L75.7 20.2H98V36.2H87.8L68 50L87.8 63.8H98V79.8H75.7L50 62.3L24.3 79.8H2V63.8H12.2L32 50L12.2 36.2H2Z",
    light: "#95a5ff",
    base: "#3d5af1",
    dark: "#2337c2",
  },
};

const DEPTH_LAYERS = 9;

/** Mix two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
function mix(a: string, b: string, t: number) {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map(i => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t).toString(16).padStart(2, "0")).join("")}`;
}

export function CareerLogo({ kind }: { kind: CareerLogoKind }) {
  const id = useId().replace(/:/g, "");
  const { d, stroke, light, base, dark } = logos[kind];
  const paint = (color: string) =>
    stroke ? { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const } : { fill: color };

  return (
    <div className={styles.logoCube} data-logo={kind}>
      {Array.from({ length: DEPTH_LAYERS }, (_, layer) => {
        const isFront = layer === DEPTH_LAYERS - 1;
        return (
          <svg
            key={layer}
            className={styles.logoLayer}
            viewBox="0 0 100 100"
            style={{ transform: `translateZ(${(layer - (DEPTH_LAYERS - 1) / 2) * 1.3}px)` }}
          >
            {isFront ? (
              <>
                <defs>
                  <linearGradient id={`${id}-gloss`} x1="0" y1="10" x2="0" y2="90" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor={light} />
                    <stop offset="0.5" stopColor={base} />
                    <stop offset="1" stopColor={dark} />
                  </linearGradient>
                  <radialGradient id={`${id}-shine`} cx="38" cy="18" r="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  {!stroke && (
                    <clipPath id={`${id}-clip`}>
                      <path d={d} />
                    </clipPath>
                  )}
                </defs>
                <path d={d} {...paint(`url(#${id}-gloss)`)} />
                {stroke ? (
                  // Specular line along the top edge of the stroke.
                  <path d={d} {...paint("#fff")} strokeWidth={stroke * 0.25} strokeOpacity={0.3} transform="translate(-0.8 -1.4)" />
                ) : (
                  <g clipPath={`url(#${id}-clip)`}>
                    <ellipse cx="38" cy="20" rx="44" ry="26" fill={`url(#${id}-shine)`} />
                    <path d={d} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
                  </g>
                )}
              </>
            ) : (
              // Side walls: darkest at the back, close to the brand colour near the face.
              <path d={d} {...paint(mix(mix(dark, "#000000", 0.45), dark, layer / (DEPTH_LAYERS - 2)))} />
            )}
          </svg>
        );
      })}
    </div>
  );
}
