import type { Viewport } from "next";
import { Onest, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import "./globals.css";
import "@/styles/xp.css";

// Shared <html>/<body> for the Russian (/) and English (/en/) root layouts; only the document language differs.

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const viewport: Viewport = {
  themeColor: "#0055ea",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export function RootShell({ lang, children }: { lang: "ru" | "en"; children: React.ReactNode }) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${onest.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-[#004e98]">
        <Providers>
          <YandexMetrika />
          {children}
        </Providers>
      </body>
    </html>
  );
}
