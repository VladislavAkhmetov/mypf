"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useLocale } from "@/lib/i18n";
import { dombroCopy as copy } from "@/data/dombro";
import { CapturePlate, FocusPlate, SpacePlate } from "./plates";
import { BRANDS } from "./brands";
import s from "./story.module.css";

const DESIGN_W = 1200;
const DESIGN_H = 780;
const TILE_COUNT = 72;
const TILE_W = 14; // em; the lane is 22em tall, so its height drives all sizes
const TILE_H = 22;
const TILE_GAP = 0;

// Scroll timeline (0..1)
const FLY_END = 0.5;        // tabs fly in and speed up
const DUST_LEN = 0.12;      // streak crumbles into dust
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

// A shuffled run of well-known tabs, deterministic between renders.
const TILES = Array.from({ length: TILE_COUNT }, (_, index) => BRANDS[(index * 17 + 3 * Math.floor(index / BRANDS.length)) % BRANDS.length]);

// An open browser tab: favicon only. The whole strip fades out downward.
function Tile({ brand }: { brand: (typeof BRANDS)[number] }) {
  return (
    <div className={s.tile} style={{ "--h": brand.hex } as CSSProperties}>
      <svg viewBox="0 0 24 24" className={s.glyph} aria-hidden="true"><path d={brand.path} fill="currentColor" /></svg>
    </div>
  );
}

function Heads() {
  const { t } = useLocale();
  return (
    <div className={s.heads}>
      <h2 className={`${s.head} ${s.headA}`}>{t(copy.calmTitle)}</h2>
      <h2 className={`${s.head} ${s.headB}`} id="dombro-story-title">{t(copy.uiTitle)}</h2>
    </div>
  );
}

function Plates({ stacked }: { stacked?: boolean }) {
  const { t } = useLocale();
  const cap = (id: string) => copy.cards.find(card => card.id === id)!;
  const item = (id: string, start: number, node: ReactNode, className: string) => (
    <div className={`${s.plate} ${stacked ? s.plateStacked : className}`} style={{ "--s": start } as CSSProperties}>
      {node}
      <div className={s.cap}><div className={s.capTitle}>{t(cap(id).title)}</div><div className={s.capText}>{t(cap(id).text)}</div></div>
    </div>
  );
  return (
    <>
      {item("focus", 0.84, <FocusPlate />, s.pFocus)}
      {item("space", 0.89, <SpacePlate />, s.pSpace)}
      {item("capture", 0.94, <CapturePlate />, s.pCapture)}
    </>
  );
}

interface Particle { x: number; y: number; vx: number; vy: number; size: number; delay: number; color: string; wob: number }

/**
 * Pinned scene driven by scroll. Giant browser tabs of well-known sites fly right to left,
 * accelerate into one horizontal motion blur, crumble into dust, then the heading changes
 * and live plates appear one by one.
 */
