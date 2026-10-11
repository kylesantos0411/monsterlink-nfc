using System;
using System.Collections.Generic;
using MonsterLink.Battle;
using MonsterLink.Core;
using MonsterLink.Data;

namespace MonsterLink.Records
{
    /// <summary>
    /// Factory for generating immutable BattleRecord instances from BattleEngine matches.
    /// Handles extraction of starting/ending HP, action steps summary, and outcome mapping.
    /// </summary>
    public static class BattleRecordFactory
    {
        /// <summary>
        /// Creates a BattleRecord from an ended or aborted battle engine session.
        /// </summary>
        /// <param name="engine">The battle engine that executed the match.</param>
        /// <param name="playerStartHp">Original starting HP of player creature.</param>
        /// <param name="opponentStartHp">Original starting HP of opponent creature.</param>
        /// <param name="recordId">Optional specific record ID; generates UUID if null.</param>
        /// <param name="notes">Optional match notes.</param>
        public static BattleRecord Create(
            BattleEngine engine,
            int playerStartHp,
            int opponentStartHp,
            string recordId = null,
            string notes = null)
        {
            if (engine == null)
            {
                throw new ArgumentNullException("engine");
            }

            string id = !string.IsNullOrEmpty(recordId) ? recordId : "bat_" + Guid.NewGuid().ToString("N");

            CreatureSpecies playerSpecies = CreatureCatalog.GetSpecies(engine.PlayerCreature.SpeciesId);
            string playerSpeciesName = playerSpecies != null ? playerSpecies.DisplayName : engine.PlayerCreature.SpeciesId;

            CreatureSpecies opponentSpecies = CreatureCatalog.GetSpecies(engine.OpponentCreature.SpeciesId);
            string opponentSpeciesName = opponentSpecies != null ? opponentSpecies.DisplayName : engine.OpponentCreature.SpeciesId;

            CreatureCombatSummary playerSummary = new CreatureCombatSummary(
                engine.PlayerCreature.InstanceId,
                engine.PlayerCreature.SpeciesId,
                playerSpeciesName,
                engine.PlayerCreature.Nickname,
                engine.PlayerCreature.Level,
                playerStartHp,
                engine.PlayerCreature.CurrentHp,
                engine.PlayerCreature.MaxHp
            );

            CreatureCombatSummary opponentSummary = new CreatureCombatSummary(
                engine.OpponentCreature.InstanceId,
                engine.OpponentCreature.SpeciesId,
                opponentSpeciesName,
                engine.OpponentCreature.Nickname,
                engine.OpponentCreature.Level,
                opponentStartHp,
                engine.OpponentCreature.CurrentHp,
                engine.OpponentCreature.MaxHp
            );

            // Determine outcome, winner, loser
            BattleOutcome outcome;
            string winnerName = string.Empty;
            string loserName = string.Empty;

            if (!engine.IsBattleOver)
            {
                outcome = BattleOutcome.Aborted;
                notes = string.IsNullOrEmpty(notes) ? "Battle exited or interrupted before completion" : notes;
            }
            else if (engine.Winner == CombatantSide.Player)
            {
                outcome = BattleOutcome.Victory;
                winnerName = engine.PlayerCreature.Nickname;
                loserName = engine.OpponentCreature.Nickname;
            }
            else if (engine.Winner == CombatantSide.Opponent)
            {
                outcome = BattleOutcome.Defeat;
                winnerName = engine.OpponentCreature.Nickname;
                loserName = engine.PlayerCreature.Nickname;
            }
            else
            {
                outcome = BattleOutcome.Aborted;
            }

            // Summarize moves used from action steps
            List<string> movesSummary = new List<string>();
            if (engine.ActionLog != null)
            {
                for (int i = 0; i < engine.ActionLog.Count; i++)
                {
                    CombatActionStep step = engine.ActionLog[i];
                    if (step != null && step.MoveUsed != null)
                    {
                        string entry = string.Format("{0} used {1} ({2} dmg) -> {3}",
                            step.AttackerName,
                            step.MoveUsed.Name,
                            step.DamageDealt,
                            step.DefenderName);
                        movesSummary.Add(entry);
                    }
                    else if (step != null && !string.IsNullOrEmpty(step.NarrationLog))
                    {
                        movesSummary.Add(step.NarrationLog);
                    }
                }
            }

            int turns = Math.Max(1, engine.CurrentTurn);

            return new BattleRecord(
                id,
                DateTime.UtcNow.ToString("o"),
                playerSummary,
                opponentSummary,
                turns,
                movesSummary,
                winnerName,
                loserName,
                outcome,
                notes
            );
        }
    }
}
