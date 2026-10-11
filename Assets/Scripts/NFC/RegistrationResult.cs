using System;
using MonsterLink.Core;

namespace MonsterLink.NFC
{
    public enum RegistrationStatus
    {
        Success,
        Duplicate,
        UnknownCode,
        MalformedInput,
        Error
    }

    /// <summary>
    /// Encapsulates the structured outcome of an NFC registration attempt.
    /// </summary>
    [Serializable]
    public class RegistrationResult
    {
        public RegistrationStatus Status { get; private set; }
        public string CardCode { get; private set; }
        public string Message { get; private set; }
        public CreatureInstance RegisteredCreature { get; private set; }

        public bool IsSuccess
        {
            get { return Status == RegistrationStatus.Success; }
        }

        public RegistrationResult(
            RegistrationStatus status,
            string cardCode,
            string message,
            CreatureInstance registeredCreature = null)
        {
            Status = status;
            CardCode = cardCode ?? string.Empty;
            Message = message ?? string.Empty;
            RegisteredCreature = registeredCreature;
        }

        public static RegistrationResult CreateSuccess(string cardCode, CreatureInstance creature)
        {
            return new RegistrationResult(
                RegistrationStatus.Success,
                cardCode,
                string.Format("Successfully registered {0} (Lv.{1})!", creature.Nickname, creature.Level),
                creature
            );
        }

        public static RegistrationResult CreateDuplicate(string cardCode, string existingInstanceId)
        {
            return new RegistrationResult(
                RegistrationStatus.Duplicate,
                cardCode,
                string.Format("Card '{0}' is already registered to Creature ID '{1}'.", cardCode, existingInstanceId)
            );
        }

        public static RegistrationResult CreateUnknown(string cardCode)
        {
            return new RegistrationResult(
                RegistrationStatus.UnknownCode,
                cardCode,
                string.Format("Card '{0}' is not recognized in the prototype registry.", cardCode)
            );
        }

        public static RegistrationResult CreateMalformed(string rawInput, string reason)
        {
            return new RegistrationResult(
                RegistrationStatus.MalformedInput,
                rawInput,
                string.Format("Invalid card code format '{0}': {1}", rawInput, reason)
            );
        }

        public static RegistrationResult CreateError(string cardCode, string errorDetails)
        {
            return new RegistrationResult(
                RegistrationStatus.Error,
                cardCode,
                string.Format("Registration error for card '{0}': {1}", cardCode, errorDetails)
            );
        }
    }
}
