import { ElementType, MoveDefinition, CreatureSpecies, CreatureInstance } from '@/types/creature';
import { CardRegistryEntry } from '@/types/nfc';
import monsterDatabaseJson from './monster-database.json';
import { PokemonSpeciesRecord, PokemonDatabaseManifest } from '@/types/pokemon';

export const MOVES_CATALOG: Record<string, MoveDefinition> = {
  // Fire
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
  flamethrower: {
    id: 'flamethrower',
    name: 'Flamethrower',
    type: 'Fire',
    power: 85,
    accuracy: 100,
    description: 'Scorches the foe with an intense blast of fire.',
  },

  // Water
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
  hydro_pump: {
    id: 'hydro_pump',
    name: 'Hydro Pump',
    type: 'Water',
    power: 85,
    accuracy: 90,
    description: 'Blasts a high-volume column of water at tremendous force.',
  },

  // Grass
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
  wood_hammer: {
    id: 'wood_hammer',
    name: 'Wood Hammer',
    type: 'Grass',
    power: 80,
    accuracy: 100,
    description: 'Slams the target with a heavy, enchanted log.',
  },

  // Electric
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
    power: 65,
    accuracy: 95,
    description: 'Unleashes a concentrated blast of lightning.',
  },
  wild_charge: {
    id: 'wild_charge',
    name: 'Wild Charge',
    type: 'Electric',
    power: 80,
    accuracy: 100,
    description: 'Shrouds itself in electricity and charges into the foe.',
  },

  // Ghost
  shadow_sneak: {
    id: 'shadow_sneak',
    name: 'Shadow Sneak',
    type: 'Ghost',
    power: 40,
    accuracy: 100,
    description: 'Extends its shadow to strike from behind.',
  },
  night_shade: {
    id: 'night_shade',
    name: 'Night Shade',
    type: 'Ghost',
    power: 60,
    accuracy: 100,
    description: 'Creates an illusion of mirage shadows.',
  },

  // Rock
  rock_throw: {
    id: 'rock_throw',
    name: 'Rock Throw',
    type: 'Rock',
    power: 50,
    accuracy: 90,
    description: 'Hurls small boulders at the target.',
  },
  stone_edge: {
    id: 'stone_edge',
    name: 'Stone Edge',
    type: 'Rock',
    power: 80,
    accuracy: 90,
    description: 'Stabs the target from below with sharp stones.',
  },

  // Ice
  ice_shard: {
    id: 'ice_shard',
    name: 'Ice Shard',
    type: 'Ice',
    power: 40,
    accuracy: 100,
    description: 'Hurls flash-frozen shards of ice at high speed.',
  },
  frost_breath: {
    id: 'frost_breath',
    name: 'Frost Breath',
    type: 'Ice',
    power: 60,
    accuracy: 100,
    description: 'Blows freezing breath that chills the opponent.',
  },
  blizzard: {
    id: 'blizzard',
    name: 'Blizzard',
    type: 'Ice',
    power: 85,
    accuracy: 85,
    description: 'Summons a raging blizzard of howling snow.',
  },

  // Flying
  gust: {
    id: 'gust',
    name: 'Gust',
    type: 'Flying',
    power: 40,
    accuracy: 100,
    description: 'Flaps wings to whip up a whirlwind.',
  },
  air_slash: {
    id: 'air_slash',
    name: 'Air Slash',
    type: 'Flying',
    power: 70,
    accuracy: 95,
    description: 'Attacks with a blade of air that slices the sky.',
  },

  // Fairy
  fairy_wind: {
    id: 'fairy_wind',
    name: 'Fairy Wind',
    type: 'Fairy',
    power: 45,
    accuracy: 100,
    description: 'Stirs up a mystical wind full of fairy dust.',
  },
  dazzling_gleam: {
    id: 'dazzling_gleam',
    name: 'Dazzling Gleam',
    type: 'Fairy',
    power: 75,
    accuracy: 100,
    description: 'Emits a powerful flash of dazzling starlight.',
  },

  // Steel
  flash_cannon: {
    id: 'flash_cannon',
    name: 'Flash Cannon',
    type: 'Steel',
    power: 75,
    accuracy: 100,
    description: 'Gathers light energy and releases a steel beam.',
  },
  iron_head: {
    id: 'iron_head',
    name: 'Iron Head',
    type: 'Steel',
    power: 75,
    accuracy: 100,
    description: 'Slams the foe with a steel-hardened headbutt.',
  },

  // Ground
  mud_slap: {
    id: 'mud_slap',
    name: 'Mud Slap',
    type: 'Ground',
    power: 35,
    accuracy: 100,
    description: 'Hurls mud into the foe’s eyes to obscure vision.',
  },
  earthquake: {
    id: 'earthquake',
    name: 'Earthquake',
    type: 'Ground',
    power: 85,
    accuracy: 100,
    description: 'Sets off an intense tremor that shakes the ground.',
  },

  // Dark
  bite: {
    id: 'bite',
    name: 'Bite',
    type: 'Dark',
    power: 60,
    accuracy: 100,
    description: 'Bites with vicious, shadow-infused jaws.',
  },
  dark_pulse: {
    id: 'dark_pulse',
    name: 'Dark Pulse',
    type: 'Dark',
    power: 75,
    accuracy: 100,
    description: 'Releases a horrible aura imbued with dark thoughts.',
  },

  // Dragon
  dragon_breath: {
    id: 'dragon_breath',
    name: 'Dragon Breath',
    type: 'Dragon',
    power: 60,
    accuracy: 100,
    description: 'Exhales an ionized dragon breath of raw power.',
  },
  dragon_claw: {
    id: 'dragon_claw',
    name: 'Dragon Claw',
    type: 'Dragon',
    power: 80,
    accuracy: 100,
    description: 'Slashes with sharp, ancient draconic talons.',
  },

  // Poison
  poison_sting: {
    id: 'poison_sting',
    name: 'Poison Sting',
    type: 'Poison',
    power: 40,
    accuracy: 100,
    description: 'Shoots a toxic barb that stings the foe.',
  },
  sludge_wave: {
    id: 'sludge_wave',
    name: 'Sludge Wave',
    type: 'Poison',
    power: 80,
    accuracy: 100,
    description: 'Swamps the battlefield in a wave of toxic sludge.',
  },

  // Normal
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

