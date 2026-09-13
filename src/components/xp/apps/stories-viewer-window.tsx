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

  const story = stories[currentStoryIndex];
  const slide = story.slides[currentSlideIndex];

  const handleNextSlide = () => {
    xpSound.click();
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      setCurrentStoryIndex((currentStoryIndex + 1) % stories.length);
      setCurrentSlideIndex(0);
    }
  };

  const handlePrevSlide = () => {
    xpSound.click();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else {
      const prevStory = (currentStoryIndex - 1 + stories.length) % stories.length;
      setCurrentStoryIndex(prevStory);
      setCurrentSlideIndex(stories[prevStory].slides.length - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#585755] text-white overflow-hidden select-none">
      {/* Viewer Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-[#2b2b2b] overflow-hidden">
        <div className="relative w-full h-full max-w-lg max-h-80 shadow-2xl border border-white/20 rounded overflow-hidden">
          <Image
            src={slide.image}
            alt={t(slide.title)}
            fill
            className="object-contain"
            unoptimized
          />
          {/* Overlay slide label */}
          <div className="absolute bottom-0 inset-x-0 bg-black/75 p-3 text-left">
            <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold">
              {t(slide.kicker)}
            </span>
            <div className="text-sm font-bold text-white mt-0.5">{t(slide.title)}</div>
          </div>
        </div>
      </div>

      {/* Picture Viewer Control Toolbar */}
      <div className="h-12 bg-[#ece9d8] border-t border-slate-300 flex items-center justify-between px-4 text-black">
        <div className="text-xs font-semibold text-slate-700 truncate max-w-xs">
          <span>{t(story.label)}</span>
          <span className="text-slate-400 mx-1.5">•</span>
          <span className="text-slate-500">
            Кадр {currentSlideIndex + 1} из {story.slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevSlide}
            className="w-8 h-7 bg-white hover:bg-blue-50 border border-slate-400 rounded grid place-items-center shadow-sm"
            style={{ cursor: xpCursors.pointer }}
            title="Предыдущее изображение"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            className="w-8 h-7 bg-white hover:bg-blue-50 border border-slate-400 rounded grid place-items-center shadow-sm"
            style={{ cursor: xpCursors.pointer }}
            title="Следующее изображение"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
