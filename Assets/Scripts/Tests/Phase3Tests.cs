using System;
using System.Collections.Generic;
using MonsterLink.Battle;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.UI;

namespace MonsterLink.Tests
{
    /// <summary>
    /// Automated test harness for Phase 3 verification:
    /// - Deterministic damage calculations
    /// - Type effectiveness multipliers
    /// - Minimum damage constraint (at least 1 HP)
    /// - Speed-based turn order resolution
    /// - Fainted creatures short-circuiting counter-attacks
    /// - Invalid / unlearned move fallback handling
    /// - Victory and defeat state evaluation
    /// - Deterministic repeatable results across multiple runs
    /// - UI Presenter integration & HP synchronization
    /// </summary>
    public class Phase3Tests
    {
        private static int _passCount = 0;
        private static int _failCount = 0;

        public static int Main(string[] args)
        {
            Console.WriteLine("=================================================");
            Console.WriteLine("     MONSTERLINK PHASE 3 AUTOMATED TEST SUITE    ");
            Console.WriteLine("=================================================");
            Console.WriteLine();

            RunTest("TC-301: Deterministic Damage Calculation Math", () => TestDamageFormulaMath());
            RunTest("TC-302: Type Effectiveness Multipliers", () => TestTypeMultipliers());
            RunTest("TC-303: Minimum Damage Constraint (>= 1 HP)", () => TestMinimumDamageConstraint());
            RunTest("TC-304: Speed-Based Turn Order Resolution", () => TestTurnOrderSpeedPriority());
            RunTest("TC-305: Fainted Creature Short-Circuiting", () => TestFaintedCreatureHaltsAction());
            RunTest("TC-306: Invalid Move Handling & Fallback", () => TestInvalidMoveHandling());
            RunTest("TC-307: Victory and Defeat Detection", () => TestVictoryAndDefeatDetection());
            RunTest("TC-308: Repeatable Deterministic Combat Run", () => TestRepeatableCombatResults());
            RunTest("TC-309: UI Presenter HP Synchronization", () => TestBattlePresenterSync());

            Console.WriteLine();
            Console.WriteLine("-------------------------------------------------");
            Console.WriteLine(string.Format("Test Results: {0} Passed, {1} Failed", _passCount, _failCount));
            Console.WriteLine("-------------------------------------------------");

            return _failCount == 0 ? 0 : 1;
        }

        private static void RunTest(string testName, Action testAction)
        {
            Console.Write(string.Format("[RUNNING] {0} ... ", testName));
            try
            {
                testAction();
                _passCount++;
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("PASSED");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                _failCount++;
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("FAILED");
                Console.ResetColor();
                Console.WriteLine("   -> Error: " + ex.Message);
            }
        }

        private static void Assert(bool condition, string message)
        {
            if (!condition)
            {
                throw new Exception("Assertion Failed: " + message);
            }
        }

        // TC-301: Exact damage formula test
        // Level = 5, Attacker ATK = 10, Defender DEF = 10, Move PWR = 40, Type Mult = 1.0
        // LevelFactor = floor( (2 * 5) / 5 ) + 2 = 2 + 2 = 4
        // StatFactor = (40 * 10) / (10 * 50) = 400 / 500 = 0.8
        // BaseDamage = floor( 4 * 0.8 + 2 ) = floor( 3.2 + 2 ) = floor( 5.2 ) = 5
        // TotalDamage = floor( 5 * 1.0 ) = 5
        private static void TestDamageFormulaMath()
        {
            MoveDefinition move = new MoveDefinition("test_strike", "Test Strike", ElementType.Normal, 40, 100, "");
            DamageCalculationResult res = BattleDamageCalculator.CalculateDamage(5, 10, 10, move, ElementType.Normal);

            Assert(res.Damage == 5, string.Format("Expected damage 5, but got {0}", res.Damage));
            Assert(res.TypeMultiplier == 1.0f, "Type multiplier must be 1.0");
            Assert(res.Effectiveness == MoveEffectiveness.Neutral, "Effectiveness must be Neutral");
        }

