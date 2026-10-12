export type ElementType =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Ghost'
  | 'Rock'
  | 'Ice'
  | 'Flying'
  | 'Fairy'
  | 'Steel'
  | 'Ground'
  | 'Dark'
  | 'Dragon'
  | 'Poison'
  | 'Fighting'
  | 'Bug'
  | 'Psychic'
  | 'Normal';

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export type PrimaryStatusType = 'none' | 'poison' | 'paralysis' | 'freeze';

export interface MoveStatusEffect {
  status?: PrimaryStatusType;
  chance?: number;               // 0 - 100 percentage
  defenseBoostStages?: number;   // e.g. +2 for Shell Armor / Harden
  isProtect?: boolean;           // 100% block next hit
}

export interface CreatureStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface MoveDefinition {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  description: string;
  statusEffect?: MoveStatusEffect;
}

export interface CreatureSpecies {
  id: string;
  name: string;
  subtitle: string;
  type: ElementType;
  rarity: RarityTier;
  baseStats: CreatureStats;
  learnableMoveIds: string[];
  spriteKey: string;
}

export interface CreatureInstance {
  instanceId: string;
  speciesId: string;
  nickname: string;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  knownMoveIds: string[];
  nfcCardCode: string | null;
  acquiredTimestampUtc: string;
  statusCondition?: PrimaryStatusType;
}
