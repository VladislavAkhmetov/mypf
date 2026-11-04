// Собирает записи журнала из content/journal/*.md в src/data/journal.generated.ts.
// Запуск: npm run journal (автоматически перед npm run build).
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "content/journal");
const out = join(root, "src/data/journal.generated.ts");

const projectSlugs = new Set(
  [...readFileSync(join(root, "src/data/projects.ts"), "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]),
);

const errors = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);

const stripInline = text =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/[*_`]/g, "");

const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const imageOnly = line => line.replace(IMAGE, "").trim() === "" && /!\[/.test(line);

function parseFrontmatter(file, raw) {
  const match = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    fail(file, "нет блока --- title/date --- в начале файла");
    return { meta: {}, body: "" };
  }
  const meta = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: match[2] };
}

function parseBody(file, body) {
  const blocks = [];
  for (const chunk of body.trim().split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every(imageOnly)) {
      const items = [...lines.join(" ").matchAll(IMAGE)].map(([, alt, src]) => {
        if (src.startsWith("/") && !existsSync(join(root, "public", src))) fail(file, `нет файла public${src}`);
        return { type: /\.(mp4|webm)$/i.test(src) ? "video" : "image", src, alt };
      });
      blocks.push({ t: "media", items });
    } else if (lines[0].startsWith("## ")) {
      blocks.push({ t: "h", text: lines[0].slice(3).trim() });
      const rest = lines.slice(1).join(" ");
      if (rest) blocks.push({ t: "p", text: rest });
    } else if (lines.every(l => /^[-*] /.test(l))) {
      blocks.push({ t: "ul", items: lines.map(l => l.slice(2).trim()) });
    } else {
      blocks.push({ t: "p", text: lines.join(" ") });
    }
  }
  return blocks;
}

const entries = [];
const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith(".md") && !f.startsWith("_")).sort() : [];

for (const file of files) {
  const { meta, body } = parseFrontmatter(file, readFileSync(join(dir, file), "utf8"));
  const nameDate = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  const date = meta.date || nameDate?.[1];
  if (!meta.title) fail(file, "не указан title");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(file, "date должен быть в формате 2026-09-24");
  if (meta.project && !projectSlugs.has(meta.project)) fail(file, `проект «${meta.project}» не найден (есть: ${[...projectSlugs].join(", ")})`);

  const blocks = parseBody(file, body);
  const firstPara = blocks.find(b => b.t === "p");
  const cover = blocks.find(b => b.t === "media")?.items[0];
  const words = blocks.reduce((n, b) => {
    const text = b.t === "p" || b.t === "h" ? b.text : b.t === "ul" ? b.items.join(" ") : "";
    return n + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  entries.push({
    id: nameDate ? nameDate[2] : file.replace(/\.md$/, ""),
    title: meta.title ?? file,
    date: `${date}T12:00:00+03:00`,
    ...(meta.project ? { project: meta.project } : {}),
    minutes: Math.max(1, Math.ceil(words / 180)),
    excerpt: firstPara ? stripInline(firstPara.text) : "",
    ...(cover ? { cover } : {}),
    blocks,
    _file: file,
  });
}

const ids = new Set();
for (const entry of entries) {
  if (ids.has(entry.id)) fail(entry._file, `повторяется id «${entry.id}»`);
  ids.add(entry.id);
}

if (errors.length) {
  console.error(`\nЖурнал не собран:\n${errors.map(e => `  - ${e}`).join("\n")}\n`);
  process.exit(1);
}

const json = JSON.stringify(entries.map(({ _file: _omit, ...entry }) => entry), null, 2);
writeFileSync(
  out,
  `// Файл создаётся скриптом scripts/build-journal.mjs из content/journal/*.md. Не редактируйте вручную.\nimport type { JournalEntry } from "./journal-types";\n\nexport const journalEntries: JournalEntry[] = ${json};\n`,
);
console.log(`Журнал: записей — ${entries.length}`);
