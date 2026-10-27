"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./help-center.module.css";

// A tiny real node editor: image source → colour → blur → posterize → output.
// Every node renders its own preview, so you can see where the data changes.

type NodeKind = "source" | "color" | "blur" | "posterize" | "output";
interface GraphNode {
  id: NodeKind;
  title: string;
  x: number;
  y: number;
}

const W = 700;
const H = 300;
const NODE_W = 124;
const OUT_W = 140;
const PORT_Y = 38;
const PW = 160;
const PH = 100;
const SOURCES = [
  { src: "/images/bliss.jpg", label: "Холмы" },
  { src: "/placeholders/covers/kora.jpg", label: "Тюльпаны" },
];

const INITIAL_NODES: GraphNode[] = [
  { id: "source", title: "Источник", x: 8, y: 92 },
  { id: "color", title: "Цвет", x: 148, y: 14 },
  { id: "blur", title: "Размытие", x: 288, y: 132 },
  { id: "posterize", title: "Постеризация", x: 428, y: 14 },
  { id: "output", title: "Вывод", x: W - OUT_W - 8, y: 118 },
];
const INITIAL_EDGES: Partial<Record<NodeKind, NodeKind>> = { color: "source", blur: "color", posterize: "blur", output: "posterize" };

interface Params {
  source: number;
  hue: number;
  saturation: number;
  blur: number;
  levels: number;
}
const INITIAL_PARAMS: Params = { source: 0, hue: 40, saturation: 150, blur: 2, levels: 4 };

const widthOf = (id: NodeKind) => (id === "output" ? OUT_W : NODE_W);

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = PW;
  canvas.height = PH;
  return canvas;
}

