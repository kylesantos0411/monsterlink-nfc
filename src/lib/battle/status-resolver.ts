import { CreatureInstance, PrimaryStatusType } from '@/types/creature';

/**
 * Calculates standard Pokémon stat stage multiplier (-6 to +6)
 * Stages >= 0: (2 + stage) / 2
 * Stages < 0:  2 / (2 + abs(stage))
 */
export function getStageMultiplier(stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) {
    return (2 + clamped) / 2;
  }
  return 2 / (2 + Math.abs(clamped));
}

/**
 * Calculates residual poison damage (1/8 of Max HP, minimum 1)
 */
export function calculatePoisonDamage(maxHp: number): number {
  return Math.max(1, Math.floor(maxHp / 8));
}

/**
 * Checks if a creature is immobilized by full paralysis (25% chance)
 */
export function checkParalysisImmobilized(rngRoll: number = Math.random()): boolean {
  return rngRoll < 0.25;
}

/**
 * Checks if a frozen creature thaws out this turn (25% chance)
 */
export function checkFreezeThaw(rngRoll: number = Math.random()): boolean {
  return rngRoll < 0.25;
}

/**
 * Computes effective combat speed factoring in paralysis (50% penalty)
 */
export function getEffectiveSpeed(creature: CreatureInstance, status?: PrimaryStatusType): number {
  const currentStatus = status || creature.statusCondition || 'none';
  if (currentStatus === 'paralysis') {
    return Math.max(1, Math.floor(creature.speed * 0.5));
  }
  return creature.speed;
}
