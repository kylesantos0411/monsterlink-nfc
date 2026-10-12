'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HybridStorage } from '@/lib/storage/hybrid-storage';
import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { CARD_REGISTRY, SPECIES_CATALOG, MOVES_CATALOG as MOVES, createCreatureInstance, resolveCardRegistryEntry } from '@/lib/data/catalog';
import { MEZASTAR_CATALOG, getMezastarTagByNfcCode } from '@/lib/data/mezastar-catalog';
import { fetchPokemonReference, PokeApiReferenceData } from '@/lib/pokeapi/client';
import { BattleEngine } from '@/lib/battle/battle-engine';
import { createBattleRecord } from '@/lib/battle/record-factory';
import { useWebNfc } from '@/lib/nfc/use-web-nfc';
import { PIXEL_SPRITES } from '@/lib/data/pixel-sprites';
import { getPokemonArtworkUrl, getPokemonByName, getPokemonByPokedexNumber, searchPokemon, POKEMON_DATABASE } from '@/lib/data/pokemon-service';
import { Sound } from '@/lib/sound/sound-controller';
import { formatCardIdentifier, resolveCardToPokemonData, writeAndVerifyNtag215Card, simulateWriteAndVerify } from '@/lib/nfc/ntag215-service';
import { PokemonSpeciesRecord } from '@/types/pokemon';
import { ResolvedCardData, NfcVerificationStep } from '@/types/nfc';

interface ScanLogEntry {
  id: string;
  code: string;
  time: string;
  status: 'success' | 'duplicate' | 'error';
  message: string;
}

