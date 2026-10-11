import { ElementType, MoveDefinition, CreatureSpecies, CreatureInstance } from '@/types/creature';
import { CardRegistryEntry } from '@/types/nfc';

export const MOVES_CATALOG: Record<string, MoveDefinition> = {
  flame_burst: {
    id: 'flame_burst',
    name: 'Flame Burst',
    type: 'Fire',
    power: 45,
    accuracy: 100,
    description: 'Shoots a burst of scorching embers at the target.',
  },
  fire_fang: {
    id: 'fire_fang',
    name: 'Fire Fang',
    type: 'Fire',
    power: 60,
    accuracy: 95,
    description: 'Bites with burning fangs imbued with fire.',
  },
  aqua_jet: {
    id: 'aqua_jet',
    name: 'Aqua Jet',
    type: 'Water',
    power: 40,
    accuracy: 100,
    description: 'Strikes quickly like a high-speed torrent.',
  },
  bubble_beam: {
    id: 'bubble_beam',
    name: 'Bubble Beam',
    type: 'Water',
    power: 60,
    accuracy: 100,
    description: 'Sprays pressurized bubbles that blast the foe.',
  },
  vine_whip: {
    id: 'vine_whip',
    name: 'Vine Whip',
    type: 'Grass',
    power: 45,
    accuracy: 100,
    description: 'Strikes the target with slender, stinging vines.',
  },
  spore_blast: {
    id: 'spore_blast',
    name: 'Spore Blast',
    type: 'Grass',
    power: 55,
    accuracy: 95,
    description: 'Explodes a pouch of prickly pollen spores.',
  },
  spark_claw: {
    id: 'spark_claw',
    name: 'Spark Claw',
    type: 'Electric',
    power: 45,
    accuracy: 100,
    description: 'Slashes with claws energized with crackling voltage.',
  },
  thunder_jolt: {
    id: 'thunder_jolt',
    name: 'Thunder Jolt',
    type: 'Electric',
    power: 60,
    accuracy: 95,
    description: 'Unleashes a concentrated blast of lightning.',
  },
  tackle: {
    id: 'tackle',
    name: 'Tackle',
    type: 'Normal',
    power: 35,
    accuracy: 100,
    description: 'A full-body charge that strikes the opponent.',
  },
  quick_strike: {
    id: 'quick_strike',
    name: 'Quick Strike',
    type: 'Normal',
    power: 40,
    accuracy: 100,
    description: 'A swift, agile strike delivered before the foe reacts.',
  },
};

