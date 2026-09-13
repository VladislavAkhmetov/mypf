"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { PaintIcon } from "../xp-icons";

type ToolType = "brush" | "eraser" | "line" | "rect" | "circle" | "stamp-va" | "stamp-grid" | "stamp-cross";

const CLASSIC_PALETTE = [
  "#000000", "#787878", "#790300", "#757401", "#007702", "#007777", "#030079", "#790077",
  "#ffffff", "#b8b8b8", "#ff0018", "#ffff00", "#00ff17", "#00ffff", "#0000ff", "#ff00ff",
  "#c0c0c0", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080",
  "#fffbf0", "#e2e8f0", "#ea580c", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#d946ef",
];

export function PaintWindow() {
  const { setWallpaper } = useWindowManager();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>("brush");
  const [primaryColor, setPrimaryColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const canvasDimensions = { width: 640, height: 440 };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Fill with clean warm paper white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    const initialImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialImg]);
  }, []);

  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imgData]);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return;
    xpSound.click();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  }, [history]);

  // Mouse / Touch handlers for Canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: Math.round((touch.clientX - rect.left) * scaleX),
        y: Math.round((touch.clientY - rect.top) * scaleY),
      };
    }

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawing(true);
    setStartPos(coords);

    // Stamping logic
    if (currentTool.startsWith("stamp-")) {
      xpSound.click();
      drawStamp(ctx, coords.x, coords.y, currentTool);
      saveHistoryState();
      setIsDrawing(false);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : primaryColor;
    ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : primaryColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentTool === "brush" || currentTool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (currentTool === "brush" || currentTool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (currentTool === "line" || currentTool === "rect" || currentTool === "circle") {
      // Restore previous state while dragging shape
      const latestSaved = history[history.length - 1];
      if (latestSaved) {
        ctx.putImageData(latestSaved, 0, 0);
      }
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();

      if (currentTool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (currentTool === "rect") {
        const w = coords.x - startPos.x;
        const h = coords.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      } else if (currentTool === "circle") {
        const rx = Math.abs(coords.x - startPos.x) / 2;
        const ry = Math.abs(coords.y - startPos.y) / 2;
        const cx = Math.min(startPos.x, coords.x) + rx;
        const cy = Math.min(startPos.y, coords.y) + ry;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    saveHistoryState();
  };

  const drawStamp = (ctx: CanvasRenderingContext2D, x: number, y: number, stampType: ToolType) => {
    ctx.save();
    if (stampType === "stamp-va") {
      // Author monogram stamp
      ctx.fillStyle = primaryColor;
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("VA", x, y);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 24, y - 20, 48, 40);
    } else if (stampType === "stamp-cross") {
      // Technical Crosshair stamp
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, 2 * Math.PI);
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x + 22, y);
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x, y + 22);
      ctx.stroke();
    } else if (stampType === "stamp-grid") {
      // Swiss dot grid stamp
      ctx.fillStyle = primaryColor;
      for (let dx = -20; dx <= 20; dx += 10) {
        for (let dy = -20; dy <= 20; dy += 10) {
          ctx.fillRect(x + dx - 1, y + dy - 1, 2, 2);
        }
      }
    }
    ctx.restore();
  };

  // Templates
  const loadPreset = (preset: "blank" | "swiss" | "blueprint") => {
    xpSound.click();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (preset === "blank") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (preset === "swiss") {
      // Swiss Poster template
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Red accent bar
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(40, 40, canvas.width - 80, 12);
      // Typography
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 36px sans-serif";
      ctx.fillText("SWISS POSTER 2026", 40, 100);
      ctx.font = "500 14px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("SYSTEMIC DESIGN & PROTOTYPES // VLAD AKHMETOV", 40, 126);
    } else if (preset === "blueprint") {
      // Blueprint grid template
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    saveHistoryState();
  };

  // Export actions
  const handleDownload = () => {
    xpSound.click();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `vlad-paint-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSetWallpaper = () => {
    xpSound.click();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setWallpaper(url);
    alert("Рисунок успешно установлен в качестве обоев рабочего стола!");
  };

  const handleResetWallpaper = () => {
    xpSound.click();
    setWallpaper("/images/bliss.jpg");
  };

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] select-none font-sans text-xs text-slate-800">
      {/* Top Menu / Preset bar */}
      <div className="bg-[#f0f0f0] border-b border-[#7b7b7b] p-1.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 font-bold mr-2 text-slate-900">
            <PaintIcon className="w-4 h-4" />
            <span>Paint Studio</span>
          </div>

          <button
            type="button"
            onClick={() => loadPreset("blank")}
            className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-[11px]"
            style={{ cursor: xpCursors.pointer }}
          >
            Чистый лист
          </button>
          <button
            type="button"
            onClick={() => loadPreset("swiss")}
            className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-[11px]"
            style={{ cursor: xpCursors.pointer }}
          >
            Шаблон: Постер
          </button>
          <button
            type="button"
            onClick={() => loadPreset("blueprint")}
            className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-[11px]"
            style={{ cursor: xpCursors.pointer }}
          >
            Шаблон: Чертёж
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-[11px] disabled:opacity-40"
            style={{ cursor: xpCursors.pointer }}
            title="Отменить (Ctrl+Z)"
          >
            ↩ Отмена
          </button>
        </div>

        {/* Primary Export Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1"
            style={{ cursor: xpCursors.pointer }}
            title="Сохранить PNG на компьютер"
          >
            <span>💾</span>
            <span>Скачать PNG</span>
          </button>

          <button
            type="button"
            onClick={handleSetWallpaper}
            className="px-2.5 py-1 bg-[#0055ea] hover:bg-[#0044bb] text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs"
            style={{ cursor: xpCursors.pointer }}
            title="Установить текущий рисунок фоном рабочего стола"
          >
            <span>🖼️</span>
            <span>Сделать обоями</span>
          </button>

          <button
            type="button"
            onClick={handleResetWallpaper}
            className="px-1.5 py-1 text-slate-500 hover:text-slate-800 text-[10px] underline"
            style={{ cursor: xpCursors.pointer }}
            title="Вернуть стандартный Bliss"
          >
            Сброс
          </button>
        </div>
      </div>

      {/* Workspace Area: Left Toolbox + Center Canvas + Bottom Color Palette */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbox */}
        <div className="w-14 sm:w-16 bg-[#ece9d8] border-r border-[#7b7b7b] p-1.5 flex flex-col gap-1.5 items-center flex-shrink-0">
          {/* Tool buttons */}
          <div className="grid grid-cols-2 gap-1 w-full">
            <button
              type="button"
              onClick={() => setCurrentTool("brush")}
              className={`p-1.5 rounded border text-sm flex items-center justify-center ${
                currentTool === "brush" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Кисть"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("eraser")}
              className={`p-1.5 rounded border text-sm flex items-center justify-center ${
                currentTool === "eraser" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Ластик"
            >
              🧹
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("line")}
              className={`p-1.5 rounded border text-xs font-bold flex items-center justify-center ${
                currentTool === "line" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Линия"
            >
              ╱
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("rect")}
              className={`p-1.5 rounded border text-xs font-bold flex items-center justify-center ${
                currentTool === "rect" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Прямоугольник"
            >
              ▭
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("circle")}
              className={`p-1.5 rounded border text-xs font-bold flex items-center justify-center ${
                currentTool === "circle" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Эллипс"
            >
              ○
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("stamp-va")}
              className={`p-1.5 rounded border text-[10px] font-black flex items-center justify-center ${
                currentTool === "stamp-va" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Штамп монограммы VA"
            >
              VA
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("stamp-cross")}
              className={`p-1.5 rounded border text-xs font-bold flex items-center justify-center ${
                currentTool === "stamp-cross" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Штамп перекрестья"
            >
              ⊕
            </button>
            <button
              type="button"
              onClick={() => setCurrentTool("stamp-grid")}
              className={`p-1.5 rounded border text-xs font-bold flex items-center justify-center ${
                currentTool === "stamp-grid" ? "bg-[#316ac5] text-white border-blue-900" : "bg-white border-slate-300"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Штамп сетки точек"
            >
              ⸬
            </button>
          </div>

          <div className="w-full h-px bg-slate-300 my-1" />

          {/* Line width selector */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <div className="text-[10px] text-slate-500 font-mono">Толщина</div>
            {[1, 3, 6, 12].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setBrushSize(size)}
                className={`w-full py-1 flex items-center justify-center rounded border ${
                  brushSize === size ? "bg-white border-blue-600 shadow-2xs" : "border-transparent"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                <div
                  className="rounded-full bg-slate-900"
                  style={{ width: `${Math.min(18, size * 2.5)}px`, height: `${Math.min(18, size * 2.5)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Current color indicator */}
          <div className="mt-auto flex flex-col items-center gap-1 pb-1">
            <div className="text-[10px] text-slate-500">Цвет</div>
            <div
              className="w-8 h-8 rounded border-2 border-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-[#808080] p-4 overflow-auto flex items-center justify-center">
          <div className="bg-white shadow-2xl border-2 border-black inline-block leading-none">
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair block touch-none"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Color Palette Bar */}
      <div className="bg-[#ece9d8] border-t border-[#7b7b7b] p-2 flex flex-wrap items-center gap-2 flex-shrink-0">
        <div className="text-[11px] font-semibold text-slate-700 mr-1">Палитра:</div>
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {CLASSIC_PALETTE.map((color, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                xpSound.click();
                setPrimaryColor(color);
              }}
              className={`w-5 h-5 rounded-xs border transition-transform ${
                primaryColor === color
                  ? "border-black scale-110 shadow-sm ring-2 ring-blue-500"
                  : "border-slate-400 hover:scale-105"
              }`}
              style={{ backgroundColor: color, cursor: xpCursors.pointer }}
              title={color}
            />
          ))}
        </div>

        {/* Custom hex color input */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="font-mono text-slate-600">HEX:</span>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-6 h-6 p-0 border border-slate-400 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
