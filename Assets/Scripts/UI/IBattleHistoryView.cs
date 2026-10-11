using System;
using System.Collections.Generic;
using MonsterLink.Records;

namespace MonsterLink.UI
{
    /// <summary>
    /// View interface for the battle history list screen.
    /// Decoupled from Unity UnityEngine.UI elements for automated testing.
    /// </summary>
    public interface IBattleHistoryView
    {
        void DisplayRecords(IReadOnlyList<BattleRecord> records);
        void DisplayEmptyState(bool isEmpty);
        void UpdateRecordCount(int count);
        event Action<string> OnRecordSelected;
    }
}
