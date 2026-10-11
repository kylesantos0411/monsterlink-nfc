
// MONSTERLINK BUNDLED RUNTIME
(function() {
// MonsterLink Pixel Art Sprite SVG Generators
// Pure vector pixel-art sprites rendered crisp at any scale

const SPRITES = {
  // Fire Reptile: Ignisaur
  ignisaur: `
    <svg viewBox="0 0 32 32" class="pixel-sprite" xmlns="http://www.w3.org/2000/svg">
      <!-- Body & Tail Base -->
      <rect x="12" y="14" width="10" height="12" fill="#E25822" />
      <rect x="10" y="16" width="14" height="8" fill="#E25822" />
      <rect x="14" y="24" width="6" height="4" fill="#B33908" />
      <!-- Belly -->
      <rect x="13" y="17" width="6" height="7" fill="#F8B838" />
      <rect x="14" y="16" width="4" height="8" fill="#F8E060" />
      <!-- Head -->
      <rect x="14" y="6" width="12" height="10" fill="#E25822" />
      <rect x="12" y="8" width="15" height="7" fill="#E25822" />
      <rect x="10" y="10" width="4" height="4" fill="#E25822" />
      <!-- Snout -->
      <rect x="23" y="10" width="5" height="4" fill="#F07038" />
      <rect x="26" y="9" width="1" height="1" fill="#201010" />
      <!-- Eye -->
      <rect x="18" y="8" width="3" height="4" fill="#FFFFFF" />
      <rect x="19" y="9" width="2" height="3" fill="#1C5CE5" />
      <rect x="20" y="9" width="1" height="1" fill="#FFFFFF" />
      <!-- Back Spikes -->
      <rect x="10" y="13" width="2" height="3" fill="#F8B838" />
      <rect x="8" y="17" width="2" height="3" fill="#F8B838" />
      <!-- Tail & Flame -->
      <rect x="6" y="20" width="5" height="4" fill="#E25822" />
      <rect x="4" y="18" width="4" height="3" fill="#E25822" />
      <!-- Tail Fire -->
      <rect x="2" y="15" width="4" height="5" fill="#E25822" />
      <rect x="2" y="13" width="3" height="4" fill="#F8B838" />
      <rect x="3" y="12" width="2" height="3" fill="#FFF275" />
      <rect x="1" y="15" width="2" height="2" fill="#E25822" />
      <!-- Feet -->
      <rect x="12" y="27" width="4" height="3" fill="#B33908" />
      <rect x="19" y="27" width="4" height="3" fill="#B33908" />
      <rect x="11" y="29" width="1" height="1" fill="#FFFFFF" />
      <rect x="18" y="29" width="1" height="1" fill="#FFFFFF" />
    </svg>
  `,

  // Water Coral Crab: Aquabite
  aquabite: `
    <svg viewBox="0 0 32 32" class="pixel-sprite" xmlns="http://www.w3.org/2000/svg">
      <!-- Shell Body -->
      <rect x="8" y="14" width="16" height="10" fill="#2980B9" />
      <rect x="10" y="12" width="12" height="13" fill="#3498DB" />
      <rect x="12" y="16" width="8" height="6" fill="#A9CCE3" />
      <!-- Coral Horns / Armor -->
      <rect x="11" y="8" width="3" height="5" fill="#E74C3C" />
      <rect x="18" y="8" width="3" height="5" fill="#E74C3C" />
      <rect x="10" y="7" width="2" height="2" fill="#F39C12" />
      <rect x="20" y="7" width="2" height="2" fill="#F39C12" />
      <!-- Eyes on stalks -->
      <rect x="11" y="10" width="3" height="3" fill="#FFFFFF" />
      <rect x="12" y="11" width="2" height="2" fill="#1B2631" />
      <rect x="18" y="10" width="3" height="3" fill="#FFFFFF" />
      <rect x="18" y="11" width="2" height="2" fill="#1B2631" />
      <!-- Left Claw -->
      <rect x="3" y="13" width="5" height="5" fill="#E74C3C" />
      <rect x="2" y="11" width="3" height="4" fill="#C0392B" />
      <rect x="5" y="10" width="2" height="3" fill="#F39C12" />
      <rect x="7" y="16" width="3" height="3" fill="#2980B9" />
      <!-- Right Claw -->
      <rect x="24" y="13" width="5" height="5" fill="#E74C3C" />
      <rect x="27" y="11" width="3" height="4" fill="#C0392B" />
      <rect x="25" y="10" width="2" height="3" fill="#F39C12" />
      <rect x="22" y="16" width="3" height="3" fill="#2980B9" />
      <!-- Crab Legs -->
      <rect x="8" y="24" width="3" height="4" fill="#1F618D" />
      <rect x="13" y="24" width="3" height="4" fill="#1F618D" />
      <rect x="16" y="24" width="3" height="4" fill="#1F618D" />
      <rect x="21" y="24" width="3" height="4" fill="#1F618D" />
    </svg>
  `,

  // Grass Moss Slug: Floraslug
  floraslug: `
    <svg viewBox="0 0 32 32" class="pixel-sprite" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="6" y="20" width="20" height="7" fill="#27AE60" />
      <rect x="8" y="18" width="16" height="9" fill="#2ECC71" />
      <rect x="5" y="24" width="22" height="3" fill="#1E8449" />
      <!-- Spore Shell / Bulb -->
      <rect x="7" y="12" width="11" height="9" fill="#F39C12" />
      <rect x="9" y="10" width="7" height="11" fill="#F1C40F" />
      <rect x="11" y="13" width="3" height="4" fill="#D35400" />
      <rect x="8" y="15" width="2" height="2" fill="#D35400" />
      <!-- Flower on bulb -->
      <rect x="11" y="7" width="3" height="3" fill="#E91E63" />
      <rect x="9" y="8" width="2" height="2" fill="#FF80AB" />
      <rect x="14" y="8" width="2" height="2" fill="#FF80AB" />
      <!-- Head -->
      <rect x="19" y="14" width="8" height="9" fill="#2ECC71" />
      <!-- Eyestalks -->
      <rect x="21" y="9" width="2" height="6" fill="#27AE60" />
      <rect x="25" y="9" width="2" height="6" fill="#27AE60" />
      <rect x="20" y="8" width="3" height="3" fill="#FFFFFF" />
      <rect x="21" y="9" width="2" height="2" fill="#145A32" />
      <rect x="25" y="8" width="3" height="3" fill="#FFFFFF" />
      <rect x="25" y="9" width="2" height="2" fill="#145A32" />
      <!-- Cute Smile -->
      <rect x="24" y="19" width="3" height="1" fill="#145A32" />
      <rect x="21" y="18" width="2" height="2" fill="#FF8A80" opacity="0.6" />
    </svg>
  `,

  // Electric Rodent: Voltkit
  voltkit: `
    <svg viewBox="0 0 32 32" class="pixel-sprite" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="11" y="15" width="10" height="11" fill="#F4D03F" />
      <rect x="9" y="17" width="13" height="8" fill="#F4D03F" />
      <rect x="12" y="18" width="7" height="6" fill="#FCF3CF" />
      <!-- Head -->
      <rect x="10" y="8" width="12" height="9" fill="#F4D03F" />
      <rect x="9" y="10" width="14" height="6" fill="#F4D03F" />
      <!-- Big Fox Ears with Electric Tips -->
      <rect x="8" y="2" width="4" height="7" fill="#F4D03F" />
      <rect x="8" y="1" width="3" height="3" fill="#17202A" />
      <rect x="20" y="2" width="4" height="7" fill="#F4D03F" />
      <rect x="21" y="1" width="3" height="3" fill="#17202A" />
      <!-- Eyes -->
      <rect x="11" y="11" width="3" height="4" fill="#1C2833" />
      <rect x="12" y="11" width="1" height="2" fill="#FFFFFF" />
      <rect x="18" y="11" width="3" height="4" fill="#1C2833" />
      <rect x="18" y="11" width="1" height="2" fill="#FFFFFF" />
      <!-- Cheeks (Spark Orbs) -->
      <rect x="9" y="14" width="3" height="2" fill="#E74C3C" />
      <rect x="20" y="14" width="3" height="2" fill="#E74C3C" />
      <!-- Nose & Mouth -->
      <rect x="15" y="13" width="2" height="1" fill="#1C2833" />
      <!-- Lightning Tail -->
      <rect x="4" y="14" width="4" height="3" fill="#F4D03F" />
      <rect x="6" y="17" width="4" height="2" fill="#F4D03F" />
      <rect x="2" y="10" width="3" height="6" fill="#F39C12" />
      <rect x="3" y="8" width="4" height="3" fill="#F4D03F" />
      <!-- Paws -->
      <rect x="11" y="25" width="3" height="2" fill="#D4AC0D" />
      <rect x="17" y="25" width="3" height="2" fill="#D4AC0D" />
    </svg>
  `
};


// MonsterLink Domain Models & Creature Catalog
// Mirrors exact C# models defined in docs/TECHNICAL_DECISIONS.md

const ElementType = {
  Fire: 'Fire',
  Water: 'Water',
  Grass: 'Grass',
  Electric: 'Electric',
  Normal: 'Normal'
};

const RarityTier = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
  Legendary: 'Legendary'
};

// Type Effectiveness Matrix (matching docs/TECHNICAL_DECISIONS.md)
const TYPE_CHART = {
  Fire: { Fire: 1.0, Water: 0.5, Grass: 2.0, Electric: 1.0, Normal: 1.0 },
  Water: { Fire: 2.0, Water: 1.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
  Electric: { Fire: 1.0, Water: 2.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Normal: { Fire: 1.0, Water: 1.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 }
};

function getTypeMultiplier(attackerType, defenderType) {
  if (TYPE_CHART[attackerType] && TYPE_CHART[attackerType][defenderType] !== undefined) {
    return TYPE_CHART[attackerType][defenderType];
  }
  return 1.0;
}

// Move definitions catalog
const MOVES = {
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
const SPECIES_CATALOG = {
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
const CARD_REGISTRY = {
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
function createCreatureInstance(speciesId, nfcTagCode = null, customNickname = null, level = 5) {
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


// MonsterLink 8-Bit Web Audio Synthesizer
// Generates authentic retro chiptune SFX without external audio files

class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // UI Click / Navigation Blip
  playClick() {
    this.playTone(520, 'square', 0.06, 0.1);
  }

  // NFC Scan success chime
  playScanSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [392, 523, 659, 784]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.15);
      }, idx * 70);
    });
  }

  // Duplicate / Error buzzer
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.playTone(180, 'sawtooth', 0.18, 0.2);
    setTimeout(() => {
      this.playTone(140, 'sawtooth', 0.25, 0.2);
    }, 120);
  }

  // Battle: Physical attack impact
  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      // White noise burst for impact
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Battle: Super Effective strike
  playSuperEffective() {
    this.playHit();
    setTimeout(() => {
      this.playTone(880, 'square', 0.15, 0.18);
    }, 50);
  }

  // Battle: Creature Faint
  playFaint() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [440, 370, 311, 220, 155];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.18, 0.15);
      }, idx * 100);
    });
  }

  // Battle: Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 523, d: 0.12 }, // C
      { f: 523, d: 0.12 },
      { f: 523, d: 0.12 },
      { f: 523, d: 0.30 },
      { f: 415, d: 0.30 }, // G#
      { f: 466, d: 0.30 }, // A#
      { f: 523, d: 0.50 }  // C
    ];

    let delay = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.2);
      }, delay);
      delay += (note.d + 0.05) * 1000;
    });
  }
}

