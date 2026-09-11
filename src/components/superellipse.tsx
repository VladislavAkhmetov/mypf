import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
  n?: "tight" | "avatar";
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Superellipse<T extends ElementType = "div">({
  as,
  n = "tight",
  className,
  ...rest
}: Props<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn("sq", n === "avatar" ? "sq-avatar" : "sq-tight", className)}
      {...rest}
    />
  );
}
