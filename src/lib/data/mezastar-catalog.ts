import { ElementType } from '@/types/creature';

export type MezastarStarGrade = '2-Star' | '3-Star' | '4-Star' | '5-Star' | '6-Star Superstar';

export interface MezastarTagDefinition {
  tagId: string;                 // Official Tag Code, e.g. "MZ-01-001" or "MZ-SS-005"
  nfcCode: string;               // Physical or simulated NFC payload, e.g. "ML-MEZASTAR-001"
  pokemonName: string;           // Pokémon name
  pokeApiId: number;             // ID in PokéAPI for reference lookups
  grade: MezastarStarGrade;      // Official star rarity
  energy: number;                // Official Mezastar Energy Value (e.g. 70 to 180+)
  type: ElementType;             // Primary elemental affinity
  moves: string[];               // Associated tag attack move names
  specialAbility?: 'Z-Move' | 'Dynamax' | 'Mega Evolution' | 'Terastal';
  series: string;                // Mezastar set/series (e.g. "Series 1", "Superstar Set 1")
}

export const MEZASTAR_CATALOG: Record<string, MezastarTagDefinition> = {
  'ML-MEZASTAR-001': {
    tagId: 'MZ-01-001',
    nfcCode: 'ML-MEZASTAR-001',
    pokemonName: 'Pikachu',
    pokeApiId: 25,
    grade: '5-Star',
    energy: 120,
    type: 'Electric',
    moves: ['10,000,000 Volt Thunderbolt', 'Volt Tackle'],
    specialAbility: 'Z-Move',
    series: 'Set 1 (Legendary Stars)',
  },
  'ML-MEZASTAR-002': {
    tagId: 'MZ-01-002',
    nfcCode: 'ML-MEZASTAR-002',
    pokemonName: 'Charizard',
    pokeApiId: 6,
    grade: '6-Star Superstar',
    energy: 172,
    type: 'Fire',
    moves: ['G-Max Wildfire', 'Blast Burn'],
    specialAbility: 'Dynamax',
    series: 'Superstar Set 1',
  },
  'ML-MEZASTAR-003': {
    tagId: 'MZ-01-003',
    nfcCode: 'ML-MEZASTAR-003',
    pokemonName: 'Blastoise',
    pokeApiId: 9,
    grade: '6-Star Superstar',
    energy: 168,
    type: 'Water',
    moves: ['G-Max Cannonade', 'Hydro Pump'],
    specialAbility: 'Dynamax',
    series: 'Superstar Set 1',
  },
  'ML-MEZASTAR-004': {
    tagId: 'MZ-01-004',
    nfcCode: 'ML-MEZASTAR-004',
    pokemonName: 'Venusaur',
    pokeApiId: 3,
    grade: '6-Star Superstar',
    energy: 168,
    type: 'Grass',
    moves: ['G-Max Vine Lash', 'Frenzy Plant'],
    specialAbility: 'Dynamax',
    series: 'Superstar Set 1',
  },
  'ML-MEZASTAR-005': {
    tagId: 'MZ-01-005',
    nfcCode: 'ML-MEZASTAR-005',
    pokemonName: 'Lucario',
    pokeApiId: 448,
    grade: '5-Star',
    energy: 135,
    type: 'Normal',
    moves: ['Aura Sphere', 'Close Combat'],
    specialAbility: 'Mega Evolution',
    series: 'Set 2',
  },
  'ML-MEZASTAR-006': {
    tagId: 'MZ-01-006',
    nfcCode: 'ML-MEZASTAR-006',
    pokemonName: 'Gengar',
    pokeApiId: 94,
    grade: '4-Star',
    energy: 110,
    type: 'Normal',
    moves: ['Shadow Ball', 'Sludge Bomb'],
    series: 'Set 2',
  },
};

export function getMezastarTagByNfcCode(nfcCode: string): MezastarTagDefinition | null {
  const code = nfcCode.trim().toUpperCase();
  return MEZASTAR_CATALOG[code] || null;
}