export const SPECIES_CATALOG: Record<string, CreatureSpecies> = {
  species_ignisaur: {
    id: 'species_ignisaur',
    name: 'Ignisaur',
    subtitle: 'Ember Reptile',
    type: 'Fire',
    rarity: 'Common',
    baseStats: { hp: 48, attack: 52, defense: 43, speed: 55 },
    learnableMoveIds: ['flame_burst', 'tackle', 'fire_fang'],
    spriteKey: 'ignisaur',
  },
  species_aquabite: {
    id: 'species_aquabite',
    name: 'Aquabite',
    subtitle: 'Coral Crab',
    type: 'Water',
    rarity: 'Common',
    baseStats: { hp: 55, attack: 46, defense: 60, speed: 38 },
    learnableMoveIds: ['aqua_jet', 'tackle', 'bubble_beam'],
    spriteKey: 'aquabite',
  },
  species_floraslug: {
    id: 'species_floraslug',
    name: 'Floraslug',
    subtitle: 'Spore Slug',
    type: 'Grass',
    rarity: 'Common',
    baseStats: { hp: 60, attack: 44, defense: 52, speed: 30 },
    learnableMoveIds: ['vine_whip', 'tackle', 'spore_blast'],
    spriteKey: 'floraslug',
  },
  species_voltkit: {
    id: 'species_voltkit',
    name: 'Voltkit',
    subtitle: 'Spark Rodent',
    type: 'Electric',
    rarity: 'Uncommon',
    baseStats: { hp: 42, attack: 56, defense: 38, speed: 68 },
    learnableMoveIds: ['spark_claw', 'quick_strike', 'thunder_jolt'],
    spriteKey: 'voltkit',
  },
  // Official Pokémon Species (linked to PokéAPI reference IDs)
  species_pikachu: {
    id: 'species_pikachu',
    name: 'Pikachu',
    subtitle: 'Mouse Pokémon',
    type: 'Electric',
    rarity: 'Rare',
    baseStats: { hp: 45, attack: 55, defense: 40, speed: 90 },
    learnableMoveIds: ['spark_claw', 'quick_strike', 'thunder_jolt'],
    spriteKey: 'pikachu',
  },
  species_charizard: {
    id: 'species_charizard',
    name: 'Charizard',
    subtitle: 'Flame Pokémon',
    type: 'Fire',
    rarity: 'Legendary',
    baseStats: { hp: 78, attack: 84, defense: 78, speed: 100 },
    learnableMoveIds: ['flame_burst', 'fire_fang', 'tackle'],
    spriteKey: 'charizard',
  },
  species_blastoise: {
    id: 'species_blastoise',
    name: 'Blastoise',
    subtitle: 'Shellfish Pokémon',
    type: 'Water',
    rarity: 'Legendary',
    baseStats: { hp: 79, attack: 83, defense: 100, speed: 78 },
    learnableMoveIds: ['aqua_jet', 'bubble_beam', 'tackle'],
    spriteKey: 'blastoise',
  },
  species_venusaur: {
    id: 'species_venusaur',
    name: 'Venusaur',
    subtitle: 'Seed Pokémon',
    type: 'Grass',
    rarity: 'Legendary',
    baseStats: { hp: 80, attack: 82, defense: 83, speed: 80 },
    learnableMoveIds: ['vine_whip', 'spore_blast', 'tackle'],
    spriteKey: 'venusaur',
  },
  species_lucario: {
    id: 'species_lucario',
    name: 'Lucario',
    subtitle: 'Aura Pokémon',
    type: 'Normal',
    rarity: 'Rare',
    baseStats: { hp: 70, attack: 110, defense: 70, speed: 90 },
    learnableMoveIds: ['quick_strike', 'spark_claw', 'tackle'],
    spriteKey: 'lucario',
  },
  species_gengar: {
    id: 'species_gengar',
    name: 'Gengar',
    subtitle: 'Shadow Pokémon',
    type: 'Normal',
    rarity: 'Rare',
    baseStats: { hp: 60, attack: 65, defense: 60, speed: 110 },
    learnableMoveIds: ['thunder_jolt', 'spore_blast', 'tackle'],
    spriteKey: 'gengar',
  },
};

