using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// View interface for the creature details inspect modal/screen.
    /// Presents full combat stats, species details, and move pool.
    /// </summary>
    public interface ICreatureDetailView
    {
        void ShowCreatureDetails(CreatureInstance instance, CreatureSpecies species, IReadOnlyList<MoveDefinition> moves);
        void Hide();
        bool IsVisible { get; }
    }
}
