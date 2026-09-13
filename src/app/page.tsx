"use client";

import dynamic from "next/dynamic";

const XPApp = dynamic(
  () => import("@/components/xp/xp-app").then((mod) => mod.XPApp),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#004e98] flex items-center justify-center select-none">
        <div className="text-white text-lg font-bold tracking-wider animate-pulse flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Загрузка Windows XP...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <XPApp />;
}

