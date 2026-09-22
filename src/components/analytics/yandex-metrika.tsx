"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { YM_COUNTER_ID, initGlobalAnalyticsListener } from "@/lib/analytics";

export function YandexMetrika() {
  const ymId = YM_COUNTER_ID;
  const isEnabled = Boolean(ymId && ymId !== "mock");

  useEffect(() => {
    const cleanup = initGlobalAnalyticsListener();
    return cleanup;
  }, []);

  return (
    <>
      {isEnabled && (
        <>
          <Script id="yandex-metrika-init" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${ymId}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${ymId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}
    </>
  );
}
