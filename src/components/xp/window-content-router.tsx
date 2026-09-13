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
import { StarterWindow } from "./apps/starter-window";
import { SolitaireWindow } from "./apps/solitaire-window";

export function WindowContentRouter({ window: win }: { window: WindowItem }) {
  switch (win.type) {
    case "starter":
      return <StarterWindow />;
    case "solitaire":
      return <SolitaireWindow />;
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
