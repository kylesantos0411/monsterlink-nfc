import { ElementType, MoveDefinition, CreatureInstance, CreatureSpecies } from '@/types/creature';
import { getTypeMultiplier } from './type-chart';
import { MoveEffectiveness } from '@/types/battle';
import { getStageMultiplier } from './status-resolver';

export interface DamageCalculationOptions {
  defenseStages?: number;
  isShielded?: boolean;
}

export interface DamageCalculationResult {
  damage: number;
  typeMultiplier: number;
  effectiveness: MoveEffectiveness;
  isMinClampApplied: boolean;
  isBlocked?: boolean;
}

export function calculateDamage(
  attacker: CreatureInstance,
  defender: CreatureInstance,
  defenderSpecies: CreatureSpecies,
  move: MoveDefinition,
  options?: DamageCalculationOptions
): DamageCalculationResult {
  // If the defender is shielded by Protect / Barrier, 100% of damage is blocked!
  if (options?.isShielded) {
    return {
      damage: 0,
      typeMultiplier: 1.0,
      effectiveness: 'normal',
      isMinClampApplied: false,
      isBlocked: true,
    };
  }

  // Factor in Defense Stages (e.g. Hardening / Shell Armor +2 stages = 2.0x defense)
  const defStage = options?.defenseStages || 0;
  const defMultiplier = getStageMultiplier(defStage);
  const effectiveDefense = Math.max(1, Math.floor(defender.defense * defMultiplier));

  // Deterministic damage formula from TECHNICAL_DECISIONS.md:
  // Damage = max(1, floor( ( floor((2 * Level)/5) + 2 ) * (Power * ATK)/(DEF * 50) + 2 ) * TypeMultiplier)
  const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;
  const statFactor = (move.power * attacker.attack) / (effectiveDefense * 50);
  const baseDamage = Math.floor(levelFactor * statFactor + 2);

  const typeMult = getTypeMultiplier(move.type, defenderSpecies ? defenderSpecies.type : 'Normal');
  const rawDamage = Math.floor(baseDamage * typeMult);
  const totalDamage = Math.max(1, rawDamage);

  let effectiveness: MoveEffectiveness = 'normal';
  if (typeMult >= 2.0) effectiveness = 'super';
  else if (typeMult <= 0.5) effectiveness = 'weak';

  return {
    damage: totalDamage,
    typeMultiplier: typeMult,
    effectiveness,
    isMinClampApplied: rawDamage < 1,
    isBlocked: false,
  };
}