const Sound = new SoundController();


// MonsterLink Local Storage Manager
// Mirrors the JSON persistence layer in docs/TECHNICAL_DECISIONS.md

const SCHEMA_VERSION = 1;

const KEYS = {
  COLLECTION: 'monsterlink_collection',
  REGISTERED_CARDS: 'monsterlink_registered_cards',
  BATTLE_HISTORY: 'monsterlink_battle_history',
  SETTINGS: 'monsterlink_settings'
};

function wrapPayload(data) {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastModifiedUtc: new Date().toISOString(),
    data: data
  };
}

function unwrapPayload(rawJson, defaultVal) {
  if (!rawJson) return defaultVal;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && parsed.data !== undefined) {
      return parsed.data;
    }
    return parsed;
  } catch (e) {
    console.error('Error parsing storage payload', e);
    return defaultVal;
  }
}

const Storage = {
  // Collection Operations
  getCollection() {
    const raw = localStorage.getItem(KEYS.COLLECTION);
    return unwrapPayload(raw, []);
  },

  saveCollection(creatures) {
    localStorage.setItem(KEYS.COLLECTION, JSON.stringify(wrapPayload(creatures)));
  },

  addCreature(creature) {
    const collection = this.getCollection();
    collection.push(creature);
    this.saveCollection(collection);
  },

  getCreatureById(instanceId) {
    const collection = this.getCollection();
    return collection.find(c => c.instanceId === instanceId) || null;
  },

  // Registered Cards Operations
  getRegisteredCards() {
    const raw = localStorage.getItem(KEYS.REGISTERED_CARDS);
    return unwrapPayload(raw, {}); // { [cardCode]: { instanceId, registeredAt } }
  },

  saveRegisteredCards(cardMap) {
    localStorage.setItem(KEYS.REGISTERED_CARDS, JSON.stringify(wrapPayload(cardMap)));
  },

  isCardRegistered(cardCode) {
    const cards = this.getRegisteredCards();
    return Boolean(cards[cardCode]);
  },

  registerCard(cardCode, instanceId) {
    const cards = this.getRegisteredCards();
    cards[cardCode] = {
      instanceId: instanceId,
      registeredAt: new Date().toISOString()
    };
    this.saveRegisteredCards(cards);
  },

  // Battle History Operations
  getBattleHistory() {
    const raw = localStorage.getItem(KEYS.BATTLE_HISTORY);
    return unwrapPayload(raw, []);
  },

  saveBattleRecord(record) {
    const history = this.getBattleHistory();
    history.unshift(record); // newest first
    localStorage.setItem(KEYS.BATTLE_HISTORY, JSON.stringify(wrapPayload(history)));
  },

  clearBattleHistory() {
    localStorage.removeItem(KEYS.BATTLE_HISTORY);
  },

  // Reset or Seed
  clearAll() {
    localStorage.removeItem(KEYS.COLLECTION);
    localStorage.removeItem(KEYS.REGISTERED_CARDS);
    localStorage.removeItem(KEYS.BATTLE_HISTORY);
  },

  exportDump() {
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      collection: this.getCollection(),
      registeredCards: this.getRegisteredCards(),
      battleHistory: this.getBattleHistory()
    };
  }
};


