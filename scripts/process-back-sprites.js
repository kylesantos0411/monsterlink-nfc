import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\kyle\\.gemini\\antigravity\\brain\\d087f345-14e1-4d66-b4fd-50ceb6c6f96e';
const targetDir = 'c:\\Users\\kyle\\Desktop\\Pokemon Inspired Game\\public\\monsters';

const files = [
  {
    name: 'monster_001_back.png',
    src: path.join(artifactsDir, 'flamby_back_sprite_1791781821236.jpg')
  },
  {
    name: 'monster_002_back.png',
    src: path.join(artifactsDir, 'aquat_back_sprite_1791781844697.jpg')
  },
  {
    name: 'monster_003_back.png',
    src: path.join(artifactsDir, 'leafy_back_sprite_1791781862790.jpg')
  },
  {
    name: 'monster_004_back.png',
    src: path.join(artifactsDir, 'sparki_back_sprite_1791781879691.jpg')
  }
];

async function processImage(srcPath, outPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // Flood fill / transparency for white background
  // First, identify background by BFS flood-fill from all 4 corners
  const isVisited = new Uint8Array(width * height);
  const queue = [];

  function isWhite(idx) {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    // Threshold for white background
    return r > 230 && g > 230 && b > 230;
  }

  // Push boundary pixels
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const btmIdx = (height - 1) * width + x;
    if (isWhite(topIdx)) { isVisited[topIdx] = 1; queue.push(topIdx); }
    if (isWhite(btmIdx)) { isVisited[btmIdx] = 1; queue.push(btmIdx); }
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (isWhite(leftIdx) && !isVisited[leftIdx]) { isVisited[leftIdx] = 1; queue.push(leftIdx); }
    if (isWhite(rightIdx) && !isVisited[rightIdx]) { isVisited[rightIdx] = 1; queue.push(rightIdx); }
  }

  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cy > 0 ? (cy - 1) * width + cx : -1,
      cy < height - 1 ? (cy + 1) * width + cx : -1,
      cx > 0 ? cy * width + (cx - 1) : -1,
      cx < width - 1 ? cy * width + (cx + 1) : -1,
    ];

    for (const n of neighbors) {
      if (n !== -1 && !isVisited[n] && isWhite(n)) {
        isVisited[n] = 1;
        queue.push(n);
      }
    }
  }

  // Apply transparency to all visited background pixels
  for (let i = 0; i < width * height; i++) {
    if (isVisited[i]) {
      data[i * 4 + 3] = 0; // Alpha 0
    }
  }

  // Output 96x96 clean PNG with nearest neighbor / pixelated style
  await sharp(data, { raw: { width, height, channels: 4 } })
    .resize(96, 96, { kernel: sharp.kernel.nearest })
    .png()
    .toFile(outPath);

  console.log(`Saved transparent sprite: ${outPath}`);
}

async function main() {
  for (const item of files) {
    await processImage(item.src, path.join(targetDir, item.name));
  }
}

main().catch(console.error);
