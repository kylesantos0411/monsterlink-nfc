using System;
using System.Collections.Generic;
using System.IO;
using MonsterLink.Core;

namespace MonsterLink.Persistence
{
    /// <summary>
    /// File-based local JSON repository implementing ICollectionRepository.
    /// Manages player collection with atomic writes, schema versioning, and cache synchronization.
    /// </summary>
    public class JsonCollectionStorage : ICollectionRepository
    {
        private readonly string _filePath;
        private readonly List<CreatureInstance> _collection;
        private readonly object _lock = new object();

        public JsonCollectionStorage(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                throw new ArgumentException("FilePath cannot be null or empty", "filePath");

            _filePath = filePath;
            _collection = new List<CreatureInstance>();

            // Ensure parent directory exists
            string dir = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            // Auto-load if file exists
            if (File.Exists(_filePath))
            {
                Load();
            }
        }

        public int Count
        {
            get
            {
                lock (_lock)
                {
                    return _collection.Count;
                }
            }
        }

        public IReadOnlyList<CreatureInstance> GetAll()
        {
            lock (_lock)
            {
                return new List<CreatureInstance>(_collection);
            }
        }

        public CreatureInstance GetById(string instanceId)
        {
            if (string.IsNullOrEmpty(instanceId)) return null;

            lock (_lock)
            {
                for (int i = 0; i < _collection.Count; i++)
                {
                    if (_collection[i].InstanceId == instanceId)
                    {
                        return _collection[i];
                    }
                }
                return null;
            }
        }

        public void Add(CreatureInstance creature)
        {
            if (creature == null) throw new ArgumentNullException("creature");

            lock (_lock)
            {
                // Prevent duplicate instance ID in collection
                for (int i = 0; i < _collection.Count; i++)
                {
                    if (_collection[i].InstanceId == creature.InstanceId)
                    {
                        _collection[i] = creature; // update existing
                        return;
                    }
                }

                _collection.Add(creature);
            }
        }

        public bool Remove(string instanceId)
        {
            if (string.IsNullOrEmpty(instanceId)) return false;

            lock (_lock)
            {
                for (int i = 0; i < _collection.Count; i++)
                {
                    if (_collection[i].InstanceId == instanceId)
                    {
                        _collection.RemoveAt(i);
                        return true;
                    }
                }
                return false;
            }
        }

        public void Clear()
        {
            lock (_lock)
            {
                _collection.Clear();
            }
        }

        public void Save()
        {
            lock (_lock)
            {
                CollectionSaveData data = new CollectionSaveData(_collection);
                string json = JsonSerializerHelper.ToJson(data);

                string tempPath = _filePath + ".tmp";
                try
                {
                    // Atomic write: write to temp file first
                    File.WriteAllText(tempPath, json);

                    if (File.Exists(_filePath))
                    {
                        File.Delete(_filePath);
                    }

                    File.Move(tempPath, _filePath);
                }
                catch (Exception ex)
                {
                    if (File.Exists(tempPath))
                    {
                        try { File.Delete(tempPath); } catch { }
                    }
                    throw new IOException("Failed to save collection to " + _filePath + ": " + ex.Message, ex);
                }
            }
        }

        public void Load()
        {
            lock (_lock)
            {
                _collection.Clear();

                if (!File.Exists(_filePath))
                {
                    return;
                }

                try
                {
                    string json = File.ReadAllText(_filePath);
                    CollectionSaveData data = JsonSerializerHelper.FromJson(json);

                    if (data != null && data.creatures != null)
                    {
                        _collection.AddRange(data.creatures);
                    }
                }
                catch (Exception ex)
                {
                    throw new IOException("Failed to load collection from " + _filePath + ": " + ex.Message, ex);
                }
            }
        }
    }
}
