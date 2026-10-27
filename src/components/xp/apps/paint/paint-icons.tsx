import React from "react";
import type { Tool } from "./paint-engine";

// 16×16 tool glyphs in the spirit of the Windows XP Paint toolbox.
export function ToolIcon({ tool }: { tool: Tool }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true, shapeRendering: "geometricPrecision" as const };
  switch (tool) {
    case "eraser":
      return (
        <svg {...common}>
          <path d="M2 10.5 7.5 5l5 5L9 13.5H5z" fill="#f7a8c4" stroke="#7a2e4a" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M7.5 5 10 2.5l5 5-2.5 2.5z" fill="#fff" stroke="#7a2e4a" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M1 14.5h14" stroke="#555" strokeWidth=".8" />
        </svg>
      );
    case "fill":
      return (
        <svg {...common}>
          <path d="M3 7.5 8 2.5l5 5-5 5z" fill="#d9e4f2" stroke="#2b3d5c" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M3 7.5h10L8 12.5z" fill="#3b78e7" />
          <path d="M13.5 9c.8 1.3 1.3 2.2 1.3 2.9a1.3 1.3 0 0 1-2.6 0c0-.7.5-1.6 1.3-2.9z" fill="#3b78e7" stroke="#163f86" strokeWidth=".6" />
        </svg>
      );
    case "picker":
      return (
        <svg {...common}>
          <path d="M10 2.5a2.2 2.2 0 0 1 3.5 3.5L12 7.5 8.5 4z" fill="#3a3a42" />
          <path d="M8.5 4 12 7.5l-6 6-2.5.5.5-2.5z" fill="#cfe8ff" stroke="#2b3d5c" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M4.5 11.5 7 9" stroke="#3b78e7" strokeWidth="1.6" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...common}>
          <path d="M3 13l1-3.5 7.5-7.5 2.5 2.5L6.5 12z" fill="#f6c343" stroke="#7a5d14" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M11.5 2l2.5 2.5" stroke="#e46a9a" strokeWidth="2" />
          <path d="M3 13l1-3.5 2.5 2.5z" fill="#f3dfb5" stroke="#7a5d14" strokeWidth=".7" strokeLinejoin="round" />
          <path d="M3 13l.4-1.4 1 1z" fill="#222" />
        </svg>
      );
    case "brush":
      return (
        <svg {...common}>
          <path d="M9 7 14 2" stroke="#8a5a2c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M8 6.5l1.5 1.5-1 1-1.5-1.5z" fill="#b8bcc8" stroke="#555" strokeWidth=".6" />
          <path d="M7 7.5c-2.5.2-3.5 2-3.8 3.6-.2 1.3-1 2.2-2.2 2.9 3.2.6 6-.3 7-2.5.5-1.1.4-2.4-1-4z" fill="#3b78e7" stroke="#163f86" strokeWidth=".7" />
        </svg>
      );
    case "airbrush":
      return (
        <svg {...common}>
          <rect x="7" y="5" width="5" height="9" rx="1" fill="#c8ccd8" stroke="#4a4a52" strokeWidth=".8" />
          <rect x="8" y="3" width="3" height="2" fill="#4a4a52" />
          <g fill="#e2372c">
            <circle cx="4.5" cy="2.5" r=".7" /><circle cx="2.5" cy="4" r=".7" /><circle cx="5" cy="5" r=".7" /><circle cx="3" cy="6.5" r=".7" /><circle cx="1.5" cy="2" r=".6" />
          </g>
        </svg>
      );
    case "line":
      return (
        <svg {...common}>
          <path d="M2.5 13.5 13.5 2.5" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "rect":
      return (
        <svg {...common}>
          <rect x="2" y="3.5" width="12" height="9" fill="none" stroke="#111" strokeWidth="1.4" />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...common}>
          <ellipse cx="8" cy="8" rx="6" ry="4.5" fill="none" stroke="#111" strokeWidth="1.4" />
        </svg>
      );
    case "roundrect":
      return (
        <svg {...common}>
          <rect x="2" y="3.5" width="12" height="9" rx="3" fill="none" stroke="#111" strokeWidth="1.4" />
        </svg>
      );
  }
}
