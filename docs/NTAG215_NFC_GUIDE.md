# MONSTERLINK — DIRECT NTAG215 NFC WRITING & READING GUIDE

This document details how to program physical **NTAG215 NFC tags** directly from the **MONSTERLINK** web application without third-party software (such as NFC Tools), and how to scan them back to retrieve the corresponding Pokémon.

---

## 1. Supported Hardware & Requirements

| Component | Requirement | Notes |
|---|---|---|
| **Mobile Phone** | Android Smartphone with NFC | Samsung Galaxy, Google Pixel, Xiaomi, Motorola, OnePlus, etc. |
| **Browser** | Google Chrome for Android (v89+) | Native support for the W3C Web NFC API (`NDEFReader`). |
| **Connection** | Secure HTTPS | Web NFC is strictly restricted by Chromium to secure contexts (`https://` or `localhost`). |
| **Physical Tags** | NXP NTAG215 (Type 2 Tag) | Standard 504 bytes user memory stickers, cards, or keychains. |

> **Browser & Platform Limitations:**
> * **Apple iOS**: iOS Safari and Chrome on iOS do **not** support the W3C Web NFC API due to Apple WebKit engine restrictions.
> * **Desktop Browsers**: Desktop Chrome/Edge typically lack built-in NFC transceivers. For desktop use, MONSTERLINK provides **Simulation Mode**.

---

## 2. How to Program an NTAG215 Tag (Step-by-Step)

1. **Open MONSTERLINK** on your Android phone using **Google Chrome** via the HTTPS URL.
2. In the Main Menu, tap **`NFC LAB & PROGRAMMER`**.
3. Select the **`✍️ WRITE NTAG215`** sub-tab.
4. **Choose a Pokémon**:
   - Use the search bar to filter by name (e.g. `Pikachu`, `Charizard`, `Mewtwo`), Pokédex number (`#25`), or elemental type.
   - Tap the Pokémon thumbnail from the quick grid.
5. **Verify the Assigned Card Code**:
   - By default, it auto-assigns the canonical National Dex code (e.g. `ML-0025`).
   - Quick preset buttons allow switching to `ML-PKMN-0025` or `MEZASTAR-01-025`.
6. **Safe Tag Handling**:
   - Keep `"Allow overwriting existing NTAG215 tag records"` checked if your tag already has previous data.
   - Note: Only the lightweight NDEF text record (~12 bytes) is written to the physical tag. Visual artwork and combat stats are safely centralized in the app's local database.
7. **Initiate the Write**:
   - Tap **`📡 WRITE TO PHYSICAL NTAG215 TAG`**.
   - Chrome will request NFC permission on the first run (tap *Allow*).
   - The status bar will animate: `⏳ WAITING FOR TAG... HOLD TO PHONE ANTENNA`.
8. **Tap Your Tag**:
   - Hold your physical NTAG215 tag flat against the phone's NFC sweet spot (usually near the rear camera module) for ~1 second.
   - The phone will vibrate and play a celebratory chime upon success.

---

## 3. How to Read & Enroll the Programmed Tag

1. In the **NFC LAB & PROGRAMMER**, switch to the **`📡 READ / SCAN`** tab.
2. Tap **`▶ START PHYSICAL NFC`**.
3. Hold your programmed NTAG215 tag against the back of your phone.
4. **Instant Match**:
   - The app reads the NDEF text record (e.g. `ML-0025`).
   - It instantly resolves the Pokémon's verified artwork, elemental types, stats, and MEZASTAR grade.
   - It registers the creature into your local collection.
5. **Duplicate Protection**:
   - If a tag has already been enrolled in your collection, the scanner notifies you and rejects duplicate enrollment.

---

## 4. Desktop Simulation Mode

For development on desktop computers or unsupported devices:
1. In the **`✍️ WRITE NTAG215`** tab, select a Pokémon and click **`🧪 SIMULATE WRITE (DESKTOP MODE)`**.
2. This assigns the card code into the runtime registry and adds it to the **`PROGRAMMED NTAG215 CARDS (TEST TAP)`** rack in the Read tab.
3. Switch to the **`📡 READ / SCAN`** tab and tap the programmed card chip to simulate a physical tap!

---

## 5. Technical Architecture

* **[`src/lib/nfc/ntag215-service.ts`](file:///c:/Users/kyle/Desktop/Pokemon%20Inspired%20Game/src/lib/nfc/ntag215-service.ts)**: Core Web NFC write/read logic, NDEF text record generation, hardware capability checks, and error handling.
* **[`src/lib/nfc/use-web-nfc.ts`](file:///c:/Users/kyle/Desktop/Pokemon%20Inspired%20Game/src/lib/nfc/use-web-nfc.ts)**: React hook managing scanning, writing states, and AbortControllers.
* **[`src/lib/data/catalog.ts`](file:///c:/Users/kyle/Desktop/Pokemon%20Inspired%20Game/src/lib/data/catalog.ts)**: Dynamic `resolveCardRegistryEntry` resolver that bridges any National Dex code (`ML-0001` through `ML-0151` / `ML-0448`) to combat-ready creature species.
* **[`tests/nfc-writer.test.ts`](file:///c:/Users/kyle/Desktop/Pokemon%20Inspired%20Game/tests/nfc-writer.test.ts)**: Automated test suite verifying payload encoding, NDEF parsing, and duplicate protection.
