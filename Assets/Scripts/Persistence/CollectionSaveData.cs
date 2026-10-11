using System;
using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.Persistence
{
    /// <summary>
    /// Serialization envelope for persisting creature collection data.
    /// Tracks schema versioning and modification timestamps.
    /// </summary>
    [Serializable]
    public class CollectionSaveData
    {
        public int schemaVersion;
        public string lastModifiedUtc;
        public List<CreatureInstance> creatures;

        public CollectionSaveData()
        {
            schemaVersion = 1;
            lastModifiedUtc = DateTime.UtcNow.ToString("o");
            creatures = new List<CreatureInstance>();
        }

        public CollectionSaveData(IEnumerable<CreatureInstance> items)
        {
            schemaVersion = 1;
            lastModifiedUtc = DateTime.UtcNow.ToString("o");
            creatures = items != null ? new List<CreatureInstance>(items) : new List<CreatureInstance>();
        }
    }
}
