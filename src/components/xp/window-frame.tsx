"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { WindowItem, useWindowManager } from "./window-manager-context";
import { xpCursors } from "@/lib/xp/cursors";
import notesStyles from "@/components/notes/notes-window.module.css";

interface WindowFrameProps {
  window: WindowItem;
  children: React.ReactNode;
}

export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowBounds,
  } = useWindowManager();

  const isFocused = activeWindowId === win.id;
  const frameRef = useRef<HTMLDivElement>(null);

  // Dragging state tracking refs (zero re-render during drag for 120 FPS performance)
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: win.x,
    currentY: win.y,
  });

  // Resizing state tracking refs
  const resizeRef = useRef<{
    isResizing: boolean;
    direction: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startXPos: number;
    startYPos: number;
  }>({
    isResizing: false,
    direction: "",
    startX: 0,
    startY: 0,
    startW: win.width,
    startH: win.height,
    startXPos: win.x,
    startYPos: win.y,
  });

  // Keep refs in sync with props
  useEffect(() => {
    dragRef.current.currentX = win.x;
    dragRef.current.currentY = win.y;
    resizeRef.current.startW = win.width;
    resizeRef.current.startH = win.height;
    resizeRef.current.startXPos = win.x;
    resizeRef.current.startYPos = win.y;
  }, [win.x, win.y, win.width, win.height]);

  // Pointer Down on Titlebar for Dragging
  const handleTitlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (win.isMaximized) return;
      if (typeof window !== "undefined" && window.innerWidth < 768) return; // Disable dragging on mobile
      if ((e.target as HTMLElement).closest(".xp-btn-ctrl")) return;

      focusWindow(win.id);
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    },
    [win.id, win.isMaximized, focusWindow],
  );

  const handleTitlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging || !frameRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1024;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 768;
      const minX = -(win.width - 100);
      const maxX = screenW - 100;
      const minY = 0;
      const maxY = Math.max(0, screenH - 70);

      const clampedX = Math.max(minX, Math.min(maxX, dragRef.current.currentX + dx));
      const clampedY = Math.max(minY, Math.min(maxY, dragRef.current.currentY + dy));

      // Direct GPU transform update
      frameRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
    },
    [win.width],
  );

  const handleTitlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1024;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 768;
      const minX = -(win.width - 100);
      const maxX = screenW - 100;
      const minY = 0;
      const maxY = Math.max(0, screenH - 70);

      const finalX = Math.max(minX, Math.min(maxX, dragRef.current.currentX + dx));
      const finalY = Math.max(minY, Math.min(maxY, dragRef.current.currentY + dy));

      dragRef.current.currentX = finalX;
      dragRef.current.currentY = finalY;

      updateWindowBounds(win.id, { x: finalX, y: finalY });
    },
    [win.id, win.width, updateWindowBounds],
  );

  // Resize Handlers
  const handleResizePointerDown = useCallback(
    (dir: string, e: React.PointerEvent) => {
      if (win.isMaximized) return;
      if (typeof window !== "undefined" && window.innerWidth < 768) return;
      e.stopPropagation();
      focusWindow(win.id);

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      resizeRef.current.isResizing = true;
      resizeRef.current.direction = dir;
      resizeRef.current.startX = e.clientX;
      resizeRef.current.startY = e.clientY;
      resizeRef.current.startW = win.width;
      resizeRef.current.startH = win.height;
      resizeRef.current.startXPos = win.x;
      resizeRef.current.startYPos = win.y;
    },
    [win.id, win.isMaximized, win.width, win.height, win.x, win.y, focusWindow],
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current.isResizing || !frameRef.current) return;
      const { direction, startX, startY, startW, startH, startXPos, startYPos } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startXPos;
      let newY = startYPos;

      if (direction.includes("e")) newW = Math.max(280, startW + dx);
      if (direction.includes("s")) newH = Math.max(180, startH + dy);
      if (direction.includes("w")) {
        newW = Math.max(280, startW - dx);
        newX = startXPos + (startW - newW);
      }
      if (direction.includes("n")) {
        newH = Math.max(180, startH - dy);
        newY = Math.max(0, startYPos + (startH - newH));
      }

      frameRef.current.style.width = `${newW}px`;
      frameRef.current.style.height = `${newH}px`;
      frameRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    },
    [],
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeRef.current.isResizing) return;
      resizeRef.current.isResizing = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const { direction, startX, startY, startW, startH, startXPos, startYPos } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startXPos;
      let newY = startYPos;

      if (direction.includes("e")) newW = Math.max(280, startW + dx);
      if (direction.includes("s")) newH = Math.max(180, startH + dy);
      if (direction.includes("w")) {
        newW = Math.max(280, startW - dx);
        newX = startXPos + (startW - newW);
      }
      if (direction.includes("n")) {
        newH = Math.max(180, startH - dy);
        newY = Math.max(0, startYPos + (startH - newH));
      }

      updateWindowBounds(win.id, { x: newX, y: newY, width: newW, height: newH });
    },
    [win.id, updateWindowBounds],
  );

  const handleTitleDoubleClick = useCallback(() => {
    if (win.type === "notes") return;
    if (win.isMaximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
  }, [win.id, win.type, win.isMaximized, maximizeWindow, restoreWindow]);

  if (win.isMinimized) return null;

  return (
    <div
      ref={frameRef}
      id={`window-${win.id}`}
      className={`xp-window ${win.type === "notes" ? notesStyles.frame : ""} ${!isFocused ? "is-inactive" : ""} ${win.isMaximized ? "is-maximized" : ""}`}
      style={{
        zIndex: win.zIndex,
        ...(win.isMaximized
          ? {}
          : {
              width: `${win.width}px`,
              height: `${win.height}px`,
              transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
            }),
      }}
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Titlebar */}
      <div
        className="xp-titlebar"
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={handleTitleDoubleClick}
      >
        <div className="xp-titlebar-title">
          {/* Title text */}
          <span>{win.title}</span>
        </div>

        {/* Controls */}
        <div className="xp-window-controls">
          <button
            type="button"
            className="xp-btn-ctrl xp-btn-minimize"
            data-ym-goal="window_minimize"
            data-ym-params={JSON.stringify({ windowId: win.id, title: win.title })}
            title="Свернуть"
            onClick={() => minimizeWindow(win.id)}
            style={{ cursor: xpCursors.pointer }}
          >
            <svg width="8" height="2" viewBox="0 0 8 2" fill="white">
              <rect width="8" height="2" />
            </svg>
          </button>
          <button
            type="button"
            className="xp-btn-ctrl xp-btn-maximize"
            data-ym-goal={win.isMaximized ? "window_restore" : "window_maximize"}
            data-ym-params={JSON.stringify({ windowId: win.id, title: win.title })}
            title={win.isMaximized ? "Восстановить" : "Развернуть"}
            onClick={() => (win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id))}
            style={{ cursor: xpCursors.pointer }}
          >
            {win.isMaximized ? (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.2">
                <rect x="2.5" y="0.5" width="6" height="6" />
                <rect x="0.5" y="2.5" width="6" height="6" fill="#206aff" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.2">
                <rect x="0.5" y="0.5" width="8" height="8" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="xp-btn-ctrl xp-btn-close"
            data-ym-goal="window_close"
            data-ym-params={JSON.stringify({ windowId: win.id, title: win.title })}
            title="Закрыть"
            onClick={() => closeWindow(win.id)}
            style={{ cursor: xpCursors.pointer }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="1.5">
              <line x1="1" y1="1" x2="8" y2="8" strokeLinecap="round" />
              <line x1="8" y1="1" x2="1" y2="8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>

      {/* 8-direction Resize handles (only when not maximized) */}
      {!win.isMaximized && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-1.5 z-20"
            style={{ cursor: xpCursors.nsResize }}
            onPointerDown={(e) => handleResizePointerDown("n", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-2 z-20"
            style={{ cursor: xpCursors.nsResize }}
            onPointerDown={(e) => handleResizePointerDown("s", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute top-0 bottom-0 left-0 w-2 z-20"
            style={{ cursor: xpCursors.ewResize }}
            onPointerDown={(e) => handleResizePointerDown("w", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-2 z-20"
            style={{ cursor: xpCursors.ewResize }}
            onPointerDown={(e) => handleResizePointerDown("e", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute top-0 left-0 w-3 h-3 z-30"
            style={{ cursor: xpCursors.nwseResize }}
            onPointerDown={(e) => handleResizePointerDown("nw", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 z-30"
            style={{ cursor: xpCursors.neswResize }}
            onPointerDown={(e) => handleResizePointerDown("ne", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 z-30"
            style={{ cursor: xpCursors.neswResize }}
            onPointerDown={(e) => handleResizePointerDown("sw", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 z-30"
            style={{ cursor: xpCursors.nwseResize }}
            onPointerDown={(e) => handleResizePointerDown("se", e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
        </>
      )}
    </div>
  );
}
