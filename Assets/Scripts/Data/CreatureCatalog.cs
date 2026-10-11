using System;
using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.Data
{
    /// <summary>
    /// Static registry containing sample species definitions and combat moves.
    /// Acts as the single source of truth for base species catalog.
    /// </summary>
    public static class CreatureCatalog
    {
        private static readonly Dictionary<string, CreatureSpecies> SpeciesMap = new Dictionary<string, CreatureSpecies>();
        private static readonly Dictionary<string, MoveDefinition> MoveMap = new Dictionary<string, MoveDefinition>();

        static CreatureCatalog()
        {
            RegisterMoves();
            RegisterSpecies();
        }

        private static void RegisterMoves()
        {
            // Fire Moves
            AddMove(new MoveDefinition("flame_burst", "Flame Burst", ElementType.Fire, 45, 100, "Shoots a burst of scorching embers at the target."));
            AddMove(new MoveDefinition("fire_fang", "Fire Fang", ElementType.Fire, 60, 95, "Bites with burning fangs imbued with fire."));

            // Water Moves
            AddMove(new MoveDefinition("aqua_jet", "Aqua Jet", ElementType.Water, 40, 100, "Strikes quickly like a high-speed torrent."));
            AddMove(new MoveDefinition("bubble_beam", "Bubble Beam", ElementType.Water, 60, 100, "Sprays pressurized bubbles that blast the foe."));

            // Grass Moves
            AddMove(new MoveDefinition("vine_whip", "Vine Whip", ElementType.Grass, 45, 100, "Strikes the target with slender, stinging vines."));
            AddMove(new MoveDefinition("spore_blast", "Spore Blast", ElementType.Grass, 55, 95, "Explodes a pouch of prickly pollen spores."));

            // Electric Moves
            AddMove(new MoveDefinition("spark_claw", "Spark Claw", ElementType.Electric, 45, 100, "Slashes with claws energized with crackling voltage."));
            AddMove(new MoveDefinition("thunder_jolt", "Thunder Jolt", ElementType.Electric, 60, 95, "Unleashes a concentrated blast of lightning."));

            // Normal Moves
            AddMove(new MoveDefinition("tackle", "Tackle", ElementType.Normal, 35, 100, "A full-body charge that strikes the opponent."));
            AddMove(new MoveDefinition("quick_strike", "Quick Strike", ElementType.Normal, 40, 100, "A swift, agile strike delivered before the foe reacts."));
        }

        private static void RegisterSpecies()
        {
            // 1. Ignisaur
            AddSpecies(new CreatureSpecies(
                "species_ignisaur",
                "Ignisaur",
                "Ember Reptile",
                ElementType.Fire,
                RarityTier.Common,
                new CreatureStats(48, 52, 43, 55),
                new[] { "flame_burst", "tackle", "fire_fang" },
                "Sprites/Creatures/Ignisaur"
            ));

            // 2. Aquabite
            AddSpecies(new CreatureSpecies(
                "species_aquabite",
                "Aquabite",
                "Coral Crab",
                ElementType.Water,
                RarityTier.Common,
                new CreatureStats(55, 46, 60, 38),
                new[] { "aqua_jet", "tackle", "bubble_beam" },
                "Sprites/Creatures/Aquabite"
            ));

            // 3. Floraslug
            AddSpecies(new CreatureSpecies(
                "species_floraslug",
                "Floraslug",
                "Spore Slug",
                ElementType.Grass,
                RarityTier.Common,
                new CreatureStats(60, 44, 52, 30),
                new[] { "vine_whip", "tackle", "spore_blast" },
                "Sprites/Creatures/Floraslug"
            ));

            // 4. Voltkit
            AddSpecies(new CreatureSpecies(
                "species_voltkit",
                "Voltkit",
                "Spark Rodent",
                ElementType.Electric,
                RarityTier.Uncommon,
                new CreatureStats(42, 56, 38, 68),
                new[] { "spark_claw", "quick_strike", "thunder_jolt" },
                "Sprites/Creatures/Voltkit"
            ));
        }

        private static void AddSpecies(CreatureSpecies species)
        {
            SpeciesMap[species.SpeciesId] = species;
        }

        private static void AddMove(MoveDefinition move)
        {
            MoveMap[move.MoveId] = move;
        }

        public static CreatureSpecies GetSpecies(string speciesId)
        {
            if (speciesId != null && SpeciesMap.ContainsKey(speciesId))
            {
                return SpeciesMap[speciesId];
            }
            return null;
        }

        public static MoveDefinition GetMove(string moveId)
        {
            if (moveId != null && MoveMap.ContainsKey(moveId))
            {
                return MoveMap[moveId];
            }
            return null;
        }

        public static IEnumerable<CreatureSpecies> GetAllSpecies()
        {
            return SpeciesMap.Values;
        }

        public static IEnumerable<MoveDefinition> GetAllMoves()
        {
            return MoveMap.Values;
        }
    }
}
