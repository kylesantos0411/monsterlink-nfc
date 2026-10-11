using System;
using System.Collections.Generic;

namespace MonsterLink.Battle
{
    /// <summary>
    /// Encapsulates the complete outcome of a single battle turn.
    /// Contains sequential action steps, faint detections, and win/loss state.
    /// </summary>
    [Serializable]
    public class TurnResult
    {
        public int TurnNumber { get; private set; }
        public IReadOnlyList<CombatActionStep> Steps { get; private set; }
        public bool IsBattleOver { get; private set; }
        public CombatantSide? Winner { get; private set; }
        public string EndingMessage { get; private set; }

        public TurnResult(
            int turnNumber,
            IEnumerable<CombatActionStep> steps,
            bool isBattleOver,
            CombatantSide? winner = null,
            string endingMessage = null)
        {
            TurnNumber = turnNumber;
            Steps = steps != null ? new List<CombatActionStep>(steps) : new List<CombatActionStep>();
            IsBattleOver = isBattleOver;
            Winner = winner;
            EndingMessage = endingMessage ?? string.Empty;
        }
    }
}
