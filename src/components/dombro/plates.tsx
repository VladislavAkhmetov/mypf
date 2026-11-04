"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Literata } from "next/font/google";
import { useLocale } from "@/lib/i18n";
import { demo } from "@/data/dombro";
import s from "./plates.module.css";

// dombro's own display face for plate titles.
const literata = Literata({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], display: "swap", variable: "--font-dombro-plate" });
export const plateFont = literata.variable;

type IconName = "folder" | "dots" | "layers" | "arrow" | "sun" | "calendar" | "plus" | "bulb" | "bookmark" | "list" | "grid" | "pencil" | "timer" | "headphones" | "play" | "pause" | "next" | "chevron" | "chevronRight" | "mic" | "send" | "globe" | "search" | "check";

const PATHS: Record<IconName, ReactNode> = {
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  dots: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M9 3v4m6-4v4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  bulb: <><path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.1h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" /></>,
  bookmark: <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  pencil: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  timer: <><circle cx="12" cy="13.5" r="7" /><path d="M12 10v4l2.5 1.5M9.5 3h5" /></>,
  headphones: <path d="M4 15v-3a8 8 0 0 1 16 0v3m-16 0a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  next: <path d="M6 5.5v13l9-6.5zM18 5v14" />,
  chevron: <path d="m6 15 6-6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></>,
  send: <path d="M12 19V5m-6 6 6-6 6 6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

function Plate({ tint, className = "", children, label }: { tint?: "warm" | "lilac" | "pill"; className?: string; children: ReactNode; label?: string }) {
  return <div className={`${s.plate} ${tint ? s[tint] : ""} ${className}`} role="group" aria-label={label}>{children}</div>;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Top bar: brand, omnibox, space tabs ---------- */
export function TopbarPlate() {
  const { t } = useLocale();
  const [tab, setTab] = useState(0);
  return (
    <Plate className={s.topbar} label="dombro">
      <div className={s.topMain}>
        <div className={s.brand}><img src="/icons/xp/dombro.svg" alt="" width={32} height={32} draggable={false} /><img className={s.brandLogo} src="/images/dombro/logo.svg" alt="dombro" draggable={false} /></div>
        <div className={s.omni}><Icon name="globe" size={17} /><span>{t(demo.search)}</span><kbd>Ctrl L</kbd></div>
        <div className={s.topActions}><span><Icon name="globe" size={16} />{t(demo.browser)}</span><Icon name="grid" size={17} /><Icon name="search" size={17} /></div>
      </div>
      <div className={s.topTabs}>
        {demo.tabs.map((name, index) => (
          <button key={index} type="button" className={tab === index ? s.tabOn : ""} onClick={() => setTab(index)}>{t(name)}</button>
        ))}
        <span className={s.spacer} /><span className={s.topSpaces}>{t(demo.spaces)} <Icon name="chevron" size={14} className={s.flip} /></span>
      </div>
    </Plate>
  );
}

/* ---------- Space card with the "next step" ---------- */
export function ContinuePlate() {
  const { t } = useLocale();
  return (
    <Plate className={s.continue} label={t(demo.space.title)}>
      <div className={s.head}><span className={s.headLabel}><Icon name="folder" />{t(demo.space.kicker)}</span><Icon name="dots" className={s.muted} /></div>
      <div className={`${s.title} ${s.serif}`}>{t(demo.space.title)}</div>
      <div className={s.meta}>{t(demo.space.opened)}</div>
      <p className={s.next}><span>{t(demo.space.nextLabel)}</span> {t(demo.space.next)}</p>
      <div className={s.chips}>
        <button type="button" className={s.mint}>{t(demo.space.cont)}<Icon name="arrow" size={16} /></button>
        <span className={s.chip}><Icon name="layers" size={17} />{t(demo.space.tabs)}</span>
        <span className={s.chip}>
          <span className={s.apps}><b style={{ background: "#001e36", color: "#31a8ff" }}>Ps</b><b style={{ background: "#001e36", color: "#31a8ff" }}>Ps</b><b style={{ background: "#300", color: "#ff9a00" }}>Ai</b><b style={{ background: "#1d6f42", color: "#fff" }}>X</b></span>
          <span className={s.filesText}>{t(demo.space.files)}</span>
        </span>
      </div>
    </Plate>
  );
}

/* ---------- Tasks: tabs + checkable rows ---------- */
export function TasksPlate() {
  const { t } = useLocale();
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const list = day === "today" ? demo.tasks.todayList : demo.tasks.tomorrowList;
  return (
    <Plate tint="warm" className={s.tasks} label={t(demo.tasks.today)}>
      <div className={s.head}>
        <span className={s.headLabel}>
          <Icon name="sun" className={s.amber} />
          <span className={s.dayTabs}>
            {(["today", "tomorrow"] as const).map(key => (
              <button key={key} type="button" className={day === key ? s.tabOn : ""} onClick={() => setDay(key)}>{t(demo.tasks[key])}</button>
            ))}
          </span>
        </span>
        <span className={s.headIcons}><Icon name="calendar" size={17} /><Icon name="plus" size={17} /></span>
      </div>
      <ul className={s.taskList} key={day}>
        {list.map((task, index) => {
          const id = `${day}-${index}`;
          return (
            <li key={id} className={done[id] ? s.done : ""}>
              <button type="button" className={s.circle} aria-pressed={!!done[id]} aria-label={t(task.t)} onClick={() => setDone(prev => ({ ...prev, [id]: !prev[id] }))}><Icon name="check" size={14} /></button>
              <span className={s.taskText}><span className={s.taskTitle}>{t(task.t)}</span><span className={s.time}>{task.time}</span></span>
            </li>
          );
        })}
      </ul>
      <div className={s.allLink}>{t(demo.tasks.all)}<Icon name="arrow" size={15} /></div>
      <div className={s.thoughts}><span><Icon name="bulb" size={17} className={s.amber} />{t(demo.tasks.thoughts)}<em>4</em></span><Icon name="chevronRight" size={16} className={s.muted} /></div>
    </Plate>
  );
}

/* ---------- Read later: list / tiles ---------- */
export function ReadingPlate({ initial = "list" }: { initial?: "list" | "grid" }) {
  const { t } = useLocale();
  const [view, setView] = useState<"list" | "grid">(initial);
  return (
    <Plate tint="lilac" className={s.reading} label={t(demo.reading.title)}>
      <div className={s.head}>
        <span className={s.headLabel}><Icon name="bookmark" className={s.violet} />{t(demo.reading.title)}<em className={s.count}>6</em></span>
        <span className={s.toggle}>
          {(["list", "grid"] as const).map(key => (
            <button key={key} type="button" aria-label={key} aria-pressed={view === key} className={view === key ? s.tabOn : ""} onClick={() => setView(key)}><Icon name={key} size={15} /></button>
          ))}
        </span>
      </div>
      <ul className={`${s.readList} ${view === "grid" ? s.readGrid : ""}`}>
        {demo.reading.items.map(item => (
          <li key={item.ab}>
            <span className={s.avatar}>{item.ab}</span>
            <span className={s.readText}><span className={s.readTitle}>{t(item.t)}</span><span className={s.meta}>{t(item.meta)}</span></span>
          </li>
        ))}
      </ul>
    </Plate>
  );
}

/* ---------- Focus picker with a working timer ---------- */
export function FocusPlate() {
  const { t } = useLocale();
  const tasks = [...demo.tasks.todayList, ...demo.tasks.tomorrowList].slice(0, 3);
  const [pick, setPick] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null) return;
    const id = window.setInterval(() => setLeft(value => (value === null || value <= 1 ? null : value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left === null]); // eslint-disable-line react-hooks/exhaustive-deps
  const clock = left === null ? "" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  return (
    <Plate className={s.focus} label={t(demo.focus.question)}>
      <div className={`${s.focusQ} ${s.serif}`}>{t(demo.focus.question)}</div>
      <ul className={s.pickList}>
        {tasks.map((task, index) => (
          <li key={index}>
            <button type="button" className={pick === index ? s.picked : ""} onClick={() => setPick(index)}>
              <span className={s.radio} /><span className={s.taskText}><span className={s.taskTitle}>{t(task.t)}</span><span className={s.time}>{index < 2 ? t(demo.tasks.today) : t(demo.tasks.tomorrow)}</span></span>
            </button>
          </li>
        ))}
      </ul>
      <div className={s.focusFoot}>
        <span className={s.seg}>
          {[15, 30, 60].map(value => (
            <button key={value} type="button" className={minutes === value ? s.tabOn : ""} disabled={left !== null} onClick={() => setMinutes(value)}>{value} {t(demo.focus.minutes)}</button>
          ))}
        </span>
        <button type="button" className={`${s.start} ${left !== null ? s.running : ""}`} onClick={() => setLeft(left === null ? minutes * 60 : null)}>
          <Icon name="timer" size={16} />{left === null ? t(demo.focus.start) : <span className={s.clock}>{clock}</span>}
        </button>
      </div>
    </Plate>
  );
}

/* ---------- Capture: a field that types by itself ---------- */
export function CapturePlate() {
  const { t, locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  useEffect(() => {
    const phrases = demo.capture.phrases.map(p => p[locale]);
    if (reducedMotion()) { const id = window.setTimeout(() => setText(phrases[0]), 0); return () => window.clearTimeout(id); }
    let timer = 0, phrase = 0, index = 0, deleting = false, visible = false;
    const tick = () => {
      if (!visible) { timer = window.setTimeout(tick, 400); return; }
      const full = phrases[phrase];
      if (!deleting) {
        index += 1; setText(full.slice(0, index));
        if (index >= full.length) { deleting = true; timer = window.setTimeout(tick, 1800); return; }
        timer = window.setTimeout(tick, 55 + Math.random() * 40);
      } else {
        index -= 2; setText(full.slice(0, Math.max(index, 0)));
        if (index <= 0) { deleting = false; index = 0; phrase = (phrase + 1) % phrases.length; timer = window.setTimeout(tick, 500); return; }
        timer = window.setTimeout(tick, 22);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    if (ref.current) observer.observe(ref.current);
    timer = window.setTimeout(tick, 700);
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, [locale]);
  return (
    <Plate className={s.capture} label={t(demo.dock.capture)}>
      <div ref={ref} className={s.field}>
        <span className={s.typed}>{text}<i className={s.caret} /></span>
        <Icon name="mic" size={17} className={s.muted} />
        <span className={s.sendBtn}><Icon name="send" size={16} /></span>
      </div>
    </Plate>
  );
}

/* ---------- Space page: tabs, tabs list and files ---------- */
export function SpacePlate() {
  const { t } = useLocale();
  const [tab, setTab] = useState(1);
  const names = [demo.tabs[2], demo.tabs[3]];
  const colors: Record<string, string> = { W: "#2b5797", X: "#1d6f42", PDF: "#c8372d" };
  return (
    <Plate className={s.space} label={t(demo.spacePage.title)}>
      <div className={s.spaceTabs}>
        {names.map((name, index) => (
          <button key={index} type="button" className={tab === index + 1 ? s.tabOn : ""} onClick={() => setTab(index + 1)}>{t(name)}</button>
        ))}
      </div>
      <div className={`${s.spaceTitle} ${s.serif}`}>{t(demo.spacePage.title)}</div>
      <div className={s.cols}>
        <div>
          <div className={s.colHead}>{t(demo.spacePage.tabsTitle)}<em>3</em></div>
          {demo.spacePage.tabs.map((name, index) => <div key={index} className={s.row}><span className={s.dot} />{t(name)}</div>)}
        </div>
        <div>
          <div className={s.colHead}>{t(demo.spacePage.filesTitle)}<em>3</em></div>
          {demo.spacePage.files.map(file => <div key={file.k} className={s.row}><b className={s.fileBadge} style={{ background: colors[file.k] }}>{file.k}</b>{t(file.n)}</div>)}
        </div>
      </div>
    </Plate>
  );
}

/* ---------- "Today" page with favorites ---------- */
export function TodayPlate() {
  const { t } = useLocale();
  return (
    <Plate className={s.today} label={t(demo.today.title)}>
      <div className={`${s.serif} ${s.todayTitle}`}>{t(demo.today.title)}</div>
      <div className={s.todayCard}>
        <div className={`${s.serif} ${s.todayDate}`}>{t(demo.today.date)}</div>
        <button type="button" className={s.mint}>{t(demo.today.open)}<Icon name="arrow" size={16} /></button>
      </div>
      <div className={s.colHead}>{t(demo.today.favorites)}<em>8</em></div>
      {demo.today.items.slice(0, 3).map(item => (
        <div key={item.k} className={s.row}><b className={s.favDot} style={{ color: item.c, background: `${item.c}1f` }}>{item.k}</b>{t(item.n)}</div>
      ))}
    </Plate>
  );
}

/* ---------- Bottom dock ---------- */
export function DockPlate() {
  const { t } = useLocale();
  const [playing, setPlaying] = useState(false);
  return (
    <Plate tint="pill" className={s.dock} label="dock">
      <span className={s.dockBtn}><Icon name="pencil" size={17} />{t(demo.dock.capture)}</span>
      <span className={`${s.dockBtn} ${s.dockOn}`}><Icon name="timer" size={17} />{t(demo.dock.focus)}</span>
      <span className={s.track}><Icon name="headphones" size={17} /><span><b>Lofi Girl</b><i>{playing ? t(demo.dock.playing) : t(demo.dock.paused)}</i></span></span>
      <button type="button" className={s.round} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(value => !value)}><Icon name={playing ? "pause" : "play"} size={15} /></button>
      <span className={`${s.round} ${s.hideNarrow}`}><Icon name="next" size={15} /></span>
      <Icon name="chevron" size={15} className={`${s.muted} ${s.hideNarrow}`} />
    </Plate>
  );
}

/* ---------- Date, greeting and clock ---------- */
export function DatePlate() {
  const { t, locale } = useLocale();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setNow(new Date()), 0);
    const tick = window.setInterval(() => setNow(new Date()), 20000);
    return () => { window.clearTimeout(id); window.clearInterval(tick); };
  }, []);
  const hour = now?.getHours() ?? 18;
  const greeting = hour < 5 ? demo.greetings.night : hour < 12 ? demo.greetings.morning : hour < 18 ? demo.greetings.day : demo.greetings.evening;
  const day = now ? String(now.getDate()) : "28";
  const month = now ? now.toLocaleDateString("en-US", { month: "long" }) : demo.months.en;
  const weekday = now ? now.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { weekday: "long" }) : t(demo.weekday);
  const time = now ? now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "18:19";
  return (
    <Plate className={s.date} label={t(greeting)}>
      <div className={s.dateRow}>
        <span className={`${s.serif} ${s.dayNum}`}>{day}</span>
        <span className={s.dateText}><b className={s.serif}>{locale === "ru" ? (now ? ruGenitive(now.getMonth()) : t(demo.months)) : month}</b><i>{weekday}</i></span>
        <span className={s.clockBox}><b className={s.serif}>{time}</b><i>{t(demo.city)}</i></span>
      </div>
      <div className={`${s.greet} ${s.serif}`}>{t(greeting)}</div>
    </Plate>
  );
}

const RU_MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const ruGenitive = (index: number) => RU_MONTHS[index];

export type { CSSProperties };