// MonsterLink Deterministic Battle Engine
// Pure combat logic implementing formulas from docs/TECHNICAL_DECISIONS.md



class BattleEngine {
  constructor(playerCreature, opponentCreature) {
    // Clone creatures so runtime HP changes don't mutate base objects immediately
    this.player = {
      ...playerCreature,
      currentHp: playerCreature.currentHp,
      species: SPECIES_CATALOG[playerCreature.speciesId]
    };
    this.opponent = {
      ...opponentCreature,
      currentHp: opponentCreature.currentHp,
      species: SPECIES_CATALOG[opponentCreature.speciesId]
    };

    this.turn = 1;
    this.isOver = false;
    this.winner = null; // 'player' | 'opponent'
    this.actionHistory = [];
    this.logs = [`Battle started between ${this.player.nickname} and ${this.opponent.nickname}!`];
  }

  // Exact deterministic formula from TECHNICAL_DECISIONS.md
  calculateDamage(attacker, defender, move) {
    const defenderSpecies = defender.species || SPECIES_CATALOG[defender.speciesId];
    const attackerSpecies = attacker.species || SPECIES_CATALOG[attacker.speciesId];
    const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;
    const statFactor = (move.power * attacker.attack) / (defender.defense * 50);
    const baseDamage = Math.floor(levelFactor * statFactor + 2);

    const typeMult = getTypeMultiplier(move.type, defenderSpecies ? defenderSpecies.type : 'Normal');
    const totalDamage = Math.max(1, Math.floor(baseDamage * typeMult));

    let effectiveness = 'normal';
    if (typeMult >= 2.0) effectiveness = 'super';
    else if (typeMult <= 0.5) effectiveness = 'weak';

    return {
      damage: totalDamage,
      typeMult: typeMult,
      effectiveness: effectiveness
    };
  }

