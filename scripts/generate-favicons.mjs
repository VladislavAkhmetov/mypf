import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. The primary SVG Favicon:
// 512x512 canvas, white rounded squircle background (rx=88),
// bold, large, vibrant Windows XP blue (#0055EA) letter 'A'.
// Optical geometry:
// - Height: 404px (79% of canvas)
// - Width: 440px (86% of canvas)
// - Symmetrical, bold flat-top apex, sharp triangular inner counter.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="88" fill="#FFFFFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M196 54h120l160 404h-100l-34-88H170l-34 88H36L196 54zm60 84l60 162H196l60-162z" fill="#0055EA"/>
</svg>
`;

// 2. Apple Touch Icon SVG (180x180):
// Full solid white background (no corner radius because iOS applies its own squircle mask).
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M196 54h120l160 404h-100l-34-88H170l-34 88H36L196 54zm60 84l60 162H196l60-162z" fill="#0055EA"/>
</svg>
`;

/**
 * Classic BMP-DIB ICO entry. Google's favicon parser rejects PNG-compressed ICOs
 * and then shows the default globe, while browsers still render them.
 */
function rgbaToIcoDib(rgba, size) {
  const xorSize = size * size * 4;
  const andRowBytes = Math.ceil(size / 32) * 4;
  const andSize = andRowBytes * size;
  const dib = Buffer.alloc(40 + xorSize + andSize);

  dib.writeUInt32LE(40, 0);
  dib.writeInt32LE(size, 4);
  dib.writeInt32LE(size * 2, 8);
  dib.writeUInt16LE(1, 12);
  dib.writeUInt16LE(32, 14);
  dib.writeUInt32LE(0, 16);
  dib.writeUInt32LE(xorSize + andSize, 20);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const src = ((size - 1 - y) * size + x) * 4;
      const dst = 40 + (y * size + x) * 4;
      dib[dst] = rgba[src + 2];
      dib[dst + 1] = rgba[src + 1];
      dib[dst + 2] = rgba[src];
      dib[dst + 3] = rgba[src + 3];
      if (rgba[src + 3] < 128) {
        const row = 40 + xorSize + y * andRowBytes;
        dib[row + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  return dib;
}

function createIco(entries) {
  const headerLen = 6;
  const dirEntryLen = 16;
  let offset = headerLen + dirEntryLen * entries.length;

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dirEntries = [];
  for (const { size, buffer } of entries) {
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...entries.map((entry) => entry.buffer)]);
}

async function main() {
  console.log("Generating favicons...");

  // Output paths
  const publicDir = path.join(rootDir, "public");
  const appDir = path.join(rootDir, "src", "app");
  const outDir = path.join(rootDir, "out");

  // SVG stays in public/ for browsers that request it directly.
  // It must not live in src/app: Next would emit it as <link rel="icon">,
  // and Google Search ignores SVG favicons.
  fs.writeFileSync(path.join(publicDir, "favicon.svg"), faviconSvg);
  fs.writeFileSync(path.join(publicDir, "icon.svg"), faviconSvg);
  for (const stale of ["favicon.ico", "icon.svg"]) {
    const stalePath = path.join(appDir, stale);
    if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath);
  }
  console.log("✓ Saved SVGs in public/; removed src/app favicon files");

  const sizes = [16, 32, 48, 192];
  const pngBuffers = {};
  const rawBuffers = {};

  for (const size of sizes) {
    const image = sharp(Buffer.from(faviconSvg)).resize(size, size);
    pngBuffers[size] = await image.clone().png().toBuffer();
    rawBuffers[size] = await image.clone().ensureAlpha().raw().toBuffer();
  }

  const appleTouchPng = await sharp(Buffer.from(appleTouchSvg)).resize(180, 180).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleTouchPng);
  fs.writeFileSync(path.join(publicDir, "favicon-16x16.png"), pngBuffers[16]);
  fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), pngBuffers[32]);
  fs.writeFileSync(path.join(publicDir, "favicon-48x48.png"), pngBuffers[48]);
  fs.writeFileSync(path.join(publicDir, "favicon-192x192.png"), pngBuffers[192]);
  console.log("✓ Saved PNGs, including favicon-192x192.png");

  const icoBuffer = createIco(
    [16, 32, 48].map((size) => ({ size, buffer: rgbaToIcoDib(rawBuffers[size], size) })),
  );
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  console.log("✓ Saved classic BMP favicon.ico in public/ (16, 32, 48)");

  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, "favicon.ico"), icoBuffer);
    fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), appleTouchPng);
    fs.writeFileSync(path.join(outDir, "favicon-192x192.png"), pngBuffers[192]);
    fs.writeFileSync(path.join(outDir, "favicon-48x48.png"), pngBuffers[48]);
    fs.writeFileSync(path.join(outDir, "icon.svg"), faviconSvg);
    fs.writeFileSync(path.join(outDir, "favicon.svg"), faviconSvg);
    console.log("✓ Updated out/ with new favicon files");
  }

  console.log("All favicon assets generated successfully!");
}

main().catch(console.error);
