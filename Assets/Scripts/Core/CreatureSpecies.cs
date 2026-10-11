using System;
using System.Collections.Generic;

namespace MonsterLink.Core
{
    /// <summary>
    /// Immutable species blueprint. Represents a species template in the game catalog.
    /// Multiple CreatureInstances may share the same species definition.
    /// </summary>
    [Serializable]
    public class CreatureSpecies
    {
        public string SpeciesId { get; private set; }
        public string DisplayName { get; private set; }
        public string Subtitle { get; private set; }
        public ElementType Type { get; private set; }
        public RarityTier Rarity { get; private set; }
        public CreatureStats BaseStats { get; private set; }
        public List<string> LearnableMoveIds { get; private set; }
        public string SpriteResourcePath { get; private set; }

        public CreatureSpecies(
            string speciesId,
            string displayName,
            string subtitle,
            ElementType type,
            RarityTier rarity,
            CreatureStats baseStats,
            IEnumerable<string> learnableMoveIds,
            string spriteResourcePath)
        {
            if (speciesId == null) throw new ArgumentNullException("speciesId");
            if (displayName == null) throw new ArgumentNullException("displayName");

            SpeciesId = speciesId;
            DisplayName = displayName;
            Subtitle = subtitle ?? string.Empty;
            Type = type;
            Rarity = rarity;
            BaseStats = baseStats;
            LearnableMoveIds = learnableMoveIds != null 
                ? new List<string>(learnableMoveIds) 
                : new List<string>();
            SpriteResourcePath = spriteResourcePath ?? string.Empty;
        }

        public override string ToString()
        {
            return string.Format("{0} [{1}] - {2} ({3})", DisplayName, SpeciesId, Subtitle, Type);
        }
    }
}
