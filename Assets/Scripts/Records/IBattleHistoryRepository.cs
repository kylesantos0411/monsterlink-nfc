using System;
using System.Collections.Generic;

namespace MonsterLink.Records
{
    /// <summary>
    /// Persistent storage contract for match battle records.
    /// Supports append-only battle history, queries, and duplicate record prevention.
    /// </summary>
    public interface IBattleHistoryRepository
    {
        /// <summary>
        /// Total number of stored battle records.
        /// </summary>
        int Count { get; }

        /// <summary>
        /// Retrieves all battle records sorted by timestamp (newest first).
        /// </summary>
        IReadOnlyList<BattleRecord> GetAll();

        /// <summary>
        /// Looks up a specific battle record by unique BattleRecord ID.
        /// </summary>
        BattleRecord GetById(string recordId);

        /// <summary>
        /// Attempts to add a completed battle record to history.
        /// Prevents duplicates: returns false if recordId already exists.
        /// </summary>
        bool Add(BattleRecord record);

        /// <summary>
        /// Persists all current records to persistent disk storage.
        /// </summary>
        void Save();

        /// <summary>
        /// Reloads records from persistent disk storage into memory.
        /// </summary>
        void Load();

        /// <summary>
        /// Clears all recorded matches in memory and disk (for testing or profile resets).
        /// </summary>
        void Clear();
    }
}
