using System;
using System.Collections.Generic;
using MonsterLink.NFC;

namespace MonsterLink.UI
{
    /// <summary>
    /// View contract for the NFC scanning screen.
    /// Supports both simulated clicks and manual code entries.
    /// </summary>
    public interface INfcScanView
    {
        void DisplayPredefinedCards(IEnumerable<string> cardCodes);
        void ShowScanResult(RegistrationResult result);
        void UpdateScanHistory(IReadOnlyList<ScanAttemptRecord> history);

        event Action<string> OnScanRequested;
    }
}
