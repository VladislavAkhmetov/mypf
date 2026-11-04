"use client";

import { useEffect } from "react";

export function ProjectRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <meta name="robots" content="noindex" />
      <link rel="canonical" href={href} />
      <div className="fixed inset-0 bg-[#004e98] flex items-center justify-center text-white">
        <a href={href} className="underline">Открыть проект</a>
      </div>
    </>
  );
}
