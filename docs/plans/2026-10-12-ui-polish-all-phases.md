# UI Polish & Professional Overhaul Plan (All 3 Phases)

**Goal:** Transform MONSTERLINK from a prototype into an authentic, studio-grade retro cyberdeck monster game with seamless navigation, tactile sound feedback, responsive native mobile support, bestiary sorting, collection management with custom nicknames, battle arena combat log, and data import/restore.

---

## Phase 1: Shell, Navigation Dock, Starter Showcase & Real Mobile Optimization
- [x] Task 1.1: Build persistent Cyberdeck Bottom Navigation Dock (`Home`, `Bestiary`, `Collection`, `Battle`, `NFC Lab`, `Settings`) with LED active indicators and sound triggers.
- [x] Task 1.2: Implement native mobile responsiveness in `globals.css` (full-bleed on `< 600px` without fake outer bezel or double scrollbars, utilizing safe-area insets).
- [x] Task 1.3: Create Interactive Starter Mascot Showcase on the Home screen (switching between Flamby, Aquat, Leafy, and Sparki with sound feedback).
- [x] Task 1.4: Purge all legacy leftover text ("152 LIST" -> "BESTIARY (50)", "Prototype v0.5" -> "CYBERDECK EDITION").

## Phase 2: Bestiary & Collection Craft
- [x] Task 2.1: Add Bestiary Sorting (`#Dex`, `Name`, `HP`, `Attack`, `Defense`, `Speed`) and holographic foil shaders for Rare and Legendary monsters.
- [x] Task 2.2: Enhance Monster Detail Modal with front/back sprite view switcher and full moves status tags (`[PSN]`, `[PAR]`, `[FRZ]`, `[SHIELD]`, `[DEF ▲]`).
- [x] Task 2.3: Upgrade Collection Card Binder with physical arcade tag aesthetic, star badge for "Active Battle Starter", and direct NFC write shortcut.
- [x] Task 2.4: Implement Creature Nickname editor modal with persistent storage saving.

## Phase 3: Battle Arena & Data Completion
- [x] Task 3.1: Add Turn Counter display and Quick In-Battle Audio Mute to the arena.
- [x] Task 3.2: Build expandable Combat Log drawer to review previous turns and residual ticks.
- [x] Task 3.3: Implement JSON Backup Import / File Upload in Settings with schema validation.
- [x] Task 3.4: Run all test suites (`npm test`, `npx tsx tests/status-engine.test.ts`, `npx tsx tests/battle-engine-status.test.ts`, `npx tsx tests/nfc-writer.test.ts`) and `npm run build`.
- [x] Task 3.5: Git commit and push to `origin main`.
