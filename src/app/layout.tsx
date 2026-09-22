import type { Metadata, Viewport } from "next";
import { Onest, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { site } from "@/data/site";
import "./globals.css";
import "@/styles/xp.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role.ru} | Портфолио`,
  description: `${site.role.ru}. ${site.roleDescription.ru}`,
};

export const viewport: Viewport = {
  themeColor: "#0055ea",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
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
