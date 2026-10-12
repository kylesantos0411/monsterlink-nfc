import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_IMAGE = 'C:/Users/kyle/.gemini/antigravity/brain/d087f345-14e1-4d66-b4fd-50ceb6c6f96e/.user_uploaded/media_1791779842007_bd9008ce.jpg';

export interface MonsterDef {
  dexNumber: number;
  id: string;
  name: string;
  type: string;
  subtitle: string;
  description: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpAtk: number;
  baseSpDef: number;
  baseSpeed: number;
}

export const MONSTERS_LIST: Omit<MonsterDef, 'id' | 'description' | 'baseHp' | 'baseAtk' | 'baseDef' | 'baseSpAtk' | 'baseSpDef' | 'baseSpeed'>[] = [
  // Row 0
  { dexNumber: 1, name: 'FLAMBY', type: 'FIRE', subtitle: 'Flame Lizard' },
  { dexNumber: 2, name: 'AQUAT', type: 'WATER', subtitle: 'Tidal Turtle' },
  { dexNumber: 3, name: 'LEAFY', type: 'GRASS', subtitle: 'Sproutling' },
  { dexNumber: 4, name: 'SPARKI', type: 'ELECTRIC', subtitle: 'Spark Mouse' },
  { dexNumber: 5, name: 'SHADE', type: 'GHOST', subtitle: 'Shadow Sprite' },
  { dexNumber: 6, name: 'ROCKY', type: 'ROCK', subtitle: 'Stone Golem' },
  { dexNumber: 7, name: 'FROSTY', type: 'ICE', subtitle: 'Frost Pup' },
  { dexNumber: 8, name: 'SKYLER', type: 'FLYING', subtitle: 'Sky Fledgling' },
  { dexNumber: 9, name: 'BUBBLE', type: 'FAIRY', subtitle: 'Pink Axolotl' },
  { dexNumber: 10, name: 'MAGNIX', type: 'STEEL', subtitle: 'Magnetic Eye' },

  // Row 1
  { dexNumber: 11, name: 'BLAZIK', type: 'FIRE', subtitle: 'Ember Drake' },
  { dexNumber: 12, name: 'TIDELY', type: 'WATER', subtitle: 'Wave Cat' },
  { dexNumber: 13, name: 'VINELO', type: 'GRASS', subtitle: 'Vine Serpent' },
  { dexNumber: 14, name: 'VOLTIC', type: 'ELECTRIC', subtitle: 'Voltic Badger' },
  { dexNumber: 15, name: 'PHANTOM', type: 'GHOST', subtitle: 'Night Wraith' },
  { dexNumber: 16, name: 'TERRA', type: 'GROUND', subtitle: 'Armored Pangolin' },
  { dexNumber: 17, name: 'GLACIA', type: 'ICE', subtitle: 'Arctic Fox' },
  { dexNumber: 18, name: 'ZEPHYR', type: 'FLYING', subtitle: 'Gale Raptor' },
  { dexNumber: 19, name: 'COTTON', type: 'FAIRY', subtitle: 'Cotton Lamb' },
  { dexNumber: 20, name: 'FORGE', type: 'STEEL', subtitle: 'Molten Automaton' },

  // Row 2
  { dexNumber: 21, name: 'LUMI', type: 'ELECTRIC', subtitle: 'Light Hare' },
  { dexNumber: 22, name: 'MUDDLE', type: 'GROUND', subtitle: 'Clay Brute' },
  { dexNumber: 23, name: 'SEARIN', type: 'FIRE', subtitle: 'Flame Hound' },
  { dexNumber: 24, name: 'SURGE', type: 'ELECTRIC', subtitle: 'Storm Wolf' },
  { dexNumber: 25, name: 'BLOOMY', type: 'GRASS', subtitle: 'Floral Dino' },
  { dexNumber: 26, name: 'CORALIS', type: 'WATER', subtitle: 'Reef Medusa' },
  { dexNumber: 27, name: 'HOWLIE', type: 'DARK', subtitle: 'Shadow Lupine' },
  { dexNumber: 28, name: 'PIXIE', type: 'FAIRY', subtitle: 'Starlight Sprite' },
  { dexNumber: 29, name: 'STONIX', type: 'ROCK', subtitle: 'Boulder Worm' },
  { dexNumber: 30, name: 'VOLCANO', type: 'FIRE', subtitle: 'Magma Beast' },

  // Row 3
  { dexNumber: 31, name: 'AQUILO', type: 'ICE', subtitle: 'Glacier Stag' },
  { dexNumber: 32, name: 'THUNDER', type: 'ELECTRIC', subtitle: 'Lightning Beast' },
  { dexNumber: 33, name: 'LURK', type: 'DARK', subtitle: 'Abyssal Feline' },
  { dexNumber: 34, name: 'PETAL', type: 'FAIRY', subtitle: 'Blossom Fox' },
  { dexNumber: 35, name: 'CROWL', type: 'FLYING', subtitle: 'Raven Warden' },
  { dexNumber: 36, name: 'BOLTIE', type: 'ELECTRIC', subtitle: 'Zap Rodent' },
  { dexNumber: 37, name: 'SHELLY', type: 'WATER', subtitle: 'Coral Tortoise' },
  { dexNumber: 38, name: 'ROOTER', type: 'GRASS', subtitle: 'Ancient Treant' },
  { dexNumber: 39, name: 'DRIZZY', type: 'WATER', subtitle: 'Rain Drake' },
  { dexNumber: 40, name: 'SANDY', type: 'GROUND', subtitle: 'Dune Crawler' },

  // Row 4
  { dexNumber: 41, name: 'LUMBER', type: 'GRASS', subtitle: 'Timber Guardian' },
  { dexNumber: 42, name: 'JETT', type: 'DRAGON', subtitle: 'Skyborne Wyvern' },
  { dexNumber: 43, name: 'VOID', type: 'GHOST', subtitle: 'Nebula Specter' },
  { dexNumber: 44, name: 'CHILL', type: 'ICE', subtitle: 'Glacier Penguin' },
  { dexNumber: 45, name: 'FANG', type: 'DARK', subtitle: 'Dusk Stalker' },
  { dexNumber: 46, name: 'SOLAR', type: 'FIRE', subtitle: 'Sun Sovereign' },
  { dexNumber: 47, name: 'AERO', type: 'FLYING', subtitle: 'Zephyr Swallow' },
  { dexNumber: 48, name: 'CRYSTA', type: 'ROCK', subtitle: 'Gemstone Behemoth' },
  { dexNumber: 49, name: 'VENOM', type: 'POISON', subtitle: 'Toxic Ogre' },
  { dexNumber: 50, name: 'ORBIT', type: 'STEEL', subtitle: 'Cosmic Core' }
];

