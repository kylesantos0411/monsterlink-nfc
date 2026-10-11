using System;
using System.Collections.Generic;
using System.Text;

namespace MonsterLink.Records
{
    /// <summary>
    /// Pure, portable JSON serializer for battle history records.
    /// Operates without external DLLs and produces cleanly indented JSON.
    /// </summary>
    public static class JsonBattleRecordSerializer
    {
        public static string ToJson(BattleHistorySaveData data)
        {
            if (data == null) return "{}";

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("{");
            sb.AppendFormat("  \"schemaVersion\": {0},\n", data.schemaVersion);
            sb.AppendFormat("  \"lastModifiedUtc\": \"{0}\",\n", Escape(data.lastModifiedUtc));
            sb.AppendLine("  \"records\": [");

            if (data.records != null)
            {
                for (int i = 0; i < data.records.Count; i++)
                {
                    BattleRecord r = data.records[i];
                    sb.AppendLine("    {");
                    sb.AppendFormat("      \"recordId\": \"{0}\",\n", Escape(r.RecordId));
                    sb.AppendFormat("      \"timestampUtc\": \"{0}\",\n", Escape(r.TimestampUtc));

                    // Player Creature
                    sb.AppendLine("      \"playerCreature\": {");
                    sb.AppendFormat("        \"instanceId\": \"{0}\",\n", Escape(r.PlayerCreature.InstanceId));
                    sb.AppendFormat("        \"speciesId\": \"{0}\",\n", Escape(r.PlayerCreature.SpeciesId));
                    sb.AppendFormat("        \"speciesName\": \"{0}\",\n", Escape(r.PlayerCreature.SpeciesName));
                    sb.AppendFormat("        \"nickname\": \"{0}\",\n", Escape(r.PlayerCreature.Nickname));
                    sb.AppendFormat("        \"level\": {0},\n", r.PlayerCreature.Level);
                    sb.AppendFormat("        \"startHp\": {0},\n", r.PlayerCreature.StartHp);
                    sb.AppendFormat("        \"endHp\": {0},\n", r.PlayerCreature.EndHp);
                    sb.AppendFormat("        \"maxHp\": {0}\n", r.PlayerCreature.MaxHp);
                    sb.AppendLine("      },");

                    // Opponent Creature
                    sb.AppendLine("      \"opponentCreature\": {");
                    sb.AppendFormat("        \"instanceId\": \"{0}\",\n", Escape(r.OpponentCreature.InstanceId));
                    sb.AppendFormat("        \"speciesId\": \"{0}\",\n", Escape(r.OpponentCreature.SpeciesId));
                    sb.AppendFormat("        \"speciesName\": \"{0}\",\n", Escape(r.OpponentCreature.SpeciesName));
                    sb.AppendFormat("        \"nickname\": \"{0}\",\n", Escape(r.OpponentCreature.Nickname));
                    sb.AppendFormat("        \"level\": {0},\n", r.OpponentCreature.Level);
                    sb.AppendFormat("        \"startHp\": {0},\n", r.OpponentCreature.StartHp);
                    sb.AppendFormat("        \"endHp\": {0},\n", r.OpponentCreature.EndHp);
                    sb.AppendFormat("        \"maxHp\": {0}\n", r.OpponentCreature.MaxHp);
                    sb.AppendLine("      },");

                    sb.AppendFormat("      \"turnCount\": {0},\n", r.TurnCount);

                    // Moves
                    sb.Append("      \"movesUsedSummary\": [");
                    if (r.MovesUsedSummary != null && r.MovesUsedSummary.Count > 0)
                    {
                        for (int m = 0; m < r.MovesUsedSummary.Count; m++)
                        {
                            sb.AppendFormat("\"{0}\"", Escape(r.MovesUsedSummary[m]));
                            if (m < r.MovesUsedSummary.Count - 1) sb.Append(", ");
                        }
                    }
                    sb.AppendLine("],");

                    sb.AppendFormat("      \"winnerName\": \"{0}\",\n", Escape(r.WinnerName));
                    sb.AppendFormat("      \"loserName\": \"{0}\",\n", Escape(r.LoserName));
                    sb.AppendFormat("      \"outcome\": \"{0}\",\n", r.Outcome.ToString());
                    sb.AppendFormat("      \"notes\": \"{0}\"\n", Escape(r.Notes));

                    sb.Append("    }");
                    if (i < data.records.Count - 1) sb.Append(",");
                    sb.AppendLine();
                }
            }

            sb.AppendLine("  ]");
            sb.Append("}");
            return sb.ToString();
        }

        public static BattleHistorySaveData FromJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return new BattleHistorySaveData();

