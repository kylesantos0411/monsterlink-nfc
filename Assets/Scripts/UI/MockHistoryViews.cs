using System;
using System.Collections.Generic;
using MonsterLink.Records;

namespace MonsterLink.UI
{
    /// <summary>
    /// Test double implementation of IBattleHistoryView for headless automated verification.
    /// </summary>
    public class MockBattleHistoryView : IBattleHistoryView
    {
        public IReadOnlyList<BattleRecord> LastDisplayedRecords { get; private set; }
        public bool IsEmptyStateDisplayed { get; private set; }
        public int LastRecordCount { get; private set; }

        public event Action<string> OnRecordSelected;

        public void DisplayRecords(IReadOnlyList<BattleRecord> records)
        {
            LastDisplayedRecords = records;
        }

        public void DisplayEmptyState(bool isEmpty)
        {
            IsEmptyStateDisplayed = isEmpty;
        }

        public void UpdateRecordCount(int count)
        {
            LastRecordCount = count;
        }

        public void SimulateSelectRecord(string recordId)
        {
            if (OnRecordSelected != null)
            {
                OnRecordSelected.Invoke(recordId);
            }
        }
    }

    /// <summary>
    /// Test double implementation of IBattleDetailView for headless automated verification.
    /// </summary>
    public class MockBattleDetailView : IBattleDetailView
    {
        public bool IsVisible { get; private set; }
        public BattleRecord LastDisplayedRecord { get; private set; }

        public void ShowBattleDetail(BattleRecord record)
        {
            IsVisible = true;
            LastDisplayedRecord = record;
        }

        public void Hide()
        {
            IsVisible = false;
        }
    }
}