const ROW_Y_RANGES = [
  { minY: 112, maxY: 195 },
  { minY: 282, maxY: 368 },
  { minY: 462, maxY: 540 },
  { minY: 633, maxY: 713 },
  { minY: 795, maxY: 868 }
];

const COL_RANGES = [
  [0, 102],
  [102, 205],
  [205, 307],
  [307, 410],
  [410, 512],
  [512, 614],
  [614, 717],
  [717, 819],
  [819, 922],
  [922, 1024]
];

function isBackground(r: number, g: number, b: number) {
  const dist = Math.sqrt((r - 1) ** 2 + (g - 14) ** 2 + (b - 30) ** 2);
  return dist < 24;
}

async function extractMonster(row: number, col: number, monster: (typeof MONSTERS_LIST)[0], outDir: string) {
  const { minY, maxY } = ROW_Y_RANGES[row];
  const [minX, maxX] = COL_RANGES[col];
  const cellWidth = maxX - minX;
  const cellHeight = maxY - minY;

  const cropped = await sharp(SRC_IMAGE)
    .extract({ left: minX, top: minY, width: cellWidth, height: cellHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = cropped;
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  const rgba = Buffer.alloc(w * h * 4);
  const visited = new Uint8Array(w * h);
  const queue: [number, number][] = [];

  for (let x = 0; x < w; x++) {
    queue.push([x, 0]);
    queue.push([x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y]);
    queue.push([w - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop()!;
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pIdx = idx * ch;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    if (isBackground(r, g, b)) {
      if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
      if (x < w - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
      if (y > 0 && !visited[idx - w]) queue.push([x, y - 1]);
      if (y < h - 1 && !visited[idx + w]) queue.push([x, y + 1]);
    }
  }

  let minSpriteX = w, maxSpriteX = 0, minSpriteY = h, maxSpriteY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pIdx = idx * ch;
      const targetIdx = idx * 4;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      const isBg = visited[idx] === 1 || isBackground(r, g, b);

      if (isBg) {
        rgba[targetIdx] = 0;
        rgba[targetIdx + 1] = 0;
        rgba[targetIdx + 2] = 0;
        rgba[targetIdx + 3] = 0;
      } else {
        rgba[targetIdx] = r;
        rgba[targetIdx + 1] = g;
        rgba[targetIdx + 2] = b;
        rgba[targetIdx + 3] = 255;

        if (x < minSpriteX) minSpriteX = x;
        if (x > maxSpriteX) maxSpriteX = x;
        if (y < minSpriteY) minSpriteY = y;
        if (y > maxSpriteY) maxSpriteY = y;
      }
    }
  }

  const paddedNum = String(monster.dexNumber).padStart(3, '0');
  const slug = monster.name.toLowerCase();
  const filename = `${paddedNum}_${slug}.png`;
  const canonicalFilename = `monster_${paddedNum}.png`;

  if (minSpriteX <= maxSpriteX && minSpriteY <= maxSpriteY) {
    const spriteW = maxSpriteX - minSpriteX + 1;
    const spriteH = maxSpriteY - minSpriteY + 1;

    const extracted = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .extract({ left: minSpriteX, top: minSpriteY, width: spriteW, height: spriteH })
      .png()
      .toBuffer();

    // Save 96x96 contain
    const finalPng = await sharp(extracted)
      .resize({
        width: 96,
        height: 96,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: 'nearest'
      })
      .png()
      .toBuffer();

    await sharp(finalPng).toFile(path.join(outDir, filename));
    await sharp(finalPng).toFile(path.join(outDir, canonicalFilename));
  } else {
    console.warn(`Warning: empty sprite bounds for ${monster.name}`);
  }
}

async function main() {
  const outDir = 'c:/Users/kyle/Desktop/Pokemon Inspired Game/public/monsters';
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Extracting all 50 monsters...');
  for (let i = 0; i < MONSTERS_LIST.length; i++) {
    const monster = MONSTERS_LIST[i];
    const row = Math.floor(i / 10);
    const col = i % 10;
    await extractMonster(row, col, monster, outDir);
    process.stdout.write(`Extracted ${String(monster.dexNumber).padStart(2, '0')}: ${monster.name}\n`);
  }
  console.log('Successfully extracted all 50 monster sprites to public/monsters/!');
}

main().catch(console.error);
