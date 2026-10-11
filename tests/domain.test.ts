import { calculateDamage } from '../src/lib/battle/damage-calculator';
import { getTypeMultiplier } from '../src/lib/battle/type-chart';
import { BattleEngine } from '../src/lib/battle/battle-engine';
import { createBattleRecord } from '../src/lib/battle/record-factory';
import { SPECIES_CATALOG, MOVES_CATALOG, createCreatureInstance, CARD_REGISTRY } from '../src/lib/data/catalog';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log('    MONSTERLINK TYPESCRIPT DOMAIN VERIFICATION      ');
console.log('====================================================\n');

// Test 1: Type Chart Multipliers
console.log('Testing Type Chart Multipliers...');
assert(getTypeMultiplier('Fire', 'Grass') === 2.0, 'Fire vs Grass should be 2.0x');
assert(getTypeMultiplier('Fire', 'Water') === 0.5, 'Fire vs Water should be 0.5x');
assert(getTypeMultiplier('Electric', 'Water') === 2.0, 'Electric vs Water should be 2.0x');
assert(getTypeMultiplier('Normal', 'Normal') === 1.0, 'Normal vs Normal should be 1.0x');
console.log('✅ Type Chart verified.\n');

// Test 2: Deterministic Damage Math & Min Clamp
console.log('Testing Deterministic Damage Calculator...');
const ignisaur = createCreatureInstance('species_ignisaur', 'ML-CARD-FIRE-001', 'Sparky', 5);
const aquabite = createCreatureInstance('species_aquabite', 'ML-CARD-WATER-002', 'Splashy', 5);

const damageResult = calculateDamage(ignisaur, aquabite, SPECIES_CATALOG['species_aquabite'], MOVES_CATALOG['flame_burst']);
assert(damageResult.damage >= 1, 'Damage must be >= 1 HP');
assert(damageResult.typeMultiplier === 0.5, 'Fire against Water must have 0.5x multiplier');
assert(damageResult.effectiveness === 'weak', 'Effectiveness should be weak');
console.log(`✅ Damage calculated: ${damageResult.damage} dmg (0.5x weak).\n`);

// Test 3: Battle Engine Turn Flow & Faint Handling
console.log('Testing Battle Engine Turn Flow...');
const engine = new BattleEngine(ignisaur, aquabite);
assert(engine.currentTurn === 1, 'Initial turn should be 1');
assert(!engine.isBattleOver, 'Battle should not be over initially');

let safetyTurns = 0;
while (!engine.isBattleOver && safetyTurns < 20) {
  engine.executeTurn('flame_burst');
  safetyTurns++;
}

assert(engine.isBattleOver, 'Battle must reach conclusion');
assert(engine.winner === 'player' || engine.winner === 'opponent', 'Winner must be player or opponent');
assert(engine.player.currentHp === 0 || engine.opponent.currentHp === 0, 'One combatant must have fainted (0 HP)');
console.log(`✅ Battle finished in ${engine.currentTurn} turns. Winner: ${engine.winner}.\n`);

// Test 4: Battle Record Generation
console.log('Testing Battle Record Factory...');
const record = createBattleRecord(engine, ignisaur.maxHp, aquabite.maxHp, 'bat_test_001');
assert(record.recordId === 'bat_test_001', 'Record ID preserved');
assert(record.playerCreature.startHp === ignisaur.maxHp, 'Player start HP accurate');
assert(record.opponentCreature.startHp === aquabite.maxHp, 'Opponent start HP accurate');
assert(record.outcome === 'Victory' || record.outcome === 'Defeat', 'Outcome is definitive');
assert(record.movesUsedSummary.length > 0, 'Moves log populated');
console.log(`✅ Battle record generated: ${record.outcome} - ${record.movesUsedSummary.length} moves recorded.\n`);

// Test 5: Card Registry Integrity
console.log('Testing Card Registry & Factory...');
const card = CARD_REGISTRY['ML-CARD-FIRE-001'];
assert(card !== undefined, 'ML-CARD-FIRE-001 must exist in registry');
assert(card.speciesId === 'species_ignisaur', 'Card maps to Ignisaur');
assert(card.grade === '2-Star', 'Card grade recorded');
console.log('✅ Card registry verified.\n');

console.log('----------------------------------------------------');
console.log('All TypeScript domain tests passed successfully! 🎉');
console.log('----------------------------------------------------');
