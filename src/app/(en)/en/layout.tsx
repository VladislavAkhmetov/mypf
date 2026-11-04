import type { Metadata } from "next";
import { RootShell } from "../../root-shell";
import { siteMeta } from "@/data/site";

export { viewport } from "../../root-shell";

export const metadata: Metadata = siteMeta("en");

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
