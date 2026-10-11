# MONSTERLINK — Project Implementation Plan

## Document Status
* **Version**: 1.0.0
* **Date**: October 11, 2026
* **Current Phase**: Phase 0 Complete (Awaiting Phase 1 Approval)

---

## 1. Project Management Principles

1. **Incremental Progression**: Development occurs strictly one phase at a time. No code from a future phase will be implemented ahead of schedule.
2. **Quality Gates**: Each phase requires explicit validation against its predefined acceptance criteria in `docs/TEST_CHECKLIST.md` before transitioning to the next phase.
3. **Decoupled Architecture**: Domain logic (creature stats, battle rules, damage formulas, persistence models) must remain decoupled from Unity presentation code (`MonoBehaviour`, UI widgets) to enable automated testing and fast iteration.
4. **Honest Verification**: Tests are only reported as passed when executed and verified with logged results. Unexecuted checks remain marked as `Pending`.

---

## 2. Phase-by-Phase Roadmap & Acceptance Gates

### Phase 0: Environment Inspection, Architecture & Baseline Documentation
* **Goal**: Establish the repository, directory layout, core documentation, architecture definitions, and testing standards without touching gameplay logic.
* **Prerequisites**: Access to the project root directory.
* **Deliverables**:
  - Initialized Git repository with comprehensive Unity-tailored `.gitignore`.
  - Structured directory hierarchy (`Assets/Scripts/...`, `Assets/Scenes`, `Assets/Prefabs`, `docs/...`).
  - Core project documentation suite:
    - `README.md`
    - `docs/PROJECT_PLAN.md`
    - `docs/BUILD_LOG.md`
    - `docs/TECHNICAL_DECISIONS.md`
    - `docs/TEST_CHECKLIST.md`
* **Acceptance Criteria**:
  - [x] Workspace inspected and verified empty/ready.
  - [x] Git initialized with clean status and tracking.
  - [x] Directory hierarchy matches the proposed architecture.
  - [x] All 5 required documentation files created and populated.
  - [x] No premature gameplay or engine logic created.

---

### Phase 1: Creature Models, Sample Roster, Persistence & Collection UI
* **Goal**: Implement the creature domain model, static species definitions, 4 original sample creatures, local JSON persistence, and the collection browsing user interface.
* **Prerequisites**: Phase 0 approved.
* **Status**: **COMPLETED & VERIFIED**
* **Deliverables**:
  - `CreatureSpecies`: Immutable definition (Species ID, Name, Element/Type, Base HP, Attack, Defense, Speed, Sprite Reference, Learnable Moves).
  - `CreatureInstance`: Individual creature entity (Instance GUID, Species ID, Nickname, Level, Current HP, Max HP, Attack, Defense, Speed, Known Moves, Assigned NFC Tag Code, Acquisition Timestamp).
  - `MoveDefinition`: Move entity (Move ID, Name, Element, Power, Accuracy, Description).
  - 4 Original Sample Species:
    1. *Ignisaur* (Fire / Ember Reptile)
    2. *Aquabite* (Water / Coral Crab)
    3. *Floraslug* (Grass / Spore Slug)
    4. *Voltkit* (Electric / Spark Rodent)
  - `ICollectionRepository` & `JsonCollectionStorage`: Local persistent storage saving/loading creature collections with atomic write safety and schema versioning.
  - `ICollectionView`, `ICreatureDetailView`, `CollectionPresenter`, and `CollectionScreenUI`.
  - Automated test suite `Phase1Tests.cs` and batch runner `run-phase1-tests.bat`.
* **Acceptance Criteria**:
  - [x] Species definitions remain strictly separated from creature instances.
  - [x] Multiple instances of the same species maintain unique instance IDs.
  - [x] Saving and reopening the application restores 100% of the collection with zero data corruption.
  - [x] Selecting any creature in the UI reliably displays accurate stats and moves.
  - [x] UI handles empty collection gracefully with an informative message.

---

