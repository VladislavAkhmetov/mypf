"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./case-clip.module.css";
import { useLocale } from "@/lib/i18n";

/** A looping, muted case clip: plays only while on screen, has a pause button, and stays still with reduced motion. */
export function CaseClip({ src, poster, label, ratio, className = "" }: { src: string; poster: string; label: string; ratio: string; className?: string }) {
  const { tr } = useLocale();
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.controls = true; return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { if (!userPaused.current) video.play().catch(() => {}); }
      else video.pause();
    }, { threshold: 0.35 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) { userPaused.current = false; video.play().catch(() => {}); }
    else { userPaused.current = true; video.pause(); }
  };

  return (
    <div className={`${styles.clip} ${className}`} style={{ aspectRatio: ratio }}>
      <video ref={ref} muted loop playsInline preload="metadata" poster={poster} aria-label={label} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        <source src={src} type="video/mp4" />
      </video>
      <button type="button" className={styles.toggle} onClick={toggle} aria-label={playing ? tr("Остановить ролик", "Pause video") : tr("Запустить ролик", "Play video")}>
        {playing
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" /><rect x="13.5" y="5" width="4" height="14" rx="1.2" /></svg>
          : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.4v13.2a1 1 0 0 0 1.5.86l10.6-6.6a1 1 0 0 0 0-1.72L9.5 4.54A1 1 0 0 0 8 5.4Z" /></svg>}
      </button>
    </div>
  );
}
