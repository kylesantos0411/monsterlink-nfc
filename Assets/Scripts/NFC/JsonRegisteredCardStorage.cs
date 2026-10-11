using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace MonsterLink.NFC
{
    /// <summary>
    /// File-based local JSON repository implementing IRegisteredCardRepository.
    /// Safely saves and restores card enrollment maps across application lifecycles.
    /// </summary>
    public class JsonRegisteredCardStorage : IRegisteredCardRepository
    {
        private readonly string _filePath;
        private readonly Dictionary<string, string> _cardMap; // CardCode -> InstanceId
        private readonly object _lock = new object();

        public JsonRegisteredCardStorage(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                throw new ArgumentException("FilePath cannot be null or empty", "filePath");

            _filePath = filePath;
            _cardMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            string dir = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

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
                    return _cardMap.Count;
                }
            }
        }

        public bool IsCardRegistered(string cardCode)
        {
            if (string.IsNullOrEmpty(cardCode)) return false;

            lock (_lock)
            {
                return _cardMap.ContainsKey(cardCode.Trim());
            }
        }

        public void RegisterCard(string cardCode, string instanceId)
        {
            if (string.IsNullOrEmpty(cardCode)) throw new ArgumentNullException("cardCode");
            if (string.IsNullOrEmpty(instanceId)) throw new ArgumentNullException("instanceId");

            lock (_lock)
            {
                _cardMap[cardCode.Trim()] = instanceId.Trim();
            }
        }

        public string GetInstanceIdForCard(string cardCode)
        {
            if (string.IsNullOrEmpty(cardCode)) return null;

            lock (_lock)
            {
                string instId;
                if (_cardMap.TryGetValue(cardCode.Trim(), out instId))
                {
                    return instId;
                }
                return null;
            }
        }

        public IReadOnlyDictionary<string, string> GetAllRegisteredCards()
        {
            lock (_lock)
            {
                return new Dictionary<string, string>(_cardMap, StringComparer.OrdinalIgnoreCase);
            }
        }

        public void Clear()
        {
            lock (_lock)
            {
                _cardMap.Clear();
            }
        }

        public void Save()
        {
            lock (_lock)
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("{");
                sb.AppendLine("  \"schemaVersion\": 1,");
                sb.AppendFormat("  \"lastModifiedUtc\": \"{0}\",\n", DateTime.UtcNow.ToString("o"));
                sb.AppendLine("  \"registeredCards\": [");

                int index = 0;
                foreach (KeyValuePair<string, string> kvp in _cardMap)
                {
                    sb.AppendLine("    {");
                    sb.AppendFormat("      \"cardCode\": \"{0}\",\n", kvp.Key.Replace("\"", "\\\""));
                    sb.AppendFormat("      \"instanceId\": \"{0}\"\n", kvp.Value.Replace("\"", "\\\""));
                    sb.Append("    }");
                    if (index < _cardMap.Count - 1) sb.Append(",");
                    sb.AppendLine();
                    index++;
                }

                sb.AppendLine("  ]");
                sb.Append("}");

                string tempPath = _filePath + ".tmp";
                try
                {
                    File.WriteAllText(tempPath, sb.ToString());
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
                    throw new IOException("Failed to save registered cards to " + _filePath + ": " + ex.Message, ex);
                }
            }
        }

        public void Load()
        {
            lock (_lock)
            {
                _cardMap.Clear();

                if (!File.Exists(_filePath)) return;

                try
                {
                    string json = File.ReadAllText(_filePath);
                    int cardsStart = json.IndexOf("\"registeredCards\"");
                    if (cardsStart < 0) return;

                    int arrayStart = json.IndexOf('[', cardsStart);
                    int arrayEnd = json.LastIndexOf(']');
                    if (arrayStart < 0 || arrayEnd <= arrayStart) return;

                    string body = json.Substring(arrayStart + 1, arrayEnd - arrayStart - 1);
                    int cursor = 0;

                    while (cursor < body.Length)
                    {
                        int openBrace = body.IndexOf('{', cursor);
                        if (openBrace < 0) break;

                        int closeBrace = body.IndexOf('}', openBrace);
                        if (closeBrace < 0) break;

                        string itemJson = body.Substring(openBrace, closeBrace - openBrace + 1);
                        string cardCode = ExtractString(itemJson, "\"cardCode\"");
                        string instanceId = ExtractString(itemJson, "\"instanceId\"");

                        if (!string.IsNullOrEmpty(cardCode) && !string.IsNullOrEmpty(instanceId))
                        {
                            _cardMap[cardCode] = instanceId;
                        }

                        cursor = closeBrace + 1;
                    }
                }
                catch (Exception ex)
                {
                    throw new IOException("Failed to load registered cards from " + _filePath + ": " + ex.Message, ex);
                }
            }
        }

        private static string ExtractString(string json, string key)
        {
            int keyIdx = json.IndexOf(key);
            if (keyIdx < 0) return null;

            int colonIdx = json.IndexOf(':', keyIdx + key.Length);
            if (colonIdx < 0) return null;

            int startQuote = json.IndexOf('\"', colonIdx);
            if (startQuote < 0) return null;

            int endQuote = json.IndexOf('\"', startQuote + 1);
            if (endQuote < 0) return null;

            return json.Substring(startQuote + 1, endQuote - startQuote - 1);
        }
    }
}