### Phase 2: NFC Abstraction, Simulated Scanning & Card Registration
* **Goal**: Build the hardware-abstracted NFC scanning workflow, tag code validation, simulated scanning UI for development, and duplicate registration prevention.
* **Prerequisites**: Phase 1 approved and validated.
* **Status**: **COMPLETED & VERIFIED**
* **Deliverables**:
  - `INfcReader` interface defining standard scan events and payload retrieval:
    - `event Action<string> OnCardScanned;`
    - `void StartListening(); void StopListening();`
  - `SimulatedNfcReader`: Keyboard/UI-driven mock reader allowing input of test card strings (e.g., `ML-CARD-IGNI-01`, `ML-CARD-AQUA-02`, etc.).
  - `CardRegistry` & `CardRegistryEntry`: Mapping physical test card codes to creature species templates.
  - `IRegisteredCardRepository` & `JsonRegisteredCardStorage`: Persistent local storage saving enrolled cards and preventing duplicate registration across reboots.
  - `NfcRegistrationService`:
    - Validates card code format and syntax.
    - Queries prototype card registry mapping card codes to creature species.
    - Checks collection for existing registered card codes.
    - Prevents duplicate registration of the same physical tag.
    - Dispatches registration results (Success, Duplicate, Unknown Code, Invalid Format).
  - `INfcScanView`, `NfcScanPresenter`, `MockNfcScanView`, and `NfcScanScreenUI`.
  - Automated test suite `Phase2Tests.cs` and batch runner `run-phase2-tests.bat`.
* **Acceptance Criteria**:
  - [x] Scanning a valid, unregistered card code adds the corresponding creature instance to the collection.
  - [x] Scanning an already registered card code is rejected with a clear duplicate warning.
  - [x] Scanning an unrecognized or malformed code produces a specific, friendly error.
  - [x] Every scan attempt is logged with timestamp, code, and outcome.
  - [x] The registration pipeline has no direct coupling to hardware, functioning identically under simulated inputs.

---

### Phase 3: Pure Battle Engine, Deterministic Calculations & Battle UI
* **Goal**: Construct the turn-based creature battle engine with deterministic combat rules, decoupled from Unity UI, followed by a responsive mobile battle interface.
* **Prerequisites**: Phase 2 approved and validated.
* **Status**: **COMPLETED & VERIFIED**
* **Deliverables**:
  - `BattleEngine`: Pure C# state machine managing turns, creature clones, action queues, faint handling, and win/loss detection.
  - `BattleDamageCalculator`: Documented deterministic formula:
    $$\text{Damage} = \max\left(1, \left\lfloor \left( \left\lfloor \frac{2 \times \text{Level}}{5} + 2 \right\rfloor \times \frac{\text{Move Power} \times \text{Attacker ATK}}{\text{Defender DEF} \times 50} + 2 \right) \times \text{TypeModifier} \right\rfloor\right)$$
  - `TypeChart`: Type effectiveness matrix (Fire > Grass > Water > Fire, Electric > Water, etc.).
  - `DamageCalculationResult` & `CombatActionStep`: Value objects reporting granular round events.
  - `TurnResult`: Structured round outcome reporting action steps and victory condition.
  - Opponent AI: Deterministic decision-making selecting moves based on highest damage / type advantage score.
  - `IBattleView`, `BattlePresenter`, `MockBattleView`, and `BattleScreenUI`.
  - Automated test suite `Phase3Tests.cs` and batch runner `run-phase3-tests.bat`.
* **Acceptance Criteria**:
  - [x] Battle calculations produce exact, reproducible values based strictly on stats and type matchups.
  - [x] Damage is calculated and applied by the engine; UI only renders engine state updates.
  - [x] Fainted creatures cannot take actions.
  - [x] Battle detects win/loss conditions immediately when either creature hits 0 HP.
  - [x] Battle can be aborted gracefully without corrupting persistent state.

---

### Phase 4: Battle Records, History Persistence & Records Viewer UI
* **Goal**: Persist complete match records and provide a historical battle browser with match breakdown views.
* **Prerequisites**: Phase 3 approved and validated.
* **Status**: **COMPLETED & VERIFIED**
* **Deliverables**:
  - `BattleRecord` data model:
    - `RecordId` (GUID)
    - `Timestamp` (ISO 8601 UTC)
    - `PlayerCreatureSummary` (Instance ID, Species Name, Level, Starting HP, Ending HP)
    - `OpponentCreatureSummary` (Species Name, Level, Starting HP, Ending HP)
    - `TurnCount`
    - `ActionLogSummary` (List of moves used and damage dealt)
    - `Outcome` (`Victory`, `Defeat`, `Aborted`)
  - `BattleHistoryRepository`: Handles append-only persistence of completed battle logs to JSON with duplicate prevention.
  - Incomplete Battle Handler: Matches interrupted by app closure are marked as `Aborted` (never logged as victories).
  - Battle Records UI Scene:
    - Chronological list view of previous matches with summary tags (Win/Loss, Date, Opponent).
    - Detail view displaying granular breakdown of selected battle.
    - Clear History option with confirmation dialog.
  - Automated test suite `Phase4Tests.cs`, runner `run-phase4-tests.bat`, and PowerShell script `run-phase4-tests.ps1`.
