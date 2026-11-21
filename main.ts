// News image entry: ships the front page for 20 November 2026.
// The picture itself lives beside this file as entry.png. This program
// only moves it into the grader's output folder, after proving it is
// a real PNG of the right size. Nothing is drawn or fetched here:
// the judging image is exactly the bytes in entry.png.
//
// When run outside the grader, point the output somewhere handy:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGE_NAME = 'entry.png';
const MAX_BYTES = 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, IMAGE_NAME);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const targetPath = join(outDir, IMAGE_NAME);

if (!existsSync(sourcePath)) {
  throw new Error(`missing image: ${IMAGE_NAME} was not found next to main.ts`);
}

const stats = statSync(sourcePath);
if (stats.size > MAX_BYTES) {
  throw new Error(`image too big: ${stats.size} bytes, limit is ${MAX_BYTES}`);
}

const bytes = readFileSync(sourcePath);
if (!bytes.subarray(0, 4).equals(PNG_MAGIC)) {
  throw new Error('image is not a PNG: its first four bytes do not match');
}

const digest = createHash('sha256').update(bytes).digest('hex');
console.log(`copying ${IMAGE_NAME}: ${bytes.length} bytes, sha256 ${digest}`);

// The front page is drawn at 1024 by 1024. Those numbers sit in the
// PNG's IHDR chunk: width at bytes 16-19, height at bytes 20-23.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`image too large: ${width}x${height}, limit is 1024x1024`);
}
console.log(`image is ${width}x${height}`);

mkdirSync(outDir, { recursive: true });
writeFileSync(targetPath, bytes);

const written = statSync(targetPath);
if (written.size !== bytes.length) {
  throw new Error(`short write: wrote ${written.size} of ${bytes.length} bytes`);
}

console.log(`wrote ${targetPath}`);
