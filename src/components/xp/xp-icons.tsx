import React from "react";

export function WindowsFlagIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      {/* Top Left: Red */}
      <path
        d="M2.5 4.5 C5.5 3.5 8 5 11 3.8 L11 11.2 C8 12.2 5.5 10.8 2.5 11.8 Z"
        fill="#f35325"
      />
      {/* Top Right: Green */}
      <path
        d="M12.5 3.5 C15.5 2.5 18.5 4 21.5 2.8 L21.5 10.2 C18.5 11.2 15.5 9.8 12.5 10.8 Z"
        fill="#81bc06"
      />
      {/* Bottom Left: Blue */}
      <path
        d="M2.5 13.5 C5.5 12.5 8 14 11 12.8 L11 20.2 C8 21.2 5.5 19.8 2.5 20.8 Z"
        fill="#05a6f0"
      />
      {/* Bottom Right: Yellow */}
      <path
        d="M12.5 12.5 C15.5 11.5 18.5 13 21.5 11.8 L21.5 19.2 C18.5 20.2 15.5 18.8 12.5 19.8 Z"
        fill="#ffba08"
      />
    </svg>
  );
}

export function MyComputerIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/my-computer.png"
      alt="Мой компьютер"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function MyDocumentsIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/my-documents.png"
      alt="Мои документы"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function WindowsMediaPlayerIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/media-player.png"
      alt="Windows Media Player"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function NotepadIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/notepad.png"
      alt="Блокнот"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function InternetExplorerIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/ie.png"
      alt="Internet Explorer"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function StoriesIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/journal.svg"
      alt="Журнал"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}


export function ControlPanelIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect x="6" y="8" width="36" height="32" rx="3" fill="#cbd5e1" stroke="#475467" strokeWidth="2" />
      <rect x="10" y="12" width="28" height="6" fill="#2563eb" rx="1" />
      {/* Sliders & Gears */}
      <circle cx="16" cy="26" r="3.5" fill="#e11d48" />
      <line x1="16" y1="22" x2="16" y2="34" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="30" r="3.5" fill="#16a34a" />
      <line x1="24" y1="22" x2="24" y2="34" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="24" r="3.5" fill="#2563eb" />
      <line x1="32" y1="22" x2="32" y2="34" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TelegramIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <circle cx="24" cy="24" r="20" fill="#0284c7" />
      <path
        d="M12 23.5 L34 14 L29 34 L21 28 L17 31 L18 25 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectFileIcon({ className = "w-8 h-8", motif = "bezier" }: { className?: string; motif?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Executable / Project File Card */}
      <rect x="8" y="6" width="32" height="36" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
      <rect x="10" y="8" width="28" height="9" fill="#0284c7" />
      <circle cx="14" cy="12.5" r="1.5" fill="#ffffff" />
      <circle cx="19" cy="12.5" r="1.5" fill="#ffffff" />
      {/* Inner preview graphic depending on motif */}
      {motif === "bezier" && (
        <path d="M14 32 C 18 18, 28 18, 34 32" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {motif === "grid" && (
        <path d="M13 22 H35 M13 28 H35 M20 18 V34 M28 18 V34" stroke="#0284c7" strokeWidth="1.5" />
      )}
      {motif === "binary" && (
        <text x="12" y="26" fill="#16a34a" fontSize="8" fontFamily="monospace">
          0101
        </text>
      )}
      {motif !== "bezier" && motif !== "grid" && motif !== "binary" && (
        <circle cx="24" cy="26" r="6" fill="#f59e0b" />
      )}
      {/* Corner fold */}
      <path d="M32 6 L40 14 L32 14 Z" fill="#bae6fd" />
    </svg>
  );
}

export function SpeakerTrayIcon({ className = "w-4 h-4", muted = false }: { className?: string; muted?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M3 7 H7 L12 3 V17 L7 13 H3 Z" fill="#ffffff" />
      {!muted ? (
        <path d="M14 6 C16 8 16 12 14 14 M16 4 C19 7 19 13 16 16" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M14 7 L18 13 M18 7 L14 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function NetworkTrayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <rect x="2" y="3" width="9" height="7" rx="1" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1" />
      <rect x="8" y="9" width="9" height="7" rx="1" fill="#34d399" stroke="#064e3b" strokeWidth="1" />
      <line x1="6" y1="12" x2="6" y2="15" stroke="#ffffff" strokeWidth="1" />
      <line x1="12" y1="16" x2="12" y2="18" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

export function CmdIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/cmd.png"
      alt="Командная строка"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function SolitaireIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/solitaire.png"
      alt="Косынка"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function ToolsIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/briefcase.png"
      alt="Инструменты"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function WordDocIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/word.png"
      alt="Microsoft Word"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function MinesweeperIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/minesweeper.png"
      alt="Сапёр"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function PaintIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/paint.png"
      alt="Paint"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function PdfIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/pdf.png"
      alt="Резюме PDF"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}

export function DisplayThemeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Monitor frame */}
      <rect x="7" y="7" width="34" height="26" rx="2.5" fill="#d0d5dd" stroke="#475467" strokeWidth="2" />
      {/* Screen */}
      <rect x="10" y="10" width="28" height="20" fill="#0f172a" />
      {/* Color theme swatches on screen */}
      <rect x="13" y="13" width="6" height="14" fill="#0055ea" rx="1" />
      <rect x="21" y="13" width="6" height="14" fill="#94a3b8" rx="1" />
      <rect x="29" y="13" width="6" height="14" fill="#008080" rx="1" />
      {/* Monitor base */}
      <path d="M19 33 L29 33 L32 39 L16 39 Z" fill="#98a2b3" stroke="#475467" strokeWidth="1.5" />
    </svg>
  );
}




export function HelpCenterIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icons/xp/help.svg"
      alt="Центр справки и поддержки"
      className={`${className} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  );
}
