import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the Figma Make preview proxy (e.g. app-….makeproxy-c.figma.site) to load dev assets.
  allowedDevOrigins: ["127.0.0.1", "**.figma.site"],
  // Static export: `next build` writes a plain site to `out/` for static hosting
  // (e.g. a Yandex Object Storage bucket). No server features are available.
  output: "export",
  // Emit `work/<slug>/index.html` so bucket index documents resolve folder URLs.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
