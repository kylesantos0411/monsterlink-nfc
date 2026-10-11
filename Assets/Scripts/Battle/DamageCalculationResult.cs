using System;

namespace MonsterLink.Battle
{
    public enum MoveEffectiveness
    {
        SuperEffective,
        Neutral,
        NotVeryEffective
    }

    /// <summary>
    /// Value object representing the deterministic outcome of a single attack calculation.
    /// </summary>
    [Serializable]
    public struct DamageCalculationResult
    {
        public int Damage;
        public float TypeMultiplier;
        public MoveEffectiveness Effectiveness;

        public DamageCalculationResult(int damage, float typeMultiplier, MoveEffectiveness effectiveness)
        {
            Damage = damage;
            TypeMultiplier = typeMultiplier;
            Effectiveness = effectiveness;
        }

        public override string ToString()
        {
            return string.Format("Damage: {0} (x{1:F1}, {2})", Damage, TypeMultiplier, Effectiveness);
        }
    }
}