export const SPECIES_CATALOG: Record<string, CreatureSpecies> = {};
export const CARD_REGISTRY: Record<string, CardRegistryEntry> = {};

// Helper to pick moves matching element type
function getDefaultMovesForType(type: ElementType): string[] {
  switch (type) {
    case 'Fire': return ['flame_burst', 'fire_fang', 'tackle'];
    case 'Water': return ['aqua_jet', 'bubble_beam', 'tackle'];
    case 'Grass': return ['vine_whip', 'spore_blast', 'tackle'];
    case 'Electric': return ['spark_claw', 'thunder_jolt', 'tackle'];
    case 'Ghost': return ['shadow_sneak', 'night_shade', 'tackle'];
    case 'Rock': return ['rock_throw', 'stone_edge', 'tackle'];
    case 'Ice': return ['ice_shard', 'frost_breath', 'tackle'];
    case 'Flying': return ['gust', 'air_slash', 'tackle'];
    case 'Fairy': return ['fairy_wind', 'dazzling_gleam', 'tackle'];
    case 'Steel': return ['flash_cannon', 'iron_head', 'tackle'];
    case 'Ground': return ['mud_slap', 'earthquake', 'tackle'];
    case 'Dark': return ['bite', 'dark_pulse', 'tackle'];
    case 'Dragon': return ['dragon_claw', 'dragon_breath', 'tackle'];
    case 'Poison': return ['poison_sting', 'sludge_wave', 'tackle'];
    default: return ['quick_strike', 'tackle'];
  }
}

