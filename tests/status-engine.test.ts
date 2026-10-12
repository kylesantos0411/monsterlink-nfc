import { 
  getStageMultiplier, 
  calculatePoisonDamage, 
  checkParalysisImmobilized, 
  checkFreezeThaw, 
  getEffectiveSpeed 
} from '../src/lib/battle/status-resolver';
import { calculateDamage } from '../src/lib/battle/damage-calculator';
import { CreatureInstance, CreatureSpecies, MoveDefinition } from '../src/types/creature';

console.log('====================================================');
console.log('   MONSTERLINK STATUS ENGINE & MODIFIERS TEST SUITE ');
console.log('====================================================\n');

// Mock data
const mockAttacker: CreatureInstance = {
  instanceId: 'atk_1',
  speciesId: 'species_flamby',
  nickname: 'Flamby',
  level: 5,
  maxHp: 50,
  currentHp: 50,
  attack: 60,
  defense: 45,
  speed: 65,
  knownMoveIds: ['flame_burst'],
  nfcCardCode: 'ML-0001',
  acquiredTimestampUtc: new Date().toISOString(),
};

const mockDefender: CreatureInstance = {
  instanceId: 'def_1',
  speciesId: 'species_aquat',
  nickname: 'Aquat',
  level: 5,
  maxHp: 58,
  currentHp: 58,
  attack: 48,
  defense: 65,
  speed: 44,
  knownMoveIds: ['aqua_jet'],
  nfcCardCode: 'ML-0002',
  acquiredTimestampUtc: new Date().toISOString(),
};

const mockDefenderSpecies: CreatureSpecies = {
  id: 'species_aquat',
  name: 'Aquat',
  subtitle: 'Tidal Turtle Monster',
  type: 'Water',
  rarity: 'Common',
  baseStats: { hp: 58, attack: 48, defense: 65, speed: 44 },
  learnableMoveIds: ['aqua_jet'],
  spriteKey: 'aquat',
};

const mockFlameBurst: MoveDefinition = {
  id: 'flame_burst',
  name: 'Flame Burst',
  type: 'Fire',
  power: 45,
  accuracy: 100,
  description: 'Fire blast',
};

// Test 1: Stage multipliers
console.log('Test 1: Stat Stage Multipliers...');
if (getStageMultiplier(0) !== 1.0) throw new Error('Stage 0 must be 1.0');
if (getStageMultiplier(1) !== 1.5) throw new Error('Stage 1 must be 1.5');
if (getStageMultiplier(2) !== 2.0) throw new Error('Stage 2 must be 2.0 (Hardened)');
if (getStageMultiplier(-1) !== 2 / 3) throw new Error('Stage -1 must be 0.666...');
console.log('✅ Stage multipliers verified.');

// Test 2: Poison residual calculation (1/8 max HP)
console.log('\nTest 2: Poison Residual Damage...');
const psnDmg = calculatePoisonDamage(58);
if (psnDmg !== 7) throw new Error(`Expected floor(58/8) = 7, got ${psnDmg}`);
console.log(`✅ Poison damage correctly calculated: ${psnDmg} HP.`);

// Test 3: Paralysis speed penalty & immobilization roll
console.log('\nTest 3: Paralysis Speed Penalty & Immobilization...');
const normalSpeed = getEffectiveSpeed(mockAttacker, 'none');
const paralyzedSpeed = getEffectiveSpeed(mockAttacker, 'paralysis');
if (paralyzedSpeed !== Math.floor(normalSpeed * 0.5)) {
  throw new Error(`Expected 50% speed for paralysis: ${paralyzedSpeed} vs ${normalSpeed}`);
}
if (!checkParalysisImmobilized(0.10)) throw new Error('Roll 0.10 should be immobilized (< 0.25)');
if (checkParalysisImmobilized(0.30)) throw new Error('Roll 0.30 should act normally (>= 0.25)');
console.log('✅ Paralysis speed penalty and turn skip verified.');

// Test 4: Freeze thaw roll
console.log('\nTest 4: Freeze Thaw Probability...');
if (!checkFreezeThaw(0.20)) throw new Error('Roll 0.20 should thaw (< 0.25)');
if (checkFreezeThaw(0.50)) throw new Error('Roll 0.50 should remain frozen (>= 0.25)');
console.log('✅ Freeze thaw probability verified.');

// Test 5: Damage Calculator with Hardening (+2 stages)
console.log('\nTest 5: Damage Calculator with Hardening (+2 Defense)...');
const unbuffedResult = calculateDamage(mockAttacker, mockDefender, mockDefenderSpecies, mockFlameBurst);
const hardenedResult = calculateDamage(mockAttacker, mockDefender, mockDefenderSpecies, mockFlameBurst, { defenseStages: 2 });
if (hardenedResult.damage >= unbuffedResult.damage) {
  throw new Error(`Hardened defense must take less damage: ${hardenedResult.damage} vs ${unbuffedResult.damage}`);
}
console.log(`✅ Hardening reduced damage from ${unbuffedResult.damage} to ${hardenedResult.damage}.`);

// Test 6: Damage Calculator with Shield / Block (100% blocked = 0 dmg)
console.log('\nTest 6: Damage Calculator with Block / Shield...');
const blockedResult = calculateDamage(mockAttacker, mockDefender, mockDefenderSpecies, mockFlameBurst, { isShielded: true });
if (blockedResult.damage !== 0) {
  throw new Error(`Shielded attack must deal 0 damage, got ${blockedResult.damage}`);
}
console.log('✅ Shield / Block successfully negated 100% of incoming damage to 0.');

console.log('\n----------------------------------------------------');
console.log('All Status Engine & Modifiers tests passed! 🎉');
console.log('----------------------------------------------------');
