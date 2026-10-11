using System;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Hardware-agnostic interface for NFC tag reading.
    /// Allows SimulatedNfcReader (desktop/testing) and AndroidNfcReader (native hardware)
    /// to be used interchangeably by the game's registration pipeline.
    /// </summary>
    public interface INfcReader
    {
        bool IsAvailable { get; }
        bool IsListening { get; }

        /// <summary>
        /// Emits the raw card code or UID string scanned from the tag.
        /// </summary>
        event Action<string> OnCardScanned;

        /// <summary>
        /// Emits error messages encountered during NFC operation.
        /// </summary>
        event Action<string> OnScanError;

        void StartListening();
        void StopListening();
    }
}