// Pre-load all 50 original monsters from database
const manifest = monsterDatabaseJson as unknown as PokemonDatabaseManifest;
if (manifest && manifest.pokemon) {
  for (const m of manifest.pokemon) {
    const elType = (m.primaryType || 'Normal') as ElementType;
    const isApex = m.pokedexNumber >= 41 || m.pokedexNumber % 10 === 0;
    const rarity = isApex ? 'Legendary' : (m.pokedexNumber % 4 === 0 ? 'Rare' : 'Common');

    const species: CreatureSpecies = {
      id: m.speciesId,
      name: m.displayName,
      subtitle: m.genus || `${m.displayName} Monster`,
      type: elType,
      rarity,
      baseStats: {
        hp: m.baseStats.hp,
        attack: m.baseStats.attack,
        defense: m.baseStats.defense,
        speed: m.baseStats.speed,
      },
      learnableMoveIds: getDefaultMovesForType(elType),
      spriteKey: m.name,
    };

    SPECIES_CATALOG[m.speciesId] = species;

    // Register canonical NTAG215 cards (ML-0001 to ML-0050)
    const canonicalCardCode = `ML-${String(m.pokedexNumber).padStart(4, '0')}`;
    const cardEntry: CardRegistryEntry = {
      cardCode: canonicalCardCode,
      speciesId: m.speciesId,
      name: `${m.displayName} Tag`,
      rarity,
      source: 'Physical NTAG215 Monster Tag',
      grade: isApex ? '6-Star Superstar' : '5-Star',
    };

    CARD_REGISTRY[canonicalCardCode] = cardEntry;
    CARD_REGISTRY[`ML-${m.pokedexNumber}`] = cardEntry;
    CARD_REGISTRY[`ML-MONSTER-${String(m.pokedexNumber).padStart(3, '0')}`] = cardEntry;
  }
}

// Starter / Legacy Aliases so previous save states and tests don't fail
if (SPECIES_CATALOG['species_flamby']) {
  SPECIES_CATALOG['species_ignisaur'] = { ...SPECIES_CATALOG['species_flamby'], id: 'species_ignisaur', name: 'Ignisaur' };
  CARD_REGISTRY['ML-CARD-IGNI-01'] = { cardCode: 'ML-CARD-IGNI-01', speciesId: 'species_ignisaur', name: 'Ignisaur Tag', rarity: 'Common', source: 'Legacy Pack', grade: '2-Star' };
  CARD_REGISTRY['ML-CARD-FIRE-001'] = CARD_REGISTRY['ML-CARD-IGNI-01'];
}
if (SPECIES_CATALOG['species_aquat']) {
  SPECIES_CATALOG['species_aquabite'] = { ...SPECIES_CATALOG['species_aquat'], id: 'species_aquabite', name: 'Aquabite' };
  CARD_REGISTRY['ML-CARD-AQUA-02'] = { cardCode: 'ML-CARD-AQUA-02', speciesId: 'species_aquabite', name: 'Aquabite Tag', rarity: 'Common', source: 'Legacy Pack', grade: '2-Star' };
  CARD_REGISTRY['ML-CARD-WATER-002'] = CARD_REGISTRY['ML-CARD-AQUA-02'];
}
if (SPECIES_CATALOG['species_leafy']) {
  SPECIES_CATALOG['species_floraslug'] = { ...SPECIES_CATALOG['species_leafy'], id: 'species_floraslug', name: 'Floraslug' };
  CARD_REGISTRY['ML-CARD-FLOR-03'] = { cardCode: 'ML-CARD-FLOR-03', speciesId: 'species_floraslug', name: 'Floraslug Tag', rarity: 'Common', source: 'Legacy Pack', grade: '2-Star' };
  CARD_REGISTRY['ML-CARD-GRASS-003'] = CARD_REGISTRY['ML-CARD-FLOR-03'];
}
if (SPECIES_CATALOG['species_sparki']) {
  SPECIES_CATALOG['species_voltkit'] = { ...SPECIES_CATALOG['species_sparki'], id: 'species_voltkit', name: 'Voltkit' };
  CARD_REGISTRY['ML-CARD-VOLT-04'] = { cardCode: 'ML-CARD-VOLT-04', speciesId: 'species_voltkit', name: 'Voltkit Tag', rarity: 'Uncommon', source: 'Legacy Pack', grade: '3-Star' };
  CARD_REGISTRY['ML-CARD-ELEC-004'] = CARD_REGISTRY['ML-CARD-VOLT-04'];
}

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

