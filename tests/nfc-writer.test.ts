import assert from 'node:assert';
import {
  formatCardIdentifier,
  parseNdefTag,
  checkNfcSupport,
  resolveCardToPokemonData,
} from '../src/lib/nfc/ntag215-service';
import { resolveCardRegistryEntry, CARD_REGISTRY } from '../src/lib/data/catalog';
import { getPokemonByPokedexNumber, POKEMON_DATABASE } from '../src/lib/data/pokemon-service';

async function runNfcWriterTests() {
  console.log('====================================================');
  console.log('  MONSTERLINK NTAG215 DIRECT NFC TEST SUITE         ');
  console.log('====================================================\n');

  // Test 1: Identifier formatting
  console.log('Test 1: Card Identifier Generation & Formatting...');
  assert.strictEqual(formatCardIdentifier(1), 'ML-0001', 'Format Flamby Dex 1 to ML-0001');
  assert.strictEqual(formatCardIdentifier(25), 'ML-0025', 'Format Bloomy Dex 25 to ML-0025');
  assert.strictEqual(formatCardIdentifier(42), 'ML-0042', 'Format Jett Dex 42 to ML-0042');
  assert.strictEqual(formatCardIdentifier(50), 'ML-0050', 'Format Orbit Dex 50 to ML-0050');
  assert.strictEqual(formatCardIdentifier(1, 'ML-MONSTER'), 'ML-MONSTER-0001', 'Custom prefix formatting');
  console.log('✅ Identifier formatting tests passed.\n');

  // Test 2: NDEF Tag Parsing for NTAG215
  console.log('Test 2: NDEF Payload Parsing for NTAG215...');
  const textEncoder = new TextEncoder();

  // Valid Text Record
  const mockTextRecordMessage = {
    records: [
      {
        recordType: 'text',
        data: textEncoder.encode('ML-0001'),
        encoding: 'utf-8',
      },
    ],
  };
  const parsed1 = parseNdefTag(mockTextRecordMessage, '04:5A:22:9A:F1:67:80');
  assert.strictEqual(parsed1.cardCode, 'ML-0001', 'Parses text record ML-0001 correctly');

  // URL fallback format
  const mockUrlRecordMessage = {
    records: [
      {
        recordType: 'url',
        data: textEncoder.encode('https://monsterlink.app/tag/ML-0050'),
      },
    ],
  };
  const parsed2 = parseNdefTag(mockUrlRecordMessage);
  assert.strictEqual(parsed2.cardCode, 'ML-0050', 'Parses URL record tag identifier correctly');

  // Empty NTAG215 tag (no records)
  const emptyTagMessage = { records: [] };
  const parsedEmpty = parseNdefTag(emptyTagMessage, '04:B2:11:AA:CC:DD:EE');
  assert.strictEqual(parsedEmpty.cardCode, '04:B2:11:AA:CC:DD:EE', 'Empty tag falls back to hardware UID');

  const completelyBlank = parseNdefTag({ records: [] });
  assert.strictEqual(completelyBlank.cardCode, '', 'Blank tag with no UID returns empty string');
  console.log('✅ NDEF payload parsing tests passed.\n');

  // Test 3: Dynamic Card Resolution Against 50 Custom Monsters Database
  console.log('Test 3: Card Identifier Resolution against Monster Database...');
  assert.strictEqual(POKEMON_DATABASE.length, 50, 'Database contains all 50 custom creatures');

  // Flamby (Dex #1)
  const entry001 = resolveCardRegistryEntry('ML-0001');
  assert(entry001 !== null, 'ML-0001 must resolve to Flamby');
  assert.strictEqual(entry001?.speciesId, 'species_flamby', 'Species ID matches flamby');

  // Bloomy (Dex #25)
  const entry025 = resolveCardRegistryEntry('ML-0025');
  assert(entry025 !== null, 'ML-0025 must resolve to Bloomy');
  assert.strictEqual(entry025?.speciesId, 'species_bloomy', 'Species ID matches bloomy');

  // Jett (Dex #42 - Dragon)
  const entry042 = resolveCardRegistryEntry('ML-0042');
  assert(entry042 !== null, 'ML-0042 must resolve to Jett');
  assert.strictEqual(entry042?.speciesId, 'species_jett', 'Species ID matches jett');
  assert.strictEqual(entry042?.rarity, 'Legendary', 'Apex monster Jett receives Legendary rarity');

  // Orbit (Dex #50)
  const entry050 = resolveCardRegistryEntry('ML-0050');
  assert(entry050 !== null, 'ML-0050 must resolve to Orbit');
  assert.strictEqual(entry050?.speciesId, 'species_orbit', 'Species ID matches orbit');

  // Invalid / Unknown Code
  const invalidCode = resolveCardRegistryEntry('ML-UNKNOWN-9999');
  assert.strictEqual(invalidCode, null, 'Unregistered / out-of-range codes return null');
  console.log('✅ Card identifier resolution tests passed.\n');

  // Test 4: Visual & Combat Data Resolution (Sprite Assets & Duplicate Protection)
  console.log('Test 4: Visual & Combat Data Resolution...');
  const registeredMockMap = {
    'ML-0001': { instanceId: 'inst_123', registeredAt: '2026-10-12' },
  };

  const resolved001 = resolveCardToPokemonData('ML-0001', registeredMockMap);
  assert(resolved001 !== null, 'ML-0001 resolves full data');
  assert.strictEqual(resolved001?.isAlreadyRegistered, true, 'Flags duplicate registration correctly');
  assert(resolved001?.artworkUrl?.includes('/monsters/monster_001.png'), 'Contains verified monster_001 sprite asset');

  const resolved042 = resolveCardToPokemonData('ML-0042', registeredMockMap);
  assert(resolved042 !== null, 'ML-0042 resolves full data');
  assert.strictEqual(resolved042?.isAlreadyRegistered, false, 'Fresh card is not registered yet');
  assert(resolved042?.artworkUrl?.includes('/monsters/monster_042.png'), 'Contains Jett sprite asset');
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
  const verifyRes = simulateWriteAndVerify('ML-0042', (steps) => {
    progressCalled = true;
    assert(Array.isArray(steps), 'Steps must be an array');
    assert.strictEqual(steps.length, 4, 'Must have 4 verification steps');
  });
  assert.strictEqual(verifyRes.verified, true, 'Result verified must be true');
  assert.strictEqual(verifyRes.cardCode, 'ML-0042', 'Card code verified matches');
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
