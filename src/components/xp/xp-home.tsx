"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BootScreen } from "./boot/boot-screen";

// The desktop renders on the client only; the same entry serves / and /en/.
const XPApp = dynamic(
  () =>
    import("@/components/xp/xp-app").then((mod) => {
      const App = mod.XPApp;
      return function MountedXPApp({ onMount }: { onMount: () => void }) {
        useEffect(onMount, [onMount]);
        return <App />;
      };
    }),
  { ssr: false, loading: () => null }
);

export function XPHome() {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const locale = usePathname()?.startsWith("/en") ? "en" : "ru";

  return (
    <>
      <XPApp onMount={markReady} />
      <BootScreen ready={ready} locale={locale} />
    </>
  );
}

