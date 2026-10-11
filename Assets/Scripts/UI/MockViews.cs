using System;
using System.Collections.Generic;
using MonsterLink.Core;

namespace MonsterLink.UI
{
    /// <summary>
    /// Test double implementation of ICollectionView for automated headless testing.
    /// </summary>
    public class MockCollectionView : ICollectionView
    {
        public IReadOnlyList<CreatureInstance> LastDisplayedCreatures { get; private set; }
        public bool IsEmptyStateDisplayed { get; private set; }
        public int LastCollectionCount { get; private set; }

        public event Action<string> OnCreatureSelected;

        public void DisplayCreatureList(IReadOnlyList<CreatureInstance> creatures)
        {
            LastDisplayedCreatures = creatures;
        }

        public void DisplayEmptyState(bool isEmpty)
        {
            IsEmptyStateDisplayed = isEmpty;
        }

        public void UpdateCollectionCount(int count)
        {
            LastCollectionCount = count;
        }

        public void SimulateSelectCreature(string instanceId)
        {
            if (OnCreatureSelected != null)
            {
                OnCreatureSelected.Invoke(instanceId);
            }
        }
    }

    /// <summary>
    /// Test double implementation of ICreatureDetailView for automated headless testing.
    /// </summary>
    public class MockCreatureDetailView : ICreatureDetailView
    {
        public bool IsVisible { get; private set; }
        public CreatureInstance LastSelectedInstance { get; private set; }
        public CreatureSpecies LastSelectedSpecies { get; private set; }
        public IReadOnlyList<MoveDefinition> LastSelectedMoves { get; private set; }

        public void ShowCreatureDetails(CreatureInstance instance, CreatureSpecies species, IReadOnlyList<MoveDefinition> moves)
        {
            IsVisible = true;
            LastSelectedInstance = instance;
            LastSelectedSpecies = species;
            LastSelectedMoves = moves;
        }

        public void Hide()
        {
            IsVisible = false;
        }
    }
}
