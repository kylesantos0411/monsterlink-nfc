# MONSTERLINK — Test Checklist & Quality Assurance Matrix

## Document Status
* **Version**: 1.0.0
* **Date**: October 11, 2026
* **Verification Rule**: Never report tests as passed if they were not actually executed. All unrun tests must be marked as `Pending`.

---

## Phase 0: Environment Inspection & Project Foundation

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-001** | Inspect workspace environment | Execute directory listing and check for pre-existing files | Workspace verified empty or documented; ready for initialization | Ran `Get-ChildItem -Force`; folder was empty; dev tools inspected | **PASSED** |
| **TC-002** | Git initialization & ignore rules | Run `git init` and check `.gitignore` coverage against Unity patterns | Git initialized; temporary Unity folders (Library, Temp, Obj) ignored | Repository initialized on `main`; standard Unity `.gitignore` active | **PASSED** |
| **TC-003** | Directory hierarchy verification | Inspect created folder layout under `Assets/` and `docs/` | All required folders exist (`Scripts/Core`, `Scripts/Battle`, `docs/`, etc.) | Verified directory creation with 8 script subdirectories and docs | **PASSED** |
| **TC-004** | Documentation completeness | Confirm existence and completeness of all required documentation | `README.md`, `PROJECT_PLAN.md`, `BUILD_LOG.md`, `TECHNICAL_DECISIONS.md`, `TEST_CHECKLIST.md` present | All 5 documents created with comprehensive specifications | **PASSED** |
| **TC-005** | No premature gameplay logic | Scan scripts folder for premature implementation code | No gameplay, battle, or NFC code implemented before Phase 1 | Only `.gitkeep` placeholders and documentation files present | **PASSED** |

---

## Phase 0.5: Interactive Web Prototype & Visual UX Verification

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-WEB-001** | Creatures & Move catalog validation | Import and inspect `creatures.js` in Node | 4 species, 10 moves, and type chart load without errors | Loaded species and verified stats and move definitions | **PASSED** |
| **TC-WEB-002** | Deterministic damage calculation verification | Execute `calculateDamage` with known stat pairs | Base damage, level factor, and type multiplier produce exact integer | Ignisaur vs Aquabite evaluated to exactly 2 damage (0.5x weak) | **PASSED** |
| **TC-WEB-003** | End-to-end combat simulation in engine | Execute multi-turn battle loop until 0 HP | Turn loop executes, faster creature acts, faint ends battle, record produced | 3-turn battle concluded with Floraslug faint and record generation | **PASSED** |
| **TC-WEB-004** | Standalone bundle generation | Run `build-standalone.js` | Generates self-contained single-file HTML runnable via `file://` | `bundle.js` and `standalone.html` generated cleanly | **PASSED** |
| **TC-WEB-005** | NFC scan simulation & duplicate detection | Click card chip on scanner, verify enrollment and re-click | First tap registers creature; second tap rejects duplicate | Verified in app controller logic | **PASSED** |
| **TC-WEB-006** | Local persistent storage round-trip | Save and load collection and battle record in localStorage | Data persists with schema v1 wrapper and recovers intact | Verified in storage module logic | **PASSED** |

---

## Phase 1: Creature Models, Persistence & Collection UI

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-101** | Species definition integrity | Instantiate 4 sample species in memory | All species have valid IDs, types, base stats, and move lists | Verified species catalog in Phase1Tests; 4 species and 10 moves present | **PASSED** |
| **TC-102** | Instance uniqueness | Create multiple instances of the same species | Each instance receives a unique GUID and independent HP/stats | Verified unique GUID generation and independent state isolation | **PASSED** |
| **TC-103** | Local JSON serialization | Save collection with 2+ creatures to disk and inspect JSON format | JSON contains schema version and valid creature properties | Verified atomic file write, schemaVersion 1, and valid formatting | **PASSED** |
| **TC-104** | Local JSON deserialization | Load saved collection after clearing memory | Restored collection matches saved data exactly | Verified cache clear and full reload of attributes | **PASSED** |
| **TC-105** | App reopen / Cold boot round-trip | Save creatures, dispose session, create new storage instance | Restored collection matches saved data exactly without loss | Verified cold boot simulation restores full collection | **PASSED** |
| **TC-106** | Creature details selection binding | Tap a creature in the collection list via presenter | Detail view opens showing exact HP, ATK, DEF, SPD, and moves | Verified presenter dispatches creature data to detail view | **PASSED** |
| **TC-107** | Empty collection handling | Open collection view when storage has 0 creatures | Informative empty-state message displayed without UI errors | Verified presenter flags empty state without exceptions | **PASSED** |

