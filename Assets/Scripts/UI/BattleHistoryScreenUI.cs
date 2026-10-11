#if UNITY_5_3_OR_NEWER || UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using MonsterLink.Records;

namespace MonsterLink.UI
{
    /// <summary>
    /// Unity MonoBehaviour adapter for the Battle History screen.
    /// Lists recorded combat sessions and opens detailed match inspect modal.
    /// </summary>
    public class BattleHistoryScreenUI : MonoBehaviour, IBattleHistoryView, IBattleDetailView
    {
        [Header("History List View")]
        [SerializeField] private GameObject emptyStateRoot;
        [SerializeField] private Text recordCountText;
        [SerializeField] private Transform recordListContainer;
        [SerializeField] private GameObject recordListItemPrefab;

        [Header("Battle Detail Inspect Modal")]
        [SerializeField] private GameObject detailModalRoot;
        [SerializeField] private Text detailTitleText;
        [SerializeField] private Text detailTimestampText;
        [SerializeField] private Text detailPlayerSummaryText;
        [SerializeField] private Text detailOpponentSummaryText;
        [SerializeField] private Text detailTurnsText;
        [SerializeField] private Text detailOutcomeText;
        [SerializeField] private Text detailMovesLogText;
        [SerializeField] private Button closeDetailButton;

        public event Action<string> OnRecordSelected;

        public bool IsVisible
        {
            get { return detailModalRoot != null && detailModalRoot.activeSelf; }
        }

        private void Awake()
        {
            if (closeDetailButton != null)
            {
                closeDetailButton.onClick.AddListener(Hide);
            }
        }

        public void DisplayRecords(IReadOnlyList<BattleRecord> records)
        {
            if (recordListContainer == null) return;

            // Clear old items
            foreach (Transform child in recordListContainer)
            {
                Destroy(child.gameObject);
            }

            if (records == null || records.Count == 0) return;

            for (int i = 0; i < records.Count; i++)
            {
                BattleRecord rec = records[i];
                if (recordListItemPrefab != null)
                {
                    GameObject itemObj = Instantiate(recordListItemPrefab, recordListContainer);
                    Text itemLabel = itemObj.GetComponentInChildren<Text>();
                    if (itemLabel != null)
                    {
                        itemLabel.text = string.Format("{0} vs {1} - {2}",
                            rec.PlayerCreature.Nickname,
                            rec.OpponentCreature.Nickname,
                            rec.Outcome);
                    }

                    Button itemButton = itemObj.GetComponent<Button>();
                    if (itemButton != null)
                    {
                        string id = rec.RecordId;
                        itemButton.onClick.AddListener(() =>
                        {
                            if (OnRecordSelected != null)
                            {
                                OnRecordSelected.Invoke(id);
                            }
                        });
                    }
                }
            }
        }

        public void DisplayEmptyState(bool isEmpty)
        {
            if (emptyStateRoot != null)
            {
                emptyStateRoot.SetActive(isEmpty);
            }
        }

        public void UpdateRecordCount(int count)
        {
            if (recordCountText != null)
            {
                recordCountText.text = string.Format("Total Battles: {0}", count);
            }
        }

        public void ShowBattleDetail(BattleRecord record)
        {
            if (detailModalRoot != null)
            {
                detailModalRoot.SetActive(true);
            }

            if (record == null) return;

            if (detailTitleText != null)
            {
                detailTitleText.text = string.Format("Match Record #{0}", record.RecordId.Substring(0, Math.Min(8, record.RecordId.Length)));
            }
            if (detailTimestampText != null)
            {
                detailTimestampText.text = record.TimestampUtc;
            }
            if (detailPlayerSummaryText != null && record.PlayerCreature != null)
            {
                detailPlayerSummaryText.text = string.Format("{0} (Lv.{1}) HP: {2}/{3} -> {4}/{3}",
                    record.PlayerCreature.Nickname,
                    record.PlayerCreature.Level,
                    record.PlayerCreature.StartHp,
                    record.PlayerCreature.MaxHp,
                    record.PlayerCreature.EndHp);
            }
            if (detailOpponentSummaryText != null && record.OpponentCreature != null)
            {
                detailOpponentSummaryText.text = string.Format("{0} (Lv.{1}) HP: {2}/{3} -> {4}/{3}",
                    record.OpponentCreature.Nickname,
                    record.OpponentCreature.Level,
                    record.OpponentCreature.StartHp,
                    record.OpponentCreature.MaxHp,
                    record.OpponentCreature.EndHp);
            }
            if (detailTurnsText != null)
            {
                detailTurnsText.text = string.Format("Turns: {0}", record.TurnCount);
            }
            if (detailOutcomeText != null)
            {
                detailOutcomeText.text = string.Format("Result: {0} (Winner: {1})",
                    record.Outcome,
                    !string.IsNullOrEmpty(record.WinnerName) ? record.WinnerName : "None");
            }
            if (detailMovesLogText != null)
            {
                detailMovesLogText.text = string.Join("\n", record.MovesUsedSummary.ToArray());
            }
        }

        public void Hide()
        {
            if (detailModalRoot != null)
            {
                detailModalRoot.SetActive(false);
            }
        }
    }
}
#endif
