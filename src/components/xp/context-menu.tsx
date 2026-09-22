"use client";

import React, { useEffect } from "react";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { getProject } from "@/data/projects";
import { useWindowManager } from "./window-manager-context";

export interface ContextMenuState {
  x: number;
  y: number;
  targetType: "desktop" | "project" | "system-icon" | "custom-item";
  targetId?: string;
  targetTitle?: string;
}

interface ContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  onArrangeIcons?: (by: "grid" | "name" | "type") => void;
  onRefresh?: () => void;
  onCreateFolder?: (x: number, y: number) => void;
  onCreateTextDoc?: (x: number, y: number) => void;
  onDeleteIcon?: (id: string) => void;
  onOpenIcon?: (id: string) => void;
}

export function ContextMenu({
  menu,
  onClose,
  onArrangeIcons,
  onRefresh,
  onCreateFolder,
  onCreateTextDoc,
  onDeleteIcon,
  onOpenIcon,
}: ContextMenuProps) {
  const { openProject, openWindow, minimizeAll, showBalloon } = useWindowManager();

  // Close on outside click or escape
  useEffect(() => {
    const handleDown = () => onClose();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!menu) return null;

  const isProject = menu.targetType === "project";
  const projectSlug = isProject && menu.targetId ? menu.targetId.replace("project-", "") : null;
  const project = projectSlug ? getProject(projectSlug) : null;

  const handleCopyLink = () => {
    if (project && typeof window !== "undefined") {
      const url = `${window.location.origin}/?project=${project.slug}`;
      navigator.clipboard.writeText(url);
      showBalloon("Ссылка скопирована", `Ссылка на проект «${project.title}» скопирована в буфер обмена!`);
    }
    onClose();
  };

  const handleShareTelegram = () => {
    if (project && typeof window !== "undefined") {
      const url = encodeURIComponent(`${window.location.origin}/?project=${project.slug}`);
      const text = encodeURIComponent(`Проект ${project.title} — Влад Ахметов`);
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    }
    onClose();
  };

  const isDesktop = menu.targetType === "desktop";

  // Menu boundary clamping
  const menuLeft = Math.min(menu.x, typeof window !== "undefined" ? window.innerWidth - 200 : 800);
  const menuTop = Math.min(menu.y, typeof window !== "undefined" ? window.innerHeight - 240 : 600);

  return (
    <div
      className="xp-context-menu"
      data-ym-goal="context_menu_open"
      data-ym-params={JSON.stringify({ targetType: menu.targetType, targetId: menu.targetId })}
      style={{
        left: `${menuLeft}px`,
        top: `${menuTop}px`,
        cursor: xpCursors.default,
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isDesktop ? (
        <>
          {/* Submenu: Arrange Icons */}
          <div className="xp-context-item group" style={{ cursor: xpCursors.pointer }}>
            <span className="flex items-center gap-1.5">
              <span>Упорядочить значки</span>
            </span>
            <span className="text-[10px] ml-4 text-slate-600 group-hover:text-white">▸</span>

            <div className="xp-context-submenu">
              <div
                className="xp-context-item"
                onClick={() => {
                  onArrangeIcons?.("name");
                  onClose();
                }}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>Имя (А–Я)</span>
              </div>
              <div
                className="xp-context-item"
                onClick={() => {
                  onArrangeIcons?.("type");
                  onClose();
                }}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>Тип (файлы/проекты)</span>
              </div>
              <div className="xp-context-sep" />
              <div
                className="xp-context-item"
                onClick={() => {
                  onArrangeIcons?.("grid");
                  onClose();
                }}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>✓ Выровнять по сетке</span>
              </div>
            </div>
          </div>

          {/* Refresh Action */}
          <div
            className="xp-context-item"
            onClick={() => {
              onRefresh?.();
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Обновить</span>
          </div>

          <div className="xp-context-sep" />

          <div className="xp-context-item is-disabled">
            <span>Вставить</span>
          </div>

          {/* Submenu: New */}
          <div className="xp-context-item group" style={{ cursor: xpCursors.pointer }}>
            <span className="flex items-center gap-1.5">
              <span>Создать</span>
            </span>
            <span className="text-[10px] ml-4 text-slate-600 group-hover:text-white">▸</span>

            <div className="xp-context-submenu">
              <div
                className="xp-context-item"
                onClick={() => {
                  onCreateFolder?.(menu.x, menu.y);
                  onClose();
                }}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📁 Папку</span>
              </div>
              <div
                className="xp-context-item"
                onClick={() => {
                  onCreateTextDoc?.(menu.x, menu.y);
                  onClose();
                }}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📄 Текстовый документ</span>
              </div>
            </div>
          </div>

          <div className="xp-context-sep" />

          {/* Show Desktop */}
          <div
            className="xp-context-item"
            onClick={() => {
              minimizeAll();
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Показать рабочий стол</span>
          </div>

          <div className="xp-context-sep" />

          {/* Display Properties */}
          <div
            className="xp-context-item is-bold"
            onClick={() => {
              xpSound.click();
              openWindow({
                id: "display-properties",
                type: "display-properties",
                title: "Свойства: Экран",
                iconType: "control",
                x: 100,
                y: 60,
                width: 440,
                height: 420,
              });
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Свойства</span>
          </div>
        </>
      ) : (
        /* Context Menu for Icons (Project, System, or Custom) */
        <>
          <div
            className="xp-context-item is-bold"
            onClick={() => {
              if (menu.targetId) {
                if (isProject && project) {
                  openProject(project.slug);
                } else if (onOpenIcon) {
                  onOpenIcon(menu.targetId);
                }
              }
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Открыть</span>
          </div>

          {project && (
            <>
              <div
                className="xp-context-item"
                onClick={handleCopyLink}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>Скопировать ссылку</span>
              </div>

              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="xp-context-item"
                  onClick={onClose}
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>Смотреть онлайн ↗</span>
                </a>
              )}

              <div
                className="xp-context-item"
                onClick={handleShareTelegram}
                style={{ cursor: xpCursors.pointer }}
              >
                <span>Поделиться в Telegram</span>
              </div>
            </>
          )}

          <div className="xp-context-sep" />

          {/* Delete action for custom or desktop icons */}
          <div
            className="xp-context-item text-red-600 hover:text-white"
            onClick={() => {
              if (menu.targetId) {
                onDeleteIcon?.(menu.targetId);
              }
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Удалить в Корзину</span>
          </div>

          <div className="xp-context-sep" />

          {/* Properties Dialog */}
          <div
            className="xp-context-item"
            onClick={() => {
              xpSound.click();
              if (project) {
                openWindow({
                  id: `properties-${project.slug}`,
                  type: "properties",
                  title: `Свойства: ${project.title}.exe`,
                  iconType: project.motif,
                  x: Math.max(40, Math.min(menu.x - 20, window.innerWidth - 380)),
                  y: Math.max(30, Math.min(menu.y - 20, window.innerHeight - 450)),
                  width: 360,
                  height: 440,
                  props: { slug: project.slug },
                });
              } else {
                openWindow({
                  id: `properties-${menu.targetId}`,
                  type: "properties",
                  title: `Свойства: ${menu.targetTitle || "Элемент"}`,
                  iconType: "folder",
                  x: Math.max(40, Math.min(menu.x - 20, window.innerWidth - 380)),
                  y: Math.max(30, Math.min(menu.y - 20, window.innerHeight - 450)),
                  width: 360,
                  height: 440,
                  props: { slug: "kora" },
                });
              }
              onClose();
            }}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>Свойства</span>
          </div>
        </>
      )}
    </div>
  );
}
