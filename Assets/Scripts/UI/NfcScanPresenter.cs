using System;
using System.Collections.Generic;
using MonsterLink.NFC;

namespace MonsterLink.UI
{
    /// <summary>
    /// Presenter connecting the NFC scanning UI with the simulated or hardware reader and registration service.
    /// </summary>
    public class NfcScanPresenter
    {
        private readonly INfcScanView _view;
        private readonly INfcReader _reader;
        private readonly NfcRegistrationService _registrationService;

        public NfcScanPresenter(
            INfcScanView view,
            INfcReader reader,
            NfcRegistrationService registrationService)
        {
            if (view == null) throw new ArgumentNullException("view");
            if (reader == null) throw new ArgumentNullException("reader");
            if (registrationService == null) throw new ArgumentNullException("registrationService");

            _view = view;
            _reader = reader;
            _registrationService = registrationService;

            _view.OnScanRequested += HandleScanRequested;
            _registrationService.OnRegistrationCompleted += HandleRegistrationCompleted;
        }

        public void Initialize()
        {
            _view.DisplayPredefinedCards(SimulatedNfcReader.PredefinedTestCodes);
            _view.UpdateScanHistory(_registrationService.ScanHistory);
            _reader.StartListening();
        }

        public void Teardown()
        {
            _reader.StopListening();
        }

        private void HandleScanRequested(string cardCode)
        {
            // If the reader is a simulator, inject the scan into the reader pipeline
            SimulatedNfcReader sim = _reader as SimulatedNfcReader;
            if (sim != null)
            {
                sim.SimulateScan(cardCode);
            }
            else
            {
                // Direct fallback
                _registrationService.ProcessScan(cardCode);
            }
        }

        private void HandleRegistrationCompleted(RegistrationResult result)
        {
            _view.ShowScanResult(result);
            _view.UpdateScanHistory(_registrationService.ScanHistory);
        }
    }
}
