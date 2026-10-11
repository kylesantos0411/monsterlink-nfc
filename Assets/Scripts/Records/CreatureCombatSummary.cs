using System;

namespace MonsterLink.Records
{
    /// <summary>
    /// Value object recording a combatant's starting and ending parameters for historical review.
    /// </summary>
    [Serializable]
    public class CreatureCombatSummary
    {
        public string InstanceId { get; set; }
        public string SpeciesId { get; set; }
        public string SpeciesName { get; set; }
        public string Nickname { get; set; }
        public int Level { get; set; }
        public int StartHp { get; set; }
        public int EndHp { get; set; }
        public int MaxHp { get; set; }

        public CreatureCombatSummary() { }

        public CreatureCombatSummary(
            string instanceId,
            string speciesId,
            string speciesName,
            string nickname,
            int level,
            int startHp,
            int endHp,
            int maxHp)
        {
            InstanceId = instanceId ?? string.Empty;
            SpeciesId = speciesId ?? string.Empty;
            SpeciesName = speciesName ?? string.Empty;
            Nickname = nickname ?? string.Empty;
            Level = Math.Max(1, level);
            StartHp = Math.Max(0, startHp);
            EndHp = Math.Max(0, endHp);
            MaxHp = Math.Max(1, maxHp);
        }

        public override string ToString()
        {
            return string.Format("{0} [Lv.{1}] HP: {2} -> {3}/{4}", Nickname, Level, StartHp, EndHp, MaxHp);
        }
    }
}
