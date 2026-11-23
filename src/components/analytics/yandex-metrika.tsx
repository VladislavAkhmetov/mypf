"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { YM_COUNTER_ID, initGlobalAnalyticsListener } from "@/lib/analytics";

export function YandexMetrika() {
  const ymId = YM_COUNTER_ID;

  useEffect(() => {
    const cleanup = initGlobalAnalyticsListener();
    return cleanup;
  }, []);

  return (
    <>
      {ymId && (
        <>
          <Script id="yandex-metrika-init" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${ymId}", "ym");

              ym(${ymId}, "init", {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce: true,
                trackLinks: true
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
