"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Project } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

interface AltynSolokLandingProps {
  project: Project;
  adjacent?: { prev: Project | null; next: Project | null };
  onOpenProject?: (slug: string) => void;
}

export function AltynSolokLanding({
  project,
  adjacent,
  onOpenProject,
}: AltynSolokLandingProps) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const liveUrl = project.href || "https://altyn-solok-demo.website.yandexcloud.net/";

  const togglePlay = () => {
    xpSound.click();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    xpSound.click();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleCopy = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="w-full min-h-full flex-1 flex flex-col bg-[#0b130e] text-[#f7f5ee] p-4 sm:p-8 lg:p-12 space-y-10"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* =========================================================
            01. HEADER: Title, Short Paragraph, and Outline Button
            ========================================================= */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-4">
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-amber-100/90 leading-relaxed font-normal">
              {locale === "en"
                ? "Full-cycle apiphytotherapy from Bashkortostan: wild-hive honey, propolis, and medicinal herbs in a modern digital showcase."
                : "Апифитопродукция полного цикла из Башкортостана: башкирский бортевой мёд, прополис и дикорастущие травы в чистой современной веб-витрине."}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center">
            {/* Action button without gradient, ONLY outline */}
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              data-ym-goal="portfolio_external_link"
              data-ym-params={JSON.stringify({ slug: project.slug, href: liveUrl })}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold text-base rounded-full transition-colors duration-200"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>{locale === "en" ? "Visit Website" : "Перейти на сайт"}</span>
              <span className="text-lg leading-none">↗</span>
            </a>
          </div>
        </header>

        {/* =========================================================
            02. SCREENCAST (Video Player in Seamless Frame)
            ========================================================= */}
        <section className="space-y-3" aria-label="Скринкаст сайта">
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#121c15]">
            {/* Seamless Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d1610]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs text-amber-200/70 bg-black/40 px-4 py-1.5 rounded-full max-w-sm w-full text-center truncate">
                altyn-solok.ru
              </div>
              {/* Minimalist icon buttons for Play/Pause and Mute */}
              <div className="flex items-center gap-1 text-white/75">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-full hover:bg-white/10 hover:text-amber-300 transition"
                  style={{ cursor: xpCursors.pointer }}
                  title={isPlaying ? "Пауза" : "Воспроизведение"}
                  aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-full hover:bg-white/10 hover:text-amber-300 transition"
                  style={{ cursor: xpCursors.pointer }}
                  title={isMuted ? "Включить звук" : "Выключить звук"}
                  aria-label={isMuted ? "Включить звук" : "Выключить звук"}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Screencast Video */}
            <div className="relative aspect-[16/9] w-full bg-black">
              <video
                ref={videoRef}
                src="/placeholders/covers/altyn-solok.webm"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            03. FULL-PAGE SCREENSHOT (Lapa Ninja Style)
            ========================================================= */}
        <section className="space-y-4 pt-4" aria-label="Скриншот всего сайта">
          <div className="flex items-center justify-between text-xs text-amber-200/60 pb-1">
            <span className="uppercase tracking-wider font-semibold text-amber-300/90">
              {locale === "en" ? "Full Website Screenshot" : "Скриншот всего сайта (Full-Page)"}
            </span>
            <span className="opacity-60">1920 × 10039 px</span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#121c15]">
            {/* Seamless Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d1610]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs text-amber-200/70 bg-black/40 px-4 py-1.5 rounded-full max-w-sm w-full text-center truncate">
                https://altyn-solok-demo.website.yandexcloud.net/
              </div>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                style={{ cursor: xpCursors.pointer }}
              >
                {locale === "en" ? "Live Site ↗" : "Открыть сайт ↗"}
              </a>
            </div>

            {/* Continuous Full-Page Image */}
            <div className="w-full bg-[#f1efe7]">
              <Image
                src="/placeholders/covers/altyn-solok-fullpage.jpg"
                alt="Полный скриншот сайта Алтын Солок"
                width={1920}
                height={10039}
                className="w-full h-auto block"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            04. BOTTOM BAR: Navigation & Repeat Call to Action
            ========================================================= */}
        <footer className="pt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold text-xs rounded-full transition-colors duration-200"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>{locale === "en" ? "Visit Website" : "Перейти на сайт"}</span>
              <span>↗</span>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full font-medium text-xs transition"
              style={{ cursor: xpCursors.pointer }}
            >
              {copied
                ? (locale === "en" ? "✓ Link Copied" : "✓ Ссылка скопирована")
                : (locale === "en" ? "Copy Project Link" : "Скопировать ссылку")}
            </button>
          </div>

          {adjacent && (adjacent.prev || adjacent.next) && onOpenProject && (
            <div className="flex items-center gap-2 text-xs">
              {adjacent.prev && (
                <button
                  type="button"
                  onClick={() => onOpenProject(adjacent.prev!.slug)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full font-medium transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  ← {adjacent.prev.title}
                </button>
              )}
              {adjacent.next && (
                <button
                  type="button"
                  onClick={() => onOpenProject(adjacent.next!.slug)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full font-medium transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  {adjacent.next.title} →
                </button>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
