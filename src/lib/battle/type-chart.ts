import { ElementType } from '@/types/creature';

export const TYPE_CHART: Record<ElementType, Record<ElementType, number>> = {
  Fire: { Fire: 1.0, Water: 0.5, Grass: 2.0, Electric: 1.0, Normal: 1.0 },
  Water: { Fire: 2.0, Water: 1.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
  Electric: { Fire: 1.0, Water: 2.0, Grass: 0.5, Electric: 1.0, Normal: 1.0 },
  Normal: { Fire: 1.0, Water: 1.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
};

export function getTypeMultiplier(attackerType: ElementType, defenderType: ElementType): number {
  if (TYPE_CHART[attackerType] && TYPE_CHART[attackerType][defenderType] !== undefined) {
    return TYPE_CHART[attackerType][defenderType];
  }
  return 1.0;
}
