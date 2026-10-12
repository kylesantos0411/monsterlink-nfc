import { CreatureInstance, MoveDefinition, PrimaryStatusType } from '@/types/creature';
import { CombatActionStep, CombatantSide, TurnResult, CombatantModifierState } from '@/types/battle';
import { calculateDamage } from './damage-calculator';
import { getTypeMultiplier } from './type-chart';
import { MOVES_CATALOG, SPECIES_CATALOG } from '../data/catalog';
import { 
  getEffectiveSpeed, 
  checkParalysisImmobilized, 
  checkFreezeThaw, 
  calculatePoisonDamage 
} from './status-resolver';

export class BattleEngine {
  public player: CreatureInstance;
  public opponent: CreatureInstance;
  public playerModifiers: CombatantModifierState;
  public opponentModifiers: CombatantModifierState;
  public currentTurn: number;
  public isBattleOver: boolean;
  public winner: CombatantSide | null;
  public actionLog: CombatActionStep[];

  constructor(playerCreature: CreatureInstance, opponentCreature: CreatureInstance) {
    // Clone to keep match mutations isolated
    this.player = { ...playerCreature };
    this.opponent = { ...opponentCreature };
    this.playerModifiers = {
      defenseStages: 0,
      isShielded: false,
      statusCondition: playerCreature.statusCondition || 'none',
    };
    this.opponentModifiers = {
      defenseStages: 0,
      isShielded: false,
      statusCondition: opponentCreature.statusCondition || 'none',
    };
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
      // Prioritize defense buff if opponent is low on HP and has defense buff
      if (move.statusEffect?.defenseBoostStages && this.opponentModifiers.defenseStages < 2 && this.opponent.currentHp < this.opponent.maxHp * 0.6) {
        return move;
      }
      // Prioritize shield if opponent is very low on HP
      if (move.statusEffect?.isProtect && !this.opponentModifiers.isShielded && this.opponent.currentHp < this.opponent.maxHp * 0.35) {
        return move;
      }

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

    // Speed Priority: Factoring in paralysis penalty (50% speed cut)
    const playerSpeed = getEffectiveSpeed(this.player, this.playerModifiers.statusCondition);
    const oppSpeed = getEffectiveSpeed(this.opponent, this.opponentModifiers.statusCondition);
    const playerActsFirst = playerSpeed >= oppSpeed;

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

    // If defender fainted, combat immediately concludes
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

    // Step 3: End of Turn Residual Phase (Poison ticks)
    const residualLogs: string[] = [];
    if (!this.isBattleOver) {
      // Check Player Poison
      if (this.playerModifiers.statusCondition === 'poison' && this.player.currentHp > 0) {
        const psnDmg = calculatePoisonDamage(this.player.maxHp);
        this.player.currentHp = Math.max(0, this.player.currentHp - psnDmg);
        residualLogs.push(`${this.player.nickname} is hurt by poison! Took ${psnDmg} damage.`);
        if (this.player.currentHp <= 0) {
          this.isBattleOver = true;
          this.winner = 'opponent';
          residualLogs.push(`${this.player.nickname} fainted from poison!`);
        }
      }

      // Check Opponent Poison
      if (!this.isBattleOver && this.opponentModifiers.statusCondition === 'poison' && this.opponent.currentHp > 0) {
        const psnDmg = calculatePoisonDamage(this.opponent.maxHp);
        this.opponent.currentHp = Math.max(0, this.opponent.currentHp - psnDmg);
        residualLogs.push(`${this.opponent.nickname} is hurt by poison! Took ${psnDmg} damage.`);
        if (this.opponent.currentHp <= 0) {
          this.isBattleOver = true;
          this.winner = 'player';
          residualLogs.push(`${this.opponent.nickname} fainted from poison!`);
        }
      }
    }

    this.currentTurn += 1;

    return {
      turnNumber: this.currentTurn - 1,
      steps,
      isBattleOver: this.isBattleOver,
      winner: this.winner,
      endingMessage: this.isBattleOver 
        ? `${this.winner === 'player' ? this.player.nickname : this.opponent.nickname} won the battle!` 
        : `End of Turn ${this.currentTurn - 1}`,
      residualLogs,
    };
  }

