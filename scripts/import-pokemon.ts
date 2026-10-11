/**
 * Incremental Pokémon Data Importer from PokéAPI
 * 
 * Fetches canonical Pokémon species data, base stats, types, abilities, moves,
 * descriptions, and high-resolution official artwork.
 * Caches results locally into `src/lib/data/pokemon-database.json` to ensure
 * zero runtime network dependencies and lightning-fast loading after build.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const CACHE_FILE = path.resolve(process.cwd(), 'src/lib/data/pokemon-database.json');

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'MonsterLink-Importer/1.0' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson<T>(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanFlavorText(text?: string): string {
  if (!text) return '';
  return text.replace(/[\f\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function importPokemonRange(startId = 1, endId = 151) {
  console.log(`====================================================`);
  console.log(`   POKÉAPI DATA & ARTWORK IMPORT PIPELINE`);
  console.log(`   Importing National Dex #${startId} to #${endId}...`);
  console.log(`====================================================`);

  let existingData: Record<number, any> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const current = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      if (Array.isArray(current.pokemon)) {
        for (const p of current.pokemon) {
          existingData[p.pokedexNumber] = p;
        }
        console.log(`Found ${Object.keys(existingData).length} existing cached Pokémon records.`);
      }
    } catch {
      console.warn('Could not parse existing database; rebuilding fresh.');
    }
  }

  const batchSize = 10;
  const idsToFetch: number[] = [];
  for (let id = startId; id <= endId; id++) {
    idsToFetch.push(id);
  }

  let verifiedArtworkCount = 0;

  for (let i = 0; i < idsToFetch.length; i += batchSize) {
    const batch = idsToFetch.slice(i, i + batchSize);
    console.log(`Fetching batch #${batch[0]} - #${batch[batch.length - 1]}...`);

    const promises = batch.map(async (id) => {
      try {
        const pokeData: any = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`);
        
        let speciesData: any = null;
        try {
          speciesData = await fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        } catch {
          // Some alternate forms or special IDs might not have matching species
        }

        const statsMap: Record<string, number> = {};
        if (Array.isArray(pokeData.stats)) {
          for (const s of pokeData.stats) {
            if (s.stat?.name) {
              statsMap[s.stat.name] = s.base_stat;
            }
          }
        }

        const types = Array.isArray(pokeData.types)
          ? pokeData.types.map((t: any) => t.type?.name?.toLowerCase() || 'normal')
          : ['normal'];

        const primaryTypeCapitalized = capitalize(types[0]);

        const abilities = Array.isArray(pokeData.abilities)
          ? pokeData.abilities.map((a: any) => capitalize(a.ability?.name?.replace('-', ' ') || ''))
          : [];

        const moves = Array.isArray(pokeData.moves)
          ? pokeData.moves.slice(0, 10).map((m: any) => capitalize(m.move?.name?.replace('-', ' ') || ''))
          : [];

        // Visual artwork priority: Official Artwork > Home > Default Sprite > Transparent Fallback
        const officialArtwork = 
          pokeData.sprites?.other?.['official-artwork']?.front_default ||
          pokeData.sprites?.other?.home?.front_default ||
          pokeData.sprites?.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

        const spriteFront = pokeData.sprites?.front_default || null;
        const spriteShiny = pokeData.sprites?.front_shiny || null;

        if (officialArtwork) verifiedArtworkCount++;

        let flavorText = '';
        let genus = 'Pokémon';
        let evolvesFrom = null;

        if (speciesData) {
          const enEntry = speciesData.flavor_text_entries?.find((e: any) => e.language?.name === 'en');
          flavorText = cleanFlavorText(enEntry?.flavor_text);
          const genusEntry = speciesData.genera?.find((g: any) => g.language?.name === 'en');
          if (genusEntry) genus = genusEntry.genus;
          if (speciesData.evolves_from_species?.name) {
            evolvesFrom = capitalize(speciesData.evolves_from_species.name);
          }
        }

        const record = {
          pokedexNumber: pokeData.id,
          name: pokeData.name.toLowerCase(),
          displayName: capitalize(pokeData.name),
          speciesId: `species_${pokeData.name.toLowerCase()}`,
          types,
          primaryType: primaryTypeCapitalized,
          height: pokeData.height,
          weight: pokeData.weight,
          baseStats: {
            hp: statsMap['hp'] || 45,
            attack: statsMap['attack'] || 49,
            defense: statsMap['defense'] || 49,
            specialAttack: statsMap['special-attack'] || 65,
            specialDefense: statsMap['special-defense'] || 65,
            speed: statsMap['speed'] || 45,
          },
          abilities,
          moves,
          sprites: {
            frontDefault: spriteFront,
            frontShiny: spriteShiny,
            officialArtwork,
          },
          genus,
          description: flavorText,
          evolvesFrom,
        };

        existingData[id] = record;
      } catch (err: any) {
        console.error(`Error importing Pokémon #${id}:`, err.message);
      }
    });

    await Promise.all(promises);
    await sleep(150); // Gentle pacing on PokéAPI
  }

  const allRecords = Object.values(existingData).sort((a: any, b: any) => a.pokedexNumber - b.pokedexNumber);

  const manifest = {
    version: '1.0.0',
    source: 'PokéAPI (https://pokeapi.co/)',
    importedAt: new Date().toISOString(),
    totalCount: allRecords.length,
    pokemon: allRecords,
  };

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`====================================================`);
  console.log(`✅ IMPORT COMPLETED SUCCESSFULLY!`);
  console.log(`Total Pokémon records saved: ${allRecords.length}`);
  console.log(`Saved to: ${CACHE_FILE}`);
  console.log(`====================================================`);
  return manifest;
}

// Allow direct execution via CLI
if (process.argv[1]?.endsWith('import-pokemon.ts') || process.argv[1]?.endsWith('import-pokemon.js')) {
  const start = parseInt(process.argv[2] || '1', 10);
  const end = parseInt(process.argv[3] || '151', 10);
  importPokemonRange(start, end).catch(err => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
}
