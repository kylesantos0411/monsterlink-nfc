'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HybridStorage } from '@/lib/storage/hybrid-storage';
import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { CARD_REGISTRY, SPECIES_CATALOG, MOVES_CATALOG as MOVES, createCreatureInstance } from '@/lib/data/catalog';
import { MEZASTAR_CATALOG, getMezastarTagByNfcCode } from '@/lib/data/mezastar-catalog';
import { fetchPokemonReference, PokeApiReferenceData } from '@/lib/pokeapi/client';
import { BattleEngine } from '@/lib/battle/battle-engine';
import { createBattleRecord } from '@/lib/battle/record-factory';
import { useWebNfc } from '@/lib/nfc/use-web-nfc';
import { PIXEL_SPRITES } from '@/lib/data/pixel-sprites';
import { Sound } from '@/lib/sound/sound-controller';

interface ScanLogEntry {
  id: string;
  code: string;
  time: string;
  status: 'success' | 'duplicate' | 'error';
  message: string;
}

export default function HomePage() {
  // Navigation View: view-menu, view-scan, view-collection, view-battle, view-history, view-settings
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
    statusMessage: nfcStatus,
    startScanning: startNfcScan,
    stopScanning: stopNfcScan,
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
    showToast('Demo creatures (Ignisaur & Aquabite) added!', 'success');
  }

  // NFC Card Scan Logic
  async function handleScanCard(rawCode: string) {
    const code = rawCode.trim();
    if (!code) return;

    // Trigger visual antenna pulse
    setIsAntennaPulsing(true);
    setAntennaStatusText(`Scanning card ${code}...`);
    setTimeout(() => setIsAntennaPulsing(false), 800);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // 1. Duplicate check
    const isRegistered = await HybridStorage.isCardRegistered(code);
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
      showToast(`Rejected: Card [${code}] already registered!`, 'error');
      return;
    }

    // 2. Registry match
    const card = CARD_REGISTRY[code];
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
      showToast(`Invalid Card: [${code}] not found in registry`, 'error');
      return;
    }

    // 3. Register monster
    const cleanNick = card.name.split(' (')[0].replace(' Tag', '');
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
                  <span className="btn-label">SCAN NFC CARD</span>
                  <span className="btn-sub">Add creature with card</span>
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
            {/* VIEW 2: NFC SCANNER SIMULATOR (STAGE A)    */}
            {/* ========================================== */}
            <section id="view-scan" className={`view ${currentView === 'view-scan' ? 'active' : ''}`}>
              <div className="view-header">
                <button className="back-btn" onClick={() => navigateTo('view-menu')}>◀ MENU</button>
                <h2>NFC CARD SCANNER</h2>
                <div className="hdr-spacer"></div>
              </div>

              <div className="scan-container">
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

                {/* Test Physical Cards Rack */}
                <div className="test-cards-section">
                  <div className="section-title">TEST NFC CARDS (STAGE A SIMULATION):</div>
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
                    <button className="card-chip card-fire" onClick={() => handleScanCard('MEZASTAR-01-001')}>
                      <div className="chip-code">MEZASTAR-01-001</div>
                      <div className="chip-name">Charizard (6★ Superstar)</div>
                      <div className="chip-tap">TAP TO SCAN</div>
                    </button>
                    <button className="card-chip card-water" onClick={() => handleScanCard('MEZASTAR-01-003')}>
                      <div className="chip-code">MEZASTAR-01-003</div>
                      <div className="chip-name">Blastoise (5★ Star)</div>
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
                        <div 
                          className="card-sprite-thumb"
                          dangerouslySetInnerHTML={{ __html: getSpriteSvg(species?.spriteKey) }}
                        />
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
                              <div 
                                style={{ width: '32px', height: '32px' }}
                                dangerouslySetInnerHTML={{ __html: getSpriteSvg(species?.spriteKey) }}
                              />
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
                        dangerouslySetInnerHTML={{ __html: getSpriteSvg(SPECIES_CATALOG[activeEngine.opponent.speciesId]?.spriteKey) }}
                      />
                      <div className="platform-shadow"></div>
                    </div>
                  </div>

                  {/* Player Platform (Bottom Left) */}
                  <div className="combat-unit player-unit">
                    <div className="sprite-platform player-platform">
                      <div 
                        className={`sprite-holder ${playerAnimShake ? 'anim-shake' : ''} ${playerAnimFaint ? 'anim-faint' : ''}`} 
                        id="player-sprite-holder"
                        dangerouslySetInnerHTML={{ __html: getSpriteSvg(SPECIES_CATALOG[activeEngine.player.speciesId]?.spriteKey) }}
                      />
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
                    <div 
                      className="detail-sprite-box" 
                      id="modal-sprite-box"
                      dangerouslySetInnerHTML={{ __html: getSpriteSvg(SPECIES_CATALOG[inspectCreature.instance.speciesId]?.spriteKey) }}
                    />
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
                    <div style={{ background: '#090d14', border: '1px solid #233045', padding: '6px 8px', marginBottom: '10px', fontSize: '7px' }}>
                      <div style={{ color: '#f39c12', marginBottom: '4px', fontWeight: 'bold' }}>POKÉAPI SPECIES REFERENCE:</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {inspectCreature.pokeApiRef.sprites.officialArtwork && (
                          <img 
                            src={inspectCreature.pokeApiRef.sprites.officialArtwork} 
                            alt={inspectCreature.pokeApiRef.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          />
                        )}
                        <div>
                          <div>Name: {inspectCreature.pokeApiRef.name.toUpperCase()}</div>
                          <div>Height: {inspectCreature.pokeApiRef.height / 10}m | Weight: {inspectCreature.pokeApiRef.weight / 10}kg</div>
                          <div>Types: {inspectCreature.pokeApiRef.types.join(' / ').toUpperCase()}</div>
                        </div>
                      </div>
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

          </div> {/* /screen */}
        </div> {/* /phone-frame */}
      </main>
    </>
  );
}
