using System;
using System.Collections.Generic;
using System.IO;
using MonsterLink.Battle;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.Records;
using MonsterLink.UI;

namespace MonsterLink.Tests
{
    /// <summary>
    /// Automated test harness for Phase 4 verification:
    /// - TC-401: Saving completed battle record to repository
    /// - TC-402: Reading battle history and ordering (newest first)
    /// - TC-403: Empty history handling and zero-state reporting
    /// - TC-404: Duplicate battle record write prevention (same RecordId rejected)
    /// - TC-405: App cold restart persistence (old records intact across new storage instance)
    /// - TC-406: BattleHistoryPresenter and MockBattleDetailView interaction
    /// - TC-407: BattleRecordFactory accurately captures match metrics (HP, moves, winner)
    /// - TC-408: Aborted battle recorded properly with BattleOutcome.Aborted
    /// </summary>
    public class Phase4Tests
    {
        private static int _passCount = 0;
        private static int _failCount = 0;

        public static int Main(string[] args)
        {
            Console.WriteLine("=================================================");
            Console.WriteLine("     MONSTERLINK PHASE 4 AUTOMATED TEST SUITE    ");
            Console.WriteLine("=================================================");
            Console.WriteLine();

            RunTest("TC-401: Save Completed Battle Record to Repository", () => TestSaveCompletedRecord());
            RunTest("TC-402: Read History and Order Records (Newest First)", () => TestReadHistoryAndOrdering());
            RunTest("TC-403: Empty History Handling and Zero State", () => TestEmptyHistoryHandling());
            RunTest("TC-404: Prevent Duplicate Record Writes (Same RecordId)", () => TestDuplicateRecordPrevention());
            RunTest("TC-405: Cold Restart Persistence Across Storage Instances", () => TestColdRestartPersistence());
            RunTest("TC-406: Battle History Presenter and Detail View Selection", () => TestPresenterAndDetailSelection());
            RunTest("TC-407: BattleRecordFactory Captures HP, Moves, and Winner", () => TestBattleRecordFactoryMetrics());
            RunTest("TC-408: Aborted Battle Captured with BattleOutcome.Aborted", () => TestAbortedBattleOutcome());

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
                Console.WriteLine(string.Format("   Error: {0}", ex.Message));
                Console.WriteLine(string.Format("   Stack: {0}", ex.StackTrace));
            }
        }

        private static void Assert(bool condition, string message)
        {
            if (!condition)
            {
                throw new Exception("Assertion Failed: " + message);
            }
        }

        private static string GetTempTestFile()
        {
            string dir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestOutput");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, "test_battle_history_" + Guid.NewGuid().ToString("N") + ".json");
        }

        // --- TESTS ---

