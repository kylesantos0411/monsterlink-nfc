using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.Persistence
{
    /// <summary>
    /// Contract for managing player creature collection persistence and in-memory cache.
    /// Decouples UI and business logic from storage media (JSON, SQLite, memory).
    /// </summary>
    public interface ICollectionRepository
    {
        IReadOnlyList<CreatureInstance> GetAll();
        CreatureInstance GetById(string instanceId);
        void Add(CreatureInstance creature);
        bool Remove(string instanceId);
        void Save();
        void Load();
        void Clear();
        int Count { get; }
    }
}
