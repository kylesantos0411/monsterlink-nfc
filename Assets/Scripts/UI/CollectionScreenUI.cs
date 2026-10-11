#if UNITY_5_3_OR_NEWER || UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.Persistence;

namespace MonsterLink.UI
{
    /// <summary>
    /// Unity MonoBehaviour implementation of ICollectionView and ICreatureDetailView.
    /// Manages the Canvas hierarchy, scroll rect instantiation, and modal display in Unity.
    /// </summary>
    public class CollectionScreenUI : MonoBehaviour, ICollectionView, ICreatureDetailView
    {
        [Header("Collection List Elements")]
        [SerializeField] private Text collectionCountText;
        [SerializeField] private GameObject emptyStatePanel;
        [SerializeField] private Transform creatureListContentParent;
        [SerializeField] private GameObject creatureListItemPrefab;

        [Header("Detail Modal Elements")]
        [SerializeField] private GameObject detailModalRoot;
        [SerializeField] private Text detailNicknameText;
        [SerializeField] private Text detailSpeciesText;
        [SerializeField] private Text detailLevelText;
        [SerializeField] private Text detailTypeText;
        [SerializeField] private Text detailHpText;
        [SerializeField] private Text detailAtkText;
        [SerializeField] private Text detailDefText;
        [SerializeField] private Text detailSpdText;
        [SerializeField] private Text detailNfcText;
        [SerializeField] private Transform detailMovesContentParent;
        [SerializeField] private GameObject moveItemPrefab;
        [SerializeField] private Button closeDetailButton;

        private CollectionPresenter _presenter;

        public event Action<string> OnCreatureSelected;

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

        public void Initialize(ICollectionRepository repository)
        {
            _presenter = new CollectionPresenter(repository, this, this);
            _presenter.Initialize();
        }

        // --- ICollectionView Implementation ---

        public void DisplayCreatureList(IReadOnlyList<CreatureInstance> creatures)
        {
            if (creatureListContentParent == null) return;

            // Clear old children
            foreach (Transform child in creatureListContentParent)
            {
                Destroy(child.gameObject);
            }

            if (creatures == null || creatureListItemPrefab == null) return;

            foreach (CreatureInstance creature in creatures)
            {
                GameObject itemObj = Instantiate(creatureListItemPrefab, creatureListContentParent);
                
                // Hook click event
                Button btn = itemObj.GetComponent<Button>();
                if (btn != null)
                {
                    string id = creature.InstanceId;
                    btn.onClick.AddListener(() =>
                    {
                        if (OnCreatureSelected != null)
                        {
                            OnCreatureSelected.Invoke(id);
                        }
                    });
                }
            }
        }

        public void DisplayEmptyState(bool isEmpty)
        {
            if (emptyStatePanel != null)
            {
                emptyStatePanel.SetActive(isEmpty);
            }
        }

        public void UpdateCollectionCount(int count)
        {
            if (collectionCountText != null)
            {
                collectionCountText.text = count.ToString();
            }
        }

        // --- ICreatureDetailView Implementation ---

        public void ShowCreatureDetails(CreatureInstance instance, CreatureSpecies species, IReadOnlyList<MoveDefinition> moves)
        {
            if (detailModalRoot == null) return;

            if (detailNicknameText != null) detailNicknameText.text = instance.Nickname;
            if (detailSpeciesText != null) detailSpeciesText.text = species.DisplayName + " (" + species.Subtitle + ")";
            if (detailLevelText != null) detailLevelText.text = "Lv. " + instance.Level;
            if (detailTypeText != null) detailTypeText.text = species.Type.ToString();
            if (detailHpText != null) detailHpText.text = instance.CurrentHp + "/" + instance.MaxHp;
            if (detailAtkText != null) detailAtkText.text = instance.Attack.ToString();
            if (detailDefText != null) detailDefText.text = instance.Defense.ToString();
            if (detailSpdText != null) detailSpdText.text = instance.Speed.ToString();
            if (detailNfcText != null) detailNfcText.text = !string.IsNullOrEmpty(instance.NfcCardCode) ? instance.NfcCardCode : "Not Assigned";

            // Moves
            if (detailMovesContentParent != null)
            {
                foreach (Transform child in detailMovesContentParent)
                {
                    Destroy(child.gameObject);
                }

                if (moves != null && moveItemPrefab != null)
                {
                    foreach (MoveDefinition move in moves)
                    {
                        Instantiate(moveItemPrefab, detailMovesContentParent);
                    }
                }
            }

            detailModalRoot.SetActive(true);
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
