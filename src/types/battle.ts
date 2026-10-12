import { MoveDefinition, PrimaryStatusType } from './creature';

export type CombatantSide = 'player' | 'opponent';

export type MoveEffectiveness = 'super' | 'weak' | 'normal';

export interface CombatantModifierState {
  defenseStages: number;      // -6 to +6 (0 = 1.0x, +1 = 1.5x, +2 = 2.0x, etc.)
  isShielded: boolean;        // 100% blocks next hit (Protect/Barrier)
  statusCondition: PrimaryStatusType;
}

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
  isBlocked?: boolean;
  wasImmobilized?: boolean;
  statusInflicted?: PrimaryStatusType;
  statBoostApplied?: string;
}

export interface TurnResult {
  turnNumber: number;
  steps: CombatActionStep[];
  isBattleOver: boolean;
  winner: CombatantSide | null;
  endingMessage: string;
  residualLogs?: string[];
}
