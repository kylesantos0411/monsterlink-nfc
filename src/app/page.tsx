'use client';

import React, { useState, useEffect } from 'react';
import { LocalStorageRepository } from '@/lib/storage/local-repository';
import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { CARD_REGISTRY, SPECIES_CATALOG, createCreatureInstance } from '@/lib/data/catalog';
import { MEZASTAR_CATALOG, getMezastarTagByNfcCode } from '@/lib/data/mezastar-catalog';
import { fetchPokemonReference, PokeApiReferenceData } from '@/lib/pokeapi/client';
import { BattleEngine } from '@/lib/battle/battle-engine';
import { createBattleRecord } from '@/lib/battle/record-factory';
import { useWebNfc } from '@/lib/nfc/use-web-nfc';
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
  Square
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'collection' | 'battle' | 'history'>('scan');
  const [collection, setCollection] = useState<CreatureInstance[]>([]);
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [inspectCreature, setInspectCreature] = useState<{
    instance: CreatureInstance;
    pokeApiRef: PokeApiReferenceData | null;
  } | null>(null);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  function refreshData() {
    setCollection(LocalStorageRepository.getCollection());
    setHistory(LocalStorageRepository.getBattleHistory());
  }

  // NFC Scan Handler (Supports both prototype & MEZASTAR tags)
  function handleScan(cardCode: string) {
    if (LocalStorageRepository.isCardRegistered(cardCode)) {
      setScanMessage({ text: `Rejected: Tag "${cardCode}" is already registered in your collection!`, type: 'error' });
      return;
    }

    const card = CARD_REGISTRY[cardCode];
    if (!card) {
      setScanMessage({ text: `Unknown: Tag "${cardCode}" is not in the prototype or MEZASTAR registry.`, type: 'error' });
      return;
    }

    const newMonster = createCreatureInstance(card.speciesId, cardCode, card.name.split(' (')[0].replace(' Tag', ''), 5);
    LocalStorageRepository.addCreature(newMonster);
    LocalStorageRepository.registerCard(cardCode, newMonster.instanceId);
    refreshData();
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

  function handleBattleTurn(moveId: string) {
    if (!activeEngine || activeEngine.isBattleOver) return;

    const startPlayerHp = activeEngine.player.currentHp;
    const startOpponentHp = activeEngine.opponent.currentHp;

    const result = activeEngine.executeTurn(moveId);
    const newLogs = result.steps.map(s => s.narrationLog);
    setBattleLogs(prev => [...prev, ...newLogs]);

    if (result.isBattleOver) {
      const rec = createBattleRecord(activeEngine, startPlayerHp, startOpponentHp);
      LocalStorageRepository.addBattleRecord(rec);
      refreshData();
    }

    // Force re-render
    setActiveEngine(Object.assign(Object.create(Object.getPrototypeOf(activeEngine)), activeEngine));
  }

  return (
    <main className="max-w-md mx-auto w-full min-h-screen bg-[#0d131f] border-x border-[#1e293b] flex flex-col shadow-2xl relative">
      {/* Header */}
      <header className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-sm shadow-md">
            ML
          </div>
          <span className="font-bold text-lg tracking-wider text-rose-400">MONSTERLINK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-semibold">
            MEZASTAR
          </span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {scanMessage && (
          <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
            scanMessage.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' :
            scanMessage.type === 'error' ? 'bg-rose-950/80 border-rose-800 text-rose-300' :
            'bg-sky-950/80 border-sky-800 text-sky-300'
          }`}>
            {scanMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <div>{scanMessage.text}</div>
          </div>
        )}

        {/* VIEW: SCAN NFC */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="bg-[#141d2e] border border-[#24334f] rounded-xl p-5 text-center space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-full border-2 flex items-center justify-center transition-all ${
                isNfcScanning
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}>
                <Radio className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-100">NFC Tag Scanner</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {nfcStatus}
                </p>
                {nfcError && (
                  <p className="text-xs text-rose-400 mt-1 font-semibold">{nfcError}</p>
                )}
              </div>

              {/* Physical Web NFC Activation Controls */}
              {isNfcSupported ? (
                <div className="pt-2">
                  {!isNfcScanning ? (
                    <button
                      onClick={startNfcScan}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Start Physical NFC Reading
                    </button>
                  ) : (
                    <button
                      onClick={stopNfcScan}
                      className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      Stop NFC Reading
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-400">
                  <span>Physical Web NFC is not available on this browser. Use simulated card taps below.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">MEZASTAR & Prototype Tags</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CARD_REGISTRY).map(card => {
                  const isRegistered = LocalStorageRepository.isCardRegistered(card.cardCode);
                  const isMezastar = card.cardCode.includes('MEZASTAR');
                  return (
                    <button
                      key={card.cardCode}
                      onClick={() => handleScan(card.cardCode)}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        isRegistered
                          ? 'bg-slate-900/60 border-slate-800 opacity-60'
                          : isMezastar
                          ? 'bg-[#182038] border-amber-500/40 hover:border-amber-400'
                          : 'bg-[#162033] border-[#293b5c] hover:border-rose-500'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={isMezastar ? 'text-amber-400 font-bold' : 'text-rose-400'}>{card.cardCode}</span>
                          {card.grade && (
                            <span className="text-amber-300 font-bold bg-amber-950/70 px-1 rounded">{card.grade}</span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-100 mt-1">{card.name}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between items-center mt-2">
                        <span>{card.source}</span>
                        {isRegistered && <span className="text-emerald-400 font-semibold">Registered</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: COLLECTION */}
        {activeTab === 'collection' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Creature Collection ({collection.length})
              </h2>
            </div>

            {collection.length === 0 ? (
              <div className="p-8 text-center bg-[#141d2e] border border-[#24334f] rounded-xl space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
                <div className="text-sm font-bold text-slate-300">No Creatures Registered Yet</div>
                <div className="text-xs text-slate-500">Scan an NFC tag to enroll your first digital monster.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {collection.map(creature => {
                  const species = SPECIES_CATALOG[creature.speciesId];
                  const mezastar = creature.nfcCardCode ? getMezastarTagByNfcCode(creature.nfcCardCode) : null;
                  return (
                    <div
                      key={creature.instanceId}
                      className="p-3 bg-[#141d2e] border border-[#24334f] rounded-xl flex items-center justify-between hover:border-slate-500 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-rose-400 border border-slate-700">
                          {species?.name[0] || 'M'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>{creature.nickname}</span>
                            {mezastar && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded font-mono">
                                {mezastar.grade}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>Lv. {creature.level}</span>
                            <span>•</span>
                            <span className="text-rose-400">{species?.type}</span>
                            {mezastar?.specialAbility && (
                              <span className="text-purple-400">• {mezastar.specialAbility}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInspect(creature)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                          title="Inspect Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startBattle(creature)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          Battle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: BATTLE ARENA */}
        {activeTab === 'battle' && (
          <div className="space-y-4">
            {!activeEngine ? (
              <div className="p-8 text-center bg-[#141d2e] border border-[#24334f] rounded-xl space-y-3">
                <Gamepad2 className="w-10 h-10 mx-auto text-slate-500" />
                <div className="text-sm font-bold text-slate-300">Arena Idle</div>
                <p className="text-xs text-slate-500">Select a creature from your collection to start a match.</p>
                <button
                  onClick={() => setActiveTab('collection')}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  Choose Combatant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Combatants HUD */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Player HUD */}
                  <div className="bg-[#141d2e] border border-[#24334f] p-3 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-200">{activeEngine.player.nickname}</div>
                    <div className="text-[10px] text-slate-400">Lv. {activeEngine.player.level}</div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300" 
                        style={{ width: `${(activeEngine.player.currentHp / activeEngine.player.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      {activeEngine.player.currentHp} / {activeEngine.player.maxHp} HP
                    </div>
                  </div>

                  {/* Opponent HUD */}
                  <div className="bg-[#141d2e] border border-[#24334f] p-3 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-200">{activeEngine.opponent.nickname}</div>
                    <div className="text-[10px] text-slate-400">Lv. {activeEngine.opponent.level}</div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-300" 
                        style={{ width: `${(activeEngine.opponent.currentHp / activeEngine.opponent.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      {activeEngine.opponent.currentHp} / {activeEngine.opponent.maxHp} HP
                    </div>
                  </div>
                </div>

                {/* Battle Logs */}
                <div className="bg-[#0b1018] border border-[#1e293b] p-3 rounded-xl h-40 overflow-y-auto font-mono text-xs space-y-1">
                  {battleLogs.map((log, i) => (
                    <div key={i} className="text-slate-300 border-b border-slate-900 pb-1">{log}</div>
                  ))}
                </div>

                {/* Move Controls */}
                {!activeEngine.isBattleOver ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeEngine.player.knownMoveIds.map(moveId => (
                      <button
                        key={moveId}
                        onClick={() => handleBattleTurn(moveId)}
                        className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md uppercase tracking-wider"
                      >
                        {moveId.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-center space-y-2">
                    <div className="text-sm font-bold text-emerald-300">
                      Match Concluded: {activeEngine.winner === 'player' ? 'Victory!' : 'Defeat!'}
                    </div>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      View Battle History
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Battle Records ({history.length})
            </h2>

            {history.length === 0 ? (
              <div className="p-8 text-center bg-[#141d2e] border border-[#24334f] rounded-xl space-y-2">
                <History className="w-10 h-10 mx-auto text-slate-500" />
                <div className="text-sm font-bold text-slate-300">No Battles Recorded</div>
                <div className="text-xs text-slate-500">Completed matches will be permanently recorded here.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice().reverse().map(record => (
                  <div
                    key={record.recordId}
                    className="p-3 bg-[#141d2e] border border-[#24334f] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {record.playerCreature.nickname} vs {record.opponentCreature.nickname}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Turns: {record.turnCount} • {new Date(record.timestampUtc).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase font-mono ${
                      record.outcome === 'Victory' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      record.outcome === 'Defeat' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-slate-800 text-slate-400'
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

      {/* INSPECT DETAIL MODAL */}
      {inspectCreature && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex flex-col justify-end">
          <div className="bg-[#141d2e] border border-[#293b5c] rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{inspectCreature.instance.nickname}</h3>
                <div className="text-xs text-slate-400 font-mono">
                  {inspectCreature.instance.nfcCardCode || 'Prototype Digital Monster'}
                </div>
              </div>
              <button
                onClick={() => setInspectCreature(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PokéAPI Reference Card */}
            {inspectCreature.pokeApiRef && (
              <div className="bg-[#0f172a] border border-[#1e293b] p-3 rounded-xl flex items-center gap-3">
                {inspectCreature.pokeApiRef.sprites.officialArtwork && (
                  <img
                    src={inspectCreature.pokeApiRef.sprites.officialArtwork}
                    alt={inspectCreature.pokeApiRef.name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-amber-400">PokéAPI Reference Data</div>
                  <div className="text-slate-300">Official Height: {inspectCreature.pokeApiRef.height / 10} m</div>
                  <div className="text-slate-300">Official Weight: {inspectCreature.pokeApiRef.weight / 10} kg</div>
                  <div className="text-slate-400">Types: {inspectCreature.pokeApiRef.types.join(', ')}</div>
                </div>
              </div>
            )}

            {/* In-Game Combat Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">HP</div>
                <div className="text-sm font-bold text-rose-400">{inspectCreature.instance.maxHp}</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">ATK</div>
                <div className="text-sm font-bold text-amber-400">{inspectCreature.instance.attack}</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">DEF</div>
                <div className="text-sm font-bold text-blue-400">{inspectCreature.instance.defense}</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">SPD</div>
                <div className="text-sm font-bold text-emerald-400">{inspectCreature.instance.speed}</div>
              </div>
            </div>

            <button
              onClick={() => {
                const c = inspectCreature.instance;
                setInspectCreature(null);
                startBattle(c);
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Enter Battle With {inspectCreature.instance.nickname}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="p-2 border-t border-[#1e293b] bg-[#111827] grid grid-cols-4 gap-1">
        <button
          onClick={() => setActiveTab('scan')}
          className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
            activeTab === 'scan' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          Scan NFC
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
            activeTab === 'collection' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Collection
        </button>
        <button
          onClick={() => setActiveTab('battle')}
          className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
            activeTab === 'battle' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          Battle
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[11px] font-semibold transition-all ${
            activeTab === 'history' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </nav>
    </main>
  );
}
