"use client";

import React, { useEffect, useRef, useState } from "react";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import { useLocale } from "@/lib/i18n";

interface TurnOffDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// dialog -> chosen action -> (shutting | restarting | standby) -> off
type Phase = "dialog" | "shutting" | "restarting" | "standby" | "off" | "booting";

const SHUTDOWN_MS = 2200;
const RESTART_MS = 1800;

function MoonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.7.7 0 0 0-.9-.9A10 10 0 1 0 21.4 15.5a.7.7 0 0 0-.9-.9Z" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3v8.5" />
      <path d="M6.6 6.9a8 8 0 1 0 10.8 0" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 3.5v5h-5" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="relative block w-14 h-3.5 overflow-hidden rounded-sm border border-white/60 bg-[#1f3f9c]" aria-hidden="true">
      <span className="absolute inset-y-0 left-0 w-8 animate-[xp-progress_1.4s_linear_infinite] bg-[repeating-linear-gradient(90deg,#7fb2ff_0_6px,transparent_6px_8px)]" />
    </span>
  );
}

// Mounted only while open, so every opening starts from a fresh dialog.
function TurnOffContent({ onClose }: { onClose: () => void }) {
  const { tr } = useLocale();
  const [phase, setPhase] = useState<Phase>("dialog");
  const [hintVisible, setHintVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(dialogRef, { isOpen: phase === "dialog", onClose });

  // Each phase hands over to the next one on a timer; leaving the phase cancels it.
  useEffect(() => {
    if (phase === "shutting") {
      const timer = window.setTimeout(() => setPhase("off"), SHUTDOWN_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "restarting") {
      const timer = window.setTimeout(() => window.location.reload(), RESTART_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "booting") {
      const timer = window.setTimeout(() => window.location.reload(), 300);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  // Standby wakes on any key or click, like the real thing.
  useEffect(() => {
    if (phase !== "standby") return;
    const wake = () => {
      xpSound.click();
      onClose();
    };
    const arm = window.setTimeout(() => {
      window.addEventListener("keydown", wake);
      window.addEventListener("pointerdown", wake);
    }, 400);
    const hint = window.setTimeout(() => setHintVisible(true), 1500);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(hint);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, [phase, onClose]);

  const choose = (next: Phase) => () => {
    xpSound.click();
    setPhase(next);
  };

  const powerOn = () => {
    xpSound.startup();
    setPhase("booting");
  };

  if (phase === "standby") {
    return (
      <div className="fixed inset-0 z-[30001] bg-black select-none" style={{ cursor: "none" }} role="status" aria-live="polite">
        <p className={`absolute inset-x-0 bottom-10 text-center text-sm text-white/40 transition-opacity duration-700 ${hintVisible ? "opacity-100" : "opacity-0"}`}>
          {tr("Ждущий режим. Нажмите любую клавишу или кликните, чтобы продолжить.", "Stand by. Press any key or click to continue.")}
        </p>
      </div>
    );
  }

  if (phase === "shutting" || phase === "restarting") {
    return (
      <div className="fixed inset-0 z-[30001] grid place-items-center bg-[#5a7edc] text-white select-none" style={{ cursor: xpCursors.default }} role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-6">
          <span className="text-3xl font-semibold tracking-tight drop-shadow" style={{ fontFamily: "Trebuchet MS, Tahoma, sans-serif" }}>
            {phase === "shutting" ? tr("Завершение работы…", "Shutting down…") : tr("Перезагрузка…", "Restarting…")}
          </span>
          <Spinner />
        </div>
      </div>
    );
  }

  if (phase === "off" || phase === "booting") {
    return (
      <div className="fixed inset-0 z-[30001] grid place-items-center bg-black select-none px-6 text-center" style={{ cursor: xpCursors.default }}>
        <div className="flex flex-col items-center gap-8">
          <p className="max-w-md text-xl leading-snug text-[#ff9a3c]" style={{ fontFamily: "Tahoma, Verdana, sans-serif" }}>
            {tr("Теперь питание компьютера можно отключить.", "It is now safe to turn off your computer.")}
          </p>
          <button
            type="button"
            autoFocus
            onClick={powerOn}
            className="flex items-center gap-2 rounded-full border border-white/25 px-5 py-2 text-sm text-white/80 transition hover:border-white/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff9a3c]"
            style={{ cursor: xpCursors.pointer }}
          >
            <PowerIcon />
            {tr("Включить компьютер", "Turn on computer")}
          </button>
        </div>
      </div>
    );
  }

  const actions = [
    { label: tr("Ждущий режим", "Stand By"), onClick: choose("standby"), icon: <MoonIcon />, tone: "from-amber-400 to-amber-600" },
    { label: tr("Выключение", "Turn Off"), onClick: choose("shutting"), icon: <PowerIcon />, tone: "from-red-500 to-red-700" },
    { label: tr("Перезагрузка", "Restart"), onClick: choose("restarting"), icon: <RestartIcon />, tone: "from-emerald-500 to-emerald-700" },
  ];

  return (
    <div
      className="fixed inset-0 z-[30000] bg-black/40 backdrop-grayscale flex items-center justify-center select-none"
      onClick={onClose}
      style={{ cursor: xpCursors.default }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="turn-off-title"
        className="w-[22rem] max-w-[calc(100vw-24px)] bg-gradient-to-b from-[#0055ea] via-[#003fb3] to-[#002d80] border-2 border-white rounded-lg shadow-2xl overflow-hidden p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-blue-400 pb-2 mb-2">
          <h2 id="turn-off-title" className="font-bold text-sm drop-shadow">{tr("Выключение компьютера", "Turn off computer")}</h2>
          <span className="font-bold text-xs text-blue-200">Windows XP</span>
        </div>

        <div className="flex items-start justify-around py-5">
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="group flex w-24 flex-col items-center gap-2 rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-gradient-to-b ${action.tone} text-white shadow-md transition-transform group-hover:scale-105 group-active:scale-95`}>
                {action.icon}
              </span>
              <span className="text-[11px] font-semibold text-blue-100 group-hover:text-white">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-blue-400/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded shadow-sm border border-slate-400"
            style={{ cursor: xpCursors.pointer }}
          >
            {tr("Отмена", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TurnOffDialog({ isOpen, onClose }: TurnOffDialogProps) {
  return isOpen ? <TurnOffContent onClose={onClose} /> : null;
}
