"use client";

import {
  WindowsMediaPlayerIcon, InternetExplorerIcon, SolitaireIcon, ToolsIcon, WordDocIcon, MinesweeperIcon, PaintIcon,
  PdfIcon, NotepadIcon, MyComputerIcon, MyDocumentsIcon, StoriesIcon, HelpCenterIcon, DombroIcon, KroomiIcon, CmdIcon, BaltikaIcon, DesignerGameIcon,
} from "./xp-icons";
import type { WindowType } from "./window-manager-context";

/** The icon that represents a window of the given type (taskbar, window switcher). */
export function WindowTypeIcon({ type, className = "w-4 h-4" }: { type: WindowType; className?: string }) {
  switch (type) {
    case "solitaire": return <SolitaireIcon className={className} />;
    case "tools": return <ToolsIcon className={className} />;
    case "word": return <WordDocIcon className={className} />;
    case "minesweeper": return <MinesweeperIcon className={className} />;
    case "paint": return <PaintIcon className={className} />;
    case "dombro": return <DombroIcon className={className} />;
    case "kroomi": return <KroomiIcon className={className} />;
    case "baltika": return <BaltikaIcon className={className} />;
    case "designer-game": return <DesignerGameIcon className={className} />;
    case "help": return <HelpCenterIcon className={className} />;
    case "resume": return <PdfIcon className={className} />;
    case "media-player": return <WindowsMediaPlayerIcon className={className} />;
    case "portfolio": return <InternetExplorerIcon className={className} />;
    case "notepad": return <NotepadIcon className={className} />;
    case "my-computer": return <MyComputerIcon className={className} />;
    case "my-documents": return <MyDocumentsIcon className={className} />;
    case "stories": return <StoriesIcon className={className} />;
    case "cmd": return <CmdIcon className={className} />;
    case "notes": return <StoriesIcon className={className} />;
    default: return <span aria-hidden="true">⚙️</span>;
  }
}

/** "Портфолио — Internet Explorer" -> "Портфолио" */
export const shortWindowTitle = (title: string) => title.split(/\s[—–-]\s/)[0];
