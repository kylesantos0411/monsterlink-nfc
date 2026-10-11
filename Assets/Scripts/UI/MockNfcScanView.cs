using System;
using System.Collections.Generic;
using MonsterLink.NFC;

namespace MonsterLink.UI
{
    /// <summary>
    /// Test double implementation of INfcScanView for automated headless testing.
    /// </summary>
    public class MockNfcScanView : INfcScanView
    {
        public IEnumerable<string> LastPredefinedCards { get; private set; }
        public RegistrationResult LastResult { get; private set; }
        public IReadOnlyList<ScanAttemptRecord> LastHistory { get; private set; }

        public event Action<string> OnScanRequested;

        public void DisplayPredefinedCards(IEnumerable<string> cardCodes)
        {
            LastPredefinedCards = cardCodes;
        }

        public void ShowScanResult(RegistrationResult result)
        {
            LastResult = result;
        }

        public void UpdateScanHistory(IReadOnlyList<ScanAttemptRecord> history)
        {
            LastHistory = history;
        }

        public void SimulateRequestScan(string cardCode)
        {
            if (OnScanRequested != null)
            {
                OnScanRequested.Invoke(cardCode);
            }
        }
    }
}