  // Simple deterministic AI: chooses move with highest type effectiveness or power
  selectOpponentMove() {
    const knownMoves = this.opponent.knownMoveIds.map(id => MOVES[id]).filter(Boolean);
    if (knownMoves.length === 0) return MOVES.tackle;

    let bestMove = knownMoves[0];
    let bestScore = -1;

    for (const move of knownMoves) {
      const mult = getTypeMultiplier(move.type, this.player.species.type);
      const score = move.power * mult;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Executes a complete turn with speed ordering and faint short-circuit
  executeTurn(playerMoveId) {
    if (this.isOver) {
      return { isOver: true, winner: this.winner, steps: [] };
    }

    const playerMove = MOVES[playerMoveId] || MOVES.tackle;
    const opponentMove = this.selectOpponentMove();
    const steps = [];

    // Speed comparison: faster attacks first; tiebreaker goes to player
    const playerFirst = this.player.speed >= this.opponent.speed;

    const firstAction = playerFirst
      ? { actor: 'player', attacker: this.player, defender: this.opponent, move: playerMove }
      : { actor: 'opponent', attacker: this.opponent, defender: this.player, move: opponentMove };

    const secondAction = playerFirst
      ? { actor: 'opponent', attacker: this.opponent, defender: this.player, move: opponentMove }
      : { actor: 'player', attacker: this.player, defender: this.opponent, move: playerMove };

    // Step 1: First Attacker Action
    const res1 = this.calculateDamage(firstAction.attacker, firstAction.defender, firstAction.move);
    firstAction.defender.currentHp = Math.max(0, firstAction.defender.currentHp - res1.damage);

    const step1Log = `${firstAction.attacker.nickname} used ${firstAction.move.name}! Dealt ${res1.damage} damage.`;
    this.logs.push(step1Log);
    this.actionHistory.push({
      turn: this.turn,
      actor: firstAction.actor,
      move: firstAction.move.name,
      damage: res1.damage
    });

    steps.push({
      actor: firstAction.actor,
      attackerName: firstAction.attacker.nickname,
      defenderName: firstAction.defender.nickname,
      move: firstAction.move,
      damage: res1.damage,
      effectiveness: res1.effectiveness,
      defenderHp: firstAction.defender.currentHp,
      defenderMaxHp: firstAction.defender.maxHp,
      log: step1Log
    });

    // Check if defender fainted
    if (firstAction.defender.currentHp === 0) {
      this.isOver = true;
      this.winner = firstAction.actor;
      const faintLog = `${firstAction.defender.nickname} fainted!`;
      this.logs.push(faintLog);
      steps.push({
        type: 'faint',
        faintedActor: firstAction.actor === 'player' ? 'opponent' : 'player',
        faintedName: firstAction.defender.nickname,
        winner: this.winner,
        log: faintLog
      });
      return { isOver: true, winner: this.winner, steps: steps };
    }

    // Step 2: Second Attacker Action (only if still alive)
    const res2 = this.calculateDamage(secondAction.attacker, secondAction.defender, secondAction.move);
    secondAction.defender.currentHp = Math.max(0, secondAction.defender.currentHp - res2.damage);

    const step2Log = `${secondAction.attacker.nickname} used ${secondAction.move.name}! Dealt ${res2.damage} damage.`;
    this.logs.push(step2Log);
    this.actionHistory.push({
      turn: this.turn,
      actor: secondAction.actor,
      move: secondAction.move.name,
      damage: res2.damage
    });

    steps.push({
      actor: secondAction.actor,
      attackerName: secondAction.attacker.nickname,
      defenderName: secondAction.defender.nickname,
      move: secondAction.move,
      damage: res2.damage,
      effectiveness: res2.effectiveness,
      defenderHp: secondAction.defender.currentHp,
      defenderMaxHp: secondAction.defender.maxHp,
      log: step2Log
    });

    // Check if second defender fainted
    if (secondAction.defender.currentHp === 0) {
      this.isOver = true;
      this.winner = secondAction.actor;
      const faintLog = `${secondAction.defender.nickname} fainted!`;
      this.logs.push(faintLog);
      steps.push({
        type: 'faint',
        faintedActor: secondAction.actor === 'player' ? 'opponent' : 'player',
        faintedName: secondAction.defender.nickname,
        winner: this.winner,
        log: faintLog
      });
      return { isOver: true, winner: this.winner, steps: steps };
    }

    this.turn++;
    return { isOver: false, winner: null, steps: steps };
  }

  // Generates complete BattleRecord for persistence
  generateBattleRecord(originalPlayerHp, originalOpponentHp) {
    return {
      recordId: 'rec_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      timestampUtc: new Date().toISOString(),
      playerSummary: {
        instanceId: this.player.instanceId,
        speciesName: this.player.species.name,
        nickname: this.player.nickname,
        level: this.player.level,
        startHp: originalPlayerHp,
        endHp: this.player.currentHp,
        maxHp: this.player.maxHp
      },
      opponentSummary: {
        speciesName: this.opponent.species.name,
        nickname: this.opponent.nickname,
        level: this.opponent.level,
        startHp: originalOpponentHp,
        endHp: this.opponent.currentHp,
        maxHp: this.opponent.maxHp
      },
      turnsTaken: this.turn,
      outcome: this.winner === 'player' ? 'Victory' : 'Defeat',
      actionLog: this.actionHistory
    };
  }
}


// MonsterLink Application Controller & UI Wireframe
// Coordinates navigation, NFC registration flow, Collection UI, and Battle Arena







// Application State
const AppState = {
  currentView: 'view-menu',
  activeBattleEngine: null,
  activeBattlePlayerCreature: null,
  activeBattleOpponentCreature: null,
  selectedRosterInstanceId: null,
  scanSessionLogs: []
};

// -------------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNavigation();
  initDesktopControls();
  initNfcScanner();
  initCollection();
  initBattle();
  initHistory();
  initSettings();
  updateCollectionBadge();
  renderMenuMascot();
});

