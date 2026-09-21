import { gzipSync } from "zlib";
import { readFileSync, statSync } from "fs";
import { join } from "path";

/**
 * Membuat arsip .tar.gz berisi daftar file relatif terhadap `root`.
 * Implementasi minimal format POSIX ustar — tanpa dependency tambahan.
 */
function octal(value: number, fieldLength: number): string {
  return value.toString(8).padStart(fieldLength - 1, "0") + "\0";
}

function writeFixedString(buf: Buffer, str: string, offset: number, max: number): void {
  const bytes = Buffer.from(str, "utf-8");
  bytes.subarray(0, max).copy(buf, offset);
}

function tarHeader(name: string, size: number, mtime: number): Buffer {
  const header = Buffer.alloc(512, 0);
  writeFixedString(header, name.slice(0, 154), 0, 99);
  header.write(octal(0o644, 8), 100, "ascii"); // mode
  header.write(octal(0, 8), 108, "ascii"); // uid
  header.write(octal(0, 8), 116, "ascii"); // gid
  header.write(octal(size, 12), 124, "ascii"); // size
  header.write(octal(mtime, 12), 136, "ascii"); // mtime
  header.write("        ", 148, "ascii"); // checksum (8 spasi saat dihitung)
  header.write("0", 156, "ascii"); // typeflag: regular file
  header.write("ustar\0", 257, "ascii"); // magic
  header.write("00", 263, "ascii"); // version

  let checksum = 0;
  for (let i = 0; i < 512; i++) checksum += header[i];
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, "ascii");

  return header;
}

function padTo512(buf: Buffer): Buffer {
  const remainder = buf.length % 512;
  return remainder === 0 ? buf : Buffer.concat([buf, Buffer.alloc(512 - remainder, 0)]);
}

export function createTarball(root: string, relativeFiles: string[]): Buffer {
  const chunks: Buffer[] = [];

  for (const rel of relativeFiles) {
    const abs = join(root, rel);
    let stats;
    try {
      stats = statSync(abs);
    } catch {
      continue;
    }
    if (!stats.isFile()) continue;

    const data = readFileSync(abs);
    const archiveName = rel.replace(/\\/g, "/").replace(/^\.?\//, "");
    chunks.push(tarHeader(archiveName, data.length, Math.floor(stats.mtimeMs / 1000)));
    chunks.push(padTo512(data));
  }

  chunks.push(Buffer.alloc(1024, 0)); // end-of-archive marker (2 blok nol)
  return gzipSync(Buffer.concat(chunks), { level: 9 });
}
