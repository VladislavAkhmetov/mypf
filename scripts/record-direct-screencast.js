const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const FFMPEG_PATH = 'D:\\Soft\\ffmpeg-2025-10-19-git-dc39a576ad-full_build\\bin\\ffmpeg.exe';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordDirectScreencast() {
  const tempDir = path.resolve(__dirname, '../temp_video');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  const coversDir = path.resolve(__dirname, '../public/placeholders/covers');
  const printforgeDir = path.join(coversDir, 'printforge');
  if (!fs.existsSync(printforgeDir)) fs.mkdirSync(printforgeDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: tempDir,
      size: { width: 1440, height: 900 },
    },
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
  await sleep(1000);

  // Inject Custom Cursor & HUD into the page
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      #root {
        transition: transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
        will-change: transform;
        min-height: 100vh;
      }
      #live-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        pointer-events: none;
        z-index: 99999;
        will-change: transform;
        transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
      }
      #live-ripple {
        position: fixed;
        width: 46px;
        height: 46px;
        margin-left: -23px;
        margin-top: -23px;
        border-radius: 50%;
        border: 2.5px solid #0d99ff;
        background: rgba(13, 153, 255, 0.25);
        pointer-events: none;
        z-index: 99998;
        transform: scale(0);
        opacity: 0;
      }
      .ripple-pulse {
        animation: r-pulse 0.45s ease-out forwards;
      }
      @keyframes r-pulse {
        0% { transform: scale(0.2); opacity: 1; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      #live-hud {
        position: fixed;
        top: 18px;
        right: 24px;
        z-index: 99990;
        background: rgba(15, 23, 42, 0.90);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 18px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        transition: all 0.3s ease;
      }
      #hud-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #0d99ff;
        box-shadow: 0 0 10px #0d99ff;
      }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = 'live-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.5 2.5L18.5 13.5L12 14.5L15.5 21.5L12.5 23L9 16L4 20.5L5.5 2.5Z" fill="#0f172a" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    document.body.appendChild(cursor);

    const ripple = document.createElement('div');
    ripple.id = 'live-ripple';
    document.body.appendChild(ripple);

    const hud = document.createElement('div');
    hud.id = 'live-hud';
    hud.innerHTML = `<div id="hud-dot"></div><span id="hud-text">PrintPlix Prepress Engine Active</span>`;
    document.body.appendChild(hud);

    window.moveCursorTo = function(x, y) {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.triggerClickRipple = function(x, y) {
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.remove('ripple-pulse');
      void ripple.offsetWidth;
      ripple.classList.add('ripple-pulse');
    };

    window.zoomTo = function(x, y, scale) {
      const root = document.getElementById('root');
      if (root) {
        root.style.transformOrigin = `${x}px ${y}px`;
        root.style.transform = `scale(${scale})`;
      }
    };

    window.updateHUD = function(text) {
      const el = document.getElementById('hud-text');
      if (el) el.textContent = text;
    };
  });

  await sleep(600);

  // Helper to move cursor to element, zoom camera, and click
  async function interact(selector, hudText, zoom = 1.0) {
    const el = page.locator(selector).first();
    const count = await page.locator(selector).count();
    if (count === 0) {
      console.warn('Selector not found:', selector);
      return;
    }

    const box = await el.boundingBox();
    let cx = 720;
    let cy = 400;
    if (box) {
      cx = box.x + box.width / 2;
      cy = box.y + box.height / 2;
    }

    const focusX = Math.max(250, Math.min(cx, 1100));
    const focusY = Math.max(150, Math.min(cy, 650));

    await page.evaluate(({ cx, cy, fx, fy, z, text }) => {
      window.moveCursorTo(cx, cy);
      window.zoomTo(fx, fy, z);
      if (text) window.updateHUD(text);
    }, { cx, cy, fx: focusX, fy: focusY, z: zoom, text: hudText });

    await sleep(550);

    // Trigger visual ripple and click
    await page.evaluate(({ x, y }) => window.triggerClickRipple(x, y), { x: cx, y: cy });
    await el.dispatchEvent('click').catch(() => {});

    await sleep(500);
  }

  console.log('--- Phase 1: Layouts & Bleed Setup ---');
  await interact('button:has-text("Business Card (EU)")', 'Preset: Business Card (EU) 85 × 55 mm', 1.35);
  await sleep(400);

  await interact('button:has-text("Landscape")', 'Orientation: Landscape Mode', 1.35);
  await sleep(400);

  await interact('button:has-text("Portrait")', 'Orientation: Portrait Mode', 1.35);
  await sleep(400);

  await interact('button:has-text("A6")', 'Preset: Postcard A6 (105 × 148 mm)', 1.40);
  await sleep(400);

  await interact('input[type="checkbox"]', 'Add Bleed (for print): 3.0 mm Active', 1.45);
  await sleep(500);

  console.log('--- Phase 2: Colors & CMYK Profiles ---');
  await interact('button[role="tab"]:has-text("Colors")', 'Tab: Colors (CMYK Palettes & ICC)', 1.25);
  await sleep(500);

  await interact('button:has-text("Check Document Colors")', 'Detecting RGB Assets & CMYK Separation...', 1.40);
  await sleep(600);

  await interact('button:has-text("PDF")', 'Export Format: High-Res Print PDF', 1.30);
  await sleep(500);

  await interact('text="PSO Coated v3 (FOGRA39)"', 'ICC Profile: ISO 12647-2 Coated FOGRA39', 1.25);
  await sleep(600);

  console.log('--- Phase 3: DPI Resolution Auditor ---');
  await interact('button[role="tab"]:has-text("DPI")', 'Tab: DPI Image Resolution Auditor', 1.25);
  await sleep(500);

  await interact('text="300"', 'Target Print Resolution: 300 DPI (Offset Standard)', 1.45);
  await sleep(400);

  await interact('button:has-text("Check Selected Frames")', 'Scanning Embedded Raster Assets...', 1.40);
  await sleep(600);

  console.log('--- Phase 4: Pre-flight Health Check ---');
  await interact('button[role="tab"]:has-text("Health")', 'Tab: Pre-flight Health Check', 1.25);
  await sleep(500);

  await interact('button:has-text("Scan Selected Frame")', 'Inspecting Overprint, Rich Black & Bleed Violations...', 1.40);
  await sleep(600);

  console.log('--- Phase 5: Packaging & Dielines ---');
  await interact('button[role="tab"]:has-text("Packaging")', 'Tab: Pre-press Marking (Dielines)', 1.25);
  await sleep(500);

  await interact('button:has-text("Mark as CUT Contour")', 'Spot Channel: CUT Contour (Red • 1px Solid)', 1.40);
  await sleep(600);

  await interact('button:has-text("Mark as FOLD / Crease")', 'Spot Channel: FOLD / Crease (Blue • 1px Dashed)', 1.40);
  await sleep(600);

  console.log('--- Phase 6: Final Prepress Export ---');
  // Zoom out to full overview
  await page.evaluate(() => {
    window.zoomTo(720, 450, 1.0);
    window.updateHUD('Ready for Press: Cloud Prepress Generation');
  });
  await sleep(700);

  await interact('button:has-text("Export Selected Frames")', '✓ Exporting Print-Ready PDF with Bleed Box...', 1.05);
  await sleep(1500);

  await page.evaluate(() => window.updateHUD('✓ Prepress File Generated: Print Ready'));
  await sleep(1000);

  await page.close();
  await context.close();
  await browser.close();

  console.log('Direct recording finished! Transcoding with FFmpeg...');

  const videoFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length === 0) {
    throw new Error('No recorded video file found in ' + tempDir);
  }

  const rawVideoPath = path.join(tempDir, videoFiles[0]);
  const outWebm = path.join(coversDir, 'printforge.webm');
  const outMp4 = path.join(coversDir, 'printforge.mp4');
  const outJpg = path.join(coversDir, 'printforge.jpg');

  // Fast & crisp VP9 transcode
  console.log('Transcoding WebM (VP9)...');
  execSync(`"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -c:v libvpx-vp9 -crf 24 -b:v 0 -threads 4 -pix_fmt yuv420p "${outWebm}"`);
  console.log(`Saved WebM: ${outWebm} (${fs.statSync(outWebm).size} bytes)`);

  // Fast & crisp MP4 transcode
  console.log('Transcoding MP4 (H.264)...');
  execSync(`"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -movflags +faststart "${outMp4}"`);
  console.log(`Saved MP4: ${outMp4} (${fs.statSync(outMp4).size} bytes)`);

  // Extract optimal cover image at t=3.5s
  console.log('Extracting cover JPG...');
  execSync(`"${FFMPEG_PATH}" -y -ss 00:00:03.500 -i "${rawVideoPath}" -vframes 1 -q:v 2 "${outJpg}"`);
  console.log(`Saved Cover JPG: ${outJpg} (${fs.statSync(outJpg).size} bytes)`);

  console.log('🎉 Direct real-plugin screencast generated successfully!');
}

recordDirectScreencast().catch((err) => {
  console.error('Direct recording failed:', err);
  process.exit(1);
});