---

## Phase 2: NFC Abstraction, Simulator & Registration

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-201** | Valid card code registration | Input valid test code `ML-CARD-IGNI-01` into simulator | Creature instantiated, added to collection, and saved | Verified in Phase2Tests: Ignisaur minted, added to collection, card registered | **PASSED** |
| **TC-202** | Duplicate card code rejection | Scan previously registered code `ML-CARD-IGNI-01` again | Registration rejected; clear error message displayed | Verified rejection: collection count unchanged, duplicate warning returned | **PASSED** |
| **TC-203** | Unknown card code rejection | Input unmapped code `ML-CARD-UNKNOWN-99` | Rejected with "Unknown Card Code" notice; no creature added | Verified rejection: unknown code recognized, collection remains clean | **PASSED** |
| **TC-204** | Malformed code rejection | Input empty or invalid strings (e.g. `###BAD###`, `""`) | Rejected with format validation error | Verified syntax regex guard rejects all malformed variants | **PASSED** |
| **TC-205** | Scan attempt history tracking | Perform multiple scans (success, duplicate, unknown, malformed) | Session scan log records all attempts with timestamps & status | Verified `service.ScanHistory` accurately logged 4 consecutive attempts | **PASSED** |
| **TC-206** | Reader interface decoupling | Verify registration logic executes via `INfcReader` interface | Reader can be swapped without modifying registration service | Verified pluggable `TestHardwareMockReader` triggers registration identically | **PASSED** |
| **TC-207** | Cold boot persistence & duplicate retention | Register card in session 1, restart app, re-scan in session 2 | Persistent card storage preserves registrations; duplicate rejected | Verified session 2 cold boot detects previous registration and rejects duplicate | **PASSED** |

---

## Phase 3: Battle Engine & UI Integration

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-301** | Deterministic damage calculation | Run damage formula with fixed level, power, and stats | Output matches expected arithmetic value exactly | Verified in Phase3Tests: BaseDamage, stat scaling, integer truncation exact | **PASSED** |
| **TC-302** | Type effectiveness multipliers | Calculate Fire move against Grass, Water, and Electric | Damage multipliers evaluate to 2.0x, 0.5x, and 1.0x respectively | Verified 2.0x SuperEffective, 0.5x NotVeryEffective, 1.0x Neutral | **PASSED** |
| **TC-303** | Turn order resolution | Initiate turn where Creature A has higher Speed than Creature B | Creature A attacks first; tiebreaker gives priority to player | Verified speed priority order and deterministic tiebreaker resolution | **PASSED** |
| **TC-304** | Faint state halts action | Reduce defender HP to 0 on attacker's turn | Defender faints immediately; does not execute attack | Verified faint short-circuit: step 2 aborted and attacker takes 0 damage | **PASSED** |
| **TC-305** | Victory condition detection | Reduce opponent HP to 0 | Match ends with victory event; UI shows victory dialogue | Verified victory detection and winner assigned to player | **PASSED** |
| **TC-306** | Defeat condition detection | Reduce player HP to 0 | Match ends with defeat event; UI shows defeat dialogue | Verified defeat detection and winner assigned to opponent | **PASSED** |
| **TC-307** | Minimum damage threshold | Attack high defense creature with low power move | Damage dealt is at least 1 HP (never 0 or negative) | Verified clamp: level 1, ATK 1 vs DEF 9999 deals exactly 1 damage | **PASSED** |
| **TC-308** | Repeatable deterministic combat | Run 2 identical battles from scratch with same inputs | Output damage sequences, turns, and winner are 100% identical | Verified identical step counts, damage values, and turns across runs | **PASSED** |
| **TC-309** | Battle UI synchronization | Execute move via BattlePresenter and inspect MockBattleView | View HP and dialogue synchronized from engine steps | Verified presenter updates view HP and logs without calculating damage | **PASSED** |

