using System;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Metadata definition for a physical prototype card in the local registry.
    /// </summary>
    [Serializable]
    public class CardRegistryEntry
    {
        public string CardCode { get; private set; }
        public string SpeciesId { get; private set; }
        public string CardTitle { get; private set; }
        public string Batch { get; private set; }

        public CardRegistryEntry(string cardCode, string speciesId, string cardTitle, string batch)
        {
            if (cardCode == null) throw new ArgumentNullException("cardCode");
            if (speciesId == null) throw new ArgumentNullException("speciesId");

            CardCode = cardCode;
            SpeciesId = speciesId;
            CardTitle = cardTitle ?? string.Empty;
            Batch = batch ?? string.Empty;
        }

        public override string ToString()
        {
            return string.Format("{0} -> {1} ({2})", CardCode, CardTitle, SpeciesId);
        }
    }
}
