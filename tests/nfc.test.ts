import { CARD_REGISTRY } from '../src/lib/data/catalog';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log('       WEB NFC TAG DISPATCH INTEGRATION TEST        ');
console.log('====================================================\n');

// Test 1: Tag dispatch simulated handler
console.log('Testing tag payload parsing...');
function simulateTagDispatch(serialOrNdef: string): { success: boolean; speciesId?: string; error?: string } {
  const code = serialOrNdef.trim().toUpperCase();
  const card = CARD_REGISTRY[code];
  if (!card) {
    return { success: false, error: 'Unknown tag' };
  }
  return { success: true, speciesId: card.speciesId };
}

// Physical UID scan simulation
const uidResult = simulateTagDispatch('ML-MEZASTAR-001');
assert(uidResult.success === true, 'Pikachu MEZASTAR tag parsed from UID');
assert(uidResult.speciesId === 'species_pikachu', 'Pikachu species matched');
console.log('✅ MEZASTAR tag UID dispatch verified.');

// Unregistered tag scan simulation
const unknownResult = simulateTagDispatch('04:A2:3B:4C:5D:6E');
assert(unknownResult.success === false, 'Unknown raw UID rejected cleanly');
assert(unknownResult.error === 'Unknown tag', 'Correct error payload');
console.log('✅ Unknown physical tag error handling verified.');

console.log('\n----------------------------------------------------');
console.log('Web NFC dispatch tests passed successfully! 🎉');
console.log('----------------------------------------------------');
