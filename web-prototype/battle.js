// MonsterLink Deterministic Battle Engine
// Pure combat logic implementing formulas from docs/TECHNICAL_DECISIONS.md

import { MOVES, SPECIES_CATALOG, getTypeMultiplier } from './creatures.js';

export class BattleEngine {
  constructor(playerCreature, opponentCreature) {
    // Clone creatures so runtime HP changes don't mutate base objects immediately
    this.player = {
      ...playerCreature,
      currentHp: playerCreature.currentHp,
      species: SPECIES_CATALOG[playerCreature.speciesId]
    };
    this.opponent = {
      ...opponentCreature,
      currentHp: opponentCreature.currentHp,
      species: SPECIES_CATALOG[opponentCreature.speciesId]
    };

    this.turn = 1;
    this.isOver = false;
    this.winner = null; // 'player' | 'opponent'
    this.actionHistory = [];
    this.logs = [`Battle started between ${this.player.nickname} and ${this.opponent.nickname}!`];
  }

  // Exact deterministic formula from TECHNICAL_DECISIONS.md
  calculateDamage(attacker, defender, move) {
    const defenderSpecies = defender.species || SPECIES_CATALOG[defender.speciesId];
    const attackerSpecies = attacker.species || SPECIES_CATALOG[attacker.speciesId];
    const levelFactor = Math.floor((2 * attacker.level) / 5) + 2;
    const statFactor = (move.power * attacker.attack) / (defender.defense * 50);
    const baseDamage = Math.floor(levelFactor * statFactor + 2);

    const typeMult = getTypeMultiplier(move.type, defenderSpecies ? defenderSpecies.type : 'Normal');
    const totalDamage = Math.max(1, Math.floor(baseDamage * typeMult));

    let effectiveness = 'normal';
    if (typeMult >= 2.0) effectiveness = 'super';
    else if (typeMult <= 0.5) effectiveness = 'weak';

    return {
      damage: totalDamage,
      typeMult: typeMult,
      effectiveness: effectiveness
    };
  }

  // Simple deterministic AI: chooses move with highest type effectiveness or power
  selectOpponentMove() {
    const knownMoves = this.opponent.knownMoveIds.map(id => MOVES[id]).filter(Boolean);
    if (knownMoves.length === 0) return MOVES.tackle;

    let bestMove = knownMoves[0];
    let bestScore = -1;

    for (const move of knownMoves) {
      const mult = getTypeMultiplier(move.type, this.player.species.type);
      const score = move.power * mult;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Executes a complete turn with speed ordering and faint short-circuit
  executeTurn(playerMoveId) {
    if (this.isOver) {
      return { isOver: true, winner: this.winner, steps: [] };
    }

    const playerMove = MOVES[playerMoveId] || MOVES.tackle;
    const opponentMove = this.selectOpponentMove();
    const steps = [];

    // Speed comparison: faster attacks first; tiebreaker goes to player
    const playerFirst = this.player.speed >= this.opponent.speed;

    const firstAction = playerFirst
      ? { actor: 'player', attacker: this.player, defender: this.opponent, move: playerMove }
      : { actor: 'opponent', attacker: this.opponent, defender: this.player, move: opponentMove };

    const secondAction = playerFirst
      ? { actor: 'opponent', attacker: this.opponent, defender: this.player, move: opponentMove }
      : { actor: 'player', attacker: this.player, defender: this.opponent, move: playerMove };

    // Step 1: First Attacker Action
    const res1 = this.calculateDamage(firstAction.attacker, firstAction.defender, firstAction.move);
    firstAction.defender.currentHp = Math.max(0, firstAction.defender.currentHp - res1.damage);

    const step1Log = `${firstAction.attacker.nickname} used ${firstAction.move.name}! Dealt ${res1.damage} damage.`;
    this.logs.push(step1Log);
    this.actionHistory.push({
      turn: this.turn,
      actor: firstAction.actor,
      move: firstAction.move.name,
      damage: res1.damage
    });

    steps.push({
      actor: firstAction.actor,
      attackerName: firstAction.attacker.nickname,
      defenderName: firstAction.defender.nickname,
      move: firstAction.move,
      damage: res1.damage,
      effectiveness: res1.effectiveness,
      defenderHp: firstAction.defender.currentHp,
      defenderMaxHp: firstAction.defender.maxHp,
      log: step1Log
    });

    // Check if defender fainted
    if (firstAction.defender.currentHp === 0) {
      this.isOver = true;
      this.winner = firstAction.actor;
      const faintLog = `${firstAction.defender.nickname} fainted!`;
      this.logs.push(faintLog);
      steps.push({
        type: 'faint',
        faintedActor: firstAction.actor === 'player' ? 'opponent' : 'player',
        faintedName: firstAction.defender.nickname,
        winner: this.winner,
        log: faintLog
      });
      return { isOver: true, winner: this.winner, steps: steps };
    }

    // Step 2: Second Attacker Action (only if still alive)
    const res2 = this.calculateDamage(secondAction.attacker, secondAction.defender, secondAction.move);
    secondAction.defender.currentHp = Math.max(0, secondAction.defender.currentHp - res2.damage);

    const step2Log = `${secondAction.attacker.nickname} used ${secondAction.move.name}! Dealt ${res2.damage} damage.`;
    this.logs.push(step2Log);
    this.actionHistory.push({
      turn: this.turn,
      actor: secondAction.actor,
      move: secondAction.move.name,
      damage: res2.damage
    });

    steps.push({
      actor: secondAction.actor,
      attackerName: secondAction.attacker.nickname,
      defenderName: secondAction.defender.nickname,
      move: secondAction.move,
      damage: res2.damage,
      effectiveness: res2.effectiveness,
      defenderHp: secondAction.defender.currentHp,
      defenderMaxHp: secondAction.defender.maxHp,
      log: step2Log
    });

    // Check if second defender fainted
    if (secondAction.defender.currentHp === 0) {
      this.isOver = true;
      this.winner = secondAction.actor;
      const faintLog = `${secondAction.defender.nickname} fainted!`;
      this.logs.push(faintLog);
      steps.push({
        type: 'faint',
        faintedActor: secondAction.actor === 'player' ? 'opponent' : 'player',
        faintedName: secondAction.defender.nickname,
        winner: this.winner,
        log: faintLog
      });
      return { isOver: true, winner: this.winner, steps: steps };
    }

    this.turn++;
    return { isOver: false, winner: null, steps: steps };
  }

  // Generates complete BattleRecord for persistence
  generateBattleRecord(originalPlayerHp, originalOpponentHp) {
    return {
      recordId: 'rec_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      timestampUtc: new Date().toISOString(),
      playerSummary: {
        instanceId: this.player.instanceId,
        speciesName: this.player.species.name,
        nickname: this.player.nickname,
        level: this.player.level,
        startHp: originalPlayerHp,
        endHp: this.player.currentHp,
        maxHp: this.player.maxHp
      },
      opponentSummary: {
        speciesName: this.opponent.species.name,
        nickname: this.opponent.nickname,
        level: this.opponent.level,
        startHp: originalOpponentHp,
        endHp: this.opponent.currentHp,
        maxHp: this.opponent.maxHp
      },
      turnsTaken: this.turn,
      outcome: this.winner === 'player' ? 'Victory' : 'Defeat',
      actionLog: this.actionHistory
    };
  }
}