export default function HomePage() {
  // Navigation View: view-menu, view-scan, view-collection, view-battle, view-history, view-settings, view-monsterlist
  const [currentView, setCurrentView] = useState<string>('view-menu');
  
  // Desktop simulator options
  const [phoneFrameExpanded, setPhoneFrameExpanded] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Time clock in status bar
  const [timeDisplay, setTimeDisplay] = useState<string>('12:00');

  // App data
  const [collection, setCollection] = useState<CreatureInstance[]>([]);
  const [history, setHistory] = useState<BattleRecord[]>([]);

  // Toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Scan view state
  const [customCardInput, setCustomCardInput] = useState<string>('');
  const [isAntennaPulsing, setIsAntennaPulsing] = useState<boolean>(false);
  const [antennaStatusText, setAntennaStatusText] = useState<string>('Ready for NFC Card Tap');
  const [scanSessionLogs, setScanSessionLogs] = useState<ScanLogEntry[]>([]);

  // NFC Lab Sub-tab: 'read' | 'write' | 'guide'
  const [nfcLabTab, setNfcLabTab] = useState<'read' | 'write' | 'guide'>('read');

  // Monster List (All Pokémon Database) View State
  const [monsterListSearch, setMonsterListSearch] = useState<string>('');
  const [monsterListTypeFilter, setMonsterListTypeFilter] = useState<string>('ALL');
  const [selectedMonsterForModal, setSelectedMonsterForModal] = useState<PokemonSpeciesRecord | null>(null);
  const [modalVerificationSteps, setModalVerificationSteps] = useState<NfcVerificationStep[] | null>(null);
  const [modalIsWriting, setModalIsWriting] = useState<boolean>(false);
  const [modalWriteResult, setModalWriteResult] = useState<{ success: boolean; message: string; isSimulated: boolean } | null>(null);
  const [modalAllowOverwrite, setModalAllowOverwrite] = useState<boolean>(true);

  // NFC Writer State
  const [writeSearchQuery, setWriteSearchQuery] = useState<string>('');
  const [selectedPokemonForWrite, setSelectedPokemonForWrite] = useState<PokemonSpeciesRecord>(() => {
    return getPokemonByPokedexNumber(1) || POKEMON_DATABASE[0];
  });
  const [customWriteCode, setCustomWriteCode] = useState<string>('ML-0001');
  const [allowOverwrite, setAllowOverwrite] = useState<boolean>(true);
  const [writeFeedback, setWriteFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    code: string;
    isSimulated?: boolean;
  } | null>(null);

  // Programmed Tags in session (available in both physical history and simulation test rack)
  const [recentProgrammedCards, setRecentProgrammedCards] = useState<Array<{
    code: string;
    name: string;
    dexNumber: number;
    time: string;
    isSimulated: boolean;
  }>>([
    { code: 'ML-0025', name: 'Pikachu', dexNumber: 25, time: 'Preset', isSimulated: true },
    { code: 'ML-0006', name: 'Charizard', dexNumber: 6, time: 'Preset', isSimulated: true },
  ]);

  // Last read / scanned card data
  const [lastScannedCardData, setLastScannedCardData] = useState<ResolvedCardData | null>(null);

  // Collection modal state
  const [inspectCreature, setInspectCreature] = useState<{
    instance: CreatureInstance;
    pokeApiRef: PokeApiReferenceData | null;
  } | null>(null);

  // Battle Arena state
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [selectedOpponentSpecies, setSelectedOpponentSpecies] = useState<string>('species_aquabite');
  const [activeEngine, setActiveEngine] = useState<BattleEngine | null>(null);
  const [battleDialogue, setBattleDialogue] = useState<string>('What will your creature do?');
  const [playerAnimShake, setPlayerAnimShake] = useState<boolean>(false);
  const [oppAnimShake, setOppAnimShake] = useState<boolean>(false);
  const [playerAnimFaint, setPlayerAnimFaint] = useState<boolean>(false);
  const [oppAnimFaint, setOppAnimFaint] = useState<boolean>(false);
  const [battleResultModal, setBattleResultModal] = useState<{
    victory: boolean;
    turns: number;
    winnerName: string;
  } | null>(null);

  // Settings Raw JSON dump modal
  const [showJsonDump, setShowJsonDump] = useState<boolean>(false);
  const [jsonDumpContent, setJsonDumpContent] = useState<string>('');

  const battleDialogueRef = useRef<HTMLDivElement>(null);

  // Physical Web NFC Hook
  const {
    isSupported: isNfcSupported,
    isScanning: isNfcScanning,
    isWriting: isNfcWriting,
    hardwareSupport: nfcHardware,
    statusMessage: nfcStatus,
    startScanning: startNfcScan,
    stopScanning: stopNfcScan,
    writeCard: writeNfcCard,
    cancelWrite: cancelNfcWrite,
  } = useWebNfc({
    onTagRead: (tagCode) => handleScanCard(tagCode),
    onError: (err) => showToast(`NFC Error: ${err.message}`, 'error'),
  });

  // Clock runner
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeDisplay(`${hrs}:${mins}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const coll = await HybridStorage.getCollection();
    const hist = await HybridStorage.getBattleHistory();
    setCollection(coll);
    setHistory(hist);
    if (coll.length > 0 && !selectedRosterId) {
      setSelectedRosterId(coll[0].instanceId);
    }
  }

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToast({ message, type });
    if (type === 'error') {
      Sound.playError();
    }
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  function navigateTo(viewId: string) {
    Sound.playClick();
    setCurrentView(viewId);
    refreshData();
  }

  // Quick seed 2 demo creatures
  async function handleQuickSeed() {
    Sound.playClick();
    const existing = await HybridStorage.getCollection();
    if (existing.length >= 2) {
      showToast('Collection already has 2 or more creatures!', 'info');
      return;
    }
    const c1 = createCreatureInstance('species_ignisaur', 'ML-CARD-IGNI-01', 'Ignisaur', 5);
    const c2 = createCreatureInstance('species_aquabite', 'ML-CARD-AQUA-02', 'Aquabite', 5);
    await HybridStorage.addCreature(c1);
    await HybridStorage.registerCard('ML-CARD-IGNI-01', c1.instanceId, c1.speciesId);
    await HybridStorage.addCreature(c2);
    await HybridStorage.registerCard('ML-CARD-AQUA-02', c2.instanceId, c2.speciesId);
    await refreshData();
    Sound.playScanSuccess();
    showToast('Demo creatures (Flamby & Aquat) added!', 'success');
  }

  // Select Pokémon for writing
  function handleSelectPokemonForWrite(pkmn: PokemonSpeciesRecord) {
    setSelectedPokemonForWrite(pkmn);
    const autoCode = formatCardIdentifier(pkmn.pokedexNumber);
    setCustomWriteCode(autoCode);
    setWriteFeedback(null);
  }

  // Physical write (requires Web NFC on Android Chrome)
  async function handlePhysicalWrite() {
    if (!selectedPokemonForWrite) {
      showToast('Please select a Pokémon to program onto the card.', 'error');
      return;
    }
    const code = customWriteCode.trim().toUpperCase();
    if (!code) {
      showToast('Please specify a valid card identifier (e.g. ML-0025).', 'error');
      return;
    }

    setWriteFeedback(null);
    try {
      Sound.playClick();
      const result = await writeNfcCard(code, { overwrite: allowOverwrite });

      const now = new Date().toLocaleTimeString();
      setWriteFeedback({
        type: 'success',
        message: result.message,
        code,
        isSimulated: false,
      });

      // Ensure it is registered in catalog
      resolveCardRegistryEntry(code);

      // Track in recent programmed list
      setRecentProgrammedCards(prev => [
        {
          code,
          name: selectedPokemonForWrite.displayName,
          dexNumber: selectedPokemonForWrite.pokedexNumber,
          time: now,
          isSimulated: false,
        },
        ...prev.filter(c => c.code !== code),
      ]);

      Sound.playScanSuccess();
      showToast(`Physical NTAG215 tag [${code}] written successfully!`, 'success');
    } catch (err: any) {
      Sound.playError();
      setWriteFeedback({
        type: 'error',
        message: err.message || 'Failed to write to NFC card.',
        code,
        isSimulated: false,
      });
      showToast(`Write Failed: ${err.message}`, 'error');
    }
  }

  // Simulated write (desktop testing)
  function handleSimulatedWrite() {
    if (!selectedPokemonForWrite) return;
    const code = customWriteCode.trim().toUpperCase();
    if (!code) return;

    Sound.playClick();
    const now = new Date().toLocaleTimeString();

    // Register in catalog
    resolveCardRegistryEntry(code);

    // Add to recent programmed list so it can be tapped in the reader simulator
    setRecentProgrammedCards(prev => [
      {
        code,
        name: selectedPokemonForWrite.displayName,
        dexNumber: selectedPokemonForWrite.pokedexNumber,
        time: now,
        isSimulated: true,
      },
      ...prev.filter(c => c.code !== code),
    ]);

    setWriteFeedback({
      type: 'success',
      message: `[SIMULATED] Card [${code}] written to virtual NTAG215 memory. You can now tap it in the reader tab!`,
      code,
      isSimulated: true,
    });

    Sound.playScanSuccess();
    showToast(`[SIMULATED] Card [${code}] programmed!`, 'info');
  }

  // Monster List (Database) Modal Handlers
  function openMonsterModal(pkmn: PokemonSpeciesRecord) {
    Sound.playClick();
    setSelectedMonsterForModal(pkmn);
    setModalVerificationSteps(null);
    setModalWriteResult(null);
  }

  function closeMonsterModal() {
    Sound.playClick();
    setSelectedMonsterForModal(null);
    setModalVerificationSteps(null);
    setModalWriteResult(null);
  }

  async function handleModalWriteAndVerify(pkmn: PokemonSpeciesRecord) {
    const code = formatCardIdentifier(pkmn.pokedexNumber);
    setModalIsWriting(true);
    setModalWriteResult(null);

    // Initial steps state
    const initialSteps: NfcVerificationStep[] = [
      { step: 'format', status: 'active', label: 'NDEF Text Record Encoding', detail: `Preparing ${code}...` },
      { step: 'write', status: 'pending', label: 'Physical NTAG215 Sector Write' },
      { step: 'readback', status: 'pending', label: 'Hardware Read-back Acknowledgment' },
      { step: 'verify', status: 'pending', label: 'Identifier Verification & Integrity Check' },
    ];
    setModalVerificationSteps(initialSteps);

    if (isNfcSupported) {
      try {
        Sound.playClick();
        const res = await writeAndVerifyNtag215Card(code, {
          overwrite: modalAllowOverwrite,
          onProgress: (steps) => setModalVerificationSteps([...steps]),
        });

        // Ensure registered in catalog
        resolveCardRegistryEntry(code);

        // Add to recent programmed list
        const now = new Date().toLocaleTimeString();
        setRecentProgrammedCards(prev => [
          {
            code,
            name: pkmn.displayName,
            dexNumber: pkmn.pokedexNumber,
            time: now,
            isSimulated: false,
          },
          ...prev.filter(c => c.code !== code),
        ]);

        setModalWriteResult({
          success: true,
          message: res.message,
          isSimulated: false,
        });
        Sound.playScanSuccess();
        showToast(`Verified! [${code}] written to physical NTAG215 tag.`, 'success');
      } catch (err: any) {
        Sound.playError();
        setModalWriteResult({
          success: false,
          message: err.message || 'Write and verify failed.',
          isSimulated: false,
        });
        showToast(`Failed: ${err.message}`, 'error');
      } finally {
        setModalIsWriting(false);
      }
    } else {
      // Simulation mode
      try {
        Sound.playClick();
        const res = simulateWriteAndVerify(code, (steps) => setModalVerificationSteps([...steps]));
        resolveCardRegistryEntry(code);

        const now = new Date().toLocaleTimeString();
        setRecentProgrammedCards(prev => [
          {
            code,
            name: pkmn.displayName,
            dexNumber: pkmn.pokedexNumber,
            time: now,
            isSimulated: true,
          },
          ...prev.filter(c => c.code !== code),
        ]);

        setModalWriteResult({
          success: true,
          message: res.message,
          isSimulated: true,
        });
        Sound.playScanSuccess();
        showToast(`[SIMULATED] Verified: [${code}] written to virtual NTAG215.`, 'info');
      } catch (err: any) {
        Sound.playError();
        setModalWriteResult({
          success: false,
          message: err.message,
          isSimulated: true,
        });
      } finally {
        setModalIsWriting(false);
      }
    }
  }

  // NFC Card Scan Logic
  async function handleScanCard(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    // Trigger visual antenna pulse
    setIsAntennaPulsing(true);
    setAntennaStatusText(`Scanning card ${code}...`);
    setTimeout(() => setIsAntennaPulsing(false), 800);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // 1. Resolve against static registry or national dex database
    const card = resolveCardRegistryEntry(code) || CARD_REGISTRY[code];
    const isRegistered = await HybridStorage.isCardRegistered(code);
    const regCards = await HybridStorage.getRegisteredCards();
    const resolvedData = resolveCardToPokemonData(code, regCards);
    if (resolvedData) {
      setLastScannedCardData(resolvedData);
    }

    if (isRegistered) {
      setAntennaStatusText(`Duplicate tag: ${code}`);
      setScanSessionLogs(prev => [
        {
          id: String(Date.now()),
          code,
          time: timeStr,
          status: 'duplicate',
          message: 'Already enrolled in collection'
        },
        ...prev
      ]);
      Sound.playError();
      showToast(`Rejected: Card [${code}] already in collection!`, 'error');
      return;
    }

    if (!card) {
      setAntennaStatusText(`Unrecognized tag: ${code}`);
      setScanSessionLogs(prev => [
        {
          id: String(Date.now()),
          code,
          time: timeStr,
          status: 'error',
          message: 'Unrecognized card code'
        },
        ...prev
      ]);
      Sound.playError();
      showToast(`Invalid Card: [${code}] not found in registry`, 'error');
      return;
    }

    // 3. Register monster
    const cleanNick = resolvedData ? resolvedData.speciesName : card.name.split(' (')[0].replace(' Tag', '');
    const monster = createCreatureInstance(card.speciesId, code, cleanNick, 5);
    await HybridStorage.addCreature(monster);
    await HybridStorage.registerCard(code, monster.instanceId, monster.speciesId);
    await refreshData();

    setAntennaStatusText(`Registered: ${monster.nickname}`);
    setScanSessionLogs(prev => [
      {
        id: String(Date.now()),
        code,
        time: timeStr,
        status: 'success',
        message: `Registered ${monster.nickname} (Lv.5)`
      },
      ...prev
    ]);

    Sound.playScanSuccess();
    showToast(`Registered: ${monster.nickname} (${card.grade || 'Common'})!`, 'success');
  }

  // Inspect Modal
  async function openInspect(creature: CreatureInstance) {
    Sound.playClick();
    let ref: PokeApiReferenceData | null = null;
    const mezastar = creature.nfcCardCode ? getMezastarTagByNfcCode(creature.nfcCardCode) : null;
    if (mezastar) {
      ref = await fetchPokemonReference(mezastar.pokeApiId);
    } else if (creature.speciesId.startsWith('species_')) {
      const pokeName = creature.speciesId.replace('species_', '');
      ref = await fetchPokemonReference(pokeName);
    }
    setInspectCreature({ instance: creature, pokeApiRef: ref });
  }

  // Start Battle
  function handleStartBattle() {
    if (!selectedRosterId) return;
    const playerMonster = collection.find(c => c.instanceId === selectedRosterId);
    if (!playerMonster) return;

    Sound.playClick();
    const opponentMonster = createCreatureInstance(
      selectedOpponentSpecies,
      null,
      'Rival ' + (SPECIES_CATALOG[selectedOpponentSpecies]?.name || 'Creature'),
      5
    );

    const engine = new BattleEngine(playerMonster, opponentMonster);
    setActiveEngine(engine);
    setBattleDialogue(`A wild Rival ${opponentMonster.nickname} appeared! What will ${playerMonster.nickname} do?`);
    setPlayerAnimShake(false);
    setOppAnimShake(false);
    setPlayerAnimFaint(false);
    setOppAnimFaint(false);
    setBattleResultModal(null);
  }

  // Execute Combat Move Turn
  async function handleBattleMove(moveId: string) {
    if (!activeEngine || activeEngine.isBattleOver) return;

    Sound.playClick();
    const startPlayerHp = activeEngine.player.currentHp;
    const startOpponentHp = activeEngine.opponent.currentHp;

    const turnResult = activeEngine.executeTurn(moveId);

    // Play attack hit sound and platform animation
    setOppAnimShake(true);
    Sound.playHit();
    setTimeout(() => setOppAnimShake(false), 400);

    // Step narration sequence
    const narrationTexts = turnResult.steps.map(s => s.narrationLog);
    setBattleDialogue(narrationTexts.join('\n'));

    // Check if player took hit
    if (turnResult.steps.some(s => s.actor === 'opponent' && s.damageDealt > 0)) {
      setTimeout(() => {
        setPlayerAnimShake(true);
        setTimeout(() => setPlayerAnimShake(false), 400);
      }, 500);
    }

    if (turnResult.isBattleOver) {
      const isPlayerVictory = activeEngine.winner === 'player';
      if (isPlayerVictory) {
        setOppAnimFaint(true);
        Sound.playVictory();
      } else {
        setPlayerAnimFaint(true);
        Sound.playFaint();
      }

      // Record battle history
      const rec = createBattleRecord(activeEngine, startPlayerHp, startOpponentHp);
      await HybridStorage.addBattleRecord(rec);
      await refreshData();

      setTimeout(() => {
        setBattleResultModal({
          victory: isPlayerVictory,
          turns: activeEngine.currentTurn,
          winnerName: isPlayerVictory ? activeEngine.player.nickname : activeEngine.opponent.nickname,
        });
      }, 1000);
    }

    setActiveEngine(Object.assign(Object.create(Object.getPrototypeOf(activeEngine)), activeEngine));
  }

  // Forfeit Battle
  async function handleBattleForfeit() {
    Sound.playClick();
    if (activeEngine && !activeEngine.isBattleOver) {
      const rec = createBattleRecord(activeEngine, activeEngine.player.currentHp, activeEngine.opponent.currentHp);
      rec.outcome = 'Defeat';
      await HybridStorage.addBattleRecord(rec);
      await refreshData();
    }
    setActiveEngine(null);
    setBattleResultModal(null);
    navigateTo('view-menu');
  }

  // Raw JSON Inspector
  async function handleInspectJson() {
    Sound.playClick();
    const raw = await HybridStorage.exportRawData();
    setJsonDumpContent(JSON.stringify(raw, null, 2));
    setShowJsonDump(true);
  }

  // Download Backup
  async function handleDownloadBackup() {
    Sound.playClick();
    const raw = await HybridStorage.exportRawData();
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monsterlink-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully!', 'success');
  }

  // Wipe All Data
  async function handleWipeData() {
    if (confirm('Are you sure you want to wipe all local storage data? This cannot be undone.')) {
      await HybridStorage.clearAllData();
      await refreshData();
      showToast('All local storage data has been cleared.', 'info');
    }
  }

  // Clear Battle History
  async function handleClearHistory() {
    if (confirm('Clear all battle history records?')) {
      const raw = await HybridStorage.exportRawData();
      raw.history = [];
      await HybridStorage.importRawData(raw);
      await refreshData();
      showToast('Battle records cleared.', 'info');
    }
  }

  // Helper: Get sprite SVG string
  function getSpriteSvg(spriteKey?: string): string {
    if (!spriteKey) return PIXEL_SPRITES.ignisaur;
    return PIXEL_SPRITES[spriteKey] || PIXEL_SPRITES.ignisaur;
  }

  // Helper: Render official Pokémon artwork or vector pixel sprite
  function renderCreatureVisual(speciesId: string, customSize = '100%') {
    const poke = getPokemonByName(speciesId);
    if (poke && poke.sprites.officialArtwork) {
      return (
        <img
          src={poke.sprites.officialArtwork}
          alt={poke.displayName}
          style={{
            width: customSize,
            height: customSize,
            objectFit: 'contain',
            imageRendering: 'auto',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
          }}
          loading="lazy"
          onError={(e) => {
            // Fallback to pixel sprite if network image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    const species = SPECIES_CATALOG[speciesId];
    return (
      <div 
        style={{ width: customSize, height: customSize }}
        dangerouslySetInnerHTML={{ __html: getSpriteSvg(species?.spriteKey) }}
      />
    );
  }

  return (
    <>
      {/* Desktop Control Bar */}
      <aside className="desktop-bar">
        <div className="bar-brand">
          <span className="pixel-dot"></span>
          <strong>MONSTERLINK WEB PROTOTYPE</strong>
          <span className="tag">Phase 0.5 Preview</span>
        </div>
        <div className="bar-actions">
          <button 
            id="btn-toggle-frame" 
            className={`bar-btn ${phoneFrameExpanded ? 'active' : ''}`}
            onClick={() => {
              Sound.playClick();
              setPhoneFrameExpanded(prev => !prev);
            }}
            title="Toggle between smartphone mockup and responsive view"
          >
            📱 View: {phoneFrameExpanded ? 'Responsive Mode' : 'Phone Frame'}
          </button>
          <button 
            id="btn-toggle-crt" 
            className={`bar-btn ${crtEnabled ? 'active' : ''}`}
            onClick={() => {
              Sound.playClick();
              setCrtEnabled(prev => !prev);
              document.body.classList.toggle('crt-enabled', !crtEnabled);
            }}
            title="Toggle CRT scanline raster effect"
          >
            📺 CRT Effect: {crtEnabled ? 'ON' : 'OFF'}
          </button>
          <button 
            id="btn-toggle-sound" 
            className={`bar-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => {
              const res = Sound.toggle();
              setSoundEnabled(res);
            }}
            title="Toggle 8-bit sound effects"
          >
            🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button 
            id="btn-quick-seed" 
            className="bar-btn bar-btn-accent" 
            onClick={handleQuickSeed}
            title="Seed 2 initial sample creatures for testing"
          >
            ⚡ Seed Demo Creatures
          </button>
        </div>
      </aside>

      {/* Main Simulator Container */}
      <main className="device-wrapper">
        <div className={`phone-frame ${phoneFrameExpanded ? 'mode-expanded' : ''}`} id="phone-frame">
          
          {/* Top Speaker & Camera Notch */}
          <div className="phone-notch">
            <div className="notch-speaker"></div>
            <div className="notch-camera"></div>
          </div>

          {/* Phone Screen Viewport */}
          <div className="screen" id="app-screen">
            
            {/* Retro Status Bar */}
            <header className="status-bar">
              <span className="status-time" id="clock-display">{timeDisplay}</span>
              <span className="status-title">MONSTERLINK</span>
              <div className="status-icons">
                <span className="nfc-indicator" title="NFC Prototype Active">📡 NFC</span>
                <span className="battery-icon">▮▮▮</span>
              </div>
            </header>

            {/* Notification Toast Banner */}
            <div 
              id="toast-banner" 
              className={`toast-banner ${!toast ? 'hidden' : ''} ${toast?.type === 'success' ? 'toast-success' : toast?.type === 'error' ? 'toast-error' : ''}`}
            >
              <span id="toast-icon">{toast?.type === 'success' ? '✅' : toast?.type === 'error' ? '⚠️' : 'ℹ️'}</span>
              <span id="toast-text">{toast?.message || ''}</span>
            </div>

            {/* ========================================== */}
            {/* VIEW 1: MAIN MENU                          */}
            {/* ========================================== */}
            <section id="view-menu" className={`view ${currentView === 'view-menu' ? 'active' : ''}`}>
              <div className="menu-hero">
                <div className="logo-box">
                  <div className="logo-subtitle">PHYSICAL NFC x RETRO 2D</div>
                  <h1 className="logo-title">MONSTER<br /><span>LINK</span></h1>
                  <div className="logo-version">PROTOTYPE V0.5</div>
                </div>
                <div className="hero-mascot" id="menu-mascot-container">
                  <div 
                    className="pixel-sprite"
                    dangerouslySetInnerHTML={{ __html: PIXEL_SPRITES.ignisaur }}
                  />
                </div>
              </div>

              <nav className="menu-buttons">
                <button className="pixel-btn btn-primary" onClick={() => navigateTo('view-scan')}>
                  <span className="btn-icon">📡</span>
                  <span className="btn-label">NFC LAB & PROGRAMMER</span>
                  <span className="btn-sub">Read & Write NTAG215 Tags</span>
                </button>
                <button className="pixel-btn" style={{ borderColor: '#38bdf8' }} onClick={() => navigateTo('view-monsterlist')}>
                  <span className="btn-icon">👾</span>
                  <span className="btn-label">MONSTER LIST (50 CREATURES)</span>
                  <span className="btn-sub">Original Monsters &amp; NFC Writer</span>
                  <span className="btn-badge">{POKEMON_DATABASE.length}</span>
                </button>
                <button className="pixel-btn" onClick={() => navigateTo('view-collection')}>
                  <span className="btn-icon">📦</span>
                  <span className="btn-label">MY COLLECTION</span>
                  <span className="btn-badge" id="menu-collection-count">{collection.length}</span>
                </button>
                <button className="pixel-btn btn-battle" onClick={() => navigateTo('view-battle')}>
                  <span className="btn-icon">⚔️</span>
                  <span className="btn-label">BATTLE ARENA</span>
                  <span className="btn-sub">Turn-based combat</span>
                </button>
                <button className="pixel-btn" onClick={() => navigateTo('view-history')}>
                  <span className="btn-icon">📜</span>
                  <span className="btn-label">BATTLE RECORDS</span>
                  <span className="btn-sub">Past match history</span>
                </button>
                <button className="pixel-btn" onClick={() => navigateTo('view-settings')}>
                  <span className="btn-icon">⚙️</span>
                  <span className="btn-label">SETTINGS & DATA</span>
                </button>
              </nav>
            </section>

            {/* ========================================== */}
            {/* VIEW 2: NFC LAB & PROGRAMMER               */}
            {/* ========================================== */}
            <section id="view-scan" className={`view ${currentView === 'view-scan' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" onClick={() => navigateTo('view-menu')}>◀ MENU</button>
                <h2>NFC LAB & PROGRAMMER</h2>
                <div className="hdr-spacer"></div>
              </div>

              <div className="scan-container">
                {/* Lab Mode Tabs */}
                <div className="nfc-mode-tabs">
                  <button 
                    className={`nfc-tab-btn ${nfcLabTab === 'read' ? 'active' : ''}`}
                    onClick={() => { Sound.playClick(); setNfcLabTab('read'); }}
                  >
                    📡 READ / SCAN
                  </button>
                  <button 
                    className={`nfc-tab-btn ${nfcLabTab === 'write' ? 'active' : ''}`}
                    onClick={() => { Sound.playClick(); setNfcLabTab('write'); }}
                  >
                    ✍️ WRITE NTAG215
                  </button>
                  <button 
                    className="nfc-tab-btn"
                    onClick={() => { Sound.playClick(); navigateTo('view-monsterlist'); }}
                  >
                    📖 152 LIST
                  </button>
                  <button 
                    className={`nfc-tab-btn ${nfcLabTab === 'guide' ? 'active' : ''}`}
                    onClick={() => { Sound.playClick(); setNfcLabTab('guide'); }}
                  >
                    ℹ️ GUIDE
                  </button>
                </div>

                {/* Hardware Status Banner */}
                <div className={`nfc-hw-badge ${isNfcSupported ? 'supported' : 'unsupported'}`}>
                  <div>
                    <strong>HARDWARE: </strong>
                    {isNfcSupported ? 'Web NFC Ready (Android Chrome / HTTPS)' : 'Desktop / Simulation Mode'}
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    {isNfcSupported ? 'Physical NTAG215 Active' : 'Virtual NFC'}
                  </div>
                </div>

                {/* ==================================== */}
                {/* SUBTAB 1: WRITE NTAG215 TAG          */}
                {/* ==================================== */}
                {nfcLabTab === 'write' && (
                  <div className="nfc-writer-card">
                    {/* Pokémon Search & Selection */}
                    <div className="write-field-group">
                      <label>SELECT POKÉMON TO PROGRAM:</label>
                      <input 
                        type="text"
                        className="pokemon-search-input"
                        placeholder="Search by name, #dex, or type..."
                        value={writeSearchQuery}
                        onChange={(e) => setWriteSearchQuery(e.target.value)}
                      />
                      <div className="pokemon-quick-grid">
                        {searchPokemon(writeSearchQuery, 16).map(p => (
                          <button
                            key={p.pokedexNumber}
                            className={`pkmn-pick-btn ${selectedPokemonForWrite?.pokedexNumber === p.pokedexNumber ? 'selected' : ''}`}
                            onClick={() => handleSelectPokemonForWrite(p)}
                            type="button"
                          >
                            <img src={getPokemonArtworkUrl(p.pokedexNumber)} alt={p.name} />
                            <span>#{String(p.pokedexNumber).padStart(3, '0')}</span>
                            <span style={{ fontSize: '5.5px', textTransform: 'capitalize' }}>{p.displayName.slice(0, 8)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Pokémon Preview */}
                    {selectedPokemonForWrite && (
                      <div className="writer-pkmn-preview">
                        <div className="writer-pkmn-thumb">
                          <img src={getPokemonArtworkUrl(selectedPokemonForWrite.pokedexNumber)} alt={selectedPokemonForWrite.name} />
                        </div>
                        <div className="writer-pkmn-info">
                          <div className="writer-pkmn-name">
                            #{String(selectedPokemonForWrite.pokedexNumber).padStart(3, '0')} {selectedPokemonForWrite.displayName}
                          </div>
                          <div className="writer-pkmn-sub">
                            {selectedPokemonForWrite.genus || 'Species Tag'} • {selectedPokemonForWrite.types.join(' / ').toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {selectedPokemonForWrite.types.map(t => (
                              <span key={t} className={`type-pill type-${t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()}`}>
                                {t.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Identifier Setup */}
                    <div className="write-field-group">
                      <label>ASSIGNED NDEF CARD CODE:</label>
                      <input 
                        type="text"
                        className="write-field-input"
                        value={customWriteCode}
                        onChange={(e) => setCustomWriteCode(e.target.value.toUpperCase())}
                        placeholder="e.g. ML-0025"
                      />
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <button
                          type="button"
                          className="pixel-btn-small"
                          onClick={() => setCustomWriteCode(formatCardIdentifier(selectedPokemonForWrite.pokedexNumber))}
                        >
                          ML-{String(selectedPokemonForWrite.pokedexNumber).padStart(4, '0')}
                        </button>
                        <button
                          type="button"
                          className="pixel-btn-small"
                          onClick={() => setCustomWriteCode(formatCardIdentifier(selectedPokemonForWrite.pokedexNumber, 'ML-PKMN'))}
                        >
                          ML-PKMN-{String(selectedPokemonForWrite.pokedexNumber).padStart(4, '0')}
                        </button>
                        <button
                          type="button"
                          className="pixel-btn-small"
                          onClick={() => setCustomWriteCode(`MEZASTAR-01-${String(selectedPokemonForWrite.pokedexNumber).padStart(3, '0')}`)}
                        >
                          MEZASTAR
                        </button>
                      </div>
                    </div>

                    {/* Safe Tag Handling Options */}
                    <div className="overwrite-toggle-box">
                      <input 
                        type="checkbox"
                        id="chk-overwrite"
                        checked={allowOverwrite}
                        onChange={(e) => setAllowOverwrite(e.target.checked)}
                      />
                      <label htmlFor="chk-overwrite">
                        Allow overwriting existing NTAG215 tag records
                      </label>
                    </div>

                    <div style={{ fontSize: '6.5px', color: '#64748b', lineHeight: '1.4' }}>
                      ℹ️ Safe NDEF text payload (~12 bytes). Only the card ID is written to the physical tag. Artwork and combat balance remain safely synced in the application database.
                    </div>

                    {/* Feedback message banner */}
                    {writeFeedback && (
                      <div className={`write-feedback-banner ${writeFeedback.type}`}>
                        <strong>{writeFeedback.type === 'success' ? '✅ WRITE SUCCESS' : '⚠️ WRITE FAILED'}: </strong>
                        {writeFeedback.message}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {isNfcSupported ? (
                        <>
                          <button
                            type="button"
                            className={`btn-write-physical ${isNfcWriting ? 'writing' : ''}`}
                            onClick={handlePhysicalWrite}
                            disabled={isNfcWriting}
                          >
                            <span>{isNfcWriting ? '⏳ WAITING FOR TAG... HOLD TO PHONE ANTENNA' : '📡 WRITE TO PHYSICAL NTAG215 TAG'}</span>
                          </button>
                          {isNfcWriting && (
                            <button
                              type="button"
                              className="pixel-btn-small btn-danger"
                              onClick={cancelNfcWrite}
                              style={{ padding: '8px', alignSelf: 'center' }}
                            >
                              ■ CANCEL WRITING OPERATION
                            </button>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: '6.5px', color: '#f59e0b', background: '#1c1505', padding: '6px', border: '1px solid #78350f' }}>
                          ⚠️ Physical NFC writes require Google Chrome on Android over HTTPS. Use the simulated write below to test on desktop!
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-write-simulated"
                        onClick={handleSimulatedWrite}
                      >
                        <span>🧪 SIMULATE WRITE (DESKTOP MODE)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ==================================== */}
                {/* SUBTAB 2: READ / SCAN NFC TAGS       */}
                {/* ==================================== */}
                {nfcLabTab === 'read' && (
                  <>
                    {/* Physical / Simulated NFC Touch Pad */}
                    <div className="nfc-pad" id="nfc-pad">
                      <div className={`pad-antenna ${isAntennaPulsing || isNfcScanning ? 'scanning' : ''}`}>
                        <div className="pad-chip">📡 TAP CARD HERE</div>
                      </div>
                      <div className="pad-status" id="pad-status-text">
                        {isNfcScanning ? 'Physical NFC Scanning Active... Tap Android Card!' : antennaStatusText}
                      </div>

                      {isNfcSupported && (
                        <div style={{ marginTop: '10px' }}>
                          <button 
                            className={`pixel-btn-small ${isNfcScanning ? 'btn-danger' : ''}`}
                            onClick={isNfcScanning ? stopNfcScan : startNfcScan}
                            style={{ padding: '6px 12px' }}
                          >
                            {isNfcScanning ? '■ STOP PHYSICAL NFC' : '▶ START PHYSICAL NFC'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Scanned Tag Result Card */}
                    {lastScannedCardData && (
                      <div className="scanned-preview-card">
                        <div className="scanned-preview-header">
                          <span className="scanned-preview-code">TAG: {lastScannedCardData.cardEntry.cardCode}</span>
                          <span style={{ fontSize: '7px', color: lastScannedCardData.isAlreadyRegistered ? '#fde047' : '#86efac' }}>
                            {lastScannedCardData.isAlreadyRegistered ? '✓ Enrolled in Collection' : '★ Newly Enrolled'}
                          </span>
                        </div>
                        <div className="scanned-preview-body">
                          <div className="scanned-preview-thumb">
                            {lastScannedCardData.artworkUrl ? (
                              <img src={lastScannedCardData.artworkUrl} alt={lastScannedCardData.speciesName} />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div className="scanned-preview-stats">
                            <div style={{ fontSize: '9px', color: '#f8fafc', fontWeight: 'bold' }}>
                              {lastScannedCardData.pokedexNumber ? `#${String(lastScannedCardData.pokedexNumber).padStart(3, '0')} ` : ''}
                              {lastScannedCardData.speciesName}
                            </div>
                            <div>Types: {lastScannedCardData.types.join(', ')}</div>
                            <div>Grade: {lastScannedCardData.cardEntry.grade || 'Standard Tag'}</div>
                            <div>Source: {lastScannedCardData.cardEntry.source}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Programmed Cards in Session */}
                    {recentProgrammedCards.length > 0 && (
                      <div className="test-cards-section">
                        <div className="section-title">PROGRAMMED NTAG215 CARDS (TEST TAP):</div>
                        <div className="cards-grid">
                          {recentProgrammedCards.map(c => (
                            <button 
                              key={c.code}
                              className="card-chip"
                              style={{ borderLeft: '6px solid var(--accent-gold)' }}
                              onClick={() => handleScanCard(c.code)}
                            >
                              <div className="chip-code">{c.code}</div>
                              <div className="chip-name">{c.name} {c.isSimulated ? '(Sim)' : '(HW)'}</div>
                              <div className="chip-tap">TAP TO SCAN</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Physical Cards Rack */}
                    <div className="test-cards-section">
                      <div className="section-title">PRESET TEST NFC CARDS (STAGE A SIMULATION):</div>
                      <div className="cards-grid">
                        <button className="card-chip card-fire" onClick={() => handleScanCard('ML-CARD-IGNI-01')}>
                          <div className="chip-code">ML-CARD-IGNI-01</div>
                          <div className="chip-name">Ignisaur (Fire)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-water" onClick={() => handleScanCard('ML-CARD-AQUA-02')}>
                          <div className="chip-code">ML-CARD-AQUA-02</div>
                          <div className="chip-name">Aquabite (Water)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-grass" onClick={() => handleScanCard('ML-CARD-FLOR-03')}>
                          <div className="chip-code">ML-CARD-FLOR-03</div>
                          <div className="chip-name">Floraslug (Grass)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-electric" onClick={() => handleScanCard('ML-CARD-VOLT-04')}>
                          <div className="chip-code">ML-CARD-VOLT-04</div>
                          <div className="chip-name">Voltkit (Electric)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                      </div>
                    </div>

                    {/* MEZASTAR Official Tags */}
                    <div className="test-cards-section">
                      <div className="section-title">POKÉMON MEZASTAR SAMPLES:</div>
                      <div className="cards-grid">
                        <button className="card-chip card-electric" onClick={() => handleScanCard('ML-MEZASTAR-001')}>
                          <div className="chip-code">ML-MEZASTAR-001</div>
                          <div className="chip-name">Pikachu (5★ Z-Move)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-fire" onClick={() => handleScanCard('MEZASTAR-01-001')}>
                          <div className="chip-code">MEZASTAR-01-001</div>
                          <div className="chip-name">Charizard (6★ Superstar)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-water" onClick={() => handleScanCard('MEZASTAR-01-003')}>
                          <div className="chip-code">MEZASTAR-01-003</div>
                          <div className="chip-name">Blastoise (6★ Superstar)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip card-grass" onClick={() => handleScanCard('ML-MEZASTAR-004')}>
                          <div className="chip-code">ML-MEZASTAR-004</div>
                          <div className="chip-name">Venusaur (6★ Superstar)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip" style={{ borderLeft: '6px solid var(--type-fighting)' }} onClick={() => handleScanCard('ML-MEZASTAR-005')}>
                          <div className="chip-code">ML-MEZASTAR-005</div>
                          <div className="chip-name">Lucario (5★ Mega)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                        <button className="card-chip" style={{ borderLeft: '6px solid var(--type-ghost)' }} onClick={() => handleScanCard('ML-MEZASTAR-006')}>
                          <div className="chip-code">ML-MEZASTAR-006</div>
                          <div className="chip-name">Gengar (4★ Star)</div>
                          <div className="chip-tap">TAP TO SCAN</div>
                        </button>
                      </div>
                    </div>

                    {/* Manual / Custom Code Input for Negative Testing */}
                    <div className="manual-input-box">
                      <label htmlFor="input-custom-nfc">TEST CUSTOM / MALFORMED CODE:</label>
                      <div className="input-row">
                        <input 
                          type="text" 
                          id="input-custom-nfc" 
                          placeholder="e.g. ML-CARD-UNKNOWN-99" 
                          autoComplete="off"
                          value={customCardInput}
                          onChange={(e) => setCustomCardInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleScanCard(customCardInput);
                              setCustomCardInput('');
                            }
                          }}
                        />
                        <button 
                          id="btn-scan-custom" 
                          className="pixel-btn-small"
                          onClick={() => {
                            handleScanCard(customCardInput);
                            setCustomCardInput('');
                          }}
                        >
                          SCAN CODE
                        </button>
                      </div>
                    </div>

                    {/* Recent Scan Attempts Log */}
                    <div className="scan-history-box">
                      <div className="section-title">SESSION SCAN LOG:</div>
                      <ul id="scan-log-list" className="log-list">
                        {scanSessionLogs.length === 0 ? (
                          <li className="log-empty">No cards scanned in this session yet.</li>
                        ) : (
                          scanSessionLogs.map((log) => (
                            <li key={log.id} className={`log-item ${log.status}`}>
                              <span>[{log.time}] {log.code}</span>
                              <span>{log.message}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </>
                )}

                {/* ==================================== */}
                {/* SUBTAB 3: SETUP & HARDWARE GUIDE     */}
                {/* ==================================== */}
                {nfcLabTab === 'guide' && (
                  <div className="guide-box">
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '8px' }}>
                      NTAG215 DIRECT NFC HARDWARE GUIDE
                    </div>
                    
                    <div className="guide-step">
                      <span className="guide-step-num">1.</span>
                      <div>
                        <strong>No 3rd-Party App Required:</strong> You no longer need the &quot;NFC Tools&quot; app. MONSTERLINK writes and reads directly via the standard Web NFC API.
                      </div>
                    </div>

                    <div className="guide-step">
                      <span className="guide-step-num">2.</span>
                      <div>
                        <strong>Device Compatibility:</strong> Physical writing and reading require an <strong>Android smartphone</strong> with NFC enabled (Samsung, Pixel, Xiaomi, etc.) running <strong>Google Chrome</strong> (v89+).
                      </div>
                    </div>

                    <div className="guide-step">
                      <span className="guide-step-num">3.</span>
                      <div>
                        <strong>Secure HTTPS Requirement:</strong> The browser only grants NFC permissions in a secure HTTPS context. The live Vercel URL has SSL enabled by default.
                      </div>
                    </div>

                    <div className="guide-step">
                      <span className="guide-step-num">4.</span>
                      <div>
                        <strong>Physical Tag Specifications:</strong> Compatible with any standard <strong>NXP NTAG215</strong> NFC tags, stickers, or coin cards (504 bytes Type 2 tag).
                      </div>
                    </div>

                    <div className="guide-step">
                      <span className="guide-step-num">5.</span>
                      <div>
                        <strong>How to Program:</strong> In the <em>WRITE NTAG215</em> tab, search or select any Pokémon, click <em>WRITE TO PHYSICAL NTAG215 TAG</em>, and hold your physical tag against the back of your phone near the camera until you hear the confirmation sound.
                      </div>
                    </div>

                    <div className="guide-step">
                      <span className="guide-step-num">6.</span>
                      <div>
                        <strong>Browser Limitations:</strong> Apple iOS (Safari &amp; Chrome on iOS) does not support the Web NFC API due to Apple WebKit restrictions. Desktop browsers do not have built-in NFC antennas; use <strong>Simulation Mode</strong> when testing on computers.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ========================================== */}
            {/* VIEW 3: CREATURE COLLECTION                */}
            {/* ========================================== */}
            <section id="view-collection" className={`view ${currentView === 'view-collection' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" onClick={() => navigateTo('view-menu')}>◀ MENU</button>
                <h2>COLLECTION</h2>
                <button className="header-action-btn" onClick={() => navigateTo('view-scan')}>+ SCAN</button>
              </div>

              <div className="collection-summary">
                <span>REGISTERED CREATURES: <strong id="coll-count-text">{collection.length}</strong></span>
              </div>

              <div className="collection-scroll" id="collection-grid">
                {collection.length === 0 ? (
                  <div className="empty-collection-state">
                    <p>No creatures enrolled yet.<br />Tap 'SCAN NFC CARD' to register cards.</p>
                    <button className="pixel-btn btn-primary" onClick={() => navigateTo('view-scan')}>
                      GO TO SCANNER
                    </button>
                  </div>
                ) : (
                  collection.map((creature) => {
                    const species = SPECIES_CATALOG[creature.speciesId];
                    const mezastar = creature.nfcCardCode ? getMezastarTagByNfcCode(creature.nfcCardCode) : null;
                    return (
                      <div 
                        key={creature.instanceId} 
                        className="creature-card-row"
                        onClick={() => openInspect(creature)}
                      >
                        <div className="card-sprite-thumb">
                          {renderCreatureVisual(creature.speciesId, '100%')}
                        </div>
                        <div className="card-info">
                          <div className="card-title-row">
                            <span className="card-name">{creature.nickname}</span>
                            <span className="card-lvl">Lv.{creature.level}</span>
                            <span className={`type-pill type-${species?.type || 'Normal'}`}>
                              {species?.type || 'NORMAL'}
                            </span>
                            {mezastar && (
                              <span style={{ fontSize: '6px', color: '#f39c12', border: '1px solid #f39c12', padding: '1px 4px' }}>
                                {mezastar.grade}
                              </span>
                            )}
                          </div>
                          <div className="card-meta-nfc">
                            CARD: {creature.nfcCardCode || 'Digital Sample'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ========================================== */}
            {/* VIEW 4: TURN-BASED BATTLE ARENA            */}
            {/* ========================================== */}
            <section id="view-battle" className={`view ${currentView === 'view-battle' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" id="btn-battle-quit" onClick={handleBattleForfeit}>◀ FORFEIT</button>
                <h2>BATTLE ARENA</h2>
                <div className="hdr-spacer"></div>
              </div>

              {/* Pre-Battle Creature Picker Overlay */}
              {!activeEngine && (
                <div id="battle-pre-modal" className="battle-setup-view">
                  <div className="setup-box">
                    <h3>CHOOSE YOUR CREATURE</h3>
                    <p className="setup-sub">Select one of your registered creatures to enter combat:</p>
                    <div id="battle-roster-select" className="roster-grid">
                      {collection.length === 0 ? (
                        <div className="empty-collection-state" style={{ padding: '20px 0' }}>
                          <p>You have no creatures! Scan or seed creatures first.</p>
                          <button className="pixel-btn btn-primary" onClick={() => navigateTo('view-scan')}>
                            SCAN CARDS
                          </button>
                        </div>
                      ) : (
                        collection.map((creature) => {
                          const species = SPECIES_CATALOG[creature.speciesId];
                          const isSelected = selectedRosterId === creature.instanceId;
                          return (
                            <div 
                              key={creature.instanceId} 
                              className={`roster-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                Sound.playClick();
                                setSelectedRosterId(creature.instanceId);
                              }}
                            >
                              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {renderCreatureVisual(creature.speciesId, '100%')}
                              </div>
                              <div>
                                <div><strong>{creature.nickname}</strong> (Lv.{creature.level})</div>
                                <div style={{ fontSize: '6px', color: '#8da2c0' }}>HP: {creature.currentHp}/{creature.maxHp} • {species?.type}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="ai-opponent-select">
                      <label>OPPONENT CREATURE:</label>
                      <select 
                        id="select-ai-opponent"
                        value={selectedOpponentSpecies}
                        onChange={(e) => setSelectedOpponentSpecies(e.target.value)}
                      >
                        <option value="species_aquabite">Aquabite (Water / Defensive)</option>
                        <option value="species_ignisaur">Ignisaur (Fire / Aggressive)</option>
                        <option value="species_floraslug">Floraslug (Grass / High HP)</option>
                        <option value="species_voltkit">Voltkit (Electric / High Speed)</option>
                        <option value="species_pikachu">Pikachu (Electric / Fast)</option>
                        <option value="species_charizard">Charizard (Fire / Flying)</option>
                        <option value="species_blastoise">Blastoise (Water / Heavy Defense)</option>
                        <option value="species_venusaur">Venusaur (Grass / Tank)</option>
                        <option value="species_lucario">Lucario (Normal/Fighting / High ATK)</option>
                        <option value="species_gengar">Gengar (Normal/Ghost / High SPD)</option>
                      </select>
                    </div>

                    <button 
                      id="btn-start-battle" 
                      className="pixel-btn btn-battle" 
                      disabled={collection.length === 0 || !selectedRosterId}
                      onClick={handleStartBattle}
                    >
                      START BATTLE
                    </button>
                  </div>
                </div>
              )}

              {/* Active Battle Ground */}
              {activeEngine && (
                <div id="battle-active-ground" className="battle-ground">
                  
                  {/* Opponent Platform (Top Right) */}
                  <div className="combat-unit opponent-unit">
                    <div className="hud-box">
                      <div className="hud-top">
                        <span className="unit-name" id="opp-name">{activeEngine.opponent.nickname}</span>
                        <span className="unit-lvl" id="opp-lvl">Lv.{activeEngine.opponent.level}</span>
                      </div>
                      <div className="hp-bar-outer">
                        <span className="hp-label">HP</span>
                        <div className="hp-bar-bg">
                          <div 
                            className={`hp-bar-fill ${
                              (activeEngine.opponent.currentHp / activeEngine.opponent.maxHp) < 0.25 ? 'danger' :
                              (activeEngine.opponent.currentHp / activeEngine.opponent.maxHp) < 0.5 ? 'warn' : ''
                            }`} 
                            id="opp-hp-bar" 
                            style={{ width: `${Math.max(0, (activeEngine.opponent.currentHp / activeEngine.opponent.maxHp) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="hp-numbers">
                        {activeEngine.opponent.currentHp} / {activeEngine.opponent.maxHp}
                      </div>
                    </div>
                    <div className="sprite-platform opp-platform">
                      <div 
                        className={`sprite-holder ${oppAnimShake ? 'anim-shake' : ''} ${oppAnimFaint ? 'anim-faint' : ''}`} 
                        id="opp-sprite-holder"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {renderCreatureVisual(activeEngine.opponent.speciesId, '100%')}
                      </div>
                      <div className="platform-shadow"></div>
                    </div>
                  </div>

                  {/* Player Platform (Bottom Left) */}
                  <div className="combat-unit player-unit">
                    <div className="sprite-platform player-platform">
                      <div 
                        className={`sprite-holder ${playerAnimShake ? 'anim-shake' : ''} ${playerAnimFaint ? 'anim-faint' : ''}`} 
                        id="player-sprite-holder"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {renderCreatureVisual(activeEngine.player.speciesId, '100%')}
                      </div>
                      <div className="platform-shadow"></div>
                    </div>
                    <div className="hud-box">
                      <div className="hud-top">
                        <span className="unit-name" id="player-name">{activeEngine.player.nickname}</span>
                        <span className="unit-lvl" id="player-lvl">Lv.{activeEngine.player.level}</span>
                      </div>
                      <div className="hp-bar-outer">
                        <span className="hp-label">HP</span>
                        <div className="hp-bar-bg">
                          <div 
                            className={`hp-bar-fill ${
                              (activeEngine.player.currentHp / activeEngine.player.maxHp) < 0.25 ? 'danger' :
                              (activeEngine.player.currentHp / activeEngine.player.maxHp) < 0.5 ? 'warn' : ''
                            }`} 
                            id="player-hp-bar" 
                            style={{ width: `${Math.max(0, (activeEngine.player.currentHp / activeEngine.player.maxHp) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="hp-numbers" id="player-hp-numbers">
                        {activeEngine.player.currentHp} / {activeEngine.player.maxHp}
                      </div>
                    </div>
                  </div>

                  {/* Combat Narration Dialog & Move Command Box */}
                  <div className="battle-controls">
                    <div className="battle-dialogue" id="battle-dialogue-text" ref={battleDialogueRef}>
                      {battleDialogue}
                    </div>

                    <div className="moves-grid" id="battle-moves-grid">
                      {activeEngine.player.knownMoveIds.map((moveId) => {
                        const move = MOVES[moveId];
                        return (
                          <button
                            key={moveId}
                            className="move-btn"
                            disabled={activeEngine.isBattleOver}
                            onClick={() => handleBattleMove(moveId)}
                          >
                            <div className="move-btn-top">
                              <span className="move-btn-name">{move ? move.name : moveId}</span>
                              <span className="move-btn-pwr">PWR {move ? move.power : 20}</span>
                            </div>
                            <span className={`type-pill type-${move ? move.type : 'Normal'}`}>
                              {move ? move.type : 'NORMAL'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Battle Outcome Modal */}
              {battleResultModal && (
                <div id="battle-result-modal" className="modal-overlay">
                  <div className="modal-box result-box">
                    <div className="result-title" id="result-title">
                      {battleResultModal.victory ? 'VICTORY!' : 'DEFEAT!'}
                    </div>
                    <div className="result-subtitle" id="result-subtitle">
                      {battleResultModal.victory ? 'You won the battle!' : 'Your creature was defeated!'}
                    </div>
                    <div className="result-stats" id="result-stats">
                      <div>Winner: {battleResultModal.winnerName}</div>
                      <div>Turns Elapsed: {battleResultModal.turns}</div>
                      <div>Battle record saved to history.</div>
                    </div>
                    <div className="modal-actions">
                      <button 
                        id="btn-result-rematch" 
                        className="pixel-btn btn-primary"
                        onClick={handleStartBattle}
                      >
                        BATTLE AGAIN
                      </button>
                      <button 
                        id="btn-result-menu" 
                        className="pixel-btn" 
                        onClick={() => {
                          setActiveEngine(null);
                          setBattleResultModal(null);
                          navigateTo('view-menu');
                        }}
                      >
                        RETURN TO MENU
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ========================================== */}
            {/* VIEW 5: BATTLE RECORDS                     */}
            {/* ========================================== */}
            <section id="view-history" className={`view ${currentView === 'view-history' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" onClick={() => navigateTo('view-menu')}>◀ MENU</button>
                <h2>BATTLE RECORDS</h2>
                <button className="header-action-btn danger" id="btn-clear-history" onClick={handleClearHistory}>
                  CLEAR
                </button>
              </div>

              <div className="history-scroll" id="history-list">
                {history.length === 0 ? (
                  <div className="empty-collection-state">
                    <p>No battle records found.<br />Enter Battle Arena to record combat logs!</p>
                  </div>
                ) : (
                  history.slice().reverse().map((rec) => (
                    <div key={rec.recordId} className="history-card">
                      <div className="history-card-header">
                        <span>MATCH #{rec.recordId.slice(-4)}</span>
                        <span className={`history-outcome ${rec.outcome}`}>
                          {rec.outcome}
                        </span>
                      </div>
                      <div className="history-matchup">
                        {rec.playerCreature.nickname} (Lv.{rec.playerCreature.level}) vs {rec.opponentCreature.nickname} (Lv.{rec.opponentCreature.level})
                      </div>
                      <div className="history-meta">
                        {new Date(rec.timestampUtc).toLocaleString()} • {rec.turnCount} Turns
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ========================================== */}
            {/* VIEW 6: SETTINGS & PERSISTENCE INSPECTOR   */}
            {/* ========================================== */}
            <section id="view-settings" className={`view ${currentView === 'view-settings' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" onClick={() => navigateTo('view-menu')}>◀ MENU</button>
                <h2>SETTINGS & DATA</h2>
                <div className="hdr-spacer"></div>
              </div>

              <div className="settings-content">
                <div className="setting-group">
                  <h3>AUDIO & DISPLAY</h3>
                  <div className="setting-row">
                    <span>8-Bit Synthesizer Audio</span>
                    <button 
                      id="setting-sound-btn" 
                      className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
                      onClick={() => {
                        const res = Sound.toggle();
                        setSoundEnabled(res);
                      }}
                    >
                      {soundEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <div className="setting-row">
                    <span>CRT Scanlines Effect</span>
                    <button 
                      id="setting-crt-btn" 
                      className={`toggle-btn ${crtEnabled ? 'active' : ''}`}
                      onClick={() => {
                        Sound.playClick();
                        setCrtEnabled(prev => !prev);
                        document.body.classList.toggle('crt-enabled', !crtEnabled);
                      }}
                    >
                      {crtEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <h3>LOCAL DATA PERSISTENCE</h3>
                  <p className="setting-note">Data saved to localStorage under schema v1 (matches C# JsonStorageService)</p>
                  <div className="data-actions">
                    <button id="btn-inspect-json" className="pixel-btn" onClick={handleInspectJson}>
                      INSPECT RAW JSON
                    </button>
                    <button id="btn-export-json" className="pixel-btn" onClick={handleDownloadBackup}>
                      DOWNLOAD BACKUP
                    </button>
                    <button id="btn-reset-data" className="pixel-btn btn-danger" onClick={handleWipeData}>
                      WIPE ALL STORAGE
                    </button>
                  </div>
                </div>

                {/* JSON Payload Viewer Box */}
                {showJsonDump && (
                  <div id="json-viewer-box" className="json-box">
                    <div className="json-header">
                      <strong>PERSISTENT STORAGE DUMP:</strong>
                      <button id="btn-close-json" className="close-x" onClick={() => setShowJsonDump(false)}>✕</button>
                    </div>
                    <pre id="json-pre-content">{jsonDumpContent}</pre>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================== */}
            {/* VIEW 6: MONSTER LIST (DATABASE GRID MATCHING ART)    */}
            {/* ==================================================== */}
            <section id="view-monsterlist" className={`view ${currentView === 'view-monsterlist' ? 'active' : ''}`}>
              <div className="monster-list-container">
                {/* Topbar matching attached image */}
                <div className="monster-list-topbar">
                  <div className="ml-topbar-left">
                    <span className="pokeball-icon">🔴</span>
                    <span>MONSTER LINK</span>
                    <span style={{ color: '#64748b' }}>/</span>
                    <span style={{ color: '#ffffff' }}>MONSTER LIST</span>
                    <span style={{ color: '#64748b' }}>/</span>
                    <span style={{ color: '#94a3b8' }}>PROTOTYPE 0.5</span>
                  </div>
                  <div className="ml-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#38bdf8', fontSize: '6.5px', letterSpacing: '1px', fontWeight: 'bold' }}>
                      COLLECT . TRAIN . EVOLVE ▰▰
                    </span>
                    <button className="back-btn" onClick={() => navigateTo('view-menu')} style={{ padding: '2px 8px' }}>
                      ◀ MENU
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="monster-list-controls">
                  <input
                    type="text"
                    className="monster-search-input"
                    placeholder="Search 50 monsters by name, #dex, or type..."
                    value={monsterListSearch}
                    onChange={(e) => setMonsterListSearch(e.target.value)}
                  />
                  <div className="monster-type-filter-row">
                    {['ALL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'GHOST', 'ROCK', 'ICE', 'FLYING', 'FAIRY', 'STEEL', 'GROUND', 'DARK', 'DRAGON', 'POISON', 'NORMAL'].map(t => (
                      <button
                        key={t}
                        className={`monster-filter-pill ${monsterListTypeFilter === t ? 'active' : ''}`}
                        onClick={() => { Sound.playClick(); setMonsterListTypeFilter(t); }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monster Grid matching uploaded screenshot */}
                <div className="monster-grid-scroll">
                  {POKEMON_DATABASE
                    .filter(p => {
                      if (monsterListTypeFilter !== 'ALL') {
                        if (!p.types.map(t => t.toUpperCase()).includes(monsterListTypeFilter)) return false;
                      }
                      if (!monsterListSearch.trim()) return true;
                      const q = monsterListSearch.trim().toLowerCase();
                      const num = parseInt(q.replace('#', ''), 10);
                      if (!isNaN(num) && p.pokedexNumber === num) return true;
                      return p.name.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q) || p.types.some(t => t.toLowerCase().includes(q));
                    })
                    .map(p => {
                      const primaryType = (p.types[0] || 'normal').toLowerCase();
                      const primaryTypeCap = primaryType.charAt(0).toUpperCase() + primaryType.slice(1);
                      return (
                        <div
                          key={p.pokedexNumber}
                          className="monster-grid-card"
                          onClick={() => openMonsterModal(p)}
                          title={`Click to view ${p.displayName} & write to NFC`}
                        >
                          <div className="mg-header">
                            {String(p.pokedexNumber).padStart(3, '0')} {p.displayName.toUpperCase().slice(0, 8)}
                          </div>
                          <div className="mg-sprite-box">
                            <img
                              src={p.sprites.frontDefault || getPokemonArtworkUrl(p.pokedexNumber)}
                              alt={p.name}
                              loading="lazy"
                            />
                          </div>
                          <div className={`mg-type-pill type-pill type-${primaryTypeCap}`}>
                            {primaryType.toUpperCase()}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Footer Bar matching attached image */}
                <div className="monster-list-bottombar">
                  <span>MONSTER LINK // 050 CREATURES</span>
                  <span>VERSION 0.5 // TAP CARD TO WRITE NFC</span>
                </div>
              </div>
            </section>

            {/* ========================================== */}
            {/* CREATURE DETAILS MODAL (COLLECTION)       */}
            {/* ========================================== */}
            {inspectCreature && (
              <div id="creature-detail-modal" className="modal-overlay">
                <div className="modal-box detail-modal-box">
                  <div className="modal-header">
                    <span 
                      className="detail-type-badge" 
                      id="modal-type-badge"
                      style={{ background: `var(--type-${SPECIES_CATALOG[inspectCreature.instance.speciesId]?.type.toLowerCase() || 'normal'})` }}
                    >
                      {SPECIES_CATALOG[inspectCreature.instance.speciesId]?.type.toUpperCase() || 'NORMAL'}
                    </span>
                    <h3 id="modal-creature-name">{inspectCreature.instance.nickname}</h3>
                    <button className="close-x" id="btn-close-detail" onClick={() => setInspectCreature(null)}>✕</button>
                  </div>
                  <div className="detail-body">
                    <div className="detail-sprite-box" id="modal-sprite-box">
                      {renderCreatureVisual(inspectCreature.instance.speciesId, '100%')}
                    </div>
                    <div className="detail-info">
                      <div className="info-row">
                        <span>Species ID:</span>
                        <strong id="modal-species-id">{inspectCreature.instance.speciesId}</strong>
                      </div>
                      <div className="info-row">
                        <span>Instance ID:</span>
                        <code id="modal-instance-id">{inspectCreature.instance.instanceId.slice(0, 10)}...</code>
                      </div>
                      <div className="info-row">
                        <span>Assigned NFC Card:</span>
                        <span className="nfc-badge" id="modal-nfc-code">
                          {inspectCreature.instance.nfcCardCode || 'None'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span>Level:</span>
                        <strong id="modal-level">Lv. {inspectCreature.instance.level}</strong>
                      </div>
                    </div>
                  </div>

                  {/* PokéAPI Reference Data if present */}
                  {inspectCreature.pokeApiRef && (
                    <div style={{ background: '#090d14', border: '2px solid #233045', padding: '8px 10px', marginBottom: '10px', fontSize: '7px' }}>
                      <div style={{ color: '#f39c12', marginBottom: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>POKÉAPI NATIONAL DEX #{inspectCreature.pokeApiRef.id}</span>
                        <span>{getPokemonByPokedexNumber(inspectCreature.pokeApiRef.id)?.genus || 'Pokémon'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {inspectCreature.pokeApiRef.sprites.officialArtwork && (
                          <img 
                            src={inspectCreature.pokeApiRef.sprites.officialArtwork} 
                            alt={inspectCreature.pokeApiRef.name} 
                            style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                          />
                        )}
                        <div style={{ flex: 1, lineHeight: '1.6' }}>
                          <div style={{ color: '#fff', fontWeight: 'bold' }}>{inspectCreature.pokeApiRef.displayName}</div>
                          <div style={{ color: '#8da2c0' }}>
                            Height: {inspectCreature.pokeApiRef.height / 10}m | Weight: {inspectCreature.pokeApiRef.weight / 10}kg
                          </div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                            {inspectCreature.pokeApiRef.types.map(t => (
                              <span key={t} className={`type-pill type-${t.charAt(0).toUpperCase() + t.slice(1)}`}>
                                {t.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {getPokemonByPokedexNumber(inspectCreature.pokeApiRef.id)?.description && (
                        <div style={{ marginTop: '6px', color: '#cad8ee', fontStyle: 'italic', fontSize: '6px', borderTop: '1px solid #1a2233', paddingTop: '4px' }}>
                          "{getPokemonByPokedexNumber(inspectCreature.pokeApiRef.id)?.description}"
                        </div>
                      )}
                    </div>
                  )}

                  <div className="detail-stats-section">
                    <h4>COMBAT STATS</h4>
                    <div className="stat-bars">
                      <div className="stat-item">
                        <span className="stat-lbl">HP:</span>
                        <span className="stat-val" id="modal-stat-hp">{inspectCreature.instance.maxHp}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" id="modal-bar-hp" style={{ width: `${Math.min(100, (inspectCreature.instance.maxHp / 50) * 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-lbl">ATK:</span>
                        <span className="stat-val" id="modal-stat-atk">{inspectCreature.instance.attack}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" id="modal-bar-atk" style={{ width: `${Math.min(100, (inspectCreature.instance.attack / 30) * 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-lbl">DEF:</span>
                        <span className="stat-val" id="modal-stat-def">{inspectCreature.instance.defense}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" id="modal-bar-def" style={{ width: `${Math.min(100, (inspectCreature.instance.defense / 30) * 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <span className="stat-lbl">SPD:</span>
                        <span className="stat-val" id="modal-stat-spd">{inspectCreature.instance.speed}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar-fill" id="modal-bar-spd" style={{ width: `${Math.min(100, (inspectCreature.instance.speed / 30) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-moves-section">
                    <h4>KNOWN MOVES</h4>
                    <div className="detail-moves-list" id="modal-moves-list">
                      {inspectCreature.instance.knownMoveIds.map((mId) => {
                        const m = MOVES[mId];
                        return (
                          <div key={mId} className="detail-move-pill">
                            <span>{m ? m.name : mId}</span>
                            <span style={{ color: '#f39c12' }}>PWR {m ? m.power : 20}</span>
                            <span className={`type-pill type-${m ? m.type : 'Normal'}`}>
                              {m ? m.type : 'NORMAL'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* POKÉMON DETAIL & NFC WRITER VERIFIER MODAL           */}
            {/* ==================================================== */}
            {selectedMonsterForModal && (
              <div className="pkmn-detail-modal-overlay" onClick={closeMonsterModal}>
                <div className="pkmn-detail-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="pkmn-modal-header">
                    <span className="pkmn-modal-title">
                      #{String(selectedMonsterForModal.pokedexNumber).padStart(3, '0')} {selectedMonsterForModal.displayName.toUpperCase()}
                    </span>
                    <button className="pkmn-modal-close-btn" onClick={closeMonsterModal}>✕</button>
                  </div>

                  <div className="pkmn-modal-body">
                    {/* Hero Display */}
                    <div className="pkmn-modal-hero">
                      <div className="pkmn-modal-artwork-box">
                        <img 
                          src={getPokemonArtworkUrl(selectedMonsterForModal.pokedexNumber)} 
                          alt={selectedMonsterForModal.name} 
                        />
                      </div>
                      <div className="pkmn-modal-hero-info">
                        <div className="pm-name">
                          {selectedMonsterForModal.displayName}
                        </div>
                        <div className="pm-genus">
                          {selectedMonsterForModal.genus || 'Species Tag'}
                        </div>
                        <div className="pm-types">
                          {selectedMonsterForModal.types.map(t => (
                            <span key={t} className={`type-pill type-${t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()}`}>
                              {t.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <div className="pm-meta-text">
                          Height: {(selectedMonsterForModal.height / 10).toFixed(1)}m • Weight: {(selectedMonsterForModal.weight / 10).toFixed(1)}kg
                        </div>
                        {selectedMonsterForModal.description && (
                          <div className="pm-meta-text" style={{ fontStyle: 'italic', marginTop: '4px' }}>
                            &ldquo;{selectedMonsterForModal.description.replace(/\n|\f/g, ' ')}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Base Stats Bars */}
                    <div className="pkmn-stats-grid">
                      <div style={{ fontSize: '7px', color: '#f6e05e', marginBottom: '2px', fontWeight: 'bold' }}>
                        BASE COMBAT STATS:
                      </div>
                      {[
                        { label: 'HP', val: selectedMonsterForModal.baseStats.hp, color: '#22c55e' },
                        { label: 'ATTACK', val: selectedMonsterForModal.baseStats.attack, color: '#ef4444' },
                        { label: 'DEFENSE', val: selectedMonsterForModal.baseStats.defense, color: '#f59e0b' },
                        { label: 'SP. ATK', val: selectedMonsterForModal.baseStats.specialAttack, color: '#38bdf8' },
                        { label: 'SP. DEF', val: selectedMonsterForModal.baseStats.specialDefense, color: '#a855f7' },
                        { label: 'SPEED', val: selectedMonsterForModal.baseStats.speed, color: '#ec4899' },
                      ].map(s => (
                        <div key={s.label} className="stat-row">
                          <span className="stat-label">{s.label}:</span>
                          <span className="stat-value">{s.val}</span>
                          <div className="stat-track">
                            <div className="stat-fill" style={{ width: `${Math.min(100, (s.val / 160) * 100)}%`, background: s.color }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* NFC Writer & Verifier Section */}
                    <div className="pkmn-nfc-writer-panel">
                      <div className="nfc-panel-header">
                        <span>NFC PROGRAMMER &amp; VERIFIER</span>
                        <span className="nfc-code-badge">
                          CARD ID: {formatCardIdentifier(selectedMonsterForModal.pokedexNumber)}
                        </span>
                      </div>

                      <div className="overwrite-toggle-box">
                        <input
                          type="checkbox"
                          id="chk-modal-overwrite"
                          checked={modalAllowOverwrite}
                          onChange={(e) => setModalAllowOverwrite(e.target.checked)}
                        />
                        <label htmlFor="chk-modal-overwrite">
                          Allow overwriting existing NTAG215 tag
                        </label>
                      </div>

                      {/* Verification Checklist */}
                      {modalVerificationSteps && (
                        <div className="nfc-verify-checklist">
                          <div style={{ fontSize: '6.5px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '2px' }}>
                            VERIFICATION SEQUENCE:
                          </div>
                          {modalVerificationSteps.map((st, idx) => (
                            <div key={st.step} className={`verify-step-item ${st.status}`}>
                              <span>
                                {st.status === 'success' ? '✅' : st.status === 'active' ? '⏳' : st.status === 'error' ? '❌' : '○'}
                              </span>
                              <span>
                                <strong>Step {idx + 1}:</strong> {st.label}
                                {st.detail ? ` (${st.detail})` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Write Result Feedback */}
                      {modalWriteResult && (
                        <div className={`write-feedback-banner ${modalWriteResult.success ? 'success' : 'error'}`}>
                          <strong>{modalWriteResult.success ? '✅ WRITE VERIFIED' : '❌ WRITE FAILED'}: </strong>
                          {modalWriteResult.message}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {isNfcSupported ? (
                          <button
                            type="button"
                            className={`btn-write-and-verify ${modalIsWriting ? 'active' : ''}`}
                            onClick={() => handleModalWriteAndVerify(selectedMonsterForModal)}
                            disabled={modalIsWriting}
                          >
                            <span>
                              {modalIsWriting 
                                ? '⏳ HOLD NTAG215 TAG TO PHONE ANTENNA...' 
                                : `📡 WRITE & VERIFY NFC (NTAG215)`}
                            </span>
                          </button>
                        ) : (
                          <div style={{ fontSize: '6.5px', color: '#f59e0b', background: '#1c1505', padding: '6px', border: '1px solid #78350f' }}>
                            ⚠️ Physical NFC requires Android Chrome over HTTPS. You can test the write &amp; verify sequence with Desktop Simulation below!
                          </div>
                        )}

                        <button
                          type="button"
                          className="btn-write-simulated"
                          onClick={() => handleModalWriteAndVerify(selectedMonsterForModal)}
                          disabled={modalIsWriting}
                        >
                          <span>🧪 SIMULATE WRITE &amp; VERIFY (DESKTOP)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div> {/* /screen */}
        </div> {/* /phone-frame */}
      </main>
    </>
  );
}
