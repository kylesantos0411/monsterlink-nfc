import { MoveDefinition } from './creature';

export type CombatantSide = 'player' | 'opponent';

export type MoveEffectiveness = 'super' | 'weak' | 'normal';

export interface CombatActionStep {
  actor: CombatantSide;
  attackerName: string;
  defenderName: string;
  moveUsed: MoveDefinition;
  damageDealt: number;
  effectiveness: MoveEffectiveness;
  defenderHpRemaining: number;
  defenderMaxHp: number;
  didDefenderFaint: boolean;
  narrationLog: string;
}

export interface TurnResult {
  turnNumber: number;
  steps: CombatActionStep[];
  isBattleOver: boolean;
  winner: CombatantSide | null;
  endingMessage: string;
}
