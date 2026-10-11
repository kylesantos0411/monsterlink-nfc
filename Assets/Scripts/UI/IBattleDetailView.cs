using MonsterLink.Records;

namespace MonsterLink.UI
{
    /// <summary>
    /// View interface for the detailed battle record inspection screen/modal.
    /// Presents full match details, combatant starting/ending HP, turn counts, and action log.
    /// </summary>
    public interface IBattleDetailView
    {
        void ShowBattleDetail(BattleRecord record);
        void Hide();
        bool IsVisible { get; }
    }
}
