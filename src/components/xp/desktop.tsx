"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useWindowManager } from "./window-manager-context";
import { WindowFrame } from "./window-frame";
import { WindowContentRouter } from "./window-content-router";
import { Taskbar } from "./taskbar";
import { StartMenu } from "./start-menu";
import { DesktopIcon } from "./desktop-icon";
import { ContextMenu, ContextMenuState } from "./context-menu";
import { TurnOffDialog } from "./turn-off-dialog";
import { Clippy } from "./clippy";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound, tryPlayStartupOnFirstGesture } from "@/lib/xp/sound";
import {
  MyComputerIcon,
  MyDocumentsIcon,
  WindowsMediaPlayerIcon,
  NotepadIcon,
  RecycleBinIcon,
  StoriesIcon,
  SolitaireIcon,
} from "./xp-icons";

interface IconDef {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export function Desktop() {
  const {
    windows,
    wallpaper,
    theme,
    openWindow,
    openProject,
    balloon,
    closeBalloon,
  } = useWindowManager();

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isTurnOffOpen, setIsTurnOffOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Play startup chime immediately or on first gesture
  useEffect(() => {
    tryPlayStartupOnFirstGesture();
  }, []);

  // Custom created folders and notes
  const [customIcons, setCustomIcons] = useState<Array<{
    id: string;
    title: string;
    type: "folder" | "file";
  }>>([]);

  // Deleted icon IDs (moved to Recycle Bin)
  const [deletedIconIds, setDeletedIconIds] = useState<string[]>([]);

  // Refresh flicker state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Construct focused desktop icons without cluttering with 19 files (A01, A06)
  const builtInIcons: IconDef[] = useMemo(
    () => [
      {
        id: "resume",
        title: "Резюме.pdf",
        icon: (
          <div className="w-12 h-12 rounded bg-gradient-to-b from-red-600 to-red-800 border-2 border-white text-white font-black text-xs grid place-items-center shadow-lg">
            <span className="tracking-tighter">PDF</span>
          </div>
        ),
      },
      {
        id: "my-documents",
        title: "Мои работы",
        icon: <MyDocumentsIcon className="w-12 h-12" />,
      },
      {
        id: "notepad",
        title: "Обо мне",
        icon: <NotepadIcon className="w-12 h-12" />,
      },
      {
        id: "my-computer",
        title: "Мой компьютер",
        icon: <MyComputerIcon className="w-12 h-12" />,
      },
      {
        id: "media-player",
        title: "Визуализатор",
        icon: <WindowsMediaPlayerIcon className="w-12 h-12" />,
      },
      {
        id: "stories",
        title: "Истории",
        icon: <StoriesIcon className="w-12 h-12" />,
      },
      {
        id: "recycle-bin",
        title: "Корзина",
        icon: <RecycleBinIcon className="w-12 h-12" />,
      },
      {
        id: "solitaire",
        title: "Косынка",
        icon: <SolitaireIcon className="w-12 h-12" />,
      },
    ],
    [],
  );

  // Combine built-in icons with user created icons
  const allIcons: IconDef[] = useMemo(() => {
    const visibleBuiltIn = builtInIcons.filter((i) => !deletedIconIds.includes(i.id));
    const created: IconDef[] = customIcons.map((c) => ({
      id: c.id,
      title: c.title,
      icon:
        c.type === "folder" ? (
          <MyDocumentsIcon className="w-12 h-12" />
        ) : (
          <NotepadIcon className="w-12 h-12" />
        ),
    }));
    return [...visibleBuiltIn, ...created];
  }, [builtInIcons, customIcons, deletedIconIds]);

  // Helper to compute neat grid positions
  const computeGridPositions = useCallback(
    (icons: IconDef[] = allIcons): Record<string, { x: number; y: number }> => {
      const isClient = typeof window !== "undefined";
      const screenH = isClient ? window.innerHeight : 768;
      const taskbarH = 46;
      const availH = screenH - taskbarH - 24;

      const rowH = 104;
      const colW = 106;
      const itemsPerCol = Math.max(3, Math.floor(availH / rowH));

      const positions: Record<string, { x: number; y: number }> = {};
      icons.forEach((item, index) => {
        const col = Math.floor(index / itemsPerCol);
        const row = index % itemsPerCol;
        positions[item.id] = {
          x: 14 + col * colW,
          y: 14 + row * rowH,
        };
      });
      return positions;
    },
    [allIcons],
  );

  const defaultPositions = useMemo(
    () => computeGridPositions(allIcons),
    [computeGridPositions, allIcons],
  );