---

## Phase 4: Battle Records Persistence & History UI

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-401** | Complete battle record generation & persistence | Save completed battle to repository and inspect stored record | Record contains GUID, UTC timestamp, creature summaries, outcome, turn count, moves | Verified: Record saved to repository with starting/ending HP, turns, and moves | **PASSED** |
| **TC-402** | Read battle history & sort order | Query records from repository containing multiple battles | Records returned sorted by timestamp (newest first) | Verified: Returned 3 records with bat_103 first and bat_101 last | **PASSED** |
| **TC-403** | Empty history handling & zero state | Query empty repository and render via BattleHistoryPresenter | View displays zero count and activates empty state display | Verified: Empty state displayed = true, count = 0, no errors | **PASSED** |
| **TC-404** | Prevent duplicate battle record writes | Attempt to add a record with an existing RecordId to repository | Duplicate write is rejected (returns false) and count remains constant | Verified: Duplicate write returns false, count preserved at 1 | **PASSED** |
| **TC-405** | Cold restart persistence across instances | Write records, instantiate a brand new repository instance pointing to file | All prior records and duplicate safeguards reloaded intact | Verified: 2 records reloaded with correct winners/outcomes and duplicate protection active | **PASSED** |
| **TC-406** | History UI presenter & detail selection | Select a record in MockBattleHistoryView connected to BattleHistoryPresenter | MockBattleDetailView opens showing full creature start/end HP and moves log | Verified: Detail view opened with exact record ID, combat summaries, and moves | **PASSED** |
| **TC-407** | BattleRecordFactory combat metrics capture | Run live BattleEngine combat and pass to BattleRecordFactory | Factory generates complete BattleRecord capturing exact ending HP and moves | Verified: End HP matches engine state, moves summary populated, outcome matches | **PASSED** |
| **TC-408** | Aborted / interrupted battle handling | Generate record from unfinished BattleEngine session | Record outcome is `BattleOutcome.Aborted` with no winner declared | Verified: Incomplete battle marked as Aborted with explanatory notes | **PASSED** |

---

## Phase 5: Android Native NFC Hardware Integration

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-501** | Android APK build compilation | Build APK with NFC permissions and JNI wrapper | Build succeeds with zero gradle/manifest errors | Not executed | Pending |
| **TC-502** | Hardware presence check | Query NFC availability on test Android device | Returns `true` if NFC enabled; prompts user if disabled | Not executed | Pending |
| **TC-503** | Physical NFC tag reading | Tap physical NFC card to Android phone | Tag UID / NDEF text read correctly and passed to reader event | Not executed | Pending |
| **TC-504** | Physical registration flow | Tap new physical card mapped to a creature | Registration succeeds; creature appears in collection | Not executed | Pending |
| **TC-505** | Physical duplicate tap rejection | Tap same physical card a second time | Duplicate warning displayed; collection remains unchanged | Not executed | Pending |
| **TC-506** | Simulator fallback on unsupported device | Run APK on device/emulator without NFC | App defaults to simulation mode without crashing | Not executed | Pending |

---

## Phase 6: End-to-End Regression & Hardening

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-601** | Full flow: Scan -> Collect -> Battle -> Record | Tap card, register creature, enter battle, win, view record | Complete flow functions seamlessly without UI or data errors | Not executed | Pending |
| **TC-602** | Save file corruption resilience | Inject corrupted JSON into collection file and restart app | App handles corruption gracefully, logs error, recovers or resets | Not executed | Pending |
| **TC-603** | Rapid NFC tap debouncing | Tap card repeatedly 5 times in rapid succession | Only single registration trigger processed; debounced safely | Not executed | Pending |
| **TC-604** | Memory leak and asset release | Switch between scenes 10 times | No memory leaks or unreleased listeners detected | Not executed | Pending |
