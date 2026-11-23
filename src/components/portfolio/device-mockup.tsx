"use client";

import React from "react";
import Image from "next/image";
import styles from "./device-mockup.module.css";
import { useLocale } from "@/lib/i18n";

export type ProjectThemeKey = "altyn-solok" | "dombro" | "kroomi" | "tasker" | "default";

export interface MockupThemeConfig {
  frameBg: string;
}

export const MOCKUP_THEMES: Record<ProjectThemeKey, MockupThemeConfig> = {
  "altyn-solok": {
    frameBg: "#18251e",
  },
  "dombro": {
    frameBg: "#161c28",
  },
  "kroomi": {
    frameBg: "#221c2b",
  },
  "tasker": {
    frameBg: "#18181b",
  },
  "default": {
    frameBg: "#1c1d1a",
  },
};

export interface MockupItemProps {
  src: string;
  alt: string;
  label?: string;
}

export interface DeviceMockupProps extends MockupItemProps {
  type: "tablet" | "phone";
  theme?: ProjectThemeKey;
  onZoom?: (item: { src: string; alt: string }) => void;
  priority?: boolean;
}

/**
 * Minimalist flat device mockup (only a rounded contour with project-harmonious color, no buttons/cutouts)
 */
export function DeviceMockup({
  type,
  src,
  alt,
  label,
  theme = "default",
  onZoom,
  priority = false,
}: DeviceMockupProps) {
  const { tr } = useLocale();
  const themeVars = MOCKUP_THEMES[theme] || MOCKUP_THEMES.default;

  const isTablet = type === "tablet";
  const frameClass = isTablet ? styles.tabletFrame : styles.phoneFrame;
  const screenClass = isTablet ? styles.tabletScreen : styles.phoneScreen;

  const handleClick = () => {
    if (onZoom) {
      onZoom({ src, alt });
    }
  };

  return (
    <div className={styles.deviceSlot}>
      <button
        type="button"
        onClick={handleClick}
        className={styles.deviceButton}
        aria-label={`${tr("Увеличить", "Zoom")}: ${alt}`}
        style={{ "--frame-bg": themeVars.frameBg } as React.CSSProperties}
      >
        <div className={frameClass}>
          <div className={`${styles.screen} ${screenClass}`}>
            <Image
              src={src}
              alt={alt}
              width={isTablet ? 1920 : 754}
              height={isTablet ? 1200 : 1720}
              unoptimized
              priority={priority}
              className={styles.screenImage}
            />
          </div>
        </div>
      </button>
      {label && <span className={styles.deviceLabel}>{label}</span>}
    </div>
  );
}

export interface DeviceMockupDuoProps {
  theme?: ProjectThemeKey;
  tablet: MockupItemProps;
  phone: MockupItemProps;
  onZoom?: (item: { src: string; alt: string }) => void;
}

/**
 * Side-by-side minimalist pairing of horizontal tablet (desktop) & vertical phone (mobile)
 */
export function DeviceMockupDuo({
  theme = "altyn-solok",
  tablet,
  phone,
  onZoom,
}: DeviceMockupDuoProps) {
  return (
    <div className={styles.duo}>
      <div className={styles.tabletSlot}>
        <DeviceMockup
          type="tablet"
          theme={theme}
          onZoom={onZoom}
          {...tablet}
        />
      </div>

      <div className={styles.phoneSlot}>
        <DeviceMockup
          type="phone"
          theme={theme}
          onZoom={onZoom}
          {...phone}
        />
      </div>
    </div>
  );
}
