using System;
using System.IO;
using System.Collections.Generic;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.Persistence;
using MonsterLink.UI;

namespace MonsterLink.Tests
{
    /// <summary>
    /// Automated test harness for Phase 1 verification:
    /// - Species & Instance models
    /// - Local JSON persistence (saving & loading)
    /// - Application cold reboot simulation
    /// - Collection Presenter & Creature Details view selection
    /// - Empty collection handling
    /// </summary>
    public class Phase1Tests
    {
        private static int _passCount = 0;
        private static int _failCount = 0;

        public static int Main(string[] args)
        {
            Console.WriteLine("=================================================");
            Console.WriteLine("     MONSTERLINK PHASE 1 AUTOMATED TEST SUITE    ");
            Console.WriteLine("=================================================");
            Console.WriteLine();

            string testTempDir = Path.Combine(Path.GetTempPath(), "MonsterLink_Phase1_Tests_" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(testTempDir);

            try
            {
                RunTest("TC-101: Species Catalog & Attribute Integrity", () => TestSpeciesCatalog());
                RunTest("TC-102: Instance Uniqueness & Factory Scaling", () => TestInstanceUniqueness());
                RunTest("TC-103: Local JSON File Serialization", () => TestJsonFileSaving(testTempDir));
                RunTest("TC-104: Local JSON Deserialization & Data Recovery", () => TestJsonFileLoading(testTempDir));
                RunTest("TC-105: App Reopen Simulation (Cold Boot Round-Trip)", () => TestAppReopeningSimulation(testTempDir));
                RunTest("TC-106: Collection Selection & Detail View Binding", () => TestCreatureSelectionAndDetails(testTempDir));
                RunTest("TC-107: Empty Collection State Handling", () => TestEmptyCollectionHandling(testTempDir));
            }
            finally
            {
                if (Directory.Exists(testTempDir))
                {
                    try { Directory.Delete(testTempDir, true); } catch { }
                }
            }

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

        // TC-101: Verify all 4 sample species exist and have valid properties
        private static void TestSpeciesCatalog()
        {
            string[] expectedSpecies = new[] { "species_ignisaur", "species_aquabite", "species_floraslug", "species_voltkit" };

            foreach (string spId in expectedSpecies)
            {
                CreatureSpecies sp = CreatureCatalog.GetSpecies(spId);
                Assert(sp != null, "Species not found: " + spId);
                Assert(!string.IsNullOrEmpty(sp.DisplayName), "Species has empty display name: " + spId);
                Assert(sp.BaseStats.BaseHp > 0, "Base HP must be positive: " + spId);
                Assert(sp.BaseStats.Attack > 0, "Base Attack must be positive: " + spId);
                Assert(sp.BaseStats.Defense > 0, "Base Defense must be positive: " + spId);
                Assert(sp.BaseStats.Speed > 0, "Base Speed must be positive: " + spId);
                Assert(sp.LearnableMoveIds.Count > 0, "Species must have learnable moves: " + spId);

                // Check moves exist in move catalog
                foreach (string mId in sp.LearnableMoveIds)
                {
                    MoveDefinition move = CreatureCatalog.GetMove(mId);
                    Assert(move != null, "Move not found in MoveCatalog: " + mId);
                    Assert(move.Power > 0, "Move power must be positive: " + mId);
                }
            }
        }

        // TC-102: Verify multiple instances of the same species have unique IDs and isolated state
        private static void TestInstanceUniqueness()
        {
            CreatureInstance instA = CreatureFactory.CreateInstance("species_ignisaur", "ML-CARD-IGNI-01", "Iggy Alpha", 5);
            CreatureInstance instB = CreatureFactory.CreateInstance("species_ignisaur", "ML-CARD-IGNI-02", "Iggy Beta", 5);

            Assert(!string.IsNullOrEmpty(instA.InstanceId), "Instance A must have valid ID");
            Assert(!string.IsNullOrEmpty(instB.InstanceId), "Instance B must have valid ID");
            Assert(instA.InstanceId != instB.InstanceId, "Instances of the same species must have distinct GUIDs");
            Assert(instA.Nickname == "Iggy Alpha", "Nickname A must match");
            Assert(instB.Nickname == "Iggy Beta", "Nickname B must match");

            // Verify mutating instance A does not affect instance B
            instA.TakeDamage(5);
            Assert(instA.CurrentHp == instA.MaxHp - 5, "Instance A HP must decrease");
            Assert(instB.CurrentHp == instB.MaxHp, "Instance B HP must remain unchanged");
        }

        // TC-103: Verify saving collection to JSON file
        private static void TestJsonFileSaving(string testDir)
        {
            string filePath = Path.Combine(testDir, "save_test.json");
            JsonCollectionStorage storage = new JsonCollectionStorage(filePath);

            CreatureInstance c1 = CreatureFactory.CreateInstance("species_ignisaur", "ML-CARD-IGNI-01", "Flame1", 5);
            CreatureInstance c2 = CreatureFactory.CreateInstance("species_aquabite", "ML-CARD-AQUA-02", "Wave1", 5);

            storage.Add(c1);
            storage.Add(c2);
            storage.Save();

            Assert(File.Exists(filePath), "Target save file must exist on disk");
            string rawJson = File.ReadAllText(filePath);
            Assert(rawJson.Contains("\"schemaVersion\": 1"), "JSON must contain schemaVersion 1");
            Assert(rawJson.Contains(c1.InstanceId), "JSON must contain creature 1 instance ID");
            Assert(rawJson.Contains(c2.InstanceId), "JSON must contain creature 2 instance ID");
            Assert(rawJson.Contains("ML-CARD-IGNI-01"), "JSON must contain assigned NFC card code");
        }

        // TC-104: Verify loading collection from JSON file
        private static void TestJsonFileLoading(string testDir)
        {
            string filePath = Path.Combine(testDir, "load_test.json");
            JsonCollectionStorage storage = new JsonCollectionStorage(filePath);

            CreatureInstance c1 = CreatureFactory.CreateInstance("species_floraslug", "ML-CARD-FLOR-03", "Sluggy", 8);
            storage.Add(c1);
            storage.Save();

            // Clear in-memory and reload
            storage.Clear();
            Assert(storage.Count == 0, "Storage must be empty after clear");

            storage.Load();
            Assert(storage.Count == 1, "Storage must have 1 creature after load");
            CreatureInstance loaded = storage.GetById(c1.InstanceId);
            Assert(loaded != null, "Loaded creature must not be null");
            Assert(loaded.Nickname == "Sluggy", "Loaded creature nickname must match");
            Assert(loaded.Level == 8, "Loaded creature level must match");
            Assert(loaded.SpeciesId == "species_floraslug", "Loaded creature species must match");
        }

        // TC-105: Simulate application reopening / cold boot round-trip
        private static void TestAppReopeningSimulation(string testDir)
        {
            string filePath = Path.Combine(testDir, "cold_boot.json");

            // Session 1: App creates and saves creatures
            JsonCollectionStorage session1Storage = new JsonCollectionStorage(filePath);
            CreatureInstance sparky = CreatureFactory.CreateInstance("species_voltkit", "ML-CARD-VOLT-04", "Sparky", 6);
            CreatureInstance iggy = CreatureFactory.CreateInstance("species_ignisaur", "ML-CARD-IGNI-01", "Iggy", 6);
            session1Storage.Add(sparky);
            session1Storage.Add(iggy);
            session1Storage.Save();

            // Simulate App Termination: drop reference to session1Storage
            session1Storage = null;

            // Session 2: Cold boot app launches fresh and instantiates repository
            JsonCollectionStorage session2Storage = new JsonCollectionStorage(filePath);
            Assert(session2Storage.Count == 2, "Session 2 must restore both creatures automatically on boot");

            CreatureInstance restoredSparky = session2Storage.GetById(sparky.InstanceId);
            Assert(restoredSparky != null, "Sparky must be restored");
            Assert(restoredSparky.Nickname == "Sparky", "Restored nickname must match");
            Assert(restoredSparky.NfcCardCode == "ML-CARD-VOLT-04", "Restored NFC card code must match");
            Assert(restoredSparky.MaxHp == sparky.MaxHp, "Restored MaxHp must match");
        }

        // TC-106: Test selecting creature in collection and displaying details in UI
        private static void TestCreatureSelectionAndDetails(string testDir)
        {
            string filePath = Path.Combine(testDir, "selection_test.json");
            JsonCollectionStorage repo = new JsonCollectionStorage(filePath);

            CreatureInstance c = CreatureFactory.CreateInstance("species_ignisaur", "ML-CARD-IGNI-01", "Pyromancer", 7);
            repo.Add(c);
            repo.Save();

            MockCollectionView mockCollectionView = new MockCollectionView();
            MockCreatureDetailView mockDetailView = new MockCreatureDetailView();

            CollectionPresenter presenter = new CollectionPresenter(repo, mockCollectionView, mockDetailView);
            presenter.Initialize();

            Assert(mockCollectionView.LastCollectionCount == 1, "Collection view count must be 1");
            Assert(!mockCollectionView.IsEmptyStateDisplayed, "Empty state must be false");
            Assert(!mockDetailView.IsVisible, "Detail view must be hidden initially");

            // User clicks creature item in list
            mockCollectionView.SimulateSelectCreature(c.InstanceId);

            Assert(mockDetailView.IsVisible, "Detail view must be visible after creature selection");
            Assert(mockDetailView.LastSelectedInstance != null, "Last selected instance must not be null");
            Assert(mockDetailView.LastSelectedInstance.InstanceId == c.InstanceId, "Selected instance ID must match");
            Assert(mockDetailView.LastSelectedSpecies != null, "Species must be resolved");
            Assert(mockDetailView.LastSelectedSpecies.DisplayName == "Ignisaur", "Species name must be Ignisaur");
            Assert(mockDetailView.LastSelectedMoves.Count == c.KnownMoveIds.Count, "Move count must match known moves");

            // Close details
            presenter.CloseCreatureDetails();
            Assert(!mockDetailView.IsVisible, "Detail view must hide after close");
        }

        // TC-107: Test empty collection state handling
        private static void TestEmptyCollectionHandling(string testDir)
        {
            string filePath = Path.Combine(testDir, "empty_collection.json");
            JsonCollectionStorage repo = new JsonCollectionStorage(filePath);

            MockCollectionView mockCollectionView = new MockCollectionView();
            MockCreatureDetailView mockDetailView = new MockCreatureDetailView();

            CollectionPresenter presenter = new CollectionPresenter(repo, mockCollectionView, mockDetailView);
            presenter.Initialize();

            Assert(mockCollectionView.LastCollectionCount == 0, "Collection count must be 0");
            Assert(mockCollectionView.IsEmptyStateDisplayed, "Empty state must be displayed");
            Assert(mockCollectionView.LastDisplayedCreatures.Count == 0, "Creature list must be empty");
            Assert(!mockDetailView.IsVisible, "Detail view must not be visible");
        }
    }
}
