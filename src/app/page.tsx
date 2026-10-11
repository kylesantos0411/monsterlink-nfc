'use client';

import React, { useState, useEffect } from 'react';
import { LocalStorageRepository } from '@/lib/storage/local-repository';
import { CreatureInstance } from '@/types/creature';
import { BattleRecord } from '@/types/records';
import { CARD_REGISTRY, SPECIES_CATALOG, createCreatureInstance } from '@/lib/data/catalog';
import { BattleEngine } from '@/lib/battle/battle-engine';
import { createBattleRecord } from '@/lib/battle/record-factory';
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
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'collection' | 'battle' | 'history'>('scan');
  const [collection, setCollection] = useState<CreatureInstance[]>([]);
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<CreatureInstance | null>(null);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  // NFC Scan Handler (Simulated & Web NFC ready)
  function handleScan(cardCode: string) {
    if (LocalStorageRepository.isCardRegistered(cardCode)) {
      setScanMessage({ text: `Rejected: Tag "${cardCode}" is already registered in your collection!`, type: 'error' });
      return;
    }

    const card = CARD_REGISTRY[cardCode];
    if (!card) {
      setScanMessage({ text: `Unknown: Tag "${cardCode}" is not in the prototype registry.`, type: 'error' });
      return;
    }

    const newMonster = createCreatureInstance(card.speciesId, cardCode, card.name.replace(' Tag', ''), 5);
    LocalStorageRepository.addCreature(newMonster);
    LocalStorageRepository.registerCard(cardCode, newMonster.instanceId);
    refreshData();
    setScanMessage({ text: `Enrolled: ${newMonster.nickname} (Level ${newMonster.level}) registered!`, type: 'success' });
  }

  // Start Battle
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
    <main className="max-w-md mx-auto w-full min-h-screen bg-[#0d131f] border-x border-[#1e293b] flex flex-col shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-[#111827]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-sm shadow-md">
            ML
          </div>
          <span className="font-bold text-lg tracking-wider text-rose-400">MONSTERLINK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">
            WEB V1.0
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
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
                <Radio className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-100">NFC Tag Scanner</h2>
              <p className="text-xs text-slate-400">
                Tap physical MEZASTAR/MonsterLink NFC tags or simulate scans below to register creatures into your collection.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Predefined Tag Codes</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CARD_REGISTRY).map(card => {
                  const isRegistered = LocalStorageRepository.isCardRegistered(card.cardCode);
                  return (
                    <button
                      key={card.cardCode}
                      onClick={() => handleScan(card.cardCode)}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        isRegistered
                          ? 'bg-slate-900/60 border-slate-800 opacity-60'
                          : 'bg-[#162033] border-[#293b5c] hover:border-rose-500 hover:bg-[#1a263d]'
                      }`}
                    >
                      <div className="text-xs font-mono text-rose-400 font-bold">{card.cardCode}</div>
                      <div className="text-sm font-bold text-slate-200 mt-1">{card.name}</div>
                      <div className="text-[10px] text-slate-400 flex justify-between items-center mt-2">
                        <span>{card.grade || card.rarity}</span>
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
                          <div className="text-sm font-bold text-slate-100">{creature.nickname}</div>
                          <div className="text-xs text-slate-400 flex gap-2">
                            <span>Lv. {creature.level}</span>
                            <span>•</span>
                            <span className="text-rose-400">{species?.type}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startBattle(creature)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        Battle
                      </button>
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
