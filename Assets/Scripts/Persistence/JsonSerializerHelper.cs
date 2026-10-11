using System;
using System.Collections.Generic;
using System.Text;
using MonsterLink.Core;

namespace MonsterLink.Persistence
{
    /// <summary>
    /// Pure, portable JSON serialization utility for MonsterLink storage.
    /// Operates without external DLL dependencies and outputs clean, indented JSON.
    /// Fully compatible with both Unity runtime and standalone CLI test runners.
    /// </summary>
    public static class JsonSerializerHelper
    {
        public static string ToJson(CollectionSaveData data)
        {
            if (data == null) return "{}";

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("{");
            sb.AppendFormat("  \"schemaVersion\": {0},\n", data.schemaVersion);
            sb.AppendFormat("  \"lastModifiedUtc\": \"{0}\",\n", Escape(data.lastModifiedUtc));
            sb.AppendLine("  \"creatures\": [");

            if (data.creatures != null)
            {
                for (int i = 0; i < data.creatures.Count; i++)
                {
                    CreatureInstance c = data.creatures[i];
                    sb.AppendLine("    {");
                    sb.AppendFormat("      \"instanceId\": \"{0}\",\n", Escape(c.InstanceId));
                    sb.AppendFormat("      \"speciesId\": \"{0}\",\n", Escape(c.SpeciesId));
                    sb.AppendFormat("      \"nickname\": \"{0}\",\n", Escape(c.Nickname));
                    sb.AppendFormat("      \"level\": {0},\n", c.Level);
                    sb.AppendFormat("      \"currentHp\": {0},\n", c.CurrentHp);
                    sb.AppendFormat("      \"maxHp\": {0},\n", c.MaxHp);
                    sb.AppendFormat("      \"attack\": {0},\n", c.Attack);
                    sb.AppendFormat("      \"defense\": {0},\n", c.Defense);
                    sb.AppendFormat("      \"speed\": {0},\n", c.Speed);

                    // moves array
                    sb.Append("      \"knownMoveIds\": [");
                    if (c.KnownMoveIds != null && c.KnownMoveIds.Count > 0)
                    {
                        for (int m = 0; m < c.KnownMoveIds.Count; m++)
                        {
                            sb.AppendFormat("\"{0}\"", Escape(c.KnownMoveIds[m]));
                            if (m < c.KnownMoveIds.Count - 1) sb.Append(", ");
                        }
                    }
                    sb.AppendLine("],");

                    sb.AppendFormat("      \"nfcCardCode\": {0},\n", c.NfcCardCode != null ? "\"" + Escape(c.NfcCardCode) + "\"" : "null");
                    sb.AppendFormat("      \"acquiredTimestampUtc\": \"{0}\"\n", Escape(c.AcquiredTimestampUtc));

                    sb.Append("    }");
                    if (i < data.creatures.Count - 1) sb.Append(",");
                    sb.AppendLine();
                }
            }

            sb.AppendLine("  ]");
            sb.Append("}");
            return sb.ToString();
        }

        public static CollectionSaveData FromJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return new CollectionSaveData();

            CollectionSaveData data = new CollectionSaveData();

            // Extract schemaVersion
            int schemaVer = ExtractInt(json, "\"schemaVersion\"");
            if (schemaVer > 0) data.schemaVersion = schemaVer;

            // Extract lastModifiedUtc
            string lastMod = ExtractString(json, "\"lastModifiedUtc\"");
            if (!string.IsNullOrEmpty(lastMod)) data.lastModifiedUtc = lastMod;

            // Extract creatures array
            int creaturesStart = json.IndexOf("\"creatures\"");
            if (creaturesStart >= 0)
            {
                int arrayStart = json.IndexOf('[', creaturesStart);
                int arrayEnd = json.LastIndexOf(']');

                if (arrayStart >= 0 && arrayEnd > arrayStart)
                {
                    string arrayBody = json.Substring(arrayStart + 1, arrayEnd - arrayStart - 1);
                    data.creatures = ParseCreaturesArray(arrayBody);
                }
            }

