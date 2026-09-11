import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers";
import { site } from "@/data/site";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: site.name,
  description: `${site.role.en} ${site.note.en}`,
};

export const viewport: Viewport = {
  themeColor: "#070605",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${onest.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
