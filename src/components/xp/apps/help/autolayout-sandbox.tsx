"use client";

import React, { useState } from "react";
import styles from "./help-center.module.css";

// Figma auto layout, live: frame settings + per-item sizing, mirrored as CSS flexbox.

type Sizing = "fixed" | "hug" | "fill";
type Direction = "row" | "column";
const ALIGN = ["start", "center", "end"] as const;
type Align = (typeof ALIGN)[number];

const ITEMS = [
  { id: "icon", label: "Иконка" },
  { id: "title", label: "Заголовок карточки" },
  { id: "button", label: "Кнопка" },
];

const css = (a: Align) => (a === "start" ? "flex-start" : a === "end" ? "flex-end" : "center");

export function AutolayoutSandbox() {
  const [direction, setDirection] = useState<Direction>("row");
  const [gap, setGap] = useState(12);
  const [padding, setPadding] = useState(16);
  const [alignX, setAlignX] = useState<Align>("start");
  const [alignY, setAlignY] = useState<Align>("center");
  const [frameSizing, setFrameSizing] = useState<"fixed" | "hug">("fixed");
  const [sizing, setSizing] = useState<Record<string, Sizing>>({ icon: "fixed", title: "hug", button: "hug" });

  const row = direction === "row";
  const fillBlocked = frameSizing === "hug";
  const effective = (id: string): Sizing => (sizing[id] === "fill" && fillBlocked ? "hug" : sizing[id]);

  const frameStyle: React.CSSProperties = {
    flexDirection: direction,
    padding,
    justifyContent: css(row ? alignX : alignY),
    alignItems: css(row ? alignY : alignX),
    width: frameSizing === "fixed" ? (row ? 420 : 220) : "fit-content",
    height: frameSizing === "fixed" ? (row ? 120 : 240) : "fit-content",
  };

  const itemStyle = (id: string): React.CSSProperties => {
    const mode = effective(id);
    if (mode === "fill") return { flex: "1 1 0", minWidth: 0, minHeight: 0 };
    if (mode === "fixed") return row ? { width: id === "icon" ? 40 : 96, flex: "0 0 auto" } : { height: id === "icon" ? 40 : 44, flex: "0 0 auto" };
    return { flex: "0 0 auto" };
  };

  const cssLines = [
    "display: flex;",
    `flex-direction: ${direction};`,
    `gap: ${gap}px;`,
    `padding: ${padding}px;`,
    `justify-content: ${frameStyle.justifyContent};`,
    `align-items: ${frameStyle.alignItems};`,
    frameSizing === "fixed" ? `width: ${frameStyle.width}px;` : "width: fit-content; /* Hug */",
  ];

  return (
    <div className={styles.sandboxFrame}>
      <div className={styles.alLayout}>
        <div className={styles.alControls}>
          <fieldset>
            <legend>Рамка</legend>
            <div className={styles.segment}>
              <button type="button" className={row ? styles.segmentOn : ""} onClick={() => setDirection("row")}>→ Горизонтально</button>
              <button type="button" className={!row ? styles.segmentOn : ""} onClick={() => setDirection("column")}>↓ Вертикально</button>
            </div>
            <label>Gap: {gap}px <input type="range" min={0} max={40} value={gap} onChange={e => setGap(Number(e.target.value))} /></label>
            <label>Padding: {padding}px <input type="range" min={0} max={40} value={padding} onChange={e => setPadding(Number(e.target.value))} /></label>
            <div className={styles.alAlign} role="group" aria-label="Выравнивание">
              {ALIGN.map(y =>
                ALIGN.map(x => (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    aria-label={`Выравнивание ${x} ${y}`}
                    className={alignX === x && alignY === y ? styles.alAlignOn : ""}
                    onClick={() => {
                      setAlignX(x);
                      setAlignY(y);
                    }}
                  />
                )),
              )}
            </div>
            <div className={styles.segment}>
              <button type="button" className={frameSizing === "fixed" ? styles.segmentOn : ""} onClick={() => setFrameSizing("fixed")}>Рамка: Fixed</button>
              <button type="button" className={frameSizing === "hug" ? styles.segmentOn : ""} onClick={() => setFrameSizing("hug")}>Рамка: Hug</button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Размер элементов</legend>
            {ITEMS.map(item => (
              <div key={item.id} className={styles.alItemRow}>
                <span>{item.label}</span>
                <div className={styles.segment}>
                  {(["fixed", "hug", "fill"] as Sizing[]).map(mode => (
                    <button key={mode} type="button" className={sizing[item.id] === mode ? styles.segmentOn : ""} onClick={() => setSizing(s => ({ ...s, [item.id]: mode }))}>
                      {mode === "fixed" ? "Fixed" : mode === "hug" ? "Hug" : "Fill"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>
        </div>

        <div className={styles.alStage}>
          <div className={styles.alFrame} style={frameStyle}>
            <span className={styles.alFrameLabel}>Card · Auto layout</span>
            {ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && gap > 0 && (
                  <span className={styles.alGap} style={row ? { width: gap, alignSelf: "stretch" } : { height: gap, alignSelf: "stretch" }}>
                    <b>{gap}</b>
                  </span>
                )}
                <span className={`${styles.alItem} ${styles[`alItem_${item.id}`]} ${effective(item.id) === "fill" ? styles.alItemFill : ""}`} style={itemStyle(item.id)}>
                  {item.id === "icon" ? "★" : item.label}
                  <em>{effective(item.id) === "fixed" ? "Fixed" : effective(item.id) === "hug" ? "Hug" : "Fill"}</em>
                </span>
              </React.Fragment>
            ))}
          </div>
          {fillBlocked && Object.values(sizing).includes("fill") && (
            <p className={styles.alWarning}>Fill внутри рамки с Hug: заполнять нечего, поэтому элемент ведёт себя как Hug. Так же поступает Figma.</p>
          )}
          <pre className={styles.alCode} aria-label="То же самое в CSS">
            <span>{"/* То же в CSS */"}</span>
            {"\n.card {\n"}
            {cssLines.map(line => `  ${line}\n`).join("")}
            {"}"}
          </pre>
        </div>
      </div>
    </div>
  );
}
