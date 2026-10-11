using System;

namespace MonsterLink.Core
{
    /// <summary>
    /// Base stat block representing a creature's fundamental battle attributes.
    /// </summary>
    [Serializable]
    public struct CreatureStats
    {
        public int BaseHp;
        public int Attack;
        public int Defense;
        public int Speed;

        public CreatureStats(int baseHp, int attack, int defense, int speed)
        {
            BaseHp = baseHp;
            Attack = attack;
            Defense = defense;
            Speed = speed;
        }

        public override string ToString()
        {
            return string.Format("HP: {0}, ATK: {1}, DEF: {2}, SPD: {3}", BaseHp, Attack, Defense, Speed);
        }
    }
}
