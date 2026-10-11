using System;
using System.Collections.Generic;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Registry mapping valid physical prototype card codes to digital creature species.
    /// In production, this would be validated via cryptographic signatures against an authoritative service.
    /// </summary>
    public static class CardRegistry
    {
        private static readonly Dictionary<string, CardRegistryEntry> Registry =
            new Dictionary<string, CardRegistryEntry>(StringComparer.OrdinalIgnoreCase);

        static CardRegistry()
        {
            Register("ML-CARD-IGNI-01", "species_ignisaur", "Ignisaur Alpha", "Gen 1 Prototype Series");
            Register("ML-CARD-AQUA-02", "species_aquabite", "Aquabite Tide", "Gen 1 Prototype Series");
            Register("ML-CARD-FLOR-03", "species_floraslug", "Floraslug Bloom", "Gen 1 Prototype Series");
            Register("ML-CARD-VOLT-04", "species_voltkit", "Voltkit Bolt", "Gen 1 Prototype Series");
        }

        public static void Register(string cardCode, string speciesId, string cardTitle, string batch)
        {
            Registry[cardCode] = new CardRegistryEntry(cardCode, speciesId, cardTitle, batch);
        }

        public static bool IsKnownCode(string cardCode)
        {
            if (string.IsNullOrEmpty(cardCode)) return false;
            return Registry.ContainsKey(cardCode.Trim());
        }

        public static CardRegistryEntry GetEntry(string cardCode)
        {
            if (string.IsNullOrEmpty(cardCode)) return null;

            CardRegistryEntry entry;
            if (Registry.TryGetValue(cardCode.Trim(), out entry))
            {
                return entry;
            }
            return null;
        }

        public static IEnumerable<CardRegistryEntry> GetAllEntries()
        {
            return Registry.Values;
        }
    }
}
