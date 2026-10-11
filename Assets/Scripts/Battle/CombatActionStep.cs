using System;
using MonsterLink.Core;

namespace MonsterLink.Battle
{
    public enum CombatantSide
    {
        Player,
        Opponent
    }

    /// <summary>
    /// Represents an individual resolved action step within a turn.
    /// Emitted by the BattleEngine for presentation/UI consumption without coupling logic to animation.
    /// </summary>
    [Serializable]
    public class CombatActionStep
    {
        public CombatantSide Actor { get; private set; }
        public string AttackerName { get; private set; }
        public string DefenderName { get; private set; }
        public MoveDefinition MoveUsed { get; private set; }
        public int DamageDealt { get; private set; }
        public MoveEffectiveness Effectiveness { get; private set; }
        public int DefenderHpRemaining { get; private set; }
        public int DefenderMaxHp { get; private set; }
        public bool DidDefenderFaint { get; private set; }
        public string NarrationLog { get; private set; }

        public CombatActionStep(
            CombatantSide actor,
            string attackerName,
            string defenderName,
            MoveDefinition moveUsed,
            int damageDealt,
            MoveEffectiveness effectiveness,
            int defenderHpRemaining,
            int defenderMaxHp,
            bool didDefenderFaint,
            string narrationLog)
        {
            Actor = actor;
            AttackerName = attackerName ?? "Unknown";
            DefenderName = defenderName ?? "Unknown";
            MoveUsed = moveUsed;
            DamageDealt = damageDealt;
            Effectiveness = effectiveness;
            DefenderHpRemaining = Math.Max(0, defenderHpRemaining);
            DefenderMaxHp = Math.Max(1, defenderMaxHp);
            DidDefenderFaint = didDefenderFaint;
            NarrationLog = narrationLog ?? string.Empty;
        }

        public override string ToString()
        {
            return NarrationLog;
        }
    }
}
