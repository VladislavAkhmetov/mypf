"use client";

import React from "react";
import { WindowItem } from "./window-manager-context";
import { MediaPlayerWindow } from "./apps/media-player-window";
import { ProjectExplorerWindow } from "./apps/project-explorer-window";
import { MyComputerWindow } from "./apps/my-computer-window";
import { MyDocumentsWindow } from "./apps/my-documents-window";
import { NotepadWindow } from "./apps/notepad-window";
import { StoriesViewerWindow } from "./apps/stories-viewer-window";
import { CmdWindow } from "./apps/cmd-window";
import { DisplayPropertiesDialog } from "./apps/display-properties-dialog";
import { RecycleBinWindow } from "./apps/recycle-bin-window";
import { PropertiesDialog } from "./apps/properties-dialog";
import { ResumeWindow } from "./apps/resume-window";
import dynamic from "next/dynamic";
import { StarterWindow } from "./apps/starter-window";
import { ToolsWindow } from "./apps/tools-window";
import { WordWindow } from "./apps/word-window";
import { PaintWindow } from "./apps/paint-window";
import { PortfolioBrowserWindow } from "./apps/portfolio-browser-window";
import { FocusDirection } from "@/lib/xp/navigation";
import { NotesWindow } from "@/components/notes/notes-window";

const SolitaireWindow = dynamic(
  () => import("./apps/solitaire-window").then((mod) => mod.SolitaireWindow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#16070c] text-[#f2d999] text-xs font-serif">
        Открываем карточный салон...
      </div>
    ),
  }
);

const MinesweeperWindow = dynamic(
  () => import("./apps/minesweeper-window").then((mod) => mod.MinesweeperWindow),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0B1127] text-[#57E4FF] text-xs font-mono">
        Заряжаем игровое поле...
      </div>
    ),
  }
);

export function WindowContentRouter({ window: win }: { window: WindowItem }) {
  switch (win.type) {
    case "notes":
      return <NotesWindow noteId={win.props?.noteId as string | undefined} />;
    case "portfolio":
      return (
        <PortfolioBrowserWindow
          initialProjectSlug={win.props?.projectSlug as string | undefined}
          initialFocus={win.props?.focus as FocusDirection | undefined}
          notFound={win.props?.notFound as boolean | undefined}
        />
      );
    case "starter":
      return <StarterWindow />;
    case "solitaire":
      return <SolitaireWindow />;
    case "tools":
      return <ToolsWindow />;
    case "word":
      return (
        <WordWindow
          initialDocSlug={
            (win.props?.docSlug as string) ||
            (win.props?.initialSlug as string) ||
            (win.props?.slug as string)
          }
          docSlug={win.props?.docSlug as string | undefined}
        />
      );
    case "minesweeper":
      return <MinesweeperWindow />;
    case "paint":
      return <PaintWindow />;
    case "media-player":
      return <MediaPlayerWindow />;
    case "project":
      return <ProjectExplorerWindow slug={(win.props?.slug as string) || "kora"} />;
    case "my-computer":
      return <MyComputerWindow />;
    case "my-documents":
      return <MyDocumentsWindow />;
    case "notepad":
      return <NotepadWindow />;
    case "stories":
      return <StoriesViewerWindow />;
    case "cmd":
      return <CmdWindow />;
    case "display-properties":
      return <DisplayPropertiesDialog />;
    case "recycle-bin":
      return <RecycleBinWindow />;
    case "properties":
      return <PropertiesDialog slug={(win.props?.slug as string) || "kora"} />;
    case "resume":
      return <ResumeWindow />;
    default:
      return <div className="p-4 bg-white">Window content</div>;
  }
}
