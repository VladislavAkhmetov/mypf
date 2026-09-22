"use client";

import React from "react";
import {
  MyDocumentsIcon,
  PaintIcon,
  WindowsMediaPlayerIcon,
  WindowsFlagIcon,
} from "./xp-icons";
import { xpSound } from "@/lib/xp/sound";

interface DesktopHeroProps {
  onOpenWindow: (id: string) => void;
}

export function DesktopHero({ onOpenWindow }: DesktopHeroProps) {
  const handleClickSticker = (id: string) => {
    xpSound.click();
    onOpenWindow(id);
  };

  return (
    <div className="xp-desktop-hero pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center select-none overflow-hidden pb-12 sm:pb-16 px-4">
      {/* Top Header Tagline */}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 opacity-95">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 shadow-sm">
          <WindowsFlagIcon className="w-4 h-4" />
          <span className="text-[11px] sm:text-xs font-black tracking-[0.25em] uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            VLAD AKHMETOV · PORTFOLIO
          </span>
        </div>
      </div>

      {/* Main Massive Center Typography Container */}
      <div className="relative flex flex-col items-center justify-center text-center font-black tracking-tight uppercase text-white leading-[0.88] max-w-[1280px]">
        {/* Line 1: DESIGN THAT + UI/UX Design Sticker */}
        <div className="relative inline-block">
          <span className="xp-hero-text text-5xl sm:text-7xl md:text-8xl lg:text-[7.4rem] xl:text-[8.4rem] block">
            DESIGN THAT
          </span>

          {/* Windows XP Luna Blue Sticker: UI/UX Design */}
          <div
            onClick={() => handleClickSticker("my-documents")}
            title="Открыть «Мои работы»"
            className="xp-sticker xp-sticker-luna-blue pointer-events-auto absolute -top-5 sm:-top-8 -right-3 sm:-right-8 md:-right-12 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-10"
            style={{ transform: "rotate(4deg)" }}
          >
            {/* Realistic Tape on top right */}
            <div className="xp-sticker-tape -top-2.5 -right-2 rotate-12" />

            <div className="xp-sticker-body">
              <div className="xp-sticker-icon-badge bg-white/90 shadow-sm">
                <MyDocumentsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="xp-sticker-label text-xs sm:text-sm md:text-base font-bold tracking-normal">
                UI/UX Design
              </span>
            </div>
          </div>
        </div>

        {/* Line 2: MAKES + Illustration Sticker + PEOPLE */}
        <div className="relative inline-flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-6">
          <span className="xp-hero-text text-5xl sm:text-7xl md:text-8xl lg:text-[7.4rem] xl:text-[8.4rem]">
            MAKES
          </span>

          {/* Windows XP Glossy Sunset/Paint Sticker: Illustration */}
          <div
            onClick={() => handleClickSticker("paint")}
            title="Открыть Paint"
            className="xp-sticker xp-sticker-luna-orange pointer-events-auto relative my-1 sm:my-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-20"
            style={{ transform: "rotate(-3deg)" }}
          >
            {/* Realistic Tape on right edge */}
            <div className="xp-sticker-tape -bottom-2 -right-2 -rotate-6" />

            <div className="xp-sticker-body">
              <div className="xp-sticker-icon-badge bg-white/95 shadow-sm">
                <PaintIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="xp-sticker-label text-xs sm:text-sm md:text-base font-bold tracking-normal">
                Illustration
              </span>
            </div>
          </div>

          <span className="xp-hero-text text-5xl sm:text-7xl md:text-8xl lg:text-[7.4rem] xl:text-[8.4rem]">
            PEOPLE
          </span>
        </div>

        {/* Line 3: LOOK TWICE + 3D Design Sticker */}
        <div className="relative inline-block">
          {/* Windows XP Media/Royale Glossy Sticker: 3D Design */}
          <div
            onClick={() => handleClickSticker("media-player")}
            title="Открыть «Визуализатор»"
            className="xp-sticker xp-sticker-luna-purple pointer-events-auto absolute -top-4 sm:-top-7 -left-4 sm:-left-10 md:-left-16 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-20"
            style={{ transform: "rotate(-5deg)" }}
          >
            {/* Realistic Tape on left edge */}
            <div className="xp-sticker-tape -top-2 -left-2 -rotate-12" />

            <div className="xp-sticker-body">
              <div className="xp-sticker-icon-badge bg-white/90 shadow-sm">
                <WindowsMediaPlayerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="xp-sticker-label text-xs sm:text-sm md:text-base font-bold tracking-normal">
                3D Design
              </span>
            </div>
          </div>

          <span className="xp-hero-text text-5xl sm:text-7xl md:text-8xl lg:text-[7.4rem] xl:text-[8.4rem] block">
            LOOK TWICE
          </span>
        </div>
      </div>
    </div>
  );
}
