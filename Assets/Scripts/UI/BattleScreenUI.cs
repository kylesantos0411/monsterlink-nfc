#if UNITY_5_3_OR_NEWER || UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using MonsterLink.Battle;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// Unity MonoBehaviour adapter for the Battle Arena screen.
    /// Binds HP bars, combat sprites, move buttons, and dialogue box to the BattlePresenter.
    /// </summary>
    public class BattleScreenUI : MonoBehaviour, IBattleView
    {
        [Header("Player Combatant HUD")]
        [SerializeField] private Text playerNameText;
        [SerializeField] private Text playerLevelText;
        [SerializeField] private Image playerHpFillImage;
        [SerializeField] private Text playerHpNumericText;

        [Header("Opponent Combatant HUD")]
        [SerializeField] private Text opponentNameText;
        [SerializeField] private Text opponentLevelText;
        [SerializeField] private Image opponentHpFillImage;

        [Header("Controls & Dialogue")]
        [SerializeField] private Text dialogueText;
        [SerializeField] private Button[] moveButtons;
        [SerializeField] private Text[] moveButtonLabels;
        [SerializeField] private Button forfeitButton;

        [Header("Result Modal")]
        [SerializeField] private GameObject resultModalRoot;
        [SerializeField] private Text resultTitleText;
        [SerializeField] private Text resultMessageText;
        [SerializeField] private Button returnToMenuButton;

        private BattlePresenter _presenter;
        private readonly List<string> _currentMoveIds = new List<string>();

        public event Action<string> OnMoveSelected;
        public event Action OnForfeitRequested;

        private void Awake()
        {
            if (forfeitButton != null)
            {
                forfeitButton.onClick.AddListener(() =>
                {
                    if (OnForfeitRequested != null) OnForfeitRequested.Invoke();
                });
            }

            if (moveButtons != null)
            {
                for (int i = 0; i < moveButtons.Length; i++)
                {
                    int index = i;
                    moveButtons[i].onClick.AddListener(() =>
                    {
                        if (index < _currentMoveIds.Count && OnMoveSelected != null)
                        {
                            OnMoveSelected.Invoke(_currentMoveIds[index]);
                        }
                    });
                }
            }
        }

        public void Initialize(BattleEngine engine)
        {
            _presenter = new BattlePresenter(this, engine);
            _presenter.Initialize();
        }

        public void DisplayCombatants(CreatureInstance player, CreatureInstance opponent)
        {
            if (playerNameText != null) playerNameText.text = player.Nickname;
            if (playerLevelText != null) playerLevelText.text = "Lv." + player.Level;

            if (opponentNameText != null) opponentNameText.text = opponent.Nickname;
            if (opponentLevelText != null) opponentLevelText.text = "Lv." + opponent.Level;
        }

        public void UpdateHp(CombatantSide side, int currentHp, int maxHp)
        {
            float fillPct = Mathf.Clamp01((float)currentHp / (float)maxHp);

            if (side == CombatantSide.Player)
            {
                if (playerHpFillImage != null) playerHpFillImage.fillAmount = fillPct;
                if (playerHpNumericText != null) playerHpNumericText.text = currentHp + "/" + maxHp;
            }
            else
            {
                if (opponentHpFillImage != null) opponentHpFillImage.fillAmount = fillPct;
            }
        }

        public void DisplayAvailableMoves(IEnumerable<MoveDefinition> moves)
        {
            _currentMoveIds.Clear();
            if (moves == null || moveButtons == null) return;

            int index = 0;
            foreach (MoveDefinition move in moves)
            {
                if (index >= moveButtons.Length) break;

                _currentMoveIds.Add(move.MoveId);
                moveButtons[index].gameObject.SetActive(true);
                if (index < moveButtonLabels.Length && moveButtonLabels[index] != null)
                {
                    moveButtonLabels[index].text = move.Name;
                }
                index++;
            }

            // Hide unused buttons
            for (int i = index; i < moveButtons.Length; i++)
            {
                moveButtons[i].gameObject.SetActive(false);
            }
        }

        public void DisplayDialogue(string message)
        {
            if (dialogueText != null) dialogueText.text = message;
        }

        public void SetMoveInputInteractable(bool interactable)
        {
            if (moveButtons != null)
            {
                foreach (Button btn in moveButtons)
                {
                    btn.interactable = interactable;
                }
            }
        }

        public void ShowBattleEnded(CombatantSide winner, string endMessage)
        {
            if (resultModalRoot != null)
            {
                resultModalRoot.SetActive(true);
                if (resultTitleText != null)
                {
                    resultTitleText.text = winner == CombatantSide.Player ? "VICTORY!" : "DEFEAT...";
                }
                if (resultMessageText != null)
                {
                    resultMessageText.text = endMessage;
                }
            }
        }
    }
}
#endif
