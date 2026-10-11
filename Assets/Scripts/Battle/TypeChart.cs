using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.Battle
{
    /// <summary>
    /// Type effectiveness matrix matching the specification in docs/TECHNICAL_DECISIONS.md.
    /// Provides deterministic multipliers for combat damage calculation.
    /// </summary>
    public static class TypeChart
    {
        private static readonly Dictionary<ElementType, Dictionary<ElementType, float>> Multipliers;

        static TypeChart()
        {
            Multipliers = new Dictionary<ElementType, Dictionary<ElementType, float>>();

            // Fire
            Multipliers[ElementType.Fire] = new Dictionary<ElementType, float>
            {
                { ElementType.Fire, 1.0f },
                { ElementType.Water, 0.5f },
                { ElementType.Grass, 2.0f },
                { ElementType.Electric, 1.0f },
                { ElementType.Normal, 1.0f }
            };

            // Water
            Multipliers[ElementType.Water] = new Dictionary<ElementType, float>
            {
                { ElementType.Fire, 2.0f },
                { ElementType.Water, 1.0f },
                { ElementType.Grass, 0.5f },
                { ElementType.Electric, 1.0f },
                { ElementType.Normal, 1.0f }
            };

            // Grass
            Multipliers[ElementType.Grass] = new Dictionary<ElementType, float>
            {
                { ElementType.Fire, 0.5f },
                { ElementType.Water, 2.0f },
                { ElementType.Grass, 1.0f },
                { ElementType.Electric, 1.0f },
                { ElementType.Normal, 1.0f }
            };

            // Electric
            Multipliers[ElementType.Electric] = new Dictionary<ElementType, float>
            {
                { ElementType.Fire, 1.0f },
                { ElementType.Water, 2.0f },
                { ElementType.Grass, 0.5f },
                { ElementType.Electric, 1.0f },
                { ElementType.Normal, 1.0f }
            };

            // Normal
            Multipliers[ElementType.Normal] = new Dictionary<ElementType, float>
            {
                { ElementType.Fire, 1.0f },
                { ElementType.Water, 1.0f },
                { ElementType.Grass, 1.0f },
                { ElementType.Electric, 1.0f },
                { ElementType.Normal, 1.0f }
            };
        }

        public static float GetMultiplier(ElementType attackerType, ElementType defenderType)
        {
            Dictionary<ElementType, float> defenderMap;
            if (Multipliers.TryGetValue(attackerType, out defenderMap))
            {
                float mult;
                if (defenderMap.TryGetValue(defenderType, out mult))
                {
                    return mult;
                }
            }
            return 1.0f;
        }
    }
}
