import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || typeof data !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid data format" }, { status: 400 });
    }

    const payload = data.resume ? data.resume : data;
    const jsonString = JSON.stringify(payload, null, 2) + "\n";

    const cwd = process.cwd();
    const contentPath = path.join(cwd, "content", "resume.json");
    const dataPath = path.join(cwd, "src", "data", "resume.json");

    // Ensure directories exist
    fs.mkdirSync(path.dirname(contentPath), { recursive: true });
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });

    // Write to both content/resume.json and src/data/resume.json
    fs.writeFileSync(contentPath, jsonString, "utf8");
    fs.writeFileSync(dataPath, jsonString, "utf8");

    return NextResponse.json({
      ok: true,
      message: "Успешно сохранено в проекте (content/resume.json и src/data/resume.json)",
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error saving resume:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
