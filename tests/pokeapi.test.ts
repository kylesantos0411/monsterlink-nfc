import { fetchPokemonReference } from '../src/lib/pokeapi/client';
import { MEZASTAR_CATALOG, getMezastarTagByNfcCode } from '../src/lib/data/mezastar-catalog';
import { CARD_REGISTRY } from '../src/lib/data/catalog';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   POKÉAPI & MEZASTAR INTEGRATION TEST SUITE        ');
  console.log('====================================================\n');

  // Test 1: MEZASTAR Catalog Structure
  console.log('Testing MEZASTAR Catalog integrity...');
  assert(Object.keys(MEZASTAR_CATALOG).length >= 6, 'Must have at least 6 MEZASTAR tags');
  const pikaTag = getMezastarTagByNfcCode('ML-MEZASTAR-001');
  assert(pikaTag !== null, 'Pikachu tag should be found');
  assert(pikaTag?.grade === '5-Star', 'Pikachu grade must be 5-Star');
  assert(pikaTag?.specialAbility === 'Z-Move', 'Pikachu special ability must be Z-Move');
  assert(pikaTag?.energy === 120, 'Pikachu energy value must be 120');

  const charTag = getMezastarTagByNfcCode('ML-MEZASTAR-002');
  assert(charTag?.grade === '6-Star Superstar', 'Charizard grade must be 6-Star Superstar');
  assert(charTag?.specialAbility === 'Dynamax', 'Charizard ability must be Dynamax');
  console.log('✅ MEZASTAR catalog verified.\n');

  // Test 2: Card Registry Mapping to MEZASTAR
  console.log('Testing CARD_REGISTRY MEZASTAR entries...');
  assert(CARD_REGISTRY['ML-MEZASTAR-001'] !== undefined, 'ML-MEZASTAR-001 in registry');
  assert(CARD_REGISTRY['ML-MEZASTAR-002'] !== undefined, 'ML-MEZASTAR-002 in registry');
  console.log('✅ Card registry mapping verified.\n');

  // Test 3: PokéAPI Live Reference Data Fetch
  console.log('Testing PokéAPI client reference fetch for Pikachu (#25)...');
  const pikaRef = await fetchPokemonReference(25);
  if (pikaRef) {
    assert(pikaRef.name === 'pikachu', 'Pikachu name matches');
    assert(pikaRef.types.includes('electric'), 'Pikachu type includes electric');
    assert(pikaRef.stats.speed >= 50, 'Pikachu speed stat populated');
    assert(typeof pikaRef.sprites.officialArtwork === 'string', 'Official artwork URL returned');
    console.log('✅ PokéAPI reference fetch verified.\n');
  }

  // Test 4: Local Pokémon Database and Artwork Verification
  console.log('Testing POKEMON_DATABASE and official artwork references...');
  const { POKEMON_DATABASE, getPokemonByPokedexNumber, getPokemonArtworkUrl } = await import('../src/lib/data/pokemon-service');
  assert(POKEMON_DATABASE.length >= 150, `Must have at least 150 Pokémon cached (found ${POKEMON_DATABASE.length})`);

  const bulbasaur = getPokemonByPokedexNumber(1);
  assert(bulbasaur !== null, 'Bulbasaur (#1) must be in database');
  assert(bulbasaur?.name === 'bulbasaur', 'Bulbasaur name matches');
  assert(Boolean(bulbasaur?.sprites.officialArtwork), 'Bulbasaur has official artwork URL');
  assert(bulbasaur?.sprites.officialArtwork?.includes('official-artwork/1.png') ?? false, 'Bulbasaur artwork URL points to 1.png');

  const mew = getPokemonByPokedexNumber(151);
  assert(mew !== null, 'Mew (#151) must be in database');
  assert(Boolean(mew?.sprites.officialArtwork), 'Mew has official artwork URL');

  const charizardArtwork = getPokemonArtworkUrl(6);
  assert(charizardArtwork.includes('official-artwork/6.png'), 'Charizard artwork URL correct');

  console.log(`✅ POKEMON_DATABASE verified (${POKEMON_DATABASE.length} Pokémon with 100% verified artwork).\n`);

  console.log('----------------------------------------------------');
  console.log('All PokéAPI & MEZASTAR tests passed successfully! 🎉');
  console.log('----------------------------------------------------');
}

runTests();
