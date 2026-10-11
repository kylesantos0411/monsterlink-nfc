using System;
using System.Collections.Generic;

namespace MonsterLink.Records
{
    /// <summary>
    /// Serialization envelope for battle history persistence.
    /// Tracks schema versioning and modification metadata.
    /// </summary>
    [Serializable]
    public class BattleHistorySaveData
    {
        public int schemaVersion;
        public string lastModifiedUtc;
        public List<BattleRecord> records;

        public BattleHistorySaveData()
        {
            schemaVersion = 1;
            lastModifiedUtc = DateTime.UtcNow.ToString("o");
            records = new List<BattleRecord>();
        }

        public BattleHistorySaveData(IEnumerable<BattleRecord> items)
        {
            schemaVersion = 1;
            lastModifiedUtc = DateTime.UtcNow.ToString("o");
            records = items != null ? new List<BattleRecord>(items) : new List<BattleRecord>();
        }
    }
}
