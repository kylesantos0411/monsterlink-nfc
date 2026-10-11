using System.Collections.Generic;

namespace MonsterLink.NFC
{
    /// <summary>
    /// Contract for managing and persisting enrolled NFC cards in local storage.
    /// Used by the registration service to detect duplicate registrations across restarts.
    /// </summary>
    public interface IRegisteredCardRepository
    {
        bool IsCardRegistered(string cardCode);
        void RegisterCard(string cardCode, string instanceId);
        string GetInstanceIdForCard(string cardCode);
        void Save();
        void Load();
        void Clear();
        IReadOnlyDictionary<string, string> GetAllRegisteredCards();
        int Count { get; }
    }
}
