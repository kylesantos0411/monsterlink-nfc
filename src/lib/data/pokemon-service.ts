import { PokemonSpeciesRecord, PokemonDatabaseManifest } from '@/types/pokemon';
import monsterDatabaseJson from './monster-database.json';

const manifest = monsterDatabaseJson as unknown as PokemonDatabaseManifest;
export const POKEMON_DATABASE: PokemonSpeciesRecord[] = manifest.pokemon || [];
export const MONSTER_DATABASE: PokemonSpeciesRecord[] = POKEMON_DATABASE;

// Fast O(1) indexed lookups
const BY_POKEDEX_NUMBER = new Map<number, PokemonSpeciesRecord>();
const BY_NAME = new Map<string, PokemonSpeciesRecord>();
const BY_SPECIES_ID = new Map<string, PokemonSpeciesRecord>();

for (const p of POKEMON_DATABASE) {
  BY_POKEDEX_NUMBER.set(p.pokedexNumber, p);
  BY_NAME.set(p.name.toLowerCase(), p);
  BY_SPECIES_ID.set(p.speciesId.toLowerCase(), p);
}

/**
 * Get canonical monster record by Dex number (1 to 50)
 */
export function getPokemonByPokedexNumber(dexNumber: number): PokemonSpeciesRecord | null {
  return BY_POKEDEX_NUMBER.get(dexNumber) || null;
}
export const getMonsterByDexNumber = getPokemonByPokedexNumber;

/**
 * Get canonical monster record by lowercase name or speciesId
 */
export function getPokemonByName(nameOrId: string): PokemonSpeciesRecord | null {
  if (!nameOrId) return null;
  const clean = nameOrId.toLowerCase().trim();
  return BY_NAME.get(clean) || BY_SPECIES_ID.get(clean) || null;
}
export const getMonsterByName = getPokemonByName;

/**
 * Get canonical artwork URL for monster
 */
export function getPokemonArtworkUrl(pokedexNumberOrName: number | string): string {
  const p = typeof pokedexNumberOrName === 'number'
    ? getPokemonByPokedexNumber(pokedexNumberOrName)
    : getPokemonByName(pokedexNumberOrName);

  if (p && p.sprites?.frontDefault) {
    return p.sprites.frontDefault;
  }
  if (p && p.sprites?.officialArtwork) {
    return p.sprites.officialArtwork;
  }

  if (typeof pokedexNumberOrName === 'number') {
    const padded = String(pokedexNumberOrName).padStart(3, '0');
    return `/monsters/monster_${padded}.png`;
  }

  return '/monsters/monster_001.png';
}
export const getMonsterArtworkUrl = getPokemonArtworkUrl;

/**
 * Returns list of Monster records matching pagination/filtering
 */
export function queryPokemonCatalog(page = 1, pageSize = 20, typeFilter?: string) {
  let list = POKEMON_DATABASE;
  if (typeFilter && typeFilter !== 'ALL') {
    const t = typeFilter.toLowerCase();
    list = list.filter(p => p.types.some(type => type.toLowerCase() === t) || p.primaryType.toLowerCase() === t);
  }
  const total = list.length;
  const offset = (page - 1) * pageSize;
  const items = list.slice(offset, offset + pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
export const queryMonsterCatalog = queryPokemonCatalog;

/**
 * Searches monsters by name, display name, or Dex number
 */
export function searchPokemon(query: string, limit = 50): PokemonSpeciesRecord[] {
  if (!query || !query.trim()) {
    return POKEMON_DATABASE.slice(0, limit);
  }
  const q = query.trim().toLowerCase();
  const num = parseInt(q.replace('#', '').replace('ml-', ''), 10);

  return POKEMON_DATABASE.filter(p => {
    if (!isNaN(num) && p.pokedexNumber === num) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      p.primaryType.toLowerCase().includes(q) ||
      p.types.some(t => t.toLowerCase().includes(q))
    );
  }).slice(0, limit);
}
export const searchMonsters = searchPokemon;