            return data;
        }

        private static List<CreatureInstance> ParseCreaturesArray(string body)
        {
            List<CreatureInstance> list = new List<CreatureInstance>();
            int cursor = 0;

            while (cursor < body.Length)
            {
                int openBrace = body.IndexOf('{', cursor);
                if (openBrace < 0) break;

                int closeBrace = FindMatchingBrace(body, openBrace);
                if (closeBrace < 0) break;

                string objJson = body.Substring(openBrace, closeBrace - openBrace + 1);
                CreatureInstance inst = ParseCreatureObject(objJson);
                if (inst != null)
                {
                    list.Add(inst);
                }

                cursor = closeBrace + 1;
            }

            return list;
        }

        private static CreatureInstance ParseCreatureObject(string json)
        {
            string instanceId = ExtractString(json, "\"instanceId\"");
            string speciesId = ExtractString(json, "\"speciesId\"");
            if (string.IsNullOrEmpty(instanceId) || string.IsNullOrEmpty(speciesId))
            {
                return null;
            }

            string nickname = ExtractString(json, "\"nickname\"");
            int level = ExtractInt(json, "\"level\"");
            int currentHp = ExtractInt(json, "\"currentHp\"");
            int maxHp = ExtractInt(json, "\"maxHp\"");
            int attack = ExtractInt(json, "\"attack\"");
            int defense = ExtractInt(json, "\"defense\"");
            int speed = ExtractInt(json, "\"speed\"");
            string nfcCardCode = ExtractString(json, "\"nfcCardCode\"");
            string acquiredUtc = ExtractString(json, "\"acquiredTimestampUtc\"");

            List<string> moves = new List<string>();
            int movesKey = json.IndexOf("\"knownMoveIds\"");
            if (movesKey >= 0)
            {
                int bracketOpen = json.IndexOf('[', movesKey);
                int bracketClose = json.IndexOf(']', bracketOpen);
                if (bracketOpen >= 0 && bracketClose > bracketOpen)
                {
                    string movesStr = json.Substring(bracketOpen + 1, bracketClose - bracketOpen - 1);
                    string[] parts = movesStr.Split(',');
                    foreach (string p in parts)
                    {
                        string trimmed = p.Trim().Trim('\"', ' ', '\r', '\n');
                        if (!string.IsNullOrEmpty(trimmed))
                        {
                            moves.Add(trimmed);
                        }
                    }
                }
            }

            return new CreatureInstance(
                instanceId,
                speciesId,
                nickname,
                level > 0 ? level : 1,
                maxHp > 0 ? maxHp : 10,
                currentHp,
                attack > 0 ? attack : 5,
                defense > 0 ? defense : 5,
                speed > 0 ? speed : 5,
                moves,
                nfcCardCode,
                acquiredUtc
            );
        }

        private static int FindMatchingBrace(string text, int openIndex)
        {
            int depth = 0;
            for (int i = openIndex; i < text.Length; i++)
            {
                if (text[i] == '{') depth++;
                else if (text[i] == '}')
                {
                    depth--;
                    if (depth == 0) return i;
                }
            }
            return -1;
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

        private static int ExtractInt(string json, string key)
        {
            int keyIdx = json.IndexOf(key);
            if (keyIdx < 0) return 0;

            int colonIdx = json.IndexOf(':', keyIdx + key.Length);
            if (colonIdx < 0) return 0;

            int start = colonIdx + 1;
            while (start < json.Length && (char.IsWhiteSpace(json[start]) || json[start] == '\"')) start++;

            int end = start;
            while (end < json.Length && (char.IsDigit(json[end]) || json[end] == '-')) end++;

            if (end > start)
            {
                int val;
                if (int.TryParse(json.Substring(start, end - start), out val))
                {
                    return val;
                }
            }
            return 0;
        }

        private static string Escape(string s)
        {
            if (s == null) return string.Empty;
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r");
        }
    }
}
