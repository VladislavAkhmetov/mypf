"use client";

import { GlowFill } from "@/components/project-cover";
import { stories } from "@/data/stories";
import { useLocale } from "../lib/i18n";
import { AnimatePresence, motion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  open: (index: number) => void;
};

const StoryCtx = createContext<Ctx | null>(null);

export function useStory() {
  const ctx = useContext(StoryCtx);
  if (!ctx) throw new Error("useStory must be used inside StoryProvider");
  return ctx;
}

export function StoryProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const { t } = useLocale();

  const story = index === null ? null : stories[index];

  const close = useCallback(() => {
    setIndex(null);
    setSlide(0);
  }, []);

  const next = useCallback(() => {
    if (index === null || !story) return;
    if (slide + 1 < story.slides.length) {
      setSlide((s) => s + 1);
      return;
    }
    if (index + 1 < stories.length) {
      setIndex(index + 1);
      setSlide(0);
      return;
    }
    close();
  }, [close, index, slide, story]);

  const prev = useCallback(() => {
    if (index === null || !story) return;
    if (slide > 0) {
      setSlide((s) => s - 1);
      return;
    }
    if (index > 0) {
      const prevStory = stories[index - 1];
      setIndex(index - 1);
      setSlide(prevStory.slides.length - 1);
    }
  }, [index, slide, story]);

  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") nextRef.current();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, index, prev]);

  useEffect(() => {
    if (index === null) return;
    const id = window.setTimeout(() => nextRef.current(), 4200);
    return () => window.clearTimeout(id);
  }, [index, slide]);

  useEffect(() => {
    if (index === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [index]);

  const open = useCallback((i: number) => {
    setIndex(i);
    setSlide(0);
  }, []);

  const value = useMemo(() => ({ open }), [open]);
  const current = story?.slides[slide];

  return (
    <StoryCtx.Provider value={value}>
      {children}
      <AnimatePresence>
        {story && current ? (
          <motion.div
            key="story-overlay"
            className="story-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="story-stage">
              <div className="story-progress">
                {story.slides.map((s, i) => (
                  <span key={s.title.en} className="story-bar">
                    <motion.span
                      className="story-bar-fill"
                      initial={{ width: i < slide ? "100%" : "0%" }}
                      animate={{ width: i < slide ? "100%" : i === slide ? "100%" : "0%" }}
                      transition={
                        i === slide
                          ? { duration: 4.2, ease: "linear" }
                          : { duration: 0.2 }
                      }
                    />
                  </span>
                ))}
              </div>
              <motion.div
                key={`${story.id}-${slide}`}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="story-frame"
              >
                <GlowFill
                  glow={current.glow}
                  motif={current.motif}
                  image={current.image}
                  sizes="(max-width: 768px) 92vw, 34rem"
                  className="h-full w-full"
                />
                <div className="story-copy">
                  <span>{t(current.kicker)}</span>
                  <p>{t(current.title)}</p>
                </div>
                <button
                  type="button"
                  className="story-hit left"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={prev}
                  aria-label="prev"
                />
                <button
                  type="button"
                  className="story-hit right"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={next}
                  aria-label="next"
                />
              </motion.div>
              <p className="story-label">{t(story.label)}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </StoryCtx.Provider>
  );
}
