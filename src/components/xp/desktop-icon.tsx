"use client";

import React, { useRef, useCallback } from "react";
import { xpCursors } from "@/lib/xp/cursors";

interface DesktopIconProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

export function DesktopIcon({
  id,
  title,
  icon,
  x,
  y,
  isSelected = false,
  onSelect,
  onOpen,
  onContextMenu,
  onPositionChange,
}: DesktopIconProps) {
  const iconRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    isDragging: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    lastClickTime: number;
  }>({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialX: x,
    initialY: y,
    lastClickTime: 0,
  });

  React.useEffect(() => {
    dragRef.current.initialX = x;
    dragRef.current.initialY = y;
  }, [x, y]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Left click only for dragging/selecting
      if (e.button !== 0) return;
      e.stopPropagation();

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      dragRef.current.isDragging = true;
      dragRef.current.hasMoved = false;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging || !iconRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved) {
        const curX = dragRef.current.initialX + dx;
        const curY = dragRef.current.initialY + dy;
        iconRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      if (dragRef.current.hasMoved) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const finalX = Math.max(8, Math.min(window.innerWidth - 100, dragRef.current.initialX + dx));
        const finalY = Math.max(8, Math.min(window.innerHeight - 140, dragRef.current.initialY + dy));
        onPositionChange(id, Math.round(finalX), Math.round(finalY));
      } else {
        // Normal click or double click detection
        const now = Date.now();
        if (now - dragRef.current.lastClickTime < 350) {
          // Double click
          onOpen(id);
        } else {
          // Single click: select icon without sound (like Windows XP)
          onSelect(id);
        }
        dragRef.current.lastClickTime = now;
      }
    },
    [id, onPositionChange, onOpen, onSelect],
  );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen(id);
      }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id);
      onContextMenu(e, id);
    };

    return (
      <div
        ref={iconRef}
        role="button"
        tabIndex={0}
        aria-label={title}
        data-ym-goal="desktop_icon_click"
        data-ym-params={JSON.stringify({ iconId: id, title })}
        className={`xp-desktop-icon absolute ${isSelected ? "is-selected" : ""}`}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0)`,
          cursor: xpCursors.pointer,
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => onSelect(id)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={() => onOpen(id)}
        onContextMenu={handleContextMenu}
      >
        <div className="xp-desktop-icon-img flex items-center justify-center pointer-events-none">
          {icon}
        </div>
        <div className="xp-desktop-icon-label pointer-events-none">{title}</div>
      </div>
    );
  }
