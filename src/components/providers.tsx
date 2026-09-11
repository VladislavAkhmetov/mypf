"use client";

import { LocaleProvider } from "../lib/i18n";
import { StoryProvider } from "@/components/story-viewer";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <StoryProvider>{children}</StoryProvider>
    </LocaleProvider>
  );
}