function initClock() {
  const clockEl = document.getElementById('clock-display');
  function updateTime() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hrs}:${mins}`;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

function renderMenuMascot() {
  const mascotContainer = document.getElementById('menu-mascot-container');
  if (mascotContainer) {
    mascotContainer.innerHTML = SPRITES.ignisaur;
  }
}

// -------------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------------
function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.getAttribute('data-nav');
      Sound.playClick();
      navigateTo(targetView);
    });
  });
}

function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    AppState.currentView = viewId;
    
    // View-specific refreshes
    if (viewId === 'view-collection') renderCollection();
    if (viewId === 'view-history') renderHistory();
    if (viewId === 'view-battle') openBattleRosterSelect();
    if (viewId === 'view-menu') updateCollectionBadge();
  }
}

function updateCollectionBadge() {
  const coll = Storage.getCollection();
  const badge = document.getElementById('menu-collection-count');
  const collCountText = document.getElementById('coll-count-text');
  if (badge) badge.textContent = coll.length;
  if (collCountText) collCountText.textContent = coll.length;
}

// -------------------------------------------------------------------
// DESKTOP & DISPLAY CONTROLS
// -------------------------------------------------------------------
function initDesktopControls() {
  const frameBtn = document.getElementById('btn-toggle-frame');
  const frameEl = document.getElementById('phone-frame');
  if (frameBtn && frameEl) {
    frameBtn.addEventListener('click', () => {
      frameEl.classList.toggle('mode-expanded');
      const isExpanded = frameEl.classList.contains('mode-expanded');
      frameBtn.textContent = isExpanded ? '📱 View: Responsive' : '📱 View: Phone Frame';
      Sound.playClick();
    });
  }

  const crtBtn = document.getElementById('btn-toggle-crt');
  const body = document.body;
  if (crtBtn) {
    crtBtn.addEventListener('click', () => {
      body.classList.toggle('crt-enabled');
      const isCrt = body.classList.contains('crt-enabled');
      crtBtn.classList.toggle('active', isCrt);
      crtBtn.textContent = isCrt ? '📺 CRT Effect: ON' : '📺 CRT Effect: OFF';
      Sound.playClick();
    });
  }

  const soundBtn = document.getElementById('btn-toggle-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = Sound.toggle();
      soundBtn.classList.toggle('active', enabled);
      soundBtn.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      if (enabled) Sound.playClick();
    });
  }

  const seedBtn = document.getElementById('btn-quick-seed');
  if (seedBtn) {
    seedBtn.addEventListener('click', () => {
      seedDemoData();
      Sound.playScanSuccess();
      showToast('2 demo creatures added to collection!', 'success');
      updateCollectionBadge();
    });
  }
}

// -------------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------------
function showToast(message, type = 'info') {
  const banner = document.getElementById('toast-banner');
  const textEl = document.getElementById('toast-text');
  const iconEl = document.getElementById('toast-icon');
  if (!banner || !textEl) return;

  banner.className = `toast-banner toast-${type}`;
  textEl.textContent = message;

  if (type === 'success') iconEl.textContent = '✅';
  else if (type === 'error') iconEl.textContent = '⚠️';
  else iconEl.textContent = 'ℹ️';

  banner.classList.remove('hidden');

  setTimeout(() => {
    banner.classList.add('hidden');
  }, 3200);
}

// -------------------------------------------------------------------
// VIEW 2: NFC SCANNER (STAGE A SIMULATION & REGISTRATION)
// -------------------------------------------------------------------
function initNfcScanner() {
  // Test Card Click Handlers
  document.querySelectorAll('.card-chip').forEach(card => {
    card.addEventListener('click', () => {
      const cardCode = card.getAttribute('data-code');
      triggerNfcScan(cardCode);
    });
  });

  // Custom code input handler
  const scanCustomBtn = document.getElementById('btn-scan-custom');
  const customInput = document.getElementById('input-custom-nfc');
  if (scanCustomBtn && customInput) {
    scanCustomBtn.addEventListener('click', () => {
      const code = customInput.value.trim();
      if (!code) {
        showToast('Please enter a card code to scan.', 'error');
        Sound.playError();
        return;
      }
      triggerNfcScan(code);
      customInput.value = '';
    });
  }
}

function triggerNfcScan(cardCode) {
  const pad = document.getElementById('nfc-pad');
  const statusText = document.getElementById('pad-status-text');
  const antenna = pad.querySelector('.pad-antenna');

  // Trigger pulse animation
  if (antenna) {
    antenna.classList.remove('scanning');
    void antenna.offsetWidth; // force reflow
    antenna.classList.add('scanning');
  }

  statusText.textContent = `Reading tag: ${cardCode}...`;

  setTimeout(() => {
    processCardRegistration(cardCode);
  }, 400);
}

function processCardRegistration(cardCode) {
  const statusText = document.getElementById('pad-status-text');

  // Step 1: Validate Code Format
  const isValidFormat = /^ML-CARD-[A-Z0-9]+-\d+$/i.test(cardCode);
  if (!isValidFormat) {
    Sound.playError();
    statusText.textContent = `Error: Invalid Card Code format!`;
    logScanAttempt(cardCode, 'Invalid Format', 'error');
    showToast(`Invalid card format: "${cardCode}"`, 'error');
    return;
  }

  // Step 2: Check for Duplicate Registration
  if (Storage.isCardRegistered(cardCode)) {
    Sound.playError();
    statusText.textContent = `Rejected: Card already registered!`;
    logScanAttempt(cardCode, 'Duplicate Card (Already Registered)', 'duplicate');
    showToast(`Duplicate! Card "${cardCode}" is already in your collection.`, 'error');
    return;
  }

  // Step 3: Check Registry Catalog
  const cardEntry = CARD_REGISTRY[cardCode];
  if (!cardEntry) {
    Sound.playError();
    statusText.textContent = `Unknown: Card code not in registry!`;
    logScanAttempt(cardCode, 'Unknown Code (Unregistered Card)', 'error');
    showToast(`Unrecognized card: "${cardCode}" is not in the prototype registry.`, 'error');
    return;
  }

  // Step 4: Register Creature
  try {
    const species = SPECIES_CATALOG[cardEntry.speciesId];
    const newInstance = createCreatureInstance(species.id, cardCode, species.name, 5);

    Storage.addCreature(newInstance);
    Storage.registerCard(cardCode, newInstance.instanceId);

    Sound.playScanSuccess();
    statusText.textContent = `Success! Registered ${newInstance.nickname}!`;
    logScanAttempt(cardCode, `Registered ${newInstance.nickname} (Lv.${newInstance.level})`, 'success');
    showToast(`New Creature Acquired: ${newInstance.nickname}!`, 'success');
    updateCollectionBadge();
  } catch (err) {
    console.error('Registration failed', err);
    Sound.playError();
    statusText.textContent = `Registration error occurred!`;
    showToast(`Registration failed: ${err.message}`, 'error');
  }
}

function logScanAttempt(cardCode, outcome, cssClass) {
  const logList = document.getElementById('scan-log-list');
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  AppState.scanSessionLogs.unshift({ time: timeStr, code: cardCode, outcome, cssClass });

  if (logList) {
    if (AppState.scanSessionLogs.length === 1) logList.innerHTML = '';
    const li = document.createElement('li');
    li.className = `log-item ${cssClass}`;
    li.innerHTML = `<span>[${timeStr}] <strong>${cardCode}</strong></span> <span>${outcome}</span>`;
    logList.prepend(li);
  }
}

// -------------------------------------------------------------------
// VIEW 3: COLLECTION & CREATURE DETAILS
// -------------------------------------------------------------------
function initCollection() {
  const closeBtn = document.getElementById('btn-close-detail');
  const modal = document.getElementById('creature-detail-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      Sound.playClick();
    });
  }
}

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const collection = Storage.getCollection();
  updateCollectionBadge();

  if (!grid) return;
  grid.innerHTML = '';

  if (collection.length === 0) {
    grid.innerHTML = `
      <div class="empty-collection-state">
        <p>No creatures registered yet!</p>
        <button class="pixel-btn btn-primary" data-nav="view-scan">
          📡 SCAN YOUR FIRST NFC CARD
        </button>
      </div>
    `;
    const btn = grid.querySelector('[data-nav="view-scan"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-scan'); });
    return;
  }

  collection.forEach(creature => {
    const species = SPECIES_CATALOG[creature.speciesId];
    const row = document.createElement('div');
    row.className = 'creature-card-row';
    row.innerHTML = `
      <div class="card-sprite-thumb">
        ${SPRITES[species.spriteKey] || ''}
      </div>
      <div class="card-info">
        <div class="card-title-row">
          <span class="card-name">${creature.nickname}</span>
          <span class="card-lvl">Lv.${creature.level}</span>
          <span class="type-pill type-${species.type}">${species.type}</span>
        </div>
        <div class="hp-bar-outer" style="margin: 4px 0;">
          <span class="hp-label" style="font-size: 6px;">HP</span>
          <div class="hp-bar-bg" style="height: 6px;">
            <div class="hp-bar-fill" style="width: ${(creature.currentHp / creature.maxHp) * 100}%;"></div>
          </div>
          <span style="font-size: 6px; color: #8ea7ce; margin-left: 4px;">${creature.currentHp}/${creature.maxHp}</span>
        </div>
        <div class="card-meta-nfc">NFC: ${creature.nfcTagCode || 'None'}</div>
      </div>
    `;

    row.addEventListener('click', () => {
      Sound.playClick();
      openCreatureDetails(creature);
    });

    grid.appendChild(row);
  });
}

function openCreatureDetails(creature) {
  const modal = document.getElementById('creature-detail-modal');
  const species = SPECIES_CATALOG[creature.speciesId];
  if (!modal || !species) return;

  document.getElementById('modal-creature-name').textContent = creature.nickname;
  document.getElementById('modal-species-id').textContent = creature.speciesId;
  document.getElementById('modal-instance-id').textContent = creature.instanceId;
  document.getElementById('modal-nfc-code').textContent = creature.nfcTagCode || 'Not Assigned';
  document.getElementById('modal-level').textContent = `Lv. ${creature.level}`;

  const typeBadge = document.getElementById('modal-type-badge');
  typeBadge.textContent = species.type.toUpperCase();
  typeBadge.className = `detail-type-badge type-pill type-${species.type}`;

  document.getElementById('modal-sprite-box').innerHTML = SPRITES[species.spriteKey] || '';

  // Stats
  document.getElementById('modal-stat-hp').textContent = creature.maxHp;
  document.getElementById('modal-bar-hp').style.width = `${Math.min(100, (creature.maxHp / 80) * 100)}%`;

  document.getElementById('modal-stat-atk').textContent = creature.attack;
  document.getElementById('modal-bar-atk').style.width = `${Math.min(100, (creature.attack / 70) * 100)}%`;

  document.getElementById('modal-stat-def').textContent = creature.defense;
  document.getElementById('modal-bar-def').style.width = `${Math.min(100, (creature.defense / 70) * 100)}%`;

  document.getElementById('modal-stat-spd').textContent = creature.speed;
  document.getElementById('modal-bar-spd').style.width = `${Math.min(100, (creature.speed / 70) * 100)}%`;

  // Moves list
  const movesContainer = document.getElementById('modal-moves-list');
  movesContainer.innerHTML = '';
  creature.knownMoveIds.forEach(mId => {
    const move = MOVES[mId];
    if (move) {
      const moveDiv = document.createElement('div');
      moveDiv.className = 'detail-move-pill';
      moveDiv.innerHTML = `
        <span><strong>${move.name}</strong> <small>(${move.type})</small></span>
        <span>PWR: ${move.power}</span>
      `;
      movesContainer.appendChild(moveDiv);
    }
  });

  modal.classList.remove('hidden');
}

// -------------------------------------------------------------------
// VIEW 4: BATTLE ARENA & DETERMINISTIC ENGINE INTEGRATION
// -------------------------------------------------------------------
function initBattle() {
  const startBtn = document.getElementById('btn-start-battle');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      Sound.playClick();
      startBattleMatch();
    });
  }

  const quitBtn = document.getElementById('btn-battle-quit');
  if (quitBtn) {
    quitBtn.addEventListener('click', () => {
      if (AppState.activeBattleEngine && !AppState.activeBattleEngine.isOver) {
        if (confirm('Are you sure you want to forfeit? Incomplete battles are saved as Aborted.')) {
          recordAbortedBattle();
          Sound.playClick();
          navigateTo('view-menu');
        }
      } else {
        navigateTo('view-menu');
      }
    });
  }

  // Rematch & Return buttons on outcome modal
  const rematchBtn = document.getElementById('btn-result-rematch');
  if (rematchBtn) {
    rematchBtn.addEventListener('click', () => {
      Sound.playClick();
      document.getElementById('battle-result-modal').classList.add('hidden');
      startBattleMatch();
    });
  }
}

function openBattleRosterSelect() {
  const rosterContainer = document.getElementById('battle-roster-select');
  const startBtn = document.getElementById('btn-start-battle');
  const collection = Storage.getCollection();

  document.getElementById('battle-pre-modal').classList.remove('hidden');
  document.getElementById('battle-active-ground').classList.add('hidden');
  document.getElementById('battle-result-modal').classList.add('hidden');

  if (!rosterContainer) return;
  rosterContainer.innerHTML = '';
  startBtn.disabled = true;
  AppState.selectedRosterInstanceId = null;

  if (collection.length === 0) {
    rosterContainer.innerHTML = `
      <div class="empty-collection-state" style="padding: 10px;">
        <p>You have no creatures in your collection!</p>
        <button class="pixel-btn btn-primary" data-nav="view-scan">SCAN NFC CARD FIRST</button>
      </div>
    `;
    const btn = rosterContainer.querySelector('[data-nav="view-scan"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-scan'); });
    return;
  }

  collection.forEach((creature, idx) => {
    const species = SPECIES_CATALOG[creature.speciesId];
    const item = document.createElement('div');
    item.className = 'roster-item';
    item.innerHTML = `
      <span class="type-pill type-${species.type}">${species.type}</span>
      <strong>${creature.nickname}</strong>
      <span>Lv.${creature.level}</span>
      <span style="color: #4ade80;">HP: ${creature.currentHp}/${creature.maxHp}</span>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.roster-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      AppState.selectedRosterInstanceId = creature.instanceId;
      startBtn.disabled = false;
      Sound.playClick();
    });

    // Auto-select first item
    if (idx === 0) {
      item.classList.add('selected');
      AppState.selectedRosterInstanceId = creature.instanceId;
      startBtn.disabled = false;
    }

    rosterContainer.appendChild(item);
  });
}

