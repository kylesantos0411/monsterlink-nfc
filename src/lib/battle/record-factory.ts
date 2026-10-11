import { CreatureInstance } from '@/types/creature';
import { BattleRecord, BattleOutcome, CreatureCombatSummary } from '@/types/records';
import { BattleEngine } from './battle-engine';
import { SPECIES_CATALOG } from '../data/catalog';

export function createBattleRecord(
  engine: BattleEngine,
  playerStartHp: number,
  opponentStartHp: number,
  customRecordId?: string,
  customNotes?: string
): BattleRecord {
  const recordId = customRecordId || 'bat_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  const playerSpecies = SPECIES_CATALOG[engine.player.speciesId];
  const opponentSpecies = SPECIES_CATALOG[engine.opponent.speciesId];

  const playerSummary: CreatureCombatSummary = {
    instanceId: engine.player.instanceId,
    speciesId: engine.player.speciesId,
    speciesName: playerSpecies ? playerSpecies.name : engine.player.speciesId,
    nickname: engine.player.nickname,
    level: engine.player.level,
    startHp: playerStartHp,
    endHp: engine.player.currentHp,
    maxHp: engine.player.maxHp,
  };

  const opponentSummary: CreatureCombatSummary = {
    instanceId: engine.opponent.instanceId,
    speciesId: engine.opponent.speciesId,
    speciesName: opponentSpecies ? opponentSpecies.name : engine.opponent.speciesId,
    nickname: engine.opponent.nickname,
    level: engine.opponent.level,
    startHp: opponentStartHp,
    endHp: engine.opponent.currentHp,
    maxHp: engine.opponent.maxHp,
  };

  let outcome: BattleOutcome = 'Aborted';
  let winnerName = '';
  let loserName = '';

  if (engine.isBattleOver) {
    if (engine.winner === 'player') {
      outcome = 'Victory';
      winnerName = engine.player.nickname;
      loserName = engine.opponent.nickname;
    } else if (engine.winner === 'opponent') {
      outcome = 'Defeat';
      winnerName = engine.opponent.nickname;
      loserName = engine.player.nickname;
    }
  }

  const movesSummary = engine.actionLog.map(step => 
    `${step.attackerName} used ${step.moveUsed.name} (${step.damageDealt} dmg) -> ${step.defenderName}`
  );

  return {
    recordId,
    timestampUtc: new Date().toISOString(),
    playerCreature: playerSummary,
    opponentCreature: opponentSummary,
    turnCount: Math.max(1, engine.currentTurn),
    movesUsedSummary: movesSummary,
    winnerName,
    loserName,
    outcome,
    notes: customNotes || (outcome === 'Aborted' ? 'Battle interrupted before conclusion' : ''),
  };
}
