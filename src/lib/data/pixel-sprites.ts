// Pixel art sprites for all 50 MONSTERLINK creatures

const MONSTER_NAMES = [
  'flamby', 'aquat', 'leafy', 'sparki', 'shade', 'rocky', 'frosty', 'skyler', 'bubble', 'magnix',
  'blazik', 'tidely', 'vinelo', 'voltic', 'phantom', 'terra', 'glacia', 'zephyr', 'cotton', 'forge',
  'lumi', 'muddle', 'searin', 'surge', 'bloomy', 'coralis', 'howlie', 'pixie', 'stonix', 'volcano',
  'aquilo', 'thunder', 'lurk', 'petal', 'crowl', 'boltie', 'shelly', 'rooter', 'drizzy', 'sandy',
  'lumber', 'jett', 'void', 'chill', 'fang', 'solar', 'aero', 'crysta', 'venom', 'orbit'
];

function createMonsterSvg(paddedNum: string): string {
  return `<svg viewBox="0 0 96 96" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated;"><image href="/monsters/monster_${paddedNum}.png" width="96" height="96" preserveAspectRatio="xMidYMid meet" style="image-rendering: pixelated;" /></svg>`;
}

export const PIXEL_SPRITES: Record<string, string> = {
  // Legacy / Starter fallbacks
  ignisaur: createMonsterSvg('001'),
  aquabite: createMonsterSvg('002'),
  floraslug: createMonsterSvg('003'),
  voltkit: createMonsterSvg('004'),
};

// Populate all 50 monsters by name and number
MONSTER_NAMES.forEach((name, index) => {
  const num = index + 1;
  const padded = String(num).padStart(3, '0');
  const svg = createMonsterSvg(padded);

  PIXEL_SPRITES[name] = svg;
  PIXEL_SPRITES[`monster_${padded}`] = svg;
  PIXEL_SPRITES[`species_${name}`] = svg;
  PIXEL_SPRITES[String(num)] = svg;
});
