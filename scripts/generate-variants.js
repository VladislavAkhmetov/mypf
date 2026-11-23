const fs = require('fs');
const sharp = require('sharp');

// Variant A: Authentic Office 2003 .doc (White badge face with 3D Blue "W", picture box, folded flap)
function createSvgVariantA() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Paper shadow -->
    <filter id="page-shadow-a" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
      <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#081830" flood-opacity="0.4" />
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#081830" flood-opacity="0.25" />
    </filter>

    <!-- Badge shadow onto paper -->
    <filter id="badge-shadow-a" x="0" y="24" width="168" height="168" filterUnits="userSpaceOnUse">
      <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#0a1d3a" flood-opacity="0.45" />
    </filter>

    <!-- W 3D Shadow -->
    <filter id="w-shadow-a" x="20" y="50" width="112" height="112" filterUnits="userSpaceOnUse">
      <feDropShadow dx="2" dy="2.5" stdDeviation="1" flood-color="#0a2048" flood-opacity="0.6" />
    </filter>

    <!-- Paper gradient -->
    <linearGradient id="page-grad-a" x1="40" y1="16" x2="236" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f8fbfe" />
      <stop offset="100%" stop-color="#e1ebf6" />
    </linearGradient>

    <!-- Fold flap gradient -->
    <linearGradient id="fold-grad-a" x1="168" y1="16" x2="236" y2="84" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d4e2f0" />
      <stop offset="35%" stop-color="#edf4fb" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>

    <!-- Fold underside shadow -->
    <linearGradient id="fold-shadow-a" x1="168" y1="84" x2="186" y2="102" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#142c4c" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#142c4c" stop-opacity="0" />
    </linearGradient>

    <!-- Badge border gradient -->
    <linearGradient id="badge-border-a" x1="10" y1="36" x2="142" y2="168" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b72c9" />
      <stop offset="100%" stop-color="#123875" />
    </linearGradient>

    <!-- Badge face gradient -->
    <linearGradient id="badge-face-a" x1="18" y1="44" x2="134" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f5f9fe" />
      <stop offset="100%" stop-color="#e4eef9" />
    </linearGradient>

    <!-- 3D Blue W Gradient -->
    <linearGradient id="w-grad-a" x1="34" y1="58" x2="118" y2="148" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3d7eec" />
      <stop offset="30%" stop-color="#2664d4" />
      <stop offset="80%" stop-color="#1543a6" />
      <stop offset="100%" stop-color="#0c2c78" />
    </linearGradient>

    <!-- Graphic thumbnail gradient -->
    <linearGradient id="thumb-grad-a" x1="146" y1="46" x2="216" y2="106" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#cbe0f4" />
    </linearGradient>
  </defs>

  <!-- Document Sheet with Shadow -->
  <g filter="url(#page-shadow-a)">
    <!-- Sheet background -->
    <path
      d="M 36 16
         L 168 16
         L 236 84
         L 236 234
         A 6 6 0 0 1 230 240
         L 36 240
         A 6 6 0 0 1 30 234
         L 30 22
         A 6 6 0 0 1 36 16 Z"
      fill="url(#page-grad-a)"
      stroke="#567294"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Inner top/left bevel highlight for crisp edge -->
    <path
      d="M 36 18.5
         L 167 18.5
         M 32.5 24
         L 32.5 234"
      stroke="#ffffff"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Fold shadow -->
    <path
      d="M 168 84
         L 168 104
         L 236 84 Z"
      fill="url(#fold-shadow-a)"
    />

    <!-- Fold flap -->
    <path
      d="M 168 16
         L 168 78
         A 6 6 0 0 0 174 84
         L 236 84 Z"
      fill="url(#fold-grad-a)"
      stroke="#567294"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Inner flap highlight -->
    <line x1="170" y1="18" x2="170" y2="82" stroke="#ffffff" stroke-width="1.5" />
    <line x1="170" y1="82" x2="234" y2="82" stroke="#ffffff" stroke-width="1.5" />

    <!-- Graphic thumbnail (picture placeholder under fold) -->
    <rect
      x="146"
      y="42"
      width="68"
      height="62"
      rx="3"
      fill="url(#thumb-grad-a)"
      stroke="#7c9cbd"
      stroke-width="2"
    />
    <!-- Miniature chart/sun inside thumbnail -->
    <rect x="152" y="48" width="56" height="20" rx="1.5" fill="#9ec4e8" opacity="0.8" />
    <circle cx="162" cy="84" r="6" fill="#f59e0b" />
    <path d="M 152 98 L 172 78 L 186 92 L 198 80 L 208 98 Z" fill="#60a5fa" opacity="0.85" />

    <!-- Ruled lines beside badge -->
    <line x1="146" y1="120" x2="220" y2="120" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="146" y1="136" x2="224" y2="136" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="146" y1="152" x2="214" y2="152" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="146" y1="168" x2="220" y2="168" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />

    <!-- Ruled lines below badge -->
    <line x1="42" y1="188" x2="224" y2="188" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="42" y1="204" x2="214" y2="204" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="42" y1="220" x2="168" y2="220" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Word Badge Overhanging Left Side -->
  <g filter="url(#badge-shadow-a)">
    <!-- Outer border frame -->
    <rect
      x="10"
      y="38"
      width="128"
      height="126"
      rx="14"
      fill="url(#badge-border-a)"
    />

    <!-- Inner light blue border -->
    <rect
      x="14"
      y="42"
      width="120"
      height="118"
      rx="10"
      fill="#6ea3ed"
    />

    <!-- White/Ice Face -->
    <rect
      x="19"
      y="47"
      width="110"
      height="108"
      rx="7"
      fill="url(#badge-face-a)"
    />

    <!-- 3D Bevel highlight on face -->
    <path
      d="M 22 50 L 126 50 M 22 50 L 22 152"
      stroke="#ffffff"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- 3D Blue Serif "W" -->
    <g filter="url(#w-shadow-a)">
      <path
        d="M 28 62
           L 46 62
           L 46 67
           L 40.5 68
           L 49.5 124
           L 61 72
           L 55.5 68
           L 55.5 62
           L 72.5 62
           L 72.5 67
           L 67 68
           L 76 124
           L 89 72
           L 83.5 68
           L 83.5 62
           L 101 62
           L 101 67
           L 95 68
           L 80 142
           L 69 142
           L 62.5 88
           L 56 142
           L 45 142
           L 33.5 68
           L 28 67 Z"
        fill="url(#w-grad-a)"
        stroke="#0c2868"
        stroke-width="1.5"
        stroke-linejoin="round"
        fill-rule="evenodd"
      />
    </g>

    <!-- W Highlights on top/left strokes -->
    <path
      d="M 29 63 L 45 63 M 41 68 L 47 118 M 68 68 L 74 118 M 56 63 L 72 63 M 84 63 L 100 63"
      stroke="#8ab4f8"
      stroke-width="1.2"
      stroke-linecap="round"
      opacity="0.75"
    />
  </g>
