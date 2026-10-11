using System;
using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// View interface for the creature collection list screen.
    /// Decoupled from Unity UnityEngine.UI elements for testability.
    /// </summary>
    public interface ICollectionView
    {
        void DisplayCreatureList(IReadOnlyList<CreatureInstance> creatures);
        void DisplayEmptyState(bool isEmpty);
        void UpdateCollectionCount(int count);
        event Action<string> OnCreatureSelected;
    }
}
