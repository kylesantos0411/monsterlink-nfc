using System;
using System.Collections.Generic;
using MonsterLink.Core;
using MonsterLink.Data;

namespace MonsterLink.Battle
{
    /// <summary>
    /// Pure, deterministic turn-based combat engine.
    /// Manages creature battle states, speed priority, action queues, faint handling, and victory evaluation.
    /// Fully independent of UnityEngine and rendering systems.
    /// </summary>
    public class BattleEngine
    {
        public CreatureInstance PlayerCreature { get; private set; }
        public CreatureInstance OpponentCreature { get; private set; }

        public int CurrentTurn { get; private set; }
        public bool IsBattleOver { get; private set; }
        public CombatantSide? Winner { get; private set; }
        public List<CombatActionStep> ActionLog { get; private set; }

        public BattleEngine(CreatureInstance playerCreature, CreatureInstance opponentCreature)
        {
            if (playerCreature == null) throw new ArgumentNullException("playerCreature");
            if (opponentCreature == null) throw new ArgumentNullException("opponentCreature");

            // Clone creatures to keep battle state isolated
            PlayerCreature = CloneCreature(playerCreature);
            OpponentCreature = CloneCreature(opponentCreature);

            CurrentTurn = 1;
            IsBattleOver = false;
            Winner = null;
            ActionLog = new List<CombatActionStep>();
        }

        private static CreatureInstance CloneCreature(CreatureInstance src)
        {
            return new CreatureInstance(
                src.InstanceId,
                src.SpeciesId,
                src.Nickname,
                src.Level,
                src.MaxHp,
                src.CurrentHp,
                src.Attack,
                src.Defense,
                src.Speed,
                src.KnownMoveIds,
                src.NfcCardCode,
                src.AcquiredTimestampUtc
            );
        }

        /// <summary>
        /// Selects an opponent move deterministically based on maximum expected damage/type multiplier.
        /// </summary>
        public MoveDefinition SelectOpponentMove()
        {
            if (OpponentCreature.KnownMoveIds == null || OpponentCreature.KnownMoveIds.Count == 0)
            {
                return CreatureCatalog.GetMove("tackle") ?? new MoveDefinition("tackle", "Tackle", ElementType.Normal, 35, 100, "");
            }

            CreatureSpecies playerSpecies = CreatureCatalog.GetSpecies(PlayerCreature.SpeciesId);
            ElementType playerType = playerSpecies != null ? playerSpecies.Type : ElementType.Normal;

            MoveDefinition bestMove = null;
            double bestScore = -1.0;

            for (int i = 0; i < OpponentCreature.KnownMoveIds.Count; i++)
            {
                MoveDefinition move = CreatureCatalog.GetMove(OpponentCreature.KnownMoveIds[i]);
                if (move == null) continue;

                float mult = TypeChart.GetMultiplier(move.Type, playerType);
                double score = move.Power * mult;

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMove = move;
                }
            }

            return bestMove ?? CreatureCatalog.GetMove("tackle");
        }

