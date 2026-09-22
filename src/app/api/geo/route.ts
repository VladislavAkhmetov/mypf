import { headers } from "next/headers";
import { getWallpaperForCountry, DEFAULT_WALLPAPER } from "@/lib/xp/wallpapers";

export const dynamic = "force-dynamic";

function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return true;
  }
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return true;
  }
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = parseInt(parts[1], 10);
    if (!Number.isNaN(second) && second >= 16 && second <= 31) {
      return true;
    }
  }
  return false;
}

function extractClientIp(headersList: Headers): string | null {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-client-ip") ||
    null
  );
}

export async function GET() {
  try {
    const headersList = await headers();

    // 1. Check provider geo headers (Vercel, Cloudflare, etc.)
    const providerCountry =
      headersList.get("x-vercel-ip-country") ||
      headersList.get("cf-ipcountry") ||
      headersList.get("x-country-code");

    let countryCode: string | null = providerCountry ? providerCountry.trim().toUpperCase() : null;
    let countryName: string | null = headersList.get("x-vercel-ip-country-name") || countryCode;
    let cityName: string | null = headersList.get("x-vercel-ip-city") || null;

    const clientIp = extractClientIp(headersList);

    // 2. If no provider header and we have a valid non-private IP, query fallback GeoIP service
    if (!countryCode && clientIp && !isPrivateOrLocalIp(clientIp)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,city`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.countryCode) {
            countryCode = data.countryCode;
            countryName = data.country;
            cityName = data.city;
          }
        }
      } catch {
        // Fallback gracefully on timeout or network error
      }
    }

    const wallpaper = getWallpaperForCountry(countryCode);
    const isFallback = !countryCode;

    return Response.json(
      {
        country: countryName || countryCode || "Локальная сеть",
        countryCode: countryCode || null,
        city: cityName || null,
        wallpaper,
        isFallback,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch {
    return Response.json(
      {
        country: "Неизвестно",
        countryCode: null,
        city: null,
        wallpaper: DEFAULT_WALLPAPER,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}
