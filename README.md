# MonsterLink — NFC Creature Battle Prototype

## Overview
**MonsterLink** is a mobile-first 2D creature-collecting game built in Unity (C#) where physical NFC cards link directly to digital creatures. Players scan physical NFC tags to register new creatures into their local collection, inspect creature stats and move pools, engage in turn-based tactical battles against opponents, and review persistent battle records.

This project is developed incrementally following strict phase gates, separating pure domain logic from Unity UI presentation to maximize testability and long-term maintainability.

---

## Prototype Scope & Boundaries

### Included in Prototype
* **Main Menu Navigation**: Smooth switching between Collection, Scan NFC Card, Battle, Battle Records, and Settings.
* **Creature Data Architecture**: Separation of static `CreatureSpecies` definitions from unique `CreatureInstance` data.
* **Two-Stage NFC System**:
  * *Stage A*: Software-simulated NFC scanning with sample card codes for desktop/editor rapid testing.
  * *Stage B*: Native Android NFC hardware reading with NDEF/UID fallback handling.
* **Persistent Local Storage**: Clean file-based persistence (JSON) with migration/schema versioning for creature collection, card registries, and battle logs.
* **Deterministic Battle Engine**: Pure C# turn-based logic decoupled from `MonoBehaviour` and UI rendering, using a documented deterministic damage formula.
* **Battle History Records**: Full tracking of match results, turn-by-turn logs, timestamps, and HP differentials.
* **Original Test Creatures**: 3–5 original retro pixel-art style creature concepts (no copyrighted materials or trademarks).

### Explicit Non-Goals (Out of Prototype Scope)
* No cloud backend, multiplayer servers, or account logins (single-device local prototype only).
* No in-app purchases, ads, or monetization SDKs.
* No cryptographic proof of card physical authenticity (local NFC reads validate code presence only; commercial anti-counterfeiting requires signed payloads and backend validation).

---

## Architecture Overview

```
                      +-----------------------------+
                      |         UI Layer            |
                      | (Views, Presenters, Menus)  |
                      +--------------+--------------+
                                     |
                                     v
       +-----------------------------------------------------------+
       |                     Service Layer                         |
       |  +--------------------+  +-----------------------------+  |
       |  | NfcRegistrationSvc |  |    BattleEngine / Svc       |  |
       |  +---------+----------+  +--------------+--------------+  |
       |            |                            |                 |
       +------------|----------------------------|-----------------+
                    |                            |
       +------------v-------------+              |
       |      INfcReader          |              |
       |  +--------------------+  |              |
       |  | SimulatedNfcReader |  |              |
       |  | AndroidNfcReader   |  |              |
       |  +--------------------+  |              |
       +--------------------------+              v
                                  +--------------------------------+
                                  |         Domain Models          |
                                  | CreatureSpecies, CreatureInst  |
                                  | MoveDefinition, BattleRecord   |
                                  +--------------+-----------------+
                                                 |
                                                 v
                                  +--------------------------------+
                                  |       Persistence Layer        |
                                  | FileStorageService (JSON)      |
                                  +--------------------------------+
```

### Key Architectural Guidelines
1. **Separation of Concerns**: Domain models and battle calculations contain zero UnityEngine UI dependencies.
2. **Interface-Driven NFC**: High-level game flow depends on `INfcReader`, enabling seamless switching between `SimulatedNfcReader` and `AndroidNfcReader`.
3. **Deterministic Combat**: Given identical inputs, seeds, and moves, the battle engine produces identical, reproducible results.
4. **Data Model Integrity**: Stable GUID-based instance identification; species definitions remain immutable.

---

## Project Directory Structure

```
MonsterLink/
├── Assets/
│   ├── Prefabs/             # Reusable UI widgets and monster prefabs
│   ├── Resources/           # Dynamic runtime assets and registry definitions
│   ├── Scenes/              # Game scenes (MainMenu, Collection, Battle, etc.)
│   ├── Scripts/
│   │   ├── Battle/          # Battle engine, damage formulas, state machine
│   │   ├── Core/            # Entities, value objects, domain interfaces
│   │   ├── Data/            # ScriptableObjects and static species catalogs
│   │   ├── NFC/             # NFC reader interface, simulator, Android native bridge
│   │   ├── Persistence/     # Storage interfaces, JSON repositories, DTOs
│   │   ├── Records/         # Battle history logging and retrieval models
│   │   ├── UI/              # UI controllers, view components, HUD adapters
│   │   └── Utils/           # Constants, validation helpers, math utilities
│   └── Sprites/             # Pixel art sprites for creatures, moves, and UI
├── docs/
│   ├── BUILD_LOG.md         # Chronological development and task execution records
│   ├── PROJECT_PLAN.md      # Detailed phase breakdown and acceptance criteria
│   ├── TECHNICAL_DECISIONS.md # Architectural decisions, data schemas, formula docs
│   └── TEST_CHECKLIST.md    # Comprehensive test cases and execution ledger
├── .gitignore               # Standard Unity gitignore
└── README.md                # Project documentation overview
```

---

## Prerequisites & Installation

### Requirements
* **Unity Editor**: Unity 2022.3 LTS (recommended: `2022.3.x LTS` or `6000.x LTS`) with:
  * Android Build Support
  * Android SDK & NDK Tools
  * OpenJDK
* **Target Hardware (for Phase 5)**:
  * Android smartphone with NFC enabled (Android 8.0+ / API 26+)
  * Standard NFC tags (e.g., NTAG213, NTAG215, or NTAG216)
* **Development Workstation**:
  * Git 2.30+
  * Visual Studio 2022, Rider, or VS Code with C# Dev Kit

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "Pokemon Inspired Game"
   ```
2. Open Unity Hub, click **Add project from disk**, and select this root directory.
3. If creating or configuring the Unity project fresh, ensure the project is set to **2D (Mobile)** template.
4. Configure Editor Target Platform: `File -> Build Settings -> Android -> Switch Platform`.

---

## Development Roadmap (Strict Phase Progression)

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Workspace inspection, architecture definition, folder structure, git setup, documentation | **Completed** |
| **Phase 1** | Creature data models, sample species, collection UI, local JSON persistence | *Pending Approval* |
| **Phase 2** | NFC reading abstraction, Simulated NFC scanner, registration flow, duplicate prevention | Planned |
| **Phase 3** | Pure C# Battle Engine, damage calculation formulas, Turn Manager, Battle UI integration | Planned |
| **Phase 4** | Battle Record models, history logging service, match summary screen, history UI | Planned |
| **Phase 5** | Native Android NFC bridge, AndroidManifest configuration, physical tag field testing | Planned |
| **Phase 6** | End-to-end regression testing, edge case verification, limitation documentation, polish | Planned |

---

## Contributing & Development Rules
* Every change must be tracked in `docs/BUILD_LOG.md`.
* No phase may commence before the previous phase meets 100% of its acceptance criteria in `docs/TEST_CHECKLIST.md`.
* Tests must never be marked as passed without verified execution.
