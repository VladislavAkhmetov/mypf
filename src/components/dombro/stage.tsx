"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import s from "./stage.module.css";

interface FitStageProps {
  designW: number;
  designH: number;
  /** Below this container width the composition becomes a simple column. */
  minW: number;
  className?: string;
  /** Quiet mode: cards only fade in from blur; no float, parallax or movement. */
  calm?: boolean;
  children: ReactNode;
}

/**
 * A fixed-size composition that scales to its container, reveals once in view and
 * shifts its layers with the pointer. Narrow containers fall back to a column.
 */
export function FitStage({ designW, designH, minW, className = "", calm = false, children }: FitStageProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = outer.current;
    if (!node) return;
    const resize = new ResizeObserver(() => setWidth(node.clientWidth));
    resize.observe(node);
    const reveal = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); reveal.disconnect(); }
    }, { threshold: .12 });
    reveal.observe(node);
    return () => { resize.disconnect(); reveal.disconnect(); };
  }, []);

  const stacked = width > 0 && width < minW;
  const scale = width > 0 ? Math.min(1, width / designW) : 1;

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (calm || stacked || event.pointerType !== "mouse" || !outer.current || !inner.current) return;
    const rect = outer.current.getBoundingClientRect();
    inner.current.style.setProperty("--mx", String(((event.clientX - rect.left) / rect.width - .5) * 2));
    inner.current.style.setProperty("--my", String(((event.clientY - rect.top) / rect.height - .5) * 2));
  };
  const leave = () => { inner.current?.style.setProperty("--mx", "0"); inner.current?.style.setProperty("--my", "0"); };

  return (
    <div
      ref={outer}
      className={`${s.fit} ${className}`}
      data-in={seen}
      data-stacked={stacked}
      data-calm={calm}
      style={stacked ? undefined : { height: designH * scale }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <div
        ref={inner}
        className={s.canvas}
        style={stacked ? undefined : { width: designW, height: designH, marginLeft: -designW / 2, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

interface StageItemProps {
  x: number;
  y: number;
  w: number;
  /** Reveal order (staggers entrance and float phase). */
  i?: number;
  /** Pointer parallax strength in px. */
  depth?: number;
  /** Scroll parallax strength in px (uses --p from an ancestor). */
  par?: number;
  /** Entrance offset in px. */
  fx?: number;
  fy?: number;
  /** Float period in seconds; 0 keeps the item still. */
  dur?: number;
  /** Order and visibility when the stage collapses to a column. */
  order?: number;
  hideStacked?: boolean;
  /** Fixed height in px so neighbours in a row share one height. */
  h?: number;
  caption?: { title: string; text: string };
  className?: string;
  children: ReactNode;
}

export function StageItem({ x, y, w, i = 0, depth = 10, par = 0, fx = 0, fy = 40, dur = 8, order = 0, hideStacked, h, caption, className = "", children }: StageItemProps) {
  const vars = {
    "--x": x, "--y": y, "--w": w, "--i": i, "--depth": depth, "--par": par,
    "--fx": `${fx}px`, "--fy": `${fy}px`, "--dur": `${dur}s`, "--ph": `${-i * 1.7}s`, "--order": order, ...(h ? { "--h": h } : {}),
  } as CSSProperties;
  return (
    <div className={`${s.item} ${className}`} style={vars} data-hide={hideStacked ? "stack" : undefined} data-fixed={h ? "true" : undefined}>
      <div className={s.enter}>
        <div className={s.drift} data-still={dur === 0}>
          {children}
          {caption && (
            <div className={s.cap}>
              <div className={s.capTitle}>{caption.title}</div>
              <div className={s.capText}>{caption.text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