        private static void TestSaveCompletedRecord()
        {
            string testFile = GetTempTestFile();
            try
            {
                JsonBattleHistoryStorage storage = new JsonBattleHistoryStorage(testFile);
                Assert(storage.Count == 0, "Initial storage should be empty.");

                CreatureCombatSummary p = new CreatureCombatSummary("p_1", "sp_emberfox", "Emberfox", "Sparky", 5, 42, 28, 42);
                CreatureCombatSummary o = new CreatureCombatSummary("o_1", "sp_aquafin", "Aquafin", "Splashy", 5, 48, 0, 48);

                List<string> moves = new List<string>();
                moves.Add("T1 Player: Flame Swipe (18 dmg)");
                moves.Add("T1 Opponent: Bubble Stream (14 dmg)");
                moves.Add("T2 Player: Flame Swipe (18 dmg)");

                BattleRecord record = new BattleRecord(
                    "bat_001",
                    "2026-10-11T12:00:00Z",
                    p,
                    o,
                    2,
                    moves,
                    "Sparky",
                    "Splashy",
                    BattleOutcome.Victory,
                    "First arena test win"
                );

                bool added = storage.Add(record);
                Assert(added, "Storage.Add should succeed for new record.");
                Assert(storage.Count == 1, "Storage count should be 1.");

                BattleRecord fetched = storage.GetById("bat_001");
                Assert(fetched != null, "Fetched record should not be null.");
                Assert(fetched.RecordId == "bat_001", "RecordId matches.");
                Assert(fetched.Outcome == BattleOutcome.Victory, "Outcome matches Victory.");
                Assert(fetched.PlayerCreature.StartHp == 42 && fetched.PlayerCreature.EndHp == 28, "Player HP recorded accurately.");
                Assert(fetched.OpponentCreature.EndHp == 0, "Opponent ended at 0 HP.");
                Assert(fetched.TurnCount == 2, "Turn count matches 2.");
                Assert(fetched.MovesUsedSummary.Count == 3, "All 3 move steps recorded.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestReadHistoryAndOrdering()
        {
            string testFile = GetTempTestFile();
            try
            {
                JsonBattleHistoryStorage storage = new JsonBattleHistoryStorage(testFile);

                CreatureCombatSummary p = new CreatureCombatSummary("p_1", "sp_emberfox", "Emberfox", "Sparky", 5, 42, 20, 42);
                CreatureCombatSummary o = new CreatureCombatSummary("o_1", "sp_thundercub", "Thundercub", "Jolt", 5, 40, 0, 40);

                BattleRecord rec1 = new BattleRecord("bat_101", "2026-10-11T10:00:00Z", p, o, 3, null, "Sparky", "Jolt", BattleOutcome.Victory);
                BattleRecord rec2 = new BattleRecord("bat_102", "2026-10-11T11:00:00Z", p, o, 4, null, "Jolt", "Sparky", BattleOutcome.Defeat);
                BattleRecord rec3 = new BattleRecord("bat_103", "2026-10-11T12:00:00Z", p, o, 1, null, "Sparky", "Jolt", BattleOutcome.Victory);

                storage.Add(rec1);
                storage.Add(rec2);
                storage.Add(rec3);

                IReadOnlyList<BattleRecord> all = storage.GetAll();
                Assert(all.Count == 3, "Should return all 3 records.");
                // GetAll returns newest first
                Assert(all[0].RecordId == "bat_103", "Newest record bat_103 should be first.");
                Assert(all[1].RecordId == "bat_102", "Middle record bat_102 should be second.");
                Assert(all[2].RecordId == "bat_101", "Oldest record bat_101 should be last.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestEmptyHistoryHandling()
        {
            string testFile = GetTempTestFile();
            try
            {
                JsonBattleHistoryStorage storage = new JsonBattleHistoryStorage(testFile);
                Assert(storage.Count == 0, "Count should be 0.");
                Assert(storage.GetAll().Count == 0, "GetAll should return empty list.");
                Assert(storage.GetById("non_existent") == null, "GetById on non-existent returns null.");

                MockBattleHistoryView mockView = new MockBattleHistoryView();
                BattleHistoryPresenter presenter = new BattleHistoryPresenter(storage, mockView);
                presenter.RefreshView();

                Assert(mockView.IsEmptyStateDisplayed, "Empty state must be displayed.");
                Assert(mockView.LastRecordCount == 0, "Record count must report 0.");
                Assert(mockView.LastDisplayedRecords != null && mockView.LastDisplayedRecords.Count == 0, "Displayed records list should be empty.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestDuplicateRecordPrevention()
        {
            string testFile = GetTempTestFile();
            try
            {
                JsonBattleHistoryStorage storage = new JsonBattleHistoryStorage(testFile);

                CreatureCombatSummary p = new CreatureCombatSummary("p_1", "sp_emberfox", "Emberfox", "Sparky", 5, 42, 20, 42);
                CreatureCombatSummary o = new CreatureCombatSummary("o_1", "sp_mossback", "Mossback", "Leafy", 5, 52, 0, 52);

                BattleRecord rec = new BattleRecord("bat_dup_1", "2026-10-11T10:00:00Z", p, o, 3, null, "Sparky", "Leafy", BattleOutcome.Victory);

                bool firstAdd = storage.Add(rec);
                Assert(firstAdd == true, "First add must succeed.");
                Assert(storage.Count == 1, "Storage count should be 1.");

                // Attempt to add identical RecordId again
                bool secondAdd = storage.Add(rec);
                Assert(secondAdd == false, "Duplicate add must be rejected (return false).");
                Assert(storage.Count == 1, "Storage count must remain 1.");

                // Attempt to add different record object but same RecordId
                BattleRecord recDuplicateId = new BattleRecord("bat_dup_1", "2026-10-11T11:00:00Z", p, o, 5, null, "Sparky", "Leafy", BattleOutcome.Victory);
                bool thirdAdd = storage.Add(recDuplicateId);
                Assert(thirdAdd == false, "Duplicate RecordId on different object must also be rejected.");
                Assert(storage.Count == 1, "Storage count must still remain 1.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestColdRestartPersistence()
        {
            string testFile = GetTempTestFile();
            try
            {
                // Instance 1: write 2 battle records
                JsonBattleHistoryStorage session1 = new JsonBattleHistoryStorage(testFile);

                CreatureCombatSummary p1 = new CreatureCombatSummary("p_1", "sp_emberfox", "Emberfox", "Sparky", 5, 42, 10, 42);
                CreatureCombatSummary o1 = new CreatureCombatSummary("o_1", "sp_aquafin", "Aquafin", "Finny", 5, 48, 0, 48);
                BattleRecord rec1 = new BattleRecord("bat_cold_1", "2026-10-11T09:00:00Z", p1, o1, 3, null, "Sparky", "Finny", BattleOutcome.Victory);

                CreatureCombatSummary p2 = new CreatureCombatSummary("p_2", "sp_thundercub", "Thundercub", "Zappy", 5, 40, 0, 40);
                CreatureCombatSummary o2 = new CreatureCombatSummary("o_2", "sp_brambleclaw", "Brambleclaw", "Spiky", 5, 45, 12, 45);
                BattleRecord rec2 = new BattleRecord("bat_cold_2", "2026-10-11T09:30:00Z", p2, o2, 2, null, "Spiky", "Zappy", BattleOutcome.Defeat);

                session1.Add(rec1);
                session1.Add(rec2);
                Assert(session1.Count == 2, "Session 1 recorded 2 matches.");

                // Instance 2 (Cold restart simulation): instantiate new repository pointing to the same file path
                JsonBattleHistoryStorage session2 = new JsonBattleHistoryStorage(testFile);
                Assert(session2.Count == 2, "Cold restart must reload both stored matches.");

                BattleRecord loadedRec1 = session2.GetById("bat_cold_1");
                Assert(loadedRec1 != null, "bat_cold_1 must be loaded.");
                Assert(loadedRec1.WinnerName == "Sparky", "Loaded record winner matches.");
                Assert(loadedRec1.Outcome == BattleOutcome.Victory, "Loaded record outcome matches Victory.");

                BattleRecord loadedRec2 = session2.GetById("bat_cold_2");
                Assert(loadedRec2 != null, "bat_cold_2 must be loaded.");
                Assert(loadedRec2.WinnerName == "Spiky", "Loaded record winner matches Spiky.");
                Assert(loadedRec2.Outcome == BattleOutcome.Defeat, "Loaded record outcome matches Defeat.");

                // Check duplicate prevention still active on loaded data
                bool dupAdd = session2.Add(new BattleRecord("bat_cold_1", "time", p1, o1, 1, null, "W", "L", BattleOutcome.Victory));
                Assert(dupAdd == false, "Duplicate check must work on reloaded records.");
                Assert(session2.Count == 2, "Count should not increase after rejected duplicate.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestPresenterAndDetailSelection()
        {
            string testFile = GetTempTestFile();
            try
            {
                JsonBattleHistoryStorage storage = new JsonBattleHistoryStorage(testFile);

                CreatureCombatSummary p = new CreatureCombatSummary("p_1", "sp_emberfox", "Emberfox", "Sparky", 5, 42, 25, 42);
                CreatureCombatSummary o = new CreatureCombatSummary("o_1", "sp_aquafin", "Aquafin", "Finny", 5, 48, 0, 48);

                List<string> moves = new List<string>();
                moves.Add("T1 Player: Flame Swipe (18 dmg)");
                moves.Add("T1 Opponent: Bubble Stream (17 dmg)");

                BattleRecord rec = new BattleRecord("bat_sel_1", "2026-10-11T15:00:00Z", p, o, 1, moves, "Sparky", "Finny", BattleOutcome.Victory);
                storage.Add(rec);

                MockBattleHistoryView historyView = new MockBattleHistoryView();
                MockBattleDetailView detailView = new MockBattleDetailView();

                BattleHistoryPresenter presenter = new BattleHistoryPresenter(storage, historyView, detailView);
                presenter.RefreshView();

                Assert(!historyView.IsEmptyStateDisplayed, "Empty state should be false.");
                Assert(historyView.LastRecordCount == 1, "Record count must be 1.");
                Assert(detailView.IsVisible == false, "Detail view initially hidden.");

                // Simulate selecting record
                historyView.SimulateSelectRecord("bat_sel_1");

                Assert(detailView.IsVisible == true, "Detail view should be visible after selecting record.");
                Assert(detailView.LastDisplayedRecord != null, "Last displayed record not null.");
                Assert(detailView.LastDisplayedRecord.RecordId == "bat_sel_1", "Detail view received bat_sel_1.");
                Assert(detailView.LastDisplayedRecord.MovesUsedSummary.Count == 2, "Detail view has all move steps.");

                // Hide detail view
                detailView.Hide();
                Assert(detailView.IsVisible == false, "Detail view successfully hidden.");
            }
            finally
            {
                if (File.Exists(testFile)) File.Delete(testFile);
            }
        }

        private static void TestBattleRecordFactoryMetrics()
        {
            // Set up test creatures and combat
            CreatureInstance ignisaur = CreatureFactory.CreateInstance(
                CreatureCatalog.GetSpecies("species_ignisaur"),
                "NFC-CARD-001",
                "Sparky",
                5
            );

            CreatureInstance aquabite = CreatureFactory.CreateInstance(
                CreatureCatalog.GetSpecies("species_aquabite"),
                "NFC-CARD-002",
                "Splashy",
                5
            );

            int startPlayerHp = ignisaur.CurrentHp;
            int startOpponentHp = aquabite.CurrentHp;

            BattleEngine engine = new BattleEngine(ignisaur, aquabite);

            // Execute combat until complete
            while (!engine.IsBattleOver && engine.CurrentTurn < 10)
            {
                engine.ExecuteTurn("flame_burst");
            }

            Assert(engine.IsBattleOver, "Battle should finish.");

            BattleRecord record = BattleRecordFactory.Create(engine, startPlayerHp, startOpponentHp, "bat_fact_1", "Factory test");

            Assert(record != null, "BattleRecord must be generated.");
            Assert(record.RecordId == "bat_fact_1", "RecordId preserved.");
            Assert(record.PlayerCreature.StartHp == startPlayerHp, "Start player HP accurately captured.");
            Assert(record.OpponentCreature.StartHp == startOpponentHp, "Start opponent HP accurately captured.");
            Assert(record.PlayerCreature.EndHp == engine.PlayerCreature.CurrentHp, "End player HP accurately captured.");
            Assert(record.OpponentCreature.EndHp == engine.OpponentCreature.CurrentHp, "End opponent HP accurately captured.");
            Assert(record.MovesUsedSummary.Count > 0, "Moves summary populated.");
            Assert(record.Outcome == BattleOutcome.Victory || record.Outcome == BattleOutcome.Defeat, "Outcome is definitive.");
            Assert(!string.IsNullOrEmpty(record.WinnerName), "WinnerName populated.");
        }

        private static void TestAbortedBattleOutcome()
        {
            CreatureInstance ignisaur = CreatureFactory.CreateInstance(
                CreatureCatalog.GetSpecies("species_ignisaur"),
                "NFC-CARD-001",
                "Sparky",
                5
            );

            CreatureInstance aquabite = CreatureFactory.CreateInstance(
                CreatureCatalog.GetSpecies("species_aquabite"),
                "NFC-CARD-002",
                "Splashy",
                5
            );

            BattleEngine engine = new BattleEngine(ignisaur, aquabite);
            // Execute just 1 turn without finishing
            engine.ExecuteTurn("flame_burst");

            Assert(!engine.IsBattleOver, "Battle is incomplete / mid-game.");

            // Generate record from uncompleted engine (e.g. app closing or forfeit)
            BattleRecord record = BattleRecordFactory.Create(engine, ignisaur.MaxHp, aquabite.MaxHp, "bat_abort_1");

            Assert(record.Outcome == BattleOutcome.Aborted, "Incomplete battle must be marked as Aborted.");
            Assert(string.IsNullOrEmpty(record.WinnerName), "Aborted battle should not declare a winner.");
            Assert(record.Notes.Contains("exited or interrupted"), "Notes explain aborted battle.");
        }
    }
}
