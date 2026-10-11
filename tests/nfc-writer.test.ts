import assert from 'node:assert';
import {
  formatCardIdentifier,
  parseNdefTag,
  checkNfcSupport,
  resolveCardToPokemonData,
} from '../src/lib/nfc/ntag215-service';
import { resolveCardRegistryEntry, CARD_REGISTRY } from '../src/lib/data/catalog';
import { getPokemonByPokedexNumber } from '../src/lib/data/pokemon-service';

async function runNfcWriterTests() {
  console.log('====================================================');
  console.log('  MONSTERLINK NTAG215 DIRECT NFC TEST SUITE         ');
  console.log('====================================================\n');

  // Test 1: Identifier formatting
  console.log('Test 1: Card Identifier Generation & Formatting...');
  assert.strictEqual(formatCardIdentifier(25), 'ML-0025', 'Format Pikachu Dex 25 to ML-0025');
  assert.strictEqual(formatCardIdentifier(1), 'ML-0001', 'Format Bulbasaur Dex 1 to ML-0001');
  assert.strictEqual(formatCardIdentifier(151), 'ML-0151', 'Format Mew Dex 151 to ML-0151');
  assert.strictEqual(formatCardIdentifier(448), 'ML-0448', 'Format Lucario Dex 448 to ML-0448');
  assert.strictEqual(formatCardIdentifier(25, 'ML-PKMN'), 'ML-PKMN-0025', 'Custom prefix formatting');
  console.log('✅ Identifier formatting tests passed.\n');

  // Test 2: NDEF Tag Parsing for NTAG215
  console.log('Test 2: NDEF Payload Parsing for NTAG215...');
  const textEncoder = new TextEncoder();

  // Valid Text Record
  const mockTextRecordMessage = {
    records: [
      {
        recordType: 'text',
        data: textEncoder.encode('ML-0025'),
        encoding: 'utf-8',
      },
    ],
  };
  const parsed1 = parseNdefTag(mockTextRecordMessage, '04:5A:22:9A:F1:67:80');
  assert.strictEqual(parsed1.cardCode, 'ML-0025', 'Parses text record ML-0025 correctly');

  // URL fallback format (e.g. if programmed as URL)
  const mockUrlRecordMessage = {
    records: [
      {
        recordType: 'url',
        data: textEncoder.encode('https://monsterlink.app/tag/ML-0150'),
      },
    ],
  };
  const parsed2 = parseNdefTag(mockUrlRecordMessage);
  assert.strictEqual(parsed2.cardCode, 'ML-0150', 'Parses URL record tag identifier correctly');

  // Empty NTAG215 tag (no records)
  const emptyTagMessage = { records: [] };
  const parsedEmpty = parseNdefTag(emptyTagMessage, '04:B2:11:AA:CC:DD:EE');
  assert.strictEqual(parsedEmpty.cardCode, '04:B2:11:AA:CC:DD:EE', 'Empty tag falls back to hardware UID');

  const completelyBlank = parseNdefTag({ records: [] });
  assert.strictEqual(completelyBlank.cardCode, '', 'Blank tag with no UID returns empty string');
  console.log('✅ NDEF payload parsing tests passed.\n');

  // Test 3: Dynamic Card Resolution Against Pokémon Database
  console.log('Test 3: Card Identifier Resolution against National Dex...');
  
  // Bulbasaur (Dex #1)
  const entry001 = resolveCardRegistryEntry('ML-0001');
  assert(entry001 !== null, 'ML-0001 must resolve to Bulbasaur');
  assert.strictEqual(entry001?.speciesId, 'species_bulbasaur', 'Species ID matches bulbasaur');

  // Pikachu (Dex #25)
  const entry025 = resolveCardRegistryEntry('ML-0025');
  assert(entry025 !== null, 'ML-0025 must resolve to Pikachu');
  assert.strictEqual(entry025?.speciesId, 'species_pikachu', 'Species ID matches pikachu');

  // Mew (Dex #151)
  const entry151 = resolveCardRegistryEntry('ML-0151');
  assert(entry151 !== null, 'ML-0151 must resolve to Mew');
  assert.strictEqual(entry151?.rarity, 'Legendary', 'Mew receives Legendary rarity');

  // Preset MEZASTAR Tag
  const mezastar001 = resolveCardRegistryEntry('ML-MEZASTAR-001');
  assert(mezastar001 !== null, 'ML-MEZASTAR-001 resolves');
  assert.strictEqual(mezastar001?.grade, '5-Star', 'MEZASTAR 5-Star grade matches');

  // Invalid / Unknown Code
  const invalidCode = resolveCardRegistryEntry('ML-UNKNOWN-9999');
  assert.strictEqual(invalidCode, null, 'Unregistered / out-of-range codes return null');
  console.log('✅ Card identifier resolution tests passed.\n');

  // Test 4: Visual & Combat Data Resolution (Artwork & Duplicate Protection)
  console.log('Test 4: Visual & Combat Data Resolution...');
  const registeredMockMap = {
    'ML-0001': { instanceId: 'inst_123', registeredAt: '2026-10-12' },
  };

  const resolved001 = resolveCardToPokemonData('ML-0001', registeredMockMap);
  assert(resolved001 !== null, 'ML-0001 resolves full data');
  assert.strictEqual(resolved001?.isAlreadyRegistered, true, 'Flags duplicate registration correctly');
  assert(resolved001?.artworkUrl?.includes('official-artwork/1.png'), 'Contains verified official artwork');

  const resolved025 = resolveCardToPokemonData('ML-0025', registeredMockMap);
  assert(resolved025 !== null, 'ML-0025 resolves full data');
  assert.strictEqual(resolved025?.isAlreadyRegistered, false, 'Fresh card is not registered yet');
  assert(resolved025?.artworkUrl?.includes('official-artwork/25.png'), 'Contains Pikachu official artwork');
  console.log('✅ Visual and duplicate protection tests passed.\n');

  // Test 5: Hardware detection schema
  console.log('Test 5: Hardware Support Detection Schema...');
  const support = checkNfcSupport();
  assert(typeof support.hasWebNfc === 'boolean', 'hasWebNfc is boolean');
  assert(typeof support.isSupported === 'boolean', 'isSupported is boolean');
  assert(typeof support.recommendation === 'string', 'recommendation is string');
  console.log('✅ Hardware detection schema verified.\n');

  // Test 6: Write & Verify Sequence
  console.log('Test 6: Write & Verify Sequence & Step Tracking...');
  const { simulateWriteAndVerify } = await import('../src/lib/nfc/ntag215-service');
  let progressCalled = false;
  const verifyRes = simulateWriteAndVerify('ML-0025', (steps) => {
    progressCalled = true;
    assert(Array.isArray(steps), 'Steps must be an array');
    assert.strictEqual(steps.length, 4, 'Must have 4 verification steps');
  });
  assert.strictEqual(verifyRes.verified, true, 'Result verified must be true');
  assert.strictEqual(verifyRes.cardCode, 'ML-0025', 'Card code verified matches');
  assert(progressCalled, 'Progress callback was triggered');
  assert.strictEqual(verifyRes.steps[3].status, 'success', 'Final verification step must succeed');
  console.log('✅ Write & verify sequence tests passed.\n');

  console.log('----------------------------------------------------');
  console.log('All NTAG215 Direct NFC tests passed successfully! 🎉');
  console.log('----------------------------------------------------');
}

runNfcWriterTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