            BattleHistorySaveData data = new BattleHistorySaveData();

            int schemaVer = ExtractInt(json, "\"schemaVersion\"");
            if (schemaVer > 0) data.schemaVersion = schemaVer;

            string lastMod = ExtractString(json, "\"lastModifiedUtc\"");
            if (!string.IsNullOrEmpty(lastMod)) data.lastModifiedUtc = lastMod;

            int recordsStart = json.IndexOf("\"records\"");
            if (recordsStart >= 0)
            {
                int arrayStart = json.IndexOf('[', recordsStart);
                int arrayEnd = json.LastIndexOf(']');

                if (arrayStart >= 0 && arrayEnd > arrayStart)
                {
                    string arrayBody = json.Substring(arrayStart + 1, arrayEnd - arrayStart - 1);
                    data.records = ParseRecordsArray(arrayBody);
                }
            }

            return data;
        }

        private static List<BattleRecord> ParseRecordsArray(string body)
        {
            List<BattleRecord> list = new List<BattleRecord>();
            int cursor = 0;

            while (cursor < body.Length)
            {
                int openBrace = body.IndexOf('{', cursor);
                if (openBrace < 0) break;

                int closeBrace = FindMatchingBrace(body, openBrace);
                if (closeBrace < 0) break;

                string objJson = body.Substring(openBrace, closeBrace - openBrace + 1);
                BattleRecord rec = ParseBattleRecordObject(objJson);
                if (rec != null)
                {
                    list.Add(rec);
                }

                cursor = closeBrace + 1;
            }

            return list;
        }

        private static BattleRecord ParseBattleRecordObject(string json)
        {
            string recordId = ExtractString(json, "\"recordId\"");
            if (string.IsNullOrEmpty(recordId)) return null;

            string timestamp = ExtractString(json, "\"timestampUtc\"");
            int turnCount = ExtractInt(json, "\"turnCount\"");
            string winnerName = ExtractString(json, "\"winnerName\"");
            string loserName = ExtractString(json, "\"loserName\"");
            string outcomeStr = ExtractString(json, "\"outcome\"");
            string notes = ExtractString(json, "\"notes\"");

            BattleOutcome outcome = BattleOutcome.Victory;
            if (string.Equals(outcomeStr, "Defeat", StringComparison.OrdinalIgnoreCase))
                outcome = BattleOutcome.Defeat;
            else if (string.Equals(outcomeStr, "Aborted", StringComparison.OrdinalIgnoreCase))
                outcome = BattleOutcome.Aborted;

            CreatureCombatSummary playerSummary = ParseCombatSummary(json, "\"playerCreature\"");
            CreatureCombatSummary opponentSummary = ParseCombatSummary(json, "\"opponentCreature\"");

            List<string> moves = new List<string>();
            int movesKey = json.IndexOf("\"movesUsedSummary\"");
            if (movesKey >= 0)
            {
                int bOpen = json.IndexOf('[', movesKey);
                int bClose = json.IndexOf(']', bOpen);
                if (bOpen >= 0 && bClose > bOpen)
                {
                    string mBody = json.Substring(bOpen + 1, bClose - bOpen - 1);
                    string[] parts = mBody.Split(',');
                    foreach (string p in parts)
                    {
                        string trimmed = p.Trim().Trim('\"', ' ', '\r', '\n');
                        if (!string.IsNullOrEmpty(trimmed)) moves.Add(trimmed);
                    }
                }
            }

            return new BattleRecord(
                recordId,
                timestamp,
                playerSummary ?? new CreatureCombatSummary(),
                opponentSummary ?? new CreatureCombatSummary(),
                turnCount > 0 ? turnCount : 1,
                moves,
                winnerName,
                loserName,
                outcome,
                notes
            );
        }

        private static CreatureCombatSummary ParseCombatSummary(string json, string sectionKey)
        {
            int secIdx = json.IndexOf(sectionKey);
            if (secIdx < 0) return null;

            int openBrace = json.IndexOf('{', secIdx);
            if (openBrace < 0) return null;

            int closeBrace = FindMatchingBrace(json, openBrace);
            if (closeBrace < 0) return null;

            string subJson = json.Substring(openBrace, closeBrace - openBrace + 1);

            return new CreatureCombatSummary(
                ExtractString(subJson, "\"instanceId\""),
                ExtractString(subJson, "\"speciesId\""),
                ExtractString(subJson, "\"speciesName\""),
                ExtractString(subJson, "\"nickname\""),
                ExtractInt(subJson, "\"level\""),
                ExtractInt(subJson, "\"startHp\""),
                ExtractInt(subJson, "\"endHp\""),
                ExtractInt(subJson, "\"maxHp\"")
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