export function Story({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null> }) {
  const trackRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const root = scrollRef.current, track = trackRef.current, pin = pinRef.current;
    const lane = laneRef.current, row = rowRef.current, blur = blurRef.current, canvas = canvasRef.current;
    if (!root || !track || !pin || !lane || !row || !blur || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, th = 0, rowLen = 0, laneTop = 0, dpr = 1;
    let particles: Particle[] = [];
    let frame = 0, prevD = 0, blurNow = 0, lastP = -1, dustDrawn = false;

    const buildParticles = () => {
      const rand = (() => { let a = 1234567; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
      const count = Math.round(Math.min(11000, (W * th) / 55));
      particles = Array.from({ length: count }, () => {
        const x = rand() * W;
        const brand = BRANDS[Math.floor(rand() * BRANDS.length)];
        const tone = rand();
        return {
          x, y: laneTop + Math.pow(rand(), 1.7) * th,
          vx: 70 + rand() * 360, vy: (rand() - 0.72) * 260,
          size: 1.6 + rand() * 3.4, delay: (x / W) * 0.5 + rand() * 0.08,
          color: tone < 0.22 ? "#c9d9f7" : tone < 0.3 ? "#ffffff" : brand.hex, wob: rand() * Math.PI * 2,
        };
      });
    };

    const fit = () => {
      W = pin.clientWidth; H = pin.clientHeight;
      // Phones: a smaller strip of tabs in the middle of the screen; wide windows: pinned to the top.
      const phone = W < 820;
      th = phone ? Math.min(H * 0.34, 300) : Math.min(H * 0.56, 480);
      laneTop = phone ? (H - th) / 2 : 72;
      const pitch = th * ((TILE_W + TILE_GAP) / TILE_H);
      rowLen = pitch * TILE_COUNT;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      pin.style.setProperty("--th", `${th}px`);
      pin.style.setProperty("--sc", String(Math.min(1, W / DESIGN_W, Math.max(0.5, (H - 72) / DESIGN_H))));
      setNarrow(W < 820);
      buildParticles();
      lastP = -1;
      schedule();
    };

    const tick = () => {
      frame = 0;
      const vh = root.clientHeight;
      track.style.setProperty("--vh", `${vh}px`);
      let p = 1;
      if (!reduced) {
        const top = track.getBoundingClientRect().top - root.getBoundingClientRect().top;
        const total = Math.max(1, (track.offsetHeight - vh) * 0.94);
        p = clamp01(-top / total);
      }
      track.style.setProperty("--p", p.toFixed(4));
      if (reduced) { lane.style.display = "none"; canvas.style.display = "none"; return; }

      // 1) Tabs fly in from the right and accelerate
      const u = clamp01(p / FLY_END);
      const travel = rowLen - W * 1.1;
      const D = travel * Math.pow(u, 2.2);
      row.style.transform = `translate3d(${(W - D).toFixed(1)}px,0,0)`;

      // 2) Directional motion blur follows the speed (and always streaks near the end)
      const speed = Math.abs(D - prevD);
      prevD = D;
      const forced = clamp01((u - 0.7) / 0.3) * 70;
      const target = Math.min(130, speed * 0.32 + forced);
      blurNow += (target - blurNow) * 0.35;
      blur.setAttribute("stdDeviation", `${blurNow.toFixed(2)} 0`);
      lane.style.filter = blurNow > 0.4 ? "url(#dombro-motion)" : "none";

      // 3) The streak crumbles into dust, left to right, like a deleted message
      const q = clamp01((p - FLY_END) / DUST_LEN);
      lane.style.setProperty("--m", String(q * 135 - 35));
      lane.style.opacity = p >= FLY_END + DUST_LEN ? "0" : "1";
      if (ctx) {
        if (q > 0 && q < 1) {
          dustDrawn = true;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          for (const part of particles) {
            const local = clamp01((q - part.delay) / 0.5);
            if (local <= 0) {
              ctx.globalAlpha = 0;
              continue;
            }
            const e = 1 - Math.pow(1 - local, 2);
            const px = part.x + part.vx * e;
            const py = part.y + part.vy * e + Math.sin(part.wob + local * 6) * 10 * local;
            ctx.globalAlpha = Math.pow(1 - local, 1.3);
            ctx.fillStyle = part.color;
            const size = part.size * (1 - local * 0.5);
            ctx.fillRect(px, py, size, size);
          }
          ctx.globalAlpha = 1;
        } else if (dustDrawn) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          dustDrawn = false;
        }
      }

      const moving = Math.abs(target - blurNow) > 0.05 || Math.abs(p - lastP) > 0.0001;
      lastP = p;
      if (moving) schedule();
    };
    function schedule() { if (!frame) frame = requestAnimationFrame(tick); }

    const resize = new ResizeObserver(fit);
    resize.observe(pin); resize.observe(root);
    root.addEventListener("scroll", schedule, { passive: true });
    fit();
    return () => { resize.disconnect(); root.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, [scrollRef]);

  return (
    <>
      <section ref={trackRef} className={s.track} aria-labelledby="dombro-story-title" data-narrow={narrow}>
        <div ref={pinRef} className={s.pin}>
          <div className={s.wash} aria-hidden="true" />
          <svg className={s.defs} width="0" height="0" aria-hidden="true" focusable="false">
            <filter id="dombro-motion" x="0" y="-2%" width="100%" height="104%" colorInterpolationFilters="sRGB">
              <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
            </filter>
          </svg>
          <div className={s.laneWrap} aria-hidden="true">
            <div ref={laneRef} className={s.lane}>
              <div ref={rowRef} className={s.row}>
                {TILES.map((brand, index) => <Tile key={index} brand={brand} />)}
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className={s.dust} aria-hidden="true" />
          {narrow ? (
            <div className={s.narrowPin}><Heads /></div>
          ) : (
            <div className={s.frame}>
              <div className={s.canvas}>
                <div className={s.headSlot}><Heads /></div>
                <Plates />
              </div>
            </div>
          )}
        </div>
      </section>
      {narrow && <div className={s.stack}><Plates stacked /></div>}
    </>
  );
}
