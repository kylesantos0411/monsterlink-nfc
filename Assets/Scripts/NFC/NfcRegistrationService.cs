using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.Persistence;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Service orchestrating the card registration workflow.
    /// Validates scanned card payloads, checks duplicate prevention records,
    /// mints new creature instances, and persists both creature and card enrollments.
    /// </summary>
    public class NfcRegistrationService
    {
        private readonly INfcReader _nfcReader;
        private readonly ICollectionRepository _collectionRepo;
        private readonly IRegisteredCardRepository _cardRepo;
        private readonly List<ScanAttemptRecord> _scanHistory;

        private static readonly Regex CardFormatRegex = new Regex(@"^ML-CARD-[A-Z0-9]+-\d+$", RegexOptions.IgnoreCase);

        public event Action<RegistrationResult> OnRegistrationCompleted;

        public IReadOnlyList<ScanAttemptRecord> ScanHistory
        {
            get { return _scanHistory.AsReadOnly(); }
        }

        public NfcRegistrationService(
            INfcReader nfcReader,
            ICollectionRepository collectionRepo,
            IRegisteredCardRepository cardRepo)
        {
            if (nfcReader == null) throw new ArgumentNullException("nfcReader");
            if (collectionRepo == null) throw new ArgumentNullException("collectionRepo");
            if (cardRepo == null) throw new ArgumentNullException("cardRepo");

            _nfcReader = nfcReader;
            _collectionRepo = collectionRepo;
            _cardRepo = cardRepo;
            _scanHistory = new List<ScanAttemptRecord>();

            _nfcReader.OnCardScanned += HandleCardScanned;
        }

        private void HandleCardScanned(string rawCode)
        {
            ProcessScan(rawCode);
        }

        /// <summary>
        /// Validates and processes a card scan attempt.
        /// Can be called directly or triggered via INfcReader.OnCardScanned.
        /// </summary>
        public RegistrationResult ProcessScan(string rawCode)
        {
            string cleanCode = rawCode != null ? rawCode.Trim() : string.Empty;

            // 1. Format & Syntax Validation
            if (string.IsNullOrEmpty(cleanCode) || !CardFormatRegex.IsMatch(cleanCode))
            {
                RegistrationResult malformed = RegistrationResult.CreateMalformed(
                    cleanCode,
                    "Code must match 'ML-CARD-<TAG>-<NUM>' format (e.g., 'ML-CARD-IGNI-01')."
                );
                RecordAttempt(cleanCode, malformed.Status, malformed.Message);
                DispatchResult(malformed);
                return malformed;
            }

            // 2. Duplicate Registration Rejection
            if (_cardRepo.IsCardRegistered(cleanCode))
            {
                string existingInstanceId = _cardRepo.GetInstanceIdForCard(cleanCode) ?? "Unknown";
                RegistrationResult duplicate = RegistrationResult.CreateDuplicate(cleanCode, existingInstanceId);
                RecordAttempt(cleanCode, duplicate.Status, duplicate.Message);
                DispatchResult(duplicate);
                return duplicate;
            }

            // 3. Card Registry Lookup
            CardRegistryEntry entry = CardRegistry.GetEntry(cleanCode);
            if (entry == null)
            {
                RegistrationResult unknown = RegistrationResult.CreateUnknown(cleanCode);
                RecordAttempt(cleanCode, unknown.Status, unknown.Message);
                DispatchResult(unknown);
                return unknown;
            }

            // 4. Enroll Creature & Persist Records
            try
            {
                CreatureInstance newCreature = CreatureFactory.CreateInstance(entry.SpeciesId, cleanCode, null, 5);

                // Add to player collection & save
                _collectionRepo.Add(newCreature);
                _collectionRepo.Save();

                // Record card code as registered & save
                _cardRepo.RegisterCard(cleanCode, newCreature.InstanceId);
                _cardRepo.Save();

                RegistrationResult success = RegistrationResult.CreateSuccess(cleanCode, newCreature);
                RecordAttempt(cleanCode, success.Status, success.Message);
                DispatchResult(success);
                return success;
            }
            catch (Exception ex)
            {
                RegistrationResult error = RegistrationResult.CreateError(cleanCode, ex.Message);
                RecordAttempt(cleanCode, error.Status, error.Message);
                DispatchResult(error);
                return error;
            }
        }

        private void RecordAttempt(string rawCode, RegistrationStatus status, string message)
        {
            _scanHistory.Insert(0, new ScanAttemptRecord(rawCode, status, message));
        }

        private void DispatchResult(RegistrationResult result)
        {
            if (OnRegistrationCompleted != null)
            {
                OnRegistrationCompleted.Invoke(result);
            }
        }
    }
}
