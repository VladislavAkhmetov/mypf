"use client";

import { GlowFill } from "@/components/project-cover";
import { stories } from "@/data/stories";
import { site } from "@/data/site";
import { useLocale } from "../lib/i18n";
import { useStory } from "@/components/story-viewer";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useRef } from "react";

export function Stories() {
  const { t } = useLocale();
  const { open } = useStory();
  const canHover = useHoverCapable();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover || e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !scrollerRef.current) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) < 8) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      scrollerRef.current.setPointerCapture(e.pointerId);
    }
    scrollerRef.current.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (scrollerRef.current?.hasPointerCapture(e.pointerId)) {
      scrollerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="stories">
      <div
        ref={scrollerRef}
        className={canHover ? "stories-row stories-row-grab" : "stories-row"}
        aria-label={t(site.ui.stories)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {stories.map((story, i) => (
          <button
            key={story.id}
            type="button"
            onClick={() => {
              if (drag.current.moved) return;
              open(i);
            }}
            className="story-chip"
            aria-label={t(story.label)}
          >
            <span className={i === 0 ? "story-thumb story-chip-now" : "story-thumb"}>
              <GlowFill
                glow={story.slides[0].glow}
                motif={story.slides[0].motif}
                image={story.cover}
                sizes="72px"
                className="h-full w-full"
              />
            </span>
            <span className="story-chip-label">{t(story.label)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
