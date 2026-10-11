import { CreatureInstance, MoveDefinition } from '@/types/creature';
import { CombatActionStep, CombatantSide, TurnResult } from '@/types/battle';
import { calculateDamage } from './damage-calculator';
import { getTypeMultiplier } from './type-chart';
import { MOVES_CATALOG, SPECIES_CATALOG } from '../data/catalog';

export class BattleEngine {
  public player: CreatureInstance;
  public opponent: CreatureInstance;
  public currentTurn: number;
  public isBattleOver: boolean;
  public winner: CombatantSide | null;
  public actionLog: CombatActionStep[];

  constructor(playerCreature: CreatureInstance, opponentCreature: CreatureInstance) {
    // Clone to keep match mutations isolated
    this.player = { ...playerCreature };
    this.opponent = { ...opponentCreature };
    this.currentTurn = 1;
    this.isBattleOver = false;
    this.winner = null;
    this.actionLog = [];
  }

  public selectOpponentMove(): MoveDefinition {
    const knownMoves = this.opponent.knownMoveIds
      .map(id => MOVES_CATALOG[id])
      .filter((m): m is MoveDefinition => Boolean(m));

    if (knownMoves.length === 0) {
      return MOVES_CATALOG.tackle;
    }

    const playerSpecies = SPECIES_CATALOG[this.player.speciesId];
    let bestMove = knownMoves[0];
    let bestScore = -1;

    for (const move of knownMoves) {
      const mult = getTypeMultiplier(move.type, playerSpecies?.type || 'Normal');
      const score = move.power * mult;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  public executeTurn(playerMoveId: string, opponentMoveId?: string): TurnResult {
    if (this.isBattleOver) {
      throw new Error('Cannot execute turn: Battle has already concluded.');
    }

    if (this.player.currentHp <= 0 || this.opponent.currentHp <= 0) {
      throw new Error('Cannot execute turn: One or both combatants have fainted.');
    }

    const playerMove = MOVES_CATALOG[playerMoveId] || MOVES_CATALOG[this.player.knownMoveIds[0]] || MOVES_CATALOG.tackle;
    const opponentMove = opponentMoveId ? (MOVES_CATALOG[opponentMoveId] || this.selectOpponentMove()) : this.selectOpponentMove();

    const steps: CombatActionStep[] = [];

    // Speed Priority: Higher speed strikes first (Tie-break goes to Player)
    const playerActsFirst = this.player.speed >= this.opponent.speed;

    const first = playerActsFirst
      ? { side: 'player' as CombatantSide, atk: this.player, def: this.opponent, move: playerMove }
      : { side: 'opponent' as CombatantSide, atk: this.opponent, def: this.player, move: opponentMove };

    const second = playerActsFirst
      ? { side: 'opponent' as CombatantSide, atk: this.opponent, def: this.player, move: opponentMove }
      : { side: 'player' as CombatantSide, atk: this.player, def: this.opponent, move: playerMove };

    // Step 1: First combatant acts
    const step1 = this.resolveAction(first.side, first.atk, first.def, first.move);
    steps.push(step1);
    this.actionLog.push(step1);

    // If defender fainted, combat immediately concludes (fainted creature CANNOT strike back)
    if (step1.didDefenderFaint) {
      this.isBattleOver = true;
      this.winner = first.side;
      return {
        turnNumber: this.currentTurn,
        steps,
        isBattleOver: true,
        winner: this.winner,
        endingMessage: `${first.def.nickname} fainted! ${first.atk.nickname} wins!`,
      };
    }

    // Step 2: Second combatant acts
    const step2 = this.resolveAction(second.side, second.atk, second.def, second.move);
    steps.push(step2);
    this.actionLog.push(step2);

    if (step2.didDefenderFaint) {
      this.isBattleOver = true;
      this.winner = second.side;
      return {
        turnNumber: this.currentTurn,
        steps,
        isBattleOver: true,
        winner: this.winner,
        endingMessage: `${second.def.nickname} fainted! ${second.atk.nickname} wins!`,
      };
    }

    this.currentTurn += 1;

    return {
      turnNumber: this.currentTurn - 1,
      steps,
      isBattleOver: false,
      winner: null,
      endingMessage: `End of Turn ${this.currentTurn - 1}`,
    };
  }

  private resolveAction(
    actorSide: CombatantSide,
    attacker: CreatureInstance,
    defender: CreatureInstance,
    move: MoveDefinition
  ): CombatActionStep {
    const defenderSpecies = SPECIES_CATALOG[defender.speciesId];
    const calc = calculateDamage(attacker, defender, defenderSpecies, move);

    defender.currentHp = Math.max(0, defender.currentHp - calc.damage);
    const didFaint = defender.currentHp <= 0;

    let effText = '';
    if (calc.effectiveness === 'super') effText = " It's super effective!";
    if (calc.effectiveness === 'weak') effText = " It's not very effective...";

    const narration = `${attacker.nickname} used ${move.name}! Dealt ${calc.damage} damage.${effText}${didFaint ? ` ${defender.nickname} fainted!` : ''}`;

    return {
      actor: actorSide,
      attackerName: attacker.nickname,
      defenderName: defender.nickname,
      moveUsed: move,
      damageDealt: calc.damage,
      effectiveness: calc.effectiveness,
      defenderHpRemaining: defender.currentHp,
      defenderMaxHp: defender.maxHp,
      didDefenderFaint: didFaint,
      narrationLog: narration,
    };
  }
}