        // TC-302: Type effectiveness multipliers
        private static void TestTypeMultipliers()
        {
            MoveDefinition fireMove = new MoveDefinition("fire_test", "Fire Test", ElementType.Fire, 40, 100, "");

            // Fire vs Grass -> 2.0x (Super Effective)
            DamageCalculationResult superRes = BattleDamageCalculator.CalculateDamage(5, 10, 10, fireMove, ElementType.Grass);
            Assert(superRes.TypeMultiplier == 2.0f, "Fire vs Grass must be 2.0x");
            Assert(superRes.Effectiveness == MoveEffectiveness.SuperEffective, "Must be SuperEffective");

            // Fire vs Water -> 0.5x (Not Very Effective)
            DamageCalculationResult weakRes = BattleDamageCalculator.CalculateDamage(5, 10, 10, fireMove, ElementType.Water);
            Assert(weakRes.TypeMultiplier == 0.5f, "Fire vs Water must be 0.5x");
            Assert(weakRes.Effectiveness == MoveEffectiveness.NotVeryEffective, "Must be NotVeryEffective");

            // Fire vs Fire -> 1.0x (Neutral in our chart)
            DamageCalculationResult neutralRes = BattleDamageCalculator.CalculateDamage(5, 10, 10, fireMove, ElementType.Fire);
            Assert(neutralRes.TypeMultiplier == 1.0f, "Fire vs Fire must be 1.0x");
            Assert(neutralRes.Effectiveness == MoveEffectiveness.Neutral, "Must be Neutral");
        }

        // TC-303: Minimum damage constraint (never 0 or negative)
        private static void TestMinimumDamageConstraint()
        {
            // Level 1, ATK 1, Move Power 1 against extreme DEF 9999 with 0.5x weak type
            MoveDefinition weakMove = new MoveDefinition("tickle", "Tickle", ElementType.Fire, 1, 100, "");
            DamageCalculationResult res = BattleDamageCalculator.CalculateDamage(1, 1, 9999, weakMove, ElementType.Water);

            Assert(res.Damage == 1, string.Format("Damage must be at least 1, but got {0}", res.Damage));
        }

        // TC-304: Speed-based turn order resolution
        private static void TestTurnOrderSpeedPriority()
        {
            // Creature A is faster (Speed 50) than Creature B (Speed 20)
            CreatureInstance fastCreature = new CreatureInstance(
                "fast_01", "species_voltkit", "Fast Voltkit", 5, 30, 30, 15, 10, 50, new[] { "spark_claw" });

            CreatureInstance slowCreature = new CreatureInstance(
                "slow_01", "species_floraslug", "Slow Floraslug", 5, 30, 30, 10, 15, 20, new[] { "vine_whip" });

            // Case 1: Player is faster
            BattleEngine enginePlayerFast = new BattleEngine(fastCreature, slowCreature);
            TurnResult res1 = enginePlayerFast.ExecuteTurn("spark_claw");
            Assert(res1.Steps.Count == 2, "Turn must have 2 steps");
            Assert(res1.Steps[0].Actor == CombatantSide.Player, "Fast player must attack first");
            Assert(res1.Steps[1].Actor == CombatantSide.Opponent, "Slow opponent must attack second");

            // Case 2: Opponent is faster
            BattleEngine engineOppFast = new BattleEngine(slowCreature, fastCreature);
            TurnResult res2 = engineOppFast.ExecuteTurn("vine_whip");
            Assert(res2.Steps.Count == 2, "Turn must have 2 steps");
            Assert(res2.Steps[0].Actor == CombatantSide.Opponent, "Fast opponent must attack first");
            Assert(res2.Steps[1].Actor == CombatantSide.Player, "Slow player must attack second");

            // Case 3: Speed tie (Player wins deterministic tiebreaker)
            CreatureInstance tiedPlayer = new CreatureInstance(
                "tie_p", "species_ignisaur", "Player Tie", 5, 30, 30, 10, 10, 30, new[] { "flame_burst" });
            CreatureInstance tiedOpp = new CreatureInstance(
                "tie_o", "species_ignisaur", "Opponent Tie", 5, 30, 30, 10, 10, 30, new[] { "flame_burst" });

            BattleEngine engineTie = new BattleEngine(tiedPlayer, tiedOpp);
            TurnResult resTie = engineTie.ExecuteTurn("flame_burst");
            Assert(resTie.Steps[0].Actor == CombatantSide.Player, "Speed tie must resolve with Player acting first");
        }

        // TC-305: Fainted creature short-circuits counter-attack
        private static void TestFaintedCreatureHaltsAction()
        {
            // Player is faster and deals lethal damage in step 1
            CreatureInstance glassCannon = new CreatureInstance(
                "canon", "species_ignisaur", "Cannon", 10, 50, 50, 99, 10, 80, new[] { "flame_burst" });

            CreatureInstance fragileOpp = new CreatureInstance(
                "fragile", "species_floraslug", "Fragile", 1, 2, 2, 5, 5, 10, new[] { "tackle" });

            BattleEngine engine = new BattleEngine(glassCannon, fragileOpp);
            TurnResult res = engine.ExecuteTurn("flame_burst");

            Assert(res.IsBattleOver, "Battle must end on faint");
            Assert(res.Winner == CombatantSide.Player, "Player must win");
            Assert(res.Steps.Count == 1, "Only step 1 should execute; fragile opp fainted before attacking");
            Assert(engine.OpponentCreature.IsFainted, "Opponent must be fainted");
            Assert(engine.PlayerCreature.CurrentHp == 50, "Player must have taken 0 damage since opp never attacked");
        }