        /// <summary>
        /// Executes a single round of turn-based combat.
        /// Speed dictates attack order; a fainted creature cannot act.
        /// </summary>
        public TurnResult ExecuteTurn(string playerMoveId, string opponentMoveId = null)
        {
            if (IsBattleOver)
            {
                throw new InvalidOperationException("Cannot execute turn: Battle has already concluded.");
            }

            if (PlayerCreature.IsFainted)
            {
                throw new InvalidOperationException("Player creature has fainted and cannot execute moves.");
            }

            if (OpponentCreature.IsFainted)
            {
                throw new InvalidOperationException("Opponent creature has fainted and cannot execute moves.");
            }

            // 1. Resolve Player Move (with invalid move fallback)
            MoveDefinition playerMove = ResolveValidMove(PlayerCreature, playerMoveId);

            // 2. Resolve Opponent Move
            MoveDefinition opponentMove = !string.IsNullOrEmpty(opponentMoveId)
                ? ResolveValidMove(OpponentCreature, opponentMoveId)
                : SelectOpponentMove();

            List<CombatActionStep> turnSteps = new List<CombatActionStep>();

            // 3. Resolve Speed Priority (Tiebreaker: Player acts first)
            bool playerActsFirst = PlayerCreature.Speed >= OpponentCreature.Speed;

            CreatureInstance firstAttacker = playerActsFirst ? PlayerCreature : OpponentCreature;
            CreatureInstance firstDefender = playerActsFirst ? OpponentCreature : PlayerCreature;
            CombatantSide firstSide = playerActsFirst ? CombatantSide.Player : CombatantSide.Opponent;
            MoveDefinition firstMove = playerActsFirst ? playerMove : opponentMove;

            CreatureInstance secondAttacker = playerActsFirst ? OpponentCreature : PlayerCreature;
            CreatureInstance secondDefender = playerActsFirst ? PlayerCreature : OpponentCreature;
            CombatantSide secondSide = playerActsFirst ? CombatantSide.Opponent : CombatantSide.Player;
            MoveDefinition secondMove = playerActsFirst ? opponentMove : playerMove;

            // --- STEP 1: First Attacker Action ---
            CombatActionStep step1 = ExecuteActionStep(firstSide, firstAttacker, firstDefender, firstMove);
            turnSteps.Add(step1);
            ActionLog.Add(step1);

            // Check if Defender Fainted in Step 1
            if (firstDefender.IsFainted)
            {
                IsBattleOver = true;
                Winner = firstSide;
                string endMsg = string.Format("{0} fainted! {1} wins!", firstDefender.Nickname, firstAttacker.Nickname);

                return new TurnResult(CurrentTurn, turnSteps, true, Winner, endMsg);
            }

            // --- STEP 2: Second Attacker Action (Only executes if still conscious) ---
            CombatActionStep step2 = ExecuteActionStep(secondSide, secondAttacker, secondDefender, secondMove);
            turnSteps.Add(step2);
            ActionLog.Add(step2);

            // Check if Defender Fainted in Step 2
            if (secondDefender.IsFainted)
            {
                IsBattleOver = true;
                Winner = secondSide;
                string endMsg = string.Format("{0} fainted! {1} wins!", secondDefender.Nickname, secondAttacker.Nickname);

                return new TurnResult(CurrentTurn, turnSteps, true, Winner, endMsg);
            }

            // End of round: advance turn counter
            int finishedTurn = CurrentTurn;
            CurrentTurn++;

            return new TurnResult(finishedTurn, turnSteps, false, null, "Turn concluded.");
        }

        private CombatActionStep ExecuteActionStep(
            CombatantSide side,
            CreatureInstance attacker,
            CreatureInstance defender,
            MoveDefinition move)
        {
            DamageCalculationResult calc = BattleDamageCalculator.CalculateDamage(attacker, defender, move);
            defender.TakeDamage(calc.Damage);

            string logMsg = string.Format("{0} used {1}! Dealt {2} damage to {3}.",
                attacker.Nickname, move.Name, calc.Damage, defender.Nickname);

            if (calc.Effectiveness == MoveEffectiveness.SuperEffective)
            {
                logMsg += " It's super effective!";
            }
            else if (calc.Effectiveness == MoveEffectiveness.NotVeryEffective)
            {
                logMsg += " It's not very effective...";
            }

            if (defender.IsFainted)
            {
                logMsg += string.Format(" {0} fainted!", defender.Nickname);
            }

            return new CombatActionStep(
                side,
                attacker.Nickname,
                defender.Nickname,
                move,
                calc.Damage,
                calc.Effectiveness,
                defender.CurrentHp,
                defender.MaxHp,
                defender.IsFainted,
                logMsg
            );
        }

        private static MoveDefinition ResolveValidMove(CreatureInstance creature, string moveId)
        {
            // If moveId is null or empty, or not in known moves, fallback to first known move
            if (string.IsNullOrEmpty(moveId) || !creature.KnownMoveIds.Contains(moveId))
            {
                if (creature.KnownMoveIds != null && creature.KnownMoveIds.Count > 0)
                {
                    moveId = creature.KnownMoveIds[0];
                }
                else
                {
                    moveId = "tackle";
                }
            }

            MoveDefinition move = CreatureCatalog.GetMove(moveId);
            if (move == null)
            {
                move = CreatureCatalog.GetMove("tackle") ?? new MoveDefinition("tackle", "Tackle", ElementType.Normal, 35, 100, "");
            }
            return move;
        }

        public void Forfeit()
        {
            if (IsBattleOver) return;

            IsBattleOver = true;
            Winner = CombatantSide.Opponent;
        }
    }
}