function startBattleMatch() {
  const playerCreature = Storage.getCreatureById(AppState.selectedRosterInstanceId);
  const oppSpeciesId = document.getElementById('select-ai-opponent').value;

  if (!playerCreature) {
    showToast('Please select a creature first!', 'error');
    return;
  }

  // Create an AI Opponent Instance
  const oppInstance = createCreatureInstance(oppSpeciesId, null, null, 5);

  AppState.activeBattlePlayerCreature = playerCreature;
  AppState.activeBattleOpponentCreature = oppInstance;

  // Initialize pure battle engine
  AppState.activeBattleEngine = new BattleEngine(playerCreature, oppInstance);

  // Switch UI views
  document.getElementById('battle-pre-modal').classList.add('hidden');
  document.getElementById('battle-active-ground').classList.remove('hidden');

  renderBattleGroundInitial();
}

function renderBattleGroundInitial() {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  // Setup Opponent Visuals
  document.getElementById('opp-name').textContent = engine.opponent.nickname;
  document.getElementById('opp-lvl').textContent = `Lv.${engine.opponent.level}`;
  document.getElementById('opp-sprite-holder').innerHTML = SPRITES[engine.opponent.species.spriteKey] || '';
  document.getElementById('opp-sprite-holder').className = 'sprite-holder';
  updateHpBar('opp', engine.opponent.currentHp, engine.opponent.maxHp);

  // Setup Player Visuals
  document.getElementById('player-name').textContent = engine.player.nickname;
  document.getElementById('player-lvl').textContent = `Lv.${engine.player.level}`;
  document.getElementById('player-sprite-holder').innerHTML = SPRITES[engine.player.species.spriteKey] || '';
  document.getElementById('player-sprite-holder').className = 'sprite-holder';
  updateHpBar('player', engine.player.currentHp, engine.player.maxHp);
  document.getElementById('player-hp-numbers').textContent = `${engine.player.currentHp} / ${engine.player.maxHp}`;

  // Dialogue
  setDialogue(`A wild ${engine.opponent.nickname} appeared! What will ${engine.player.nickname} do?`);

  // Render Move Buttons
  renderMoveButtons();
}

