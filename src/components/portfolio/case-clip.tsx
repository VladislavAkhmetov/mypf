"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./case-clip.module.css";
import { useLocale } from "@/lib/i18n";

/**
 * A looping case clip: plays automatically while on screen, supports optional audio with sound autoplay handling,
 * has play/pause and mute/unmute buttons, and stays still with reduced motion.
 */
export function CaseClip({
  src,
  poster,
  label,
  ratio,
  variant = "default",
  sound = false,
  shadow = false,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  ratio?: string;
  variant?: "default" | "phone";
  sound?: boolean;
  shadow?: boolean;
  className?: string;
}) {
  const isPhone = variant === "phone";
  const { tr } = useLocale();
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }

    const startPlayback = () => {
      if (userPaused.current) return;
      video.muted = muted;
      video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startPlayback();
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [muted]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.muted = muted;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = ref.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted && video.paused && !userPaused.current) {
      video.play().catch(() => {});
    }
  };

  return (
    <div
      className={`${styles.clip} ${isPhone ? styles.phoneClipFrame : ""} ${shadow ? styles.withShadow : ""} ${className}`}
      style={!isPhone && ratio ? { aspectRatio: ratio } : undefined}
    >
      <video
        ref={ref}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className={styles.controls}>
        {sound && (
          <button
            type="button"
            className={styles.soundToggle}
            data-active={!muted}
            onClick={toggleMute}
            aria-label={muted ? tr("Включить звук", "Unmute audio") : tr("Выключить звук", "Mute audio")}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                <path d="m22 9-6 6m0-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" fill="currentColor" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            <span>{muted ? tr("Включить звук", "Unmute") : tr("Выключить звук", "Mute")}</span>
          </button>
        )}

        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={playing ? tr("Остановить ролик", "Pause video") : tr("Запустить ролик", "Play video")}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
              <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.4v13.2a1 1 0 0 0 1.5.86l10.6-6.6a1 1 0 0 0 0-1.72L9.5 4.54A1 1 0 0 0 8 5.4Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
