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
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Monitor CRT */}
      <rect x="6" y="5" width="36" height="26" rx="3" fill="#d0d5dd" stroke="#475467" strokeWidth="2" />
      <rect x="10" y="9" width="28" height="18" fill="#1e40af" />
      {/* Windows Bliss reflection on CRT */}
      <path d="M10 20 C16 16 24 22 38 18 L38 27 L10 27 Z" fill="#22c55e" opacity="0.8" />
      {/* Monitor stand */}
      <path d="M19 31 L29 31 L32 37 L16 37 Z" fill="#98a2b3" stroke="#475467" strokeWidth="1.5" />
      {/* Computer Tower behind or small PC icon */}
      <rect x="34" y="16" width="10" height="24" rx="1.5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
      <circle cx="39" cy="20" r="1.5" fill="#22c55e" />
      <line x1="36" y1="24" x2="42" y2="24" stroke="#475467" strokeWidth="1.5" />
      <line x1="36" y1="27" x2="42" y2="27" stroke="#475467" strokeWidth="1.5" />
    </svg>
  );
}

export function MyDocumentsIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Back flap */}
      <path d="M6 14 C6 12 7.5 10 9.5 10 L18 10 L22 14 L40 14 C42 14 43 15 43 17 L43 38 C43 40 41.5 41 39.5 41 L8.5 41 C6.5 41 6 39.5 6 38 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Document sticking out */}
      <rect x="12" y="7" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <line x1="16" y1="12" x2="28" y2="12" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="16" x2="30" y2="16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="20" x2="26" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Front folder flap */}
      <path d="M4 18 L43 18 L39 41 L4 41 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
    </svg>
  );
}

export function WindowsMediaPlayerIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <defs>
        <radialGradient id="wmpDisc" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="35%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>
        <radialGradient id="wmpJewel" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
      </defs>
      {/* Outer disc */}
      <circle cx="24" cy="24" r="20" fill="url(#wmpDisc)" stroke="#7c2d12" strokeWidth="1.5" />
      {/* Shiny edge ring */}
      <circle cx="24" cy="24" r="16" stroke="#fed7aa" strokeWidth="1.2" opacity="0.75" />
      {/* Inner blue jewel */}
      <circle cx="24" cy="24" r="11" fill="url(#wmpJewel)" stroke="#1d4ed8" strokeWidth="1" />
      {/* Play triangle */}
      <polygon points="21,17 31,24 21,31" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
    </svg>
  );
}

export function NotepadIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Notebook pad */}
      <rect x="8" y="7" width="28" height="36" rx="2" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
      {/* Spiral binder loops */}
      <path d="M12 4 L12 10 M18 4 L18 10 M24 4 L24 10 M30 4 L30 10" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      {/* Text lines */}
      <line x1="13" y1="16" x2="31" y2="16" stroke="#3b82f6" strokeWidth="1.2" />
      <line x1="13" y1="21" x2="29" y2="21" stroke="#94a3b8" strokeWidth="1.2" />
      <line x1="13" y1="26" x2="27" y2="26" stroke="#94a3b8" strokeWidth="1.2" />
      <line x1="13" y1="31" x2="24" y2="31" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Pencil */}
      <g transform="rotate(40 34 26)">
        <polygon points="24,20 28,14 34,22 30,28" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <polygon points="24,20 20,22 22,17" fill="#fbcfe8" stroke="#475467" strokeWidth="0.8" />
        <polygon points="20,22 18,24 22,24" fill="#0f172a" />
      </g>
    </svg>
  );
}

export function InternetExplorerIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Gold Halo orbit ring */}
      <ellipse cx="24" cy="24" rx="22" ry="7" transform="rotate(-32 24 24)" stroke="#eab308" strokeWidth="3" opacity="0.95" />
      {/* Blue e */}
      <circle cx="24" cy="25" r="16" fill="#0284c7" />
      <circle cx="24" cy="25" r="9" fill="#e0f2fe" />
      <rect x="15" y="22" width="18" height="5" fill="#0284c7" />
      {/* Cutout crescent */}
      <path d="M24 25 L38 29 A 16 16 0 0 1 20 41 Z" fill="#0284c7" />
      {/* Halo front pass */}
      <path d="M7 36 C12 40 32 30 41 12" stroke="#fde047" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

export function RecycleBinIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Bin rim */}
      <ellipse cx="24" cy="11" rx="14" ry="4" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.5" />
      {/* Bin mesh body */}
      <path d="M10 11 L14 41 C14 43 18 44 24 44 C30 44 34 43 34 41 L38 11 Z" fill="#93c5fd" fillOpacity="0.85" stroke="#1d4ed8" strokeWidth="1.5" />
      {/* Recycling green arrows */}
      <path d="M20 22 L24 18 L28 22 M24 19 L24 31 M21 28 L27 28" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StoriesIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Photo frame */}
      <rect x="7" y="9" width="34" height="30" rx="3" fill="#f8fafc" stroke="#475467" strokeWidth="2" />
      <rect x="11" y="13" width="26" height="22" fill="#38bdf8" />
      {/* Mountains */}
      <polygon points="11,35 22,23 30,32 37,25 37,35" fill="#15803d" />
      {/* Sun */}
      <circle cx="18" cy="19" r="3.5" fill="#facc15" />
    </svg>
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

export function CmdIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <rect x="6" y="8" width="36" height="30" rx="2" fill="#0f172a" stroke="#475467" strokeWidth="2" />
      <path d="M6 14 L42 14" stroke="#334155" strokeWidth="1.5" />
      {/* Prompt C:\> */}
      <text x="10" y="24" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">
        C:\&gt;_
      </text>
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
