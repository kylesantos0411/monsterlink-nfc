import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { LocalStorageRepository } from './local-repository';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface StorageService {
  getCollection(): Promise<CreatureInstance[]>;
  addCreature(creature: CreatureInstance): Promise<void>;
  isCardRegistered(cardCode: string): Promise<boolean>;
  registerCard(cardCode: string, instanceId: string, speciesId?: string): Promise<boolean>;
  getBattleHistory(): Promise<BattleRecord[]>;
  addBattleRecord(record: BattleRecord): Promise<boolean>;
  exportRawData(): Promise<{ collection: CreatureInstance[]; registeredCards: Record<string, any>; history: BattleRecord[] }>;
  importRawData(data: { collection: CreatureInstance[]; registeredCards?: Record<string, any>; history: BattleRecord[] }): Promise<void>;
  clearAllData(): Promise<void>;
}

export const HybridStorage: StorageService = {
  async getCollection(): Promise<CreatureInstance[]> {
    const local = LocalStorageRepository.getCollection();
    if (!isSupabaseConfigured || !supabase) {
      return local;
    }

    try {
      const { data, error } = await supabase.from('creatures').select('*');
      if (error || !data) return local;

      const remote: CreatureInstance[] = data.map((row: any) => ({
        instanceId: row.instance_id,
        speciesId: row.species_id,
        nickname: row.nickname,
        level: row.level,
        maxHp: row.max_hp,
        currentHp: row.current_hp,
        attack: row.attack,
        defense: row.defense,
        speed: row.speed,
        knownMoveIds: row.known_moves || [],
        nfcCardCode: row.nfc_card_code,
        acquiredTimestampUtc: row.created_at,
      }));

      // Merge and keep local cache updated
      const mergedMap = new Map<string, CreatureInstance>();
      local.forEach(c => mergedMap.set(c.instanceId, c));
      remote.forEach(c => mergedMap.set(c.instanceId, c));
      const merged = Array.from(mergedMap.values());
      LocalStorageRepository.saveCollection(merged);
      return merged;
    } catch {
      return local;
    }
  },

  async addCreature(creature: CreatureInstance): Promise<void> {
    LocalStorageRepository.addCreature(creature);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('creatures').insert({
          instance_id: creature.instanceId,
          species_id: creature.speciesId,
          nickname: creature.nickname,
          level: creature.level,
          max_hp: creature.maxHp,
          current_hp: creature.currentHp,
          attack: creature.attack,
          defense: creature.defense,
          speed: creature.speed,
          known_moves: creature.knownMoveIds,
          nfc_card_code: creature.nfcCardCode,
        });
      } catch (err) {
        console.warn('Failed to sync creature to Supabase (saved locally):', err);
      }
    }
  },

  async isCardRegistered(cardCode: string): Promise<boolean> {
    if (LocalStorageRepository.isCardRegistered(cardCode)) {
      return true;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('registered_tags')
          .select('card_code')
          .eq('card_code', cardCode)
          .single();
        return Boolean(data);
      } catch {
        return false;
      }
    }

    return false;
  },

  async registerCard(cardCode: string, instanceId: string, speciesId = 'unknown'): Promise<boolean> {
    const success = LocalStorageRepository.registerCard(cardCode, instanceId);
    if (!success) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('registered_tags').insert({
          card_code: cardCode,
          species_id: speciesId,
        });
      } catch (err) {
        console.warn('Failed to sync tag to Supabase (saved locally):', err);
      }
    }

    return true;
  },

  async getBattleHistory(): Promise<BattleRecord[]> {
    const local = LocalStorageRepository.getBattleHistory();
    if (!isSupabaseConfigured || !supabase) {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('battle_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return local;

      const remote: BattleRecord[] = data.map((row: any) => ({
        recordId: row.record_id,
        timestampUtc: row.created_at,
        playerCreature: row.player_creature,
        opponentCreature: row.opponent_creature,
        turnCount: row.turn_count,
        movesUsedSummary: row.moves_used || [],
        winnerName: row.winner_name || '',
        loserName: row.loser_name || '',
        outcome: row.outcome,
        notes: row.notes || '',
      }));

      return remote.length > 0 ? remote : local;
    } catch {
      return local;
    }
  },

  async addBattleRecord(record: BattleRecord): Promise<boolean> {
    const success = LocalStorageRepository.addBattleRecord(record);
    if (!success) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('battle_records').insert({
          record_id: record.recordId,
          player_creature: record.playerCreature,
          opponent_creature: record.opponentCreature,
          turn_count: record.turnCount,
          moves_used: record.movesUsedSummary,
          winner_name: record.winnerName,
          loser_name: record.loserName,
          outcome: record.outcome,
          notes: record.notes,
        });
      } catch (err) {
        console.warn('Failed to sync battle record to Supabase (saved locally):', err);
      }
    }

    return true;
  },

  async exportRawData() {
    return {
      collection: LocalStorageRepository.getCollection(),
      registeredCards: LocalStorageRepository.getRegisteredCards(),
      history: LocalStorageRepository.getBattleHistory(),
    };
  },

  async importRawData(data) {
    if (data.collection) LocalStorageRepository.saveCollection(data.collection);
    if (data.registeredCards) LocalStorageRepository.saveRegisteredCards(data.registeredCards);
    if (data.history) LocalStorageRepository.saveBattleHistory(data.history);
  },

  async clearAllData() {
    LocalStorageRepository.clearAll();
  },
};
