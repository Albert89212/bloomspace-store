import fs from "node:fs";
import path from "node:path";

const DATA_DIR =
  process.env.SADOVA_DATA_DIR || path.join(process.cwd(), "data");

function ensureDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    /* noop */
  }
}

function filePath(name: string) {
  const safe = name.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

export function readCollection<T = unknown>(name: string): T[] {
  try {
    ensureDir();
    const p = filePath(name);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T = unknown>(name: string, items: T[]): void {
  ensureDir();
  const p = filePath(name);
  fs.writeFileSync(p, JSON.stringify(items, null, 2), "utf8");
}