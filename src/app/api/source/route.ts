import { readdirSync, statSync } from "fs";
import { join, sep } from "path";
import { createTarball } from "@/lib/tar";

export const dynamic = "force-dynamic";

/**
 * Mengembalikan seluruh source code web app sebagai arsip .tar.gz.
 *
 * Hanya direktori/file di daftar berikut yang disertakan (allow-list ketat),
 * sehingga file rahasia seperti .env tidak pernah ikut terbawa.
 */
const INCLUDE_DIRS = ["src", "public", "scripts", "drizzle"];
const INCLUDE_FILES = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "drizzle.config.ts",
  "drizzle.config.json",
  ".env.example",
  ".gitignore",
  "README.md",
  "LICENSE",
];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function GET() {
  const root = process.cwd();
  const files: string[] = [];

  for (const name of INCLUDE_FILES) {
    try {
      if (statSync(join(root, name)).isFile()) files.push(name);
    } catch {
      /* file tidak ada, lewati */
    }
  }

  for (const dir of INCLUDE_DIRS) {
    let entries: string[] = [];
    try {
      entries = readdirSync(join(root, dir), { recursive: true, encoding: "utf-8" });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const rel = join(dir, entry);
      try {
        const stats = statSync(join(root, rel));
        if (stats.isFile() && stats.size <= MAX_FILE_BYTES) {
          files.push(rel.split(sep).join("/"));
        }
      } catch {
        /* lewati */
      }
    }
  }

  const tarball = createTarball(root, files);

  return new Response(new Uint8Array(tarball), {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": 'attachment; filename="sisakita-source.tar.gz"',
      "Cache-Control": "no-store",
    },
  });
}