import { getPokemonByPokedexNumber } from './pokemon-service';

/**
 * Ensures any monster species has a combat species definition
 */
export function ensureSpeciesRegistered(pkmn: PokemonSpeciesRecord): CreatureSpecies {
  const speciesId = `species_${pkmn.name.toLowerCase()}`;
  if (SPECIES_CATALOG[speciesId]) {
    return SPECIES_CATALOG[speciesId];
  }

  const elType = (pkmn.primaryType || 'Normal') as ElementType;
  const isApex = pkmn.pokedexNumber >= 41;

  const species: CreatureSpecies = {
    id: speciesId,
    name: pkmn.displayName,
    subtitle: pkmn.genus || `${pkmn.displayName} Monster`,
    type: elType,
    rarity: isApex ? 'Legendary' : (pkmn.pokedexNumber % 4 === 0 ? 'Rare' : 'Common'),
    baseStats: {
      hp: pkmn.baseStats.hp,
      attack: pkmn.baseStats.attack,
      defense: pkmn.baseStats.defense,
      speed: pkmn.baseStats.speed,
    },
    learnableMoveIds: getDefaultMovesForType(elType),
    spriteKey: pkmn.name.toLowerCase(),
  };

  SPECIES_CATALOG[speciesId] = species;
  return species;
}

/**
 * Resolves any NFC card code against the static registry or dynamically against the Monster database.
 * Supports:
 * - Direct codes: ML-0001 through ML-0050
 * - Aliases: ML-1, ML-01, ML-001, ML-CARD-0001, ML-PKMN-0001, etc.
 */
export function resolveCardRegistryEntry(cardCode: string): CardRegistryEntry | null {
  if (!cardCode) return null;
  const clean = cardCode.trim().toUpperCase();

  // 1. Direct match
  if (CARD_REGISTRY[clean]) {
    return CARD_REGISTRY[clean];
  }

  // 2. Case-insensitive search in CARD_REGISTRY
  for (const [key, val] of Object.entries(CARD_REGISTRY)) {
    if (key.toUpperCase() === clean) return val;
  }

  // 3. Numbered Monster Pattern: ML-0001 to ML-0050, ML-PKMN-0001, etc.
  const dexMatch = clean.match(/^ML-(?:MONSTER-|PKMN-|CARD-)?(\d{1,4})$/);
  if (dexMatch) {
    const dexNum = parseInt(dexMatch[1], 10);
    const pkmn = getPokemonByPokedexNumber(dexNum);
    if (pkmn) {
      ensureSpeciesRegistered(pkmn);
      const isApex = pkmn.pokedexNumber >= 41;
      const entry: CardRegistryEntry = {
        cardCode: clean,
        speciesId: `species_${pkmn.name.toLowerCase()}`,
        name: `${pkmn.displayName} Tag`,
        rarity: isApex ? 'Legendary' : (pkmn.pokedexNumber % 4 === 0 ? 'Rare' : 'Common'),
        source: 'Programmed NTAG215 Card',
        grade: isApex ? '6-Star Superstar' : '5-Star',
      };
      CARD_REGISTRY[clean] = entry;
      return entry;
    }
  }

  return null;
}
