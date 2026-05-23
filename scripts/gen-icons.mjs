// Generates PNG icons from icon.svg using sharp.
// Run once: node scripts/gen-icons.mjs

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const svg  = readFileSync(join(root, 'public', 'icon.svg'));

const sizes = [
  { name: 'icon-192.png',       size: 192 },
  { name: 'icon-512.png',       size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png',     size: 32  },
];

for (const { name, size } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(root, 'public', name));
  console.log(`✓ public/${name}`);
}
