using System;
using MonsterLink.Core;
using MonsterLink.Data;

namespace MonsterLink.Battle
{
    /// <summary>
    /// Pure, deterministic combat calculation engine.
    /// Implements the damage math and type scaling defined in docs/TECHNICAL_DECISIONS.md.
    /// Zero UnityEngine dependencies; operates strictly on integer arithmetic and math functions.
    /// </summary>
    public static class BattleDamageCalculator
    {
        public static DamageCalculationResult CalculateDamage(
            CreatureInstance attacker,
            CreatureInstance defender,
            MoveDefinition move)
        {
            if (attacker == null) throw new ArgumentNullException("attacker");
            if (defender == null) throw new ArgumentNullException("defender");
            if (move == null) throw new ArgumentNullException("move");

            // Resolve defender's elemental type via species catalog
            CreatureSpecies defenderSpecies = CreatureCatalog.GetSpecies(defender.SpeciesId);
            ElementType defenderType = defenderSpecies != null ? defenderSpecies.Type : ElementType.Normal;

            return CalculateDamage(attacker.Level, attacker.Attack, defender.Defense, move, defenderType);
        }

        public static DamageCalculationResult CalculateDamage(
            int attackerLevel,
            int attackerAttack,
            int defenderDefense,
            MoveDefinition move,
            ElementType defenderType)
        {
            if (move == null) throw new ArgumentNullException("move");

            int level = Math.Max(1, attackerLevel);
            int atk = Math.Max(1, attackerAttack);
            int def = Math.Max(1, defenderDefense); // Avoid division by zero

            // Level factor: floor( (2 * Level) / 5 ) + 2
            int levelFactor = ((2 * level) / 5) + 2;

            // Stat factor: (Move Power * Attacker ATK) / (Defender DEF * 50)
            double statFactor = (double)(move.Power * atk) / (double)(def * 50);

            // Base damage: floor( levelFactor * statFactor + 2 )
            int baseDamage = (int)Math.Floor((levelFactor * statFactor) + 2.0);

            // Type Multiplier
            float typeMultiplier = TypeChart.GetMultiplier(move.Type, defenderType);

            // Total damage: max(1, floor(baseDamage * typeMultiplier))
            int totalDamage = Math.Max(1, (int)Math.Floor(baseDamage * typeMultiplier));

            MoveEffectiveness effectiveness = MoveEffectiveness.Neutral;
            if (typeMultiplier >= 2.0f)
            {
                effectiveness = MoveEffectiveness.SuperEffective;
            }
            else if (typeMultiplier <= 0.5f)
            {
                effectiveness = MoveEffectiveness.NotVeryEffective;
            }

            return new DamageCalculationResult(totalDamage, typeMultiplier, effectiveness);
        }
    }
}