        // TC-306: Invalid move handling & fallback
        private static void TestInvalidMoveHandling()
        {
            CreatureInstance c1 = CreatureFactory.CreateInstance("species_ignisaur", null, "Iggy", 5);
            CreatureInstance c2 = CreatureFactory.CreateInstance("species_aquabite", null, "Aqua", 5);

            BattleEngine engine = new BattleEngine(c1, c2);

            // Pass invalid move ID not known by creature
            TurnResult res = engine.ExecuteTurn("invalid_hyper_beam_9999");
            Assert(res.Steps.Count > 0, "Turn should execute using valid fallback move");
            Assert(res.Steps[0].MoveUsed != null, "A valid move must be selected");
        }

        // TC-307: Victory and defeat detection
        private static void TestVictoryAndDefeatDetection()
        {
            CreatureInstance p = CreatureFactory.CreateInstance("species_ignisaur", null, "Hero", 5);
            CreatureInstance o = CreatureFactory.CreateInstance("species_floraslug", null, "Foe", 5);

            BattleEngine engine = new BattleEngine(p, o);

            // Battle until end
            int turnCount = 0;
            while (!engine.IsBattleOver && turnCount < 20)
            {
                engine.ExecuteTurn("flame_burst");
                turnCount++;
            }

            Assert(engine.IsBattleOver, "Battle must conclude");
            Assert(engine.Winner != null, "Winner must be declared");
            Assert(engine.PlayerCreature.IsFainted || engine.OpponentCreature.IsFainted, "One creature must be fainted");
        }

        // TC-308: Repeatable deterministic combat run
        private static void TestRepeatableCombatResults()
        {
            // Run two identical battles from scratch with identical seeds and inputs
            CreatureInstance p1 = CreatureFactory.CreateInstance("species_voltkit", null, "Sparky", 5);
            CreatureInstance o1 = CreatureFactory.CreateInstance("species_aquabite", null, "Crabby", 5);
            BattleEngine run1 = new BattleEngine(p1, o1);

            CreatureInstance p2 = CreatureFactory.CreateInstance("species_voltkit", null, "Sparky", 5);
            CreatureInstance o2 = CreatureFactory.CreateInstance("species_aquabite", null, "Crabby", 5);
            BattleEngine run2 = new BattleEngine(p2, o2);

            List<int> run1Damages = new List<int>();
            List<int> run2Damages = new List<int>();

            while (!run1.IsBattleOver && !run2.IsBattleOver)
            {
                TurnResult r1 = run1.ExecuteTurn("spark_claw");
                TurnResult r2 = run2.ExecuteTurn("spark_claw");

                foreach (CombatActionStep s in r1.Steps) run1Damages.Add(s.DamageDealt);
                foreach (CombatActionStep s in r2.Steps) run2Damages.Add(s.DamageDealt);
            }

            Assert(run1.IsBattleOver == run2.IsBattleOver, "Both runs must conclude at identical points");
            Assert(run1.Winner == run2.Winner, "Both runs must declare identical winner");
            Assert(run1.CurrentTurn == run2.CurrentTurn, "Both runs must take identical turn count");
            Assert(run1Damages.Count == run2Damages.Count, "Both runs must execute identical step count");

            for (int i = 0; i < run1Damages.Count; i++)
            {
                Assert(run1Damages[i] == run2Damages[i], string.Format("Step {0} damage must match: {1} vs {2}",
                    i, run1Damages[i], run2Damages[i]));
            }
        }

        // TC-309: UI Presenter synchronization
        private static void TestBattlePresenterSync()
        {
            CreatureInstance p = CreatureFactory.CreateInstance("species_ignisaur", null, "Flame", 5);
            CreatureInstance o = CreatureFactory.CreateInstance("species_floraslug", null, "Slug", 5);
            BattleEngine engine = new BattleEngine(p, o);

            MockBattleView mockView = new MockBattleView();
            BattlePresenter presenter = new BattlePresenter(mockView, engine);

            presenter.Initialize();
            Assert(mockView.DisplayedPlayer != null, "Player must be displayed");
            Assert(mockView.DisplayedOpponent != null, "Opponent must be displayed");
            Assert(mockView.IsInputInteractable, "Move input must be enabled initially");

            // Simulate player clicking move
            mockView.SimulatePlayerSelectMove("flame_burst");

            Assert(mockView.LastOpponentHp < o.MaxHp, "Opponent HP must be reduced on view");
            Assert(!string.IsNullOrEmpty(mockView.LastDialogue), "Dialogue must be populated");
        }
    }
}
