import { ElementType } from '@/types/creature';

export const TYPE_CHART: Record<ElementType, Partial<Record<ElementType, number>>> = {
  Fire: { Fire: 1.0, Water: 0.5, Grass: 2.0, Ice: 2.0, Steel: 2.0, Rock: 0.5, Dragon: 0.5 },
  Water: { Fire: 2.0, Water: 1.0, Grass: 0.5, Ground: 2.0, Rock: 2.0, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 0.5, Ground: 2.0, Rock: 2.0, Flying: 0.5, Poison: 0.5, Steel: 0.5, Dragon: 0.5 },
  Electric: { Water: 2.0, Grass: 0.5, Electric: 0.5, Ground: 0.0, Flying: 2.0, Dragon: 0.5 },
  Ghost: { Ghost: 2.0, Dark: 0.5, Normal: 0.0 },
  Rock: { Fire: 2.0, Ice: 2.0, Flying: 2.0, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
  Ice: { Grass: 2.0, Ground: 2.0, Flying: 2.0, Dragon: 2.0, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
  Flying: { Grass: 2.0, Fighting: 2.0, Rock: 0.5, Steel: 0.5, Electric: 0.5 },
  Fairy: { Fighting: 2.0, Dragon: 2.0, Dark: 2.0, Fire: 0.5, Poison: 0.5, Steel: 0.5 },
  Steel: { Ice: 2.0, Rock: 2.0, Fairy: 2.0, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
  Ground: { Fire: 2.0, Electric: 2.0, Poison: 2.0, Rock: 2.0, Steel: 2.0, Grass: 0.5, Flying: 0.0 },
  Dark: { Ghost: 2.0, Dark: 0.5, Fairy: 0.5 },
  Dragon: { Dragon: 2.0, Steel: 0.5, Fairy: 0.0 },
  Poison: { Grass: 2.0, Fairy: 2.0, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0.0 },
  Fighting: { Normal: 2.0, Ice: 2.0, Rock: 2.0, Steel: 2.0, Ghost: 0.0, Flying: 0.5, Poison: 0.5, Fairy: 0.5 },
  Bug: { Grass: 2.0, Dark: 2.0, Fire: 0.5, Flying: 0.5, Ghost: 0.5, Steel: 0.5, Fairy: 0.5 },
  Psychic: { Fighting: 2.0, Poison: 2.0, Steel: 0.5, Dark: 0.0 },
  Normal: { Rock: 0.5, Ghost: 0.0, Steel: 0.5 },
};

export function getTypeMultiplier(attackerType: ElementType, defenderType: ElementType): number {
  if (TYPE_CHART[attackerType] && TYPE_CHART[attackerType][defenderType] !== undefined) {
    return TYPE_CHART[attackerType][defenderType]!;
  }
  return 1.0;
}
