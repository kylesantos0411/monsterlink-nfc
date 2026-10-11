using System;
using System.Collections.Generic;
using MonsterLink.Records;

namespace MonsterLink.UI
{
    /// <summary>
    /// Presenter bridging the persistent IBattleHistoryRepository to decoupled view interfaces.
    /// Handles record filtering, loading, empty state management, and detail inspections.
    /// </summary>
    public class BattleHistoryPresenter
    {
        private readonly IBattleHistoryRepository _repository;
        private readonly IBattleHistoryView _historyView;
        private readonly IBattleDetailView _detailView;

        public BattleHistoryPresenter(
            IBattleHistoryRepository repository,
            IBattleHistoryView historyView,
            IBattleDetailView detailView = null)
        {
            if (repository == null) throw new ArgumentNullException("repository");
            if (historyView == null) throw new ArgumentNullException("historyView");

            _repository = repository;
            _historyView = historyView;
            _detailView = detailView;

            _historyView.OnRecordSelected += HandleRecordSelected;
        }

        /// <summary>
        /// Refreshes the history view with latest records from the repository.
        /// </summary>
        public void RefreshView()
        {
            IReadOnlyList<BattleRecord> records = _repository.GetAll();
            _historyView.DisplayRecords(records);
            _historyView.DisplayEmptyState(records == null || records.Count == 0);
            _historyView.UpdateRecordCount(records != null ? records.Count : 0);
        }

        private void HandleRecordSelected(string recordId)
        {
            if (string.IsNullOrEmpty(recordId)) return;

            BattleRecord record = _repository.GetById(recordId);
            if (record != null && _detailView != null)
            {
                _detailView.ShowBattleDetail(record);
            }
        }

        /// <summary>
        /// Manually triggers selection of a record by ID (e.g., from unit tests or external navigation).
        /// </summary>
        public void SelectRecord(string recordId)
        {
            HandleRecordSelected(recordId);
        }
    }
}
