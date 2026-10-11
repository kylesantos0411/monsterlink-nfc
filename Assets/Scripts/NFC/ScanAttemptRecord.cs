using System;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Historical record of an individual card scan attempt.
    /// Tracks attempts, timestamps, and validation results.
    /// </summary>
    [Serializable]
    public class ScanAttemptRecord
    {
        public string AttemptId { get; private set; }
        public string TimestampUtc { get; private set; }
        public string RawCode { get; private set; }
        public RegistrationStatus Status { get; private set; }
        public string Message { get; private set; }

        public ScanAttemptRecord(string rawCode, RegistrationStatus status, string message)
        {
            AttemptId = "scan_" + Guid.NewGuid().ToString("N").Substring(0, 8);
            TimestampUtc = DateTime.UtcNow.ToString("o");
            RawCode = rawCode ?? string.Empty;
            Status = status;
            Message = message ?? string.Empty;
        }

        public override string ToString()
        {
            return string.Format("[{0}] {1} -> {2}: {3}", TimestampUtc, RawCode, Status, Message);
        }
    }
}