function renderMoveButtons() {
  const engine = AppState.activeBattleEngine;
  const grid = document.getElementById('battle-moves-grid');
  if (!grid || !engine) return;

  grid.innerHTML = '';
  engine.player.knownMoveIds.forEach(mId => {
    const move = MOVES[mId];
    if (move) {
      const btn = document.createElement('button');
      btn.className = 'move-btn';
      btn.innerHTML = `
        <div class="move-btn-top">
          <span class="move-btn-name">${move.name}</span>
          <span class="type-pill type-${move.type}" style="font-size: 5px;">${move.type}</span>
        </div>
        <div class="move-btn-pwr">PWR ${move.power}</div>
      `;

      btn.addEventListener('click', () => {
        handlePlayerMoveSelect(move.id);
      });

      grid.appendChild(btn);
    }
  });
}

function handlePlayerMoveSelect(moveId) {
  const engine = AppState.activeBattleEngine;
  if (!engine || engine.isOver) return;

  // Disable move buttons during turn animation
  setMoveButtonsDisabled(true);

  // Execute turn on battle engine
  const turnResult = engine.executeTurn(moveId);

  // Animate turn steps sequentially
  animateTurnSteps(turnResult.steps, 0, () => {
    if (turnResult.isOver) {
      handleBattleFinish(turnResult.winner);
    } else {
      setMoveButtonsDisabled(false);
      setDialogue(`What will ${engine.player.nickname} do next?`);
    }
  });
}

function animateTurnSteps(steps, index, onComplete) {
  if (index >= steps.length) {
    if (onComplete) onComplete();
    return;
  }

  const step = steps[index];

  if (step.type === 'faint') {
    // Creature fainted
    Sound.playFaint();
    setDialogue(step.log);
    const targetHolder = document.getElementById(step.faintedActor === 'player' ? 'player-sprite-holder' : 'opp-sprite-holder');
    if (targetHolder) targetHolder.classList.add('anim-faint');

    setTimeout(() => {
      animateTurnSteps(steps, index + 1, onComplete);
    }, 1200);
    return;
  }

  // Attack Step
  setDialogue(step.log);

  // Sound and shake animation on defender
  if (step.effectiveness === 'super') {
    Sound.playSuperEffective();
  } else {
    Sound.playHit();
  }

  const defenderHolder = document.getElementById(step.actor === 'player' ? 'opp-sprite-holder' : 'player-sprite-holder');
  if (defenderHolder) {
    defenderHolder.classList.remove('anim-shake');
    void defenderHolder.offsetWidth;
    defenderHolder.classList.add('anim-shake');
  }

  // Update HP bar
  const targetPrefix = step.actor === 'player' ? 'opp' : 'player';
  updateHpBar(targetPrefix, step.defenderHp, step.defenderMaxHp);
  if (step.actor === 'opponent') {
    document.getElementById('player-hp-numbers').textContent = `${step.defenderHp} / ${step.defenderMaxHp}`;
  }

  setTimeout(() => {
    animateTurnSteps(steps, index + 1, onComplete);
  }, 1000);
}

function updateHpBar(unitPrefix, currentHp, maxHp) {
  const bar = document.getElementById(`${unitPrefix}-hp-bar`);
  if (!bar) return;

  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  bar.style.width = `${pct}%`;

  bar.classList.remove('warn', 'danger');
  if (pct <= 20) {
    bar.classList.add('danger');
  } else if (pct <= 50) {
    bar.classList.add('warn');
  }
}

function setDialogue(text) {
  const el = document.getElementById('battle-dialogue-text');
  if (el) el.textContent = text;
}

function setMoveButtonsDisabled(disabled) {
  document.querySelectorAll('.move-btn').forEach(b => {
    b.disabled = disabled;
  });
}

