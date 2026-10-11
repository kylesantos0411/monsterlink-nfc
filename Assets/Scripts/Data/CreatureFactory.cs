using System;
using MonsterLink.Core;

namespace MonsterLink.Data
{
    /// <summary>
    /// Factory for minting unique CreatureInstance objects from base species definitions.
    /// Encapsulates stat scaling formulas and GUID generation.
    /// </summary>
    public static class CreatureFactory
    {
        public static CreatureInstance CreateInstance(
            string speciesId,
            string nfcCardCode = null,
            string customNickname = null,
            int level = 5)
        {
            CreatureSpecies species = CreatureCatalog.GetSpecies(speciesId);
            if (species == null)
            {
                throw new ArgumentException("Unknown species ID: " + speciesId, "speciesId");
            }

            return CreateInstance(species, nfcCardCode, customNickname, level);
        }

        public static CreatureInstance CreateInstance(
            CreatureSpecies species,
            string nfcCardCode = null,
            string customNickname = null,
            int level = 5)
        {
            if (species == null)
            {
                throw new ArgumentNullException("species");
            }

            level = Math.Max(1, level);

            // Stat scaling formulas
            int maxHp = ((species.BaseStats.BaseHp * 2 * level) / 100) + level + 10;
            int attack = ((species.BaseStats.Attack * 2 * level) / 100) + 5;
            int defense = ((species.BaseStats.Defense * 2 * level) / 100) + 5;
            int speed = ((species.BaseStats.Speed * 2 * level) / 100) + 5;

            string instanceId = "inst_" + Guid.NewGuid().ToString("N").Substring(0, 12);
            string nickname = !string.IsNullOrEmpty(customNickname) ? customNickname : species.DisplayName;

            return new CreatureInstance(
                instanceId,
                species.SpeciesId,
                nickname,
                level,
                maxHp,
                maxHp, // starts at full HP
                attack,
                defense,
                speed,
                species.LearnableMoveIds,
                nfcCardCode,
                DateTime.UtcNow.ToString("o")
            );
        }
    }
}