* **Acceptance Criteria**:
  - [x] Completed battles automatically generate and store a complete `BattleRecord`.
  - [x] Aborted/interrupted battles are documented appropriately and never recorded as wins.
  - [x] Battle records persist across application restarts with duplicate write protection.
  - [x] History UI displays all saved matches and accurately reflects combat stats.

---

### Phase 5: Native Android NFC Integration & Physical Hardware Testing
* **Goal**: Implement the native Android NFC bridge, configure Android build settings, and test with physical NFC tags.
* **Prerequisites**: Phase 4 approved and validated. Access to an Android test device with NFC.
* **Deliverables**:
  - `AndroidNfcReader`: C# wrapper utilizing Android JNI (`AndroidJavaClass`, `AndroidJavaObject`, `NfcAdapter`) to read NFC UIDs and NDEF records.
  - `AndroidManifest.xml` with:
    - `<uses-permission android:name="android.permission.NFC" />`
    - `<uses-feature android:name="android.hardware.nfc" android:required="false" />`
    - Intent filters for `android.nfc.action.TECH_DISCOVERED` and `NDEF_DISCOVERED`.
  - Runtime NFC status detection (Hardware Present, NFC Disabled, NFC Ready).
  - Unified `NfcManager` switching between Android hardware reader and fallback simulator depending on build target or settings toggle.
* **Acceptance Criteria**:
  - [ ] App builds to Android APK without manifest or gradle compilation errors.
  - [ ] Physical NFC card tap on phone triggers `OnCardScanned` with correct tag UID/payload.
  - [ ] Tapped card flows through the exact same `NfcRegistrationService` validated in Phase 2.
  - [ ] Devices without NFC hardware fallback cleanly to simulation mode without crashing.

---

### Phase 6: Regression Testing, Hardening & Prototype Final Documentation
* **Goal**: Conduct a full end-to-end regression pass, verify data schema migration safety, harden error handling, and document known limitations.
* **Prerequisites**: Phase 5 completed or verified on target device.
* **Deliverables**:
  - Comprehensive end-to-end regression run across all test cases.
  - Edge case hardening (corrupted save file recovery, invalid inputs, rapid tap debounce).
  - Finalized `docs/TECHNICAL_DECISIONS.md` documenting security boundaries, hardware compatibility, and production evolution paths.
  - Final project summary report.
* **Acceptance Criteria**:
  - [ ] All test cases in `docs/TEST_CHECKLIST.md` are executed and passing.
  - [ ] No unhandled exceptions or game crashes under error conditions.
  - [ ] Complete traceability between requirements, code, and documentation.

---

## 3. Milestone Tracking Matrix

| Milestone | Target Phase | Status | Exit Condition |
|---|---|---|---|
| **M0: Project Setup & Docs** | Phase 0 | **PASSED** | Clean repo, structured directories, approved plan |
| **M1: Collection & Data Core** | Phase 1 | **PASSED** | 4 sample creatures visible, persistent save/load functional |
| **M2: Simulated NFC System** | Phase 2 | **PASSED** | Card codes scanned, duplicate check prevents double-register |
| **M3: Combat Engine & UI** | Phase 3 | **PASSED** | Deterministic battles, victory/defeat detected and rendered |
| **M4: Battle History** | Phase 4 | **PASSED** | Records saved, history viewer renders past battles, duplicates prevented |
| **M5: Physical Android NFC** | Phase 5 | Pending | Physical tag scan succeeds on Android test device |
| **M6: Prototype Sign-off** | Phase 6 | Pending | Full regression passed, zero critical bugs, documentation complete |
