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

export const Storage = {
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
