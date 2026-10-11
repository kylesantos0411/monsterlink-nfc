using System;

namespace MonsterLink.Core
{
    /// <summary>
    /// Immutable move definition describing a battle action.
    /// </summary>
    [Serializable]
    public class MoveDefinition
    {
        public string MoveId { get; private set; }
        public string Name { get; private set; }
        public ElementType Type { get; private set; }
        public int Power { get; private set; }
        public int Accuracy { get; private set; }
        public string Description { get; private set; }

        public MoveDefinition(string moveId, string name, ElementType type, int power, int accuracy, string description)
        {
            if (moveId == null) throw new ArgumentNullException("moveId");
            if (name == null) throw new ArgumentNullException("name");

            MoveId = moveId;
            Name = name;
            Type = type;
            Power = power;
            Accuracy = accuracy;
            Description = description ?? string.Empty;
        }

        public override string ToString()
        {
            return string.Format("{0} ({1}, PWR: {2}, ACC: {3}%)", Name, Type, Power, Accuracy);
        }
    }
}