export const CARD_REGISTRY: Record<string, CardRegistryEntry> = {
  // Prototype Original Tags (Supports both aliases)
  'ML-CARD-IGNI-01': {
    cardCode: 'ML-CARD-IGNI-01',
    speciesId: 'species_ignisaur',
    name: 'Ignisaur Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-FIRE-001': {
    cardCode: 'ML-CARD-FIRE-001',
    speciesId: 'species_ignisaur',
    name: 'Ignisaur Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-AQUA-02': {
    cardCode: 'ML-CARD-AQUA-02',
    speciesId: 'species_aquabite',
    name: 'Aquabite Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-WATER-002': {
    cardCode: 'ML-CARD-WATER-002',
    speciesId: 'species_aquabite',
    name: 'Aquabite Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-FLOR-03': {
    cardCode: 'ML-CARD-FLOR-03',
    speciesId: 'species_floraslug',
    name: 'Floraslug Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-GRASS-003': {
    cardCode: 'ML-CARD-GRASS-003',
    speciesId: 'species_floraslug',
    name: 'Floraslug Tag',
    rarity: 'Common',
    source: 'Physical NFC Tag Pack 1',
    grade: '2-Star',
  },
  'ML-CARD-VOLT-04': {
    cardCode: 'ML-CARD-VOLT-04',
    speciesId: 'species_voltkit',
    name: 'Voltkit Tag',
    rarity: 'Uncommon',
    source: 'Physical NFC Tag Pack 1',
    grade: '3-Star',
  },
  'ML-CARD-ELEC-004': {
    cardCode: 'ML-CARD-ELEC-004',
    speciesId: 'species_voltkit',
    name: 'Voltkit Tag',
    rarity: 'Uncommon',
    source: 'Physical NFC Tag Pack 1',
    grade: '3-Star',
  },

  // Official Pokémon MEZASTAR NFC Tags (Canonical & Test codes)
  'ML-MEZASTAR-001': {
    cardCode: 'ML-MEZASTAR-001',
    speciesId: 'species_pikachu',
    name: 'Pikachu (5★ Z-Move)',
    rarity: 'Rare',
    source: 'Pokémon MEZASTAR Set 1',
    grade: '5-Star',
  },
  'MEZASTAR-01-001': {
    cardCode: 'MEZASTAR-01-001',
    speciesId: 'species_charizard',
    name: 'Charizard (6★ Superstar)',
    rarity: 'Legendary',
    source: 'Pokémon MEZASTAR Superstar Set 1',
    grade: '6-Star Superstar',
  },
  'ML-MEZASTAR-002': {
    cardCode: 'ML-MEZASTAR-002',
    speciesId: 'species_charizard',
    name: 'Charizard (6★ Superstar)',
    rarity: 'Legendary',
    source: 'Pokémon MEZASTAR Superstar Set 1',
    grade: '6-Star Superstar',
  },
  'MEZASTAR-01-003': {
    cardCode: 'MEZASTAR-01-003',
    speciesId: 'species_blastoise',
    name: 'Blastoise (6★ Superstar)',
    rarity: 'Legendary',
    source: 'Pokémon MEZASTAR Superstar Set 1',
    grade: '6-Star Superstar',
  },
  'ML-MEZASTAR-003': {
    cardCode: 'ML-MEZASTAR-003',
    speciesId: 'species_blastoise',
    name: 'Blastoise (6★ Superstar)',
    rarity: 'Legendary',
    source: 'Pokémon MEZASTAR Superstar Set 1',
    grade: '6-Star Superstar',
  },
  'ML-MEZASTAR-004': {
    cardCode: 'ML-MEZASTAR-004',
    speciesId: 'species_venusaur',
    name: 'Venusaur (6★ Superstar)',
    rarity: 'Legendary',
    source: 'Pokémon MEZASTAR Superstar Set 1',
    grade: '6-Star Superstar',
  },
  'ML-MEZASTAR-005': {
    cardCode: 'ML-MEZASTAR-005',
    speciesId: 'species_lucario',
    name: 'Lucario (5★ Mega Evolution)',
    rarity: 'Rare',
    source: 'Pokémon MEZASTAR Set 2',
    grade: '5-Star',
  },
  'ML-MEZASTAR-006': {
    cardCode: 'ML-MEZASTAR-006',
    speciesId: 'species_gengar',
    name: 'Gengar (4★ Star)',
    rarity: 'Rare',
    source: 'Pokémon MEZASTAR Set 2',
    grade: '4-Star',
  },
};

export function createCreatureInstance(
  speciesId: string,
  nfcCardCode: string | null = null,
  customNickname: string | null = null,
  level = 5
): CreatureInstance {
  const species = SPECIES_CATALOG[speciesId];
  if (!species) {
    throw new Error(`Unknown species ID: ${speciesId}`);
  }

  const lvl = Math.max(1, level);
  const hp = Math.floor(species.baseStats.hp + (lvl * 2.2));
  const attack = Math.floor(species.baseStats.attack + (lvl * 1.5));
  const defense = Math.floor(species.baseStats.defense + (lvl * 1.3));
  const speed = Math.floor(species.baseStats.speed + (lvl * 1.2));

  const instanceId = 'inst_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  return {
    instanceId,
    speciesId: species.id,
    nickname: customNickname || species.name,
    level: lvl,
    maxHp: hp,
    currentHp: hp,
    attack,
    defense,
    speed,
    knownMoveIds: [...species.learnableMoveIds],
    nfcCardCode,
    acquiredTimestampUtc: new Date().toISOString(),
  };
}
