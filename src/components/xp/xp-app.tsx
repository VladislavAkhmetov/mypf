"use client";

import React from "react";
import { WindowManagerProvider } from "./window-manager-context";
import { Desktop } from "./desktop";
import "@/styles/xp.css";

export function XPApp() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}
