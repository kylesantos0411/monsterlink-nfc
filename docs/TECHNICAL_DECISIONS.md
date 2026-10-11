# MONSTERLINK — Technical Decisions & Architecture Blueprint

## Document Status
* **Version**: 1.0.0
* **Date**: October 11, 2026
* **Status**: Approved Architectural Standard

---

## 1. System Architecture & Component Separation

To ensure testability, mobile responsiveness, and clean maintainability for a solo developer, MonsterLink is structured in distinct layers:

```
+-------------------------------------------------------------------------+
|                               UI Layer                                  |
|  - Unity Canvas, Panels, Views (MainMenu, Collection, Battle, History)   |
|  - View Controllers / Presenters observing Service Events               |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                             Service Layer                               |
|  - NfcRegistrationService: Card code validation & enrollment            |
|  - BattleEngine: Pure combat state machine & turn resolution            |
|  - BattleHistoryService: Match outcome logging & queries                |
|  - CollectionService: Player monster inventory management               |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         Domain & Data Layer                             |
|  - CreatureSpecies (Immutable catalog definition)                       |
|  - CreatureInstance (Mutable state, GUID, current HP, assigned card)    |
|  - MoveDefinition (Combat skill data)                                   |
|  - BattleRecord (Historical match payload)                              |
+-------------------------------------------------------------------------+
                    |                                 |
                    v                                 v
+-----------------------------------+  +----------------------------------+
|          NFC Interface            |  |        Persistence Layer         |
|  - INfcReader                     |  |  - IStorageService               |
|  - SimulatedNfcReader (Desktop)   |  |  - JsonFileStorageService        |
|  - AndroidNfcReader (Hardware)    |  |  - Schema Migration Manager      |
+-----------------------------------+  +----------------------------------+
```

### Key Architectural Constraints
* **Pure Domain Logic**: All models (`CreatureInstance`, `CreatureSpecies`, `MoveDefinition`, `BattleRecord`) and engines (`BattleEngine`, `BattleDamageCalculator`) are standard C# classes with no dependencies on `UnityEngine.GameObject` or UI components. This allows rapid execution of automated tests.
* **Service Locator / Composition Root**: Game services are instantiated in a lightweight bootstrapper (`AppCore` / `GameManager`) rather than singletons scattered across scenes.

---

## 2. Creature Data Architecture

### Separation of Species vs. Instance
A critical architectural pitfall in creature-battling games is coupling an individual monster's runtime state with its species definition. MonsterLink enforces strict separation:

#### `CreatureSpecies` (Catalog Definition)
* Immutable static data defined in code or ScriptableObjects.
* Fields:
  * `SpeciesId` (`string`, e.g., `"species_ignisaur"`)
  * `DisplayName` (`string`, e.g., `"Ignisaur"`)
  * `PrimaryType` (`ElementType` enum: `Fire`, `Water`, `Grass`, `Electric`, `Normal`)
  * `Rarity` (`RarityTier` enum: `Common`, `Uncommon`, `Rare`, `Legendary`)
  * `BaseStats` (`CreatureStats`: Base HP, Attack, Defense, Speed)
  * `LearnableMoveIds` (`List<string>`)
  * `SpritePath` / `AssetReference`

#### `CreatureInstance` (Player Entity)
* Mutable individual monster owned by a player.
* Multiple players or multiple cards may instantiate the same species, but each instance has a unique identity.
* Fields:
  * `InstanceId` (`string`, UUIDv4 format)
  * `SpeciesId` (`string`, references `CreatureSpecies`)
  * `Nickname` (`string`)
  * `Level` (`int`, defaults to 1 for prototype)
  * `CurrentHp` (`int`)
  * `MaxHp` (`int`, derived from species base + level scaling)
  * `Attack` (`int`)
  * `Defense` (`int`)
  * `Speed` (`int`)
  * `KnownMoves` (`List<string>`, up to 4 move IDs)
  * `NfcTagCode` (`string`, the unique card code that minted this instance)
  * `AcquiredTimestampUtc` (`string`, ISO 8601)

---

## 3. Deterministic Battle Engine

### Formula Design
Battle outcomes are deterministic to eliminate unpredictable random spikes during prototype evaluation and allow exact test verification.

#### Damage Formula
$$\text{BaseDamage} = \left\lfloor \left( \frac{2 \times \text{Level}}{5} + 2 \right) \times \frac{\text{Move Power} \times \text{Attacker ATK}}{\text{Defender DEF} \times 50} + 2 \right\rfloor$$

$$\text{TotalDamage} = \max\left(1, \left\lfloor \text{BaseDamage} \times \text{TypeMultiplier} \right\rfloor\right)$$

* Every attack that connects deals a minimum of 1 damage.
* Floor truncation ($\lfloor \cdot \rfloor$) occurs at explicit steps to ensure integer precision across platforms.

