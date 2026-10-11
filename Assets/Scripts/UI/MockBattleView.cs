using System;
using System.Collections.Generic;
using MonsterLink.Battle;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// Test double implementation of IBattleView for automated headless testing.
    /// </summary>
    public class MockBattleView : IBattleView
    {
        public CreatureInstance DisplayedPlayer { get; private set; }
        public CreatureInstance DisplayedOpponent { get; private set; }
        public int LastPlayerHp { get; private set; }
        public int LastOpponentHp { get; private set; }
        public IEnumerable<MoveDefinition> DisplayedMoves { get; private set; }
        public string LastDialogue { get; private set; }
        public bool IsInputInteractable { get; private set; }
        public bool IsBattleEndedShown { get; private set; }
        public CombatantSide? DeclaredWinner { get; private set; }
        public string DeclaredEndMessage { get; private set; }

        public event Action<string> OnMoveSelected;
        public event Action OnForfeitRequested;

        public void DisplayCombatants(CreatureInstance player, CreatureInstance opponent)
        {
            DisplayedPlayer = player;
            DisplayedOpponent = opponent;
        }

        public void UpdateHp(CombatantSide side, int currentHp, int maxHp)
        {
            if (side == CombatantSide.Player) LastPlayerHp = currentHp;
            else LastOpponentHp = currentHp;
        }

        public void DisplayAvailableMoves(IEnumerable<MoveDefinition> moves)
        {
            DisplayedMoves = moves;
        }

        public void DisplayDialogue(string message)
        {
            LastDialogue = message;
        }

        public void SetMoveInputInteractable(bool interactable)
        {
            IsInputInteractable = interactable;
        }

        public void ShowBattleEnded(CombatantSide winner, string endMessage)
        {
            IsBattleEndedShown = true;
            DeclaredWinner = winner;
            DeclaredEndMessage = endMessage;
        }

        public void SimulatePlayerSelectMove(string moveId)
        {
            if (OnMoveSelected != null)
            {
                OnMoveSelected.Invoke(moveId);
            }
        }

        public void SimulateForfeit()
        {
            if (OnForfeitRequested != null)
            {
                OnForfeitRequested.Invoke();
            }
        }
    }
}
