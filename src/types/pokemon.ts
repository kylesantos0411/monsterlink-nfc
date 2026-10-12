// Types for PokéAPI official Pokémon reference data

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonSprites {
  frontDefault: string | null;
  frontShiny: string | null;
  officialArtwork: string | null;
  backDefault?: string | null;
  backShiny?: string | null;
}

export interface PokemonSpeciesRecord {
  pokedexNumber: number;          // National Pokédex number (e.g. 25)
  name: string;                   // Canonical lowercase name (e.g. 'pikachu')
  displayName: string;            // Capitalized / formatted name (e.g. 'Pikachu')
  speciesId: string;              // Stable unique species ID (e.g. 'species_pikachu')
  types: string[];                // Official Pokémon types (e.g. ['electric'])
  primaryType: string;            // Primary type capitalized for MONSTERLINK (e.g. 'Electric')
  height: number;                 // Decimetres
  weight: number;                 // Hectograms
  baseStats: PokemonStats;        // Standard 6 base stats
  abilities: string[];            // Canonical ability names
  moves: string[];                // Top/signature learnable move names
  sprites: PokemonSprites;        // Sprite and official artwork URLs
  genus?: string;                 // Species classification (e.g. 'Mouse Pokémon')
  description?: string;           // Flavor text description
  evolutionChainUrl?: string;     // URL to evolution chain
  evolvesFrom?: string | null;    // Previous evolution species name
}

export interface PokemonDatabaseManifest {
  version: string;
  source: string;
  importedAt: string;
  totalCount: number;
  pokemon: PokemonSpeciesRecord[];
}