#### Type Effectiveness Matrix
| Attacker \ Defender | Fire | Water | Grass | Electric | Normal |
|---|---|---|---|---|---|
| **Fire** | 1.0x | 0.5x | 2.0x | 1.0x | 1.0x |
| **Water** | 2.0x | 1.0x | 0.5x | 1.0x | 1.0x |
| **Grass** | 0.5x | 2.0x | 1.0x | 1.0x | 1.0x |
| **Electric** | 1.0x | 2.0x | 0.5x | 1.0x | 1.0x |
| **Normal** | 1.0x | 1.0x | 1.0x | 1.0x | 1.0x |

#### Turn Resolution
1. Turn order is determined by creature `Speed`. The faster creature acts first.
2. In the event of equal speed, the player acts first (deterministic tiebreaker for prototype).
3. If creature A's attack reduces creature B to 0 HP, creature B faints immediately and cannot execute its selected move on that turn.

---

## 4. NFC Hardware Abstraction & Security Boundaries

### Two-Stage Scanning Architecture
To enable rapid desktop development and CI testing without requiring a physical Android phone for every minor logic change:
* `INfcReader` interface defines:
  ```csharp
  public interface INfcReader
  {
      bool IsAvailable { get; }
      bool IsListening { get; }
      event Action<string> OnTagScanned; // Emits card code / UID string
      event Action<string> OnScanError;
      void StartListening();
      void StopListening();
  }
  ```
* `SimulatedNfcReader`: Injects test strings via keyboard shortcuts, buttons, or direct method calls.
* `AndroidNfcReader`: Uses Android JNI via Unity's `AndroidJavaClass` to access `NfcAdapter`, enabling foreground dispatch and reading NDEF records or tag UIDs.

### Critical Security Notice: Physical Card Authenticity
> [!WARNING]
> **Prototype Limitation vs. Commercial Security**:
> In this local prototype, card registration verifies that an NFC tag's UID or NDEF payload matches a known pattern in the local catalog.
> **Reading an NFC UID DOES NOT prove authenticity or ownership.**
> Standard NFC card UIDs can be cloned or spoofed easily using programmable tags (e.g., Magic Mifare cards, Flipper Zero, or Android emulator apps).
>
> **Production Roadmap Requirement**:
> Commercial deployment of an NFC creature game requires:
> 1. Cryptographically secure tags (such as NXP NTAG 424 DNA with SUN - Secure Unique NFC message authentication).
> 2. Dynamic AES-128 CMAC signatures generated per tap.
> 3. An authoritative backend verification service that validates the cryptographic tap counter and signature before granting digital ownership.
>
> Local registration in this prototype is strictly intended to prove player UX and mechanics.

---

## 5. Local Persistent Storage & Data Integrity

### Storage Strategy
* Format: Plaintext JSON stored in `Application.persistentDataPath/monsterlink_data/`.
* Separate data stores to minimize blast radius of file corruption:
  1. `collection.json`: List of owned `CreatureInstance` records.
  2. `registered_cards.json`: Set of enrolled NFC card codes with instance GUID mappings.
  3. `battle_history.json`: Append-only array of `BattleRecord` items.
  4. `settings.json`: Volume, simulator toggle, and preferences.

### Schema Versioning & Atomic Write Safety
* Every JSON payload begins with a metadata header:
  ```json
  {
    "schemaVersion": 1,
    "lastModifiedUtc": "2026-10-11T14:30:00Z",
    "data": { ... }
  }
  ```
* **Atomic File Writes**: Data is serialized to a temporary file (`filename.tmp`) and flushed to disk before performing an atomic replace (`File.Replace` / `File.Move`) over the destination file. This prevents catastrophic data corruption if the OS terminates the app mid-write.

---

## 6. Combat Interruption & App Closure Policy

* When a battle starts, a transient flag (`CurrentBattleActive`) is marked with battle metadata in cache.
* When a battle completes normally, the active flag is cleared and a full `BattleRecord` is saved with outcome `Victory` or `Defeat`.
* If the application terminates unexpectedly (crash, battery depletion, user force-kill) mid-battle:
  * The battle is **never** counted as a victory.
  * Upon the next launch, the system checks for an orphaned `CurrentBattleActive` state.
  * If found, it appends a `BattleRecord` with `Outcome = Aborted` and notes `"Session terminated before match completion"`.
  * The active flag is then reset to ensure a clean state.

---

## 7. Git Workflow & Commit Guidelines

* **Main Branch**: `main` (always represents a stable, buildable state corresponding to completed phases).
* **Branching Model**: Feature branches per phase:
  * `phase/0-setup`
  * `phase/1-creature-collection`
  * `phase/2-nfc-simulator`
  * `phase/3-battle-engine`
  * `phase/4-battle-records`
  * `phase/5-android-nfc`
  * `phase/6-hardening`
* **Commit Standard**: Conventional commits:
  * `feat(scope): description`
  * `fix(scope): description`
  * `docs(scope): description`
  * `test(scope): description`
  * `refactor(scope): description`
