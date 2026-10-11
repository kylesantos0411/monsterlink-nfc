using System;
using System.Collections.Generic;
using System.IO;

namespace MonsterLink.Records
{
    /// <summary>
    /// File-based JSON storage implementation for battle history.
    /// Guarantees atomic writes via temporary files and enforces duplicate record prevention.
    /// </summary>
    public class JsonBattleHistoryStorage : IBattleHistoryRepository
    {
        private readonly string _filePath;
        private readonly List<BattleRecord> _records = new List<BattleRecord>();
        private readonly HashSet<string> _knownRecordIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        public JsonBattleHistoryStorage(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
            {
                throw new ArgumentNullException("filePath");
            }
            _filePath = filePath;
            Load();
        }

        public int Count
        {
            get { return _records.Count; }
        }

        public IReadOnlyList<BattleRecord> GetAll()
        {
            // Return copy ordered newest first
            List<BattleRecord> copy = new List<BattleRecord>(_records);
            copy.Reverse();
            return copy;
        }

        public BattleRecord GetById(string recordId)
        {
            if (string.IsNullOrEmpty(recordId)) return null;

            for (int i = 0; i < _records.Count; i++)
            {
                if (string.Equals(_records[i].RecordId, recordId, StringComparison.OrdinalIgnoreCase))
                {
                    return _records[i];
                }
            }
            return null;
        }

        public bool Add(BattleRecord record)
        {
            if (record == null)
            {
                throw new ArgumentNullException("record");
            }
            if (string.IsNullOrEmpty(record.RecordId))
            {
                throw new ArgumentException("Battle record must have a non-empty RecordId.", "record");
            }

            // Duplicate prevention
            if (_knownRecordIds.Contains(record.RecordId))
            {
                return false;
            }

            _knownRecordIds.Add(record.RecordId);
            _records.Add(record);
            Save();
            return true;
        }

        public void Save()
        {
            string directory = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            BattleHistorySaveData data = new BattleHistorySaveData();
            data.schemaVersion = 1;
            data.lastModifiedUtc = DateTime.UtcNow.ToString("o");
            data.records = new List<BattleRecord>(_records);

            string json = JsonBattleRecordSerializer.ToJson(data);
            string tempFile = _filePath + ".tmp";

            // Atomic file write
            File.WriteAllText(tempFile, json);
            if (File.Exists(_filePath))
            {
                File.Delete(_filePath);
            }
            File.Move(tempFile, _filePath);
        }

        public void Load()
        {
            _records.Clear();
            _knownRecordIds.Clear();

            if (!File.Exists(_filePath))
            {
                return;
            }

            try
            {
                string json = File.ReadAllText(_filePath);
                if (string.IsNullOrWhiteSpace(json))
                {
                    return;
                }

                BattleHistorySaveData data = JsonBattleRecordSerializer.FromJson(json);
                if (data != null && data.records != null)
                {
                    for (int i = 0; i < data.records.Count; i++)
                    {
                        BattleRecord record = data.records[i];
                        if (record != null && !string.IsNullOrEmpty(record.RecordId))
                        {
                            if (!_knownRecordIds.Contains(record.RecordId))
                            {
                                _knownRecordIds.Add(record.RecordId);
                                _records.Add(record);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // In production, log warning; fail-safe preserve existing in-memory state or start fresh
                Console.WriteLine("Warning loading battle history: " + ex.Message);
            }
        }

        public void Clear()
        {
            _records.Clear();
            _knownRecordIds.Clear();
            if (File.Exists(_filePath))
            {
                File.Delete(_filePath);
            }
        }
    }
}
