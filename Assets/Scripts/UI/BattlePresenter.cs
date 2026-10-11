using System;
using System.Collections.Generic;
using MonsterLink.Battle;
using MonsterLink.Core;
using MonsterLink.Data;

namespace MonsterLink.UI
{
    /// <summary>
    /// Presenter coordinating the Battle UI with the pure BattleEngine.
    /// Passes user move requests to the engine and updates UI state based on engine step results.
    /// </summary>
    public class BattlePresenter
    {
        private readonly IBattleView _view;
        private readonly BattleEngine _engine;

        public BattlePresenter(IBattleView view, BattleEngine engine)
        {
            if (view == null) throw new ArgumentNullException("view");
            if (engine == null) throw new ArgumentNullException("engine");

            _view = view;
            _engine = engine;

            _view.OnMoveSelected += HandleMoveSelected;
            _view.OnForfeitRequested += HandleForfeitRequested;
        }

        public void Initialize()
        {
            _view.DisplayCombatants(_engine.PlayerCreature, _engine.OpponentCreature);
            _view.UpdateHp(CombatantSide.Player, _engine.PlayerCreature.CurrentHp, _engine.PlayerCreature.MaxHp);
            _view.UpdateHp(CombatantSide.Opponent, _engine.OpponentCreature.CurrentHp, _engine.OpponentCreature.MaxHp);

            // Populate moves
            List<MoveDefinition> moves = new List<MoveDefinition>();
            if (_engine.PlayerCreature.KnownMoveIds != null)
            {
                for (int i = 0; i < _engine.PlayerCreature.KnownMoveIds.Count; i++)
                {
                    MoveDefinition m = CreatureCatalog.GetMove(_engine.PlayerCreature.KnownMoveIds[i]);
                    if (m != null) moves.Add(m);
                }
            }
            _view.DisplayAvailableMoves(moves);

            _view.DisplayDialogue(string.Format("A battle started between {0} and {1}! What will {0} do?",
                _engine.PlayerCreature.Nickname, _engine.OpponentCreature.Nickname));

            _view.SetMoveInputInteractable(true);
        }

        public void HandleMoveSelected(string moveId)
        {
            if (_engine.IsBattleOver) return;

            _view.SetMoveInputInteractable(false);

            try
            {
                TurnResult turnResult = _engine.ExecuteTurn(moveId);

                // Update HP and narration from turn steps
                foreach (CombatActionStep step in turnResult.Steps)
                {
                    CombatantSide defenderSide = step.Actor == CombatantSide.Player
                        ? CombatantSide.Opponent
                        : CombatantSide.Player;

                    _view.UpdateHp(defenderSide, step.DefenderHpRemaining, step.DefenderMaxHp);
                    _view.DisplayDialogue(step.NarrationLog);
                }

                if (turnResult.IsBattleOver)
                {
                    _view.ShowBattleEnded(turnResult.Winner.Value, turnResult.EndingMessage);
                }
                else
                {
                    _view.SetMoveInputInteractable(true);
                }
            }
            catch (Exception ex)
            {
                _view.DisplayDialogue("Error: " + ex.Message);
                _view.SetMoveInputInteractable(true);
            }
        }

        public void HandleForfeitRequested()
        {
            if (_engine.IsBattleOver) return;

            _engine.Forfeit();
            _view.SetMoveInputInteractable(false);
            _view.ShowBattleEnded(CombatantSide.Opponent, "Match forfeited.");
        }
    }
}
