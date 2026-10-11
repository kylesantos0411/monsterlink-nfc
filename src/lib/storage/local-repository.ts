import { CreatureInstance } from '@/types/creature';
import { RegisteredCardMap } from '@/types/nfc';
import { BattleRecord, BattleHistorySaveData } from '@/types/records';

const SCHEMA_VERSION = 1;

const KEYS = {
  COLLECTION: 'monsterlink_collection',
  REGISTERED_CARDS: 'monsterlink_registered_cards',
  BATTLE_HISTORY: 'monsterlink_battle_history',
};

function wrapPayload<T>(data: T) {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastModifiedUtc: new Date().toISOString(),
    data,
  };
}

function unwrapPayload<T>(rawJson: string | null, defaultValue: T): T {
  if (!rawJson) return defaultValue;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && parsed.data !== undefined) {
      return parsed.data as T;
    }
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

export const LocalStorageRepository = {
  // Collection Operations
  getCollection(): CreatureInstance[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(KEYS.COLLECTION);
    return unwrapPayload<CreatureInstance[]>(raw, []);
  },

  saveCollection(creatures: CreatureInstance[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.COLLECTION, JSON.stringify(wrapPayload(creatures)));
  },

  addCreature(creature: CreatureInstance): void {
    const list = this.getCollection();
    list.push(creature);
    this.saveCollection(list);
  },

  getCreatureById(instanceId: string): CreatureInstance | null {
    const list = this.getCollection();
    return list.find(c => c.instanceId === instanceId) || null;
  },

  // Registered Cards Operations
  getRegisteredCards(): RegisteredCardMap {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(KEYS.REGISTERED_CARDS);
    return unwrapPayload<RegisteredCardMap>(raw, {});
  },

  saveRegisteredCards(map: RegisteredCardMap): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.REGISTERED_CARDS, JSON.stringify(wrapPayload(map)));
  },

  isCardRegistered(cardCode: string): boolean {
    const map = this.getRegisteredCards();
    return Boolean(map[cardCode]);
  },

  registerCard(cardCode: string, instanceId: string): boolean {
    const map = this.getRegisteredCards();
    if (map[cardCode]) {
      return false; // Duplicate protection
    }
    map[cardCode] = {
      instanceId,
      registeredAt: new Date().toISOString(),
    };
    this.saveRegisteredCards(map);
    return true;
  },

  // Battle History Operations
  getBattleHistory(): BattleRecord[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(KEYS.BATTLE_HISTORY);
    return unwrapPayload<BattleRecord[]>(raw, []);
  },

  saveBattleHistory(records: BattleRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.BATTLE_HISTORY, JSON.stringify(wrapPayload(records)));
  },

  addBattleRecord(record: BattleRecord): boolean {
    const history = this.getBattleHistory();
    // Duplicate protection
    if (history.some(r => r.recordId === record.recordId)) {
      return false;
    }
    history.push(record);
    this.saveBattleHistory(history);
    return true;
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.COLLECTION);
    localStorage.removeItem(KEYS.REGISTERED_CARDS);
    localStorage.removeItem(KEYS.BATTLE_HISTORY);
  },
};
