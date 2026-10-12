# Status Effects & Tactical Battle Modifiers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement authentic Pokémon-style status conditions (Poison, Freeze, Paralysis/Electrocuted) and combat modifiers (Hardening / Defense Buffs, Blocked / Protect Shields) with turn-based combat resolution, visual HUD badges, dialogue narration, and sprite aura effects.

**Architecture:** Extend the battle domain with status and modifier schemas (`src/types/battle.ts` and `src/types/creature.ts`), enhance `damage-calculator.ts` and `battle-engine.ts` with pre-action status checks, block mechanics, and end-of-turn residual ticks, configure moves in `catalog.ts`, and render status badges and visual effects in the Next.js UI (`page.tsx`, `globals.css`).

**Tech Stack:** TypeScript, Next.js, Web Audio API, Turbopack, TSX test runner.

---

### Task 1: Type Definitions for Status Conditions & Battle Modifiers

**Files:**
- Modify: `src/types/creature.ts`
- Modify: `src/types/battle.ts`

**Step 1: Write status & modifier types**
- Define `PrimaryStatusType`: `'none' | 'poison' | 'paralysis' | 'freeze' | 'burn'`
- Define `CombatModifier`:
  - `defenseStages`: number (-6 to +6)
  - `isShielded`: boolean (for Block / Protect 1-turn immunity)
- Define `MoveStatusEffect`:
  - `status?: PrimaryStatusType`
  - `chance?: number` (0 to 100%)
  - `defenseBoostStages?: number` (e.g. +1 or +2 for Harden / Shell Armor)
  - `isProtect?: boolean` (grants 1-turn Shielded)

**Step 2: Commit**
```bash
git add src/types/creature.ts src/types/battle.ts
git commit -m "feat: add types for status conditions, defense buffs, and shield modifiers"
```

---

### Task 2: Status Engine & Damage Calculator Updates

**Files:**
- Create: `src/lib/battle/status-resolver.ts`
- Modify: `src/lib/battle/damage-calculator.ts`
- Test: `tests/status-engine.test.ts`

**Step 1: Write unit tests for status logic & damage modifiers**
- Test 1: Poison deals 1/8 max HP damage at end of turn.
- Test 2: Paralysis cuts speed by 50% and rolls 25% chance to skip turn.
- Test 3: Freeze blocks movement until thawed (25% thaw roll per turn).
- Test 4: Hardening (+2 defense stages) reduces incoming physical damage.
- Test 5: Shield / Block completely reduces damage to 0 and clears after use.

**Step 2: Run test to verify failure**
Run: `npx tsx tests/status-engine.test.ts`
Expected: FAIL (modules not created)

**Step 3: Implement status resolver and update damage calculator**
- Write `status-resolver.ts` with pure deterministic / seeded functions.
- Update `calculateDamage` to apply defense stage multipliers (e.g. stage +1 = x1.5 defense, stage +2 = x2.0 defense).

**Step 4: Run test to verify pass**
Run: `npx tsx tests/status-engine.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/battle/status-resolver.ts src/lib/battle/damage-calculator.ts tests/status-engine.test.ts
git commit -m "feat: implement status resolver and defense buff damage calculations"
```

---

### Task 3: Battle Engine Turn Flow Integration

**Files:**
- Modify: `src/lib/battle/battle-engine.ts`
- Test: `tests/domain.test.ts`

**Step 1: Update BattleEngine turn pipeline**
- **Phase A (Pre-Action)**:
  - Check speed factoring in Paralysis (`paralysis ? speed * 0.5 : speed`).
  - Check if immobilized by Freeze or full Paralysis. If immobilized, log message and skip move.
- **Phase B (Action Resolution)**:
  - If defender `isShielded`, damage = 0, log `"[Defender] blocked the attack!"`, reset `isShielded = false`.
  - If move is `Protect / Barrier`, set attacker `isShielded = true`, log `"[Attacker] put up a protective barrier!"`.
  - If move is `Harden / Shell Armor`, increase attacker `defenseStages`, log `"[Attacker]'s defense rose sharply!"`.
  - If move inflicts status and defender has no status, roll chance and apply.
- **Phase C (End of Turn)**:
  - Apply residual Poison damage to poisoned combatants.
  - Check if residual damage caused a faint.

**Step 2: Run domain and status tests**
Run: `npm test`
Expected: PASS

**Step 3: Commit**
```bash
git add src/lib/battle/battle-engine.ts
git commit -m "feat: integrate status conditions, block shields, and buffs into BattleEngine"
```

---

### Task 4: Move Catalog Configuration with Status Effects

**Files:**
- Modify: `src/lib/data/catalog.ts`

**Step 1: Add status and tactical effects to moves**
- **Poison moves**:
  - `poison_sting`: 30% chance to poison
  - `sludge_wave`: 50% chance to poison
- **Electric moves**:
  - `thunder_jolt`: 25% chance to paralyze
  - `spark_claw`: 20% chance to paralyze
- **Ice moves**:
  - `ice_shard`: 15% chance to freeze
  - `blizzard`: 30% chance to freeze
  - `frost_breath`: 20% chance to freeze
- **Defense / Hardening moves**:
  - `shell_armor` (Aquat / Shelly): Raises Defense by +2 stages ("Hardens its shell!").
  - `iron_head` (Steel): Chance to boost defense.
- **Block / Protect moves**:
  - Add `protect` / `barrier`: Protects user from attacks for 1 turn.

**Step 2: Commit**
```bash
git add src/lib/data/catalog.ts
git commit -m "feat: configure status chances, harden buffs, and protect shields in move catalog"
```

---

### Task 5: Battle UI, Status Badges & Visual Aura Overlays

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `src/lib/battle/skill-vfx.tsx`

**Step 1: CSS Badges & Sprite Auras**
- Badges on creature HUD next to HP bar:
  - `[PSN]` (Purple retro pill)
  - `[PAR]` (Yellow retro pill with electric pulse)
  - `[FRZ]` (Cyan retro pill with frost shimmer)
  - `[DEF ▲]` (Blue shield badge showing defense boost)
- Visual Overlays on monster platform:
  - **Poisoned**: Subtle purple pulsing bubbles/tint.
  - **Paralyzed**: Crackling yellow spark bursts when immobilized.
  - **Frozen**: Translucent cyan ice crystal cube overlay.
  - **Hardened / Defense Buff**: Metallic blue/gold shine ping animation.
  - **Blocked**: Glowing barrier hexagon shield animation absorbing 0 damage.

**Step 2: UI Wiring in `page.tsx`**
- Show status pill next to creature nickname & level in `hud-top`.
- Display shield icon when defense buff or protect barrier is active.
- Show clear narration messages in dialogue box.

**Step 3: Verification & Build**
Run: `npm run build`
Expected: PASS

**Step 4: Commit & Push**
```bash
git add src/app/globals.css src/app/page.tsx src/lib/battle/skill-vfx.tsx
git commit -m "feat: add status effect HUD badges, barrier animations, and dialogue logs"
git push origin main
```
