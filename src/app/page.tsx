'use client';

import React, { useState, useEffect } from 'react';
import { HybridStorage } from '@/lib/storage/hybrid-storage';
import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { CARD_REGISTRY, SPECIES_CATALOG, createCreatureInstance } from '@/lib/data/catalog';
import { MEZASTAR_CATALOG, getMezastarTagByNfcCode } from '@/lib/data/mezastar-catalog';
import { fetchPokemonReference, PokeApiReferenceData } from '@/lib/pokeapi/client';
import { BattleEngine } from '@/lib/battle/battle-engine';
import { createBattleRecord } from '@/lib/battle/record-factory';
import { useWebNfc } from '@/lib/nfc/use-web-nfc';
import { PIXEL_SPRITES } from '@/lib/data/pixel-sprites';
import { 
  Radio, 
  Gamepad2, 
  BookOpen, 
  History, 
  Sparkles, 
  Shield, 
  Swords, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  X,
  Play,
  Square,
  ArrowLeft
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'scan' | 'collection' | 'battle' | 'history'>('menu');
  const [collection, setCollection] = useState<CreatureInstance[]>([]);
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [inspectCreature, setInspectCreature] = useState<{
    instance: CreatureInstance;
    pokeApiRef: PokeApiReferenceData | null;
  } | null>(null);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);

  // Web NFC Hook
  const {
    isSupported: isNfcSupported,
    isScanning: isNfcScanning,
    statusMessage: nfcStatus,
    errorMessage: nfcError,
    startScanning: startNfcScan,
    stopScanning: stopNfcScan,
  } = useWebNfc({
    onTagRead: (tagCode) => handleScan(tagCode),
    onError: (err) => setScanMessage({ text: `NFC Error: ${err.message}`, type: 'error' }),
  });

  // Battle State
  const [activeEngine, setActiveEngine] = useState<BattleEngine | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const coll = await HybridStorage.getCollection();
    const hist = await HybridStorage.getBattleHistory();
    setCollection(coll);
    setHistory(hist);
  }

  async function handleScan(cardCode: string) {
    const alreadyRegistered = await HybridStorage.isCardRegistered(cardCode);
    if (alreadyRegistered) {
      setScanMessage({ text: `Rejected: Tag "${cardCode}" is already registered in your collection!`, type: 'error' });
      return;
    }

    const card = CARD_REGISTRY[cardCode];
    if (!card) {
      setScanMessage({ text: `Unknown: Tag "${cardCode}" is not in the prototype or MEZASTAR registry.`, type: 'error' });
      return;
    }

    const newMonster = createCreatureInstance(card.speciesId, cardCode, card.name.split(' (')[0].replace(' Tag', ''), 5);
    await HybridStorage.addCreature(newMonster);
    await HybridStorage.registerCard(cardCode, newMonster.instanceId, card.speciesId);
    await refreshData();
    setScanMessage({ text: `Enrolled: ${newMonster.nickname} (Level ${newMonster.level} • ${card.grade || 'Common'}) registered!`, type: 'success' });
  }

  async function handleInspect(creature: CreatureInstance) {
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

  function startBattle(playerMonster: CreatureInstance) {
    const oppSpeciesKey = Object.keys(SPECIES_CATALOG).find(k => k !== playerMonster.speciesId) || 'species_aquabite';
    const opponent = createCreatureInstance(oppSpeciesKey, null, 'Rival ' + SPECIES_CATALOG[oppSpeciesKey].name, 5);

    const engine = new BattleEngine(playerMonster, opponent);
    setActiveEngine(engine);
    setBattleLogs([`Battle initiated! ${playerMonster.nickname} vs ${opponent.nickname}`]);
    setActiveTab('battle');
  }

  async function handleBattleTurn(moveId: string) {
    if (!activeEngine || activeEngine.isBattleOver) return;

    const startPlayerHp = activeEngine.player.currentHp;
    const startOpponentHp = activeEngine.opponent.currentHp;

    const result = activeEngine.executeTurn(moveId);
    const newLogs = result.steps.map(s => s.narrationLog);
    setBattleLogs(prev => [...prev, ...newLogs]);

    if (result.isBattleOver) {
      const rec = createBattleRecord(activeEngine, startPlayerHp, startOpponentHp);
      await HybridStorage.addBattleRecord(rec);
      await refreshData();
    }

    setActiveEngine(Object.assign(Object.create(Object.getPrototypeOf(activeEngine)), activeEngine));
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-0 sm:p-4 text-slate-100 font-['Press_Start_2P',monospace]">
      {/* Phone Case Frame */}
      <main className={`w-full max-w-[420px] min-h-screen sm:min-h-[820px] sm:max-h-[840px] bg-[#1a2233] border-4 border-[#090d13] sm:rounded-[36px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden ${
        crtEnabled ? 'crt-effect' : ''
      }`}>
        
        {/* Phone Notch & Speaker (Desktop Preview) */}
        <div className="hidden sm:flex justify-center items-center py-2 bg-[#141b29] border-b-2 border-black/40">
          <div className="w-16 h-1.5 bg-black/60 rounded-full" />
        </div>

        {/* Status Bar */}
        <header className="px-4 py-2 bg-[#0d131f] border-b-2 border-black/60 flex items-center justify-between text-[9px] text-amber-400">
          <span>12:00</span>
          <span className="font-bold tracking-widest text-[#f59e0b]">MONSTERLINK</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">📡 NFC</span>
            <span className="text-slate-500">▮▮▮</span>
          </div>
        </header>

        {/* Main Content Viewport */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0d131f] flex flex-col">
          {scanMessage && (
            <div className={`p-2.5 border-2 text-[10px] flex items-start gap-2 leading-relaxed ${
              scanMessage.type === 'success' ? 'bg-[#0f2e1b] border-emerald-500 text-emerald-300' :
              scanMessage.type === 'error' ? 'bg-[#3b1212] border-rose-500 text-rose-300' :
              'bg-[#12233b] border-sky-500 text-sky-300'
            }`}>
              {scanMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
              <div>{scanMessage.text}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 1: CLASSIC RETRO MAIN MENU                          */}
          {/* ======================================================== */}
          {activeTab === 'menu' && (
            <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
              {/* Retro Hero Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="text-[8px] text-slate-400 tracking-wider">PHYSICAL NFC x RETRO 2D</div>
                <h1 className="text-2xl font-black tracking-widest text-white leading-tight">
                  MONSTER<br />
                  <span className="text-amber-400">LINK</span>
                </h1>
                <div className="inline-block bg-[#092212] border border-emerald-500 text-emerald-400 text-[8px] px-2 py-0.5 font-bold">
                  PROTOTYPE V1.0
                </div>

                {/* Animated Pixel Mascot */}
                <div className="w-24 h-24 mx-auto my-3 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.3)] animate-bounce duration-1000">
                  <div 
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: PIXEL_SPRITES.ignisaur }}
                  />
                </div>
              </div>

              {/* Classic Retro Menu Buttons */}
              <div className="space-y-2.5 pb-2">
                <button
                  onClick={() => setActiveTab('scan')}
                  className="w-full p-3 pixel-btn-green flex items-center justify-between text-left transition-transform active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📡</span>
                    <div>
                      <div className="text-[11px] font-bold">SCAN NFC CARD</div>
                      <div className="text-[8px] text-emerald-200 mt-0.5">Add creature with card</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('collection')}
                  className="w-full p-3 pixel-btn-retro flex items-center justify-between text-left transition-transform active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📦</span>
                    <div className="text-[11px] font-bold text-slate-100">MY COLLECTION</div>
                  </div>
                  <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5">
                    {collection.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('battle')}
                  className="w-full p-3 pixel-btn-red flex items-center justify-between text-left transition-transform active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">⚔️</span>
                    <div>
                      <div className="text-[11px] font-bold">BATTLE ARENA</div>
                      <div className="text-[8px] text-rose-200 mt-0.5">Turn-based combat</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full p-3 pixel-btn-retro flex items-center justify-between text-left transition-transform active:translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📜</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-100">BATTLE RECORDS</div>
                      <div className="text-[8px] text-slate-400 mt-0.5">Past match history</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: NFC SCANNER VIEW                                 */}
          {/* ======================================================== */}
          {activeTab === 'scan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-[9px] text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <span className="text-[10px] text-slate-400">NFC ENROLLMENT</span>
              </div>

              {/* Physical NFC Radar Card */}
              <div className="pixel-box p-4 text-center space-y-2">
                <div className={`w-14 h-14 mx-auto rounded-full border-2 flex items-center justify-center ${
                  isNfcScanning ? 'border-amber-400 text-amber-400 animate-pulse' : 'border-slate-600 text-slate-500'
                }`}>
                  <Radio className="w-7 h-7" />
                </div>
                <div className="text-[10px] font-bold text-amber-400">NFC ANTENNA</div>
                <div className="text-[8px] text-slate-400 leading-relaxed">{nfcStatus}</div>

                {isNfcSupported ? (
                  <button
                    onClick={isNfcScanning ? stopNfcScan : startNfcScan}
                    className={`w-full py-2.5 text-[9px] font-bold uppercase ${
                      isNfcScanning ? 'pixel-btn-red' : 'pixel-btn-green'
                    }`}
                  >
                    {isNfcScanning ? '■ Stop NFC Reading' : '▶ Start Physical NFC'}
                  </button>
                ) : (
                  <div className="text-[8px] text-slate-500 bg-black/40 p-1.5 border border-slate-800">
                    Physical Web NFC unavailable on this browser. Use simulated tags below.
                  </div>
                )}
              </div>

              {/* MEZASTAR & Prototype Tags Grid */}
              <div className="space-y-1.5">
                <div className="text-[9px] text-slate-400">TAG REGISTRY:</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CARD_REGISTRY).map(card => {
                    const isRegistered = collection.some(c => c.nfcCardCode === card.cardCode);
                    const isMezastar = card.cardCode.includes('MEZASTAR');
                    return (
                      <button
                        key={card.cardCode}
                        onClick={() => handleScan(card.cardCode)}
                        className={`p-2.5 text-left border-2 flex flex-col justify-between ${
                          isRegistered
                            ? 'bg-black/50 border-slate-800 opacity-50'
                            : isMezastar
                            ? 'bg-[#1b2234] border-amber-500/60 hover:border-amber-400'
                            : 'bg-[#182030] border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="text-[8px] text-amber-400">{card.grade || '2-Star'}</div>
                          <div className="text-[9px] text-white font-bold mt-1 line-clamp-1">{card.name}</div>
                        </div>
                        <div className="text-[7px] text-slate-400 mt-2 flex justify-between">
                          <span>{card.cardCode.slice(0, 11)}</span>
                          {isRegistered && <span className="text-emerald-400 font-bold">OWNED</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: COLLECTION VIEW                                  */}
          {/* ======================================================== */}
          {activeTab === 'collection' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-[9px] text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <span className="text-[10px] text-slate-400">COLLECTION ({collection.length})</span>
              </div>

              {collection.length === 0 ? (
                <div className="pixel-box p-8 text-center space-y-2">
                  <div className="text-2xl">📦</div>
                  <div className="text-[10px] font-bold text-slate-300">COLLECTION EMPTY</div>
                  <div className="text-[8px] text-slate-500">Scan an NFC tag to enroll your first monster.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {collection.map(creature => {
                    const species = SPECIES_CATALOG[creature.speciesId];
                    const mezastar = creature.nfcCardCode ? getMezastarTagByNfcCode(creature.nfcCardCode) : null;
                    return (
                      <div
                        key={creature.instanceId}
                        className="pixel-box p-2.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-black/40 border border-slate-700 flex items-center justify-center p-1">
                            {species?.spriteKey && PIXEL_SPRITES[species.spriteKey] ? (
                              <div 
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: PIXEL_SPRITES[species.spriteKey] }}
                              />
                            ) : (
                              <span className="text-xs text-amber-400">⚡</span>
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-white">{creature.nickname}</div>
                            <div className="text-[8px] text-slate-400 mt-0.5">
                              Lv.{creature.level} • <span className="text-amber-400">{species?.type}</span>
                              {mezastar && <span className="text-purple-300"> • {mezastar.grade}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleInspect(creature)}
                            className="p-1.5 bg-slate-800 text-slate-300 border border-black hover:bg-slate-700"
                            title="Inspect"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startBattle(creature)}
                            className="px-2.5 py-1.5 pixel-btn-red text-[8px] font-bold"
                          >
                            BATTLE
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: BATTLE ARENA VIEW                                */}
          {/* ======================================================== */}
          {activeTab === 'battle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-[9px] text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> MENU
                </button>
                <span className="text-[10px] text-rose-400">BATTLE ARENA</span>
              </div>

              {!activeEngine ? (
                <div className="pixel-box p-8 text-center space-y-3">
                  <div className="text-2xl">⚔️</div>
                  <div className="text-[10px] font-bold text-slate-300">ARENA IDLE</div>
                  <div className="text-[8px] text-slate-400">Select a creature from collection to battle.</div>
                  <button
                    onClick={() => setActiveTab('collection')}
                    className="px-3 py-2 pixel-btn-green text-[9px]"
                  >
                    SELECT CREATURE
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Opponent & Player HUD */}
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    {/* Player HUD */}
                    <div className="pixel-box p-2 space-y-1">
                      <div className="font-bold text-white truncate">{activeEngine.player.nickname}</div>
                      <div className="text-slate-400">Lv.{activeEngine.player.level}</div>
                      <div className="w-full bg-black h-2 border border-slate-700">
                        <div 
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${(activeEngine.player.currentHp / activeEngine.player.maxHp) * 100}%` }}
                        />
                      </div>
                      <div className="text-right text-slate-300 font-mono">
                        {activeEngine.player.currentHp}/{activeEngine.player.maxHp} HP
                      </div>
                    </div>

                    {/* Opponent HUD */}
                    <div className="pixel-box p-2 space-y-1">
                      <div className="font-bold text-white truncate">{activeEngine.opponent.nickname}</div>
                      <div className="text-slate-400">Lv.{activeEngine.opponent.level}</div>
                      <div className="w-full bg-black h-2 border border-slate-700">
                        <div 
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${(activeEngine.opponent.currentHp / activeEngine.opponent.maxHp) * 100}%` }}
                        />
                      </div>
                      <div className="text-right text-slate-300 font-mono">
                        {activeEngine.opponent.currentHp}/{activeEngine.opponent.maxHp} HP
                      </div>
                    </div>
                  </div>

                  {/* Battle Narration Log */}
                  <div className="bg-black/80 border-2 border-slate-800 p-2.5 h-36 overflow-y-auto text-[8px] space-y-1 font-mono">
                    {battleLogs.map((log, i) => (
                      <div key={i} className="text-slate-200 border-b border-slate-900 pb-1 leading-relaxed">
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Move Selection */}
                  {!activeEngine.isBattleOver ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeEngine.player.knownMoveIds.map(moveId => (
                        <button
                          key={moveId}
                          onClick={() => handleBattleTurn(moveId)}
                          className="p-2 pixel-btn-red text-[8px] font-bold truncate"
                        >
                          {moveId.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0a2312] border-2 border-emerald-500 text-center space-y-2">
                      <div className="text-[10px] font-bold text-emerald-300">
                        MATCH OVER: {activeEngine.winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
                      </div>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="px-3 py-1.5 pixel-btn-green text-[8px]"
                      >
                        VIEW HISTORY
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: HISTORY RECORDS                                  */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-[9px] text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> BACK
                </button>
                <span className="text-[10px] text-slate-400">HISTORY ({history.length})</span>
              </div>

              {history.length === 0 ? (
                <div className="pixel-box p-8 text-center space-y-2">
                  <div className="text-2xl">📜</div>
                  <div className="text-[10px] font-bold text-slate-300">NO MATCHES YET</div>
                  <div className="text-[8px] text-slate-500">Finished arena matches are logged here.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice().reverse().map(record => (
                    <div key={record.recordId} className="pixel-box p-2.5 flex items-center justify-between text-[8px]">
                      <div>
                        <div className="font-bold text-white">{record.playerCreature.nickname} vs {record.opponentCreature.nickname}</div>
                        <div className="text-slate-400 mt-1">Turns: {record.turnCount}</div>
                      </div>
                      <span className={`px-2 py-0.5 border font-bold ${
                        record.outcome === 'Victory' ? 'bg-[#0f2e1b] border-emerald-500 text-emerald-300' :
                        record.outcome === 'Defeat' ? 'bg-[#3b1212] border-rose-500 text-rose-300' :
                        'bg-slate-800 border-slate-600 text-slate-400'
                      }`}>
                        {record.outcome}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* INSPECT MODAL                                            */}
        {/* ======================================================== */}
        {inspectCreature && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex flex-col justify-end">
            <div className="pixel-box p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white">{inspectCreature.instance.nickname}</h3>
                  <div className="text-[8px] text-amber-400 mt-0.5">
                    {inspectCreature.instance.nfcCardCode || 'Digital Prototype'}
                  </div>
                </div>
                <button
                  onClick={() => setInspectCreature(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PokéAPI Reference Display */}
              {inspectCreature.pokeApiRef && (
                <div className="bg-black/60 border border-slate-700 p-2.5 flex items-center gap-3">
                  {inspectCreature.pokeApiRef.sprites.officialArtwork && (
                    <img
                      src={inspectCreature.pokeApiRef.sprites.officialArtwork}
                      alt={inspectCreature.pokeApiRef.name}
                      className="w-14 h-14 object-contain"
                    />
                  )}
                  <div className="text-[8px] space-y-0.5">
                    <div className="text-amber-400 font-bold">POKÉAPI DATA</div>
                    <div className="text-slate-300">Height: {inspectCreature.pokeApiRef.height / 10} m</div>
                    <div className="text-slate-300">Weight: {inspectCreature.pokeApiRef.weight / 10} kg</div>
                    <div className="text-slate-400">Types: {inspectCreature.pokeApiRef.types.join('/')}</div>
                  </div>
                </div>
              )}

              {/* Combat Stats */}
              <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
                <div className="bg-black/40 p-1.5 border border-slate-800">
                  <div className="text-slate-500">HP</div>
                  <div className="font-bold text-rose-400">{inspectCreature.instance.maxHp}</div>
                </div>
                <div className="bg-black/40 p-1.5 border border-slate-800">
                  <div className="text-slate-500">ATK</div>
                  <div className="font-bold text-amber-400">{inspectCreature.instance.attack}</div>
                </div>
                <div className="bg-black/40 p-1.5 border border-slate-800">
                  <div className="text-slate-500">DEF</div>
                  <div className="font-bold text-blue-400">{inspectCreature.instance.defense}</div>
                </div>
                <div className="bg-black/40 p-1.5 border border-slate-800">
                  <div className="text-slate-500">SPD</div>
                  <div className="font-bold text-emerald-400">{inspectCreature.instance.speed}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  const c = inspectCreature.instance;
                  setInspectCreature(null);
                  startBattle(c);
                }}
                className="w-full py-2.5 pixel-btn-red text-[8px] font-bold"
              >
                ENTER BATTLE
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
