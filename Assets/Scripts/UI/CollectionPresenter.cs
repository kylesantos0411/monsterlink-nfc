using System;
using System.Collections.Generic;
using MonsterLink.Core;
using MonsterLink.Data;
using MonsterLink.Persistence;

namespace MonsterLink.UI
{
    /// <summary>
    /// Presenter coordinating the Collection and Creature Details views with the persistent repository.
    /// Handles creature selection, view refreshes, and species metadata binding.
    /// </summary>
    public class CollectionPresenter
    {
        private readonly ICollectionRepository _repository;
        private readonly ICollectionView _collectionView;
        private readonly ICreatureDetailView _detailView;

        public CollectionPresenter(
            ICollectionRepository repository,
            ICollectionView collectionView,
            ICreatureDetailView detailView)
        {
            if (repository == null) throw new ArgumentNullException("repository");
            if (collectionView == null) throw new ArgumentNullException("collectionView");
            if (detailView == null) throw new ArgumentNullException("detailView");

            _repository = repository;
            _collectionView = collectionView;
            _detailView = detailView;

            _collectionView.OnCreatureSelected += HandleCreatureSelected;
        }

        public void Initialize()
        {
            RefreshView();
        }

        public void RefreshView()
        {
            IReadOnlyList<CreatureInstance> creatures = _repository.GetAll();
            _collectionView.UpdateCollectionCount(creatures.Count);

            if (creatures.Count == 0)
            {
                _collectionView.DisplayEmptyState(true);
                _collectionView.DisplayCreatureList(creatures);
            }
            else
            {
                _collectionView.DisplayEmptyState(false);
                _collectionView.DisplayCreatureList(creatures);
            }
        }

        public void HandleCreatureSelected(string instanceId)
        {
            if (string.IsNullOrEmpty(instanceId)) return;

            CreatureInstance instance = _repository.GetById(instanceId);
            if (instance == null) return;

            CreatureSpecies species = CreatureCatalog.GetSpecies(instance.SpeciesId);
            if (species == null) return;

            List<MoveDefinition> moves = new List<MoveDefinition>();
            if (instance.KnownMoveIds != null)
            {
                for (int i = 0; i < instance.KnownMoveIds.Count; i++)
                {
                    MoveDefinition move = CreatureCatalog.GetMove(instance.KnownMoveIds[i]);
                    if (move != null)
                    {
                        moves.Add(move);
                    }
                }
            }

            _detailView.ShowCreatureDetails(instance, species, moves);
        }

        public void CloseCreatureDetails()
        {
            _detailView.Hide();
        }
    }
}
