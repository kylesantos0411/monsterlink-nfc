using System;
using System.Collections.Generic;

namespace MonsterLink.Core
{
    /// <summary>
    /// Represents an individual, mutable creature owned by a player.
    /// Each instance has a unique InstanceId (GUID) and its own combat stats,
    /// separate from its base CreatureSpecies definition.
    /// </summary>
    [Serializable]
    public class CreatureInstance
    {
        public string InstanceId { get; set; }
        public string SpeciesId { get; set; }
        public string Nickname { get; set; }
        public int Level { get; set; }
        public int CurrentHp { get; set; }
        public int MaxHp { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int Speed { get; set; }
        public List<string> KnownMoveIds { get; set; }
        public string NfcCardCode { get; set; }
        public string AcquiredTimestampUtc { get; set; }

        public CreatureInstance()
        {
            KnownMoveIds = new List<string>();
        }

        public CreatureInstance(
            string instanceId,
            string speciesId,
            string nickname,
            int level,
            int maxHp,
            int currentHp,
            int attack,
            int defense,
            int speed,
            IEnumerable<string> knownMoveIds,
            string nfcCardCode = null,
            string acquiredTimestampUtc = null)
        {
            if (string.IsNullOrEmpty(instanceId))
                throw new ArgumentException("InstanceId cannot be null or empty", "instanceId");
            if (string.IsNullOrEmpty(speciesId))
                throw new ArgumentException("SpeciesId cannot be null or empty", "speciesId");

            InstanceId = instanceId;
            SpeciesId = speciesId;
            Nickname = !string.IsNullOrEmpty(nickname) ? nickname : speciesId;
            Level = Math.Max(1, level);
            MaxHp = Math.Max(1, maxHp);
            CurrentHp = Math.Max(0, Math.Min(currentHp, MaxHp));
            Attack = Math.Max(1, attack);
            Defense = Math.Max(1, defense);
            Speed = Math.Max(1, speed);
            KnownMoveIds = knownMoveIds != null ? new List<string>(knownMoveIds) : new List<string>();
            NfcCardCode = nfcCardCode;
            AcquiredTimestampUtc = !string.IsNullOrEmpty(acquiredTimestampUtc)
                ? acquiredTimestampUtc
                : DateTime.UtcNow.ToString("o");
        }

        public bool IsFainted
        {
            get { return CurrentHp <= 0; }
        }

        public void TakeDamage(int damage)
        {
            if (damage < 0) damage = 0;
            CurrentHp = Math.Max(0, CurrentHp - damage);
        }

        public void Heal(int amount)
        {
            if (amount < 0) amount = 0;
            CurrentHp = Math.Min(MaxHp, CurrentHp + amount);
        }

        public void RestoreFullHp()
        {
            CurrentHp = MaxHp;
        }

        public override string ToString()
        {
            return string.Format("{0} [Lv.{1}] HP: {2}/{3} (ID: {4})", Nickname, Level, CurrentHp, MaxHp, InstanceId);
        }
    }
}