</svg>`;
}

// Variant B: Vibrant Royal Blue Badge (High contrast on Bliss wallpaper) with paper
function createSvgVariantB() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Paper shadow -->
    <filter id="page-shadow-b" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse">
      <feDropShadow dx="3" dy="6" stdDeviation="5.5" flood-color="#081830" flood-opacity="0.45" />
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#081830" flood-opacity="0.25" />
    </filter>

    <!-- Badge shadow onto paper -->
    <filter id="badge-shadow-b" x="0" y="24" width="168" height="168" filterUnits="userSpaceOnUse">
      <feDropShadow dx="4" dy="6" stdDeviation="5" flood-color="#051228" flood-opacity="0.55" />
    </filter>

    <!-- Letter shadow -->
    <filter id="letter-shadow-b" x="20" y="50" width="112" height="112" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#030d22" flood-opacity="0.75" />
    </filter>

    <!-- Paper gradient -->
    <linearGradient id="page-grad-b" x1="40" y1="16" x2="236" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="55%" stop-color="#f8fbfe" />
      <stop offset="100%" stop-color="#dde8f4" />
    </linearGradient>

    <!-- Fold flap gradient -->
    <linearGradient id="fold-grad-b" x1="168" y1="16" x2="236" y2="84" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d0dfef" />
      <stop offset="35%" stop-color="#edf4fb" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>

    <!-- Fold underside shadow -->
    <linearGradient id="fold-shadow-b" x1="168" y1="84" x2="186" y2="102" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#142c4c" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#142c4c" stop-opacity="0" />
    </linearGradient>

    <!-- Badge Gradient (Royal XP Word Blue) -->
    <linearGradient id="badge-grad-b" x1="10" y1="36" x2="142" y2="168" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4a88f7" />
      <stop offset="15%" stop-color="#2a6ce6" />
      <stop offset="65%" stop-color="#1448b8" />
      <stop offset="100%" stop-color="#092776" />
    </linearGradient>

    <!-- Badge Bevel Highlight -->
    <linearGradient id="badge-bevel-b" x1="10" y1="36" x2="10" y2="168" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#b8d5ff" />
      <stop offset="40%" stop-color="#6ea3f8" />
      <stop offset="100%" stop-color="#184ec4" />
    </linearGradient>

    <!-- Graphic thumbnail gradient -->
    <linearGradient id="thumb-grad-b" x1="146" y1="46" x2="216" y2="106" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#cbe0f4" />
    </linearGradient>
  </defs>

  <!-- Document Sheet with Shadow -->
  <g filter="url(#page-shadow-b)">
    <!-- Sheet background -->
    <path
      d="M 36 16
         L 168 16
         L 236 84
         L 236 234
         A 6 6 0 0 1 230 240
         L 36 240
         A 6 6 0 0 1 30 234
         L 30 22
         A 6 6 0 0 1 36 16 Z"
      fill="url(#page-grad-b)"
      stroke="#4c6686"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Inner top/left bevel highlight for crisp edge -->
    <path
      d="M 36 18.5
         L 167 18.5
         M 32.5 24
         L 32.5 234"
      stroke="#ffffff"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Fold shadow -->
    <path
      d="M 168 84
         L 168 104
         L 236 84 Z"
      fill="url(#fold-shadow-b)"
    />

    <!-- Fold flap -->
    <path
      d="M 168 16
         L 168 78
         A 6 6 0 0 0 174 84
         L 236 84 Z"
      fill="url(#fold-grad-b)"
      stroke="#4c6686"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Inner flap highlight -->
    <line x1="170" y1="18" x2="170" y2="82" stroke="#ffffff" stroke-width="1.5" />
    <line x1="170" y1="82" x2="234" y2="82" stroke="#ffffff" stroke-width="1.5" />

    <!-- Graphic thumbnail (picture placeholder under fold) -->
    <rect
      x="146"
      y="42"
      width="68"
      height="62"
      rx="3"
      fill="url(#thumb-grad-b)"
      stroke="#7c9cbd"
      stroke-width="2"
    />
    <rect x="152" y="48" width="56" height="20" rx="1.5" fill="#9ec4e8" opacity="0.8" />
    <circle cx="162" cy="84" r="6" fill="#f59e0b" />
    <path d="M 152 98 L 172 78 L 186 92 L 198 80 L 208 98 Z" fill="#60a5fa" opacity="0.85" />

    <!-- Ruled lines beside badge -->
    <line x1="148" y1="120" x2="220" y2="120" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="148" y1="136" x2="224" y2="136" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="148" y1="152" x2="214" y2="152" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="148" y1="168" x2="220" y2="168" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />

    <!-- Ruled lines below badge -->
    <line x1="42" y1="188" x2="224" y2="188" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="42" y1="204" x2="214" y2="204" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
    <line x1="42" y1="220" x2="168" y2="220" stroke="#7998b8" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Word Badge Overhanging Left Side (Chunky Royal Blue) -->
  <g filter="url(#badge-shadow-b)">
    <!-- Blue tile background -->
    <rect
      x="10"
      y="38"
      width="132"
      height="128"
      rx="15"
      fill="url(#badge-grad-b)"
      stroke="#08205c"
      stroke-width="3"
    />

    <!-- Inner top-left bevel highlight -->
    <path
      d="M 23 41.5
         L 138 41.5
         M 13.5 54
         L 13.5 156"
      stroke="url(#badge-bevel-b)"
      stroke-width="2.5"
      stroke-linecap="round"
    />

    <!-- Bold Serif White 'W' -->
    <g filter="url(#letter-shadow-b)">
      <path
        d="M 30 60
           L 49 60
           L 49 65
           L 43.5 66
           L 52.5 122
           L 64 70
           L 58.5 66
           L 58.5 60
           L 75.5 60
           L 75.5 65
           L 70 66
           L 79 122
           L 92 70
           L 86.5 66
           L 86.5 60
           L 104 60
           L 104 65
           L 98 66
           L 83 144
           L 72 144
           L 65.5 90
           L 59 144
           L 48 144
           L 35.5 66
           L 30 65 Z"
        fill="#ffffff"
        stroke="#0c2560"
        stroke-width="1.2"
        stroke-linejoin="round"
        fill-rule="evenodd"
      />
    </g>

    <!-- Crisp highlights on top/left strokes of W -->
    <path
      d="M 31 61 L 48 61 M 44 66 L 50 116 M 71 66 L 77 116 M 59 61 L 75 61 M 87 61 L 103 61"
      stroke="#ffffff"
      stroke-width="1"
      stroke-linecap="round"
      opacity="0.9"
    />
  </g>
</svg>`;
}

async function run() {
  const svgA = createSvgVariantA();
  const svgB = createSvgVariantB();

  fs.writeFileSync('scripts/word-variant-a.svg', svgA);
  fs.writeFileSync('scripts/word-variant-b.svg', svgB);

  await sharp(Buffer.from(svgA)).resize(512, 512).png().toFile('scripts/word-variant-a.png');
  await sharp(Buffer.from(svgB)).resize(512, 512).png().toFile('scripts/word-variant-b.png');

  console.log('Generated variant A and B images successfully');
}

run();
