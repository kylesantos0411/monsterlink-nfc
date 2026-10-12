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
}
