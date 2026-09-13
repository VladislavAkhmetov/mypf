import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { Providers } from "@/components/providers";
import { site } from "@/data/site";
import "./globals.css";
import "@/styles/xp.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: `${site.name} — Microsoft Windows XP`,
  description: `${site.role.ru} ${site.note.ru}`,
};

export const viewport: Viewport = {
  themeColor: "#0055ea",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      className={`${onest.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden select-none bg-[#004e98]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
