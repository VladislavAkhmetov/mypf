import type { Metadata } from "next";
import { RootShell } from "../root-shell";
import { siteMeta } from "@/data/site";

export { viewport } from "../root-shell";

export const metadata: Metadata = siteMeta("ru");

export default function RussianLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ru">{children}</RootShell>;
}
