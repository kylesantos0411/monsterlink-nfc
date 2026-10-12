# MONSTERLINK Combat System: Status Conditions & Tactical Modifiers

This document details the combat mechanics, status conditions, defensive buffs, protect shields, visual feedback, and test coverage implemented in **MONSTERLINK**.

---

## 1. Primary Status Conditions

| Status | Name | Effect | Recovery / Thaw |
| :--- | :--- | :--- | :--- |
| **`[PSN]`** | **Poison** | Deals **1/8 max HP** residual damage at the end of each turn. | Lasts until battle ends or faint. |
| **`[PAR]`** | **Paralysis / Electrocuted** | Cuts effective Speed by **50%**. Rolls a **25% chance** each turn to become fully immobilized ("can't move!"). | Permanent until battle ends. |
| **`[FRZ]`** | **Freeze** | Prevents all move execution while frozen solid ("frozen solid!"). | 25% thaw roll per turn, or immediately thawed when struck by a Fire move. |

---

## 2. Tactical Modifiers & Moves

### Defensive Hardening (`Shell Armor` / `Harden`)
- **Move:** `shell_armor` (Water / Aquat) & `harden` (Rock / Shelly / Rocky)
- **Effect:** Increases Defense by **+2 stages** (multiplier: `(2 + stages)/2 = 2.0x` defense).
- **VFX & SFX:** Gold/amber energy ring expansion with rising crest animation, arpeggio buff tone.
- **HUD Indicator:** `[DEF ▲+2]` badge in the unit status row.

### Protect & Shield Barriers (`Protect` / `Barrier`)
- **Move:** `protect` (Normal) & `barrier` (Psychic / Ice / Fairy)
- **Effect:** Erects a 1-turn protective barrier (`isShielded: true`).
- **Negation:** Completely negates **100% of the next incoming damage** (`damage = 0`, `"Blocked!"`). Shield consumes upon blocking.
- **VFX & SFX:** Hexagonal cyan/blue energy shield pop with sparkling block text, high crystal chime.
- **HUD Indicator:** `[🛡️ GUARD]` pulsing badge and shimmering energy sphere around the monster sprite.

---

## 3. Move Catalog Configuration

| Move ID | Name | Type | Power | Tactical Effect |
| :--- | :--- | :--- | :--- | :--- |
| `poison_sting` | Poison Sting | Poison | 40 | 35% chance to inflict Poison (`PSN`) |
| `sludge_wave` | Sludge Wave | Poison | 80 | 50% chance to inflict Poison (`PSN`) |
| `spore_blast` | Spore Blast | Grass | 55 | 40% chance to inflict Poison (`PSN`) |
| `spark_claw` | Spark Claw | Electric | 45 | 20% chance to inflict Paralysis (`PAR`) |
| `thunder_jolt` | Thunder Jolt | Electric | 65 | 30% chance to inflict Paralysis (`PAR`) |
| `wild_charge` | Wild Charge | Electric | 80 | 25% chance to inflict Paralysis (`PAR`) |
| `ice_shard` | Ice Shard | Ice | 40 | 15% chance to inflict Freeze (`FRZ`) |
| `frost_breath` | Frost Breath | Ice | 60 | 25% chance to inflict Freeze (`FRZ`) |
| `blizzard` | Blizzard | Ice | 85 | 35% chance to inflict Freeze (`FRZ`) |
| `shell_armor` | Shell Armor | Water | 0 | Boosts Defense by **+2 stages** |
| `harden` | Harden | Rock | 0 | Boosts Defense by **+2 stages** |
| `protect` | Protect | Normal | 0 | 100% block barrier against next hit |
| `barrier` | Barrier | Psychic | 0 | 100% block barrier against next hit |

---

## 4. Visual & Audio Feedback

1. **Retro HUD Badges (`.hud-status-row`):**
   - `[PSN]` Purple retro pill with amethyst shadow glow
   - `[PAR]` Yellow retro pill with electric pulse
   - `[FRZ]` Cyan retro pill with frost shimmer
   - `[🛡️ GUARD]` Pulsing deep blue shield pill
   - `[DEF ▲+2]` Emerald defense stage pill
2. **Sprite Platform Auras:**
   - **Poison:** Bubble pulsation with violet shadow tint (`.aura-poison`)
   - **Paralysis:** Crackling micro-twitch jitter (`.aura-paralysis`)
   - **Freeze:** Crystalline ice sheen with bright frost glint (`.aura-freeze`)
   - **Shielded:** Spherical glowing barrier orbiting the creature (`.aura-shielded`)
   - **Hardened:** Amber armor luster shine (`.aura-hardened`)
3. **Sound System Integration (`sound-controller.ts`):**
   - `playShield()`: Multi-tone crystal barrier chime
   - `playBuff()`: Upward triangular arpeggio
   - `playStatusInflicted()`: Ominous sawtooth status chime

---

## 5. Verification & Test Suite Summary

All test suites pass deterministically:
1. **`tests/domain.test.ts`**: Damage calculator, type matchups, battle records, and card registry (Passed).
2. **`tests/status-engine.test.ts`**: Stat stage multipliers, poison residual tick (1/8 max HP), paralysis speed penalty/skip, freeze thaw roll, defense buff scaling, and shield 100% negation (Passed).
3. **`tests/battle-engine-status.test.ts`**: BattleEngine end-to-end integration with Shell Armor defense buffs, Protect barrier blocks, and turn-end poison residual ticks (Passed).
4. **`tests/nfc-writer.test.ts`**: Full NTAG215 NFC write-verify cycle, payload parsing, and card registry resolution (Passed).
5. **`npm run build`**: Next.js 16 (Turbopack) production build passed cleanly in 1055ms.
