using System;
using System.IO;
using System.Collections.Generic;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.NFC;
using MonsterLink.Persistence;
using MonsterLink.UI;

namespace MonsterLink.Tests
{
    /// <summary>
    /// Automated test harness for Phase 2 verification:
    /// - Simulated NFC card scanning
    /// - Valid registration and creature minting
    /// - Duplicate card registration rejection
    /// - Unknown card code rejection
    /// - Malformed code syntax validation
    /// - Session scan attempt history
    /// - INfcReader interface substitution
    /// - App reboot persistence and duplicate check survival
    /// </summary>
    public class Phase2Tests
    {
        private static int _passCount = 0;
        private static int _failCount = 0;

        public static int Main(string[] args)
        {
            Console.WriteLine("=================================================");
            Console.WriteLine("     MONSTERLINK PHASE 2 AUTOMATED TEST SUITE    ");
            Console.WriteLine("=================================================");
            Console.WriteLine();

            string testTempDir = Path.Combine(Path.GetTempPath(), "MonsterLink_Phase2_Tests_" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(testTempDir);

            try
            {
                RunTest("TC-201: Valid Card Code Registration", () => TestValidCardRegistration(testTempDir));
                RunTest("TC-202: Duplicate Registration Rejection", () => TestDuplicateCardRejection(testTempDir));
                RunTest("TC-203: Unknown Card Code Rejection", () => TestUnknownCardRejection(testTempDir));
                RunTest("TC-204: Malformed Input Rejection", () => TestMalformedCodeRejection(testTempDir));
                RunTest("TC-205: Scan Attempt History Tracking", () => TestScanHistoryTracking(testTempDir));
                RunTest("TC-206: Scanner Interface Decoupling", () => TestReaderInterfaceDecoupling(testTempDir));
                RunTest("TC-207: Cold Boot Persistence & Duplicate Retention", () => TestColdBootDuplicateRetention(testTempDir));
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

        // TC-201: Valid card registration
        private static void TestValidCardRegistration(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc201_coll.json");
            string cardPath = Path.Combine(testDir, "tc201_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);
            SimulatedNfcReader simReader = new SimulatedNfcReader();

            NfcRegistrationService service = new NfcRegistrationService(simReader, collStorage, cardStorage);

            RegistrationResult result = service.ProcessScan("ML-CARD-IGNI-01");

            Assert(result.IsSuccess, "Registration result must be success");
            Assert(result.Status == RegistrationStatus.Success, "Status must be Success");
            Assert(result.RegisteredCreature != null, "Registered creature must not be null");
            Assert(result.RegisteredCreature.SpeciesId == "species_ignisaur", "Creature species must be Ignisaur");
            Assert(result.RegisteredCreature.NfcCardCode == "ML-CARD-IGNI-01", "Assigned card code must match");
            Assert(collStorage.Count == 1, "Collection must contain 1 creature");
            Assert(cardStorage.IsCardRegistered("ML-CARD-IGNI-01"), "Card storage must record card code");
        }

        // TC-202: Duplicate registration rejection
        private static void TestDuplicateCardRejection(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc202_coll.json");
            string cardPath = Path.Combine(testDir, "tc202_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);
            SimulatedNfcReader simReader = new SimulatedNfcReader();

            NfcRegistrationService service = new NfcRegistrationService(simReader, collStorage, cardStorage);

            // First scan: success
            RegistrationResult firstResult = service.ProcessScan("ML-CARD-AQUA-02");
            Assert(firstResult.IsSuccess, "First scan must succeed");
            int initialCount = collStorage.Count;

            // Second scan of same card: duplicate rejection
            RegistrationResult secondResult = service.ProcessScan("ML-CARD-AQUA-02");
            Assert(!secondResult.IsSuccess, "Second scan must fail");
            Assert(secondResult.Status == RegistrationStatus.Duplicate, "Status must be Duplicate");
            Assert(collStorage.Count == initialCount, "Collection count must NOT increase on duplicate");
            Assert(secondResult.Message.Contains("already registered"), "Message must explain duplicate rejection");
        }

        // TC-203: Unknown card rejection
        private static void TestUnknownCardRejection(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc203_coll.json");
            string cardPath = Path.Combine(testDir, "tc203_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);
            SimulatedNfcReader simReader = new SimulatedNfcReader();

            NfcRegistrationService service = new NfcRegistrationService(simReader, collStorage, cardStorage);

            RegistrationResult result = service.ProcessScan("ML-CARD-UNKNOWN-99");
            Assert(!result.IsSuccess, "Unknown card scan must fail");
            Assert(result.Status == RegistrationStatus.UnknownCode, "Status must be UnknownCode");
            Assert(collStorage.Count == 0, "Collection must remain empty");
            Assert(!cardStorage.IsCardRegistered("ML-CARD-UNKNOWN-99"), "Unknown card must not be registered");
        }

        // TC-204: Malformed code rejection
        private static void TestMalformedCodeRejection(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc204_coll.json");
            string cardPath = Path.Combine(testDir, "tc204_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);
            SimulatedNfcReader simReader = new SimulatedNfcReader();

            NfcRegistrationService service = new NfcRegistrationService(simReader, collStorage, cardStorage);

            string[] invalidCodes = new[] { "", "   ", "NOT-A-CARD", "CARD123", "ML-CARD", "ML-CARD-IGNI" };

            foreach (string invalid in invalidCodes)
            {
                RegistrationResult res = service.ProcessScan(invalid);
                Assert(!res.IsSuccess, "Invalid code must not succeed: " + invalid);
                Assert(res.Status == RegistrationStatus.MalformedInput, "Status must be MalformedInput for: " + invalid);
            }

            Assert(collStorage.Count == 0, "No creatures should be added from malformed codes");
        }

        // TC-205: Scan attempt history tracking
        private static void TestScanHistoryTracking(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc205_coll.json");
            string cardPath = Path.Combine(testDir, "tc205_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);
            SimulatedNfcReader simReader = new SimulatedNfcReader();

            NfcRegistrationService service = new NfcRegistrationService(simReader, collStorage, cardStorage);

            service.ProcessScan("ML-CARD-FLOR-03"); // Success
            service.ProcessScan("ML-CARD-FLOR-03"); // Duplicate
            service.ProcessScan("ML-CARD-MYST-88"); // Unknown
            service.ProcessScan("BAD_PAYLOAD");     // Malformed

            Assert(service.ScanHistory.Count == 4, "ScanHistory must track all 4 attempts");
            Assert(service.ScanHistory[0].Status == RegistrationStatus.MalformedInput, "Attempt 4 must be Malformed");
            Assert(service.ScanHistory[1].Status == RegistrationStatus.UnknownCode, "Attempt 3 must be Unknown");
            Assert(service.ScanHistory[2].Status == RegistrationStatus.Duplicate, "Attempt 2 must be Duplicate");
            Assert(service.ScanHistory[3].Status == RegistrationStatus.Success, "Attempt 1 must be Success");
        }

        // TC-206: Scanner interface decoupling (pluggable reader)
        private class TestHardwareMockReader : INfcReader
        {
            public bool IsAvailable { get { return true; } }
            public bool IsListening { get; set; }
            public event Action<string> OnCardScanned;
            public event Action<string> OnScanError;

            public void StartListening() { IsListening = true; }
            public void StopListening() { IsListening = false; }

            public void EmitHardwareSignal(string payload)
            {
                if (OnCardScanned != null) OnCardScanned.Invoke(payload);
            }

            public void EmitErrorSignal(string error)
            {
                if (OnScanError != null) OnScanError.Invoke(error);
            }
        }

        private static void TestReaderInterfaceDecoupling(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc206_coll.json");
            string cardPath = Path.Combine(testDir, "tc206_cards.json");

            JsonCollectionStorage collStorage = new JsonCollectionStorage(collPath);
            JsonRegisteredCardStorage cardStorage = new JsonRegisteredCardStorage(cardPath);

            TestHardwareMockReader mockHardware = new TestHardwareMockReader();
            NfcRegistrationService service = new NfcRegistrationService(mockHardware, collStorage, cardStorage);

            RegistrationResult receivedResult = null;
            service.OnRegistrationCompleted += res => receivedResult = res;

            // Trigger hardware event
            mockHardware.EmitHardwareSignal("ML-CARD-VOLT-04");

            Assert(receivedResult != null, "Registration event must fire from INfcReader event");
            Assert(receivedResult.IsSuccess, "Registration via mock hardware reader must succeed");
            Assert(receivedResult.RegisteredCreature.SpeciesId == "species_voltkit", "Voltkit must be registered");
        }

        // TC-207: Cold boot persistence preserves card registrations & duplicate check
        private static void TestColdBootDuplicateRetention(string testDir)
        {
            string collPath = Path.Combine(testDir, "tc207_coll.json");
            string cardPath = Path.Combine(testDir, "tc207_cards.json");

            // Session 1: Register card and close app
            {
                JsonCollectionStorage session1Coll = new JsonCollectionStorage(collPath);
                JsonRegisteredCardStorage session1Cards = new JsonRegisteredCardStorage(cardPath);
                SimulatedNfcReader sim = new SimulatedNfcReader();
                NfcRegistrationService session1Service = new NfcRegistrationService(sim, session1Coll, session1Cards);

                RegistrationResult res = session1Service.ProcessScan("ML-CARD-IGNI-01");
                Assert(res.IsSuccess, "Initial registration in session 1 must succeed");
            }

            // Session 2: Cold boot new app instance reading from disk
            {
                JsonCollectionStorage session2Coll = new JsonCollectionStorage(collPath);
                JsonRegisteredCardStorage session2Cards = new JsonRegisteredCardStorage(cardPath);
                SimulatedNfcReader sim = new SimulatedNfcReader();
                NfcRegistrationService session2Service = new NfcRegistrationService(sim, session2Coll, session2Cards);

                Assert(session2Cards.IsCardRegistered("ML-CARD-IGNI-01"), "Card must remain registered across restarts");

                RegistrationResult dupRes = session2Service.ProcessScan("ML-CARD-IGNI-01");
                Assert(!dupRes.IsSuccess, "Scanning registered card in session 2 must be rejected as duplicate");
                Assert(dupRes.Status == RegistrationStatus.Duplicate, "Status must be Duplicate");
            }
        }
    }
}
