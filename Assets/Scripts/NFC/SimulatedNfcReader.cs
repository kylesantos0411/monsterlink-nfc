using System;
using System.Collections.Generic;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Software simulation of an NFC reader.
    /// Allows desktop developers and automated test harnesses to inject card codes
    /// via UI buttons, text input, or programmatic calls without physical hardware.
    /// </summary>
    public class SimulatedNfcReader : INfcReader
    {
        private bool _isListening;

        public static readonly string[] PredefinedTestCodes = new[]
        {
            "ML-CARD-IGNI-01", // Ignisaur (Fire)
            "ML-CARD-AQUA-02", // Aquabite (Water)
            "ML-CARD-FLOR-03", // Floraslug (Grass)
            "ML-CARD-VOLT-04"  // Voltkit (Electric)
        };

        public bool IsAvailable
        {
            get { return true; }
        }

        public bool IsListening
        {
            get { return _isListening; }
        }

        public event Action<string> OnCardScanned;
        public event Action<string> OnScanError;

        public SimulatedNfcReader()
        {
            _isListening = true; // Enabled by default in simulator
        }

        public void StartListening()
        {
            _isListening = true;
        }

        public void StopListening()
        {
            _isListening = false;
        }

        /// <summary>
        /// Injects a card code into the scanner simulation.
        /// </summary>
        public void SimulateScan(string cardCode)
        {
            if (!_isListening)
            {
                if (OnScanError != null)
                {
                    OnScanError.Invoke("Scanner is paused. Please resume scanning.");
                }
                return;
            }

            if (string.IsNullOrEmpty(cardCode))
            {
                if (OnScanError != null)
                {
                    OnScanError.Invoke("Empty card signal detected.");
                }
                return;
            }

            if (OnCardScanned != null)
            {
                OnCardScanned.Invoke(cardCode.Trim());
            }
        }
    }
}