  // Position state with free drag support
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setCustomPositions((prev) => ({
      ...prev,
      [id]: { x, y },
    }));
  }, []);

  const handleArrangeIcons = useCallback(
    (by: "grid" | "name" | "type" = "grid") => {
      xpSound.click();
      const sorted = [...allIcons];
      if (by === "name") {
        sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));
      } else if (by === "type") {
        const order = (id: string) => {
          if (id === "resume") return 0;
          if (id.startsWith("folder-")) return 1;
          if (id.startsWith("doc-")) return 2;
          if (id === "my-computer" || id === "my-documents" || id === "media-player") return 3;
          if (id.startsWith("project-")) return 4;
          if (id === "recycle-bin") return 99;
          return 5;
        };
        sorted.sort((a, b) => order(a.id) - order(b.id));
      }
      setCustomPositions(computeGridPositions(sorted));
    },
    [allIcons, computeGridPositions],
  );

  const handleRefresh = useCallback(() => {
    xpSound.click();
    setIsRefreshing(true);
    setSelectedIconId(null);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 120);
  }, []);

  const handleCreateFolder = useCallback((x: number, y: number) => {
    xpSound.click();
    const id = `folder-${Date.now()}`;
    const newFolder = {
      id,
      title: "Новая папка",
      type: "folder" as const,
    };
    setCustomIcons((prev) => [...prev, newFolder]);
    setCustomPositions((prev) => ({
      ...prev,
      [id]: {
        x: Math.max(10, Math.min(typeof window !== "undefined" ? window.innerWidth - 100 : 800, x - 20)),
        y: Math.max(10, Math.min(typeof window !== "undefined" ? window.innerHeight - 140 : 600, y - 20)),
      },
    }));
    setSelectedIconId(id);
  }, []);

  const handleCreateTextDoc = useCallback((x: number, y: number) => {
    xpSound.click();
    const id = `doc-${Date.now()}`;
    const newDoc = {
      id,
      title: "Заметка.txt",
      type: "file" as const,
    };
    setCustomIcons((prev) => [...prev, newDoc]);
    setCustomPositions((prev) => ({
      ...prev,
      [id]: {
        x: Math.max(10, Math.min(typeof window !== "undefined" ? window.innerWidth - 100 : 800, x - 20)),
        y: Math.max(10, Math.min(typeof window !== "undefined" ? window.innerHeight - 140 : 600, y - 20)),
      },
    }));
    setSelectedIconId(id);
  }, []);

  const handleDeleteIcon = useCallback((id: string) => {
    xpSound.recycle();
    setDeletedIconIds((prev) => [...prev, id]);
    setCustomIcons((prev) => prev.filter((item) => item.id !== id));
    setSelectedIconId(null);
  }, []);

  // Marquee selection box state
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  } | null>(null);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Desktop click handlers
  const handleDesktopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only left click initiates marquee
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest(
        ".xp-window, .xp-taskbar, .xp-start-menu, .xp-context-menu, .xp-desktop-icon, .xp-balloon",
      )
    ) {
      return;
    }
    setIsStartOpen(false);
    setSelectedIconId(null);
    setContextMenu(null);

    setMarquee({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: true,
    });
  };

  const handleDesktopPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!marquee || !marquee.active) return;
    setMarquee((prev) => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
  };

  const handleDesktopPointerUp = () => {
    if (marquee?.active) {
      setMarquee(null);
    }
  };

  // Right Click (Context Menu)
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest(".xp-window, .xp-taskbar, .xp-start-menu")) {
      return;
    }
    setIsStartOpen(false);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetType: "desktop",
    });
  };

  const handleOpenIcon = useCallback(
    (id: string) => {
      if (id.startsWith("project-")) {
        const slug = id.replace("project-", "");
        openProject(slug);
        return;
      }

      if (id.startsWith("folder-")) {
        const folder = customIcons.find((c) => c.id === id);
        openWindow({
          id,
          type: "my-documents",
          title: folder?.title || "Новая папка",
          iconType: "folder",
          x: 110,
          y: 80,
          width: 620,
          height: 420,
        });
        return;
      }

      if (id.startsWith("doc-")) {
        const doc = customIcons.find((c) => c.id === id);
        openWindow({
          id,
          type: "notepad",
          title: `${doc?.title || "Заметка.txt"} - Блокнот`,
          iconType: "notepad",
          x: 100,
          y: 70,
          width: 520,
          height: 400,
        });
        return;
      }

      switch (id) {
        case "resume":
          openWindow({
            id: "resume",
            type: "resume",
            title: "Резюме_Влад_Ахметов.pdf — Executive Summary",
            iconType: "resume",
            x: 70,
            y: 40,
            width: 680,
            height: 520,
          });
          break;

        case "my-computer":
          openWindow({
            id: "my-computer",
            type: "my-computer",
            title: "Мой компьютер",
            iconType: "computer",
            x: 70,
            y: 55,
            width: 580,
            height: 420,
          });
          break;

        case "my-documents":
          openWindow({
            id: "my-documents",
            type: "my-documents",
            title: "Мои документы — Проекты",
            iconType: "folder",
            x: 60,
            y: 50,
            width: 620,
            height: 420,
          });
          break;

        case "media-player":
          openWindow({
            id: "media-player",
            type: "media-player",
            title: "Windows Media Player - Showreel 2026",
            iconType: "wmp",
            x: 80,
            y: 40,
            width: 560,
            height: 440,
          });
          break;

        case "notepad":
          openWindow({
            id: "notepad",
            type: "notepad",
            title: "About_Vlad.txt - Блокнот",
            iconType: "notepad",
            x: 70,
            y: 60,
            width: 540,
            height: 400,
          });
          break;

        case "stories":
          openWindow({
            id: "stories",
            type: "stories",
            title: "Истории и процессы — Picture Viewer",
            iconType: "stories",
            x: 90,
            y: 70,
            width: 580,
            height: 430,
          });
          break;

        case "recycle-bin":
          openWindow({
            id: "recycle-bin",
            type: "recycle-bin",
            title: "Корзина",
            iconType: "recycle",
            x: 100,
            y: 80,
            width: 520,
            height: 360,
          });
          break;

        case "solitaire":
          openWindow({
            id: "solitaire",
            type: "solitaire",
            title: "Косынка — Авторская колода",
            iconType: "solitaire",
            x: 75,
            y: 35,
            width: 840,
            height: 620,
          });
          break;

        default:
          break;
      }
    },
    [openProject, openWindow, customIcons],
  );

  const handleIconContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedIconId(id);
      const item = allIcons.find((i) => i.id === id);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        targetType: id.startsWith("project-") ? "project" : "system-icon",
        targetId: id,
        targetTitle: item?.title,
      });
    },
    [allIcons],
  );

  // Calculate marquee rectangle dimensions
  const marqueeRect = marquee?.active
    ? {
        left: Math.min(marquee.startX, marquee.currentX),
        top: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
      }
    : null;

  return (
    <div
      ref={desktopRef}
      data-xp-theme={theme}
      className={`xp-desktop xp-system ${isRefreshing ? "xp-refreshing" : ""}`}
      style={{
        backgroundImage: wallpaper.startsWith("/")
          ? `url(${wallpaper}), radial-gradient(ellipse at 50% 20%, #76b5ff 0%, #2f82e8 45%, #155bb5 80%), linear-gradient(to top, #3a9718 0%, #58b628 25%, transparent 60%)`
          : undefined,
        background: !wallpaper.startsWith("/") ? wallpaper : undefined,
        cursor: xpCursors.default,
      }}
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={handleDesktopPointerMove}
      onPointerUp={handleDesktopPointerUp}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Marquee Selection Rect */}
      {marqueeRect && (
        <div
          className="xp-marquee"
          style={{
            left: `${marqueeRect.left}px`,
            top: `${marqueeRect.top}px`,
            width: `${marqueeRect.width}px`,
            height: `${marqueeRect.height}px`,
          }}
        />
      )}

      {/* Free-floating Draggable Desktop Icons */}
      {allIcons.map((item) => {
        const pos = customPositions[item.id] || defaultPositions[item.id] || { x: 14, y: 14 };
        return (
          <DesktopIcon
            key={item.id}
            id={item.id}
            title={item.title}
            icon={item.icon}
            x={pos.x}
            y={pos.y}
            isSelected={selectedIconId === item.id}
            onSelect={setSelectedIconId}
            onOpen={handleOpenIcon}
            onContextMenu={handleIconContextMenu}
            onPositionChange={handlePositionChange}
          />
        );
      })}

      {/* Render All Open Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <WindowContentRouter window={win} />
        </WindowFrame>
      ))}

      {/* Interactive Clippy Assistant */}
      <Clippy />

      {/* Balloon Notification Tooltip */}
      {balloon && (
        <div className="xp-balloon" onClick={closeBalloon}>
          <div className="xp-balloon-header">
            <div className="flex items-center gap-1.5 text-blue-900">
              <span>ℹ️</span>
              <span>{balloon.title}</span>
            </div>
            <span className="xp-balloon-close text-slate-500 hover:text-black">✕</span>
          </div>
          <div className="text-slate-800 leading-snug">{balloon.message}</div>
        </div>
      )}

      {/* Context Menu (PKM) */}
      <ContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onArrangeIcons={handleArrangeIcons}
        onRefresh={handleRefresh}
        onCreateFolder={handleCreateFolder}
        onCreateTextDoc={handleCreateTextDoc}
        onDeleteIcon={handleDeleteIcon}
        onOpenIcon={handleOpenIcon}
      />

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onTurnOffClick={() => {
          setIsStartOpen(false);
          setIsTurnOffOpen(true);
        }}
      />

      {/* Taskbar */}
      <Taskbar
        isStartOpen={isStartOpen}
        onToggleStart={() => setIsStartOpen(!isStartOpen)}
      />

      {/* Turn Off Computer Dialog */}
      <TurnOffDialog
        isOpen={isTurnOffOpen}
        onClose={() => setIsTurnOffOpen(false)}
      />
    </div>
  );
}
