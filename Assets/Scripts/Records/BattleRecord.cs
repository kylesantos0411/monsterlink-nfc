using System;
using System.Collections.Generic;

namespace MonsterLink.Records
{
    /// <summary>
    /// Persistent historical record of a completed or aborted creature battle.
    /// Immutable once written; uniquely identified by RecordId.
    /// </summary>
    [Serializable]
    public class BattleRecord
    {
        public string RecordId { get; set; }
        public string TimestampUtc { get; set; }
        public CreatureCombatSummary PlayerCreature { get; set; }
        public CreatureCombatSummary OpponentCreature { get; set; }
        public int TurnCount { get; set; }
        public List<string> MovesUsedSummary { get; set; }
        public string WinnerName { get; set; }
        public string LoserName { get; set; }
        public BattleOutcome Outcome { get; set; }
        public string Notes { get; set; }

        public BattleRecord()
        {
            MovesUsedSummary = new List<string>();
        }

        public BattleRecord(
            string recordId,
            string timestampUtc,
            CreatureCombatSummary playerCreature,
            CreatureCombatSummary opponentCreature,
            int turnCount,
            IEnumerable<string> movesUsedSummary,
            string winnerName,
            string loserName,
            BattleOutcome outcome,
            string notes = null)
        {
            if (string.IsNullOrEmpty(recordId))
                throw new ArgumentException("RecordId cannot be null or empty", "recordId");
            if (playerCreature == null)
                throw new ArgumentNullException("playerCreature");
            if (opponentCreature == null)
                throw new ArgumentNullException("opponentCreature");

            RecordId = recordId;
            TimestampUtc = !string.IsNullOrEmpty(timestampUtc) ? timestampUtc : DateTime.UtcNow.ToString("o");
            PlayerCreature = playerCreature;
            OpponentCreature = opponentCreature;
            TurnCount = Math.Max(1, turnCount);
            MovesUsedSummary = movesUsedSummary != null ? new List<string>(movesUsedSummary) : new List<string>();
            WinnerName = winnerName ?? string.Empty;
            LoserName = loserName ?? string.Empty;
            Outcome = outcome;
            Notes = notes ?? string.Empty;
        }

        public override string ToString()
        {
            return string.Format("[{0}] {1} vs {2} -> {3} in {4} turns",
                RecordId, PlayerCreature.Nickname, OpponentCreature.Nickname, Outcome, TurnCount);
        }
    }
}