  private resolveAction(
    actorSide: CombatantSide,
    attacker: CreatureInstance,
    defender: CreatureInstance,
    move: MoveDefinition
  ): CombatActionStep {
    const atkMods = actorSide === 'player' ? this.playerModifiers : this.opponentModifiers;
    const defMods = actorSide === 'player' ? this.opponentModifiers : this.playerModifiers;
    const defenderSpecies = SPECIES_CATALOG[defender.speciesId];

    // 1. Check Freeze Status
    if (atkMods.statusCondition === 'freeze') {
      if (checkFreezeThaw()) {
        atkMods.statusCondition = 'none';
        // Thawed out, continues move execution!
      } else {
        return {
          actor: actorSide,
          attackerName: attacker.nickname,
          defenderName: defender.nickname,
          moveUsed: move,
          damageDealt: 0,
          effectiveness: 'normal',
          defenderHpRemaining: defender.currentHp,
          defenderMaxHp: defender.maxHp,
          didDefenderFaint: false,
          wasImmobilized: true,
          narrationLog: `${attacker.nickname} is frozen solid and cannot move!`,
        };
      }
    }

    // 2. Check Paralysis Status
    if (atkMods.statusCondition === 'paralysis') {
      if (checkParalysisImmobilized()) {
        return {
          actor: actorSide,
          attackerName: attacker.nickname,
          defenderName: defender.nickname,
          moveUsed: move,
          damageDealt: 0,
          effectiveness: 'normal',
          defenderHpRemaining: defender.currentHp,
          defenderMaxHp: defender.maxHp,
          didDefenderFaint: false,
          wasImmobilized: true,
          narrationLog: `${attacker.nickname} is fully paralyzed! It can't move!`,
        };
      }
    }

    // 3. Check Protect / Barrier move
    if (move.statusEffect?.isProtect) {
      atkMods.isShielded = true;
      return {
        actor: actorSide,
        attackerName: attacker.nickname,
        defenderName: defender.nickname,
        moveUsed: move,
        damageDealt: 0,
        effectiveness: 'normal',
        defenderHpRemaining: defender.currentHp,
        defenderMaxHp: defender.maxHp,
        didDefenderFaint: false,
        narrationLog: `${attacker.nickname} used ${move.name}! It protected itself with a barrier!`,
      };
    }

    // 4. Check Stat Buff (Hardening / Shell Armor)
    if (move.statusEffect?.defenseBoostStages) {
      const boost = move.statusEffect.defenseBoostStages;
      atkMods.defenseStages = Math.min(6, atkMods.defenseStages + boost);
      const degree = boost >= 2 ? 'rose sharply!' : 'rose!';
      return {
        actor: actorSide,
        attackerName: attacker.nickname,
        defenderName: defender.nickname,
        moveUsed: move,
        damageDealt: 0,
        effectiveness: 'normal',
        defenderHpRemaining: defender.currentHp,
        defenderMaxHp: defender.maxHp,
        didDefenderFaint: false,
        statBoostApplied: `Defense +${boost}`,
        narrationLog: `${attacker.nickname} used ${move.name}! Its defense ${degree}`,
      };
    }

    // 5. Standard Attack Resolution
    const isBlocked = defMods.isShielded;
    if (isBlocked) {
      defMods.isShielded = false; // Shield absorbs 1 hit and breaks
    }

    const calc = calculateDamage(attacker, defender, defenderSpecies, move, {
      defenseStages: defMods.defenseStages,
      isShielded: isBlocked,
    });

    defender.currentHp = Math.max(0, defender.currentHp - calc.damage);
    const didFaint = defender.currentHp <= 0;

    let effText = '';
    if (isBlocked) {
      effText = ' The attack was completely BLOCKED!';
    } else {
      if (calc.effectiveness === 'super') effText = " It's super effective!";
      if (calc.effectiveness === 'weak') effText = " It's not very effective...";
    }

    // Status Infliction check
    let statusText = '';
    let statusInflicted: PrimaryStatusType | undefined = undefined;
    if (!didFaint && !isBlocked && defMods.statusCondition === 'none' && move.statusEffect?.status) {
      const roll = Math.random() * 100;
      if (roll <= (move.statusEffect.chance || 100)) {
        defMods.statusCondition = move.statusEffect.status;
        statusInflicted = move.statusEffect.status;
        if (move.statusEffect.status === 'poison') statusText = ` ${defender.nickname} was poisoned!`;
        if (move.statusEffect.status === 'paralysis') statusText = ` ${defender.nickname} is paralyzed!`;
        if (move.statusEffect.status === 'freeze') statusText = ` ${defender.nickname} was frozen solid!`;
      }
    }

    // Fire move thaws frozen defender
    if (!didFaint && !isBlocked && defMods.statusCondition === 'freeze' && move.type === 'Fire') {
      defMods.statusCondition = 'none';
      statusText += ` ${defender.nickname} thawed out from the flames!`;
    }

    const narration = `${attacker.nickname} used ${move.name}! Dealt ${calc.damage} damage.${effText}${statusText}${didFaint ? ` ${defender.nickname} fainted!` : ''}`;

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
      isBlocked,
      statusInflicted,
      narrationLog: narration,
    };
  }
}
