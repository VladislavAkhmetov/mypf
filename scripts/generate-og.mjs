import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function toBase64(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return "";
  const ext = path.extname(fullPath).toLowerCase();
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".svg"
      ? "image/svg+xml"
      : ext === ".webp"
      ? "image/webp"
      : "application/octet-stream";
  const data = fs.readFileSync(fullPath).toString("base64");
  return `data:${mime};base64,${data}`;
}

const blissBg = toBase64("public/images/bliss.jpg");
const avatar = toBase64("public/placeholders/profile.jpg");
const clippy = toBase64("public/clippy/wave-1.png");
const myComputer = toBase64("public/icons/xp/my-computer.png");
const briefcase = toBase64("public/icons/xp/briefcase.png");
const notepad = toBase64("public/icons/xp/notepad.png");
const minesweeper = toBase64("public/icons/xp/minesweeper.png");

function buildHtml({ lang }) {
  const isEn = lang === "en";

  const data = {
    titleBar: isEn
      ? "Vlad Akhmetov — Portfolio (Windows XP Edition)"
      : "Влад Ахметов — Портфолио (Windows XP Edition)",
    menu: isEn
      ? ["File", "Edit", "View", "Favorites", "Help"]
      : ["Файл", "Правка", "Вид", "Избранное", "Справка"],
    name: isEn ? "Vlad Akhmetov" : "Влад Ахметов",
    role: "Software Designer & AI Prototyper",
    studio: isEn ? "Amazi · Independent Practice" : "Amazi · Независимая практика",
    bio: isEn
      ? "I design software end to end and turn ideas into working prototypes with AI agents."
      : "Проектирую программы целиком и быстро довожу идеи до работающих прототипов с ИИ-агентами.",
    status: isEn ? "Open for new projects" : "Открыт к проектам",
    ready: isEn ? "Ready" : "Готово",
    location: isEn ? "Remote" : "Уфа · удалённо",
    clippyText: isEn
      ? "Hi! Check out interactive cases, 3D and retro vibes!"
      : "Привет! Загляни посмотреть интерактивные кейсы и 3D!",
    startButton: isEn ? "start" : "пуск",
    tags: ["Next.js", "AI Prototypes", "Three.js / 3D", "Figma", "Design Systems", "Motion"],
    icons: isEn
      ? [
          { name: "My Computer", icon: myComputer },
          { name: "Projects", icon: briefcase },
          { name: "Notes", icon: notepad },
          { name: "Minesweeper", icon: minesweeper },
        ]
      : [
          { name: "Мой компьютер", icon: myComputer },
          { name: "Мои проекты", icon: briefcase },
          { name: "Заметки", icon: notepad },
          { name: "Сапёр", icon: minesweeper },
        ],
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: "Segoe UI", Tahoma, "MS Sans Serif", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      position: relative;
      background: #004e98;
    }
    .wallpaper {
      position: absolute;
      inset: 0;
      background-image: url('${blissBg}');
      background-size: cover;
      background-position: center 68%;
    }
    .desktop-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 30%, rgba(0, 15, 60, 0.25) 100%);
    }

    /* Desktop Icons */
    .desktop-icons {
      position: absolute;
      top: 30px;
      left: 30px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      z-index: 2;
    }
    .desktop-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 86px;
      cursor: pointer;
    }
    .desktop-icon img {
      width: 44px;
      height: 44px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }
    .desktop-icon span {
      margin-top: 5px;
      font-size: 11px;
      color: #fff;
      text-align: center;
      text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;
      line-height: 1.2;
      padding: 1px 4px;
      border-radius: 2px;
    }

    /* Main XP Window */
    .xp-window {
      position: absolute;
      left: 175px;
      top: 42px;
      width: 880px;
      height: 475px;
      background: #ECE9D8;
      border-radius: 8px 8px 0 0;
      border: 3px solid #0055ea;
      box-shadow: 0 16px 36px rgba(0, 18, 70, 0.45), 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }

    .xp-titlebar {
      height: 32px;
      background: linear-gradient(180deg, #0058ee 0%, #3593ff 4%, #288eff 6%, #127dff 8%, #036ffc 10%, #0262ee 14%, #0057e5 20%, #0054e3 40%, #0055e7 60%, #0045d6 80%, #0030b4 100%);
      border-radius: 5px 5px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 0 10px;
      color: #fff;
      font-weight: bold;
      font-size: 13px;
      text-shadow: 1px 1px 2px rgba(0, 18, 90, 0.9);
      user-select: none;
    }
    .xp-titlebar-left {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .xp-titlebar-left img {
      width: 17px;
      height: 17px;
    }
    .xp-controls {
      display: flex;
      gap: 2px;
    }
    .xp-btn {
      width: 21px;
      height: 21px;
      border-radius: 3px;
      border: 1px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.4);
    }
    .xp-btn-min, .xp-btn-max {
      background: linear-gradient(180deg, #448cf6 0%, #2974eb 45%, #1852c9 55%, #1f57d1 100%);
    }
    .xp-btn-close {
      background: linear-gradient(180deg, #f28268 0%, #e85333 45%, #cf2606 55%, #d13010 100%);
    }

    /* Menu Bar */
    .xp-menubar {
      height: 23px;
      background: #ECE9D8;
      border-bottom: 1px solid #D0CCC0;
      display: flex;
      align-items: center;
      padding: 0 8px;
      gap: 14px;
      font-size: 12px;
      color: #000;
    }
    .xp-menubar span {
      cursor: default;
    }
    .xp-menubar span::first-letter {
      text-decoration: underline;
    }

    /* Inner Workspace */
    .xp-body {
      flex: 1;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .xp-inner-card {
      flex: 1;
      background: #FFFFFF;
      border: 2px inset #D0CCC0;
      padding: 20px 24px;
      display: flex;
      gap: 26px;
      align-items: center;
    }

    /* Avatar Column */
    .avatar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      width: 140px;
    }
    .avatar-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      border: 3px solid #0055ea;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      overflow: hidden;
      background: #eee;
    }
    .avatar-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #ebf9eb;
      border: 1px solid #7bc67a;
      border-radius: 12px;
      padding: 3px 9px;
      font-size: 11px;
      font-weight: 600;
      color: #1b6319;
      white-space: nowrap;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #25a420;
      box-shadow: 0 0 5px #25a420;
    }

    /* Info Column */
    .info-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .name-title-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .main-name {
      font-size: 34px;
      font-weight: 800;
      color: #0c2a74;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .role-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 15px;
      font-weight: 700;
      color: #0055ea;
      background: #eef4ff;
      border: 1px solid #c2d7ff;
      padding: 3px 10px;
      border-radius: 5px;
    }
    .main-bio {
      font-size: 14px;
      line-height: 1.45;
      color: #334155;
      margin-top: 2px;
      font-weight: 500;
    }

    /* Stack Pills */
    .stack-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .xp-tag {
      background: linear-gradient(180deg, #ffffff 0%, #ece9d8 100%);
      border: 1px solid #999;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #222;
      box-shadow: inset 1px 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.06);
    }

    /* Status Bar */
    .xp-statusbar {
      height: 24px;
      background: #ECE9D8;
      border-top: 1px solid #D0CCC0;
      display: flex;
      align-items: center;
      padding: 0 4px;
      gap: 4px;
      font-size: 11px;
      color: #444;
    }
    .sb-item {
      padding: 2px 8px;
      border: 1px inset #fff;
      display: flex;
      align-items: center;
      gap: 5px;
      height: 18px;
    }
    .sb-item.grow {
      flex: 1;
    }

    /* Clippy on desktop */
    .clippy-container {
      position: absolute;
      right: 45px;
      bottom: 60px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      z-index: 20;
    }
    .clippy-bubble {
      background: #ffffe1;
      border: 1px solid #000;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      line-height: 1.35;
      color: #000;
      box-shadow: 2px 3px 6px rgba(0,0,0,0.25);
      max-width: 175px;
      position: relative;
    }
    .clippy-bubble::after {
      content: "";
      position: absolute;
      right: -8px;
      bottom: 18px;
      border-width: 6px 0 6px 8px;
      border-style: solid;
      border-color: transparent transparent transparent #ffffe1;
      z-index: 2;
    }
    .clippy-bubble::before {
      content: "";
      position: absolute;
      right: -10px;
      bottom: 17px;
      border-width: 7px 0 7px 9px;
      border-style: solid;
      border-color: transparent transparent transparent #000;
      z-index: 1;
    }
    .clippy-img {
      width: 82px;
      height: auto;
      filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3));
    }

    /* XP Taskbar */
    .xp-taskbar {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 38px;
      background: linear-gradient(180deg, #316ac5 0%, #2558c4 3%, #1e4ebe 6%, #1742b6 10%, #1742b6 30%, #1946bc 60%, #1e52c8 90%, #163da8 100%);
      border-top: 1px solid #5289eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 30;
      padding-right: 10px;
    }
    .taskbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
    }
    .start-btn {
      height: 100%;
      padding: 0 18px 0 12px;
      background: linear-gradient(180deg, #44a530 0%, #3a9726 12%, #2c841a 45%, #257814 60%, #368f23 85%, #226f12 100%);
      border-radius: 0 8px 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 800;
      font-style: italic;
      text-shadow: 1px 1px 2px #104c08;
      box-shadow: inset 0 1px 1px rgba(255,255,255,0.6), 2px 0 4px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .start-btn svg {
      width: 20px;
      height: 20px;
    }
    .active-task {
      height: 28px;
      padding: 0 14px;
      background: linear-gradient(180deg, #183e95 0%, #15398a 45%, #102d73 55%, #133480 100%);
      border: 1px solid #0d2864;
      border-radius: 3px;
      display: flex;
      align-items: center;
      gap: 7px;
      color: #fff;
      font-size: 12px;
      box-shadow: inset 1px 1px 2px #0a1e4c;
    }
    .active-task img {
      width: 15px;
      height: 15px;
    }
    .tray {
      height: 100%;
      background: linear-gradient(180deg, #0c2a74 0%, #0e338c 15%, #103ba0 40%, #103ca2 60%, #0d348f 85%, #08246a 100%);
      border-left: 1px solid #1446bd;
      display: flex;
      align-items: center;
      padding: 0 14px;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="wallpaper"></div>
  <div class="desktop-overlay"></div>

  <!-- Desktop Icons -->
  <div class="desktop-icons">
    ${data.icons
      .map(
        (item) => `
      <div class="desktop-icon">
        <img src="${item.icon}" alt="${item.name}" />
        <span>${item.name}</span>
      </div>
    `
      )
      .join("")}
  </div>

  <!-- Main Window -->
  <div class="xp-window">
    <div class="xp-titlebar">
      <div class="xp-titlebar-left">
        <img src="${briefcase}" alt="Window icon" />
        <span>${data.titleBar}</span>
      </div>
      <div class="xp-controls">
        <div class="xp-btn xp-btn-min">_</div>
        <div class="xp-btn xp-btn-max">□</div>
        <div class="xp-btn xp-btn-close">✕</div>
      </div>
    </div>

    <div class="xp-menubar">
      ${data.menu.map((m) => `<span>${m}</span>`).join("")}
    </div>

    <div class="xp-body">
      <div class="xp-inner-card">
        <div class="avatar-col">
          <div class="avatar-wrapper">
            <img src="${avatar}" alt="Avatar" />
          </div>
          <div class="status-pill">
            <span class="status-dot"></span>
            <span>${data.status}</span>
          </div>
        </div>

        <div class="info-col">
          <div class="name-title-row">
            <div class="main-name">${data.name}</div>
            <div class="role-badge">${data.role}</div>
          </div>
          <p class="main-bio">${data.bio}</p>
          <div class="stack-tags">
            ${data.tags.map((t) => `<span class="xp-tag">${t}</span>`).join("")}
          </div>
        </div>
      </div>
    </div>

    <div class="xp-statusbar">
      <div class="sb-item">● ${data.ready}</div>
      <div class="sb-item grow">Amazi Studio · ${data.location}</div>
      <div class="sb-item">vladakhmetov.com</div>
    </div>
  </div>

  <!-- Clippy Helper -->
  <div class="clippy-container">
    <div class="clippy-bubble">
      ${data.clippyText}
    </div>
    <img src="${clippy}" class="clippy-img" alt="Clippy" />
  </div>

  <!-- Taskbar -->
  <div class="xp-taskbar">
    <div class="taskbar-left">
      <div class="start-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 5.5l7-1v7.5H3V5.5zm8-1.2l10-1.5V12H11V4.3zm0 8.7h10v7.7l-10-1.5V13zm-8 0h7v6.5l-7-1V13z" fill="#fff"/>
        </svg>
        <span>${data.startButton}</span>
      </div>
      <div class="active-task">
        <img src="${briefcase}" alt="" />
        <span>${data.titleBar.split(" — ")[0]}</span>
      </div>
    </div>

    <div class="tray">
      <span>🔊</span>
      <span>🛡️</span>
      <span>12:00</span>
    </div>
  </div>
</body>
</html>`;
}

async function run() {
  console.log("Launching Playwright browser...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Generate RU OG
  console.log("Generating RU Open Graph preview...");
  const htmlRu = buildHtml({ lang: "ru" });
  await page.setContent(htmlRu, { waitUntil: "networkidle" });
  const outRu = path.join(rootDir, "public", "og-ru.png");
  await page.screenshot({ path: outRu, type: "png" });
  console.log(`Saved: ${outRu}`);

  // Generate EN OG
  console.log("Generating EN Open Graph preview...");
  const htmlEn = buildHtml({ lang: "en" });
  await page.setContent(htmlEn, { waitUntil: "networkidle" });
  const outEn = path.join(rootDir, "public", "og-en.png");
  await page.screenshot({ path: outEn, type: "png" });
  console.log(`Saved: ${outEn}`);

  // Also default og.png for general fallback
  fs.copyFileSync(outRu, path.join(rootDir, "public", "og.png"));
  console.log("Saved public/og.png fallback");

  // Also create apple-touch-icon.png (180x180) from an XP style badge
  console.log("Generating apple-touch-icon.png...");
  const applePage = await context.newPage();
  await applePage.setViewportSize({ width: 180, height: 180 });
  const appleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin:0; padding:0; box-sizing: border-box; }
    body {
      width: 180px; height: 180px;
      background: linear-gradient(135deg, #0055ea 0%, #00138c 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px;
    }
    img {
      width: 96px; height: 96px;
      border-radius: 18px;
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    span {
      color: #fff;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
  </style>
</head>
<body>
  <img src="${avatar}" />
  <span>VA · XP</span>
</body>
</html>`;
  await applePage.setContent(appleHtml, { waitUntil: "networkidle" });
  const outApple = path.join(rootDir, "public", "apple-touch-icon.png");
  await applePage.screenshot({ path: outApple, type: "png" });
  console.log(`Saved: ${outApple}`);

  await browser.close();
  console.log("All previews generated successfully!");
}

run().catch((err) => {
  console.error("Error generating OG preview:", err);
  process.exit(1);
});
