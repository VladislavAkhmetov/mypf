const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const FFMPEG_PATH = 'D:\\Soft\\ffmpeg-2025-10-19-git-dc39a576ad-full_build\\bin\\ffmpeg.exe';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Smooth camera and cursor movement using cubic ease-in-out
async function moveAndZoom(page, from, to, durationMs, steps = 24) {
  const stepTime = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const factor = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const curX = from.x + (to.x - from.x) * factor;
    const curY = from.y + (to.y - from.y) * factor;

    const zoom = from.zoom + (to.zoom - from.zoom) * factor;
    const tx = from.tx + (to.tx - from.tx) * factor;
    const ty = from.ty + (to.ty - from.ty) * factor;

    await page.evaluate(({ cx, cy, z, x, y }) => {
      window.setCursor(cx, cy);
      window.setCamera(z, x, y);
    }, { cx: curX, cy: curY, z: zoom, x: tx, y: ty });

    await sleep(stepTime);
  }
}

async function recordScreencast() {
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
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const playerUrl = 'file:///' + path.resolve(__dirname, 'screencast-player.html').replace(/\\/g, '/');
  await page.goto(playerUrl, { waitUntil: 'networkidle' });
  await sleep(1200);

  const iframe = page.frameLocator('#plugin-frame');

  // Initial State: Wide view
  let state = {
    x: 650,
    y: 280,
    zoom: 1.0,
    tx: 0,
    ty: 0,
  };

  await page.evaluate(({ x, y, zoom, tx, ty }) => {
    window.setCursor(x, y);
    window.setCamera(zoom, tx, ty);
    window.setHUD('PrintPlix CMYK Prepress Engine');
  }, state);

  await sleep(1000);

  async function clickAction(selector, hudText, targetZoom, targetTx, targetTy) {
    const el = iframe.locator(selector).first();
    const count = await iframe.locator(selector).count();
    if (count === 0) {
      console.warn('Selector not found:', selector);
      return;
    }

    const box = await el.boundingBox();
    if (!box) {
      console.warn('No bounding box for:', selector);
      return;
    }

    // Window frame offset: x=580, y=175
    const targetScreenX = 580 + box.x + box.width / 2;
    const targetScreenY = 175 + box.y + box.height / 2;

    const nextState = {
      x: targetScreenX,
      y: targetScreenY,
      zoom: targetZoom || state.zoom,
      tx: targetTx !== undefined ? targetTx : state.tx,
      ty: targetTy !== undefined ? targetTy : state.ty,
    };

    if (hudText) {
      await page.evaluate((text) => window.setHUD(text), hudText);
    }

    // Glide smoothly with dynamic camera zoom
    await moveAndZoom(page, state, nextState, 650, 26);
    state = nextState;

    // Trigger click on element & visual ripple
    await el.click({ force: true }).catch(() => {});
    await page.evaluate(({ x, y }) => window.triggerRipple(x, y), { x: state.x, y: state.y });

    await sleep(450);
  }

  console.log('--- Phase 1: Layouts & Bleed Setup ---');
  // 1. Zoom into Layouts presets (1.45x)
  await clickAction(
    'button:has-text("Business Card (EU)")',
    'Preset: Business Card (EU) 85 × 55 mm',
    1.45,
    -200,
    -60
  );
  await sleep(400);

  // 2. Click A6 preset
  await clickAction(
    'button:has-text("A6")',
    'Preset: Postcard A6 (105 × 148 mm)',
    1.50,
    -220,
    -70
  );
  await sleep(400);

  // 3. Bleed switch
  await clickAction(
    'input[type="checkbox"]',
    'Add Bleed (for print): 3.0 mm Margins Active',
    1.60,
    -250,
    -80
  );
  await sleep(500);

  console.log('--- Phase 2: Colors & CMYK Profiles ---');
  // 4. Click Colors Tab
  await clickAction(
    'button[role="tab"]:has-text("Colors")',
    'Tab: Colors (CMYK Separation & Palettes)',
    1.45,
    -180,
    -50
  );
  await sleep(500);

  // 5. Click Check Document Colors
  await clickAction(
    'button:has-text("Check Document Colors")',
    'Detecting RGB Assets & Brand CMYK Spot Colors...',
    1.55,
    -240,
    -80
  );
  await sleep(600);

  // 6. Switch bottom output format to PDF
  await clickAction(
    'button:has-text("PDF")',
    'Output Profile: High-Resolution Print PDF',
    1.60,
    -260,
    -160
  );
  await sleep(500);

  // 7. Click ICC Profile selector
  await clickAction(
    'text="PSO Coated v3 (FOGRA39)"',
    'ICC Profile: ISO 12647-2 Coated FOGRA39',
    1.65,
    -280,
    -180
  );
  await sleep(600);

  console.log('--- Phase 3: DPI Resolution Auditor ---');
  // 8. Click DPI Tab
  await clickAction(
    'button[role="tab"]:has-text("DPI")',
    'Tab: DPI Resolution Auditor',
    1.45,
    -180,
    -50
  );
  await sleep(500);

  // 9. Click Check Selected Frames
  await clickAction(
    'button:has-text("Check Selected Frames")',
    'Auditing Raster Assets: 300 DPI Standard Target',
    1.60,
    -250,
    -80
  );
  await sleep(700);

  console.log('--- Phase 4: Pre-flight Health Check ---');
  // 10. Click Health Tab
  await clickAction(
    'button[role="tab"]:has-text("Health")',
    'Tab: Pre-flight Health Check',
    1.45,
    -180,
    -50
  );
  await sleep(500);

  // 11. Click Scan Selected Frame
  await clickAction(
    'button:has-text("Scan Selected Frame")',
    'Inspecting Overprint, Rich Black & Thin Lines...',
    1.55,
    -240,
    -80
  );
  await sleep(600);

  console.log('--- Phase 5: Packaging & Dielines ---');
  // 12. Click Packaging Tab
  await clickAction(
    'button[role="tab"]:has-text("Packaging")',
    'Tab: Pre-press Packaging & Dielines',
    1.45,
    -180,
    -50
  );
  await sleep(500);

  // 13. Hover and click Mark as CUT Contour
  await clickAction(
    'button:has-text("Mark as CUT Contour")',
    'Designated Spot Channel: CUT Contour (Red • 1px Solid)',
    1.55,
    -240,
    -80
  );
  await sleep(600);

  // 14. Click Mark as FOLD / Crease
  await clickAction(
    'button:has-text("Mark as FOLD / Crease")',
    'Designated Spot Channel: FOLD / Crease (Blue • 1px Dashed)',
    1.55,
    -240,
    -100
  );
  await sleep(600);

  console.log('--- Phase 6: Final Export ---');
  // 15. Smoothly ease camera back out to full view (1.05x)
  const overviewState = {
    x: 960,
    y: 720,
    zoom: 1.05,
    tx: -30,
    ty: -15,
  };
  await page.evaluate((text) => window.setHUD(text), 'Ready for Press: Cloud Prepress Export');
  await moveAndZoom(page, state, overviewState, 750, 30);
  state = overviewState;
  await sleep(500);

  // 16. Click Export Selected Frames
  await clickAction(
    'button:has-text("Export Selected Frames")',
    '✓ Cloud Pipeline: Generating Print-Ready PDF with Bleed Box...',
    1.08,
    -35,
    -20
  );
  await sleep(1500);

  await page.evaluate((text) => window.setHUD('✓ Prepress Export Complete: Ready for Production'), '✓ Prepress Export Complete');
  await sleep(1000);

  // Close context to finish video
  await page.close();
  await context.close();
  await browser.close();

  console.log('Recording finished! Transcoding with FFmpeg...');

  const videoFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length === 0) {
    throw new Error('No recorded video file found in ' + tempDir);
  }

  const rawVideoPath = path.join(tempDir, videoFiles[0]);
  const outWebm = path.join(coversDir, 'printforge.webm');
  const outMp4 = path.join(coversDir, 'printforge.mp4');
  const outJpg = path.join(coversDir, 'printforge.jpg');

  // Transcode to high quality WebM (VP9)
  console.log('Transcoding WebM (VP9)...');
  execSync(`"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -c:v libvpx-vp9 -crf 26 -b:v 0 -pix_fmt yuv420p "${outWebm}"`);
  console.log(`Saved WebM: ${outWebm} (${fs.statSync(outWebm).size} bytes)`);

  // Transcode to MP4 (H.264)
  console.log('Transcoding MP4 (H.264)...');
  execSync(`"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart "${outMp4}"`);
  console.log(`Saved MP4: ${outMp4} (${fs.statSync(outMp4).size} bytes)`);

  // Extract cover poster JPG at t=4.5s
  console.log('Extracting cover JPG...');
  execSync(`"${FFMPEG_PATH}" -y -ss 00:00:04.500 -i "${rawVideoPath}" -vframes 1 -q:v 2 "${outJpg}"`);
  console.log(`Saved Cover JPG: ${outJpg} (${fs.statSync(outJpg).size} bytes)`);

  console.log('🎉 Screencast video and cover assets generated successfully!');
}

recordScreencast().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
