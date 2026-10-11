// MonsterLink Domain Models & Creature Catalog
// Mirrors exact C# models defined in docs/TECHNICAL_DECISIONS.md

export const ElementType = {
  Fire: 'Fire',
  Water: 'Water',
  Grass: 'Grass',
  Electric: 'Electric',
  Normal: 'Normal'
};

export const RarityTier = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
  Legendary: 'Legendary'
};

// Type Effectiveness Matrix (matching docs/TECHNICAL_DECISIONS.md)
export const TYPE_CHART = {
  Fire: { Fire: 1.0, Water: 0.5, Grass: 2.0, Electric: 1.0, Normal: 1.0 },
  Water: { Fire: 2.0, Water: 1.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
  Electric: { Fire: 1.0, Water: 2.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Normal: { Fire: 1.0, Water: 1.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 }
};

export function getTypeMultiplier(attackerType, defenderType) {
  if (TYPE_CHART[attackerType] && TYPE_CHART[attackerType][defenderType] !== undefined) {
    return TYPE_CHART[attackerType][defenderType];
  }
  return 1.0;
}

// Move definitions catalog
export const MOVES = {
  // Fire Moves
  flame_burst: {
    id: 'flame_burst',
    name: 'Flame Burst',
    type: ElementType.Fire,
    power: 45,
    accuracy: 100,
    description: 'Shoots a burst of scorching embers at the target.'
  },
  fire_fang: {
    id: 'fire_fang',
    name: 'Fire Fang',
    type: ElementType.Fire,
    power: 60,
    accuracy: 95,
    description: 'Bites with burning fangs imbued with fire.'
  },

  // Water Moves
  aqua_jet: {
    id: 'aqua_jet',
    name: 'Aqua Jet',
    type: ElementType.Water,
    power: 40,
    accuracy: 100,
    description: 'Strikes quickly like a high-speed torrent.'
  },
  bubble_beam: {
    id: 'bubble_beam',
    name: 'Bubble Beam',
    type: ElementType.Water,
    power: 60,
    accuracy: 100,
    description: 'Sprays pressurized bubbles that blast the foe.'
  },

  // Grass Moves
  vine_whip: {
    id: 'vine_whip',
    name: 'Vine Whip',
    type: ElementType.Grass,
    power: 45,
    accuracy: 100,
    description: 'Strikes the target with slender, stinging vines.'
  },
  spore_blast: {
    id: 'spore_blast',
    name: 'Spore Blast',
    type: ElementType.Grass,
    power: 55,
    accuracy: 95,
    description: 'Explodes a pouch of prickly pollen spores.'
  },

  // Electric Moves
  spark_claw: {
    id: 'spark_claw',
    name: 'Spark Claw',
    type: ElementType.Electric,
    power: 45,
    accuracy: 100,
    description: 'Slashes with claws energized with crackling voltage.'
  },
  thunder_jolt: {
    id: 'thunder_jolt',
    name: 'Thunder Jolt',
    type: ElementType.Electric,
    power: 60,
    accuracy: 95,
    description: 'Unleashes a concentrated blast of lightning.'
  },

  // Normal Moves
  tackle: {
    id: 'tackle',
    name: 'Tackle',
    type: ElementType.Normal,
    power: 35,
    accuracy: 100,
    description: 'A full-body charge that strikes the opponent.'
  },
  quick_strike: {
    id: 'quick_strike',
    name: 'Quick Strike',
    type: ElementType.Normal,
    power: 40,
    accuracy: 100,
    description: 'A swift, agile strike delivered before the foe reacts.'
  }
};

// Species definitions (immutable catalogs)
export const SPECIES_CATALOG = {
  species_ignisaur: {
    id: 'species_ignisaur',
    name: 'Ignisaur',
    speciesTitle: 'Ember Reptile',
    type: ElementType.Fire,
    rarity: RarityTier.Common,
    spriteKey: 'ignisaur',
    colorTheme: '#E25822',
    baseStats: {
      hp: 48,
      attack: 52,
      defense: 43,
      speed: 55
    },
    knownMoveIds: ['flame_burst', 'tackle', 'fire_fang']
  },
  species_aquabite: {
    id: 'species_aquabite',
    name: 'Aquabite',
    speciesTitle: 'Coral Crab',
    type: ElementType.Water,
    rarity: RarityTier.Common,
    spriteKey: 'aquabite',
    colorTheme: '#2980B9',
    baseStats: {
      hp: 55,
      attack: 46,
      defense: 60,
      speed: 38
    },
    knownMoveIds: ['aqua_jet', 'tackle', 'bubble_beam']
  },
  species_floraslug: {
    id: 'species_floraslug',
    name: 'Floraslug',
    speciesTitle: 'Spore Slug',
    type: ElementType.Grass,
    rarity: RarityTier.Common,
    spriteKey: 'floraslug',
    colorTheme: '#27AE60',
    baseStats: {
      hp: 60,
      attack: 44,
      defense: 52,
      speed: 30
    },
    knownMoveIds: ['vine_whip', 'tackle', 'spore_blast']
  },
  species_voltkit: {
    id: 'species_voltkit',
    name: 'Voltkit',
    speciesTitle: 'Spark Rodent',
    type: ElementType.Electric,
    rarity: RarityTier.Uncommon,
    spriteKey: 'voltkit',
    colorTheme: '#F4D03F',
    baseStats: {
      hp: 42,
      attack: 56,
      defense: 38,
      speed: 68
    },
    knownMoveIds: ['spark_claw', 'quick_strike', 'thunder_jolt']
  }
};

// Prototype Card Code Registry mapping NFC codes to Species
export const CARD_REGISTRY = {
  'ML-CARD-IGNI-01': {
    speciesId: 'species_ignisaur',
    cardName: 'Ignisaur Alpha',
    batch: 'Gen 1 Beta Card'
  },
  'ML-CARD-AQUA-02': {
    speciesId: 'species_aquabite',
    cardName: 'Aquabite Tide',
    batch: 'Gen 1 Beta Card'
  },
  'ML-CARD-FLOR-03': {
    speciesId: 'species_floraslug',
    cardName: 'Floraslug Bloom',
    batch: 'Gen 1 Beta Card'
  },
  'ML-CARD-VOLT-04': {
    speciesId: 'species_voltkit',
    cardName: 'Voltkit Bolt',
    batch: 'Gen 1 Beta Card'
  }
};

// Factory: instantiate a unique creature entity from species definition
export function createCreatureInstance(speciesId, nfcTagCode = null, customNickname = null, level = 5) {
  const species = SPECIES_CATALOG[speciesId];
  if (!species) {
    throw new Error(`Species '${speciesId}' not found in catalog.`);
  }

  // Stat scaling by level
  const maxHp = Math.floor((species.baseStats.hp * 2 * level) / 100) + level + 10;
  const attack = Math.floor((species.baseStats.attack * 2 * level) / 100) + 5;
  const defense = Math.floor((species.baseStats.defense * 2 * level) / 100) + 5;
  const speed = Math.floor((species.baseStats.speed * 2 * level) / 100) + 5;

  return {
    instanceId: 'inst_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    speciesId: species.id,
    nickname: customNickname || species.name,
    level: level,
    currentHp: maxHp,
    maxHp: maxHp,
    attack: attack,
    defense: defense,
    speed: speed,
    knownMoveIds: [...species.knownMoveIds],
    nfcTagCode: nfcTagCode,
    acquiredTimestampUtc: new Date().toISOString()
  };
}
