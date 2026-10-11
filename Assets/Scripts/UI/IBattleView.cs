using System;
using System.Collections.Generic;
using MonsterLink.Battle;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// View interface for the battle arena UI.
    /// Decoupled from damage math and combat resolution.
    /// </summary>
    public interface IBattleView
    {
        void DisplayCombatants(CreatureInstance player, CreatureInstance opponent);
        void UpdateHp(CombatantSide side, int currentHp, int maxHp);
        void DisplayAvailableMoves(IEnumerable<MoveDefinition> moves);
        void DisplayDialogue(string message);
        void SetMoveInputInteractable(bool interactable);
        void ShowBattleEnded(CombatantSide winner, string endMessage);

        event Action<string> OnMoveSelected;
        event Action OnForfeitRequested;
    }
}