export function NodeSandbox() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [wire, setWire] = useState<{ from: NodeKind; x: number; y: number } | null>(null);
  const [loaded, setLoaded] = useState(0);
  const [scale, setScale] = useState(1);
  const boardRef = useRef<HTMLDivElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const previews = useRef<Partial<Record<NodeKind, HTMLCanvasElement | null>>>({});

  useEffect(() => {
    images.current = SOURCES.map(({ src }) => {
      const image = new Image();
      image.onload = () => setLoaded(n => n + 1);
      image.src = src;
      return image;
    });
  }, []);

  useEffect(() => {
    const el = boardRef.current?.parentElement;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / W));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Nodes that actually reach the output.
  const contributing = useMemo(() => {
    const set = new Set<NodeKind>(["output"]);
    let current = edges.output;
    while (current && !set.has(current)) {
      set.add(current);
      current = edges[current];
    }
    return set;
  }, [edges]);

  // Evaluate the graph and paint every preview.
  useEffect(() => {
    const cache = new Map<NodeKind, HTMLCanvasElement | null>();
    const evaluate = (id: NodeKind, depth = 0): HTMLCanvasElement | null => {
      if (cache.has(id)) return cache.get(id)!;
      if (depth > 8) return null;
      let result: HTMLCanvasElement | null = null;
      if (id === "source") {
        const image = images.current[params.source];
        if (image?.complete && image.naturalWidth) {
          result = makeCanvas();
          const ctx = result.getContext("2d")!;
          const ratio = Math.max(PW / image.naturalWidth, PH / image.naturalHeight);
          const w = image.naturalWidth * ratio;
          const h = image.naturalHeight * ratio;
          ctx.drawImage(image, (PW - w) / 2, (PH - h) / 2, w, h);
        }
      } else {
        const input = edges[id] ? evaluate(edges[id]!, depth + 1) : null;
        if (input) {
          result = makeCanvas();
          const ctx = result.getContext("2d", { willReadFrequently: true })!;
          if (id === "color") ctx.filter = `hue-rotate(${params.hue}deg) saturate(${params.saturation}%)`;
          if (id === "blur") ctx.filter = `blur(${params.blur}px)`;
          ctx.drawImage(input, 0, 0);
          ctx.filter = "none";
          if (id === "posterize") {
            const image = ctx.getImageData(0, 0, PW, PH);
            const step = 255 / (params.levels - 1);
            for (let i = 0; i < image.data.length; i += 4) {
              for (let c = 0; c < 3; c++) image.data[i + c] = Math.round(image.data[i + c] / step) * step;
            }
            ctx.putImageData(image, 0, 0);
          }
        }
      }
      cache.set(id, result);
      return result;
    };
    for (const node of INITIAL_NODES) {
      const canvas = previews.current[node.id];
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) continue;
      const result = evaluate(node.id);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (result) ctx.drawImage(result, 0, 0, canvas.width, canvas.height);
    }
  }, [edges, params, loaded]);

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const rect = boardRef.current!.getBoundingClientRect();
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [scale],
  );

  const isUpstream = (target: NodeKind, from: NodeKind) => {
    let current: NodeKind | undefined = from;
    for (let i = 0; current && i < 10; i++) {
      if (current === target) return true;
      current = edges[current];
    }
    return false;
  };

  const connect = (from: NodeKind, to: NodeKind) => {
    if (from === to || to === "source" || from === "output" || isUpstream(to, from)) return;
    setEdges(prev => ({ ...prev, [to]: from }));
  };

  const disconnect = (to: NodeKind) => setEdges(prev => ({ ...prev, [to]: undefined }));

  // Wire dragging from an output port.
  useEffect(() => {
    if (!wire) return;
    const move = (event: PointerEvent) => {
      const p = toLocal(event.clientX, event.clientY);
      setWire(prev => (prev ? { ...prev, ...p } : prev));
    };
    const up = (event: PointerEvent) => {
      const target = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-in-port]");
      if (target) connect(wire.from, target.dataset.inPort as NodeKind);
      setWire(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // connect depends on edges; re-binding on every edge change is fine here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wire?.from, toLocal, edges]);

  const startNodeDrag = (event: React.PointerEvent, id: NodeKind) => {
    const start = toLocal(event.clientX, event.clientY);
    const node = nodes.find(n => n.id === id)!;
    const offset = { x: start.x - node.x, y: start.y - node.y };
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      setNodes(prev =>
        prev.map(n => (n.id === id ? { ...n, x: Math.max(0, Math.min(W - widthOf(id), p.x - offset.x)), y: Math.max(0, Math.min(H - 60, p.y - offset.y)) } : n)),
      );
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  const portOut = (id: NodeKind) => {
    const n = nodes.find(node => node.id === id)!;
    return { x: n.x + widthOf(id), y: n.y + PORT_Y };
  };
  const portIn = (id: NodeKind) => {
    const n = nodes.find(node => node.id === id)!;
    return { x: n.x, y: n.y + PORT_Y };
  };
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    return `M${a.x} ${a.y} C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
  };

  const param = (id: NodeKind) => {
    switch (id) {
      case "source":
        return (
          <select value={params.source} onChange={e => setParams(p => ({ ...p, source: Number(e.target.value) }))} aria-label="Картинка">
            {SOURCES.map((s, i) => <option key={s.src} value={i}>{s.label}</option>)}
          </select>
        );
      case "color":
        return (
          <>
            <label>Тон <input type="range" min={-180} max={180} value={params.hue} onChange={e => setParams(p => ({ ...p, hue: Number(e.target.value) }))} /></label>
            <label>Насыщ. <input type="range" min={0} max={250} value={params.saturation} onChange={e => setParams(p => ({ ...p, saturation: Number(e.target.value) }))} /></label>
          </>
        );
      case "blur":
        return <label>Радиус <input type="range" min={0} max={6} step={0.5} value={params.blur} onChange={e => setParams(p => ({ ...p, blur: Number(e.target.value) }))} /></label>;
      case "posterize":
        return <label>Уровни <input type="range" min={2} max={8} value={params.levels} onChange={e => setParams(p => ({ ...p, levels: Number(e.target.value) }))} /></label>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.sandboxFrame}>
      <div className={styles.nodeViewport} style={{ height: H * scale }}>
        <div ref={boardRef} className={styles.nodeBoard} style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <svg className={styles.wires} viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
            {(Object.entries(edges) as Array<[NodeKind, NodeKind | undefined]>).map(([to, from]) =>
              from ? (
                <g key={to} className={contributing.has(to) && contributing.has(from) ? styles.wireActive : styles.wireIdle}>
                  <path d={curve(portOut(from), portIn(to))} />
                  <path className={styles.wireHit} d={curve(portOut(from), portIn(to))} onClick={() => disconnect(to)}>
                    <title>Щёлкните, чтобы отсоединить</title>
                  </path>
                </g>
              ) : null,
            )}
            {wire && <path className={styles.wireDraft} d={curve(portOut(wire.from), wire)} />}
          </svg>
          {nodes.map(node => {
            const active = contributing.has(node.id);
            return (
              <div
                key={node.id}
                className={`${styles.node} ${styles[`node_${node.id}`]} ${active ? "" : styles.nodeIdle}`}
                style={{ left: node.x, top: node.y, width: widthOf(node.id) }}
              >
                <div className={styles.nodeHeader} onPointerDown={event => startNodeDrag(event, node.id)}>
                  {node.title}
                </div>
                <canvas
                  ref={el => {
                    previews.current[node.id] = el;
                  }}
                  width={node.id === "output" ? 248 : 216}
                  height={node.id === "output" ? 156 : 132}
                  className={styles.nodePreview}
                />
                <div className={styles.nodeParams}>{param(node.id)}</div>
                {!active && node.id !== "output" && <div className={styles.nodeNote}>не влияет на вывод</div>}
                {node.id !== "source" && (
                  <button
                    type="button"
                    data-in-port={node.id}
                    className={`${styles.port} ${styles.portIn} ${edges[node.id] ? styles.portLinked : ""}`}
                    style={{ top: PORT_Y - 6 }}
                    onClick={() => edges[node.id] && disconnect(node.id)}
                    aria-label={`Вход ноды «${node.title}»`}
                  />
                )}
                {node.id !== "output" && (
                  <button
                    type="button"
                    className={`${styles.port} ${styles.portOut}`}
                    style={{ top: PORT_Y - 6 }}
                    onPointerDown={event => {
                      event.preventDefault();
                      setWire({ from: node.id, ...toLocal(event.clientX, event.clientY) });
                    }}
                    aria-label={`Выход ноды «${node.title}» — потяните к входу другой ноды`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.sandboxBar}>
        <span>Тяните от правой точки ноды к левой точке другой. Щелчок по проводу — отсоединить.</span>
        <button
          type="button"
          className={styles.xpButton}
          onClick={() => {
            setNodes(INITIAL_NODES);
            setEdges(INITIAL_EDGES);
            setParams(INITIAL_PARAMS);
          }}
        >
          Сбросить схему
        </button>
      </div>
    </div>
  );
}
