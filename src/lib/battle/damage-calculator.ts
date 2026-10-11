import { ElementType, MoveDefinition, CreatureInstance, CreatureSpecies } from '@/types/creature';
import { getTypeMultiplier } from './type-chart';
import { MoveEffectiveness } from '@/types/battle';

export interface DamageCalculationResult {
  damage: number;
  typeMultiplier: number;
  effectiveness: MoveEffectiveness;
  isMinClampApplied: boolean;
}

export function calculateDamage(
  attacker: CreatureInstance,
  defender: CreatureInstance,
  defenderSpecies: CreatureSpecies,
  move: MoveDefinition
): DamageCalculationResult {
  // Deterministic damage formula from TECHNICAL_DECISIONS.md:
  // Damage = max(1, floor( ( floor((2 * Level)/5) + 2 ) * (Power * ATK)/(DEF * 50) + 2 ) * TypeMultiplier)
  const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;
  const statFactor = (move.power * attacker.attack) / (Math.max(1, defender.defense) * 50);
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
  };
}
