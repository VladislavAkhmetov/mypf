import type { Motif } from "@/data/projects";

export function Motif({ type, className = "" }: { type: Motif; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      {type === "bezier" && (
        <path
          d="M20 150 C 40 40, 90 30, 110 90 S 170 40, 188 70"
          fill="none"
          stroke="white"
          strokeWidth="1.1"
          opacity="0.28"
        />
      )}
      {type === "bezier" && (
        <>
          <circle cx="40" cy="40" r="2.2" fill="white" opacity="0.45" />
          <circle cx="110" cy="90" r="2.2" fill="white" opacity="0.45" />
          <circle cx="170" cy="40" r="2.2" fill="white" opacity="0.45" />
        </>
      )}
      {type === "binary" && (
        <text
          x="18"
          y="40"
          fill="white"
          opacity="0.18"
          fontSize="13"
          fontFamily="ui-monospace, monospace"
        >
          {["010010 110101", "101101 001011", "110010 111000", "001101 100110", "111011 010001"].map(
            (row, i) => (
              <tspan key={row} x="18" dy={i === 0 ? 0 : 28}>
                {row}
              </tspan>
            ),
          )}
        </text>
      )}
      {type === "grid" && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={`h${i}`}
              d={`M10 ${30 + i * 18} L 190 ${20 + i * 22}`}
              stroke="white"
              strokeWidth="0.6"
              opacity="0.18"
            />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <path
              key={`v${i}`}
              d={`M${24 + i * 24} 12 L ${40 + i * 22} 188`}
              stroke="white"
              strokeWidth="0.6"
              opacity="0.16"
            />
          ))}
        </>
      )}
      {type === "bars" &&
        [28, 48, 70, 96, 124, 148, 172].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={18 + (i % 3) * 8}
            width="8"
            height={150 - (i % 4) * 18}
            fill="white"
            opacity={0.08 + (i % 3) * 0.04}
          />
        ))}
      {type === "iris" && (
        <>
          <circle cx="100" cy="100" r="58" fill="none" stroke="white" strokeWidth="0.8" opacity="0.22" />
          <circle cx="100" cy="100" r="34" fill="none" stroke="white" strokeWidth="0.8" opacity="0.28" />
          <circle cx="100" cy="100" r="12" fill="white" opacity="0.2" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * 16}
                y1={100 + Math.sin(a) * 16}
                x2={100 + Math.cos(a) * 70}
                y2={100 + Math.sin(a) * 70}
                stroke="white"
                strokeWidth="0.6"
                opacity="0.16"
              />
            );
          })}
        </>
      )}
      {type === "orbit" && (
        <>
          <ellipse cx="100" cy="100" rx="72" ry="28" fill="none" stroke="white" strokeWidth="0.8" opacity="0.22" />
          <ellipse cx="100" cy="100" rx="28" ry="72" fill="none" stroke="white" strokeWidth="0.8" opacity="0.16" />
          <circle cx="172" cy="100" r="4" fill="white" opacity="0.45" />
        </>
      )}
      {type === "fold" && (
        <path
          d="M30 30 L170 30 L170 170 L30 170 Z M30 30 L100 80 L170 30 M30 170 L100 80 L170 170"
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          opacity="0.22"
        />
      )}
      {type === "wave" && (
        <path
          d="M8 110 C 40 60, 70 160, 100 110 S 160 60, 196 120"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.28"
        />
      )}
      {type === "lock" && (
        <>
          <rect x="70" y="92" width="60" height="48" rx="8" fill="none" stroke="white" strokeWidth="1.2" opacity="0.28" />
          <path
            d="M82 92 V78 a18 18 0 0 1 36 0 V92"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
            opacity="0.28"
          />
        </>
      )}
      {type === "atlas" && (
        <>
          <ellipse cx="100" cy="100" rx="70" ry="44" fill="none" stroke="white" strokeWidth="0.8" opacity="0.22" />
          <path d="M100 56 C 70 80, 70 120, 100 144 C 130 120, 130 80, 100 56" fill="none" stroke="white" strokeWidth="0.8" opacity="0.22" />
          <path d="M32 100 H168" stroke="white" strokeWidth="0.6" opacity="0.16" />
        </>
      )}
      {type === "pulp" && (
        <text
          x="24"
          y="120"
          fill="white"
          opacity="0.22"
          fontSize="54"
          fontFamily="ui-serif, Georgia, serif"
        >
          №
        </text>
      )}
      {type === "spark" && (
        <path
          d="M108 18 L92 92 L132 92 L88 186 L112 108 L72 108 Z"
          fill="white"
          opacity="0.14"
        />
      )}
    </svg>
  );
}
