import { PokemonSpeciesRecord, PokemonDatabaseManifest } from '@/types/pokemon';
import pokemonDatabaseJson from './pokemon-database.json';

const manifest = pokemonDatabaseJson as unknown as PokemonDatabaseManifest;
export const POKEMON_DATABASE: PokemonSpeciesRecord[] = manifest.pokemon || [];

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
 * Get canonical Pokémon record by national pokedex number
 */
export function getPokemonByPokedexNumber(dexNumber: number): PokemonSpeciesRecord | null {
  return BY_POKEDEX_NUMBER.get(dexNumber) || null;
}

/**
 * Get canonical Pokémon record by lowercase name or speciesId
 */
export function getPokemonByName(nameOrId: string): PokemonSpeciesRecord | null {
  if (!nameOrId) return null;
  const clean = nameOrId.toLowerCase().trim();
  return BY_NAME.get(clean) || BY_SPECIES_ID.get(clean) || null;
}

/**
 * Get canonical artwork URL with high-fidelity priority:
 * 1. Official Artwork
 * 2. Front sprite
 * 3. Default fallback placeholder
 */
export function getPokemonArtworkUrl(pokedexNumberOrName: number | string): string {
  const p = typeof pokedexNumberOrName === 'number'
    ? getPokemonByPokedexNumber(pokedexNumberOrName)
    : getPokemonByName(pokedexNumberOrName);

  if (p && p.sprites.officialArtwork) {
    return p.sprites.officialArtwork;
  }
  if (p && p.sprites.frontDefault) {
    return p.sprites.frontDefault;
  }
  
  if (typeof pokedexNumberOrName === 'number') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumberOrName}.png`;
  }

  // Consistent fallback transparent silhouette / placeholder
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
}

/**
 * Returns list of Pokémon records matching pagination/filtering
 */
export function queryPokemonCatalog(page = 1, pageSize = 20, typeFilter?: string) {
  let list = POKEMON_DATABASE;
  if (typeFilter && typeFilter !== 'ALL') {
    const t = typeFilter.toLowerCase();
    list = list.filter(p => p.types.includes(t));
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
