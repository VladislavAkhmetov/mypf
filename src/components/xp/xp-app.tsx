"use client";

import React, { useLayoutEffect } from "react";
import { applyXpCursorVariables } from "@/lib/xp/cursors";
import { WindowManagerProvider } from "./window-manager-context";
import { Desktop } from "./desktop";
import "@/styles/xp.css";

export function XPApp() {
  useLayoutEffect(() => {
    applyXpCursorVariables();
  }, []);

  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}
