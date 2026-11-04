"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Climate_Crisis } from "next/font/google";
import localFont from "next/font/local";
import { useLocale } from "@/lib/i18n";
import { kroomiCopy as c, kroomiLinks, kroomiPets, kroomiSpecies, type KroomiPetId } from "@/data/kroomi";
import s from "./kroomi-landing.module.css";

// The app's own type pair: Climate Crisis for display (always lowercase), TikTok Sans for text.
const display = Climate_Crisis({ subsets: ["latin", "cyrillic"], weight: "400", display: "swap", variable: "--font-kroomi-display" });
const body = localFont({
  src: [{ path: "./fonts/tiktok-sans-500.ttf", weight: "500" }, { path: "./fonts/tiktok-sans-700.ttf", weight: "700" }],
  display: "swap",
  variable: "--font-kroomi-body",
});

const img = (name: string) => `/images/kroomi/${name}.webp`;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const PET_IDS = Object.keys(kroomiPets) as KroomiPetId[];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`${s.arrow} ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M14 14 H86 V86" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
      {/* the shaft ends inside the corner with a flat cap, so the join stays one clean angle */}
      <path d="M6.7 93.3 L86 14" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="butt" />
    </svg>
  );
}

// Characters are clean silhouettes without eyes: the body colour is painted through a mask, the eyes are live and follow the pointer.
function Pet({ id, className = "", jumping = false, onPoke, tip }: { id: KroomiPetId; className?: string; jumping?: boolean; onPoke?: () => void; tip?: { text: string; tone: string } }) {
  const p = kroomiPets[id];
  const sp = kroomiSpecies[p.species];
  return (
    <div
      className={`${s.pet} ${className}`}
      style={{ aspectRatio: sp.ratio, "--iris": p.iris, "--body": p.body, "--mask": `url(${img(sp.src)})`, "--ed": `${sp.eye.d}%`, "--bd": `${-(PET_IDS.indexOf(id) * 1.7 + 0.3)}s` } as CSSProperties}
      data-jump={jumping}
      data-cursor={tip?.text}
      data-tone={tip?.tone}
      onClick={onPoke}
    >
      <div className={s.petBody} />
      <div className={s.petEyes} data-eyes aria-hidden="true" style={{ left: `${sp.eye.x}%`, top: `${sp.eye.y}%`, width: `${sp.eye.w}%` }}>
        {[0, 1].map(i => <span key={i} className={s.pe}><span className={s.lens}><span className={s.iris}><i /></span></span></span>)}
      </div>
    </div>
  );
}

// Live eyes that stand in for the "o"s of a big word: they blink and follow the pointer like the characters'.
function Eye() {
  return <span className={s.pe}><span className={s.lens}><span className={s.iris}><i /></span></span></span>;
}
function WordEyes({ single = false }: { single?: boolean }) {
  return (
    <span className={s.wordEyes} data-eyes aria-hidden="true">
      <span className={s.eyesRow}>
        <Eye />
        {!single && <Eye />}
      </span>
    </span>
  );
}

// "Soon" becomes "s[eyes]n". Without a double o ("Скоро") the first two o's each turn into one eye.
function withEyes(word: string) {
  const pair = word.split(/oo/i);
  if (pair.length === 2) return <>{pair[0]}<WordEyes />{pair[1]}</>;
  const apart = word.match(/^(.*?)[оo](.+?)[оo](.*)$/i);
  if (apart) return <>{apart[1]}<WordEyes single />{apart[2]}<WordEyes single />{apart[3]}</>;
  return word;
}

function Phone({ name, alt, className = "" }: { name: string; alt: string; className?: string }) {
  return (
    <div className={`${s.phone} ${className}`}>
      <Image src={img(name)} alt={alt} width={780} height={1688} unoptimized draggable={false} />
    </div>
  );
}

function CtaButton({ goal, tip, className = "" }: { goal: string; tip: { text: string; tone: string }; className?: string }) {
  const { t } = useLocale();
  return (
    <a className={`${s.cta} ${className}`} href={kroomiLinks.notify} target="_blank" rel="noopener noreferrer" data-ym-goal={goal} data-cursor={tip.text} data-tone={tip.tone}>
      {t(c.notify)}
    </a>
  );
}

const APPLE = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
const PLAY = "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z";

function Stores() {
  const { t } = useLocale();
  return (
    <div className={s.stores}>
      {[{ name: "App Store", d: APPLE }, { name: "Google Play", d: PLAY }].map(store => (
        <span key={store.name} className={s.store} aria-disabled="true">
          <svg className={s.storeLogo} viewBox="0 0 24 24" aria-hidden="true"><path d={store.d} fill="currentColor" /></svg>
          <span><small>{t(c.soon)}</small><b>{store.name}</b></span>
        </span>
      ))}
    </div>
  );
}

// {accent} markers inside cursor hints are kept literal, like the typed tips next to the cursor.
const tip = (text: string, tone = "sun") => ({ text, tone });

export function KroomiLanding() {
  const { t, locale, setLocale } = useLocale();
  const shellRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const loopRef = useRef<HTMLElement>(null);
  const pickerRef = useRef<HTMLElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const buddyRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -1, y: -1 });
  const [step, setStep] = useState(0);
  const [feat, setFeat] = useState(0);
  const [compact, setCompact] = useState(false);
  const [jump, setJump] = useState<string | null>(null);
  const [greet, setGreet] = useState(0);

  const poke = (key: string) => () => { setJump(key); window.setTimeout(() => setJump(null), 750); };
  const petTip = tip(t(c.cur.pet), "pink");

  // Eyes look at the pointer; recomputed on scroll too, because the characters move under a still cursor.
  const look = useCallback(() => {
    const root = rootRef.current;
    const { x, y } = pointer.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-eyes]").forEach(el => {
      const r = el.getBoundingClientRect();
      if (x < 0 || r.width === 0) { el.style.setProperty("--lx", "0"); el.style.setProperty("--ly", "0"); return; }
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (r.width * .9));
      el.style.setProperty("--lx", String((dx / d) * k));
      el.style.setProperty("--ly", String((dy / d) * k));
    });
  }, []);

  // The hero greeting cycles through languages.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setGreet(g => (g + 1) % c.greetings.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  // Custom cursor: arrow, a small companion that trails behind, and a typed hint from the nearest [data-cursor].
  useEffect(() => {
    const shell = shellRef.current, arrow = arrowRef.current, buddy = buddyRef.current, tag = tagRef.current, layer = layerRef.current;
    if (!shell || !arrow || !buddy || !tag || !layer) return;
    const state = { x: 0, y: 0, bx: 0, by: 0, raf: 0, text: "", timer: 0, started: false };
    const fine = window.matchMedia("(pointer: fine)").matches;

    const place = () => {
      state.raf = 0;
      state.bx += (state.x - state.bx) * .18;
      state.by += (state.y - state.by) * .18;
      arrow.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      buddy.style.transform = `translate3d(${state.bx + 16}px, ${state.by + 14}px, 0)`;
      // the companion eyes keep watching the pointer tip
      const dx = state.x - (state.bx + 16 + 22), dy = state.y - (state.by + 14 + 9), dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / 34);
      buddy.style.setProperty("--lx", String((dx / dist) * k));
      buddy.style.setProperty("--ly", String((dy / dist) * k));
      const w = tag.offsetWidth, flip = state.bx + 58 + w > shell.clientWidth - 8;
      tag.style.transform = `translate3d(${flip ? state.bx - w - 14 : state.bx + 52}px, ${state.by + 24}px, 0)`;
      if (Math.abs(state.x - state.bx) + Math.abs(state.y - state.by) > .4) state.raf = requestAnimationFrame(place);
    };
    const kick = () => { if (!state.raf) state.raf = requestAnimationFrame(place); };

    const setTag = (text: string, tone: string) => {
      if (text === state.text) { tag.dataset.tone = tone; return; }
      state.text = text;
      window.clearInterval(state.timer);
      tag.dataset.on = text ? "true" : "false";
      if (!text) return;
      tag.dataset.tone = tone;
      let i = 0;
      tag.textContent = "";
      state.timer = window.setInterval(() => {
        i += 1;
        tag.textContent = text.slice(0, i);
        if (i >= text.length) window.clearInterval(state.timer);
      }, 26);
    };

    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      look();
      if (!fine || event.pointerType === "touch") return;
      const rect = shell.getBoundingClientRect();
      state.x = event.clientX - rect.left;
      state.y = event.clientY - rect.top;
      if (!state.started) { state.started = true; state.bx = state.x; state.by = state.y; }
      layer.dataset.on = "true";
      const target = event.target as Element | null;
      const hint = target?.closest?.<HTMLElement>("[data-cursor]");
      setTag(hint?.dataset.cursor ?? "", hint?.dataset.tone ?? "sun");
      arrow.dataset.hot = String(Boolean(target?.closest?.("a, button, [data-poke]")));
      kick();
    };
    const onLeave = () => { layer.dataset.on = "false"; pointer.current = { x: -1, y: -1 }; look(); };
    const onDown = () => { arrow.dataset.press = "true"; };
    const onUp = () => { arrow.dataset.press = "false"; };

    if (fine) shell.dataset.fine = "true";
    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);
    shell.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
      shell.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.clearInterval(state.timer);
      cancelAnimationFrame(state.raf);
      delete shell.dataset.fine;
    };
  }, [look]);

  // Scroll: one big character travels hero -> loop, the loop and the picker are pinned and driven by progress.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("section[data-bar]"));
    const paint = () => {
      frame = 0;
      const st = root.scrollTop, vh = root.clientHeight;
      root.style.setProperty("--vh", `${vh}px`);
      root.style.setProperty("--hq", String(clamp01(st / vh)));

      const probe = st + 34;
      const under = sections.find(el => el.offsetTop <= probe && probe < el.offsetTop + el.offsetHeight);
      if (barRef.current && under) {
        barRef.current.dataset.bar = under.dataset.bar ?? "paper";
        barRef.current.style.setProperty("--bar-bg", under.dataset.barbg ?? "var(--violet)");
      }

      const loop = loopRef.current, actor = actorRef.current, picker = pickerRef.current, list = listRef.current;
      if (!compact && loop && actor) {
        const e = ease(clamp01(st / vh));
        const span = Math.max(1, loop.offsetHeight - vh);
        const out = clamp01((st - (loop.offsetTop + span)) / vh);
        // At the top the character stands exactly between the hero's parentheses; it then drifts to the loop position.
        const pl = root.querySelector<HTMLElement>('[data-hero-paren="l"]'), pr = root.querySelector<HTMLElement>('[data-hero-paren="r"]');
        let startX = 50;
        if (pl && pr) {
          const box = root.getBoundingClientRect(), a = pl.getBoundingClientRect(), b = pr.getBoundingClientRect();
          if (box.width > 0) startX = Math.max(30, Math.min(70, (((a.right + b.left) / 2 - box.left) / box.width) * 100));
        }
        actor.style.setProperty("--ax", `${lerp(startX, 73, e)}%`);
        actor.style.setProperty("--ay", String(lerp(.44, .51, e)));
        actor.style.setProperty("--as", String(lerp(1, .84, e)));
        actor.style.setProperty("--ar", `${lerp(0, -5, e)}deg`);
        actor.style.setProperty("--ao", `${-out * vh}px`);
        actor.style.visibility = out >= 1 ? "hidden" : "visible";
        const lp = clamp01((st - loop.offsetTop) / span);
        setStep(Math.min(c.steps.length - 1, Math.floor(lp * c.steps.length)));
      }
      if (!compact && picker && list) {
        const span = Math.max(1, picker.offsetHeight - vh);
        const pos = clamp01((st - picker.offsetTop) / span) * (c.features.length - 1);
        list.style.setProperty("--pos", String(pos));
        Array.from(list.children).forEach((item, i) => (item as HTMLElement).style.setProperty("--k", String(clamp01(1 - Math.abs(i - pos)))));
        setFeat(Math.round(pos));
      }
      look();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const resize = new ResizeObserver(() => { setCompact(reduced || root.clientWidth < 860); schedule(); });
    resize.observe(root);
    // The headline reflows when the display font loads or the language changes, so re-measure the character's start position.
    const headline = root.querySelector("h1");
    if (headline) resize.observe(headline);
    void document.fonts?.ready.then(schedule);
    root.addEventListener("scroll", schedule, { passive: true });

    const nodes = root.querySelectorAll<HTMLElement>("[data-pop]");
    let observer: IntersectionObserver | null = null;
    if (reduced) nodes.forEach(node => { node.dataset.in = "true"; });
    else {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.in = "true"; observer?.unobserve(entry.target); }
      }), { threshold: .18, rootMargin: "0px 0px -6% 0px" });
      nodes.forEach(node => observer!.observe(node));
    }
    schedule();
    return () => { resize.disconnect(); observer?.disconnect(); root.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, [compact, look, locale]);

  const pop = (delay = 0, extra: Record<string, string | number> = {}): { "data-pop": string; style: CSSProperties } => ({ "data-pop": "", style: { "--d": `${delay}ms`, ...extra } as CSSProperties });
  const aside = (list: string[]) => <span className={s.aside}>{list.map(line => <span key={line}>{line}</span>)}</span>;

  return (
    <div ref={shellRef} className={`${s.shell} ${display.variable} ${body.variable}`}>
      <div ref={rootRef} className={s.root} data-lang={locale}>
        <header ref={barRef} className={s.bar} data-bar="paper">
          <span className={s.brand}><Image src="/images/kroomi/logo-wide.svg" alt="kroomi" width={756} height={146} unoptimized /></span>
          <ol className={s.navSteps}>
            {c.nav.map((item, i) => <li key={i}><i aria-hidden="true" />{t(item)}</li>)}
          </ol>
          <div className={s.barRight}>
            <div className={s.lang} role="group" aria-label="Language">
              {(["ru", "en"] as const).map(code => <button key={code} type="button" aria-pressed={locale === code} onClick={() => setLocale(code)}>{code.toUpperCase()}</button>)}
            </div>
            <CtaButton goal="kroomi_notify" tip={tip(t(c.cur.cta), "lime")} className={s.barCta} />
          </div>
        </header>

        {/* The big character lives between sections: it leaves the hero and settles into the pinned loop. */}
        {!compact && (
          <div ref={actorRef} className={s.actorLayer} aria-hidden="false">
            <div className={s.actorBox}>
              {PET_IDS.filter(id => c.steps.some(st => st.pet === id)).map(id => {
                const idx = c.steps.findIndex(st => st.pet === id);
                return (
                  <div key={id} className={s.actorPet} data-on={idx === step} data-side={idx < step ? "past" : "next"}>
                    <Pet id={id} jumping={jump === `actor-${id}`} onPoke={poke(`actor-${id}`)} tip={petTip} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HERO */}
        <section className={s.hero} data-barbg="var(--violet)" data-bar="paper" data-cursor={t(c.cur.hero)} data-tone="sun">
          {compact && (
            <div className={s.heroPetStatic}>
              <Pet id="hyper" jumping={jump === "hero"} onPoke={poke("hero")} tip={petTip} />
            </div>
          )}
          <div className={s.heroLead}>
            <p key={`l-${locale}`}>{t(c.lead)}</p>
            <Stores />
          </div>
          <div key={greet} className={`${s.chip} ${s.chipBubble} ${s.disp}`} aria-hidden="true">{c.greetings[greet]}</div>
          <div className={s.scrollHint} aria-hidden="true"><Arrow /> <span>{t(c.scroll)}</span></div>
          <h1 className={`${s.h1} ${s.disp}`} key={`t-${locale}`} aria-label={t(c.title)}>
            <span className={s.row} aria-hidden="true">
              <span className={s.mask}><span className={s.word} style={{ "--i": 0 } as CSSProperties}>{t(c.hero.row1)}</span></span>
              <span className={`${s.paren} ${s.parenL}`} data-hero-paren="l">(</span>
              <span className={s.mask}><span className={s.word} style={{ "--i": 1 } as CSSProperties}>{aside(c.hero.aside[locale])}</span></span>
              <span className={s.paren} data-hero-paren="r">)</span>
            </span>
            <span className={s.row} aria-hidden="true">
              <span className={s.mask}><span className={s.word} style={{ "--i": 2 } as CSSProperties}>{t(c.hero.row2)}</span></span>
              <span className={s.mask}><span className={`${s.word} ${s.wordArrow}`} style={{ "--i": 3 } as CSSProperties}><Arrow /></span></span>
            </span>
            <span className={s.row} aria-hidden="true">
              <span className={s.mask}><span className={s.word} style={{ "--i": 4 } as CSSProperties}>{t(c.hero.row3)}</span></span>
            </span>
          </h1>
        </section>

        {/* LOOP: pinned, giant words swap as you scroll */}
        {compact ? (
          <section className={s.flat} data-barbg="var(--blue)" data-bar="paper" aria-labelledby="kroomi-loop">
            <h2 id="kroomi-loop" className={s.srOnly}>{t(c.stepsTitle)}</h2>
            {c.steps.map((st, i) => (
              <article key={i} className={s.flatStage} {...pop(0)}>
                <div className={`${s.flatWords} ${s.disp}`}>
                  {st.words[locale].map((w, j) => <span key={j}>{w}{j === 1 && <Arrow />}</span>)}
                </div>
                <div className={s.flatBody}>
                  <Pet id={st.pet} className={s.flatPet} jumping={jump === `flat-${i}`} onPoke={poke(`flat-${i}`)} tip={petTip} />
                  <Phone name={st.img} alt={st.words[locale].join(" ")} className={s.flatPhone} />
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section ref={loopRef} className={s.loop} data-barbg="var(--blue)" data-bar="paper" aria-labelledby="kroomi-loop" data-cursor={t(c.cur.loop)}>
            <div className={s.pin}>
              <h2 id="kroomi-loop" className={`${s.counter} ${s.disp}`}>({t(c.stepsTitle)})</h2>
              <div className={s.loopWords}>
                {c.steps.map((st, i) => (
                  <div key={i} className={`${s.stage} ${s.disp}`} data-state={i === step ? "on" : i < step ? "past" : "next"}>
                    {st.words[locale].map((w, j) => (
                      <span key={j} className={s.lm}><span className={s.lin} style={{ "--i": j } as CSSProperties}>{w}{j === 1 && <Arrow />}</span></span>
                    ))}
                  </div>
                ))}
              </div>
              <div className={s.loopPhones}>
                {c.steps.map((st, i) => (
                  <div key={i} className={s.loopPhone} data-state={i === step ? "on" : i < step ? "past" : "next"}>
                    <Phone name={st.img} alt={st.words[locale].join(" ")} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PICKER: a long list of words, scroll picks one and swaps the screen */}
        {compact ? (
          <section className={s.flatPick} data-barbg="var(--blue)" data-bar="paper" aria-labelledby="kroomi-picker">
            <h2 id="kroomi-picker" className={`${s.pickHead} ${s.disp}`}>({t(c.featuresTitle)})</h2>
            {c.features.map((f, i) => (
              <article key={i} className={s.flatFeature} {...pop(0)}>
                <b className={`${s.disp} ${s.flatWord}`}>{t(f.word)}</b>
                <Phone name={f.img} alt={t(f.word)} />
              </article>
            ))}
          </section>
        ) : (
          <section ref={pickerRef} className={s.picker} data-barbg="var(--blue)" data-bar="paper" aria-labelledby="kroomi-picker" data-cursor={t(c.cur.picker)} data-tone="pink">
            <div className={s.pin}>
              <div className={s.pickPhones}>
                {c.features.map((f, i) => (
                  <div key={i} className={s.pickPhone} data-state={i === feat ? "on" : i < feat ? "past" : "next"}>
                    <Phone name={f.img} alt={t(f.word)} />
                  </div>
                ))}
              </div>
              <h2 id="kroomi-picker" className={`${s.pickHead} ${s.disp}`}>({t(c.featuresTitle)})</h2>
              <div className={s.listWrap}>
              <ol ref={listRef} className={`${s.list} ${s.disp}`}>
                {c.features.map((f, i) => (
                  <li key={i} data-on={i === feat}>{t(f.word)}</li>
                ))}
              </ol>
              </div>
            </div>
          </section>
        )}

        {/* CHARACTERS: a teaser, no roster */}
        <section className={s.chars} data-barbg="var(--pink)" data-bar="ink" aria-labelledby="kroomi-chars" data-cursor={t(c.cur.chars)} data-tone="lime">
          <h2 id="kroomi-chars" className={`${s.charsTitle} ${s.disp}`} {...pop()}>
            {c.characters.title[locale].map(line => <span key={line}>{line}</span>)}
          </h2>
          <div className={s.cast}>
            {c.characters.cast.map((ch, i) => (
              <div key={ch.id} className={s.castTile} data-poke {...pop(i * 70, { "--bg": ch.bg, "--tilt": `${i % 2 ? 1.6 : -1.6}deg` })}>
                <Pet id={ch.id} className={s.castPet} jumping={jump === `card-${ch.id}`} onPoke={poke(`card-${ch.id}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* FACTS */}
        <section className={s.facts} data-barbg="var(--ink)" data-bar="paper" aria-label="kroomi" data-cursor={t(c.cur.facts)} data-tone="lime">
          {c.facts.map((f, i) => (
            <div key={i} className={s.factRow} {...pop(i * 60, { "--hue": f.color })}>
              <b className={s.disp}>{f.big}</b>
              <span>{t(f.label)}</span>
            </div>
          ))}
        </section>

        {/* FINALE */}
        <section className={s.finale} data-barbg="var(--violet)" data-bar="paper" data-cursor={t(c.cur.finale)} data-tone="lime">
          <Pet id="lazy" className={s.finalePet} jumping={jump === "finale"} onPoke={poke("finale")} tip={petTip} />
          <div className={s.finaleInner}>
            <h2 className={`${s.finaleTitle} ${s.disp}`} aria-label={`${t(c.finale.word)} ${c.finale.aside[locale].join(" ")}`} {...pop()}>
              <span className={s.row} aria-hidden="true">
                <span>{withEyes(t(c.finale.word))}</span>
                <span className={s.paren}>(</span>{aside(c.finale.aside[locale])}<span className={s.paren}>)</span>
              </span>
            </h2>
            <div className={s.finaleCta} {...pop(140)}>
              <CtaButton goal="kroomi_notify_finale" tip={tip(t(c.cur.finale), "lime")} />
              <Stores />
            </div>
          </div>
        </section>
        <footer className={s.foot}><Image className={s.footLogo} src="/images/kroomi/logo-wide.svg" alt="kroomi" width={756} height={146} unoptimized /><span>{t(c.footer)}</span></footer>
      </div>

      {/* Cursor layer: arrow + companion + typed hint */}
      <div ref={layerRef} className={s.cursorLayer} data-on="false" aria-hidden="true">
        <div ref={arrowRef} className={s.curArrow} data-hot="false">
          <svg viewBox="0 0 24 28" width="24" height="28"><path d="M3 2 V22.5 L8.2 17.8 L11.8 25.6 L15 24.2 L11.4 16.6 L18.4 16.2 Z" fill="#f6f2e9" stroke="#17112b" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </div>
        <div ref={buddyRef} className={s.curBuddy}>
          <div className={s.curEyes} data-eyes-cursor>
            {[0, 1].map(i => <span key={i} className={s.pe}><span className={s.lens}><span className={s.iris}><i /></span></span></span>)}
          </div>
        </div>
        <div ref={tagRef} className={s.curTag} data-on="false" data-tone="sun" />
      </div>
    </div>
  );
}
