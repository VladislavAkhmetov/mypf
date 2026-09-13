"use client";

import React, { useState } from "react";
import Image from "next/image";
import { stories } from "@/data/stories";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

export function StoriesViewerWindow() {
  const { t } = useLocale();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const story = stories[currentStoryIndex];
  const slide = story.slides[currentSlideIndex];

  // Flatten all slides for continuous filmstrip browsing
  const allItems = stories.flatMap((s, sIdx) =>
    s.slides.map((sl, slIdx) => ({
      storyIndex: sIdx,
      slideIndex: slIdx,
      story: s,
      slide: sl,
    })),
  );

  const currentFlatIndex = allItems.findIndex(
    (item) => item.storyIndex === currentStoryIndex && item.slideIndex === currentSlideIndex,
  );

  const handleNext = () => {
    xpSound.click();
    const nextIdx = (currentFlatIndex + 1) % allItems.length;
    setCurrentStoryIndex(allItems[nextIdx].storyIndex);
    setCurrentSlideIndex(allItems[nextIdx].slideIndex);
    setRotation(0);
  };

  const handlePrev = () => {
    xpSound.click();
    const prevIdx = (currentFlatIndex - 1 + allItems.length) % allItems.length;
    setCurrentStoryIndex(allItems[prevIdx].storyIndex);
    setCurrentSlideIndex(allItems[prevIdx].slideIndex);
    setRotation(0);
  };

  const handleRotate = () => {
    xpSound.click();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    xpSound.click();
    setZoomLevel((prev) => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    xpSound.click();
    setZoomLevel((prev) => Math.max(50, prev - 25));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text text-xs">
      {/* Viewer Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 bg-[#383735] overflow-hidden">
        <div
          className="relative w-full h-full max-w-xl max-h-[380px] bg-black/40 shadow-2xl border border-white/20 rounded overflow-hidden flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
          }}
        >
          <Image
            src={slide.image}
            alt={t(slide.title)}
            fill
            className="object-contain"
            unoptimized
          />

          {/* Process overlay label */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 text-left pointer-events-auto">
            <div className="flex items-center gap-2 text-[10px] text-sky-300 font-mono uppercase tracking-widest font-bold">
              <span>{t(story.label)}</span>
              <span>•</span>
              <span>{t(slide.kicker)}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
              {t(slide.title)}
            </div>
          </div>
        </div>
      </div>

      {/* Picture Viewer Authentic Toolbar (Windows Picture & Fax Viewer) */}
      <div className="bg-[#ece9d8] border-t border-slate-300 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Navigation & Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="xp-toolbar-btn px-2.5 py-1"
            title="Предыдущий кадр"
            style={{ cursor: xpCursors.pointer }}
          >
            <span>◀</span>
            <span className="hidden sm:inline">Назад</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="xp-toolbar-btn px-2.5 py-1"
            title="Следующий кадр"
            style={{ cursor: xpCursors.pointer }}
          >
            <span className="hidden sm:inline">Вперед</span>
            <span>▶</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="xp-toolbar-btn px-2 py-1"
            title="Увеличить"
            style={{ cursor: xpCursors.pointer }}
          >
            🔍+
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="xp-toolbar-btn px-2 py-1"
            title="Уменьшить"
            style={{ cursor: xpCursors.pointer }}
          >
            🔍-
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="xp-toolbar-btn px-2 py-1 text-[11px] font-mono"
            title="Сброс масштаба"
            style={{ cursor: xpCursors.pointer }}
          >
            100%
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Rotate control */}
          <button
            type="button"
            onClick={handleRotate}
            className="xp-toolbar-btn px-2 py-1"
            title="Повернуть по часовой стрелке"
            style={{ cursor: xpCursors.pointer }}
          >
            ↻ Повернуть
          </button>
        </div>

        <div className="text-[11px] text-slate-600 font-medium">
          Кадр {currentFlatIndex + 1} из {allItems.length}
        </div>
      </div>

      {/* Filmstrip Thumbnails Bar at Bottom */}
      <div className="h-16 bg-[#262626] border-t border-black px-2 flex items-center gap-2 overflow-x-auto">
        {allItems.map((item, idx) => {
          const isSelected = idx === currentFlatIndex;
          return (
            <button
              key={`${item.storyIndex}-${item.slideIndex}`}
              type="button"
              onClick={() => {
                xpSound.click();
                setCurrentStoryIndex(item.storyIndex);
                setCurrentSlideIndex(item.slideIndex);
                setRotation(0);
              }}
              className={`h-12 w-16 relative rounded overflow-hidden flex-shrink-0 border-2 transition ${
                isSelected ? "border-blue-500 scale-105 shadow-md ring-1 ring-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title={`${t(item.story.label)}: ${t(item.slide.title)}`}
            >
              <Image
                src={item.slide.image}
                alt={t(item.slide.title)}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="xp-statusbar flex items-center justify-between">
        <span>Просмотр изображений и факсов Windows // Фотоархив студии</span>
        <span className="text-slate-600">Масштаб: {zoomLevel}%</span>
      </div>
    </div>
  );
}