function handleBattleFinish(winner) {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  const isPlayerWin = winner === 'player';
  if (isPlayerWin) {
    Sound.playVictory();
  }

  // Generate and save BattleRecord persistently
  const record = engine.generateBattleRecord(
    AppState.activeBattlePlayerCreature.maxHp,
    AppState.activeBattleOpponentCreature.maxHp
  );
  Storage.saveBattleRecord(record);

  // Show outcome modal
  setTimeout(() => {
    const modal = document.getElementById('battle-result-modal');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const stats = document.getElementById('result-stats');

    if (isPlayerWin) {
      title.textContent = 'VICTORY!';
      title.style.color = 'var(--accent-gold)';
      subtitle.textContent = `${engine.player.nickname} defeated ${engine.opponent.nickname}!`;
    } else {
      title.textContent = 'DEFEAT...';
      title.style.color = 'var(--accent-red)';
      subtitle.textContent = `${engine.player.nickname} was defeated in combat.`;
    }

    stats.innerHTML = `
      <div><strong>Battle Record Saved</strong></div>
      <div>Turns Taken: ${record.turnsTaken}</div>
      <div>Final HP: ${record.playerSummary.nickname} (${record.playerSummary.endHp}/${record.playerSummary.maxHp})</div>
      <div>Opponent: ${record.opponentSummary.nickname} (${record.opponentSummary.endHp}/${record.opponentSummary.maxHp})</div>
    `;

    modal.classList.remove('hidden');
  }, 800);
}

function recordAbortedBattle() {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  const record = {
    recordId: 'rec_abort_' + Date.now().toString(36),
    timestampUtc: new Date().toISOString(),
    playerSummary: {
      instanceId: engine.player.instanceId,
      speciesName: engine.player.species.name,
      nickname: engine.player.nickname,
      level: engine.player.level,
      startHp: engine.player.maxHp,
      endHp: engine.player.currentHp,
      maxHp: engine.player.maxHp
    },
    opponentSummary: {
      speciesName: engine.opponent.species.name,
      nickname: engine.opponent.nickname,
      level: engine.opponent.level,
      startHp: engine.opponent.maxHp,
      endHp: engine.opponent.currentHp,
      maxHp: engine.opponent.maxHp
    },
    turnsTaken: engine.turn,
    outcome: 'Aborted',
    actionLog: engine.actionHistory
  };

  Storage.saveBattleRecord(record);
  AppState.activeBattleEngine = null;
}

// -------------------------------------------------------------------
// VIEW 5: BATTLE RECORDS (HISTORY)
// -------------------------------------------------------------------
function initHistory() {
  const clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all battle records?')) {
        Storage.clearBattleHistory();
        Sound.playClick();
        renderHistory();
        showToast('Battle history cleared.', 'info');
      }
    });
  }
}

function renderHistory() {
  const container = document.getElementById('history-list');
  const records = Storage.getBattleHistory();
  if (!container) return;

  container.innerHTML = '';
  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-collection-state">
        <p>No battle records recorded yet!</p>
        <button class="pixel-btn btn-battle" data-nav="view-battle">GO TO BATTLE ARENA</button>
      </div>
    `;
    const btn = container.querySelector('[data-nav="view-battle"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-battle'); });
    return;
  }

  records.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const dateFormatted = new Date(rec.timestampUtc).toLocaleDateString() + ' ' + new Date(rec.timestampUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-outcome ${rec.outcome}">${rec.outcome.toUpperCase()}</span>
        <span class="history-meta">${dateFormatted}</span>
      </div>
      <div class="history-matchup">
        <strong>${rec.playerSummary.nickname}</strong> (HP: ${rec.playerSummary.endHp}/${rec.playerSummary.maxHp}) vs <strong>${rec.opponentSummary.nickname}</strong>
      </div>
      <div class="history-meta">
        Turns: ${rec.turnsTaken} | Record ID: ${rec.recordId.substring(0, 12)}...
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// VIEW 6: SETTINGS & DATA
// -------------------------------------------------------------------
function initSettings() {
  const soundBtn = document.getElementById('setting-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = Sound.toggle();
      soundBtn.classList.toggle('active', enabled);
      soundBtn.textContent = enabled ? 'ENABLED' : 'DISABLED';
      if (enabled) Sound.playClick();
    });
  }

  const crtBtn = document.getElementById('setting-crt-btn');
  if (crtBtn) {
    crtBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-enabled');
      const active = document.body.classList.contains('crt-enabled');
      crtBtn.classList.toggle('active', active);
      crtBtn.textContent = active ? 'ENABLED' : 'DISABLED';
      Sound.playClick();
    });
  }

  const inspectBtn = document.getElementById('btn-inspect-json');
  const jsonBox = document.getElementById('json-viewer-box');
  const jsonPre = document.getElementById('json-pre-content');
  const closeJsonBtn = document.getElementById('btn-close-json');

  if (inspectBtn && jsonBox && jsonPre) {
    inspectBtn.addEventListener('click', () => {
      const dump = Storage.exportDump();
      jsonPre.textContent = JSON.stringify(dump, null, 2);
      jsonBox.classList.remove('hidden');
      Sound.playClick();
    });
  }

  if (closeJsonBtn && jsonBox) {
    closeJsonBtn.addEventListener('click', () => {
      jsonBox.classList.add('hidden');
      Sound.playClick();
    });
  }

  const exportBtn = document.getElementById('btn-export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dump = Storage.exportDump();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monsterlink_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Sound.playScanSuccess();
      showToast('Data exported successfully!', 'success');
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('DANGER: This will erase all registered creatures and battle history! Continue?')) {
        Storage.clearAll();
        Sound.playError();
        updateCollectionBadge();
        showToast('All storage data has been reset.', 'info');
      }
    });
  }
}

// -------------------------------------------------------------------
// DEMO SEEDING HELPER
// -------------------------------------------------------------------
function seedDemoData() {
  if (!Storage.isCardRegistered('ML-CARD-IGNI-01')) {
    const igni = createCreatureInstance('species_ignisaur', 'ML-CARD-IGNI-01', 'Ignisaur', 5);
    Storage.addCreature(igni);
    Storage.registerCard('ML-CARD-IGNI-01', igni.instanceId);
  }

  if (!Storage.isCardRegistered('ML-CARD-AQUA-02')) {
    const aqua = createCreatureInstance('species_aquabite', 'ML-CARD-AQUA-02', 'Aquabite', 5);
    Storage.addCreature(aqua);
    Storage.registerCard('ML-CARD-AQUA-02', aqua.instanceId);
  }
}

})();
