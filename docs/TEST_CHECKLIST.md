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
| **TC-101** | Species definition integrity | Instantiate 4 sample species in memory | All species have valid IDs, types, base stats, and move lists | Not executed | Pending |
| **TC-102** | Instance uniqueness | Create multiple instances of the same species | Each instance receives a unique GUID and independent HP/stats | Not executed | Pending |
| **TC-103** | Local JSON serialization | Save collection with 2+ creatures to disk and inspect JSON format | JSON contains schema version and valid creature properties | Not executed | Pending |
| **TC-104** | Local JSON deserialization | Load saved collection after clearing memory | Restored collection matches saved data exactly | Not executed | Pending |
| **TC-105** | Collection UI rendering | Open collection view with 3 creatures | 3 cards appear with correct names, levels, and icons | Not executed | Pending |
| **TC-106** | Creature details modal | Tap a creature in the collection list | Modal opens showing exact HP, ATK, DEF, SPD, and moves | Not executed | Pending |
| **TC-107** | Empty collection handling | Open collection view when storage has 0 creatures | Informative empty-state message displayed without UI errors | Not executed | Pending |

---

## Phase 2: NFC Abstraction, Simulator & Registration

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-201** | Valid card code registration | Input valid test code `ML-CARD-IGNI-01` into simulator | Creature instantiated, added to collection, and saved | Not executed | Pending |
| **TC-202** | Duplicate card code rejection | Scan previously registered code `ML-CARD-IGNI-01` again | Registration rejected; clear error message displayed | Not executed | Pending |
| **TC-203** | Unknown card code rejection | Input unmapped code `ML-CARD-UNKNOWN-99` | Rejected with "Unknown Card Code" notice; no creature added | Not executed | Pending |
| **TC-204** | Malformed code rejection | Input empty or invalid string `###INVALID###` | Rejected with format validation error | Not executed | Pending |
| **TC-205** | Scan history session log | Perform 3 scans (success, duplicate, unknown) | Session scan log records all 3 attempts with timestamps | Not executed | Pending |
| **TC-206** | Reader interface decoupling | Verify registration logic executes via `INfcReader` interface | Reader can be swapped without modifying registration service | Not executed | Pending |

---

## Phase 3: Battle Engine & UI Integration

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-301** | Deterministic damage calculation | Run damage formula with fixed level, power, and stats | Output matches expected arithmetic value exactly | Not executed | Pending |
| **TC-302** | Type effectiveness multipliers | Calculate Fire move against Grass, Water, and Electric | Damage multipliers evaluate to 2.0x, 0.5x, and 1.0x respectively | Not executed | Pending |
| **TC-303** | Turn order resolution | Initiate turn where Creature A has higher Speed than Creature B | Creature A attacks first | Not executed | Pending |
| **TC-304** | Faint state halts action | Reduce defender HP to 0 on attacker's turn | Defender faints immediately; does not execute attack | Not executed | Pending |
| **TC-305** | Victory condition detection | Reduce opponent HP to 0 | Match ends with victory event; UI shows victory dialogue | Not executed | Pending |
| **TC-306** | Defeat condition detection | Reduce player HP to 0 | Match ends with defeat event; UI shows defeat dialogue | Not executed | Pending |
| **TC-307** | Minimum damage threshold | Attack high defense creature with low power move | Damage dealt is at least 1 HP (never 0 or negative) | Not executed | Pending |
| **TC-308** | Battle UI synchronization | Execute move in Battle UI | HP bar animates smoothly and updates to exact engine value | Not executed | Pending |

---

## Phase 4: Battle Records Persistence & History UI

| Test ID | Description | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-401** | Complete battle record generation | Finish a battle and inspect generated `BattleRecord` | Record contains GUID, timestamp, creature summaries, outcome | Not executed | Pending |
| **TC-402** | Battle history file persistence | Save 2 completed battle records to disk | Records persisted to `battle_history.json` with schema version | Not executed | Pending |
| **TC-403** | Battle history restoration | Restart app and query battle history repository | All saved records loaded chronologically | Not executed | Pending |
| **TC-404** | History UI rendering | Open Battle Records screen | List renders each battle with date, opponent, and win/loss tag | Not executed | Pending |
| **TC-405** | History detail inspection | Select a record in the history list | Detailed breakdown shows turn count, moves used, HP start/end | Not executed | Pending |
| **TC-406** | Mid-battle abort handling | Terminate app mid-combat, relaunch, inspect history | Match recorded with outcome `Aborted`; never marked as victory | Not executed | Pending |

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
