export type BattleOutcome = 'Victory' | 'Defeat' | 'Aborted';

export interface CreatureCombatSummary {
  instanceId: string;
  speciesId: string;
  speciesName: string;
  nickname: string;
  level: number;
  startHp: number;
  endHp: number;
  maxHp: number;
}

export interface BattleRecord {
  recordId: string;
  timestampUtc: string;
  playerCreature: CreatureCombatSummary;
  opponentCreature: CreatureCombatSummary;
  turnCount: number;
  movesUsedSummary: string[];
  winnerName: string;
  loserName: string;
  outcome: BattleOutcome;
  notes: string;
}

export interface BattleHistorySaveData {
  schemaVersion: number;
  lastModifiedUtc: string;
  records: BattleRecord[];
}
