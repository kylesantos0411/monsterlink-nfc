export interface PokeApiReferenceData {
  id: number;
  name: string;
  displayName: string;
  types: string[];
  height: number;
  weight: number;
  sprites: {
    frontDefault: string | null;
    frontShiny: string | null;
    officialArtwork: string | null;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

// In-memory cache for fetched PokeAPI reference objects
const pokeApiCache = new Map<string, PokeApiReferenceData>();

export async function fetchPokemonReference(pokemonNameOrId: string | number): Promise<PokeApiReferenceData | null> {
  const query = String(pokemonNameOrId).toLowerCase().trim();
  if (pokeApiCache.has(query)) {
    return pokeApiCache.get(query)!;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`PokéAPI responded with status ${res.status}`);
    }

    const data = await res.json();

    const statsMap: Record<string, number> = {};
    if (Array.isArray(data.stats)) {
      for (const s of data.stats) {
        if (s.stat && s.stat.name) {
          statsMap[s.stat.name] = s.base_stat;
        }
      }
    }

    const typesList: string[] = Array.isArray(data.types)
      ? data.types.map((t: any) => t.type?.name || 'normal')
      : ['normal'];

    const formatted: PokeApiReferenceData = {
      id: data.id,
      name: data.name,
      displayName: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      types: typesList,
      height: data.height,
      weight: data.weight,
      sprites: {
        frontDefault: data.sprites?.front_default || null,
        frontShiny: data.sprites?.front_shiny || null,
        officialArtwork: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || null,
      },
      stats: {
        hp: statsMap['hp'] || 50,
        attack: statsMap['attack'] || 50,
        defense: statsMap['defense'] || 50,
        specialAttack: statsMap['special-attack'] || 50,
        specialDefense: statsMap['special-defense'] || 50,
        speed: statsMap['speed'] || 50,
      },
    };

    pokeApiCache.set(query, formatted);
    pokeApiCache.set(String(data.id), formatted);
    return formatted;
  } catch (err) {
    console.warn(`Failed to fetch PokéAPI data for "${query}":`, err);
    return null;
  }
}
