// MonsterLink Application Controller & UI Wireframe
// Coordinates navigation, NFC registration flow, Collection UI, and Battle Arena

import { SPRITES } from './sprites.js';
import { ElementType, SPECIES_CATALOG, CARD_REGISTRY, MOVES, createCreatureInstance } from './creatures.js';
import { Storage } from './storage.js';
import { Sound } from './audio.js';
import { BattleEngine } from './battle.js';

// Application State
const AppState = {
  currentView: 'view-menu',
  activeBattleEngine: null,
  activeBattlePlayerCreature: null,
  activeBattleOpponentCreature: null,
  selectedRosterInstanceId: null,
  scanSessionLogs: []
};

// -------------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNavigation();
  initDesktopControls();
  initNfcScanner();
  initCollection();
  initBattle();
  initHistory();
  initSettings();
  updateCollectionBadge();
  renderMenuMascot();
});

function initClock() {
  const clockEl = document.getElementById('clock-display');
  function updateTime() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hrs}:${mins}`;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

function renderMenuMascot() {
  const mascotContainer = document.getElementById('menu-mascot-container');
  if (mascotContainer) {
    mascotContainer.innerHTML = SPRITES.ignisaur;
  }
}

// -------------------------------------------------------------------
// NAVIGATION
// -------------------------------------------------------------------
function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetView = btn.getAttribute('data-nav');
      Sound.playClick();
      navigateTo(targetView);
    });
  });
}

export function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    AppState.currentView = viewId;
    
    // View-specific refreshes
    if (viewId === 'view-collection') renderCollection();
    if (viewId === 'view-history') renderHistory();
    if (viewId === 'view-battle') openBattleRosterSelect();
    if (viewId === 'view-menu') updateCollectionBadge();
  }
}

function updateCollectionBadge() {
  const coll = Storage.getCollection();
  const badge = document.getElementById('menu-collection-count');
  const collCountText = document.getElementById('coll-count-text');
  if (badge) badge.textContent = coll.length;
  if (collCountText) collCountText.textContent = coll.length;
}

// -------------------------------------------------------------------
// DESKTOP & DISPLAY CONTROLS
// -------------------------------------------------------------------
function initDesktopControls() {
  const frameBtn = document.getElementById('btn-toggle-frame');
  const frameEl = document.getElementById('phone-frame');
  if (frameBtn && frameEl) {
    frameBtn.addEventListener('click', () => {
      frameEl.classList.toggle('mode-expanded');
      const isExpanded = frameEl.classList.contains('mode-expanded');
      frameBtn.textContent = isExpanded ? '📱 View: Responsive' : '📱 View: Phone Frame';
      Sound.playClick();
    });
  }

  const crtBtn = document.getElementById('btn-toggle-crt');
  const body = document.body;
  if (crtBtn) {
    crtBtn.addEventListener('click', () => {
      body.classList.toggle('crt-enabled');
      const isCrt = body.classList.contains('crt-enabled');
      crtBtn.classList.toggle('active', isCrt);
      crtBtn.textContent = isCrt ? '📺 CRT Effect: ON' : '📺 CRT Effect: OFF';
      Sound.playClick();
    });
  }

  const soundBtn = document.getElementById('btn-toggle-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = Sound.toggle();
      soundBtn.classList.toggle('active', enabled);
      soundBtn.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      if (enabled) Sound.playClick();
    });
  }

  const seedBtn = document.getElementById('btn-quick-seed');
  if (seedBtn) {
    seedBtn.addEventListener('click', () => {
      seedDemoData();
      Sound.playScanSuccess();
      showToast('2 demo creatures added to collection!', 'success');
      updateCollectionBadge();
    });
  }
}

// -------------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------------
function showToast(message, type = 'info') {
  const banner = document.getElementById('toast-banner');
  const textEl = document.getElementById('toast-text');
  const iconEl = document.getElementById('toast-icon');
  if (!banner || !textEl) return;

  banner.className = `toast-banner toast-${type}`;
  textEl.textContent = message;

  if (type === 'success') iconEl.textContent = '✅';
  else if (type === 'error') iconEl.textContent = '⚠️';
  else iconEl.textContent = 'ℹ️';

  banner.classList.remove('hidden');

  setTimeout(() => {
    banner.classList.add('hidden');
  }, 3200);
}

// -------------------------------------------------------------------
// VIEW 2: NFC SCANNER (STAGE A SIMULATION & REGISTRATION)
// -------------------------------------------------------------------
function initNfcScanner() {
  // Test Card Click Handlers
  document.querySelectorAll('.card-chip').forEach(card => {
    card.addEventListener('click', () => {
      const cardCode = card.getAttribute('data-code');
      triggerNfcScan(cardCode);
    });
  });

  // Custom code input handler
  const scanCustomBtn = document.getElementById('btn-scan-custom');
  const customInput = document.getElementById('input-custom-nfc');
  if (scanCustomBtn && customInput) {
    scanCustomBtn.addEventListener('click', () => {
      const code = customInput.value.trim();
      if (!code) {
        showToast('Please enter a card code to scan.', 'error');
        Sound.playError();
        return;
      }
      triggerNfcScan(code);
      customInput.value = '';
    });
  }
}

export function triggerNfcScan(cardCode) {
  const pad = document.getElementById('nfc-pad');
  const statusText = document.getElementById('pad-status-text');
  const antenna = pad.querySelector('.pad-antenna');

  // Trigger pulse animation
  if (antenna) {
    antenna.classList.remove('scanning');
    void antenna.offsetWidth; // force reflow
    antenna.classList.add('scanning');
  }

  statusText.textContent = `Reading tag: ${cardCode}...`;

  setTimeout(() => {
    processCardRegistration(cardCode);
  }, 400);
}

function processCardRegistration(cardCode) {
  const statusText = document.getElementById('pad-status-text');

  // Step 1: Validate Code Format
  const isValidFormat = /^ML-CARD-[A-Z0-9]+-\d+$/i.test(cardCode);
  if (!isValidFormat) {
    Sound.playError();
    statusText.textContent = `Error: Invalid Card Code format!`;
    logScanAttempt(cardCode, 'Invalid Format', 'error');
    showToast(`Invalid card format: "${cardCode}"`, 'error');
    return;
  }

  // Step 2: Check for Duplicate Registration
  if (Storage.isCardRegistered(cardCode)) {
    Sound.playError();
    statusText.textContent = `Rejected: Card already registered!`;
    logScanAttempt(cardCode, 'Duplicate Card (Already Registered)', 'duplicate');
    showToast(`Duplicate! Card "${cardCode}" is already in your collection.`, 'error');
    return;
  }

  // Step 3: Check Registry Catalog
  const cardEntry = CARD_REGISTRY[cardCode];
  if (!cardEntry) {
    Sound.playError();
    statusText.textContent = `Unknown: Card code not in registry!`;
    logScanAttempt(cardCode, 'Unknown Code (Unregistered Card)', 'error');
    showToast(`Unrecognized card: "${cardCode}" is not in the prototype registry.`, 'error');
    return;
  }

  // Step 4: Register Creature
  try {
    const species = SPECIES_CATALOG[cardEntry.speciesId];
    const newInstance = createCreatureInstance(species.id, cardCode, species.name, 5);

    Storage.addCreature(newInstance);
    Storage.registerCard(cardCode, newInstance.instanceId);

    Sound.playScanSuccess();
    statusText.textContent = `Success! Registered ${newInstance.nickname}!`;
    logScanAttempt(cardCode, `Registered ${newInstance.nickname} (Lv.${newInstance.level})`, 'success');
    showToast(`New Creature Acquired: ${newInstance.nickname}!`, 'success');
    updateCollectionBadge();
  } catch (err) {
    console.error('Registration failed', err);
    Sound.playError();
    statusText.textContent = `Registration error occurred!`;
    showToast(`Registration failed: ${err.message}`, 'error');
  }
}

function logScanAttempt(cardCode, outcome, cssClass) {
  const logList = document.getElementById('scan-log-list');
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  AppState.scanSessionLogs.unshift({ time: timeStr, code: cardCode, outcome, cssClass });

  if (logList) {
    if (AppState.scanSessionLogs.length === 1) logList.innerHTML = '';
    const li = document.createElement('li');
    li.className = `log-item ${cssClass}`;
    li.innerHTML = `<span>[${timeStr}] <strong>${cardCode}</strong></span> <span>${outcome}</span>`;
    logList.prepend(li);
  }
}

// -------------------------------------------------------------------
// VIEW 3: COLLECTION & CREATURE DETAILS
// -------------------------------------------------------------------
function initCollection() {
  const closeBtn = document.getElementById('btn-close-detail');
  const modal = document.getElementById('creature-detail-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      Sound.playClick();
    });
  }
}

function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const collection = Storage.getCollection();
  updateCollectionBadge();

  if (!grid) return;
  grid.innerHTML = '';

  if (collection.length === 0) {
    grid.innerHTML = `
      <div class="empty-collection-state">
        <p>No creatures registered yet!</p>
        <button class="pixel-btn btn-primary" data-nav="view-scan">
          📡 SCAN YOUR FIRST NFC CARD
        </button>
      </div>
    `;
    const btn = grid.querySelector('[data-nav="view-scan"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-scan'); });
    return;
  }

  collection.forEach(creature => {
    const species = SPECIES_CATALOG[creature.speciesId];
    const row = document.createElement('div');
    row.className = 'creature-card-row';
    row.innerHTML = `
      <div class="card-sprite-thumb">
        ${SPRITES[species.spriteKey] || ''}
      </div>
      <div class="card-info">
        <div class="card-title-row">
          <span class="card-name">${creature.nickname}</span>
          <span class="card-lvl">Lv.${creature.level}</span>
          <span class="type-pill type-${species.type}">${species.type}</span>
        </div>
        <div class="hp-bar-outer" style="margin: 4px 0;">
          <span class="hp-label" style="font-size: 6px;">HP</span>
          <div class="hp-bar-bg" style="height: 6px;">
            <div class="hp-bar-fill" style="width: ${(creature.currentHp / creature.maxHp) * 100}%;"></div>
          </div>
          <span style="font-size: 6px; color: #8ea7ce; margin-left: 4px;">${creature.currentHp}/${creature.maxHp}</span>
        </div>
        <div class="card-meta-nfc">NFC: ${creature.nfcTagCode || 'None'}</div>
      </div>
    `;

    row.addEventListener('click', () => {
      Sound.playClick();
      openCreatureDetails(creature);
    });

    grid.appendChild(row);
  });
}

function openCreatureDetails(creature) {
  const modal = document.getElementById('creature-detail-modal');
  const species = SPECIES_CATALOG[creature.speciesId];
  if (!modal || !species) return;

  document.getElementById('modal-creature-name').textContent = creature.nickname;
  document.getElementById('modal-species-id').textContent = creature.speciesId;
  document.getElementById('modal-instance-id').textContent = creature.instanceId;
  document.getElementById('modal-nfc-code').textContent = creature.nfcTagCode || 'Not Assigned';
  document.getElementById('modal-level').textContent = `Lv. ${creature.level}`;

  const typeBadge = document.getElementById('modal-type-badge');
  typeBadge.textContent = species.type.toUpperCase();
  typeBadge.className = `detail-type-badge type-pill type-${species.type}`;

  document.getElementById('modal-sprite-box').innerHTML = SPRITES[species.spriteKey] || '';

  // Stats
  document.getElementById('modal-stat-hp').textContent = creature.maxHp;
  document.getElementById('modal-bar-hp').style.width = `${Math.min(100, (creature.maxHp / 80) * 100)}%`;

  document.getElementById('modal-stat-atk').textContent = creature.attack;
  document.getElementById('modal-bar-atk').style.width = `${Math.min(100, (creature.attack / 70) * 100)}%`;

  document.getElementById('modal-stat-def').textContent = creature.defense;
  document.getElementById('modal-bar-def').style.width = `${Math.min(100, (creature.defense / 70) * 100)}%`;

  document.getElementById('modal-stat-spd').textContent = creature.speed;
  document.getElementById('modal-bar-spd').style.width = `${Math.min(100, (creature.speed / 70) * 100)}%`;

  // Moves list
  const movesContainer = document.getElementById('modal-moves-list');
  movesContainer.innerHTML = '';
  creature.knownMoveIds.forEach(mId => {
    const move = MOVES[mId];
    if (move) {
      const moveDiv = document.createElement('div');
      moveDiv.className = 'detail-move-pill';
      moveDiv.innerHTML = `
        <span><strong>${move.name}</strong> <small>(${move.type})</small></span>
        <span>PWR: ${move.power}</span>
      `;
      movesContainer.appendChild(moveDiv);
    }
  });

  modal.classList.remove('hidden');
}

// -------------------------------------------------------------------
// VIEW 4: BATTLE ARENA & DETERMINISTIC ENGINE INTEGRATION
// -------------------------------------------------------------------
function initBattle() {
  const startBtn = document.getElementById('btn-start-battle');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      Sound.playClick();
      startBattleMatch();
    });
  }

  const quitBtn = document.getElementById('btn-battle-quit');
  if (quitBtn) {
    quitBtn.addEventListener('click', () => {
      if (AppState.activeBattleEngine && !AppState.activeBattleEngine.isOver) {
        if (confirm('Are you sure you want to forfeit? Incomplete battles are saved as Aborted.')) {
          recordAbortedBattle();
          Sound.playClick();
          navigateTo('view-menu');
        }
      } else {
        navigateTo('view-menu');
      }
    });
  }

  // Rematch & Return buttons on outcome modal
  const rematchBtn = document.getElementById('btn-result-rematch');
  if (rematchBtn) {
    rematchBtn.addEventListener('click', () => {
      Sound.playClick();
      document.getElementById('battle-result-modal').classList.add('hidden');
      startBattleMatch();
    });
  }
}

function openBattleRosterSelect() {
  const rosterContainer = document.getElementById('battle-roster-select');
  const startBtn = document.getElementById('btn-start-battle');
  const collection = Storage.getCollection();

  document.getElementById('battle-pre-modal').classList.remove('hidden');
  document.getElementById('battle-active-ground').classList.add('hidden');
  document.getElementById('battle-result-modal').classList.add('hidden');

  if (!rosterContainer) return;
  rosterContainer.innerHTML = '';
  startBtn.disabled = true;
  AppState.selectedRosterInstanceId = null;

  if (collection.length === 0) {
    rosterContainer.innerHTML = `
      <div class="empty-collection-state" style="padding: 10px;">
        <p>You have no creatures in your collection!</p>
        <button class="pixel-btn btn-primary" data-nav="view-scan">SCAN NFC CARD FIRST</button>
      </div>
    `;
    const btn = rosterContainer.querySelector('[data-nav="view-scan"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-scan'); });
    return;
  }

  collection.forEach((creature, idx) => {
    const species = SPECIES_CATALOG[creature.speciesId];
    const item = document.createElement('div');
    item.className = 'roster-item';
    item.innerHTML = `
      <span class="type-pill type-${species.type}">${species.type}</span>
      <strong>${creature.nickname}</strong>
      <span>Lv.${creature.level}</span>
      <span style="color: #4ade80;">HP: ${creature.currentHp}/${creature.maxHp}</span>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.roster-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      AppState.selectedRosterInstanceId = creature.instanceId;
      startBtn.disabled = false;
      Sound.playClick();
    });

    // Auto-select first item
    if (idx === 0) {
      item.classList.add('selected');
      AppState.selectedRosterInstanceId = creature.instanceId;
      startBtn.disabled = false;
    }

    rosterContainer.appendChild(item);
  });
}

function startBattleMatch() {
  const playerCreature = Storage.getCreatureById(AppState.selectedRosterInstanceId);
  const oppSpeciesId = document.getElementById('select-ai-opponent').value;

  if (!playerCreature) {
    showToast('Please select a creature first!', 'error');
    return;
  }

  // Create an AI Opponent Instance
  const oppInstance = createCreatureInstance(oppSpeciesId, null, null, 5);

  AppState.activeBattlePlayerCreature = playerCreature;
  AppState.activeBattleOpponentCreature = oppInstance;

  // Initialize pure battle engine
  AppState.activeBattleEngine = new BattleEngine(playerCreature, oppInstance);

  // Switch UI views
  document.getElementById('battle-pre-modal').classList.add('hidden');
  document.getElementById('battle-active-ground').classList.remove('hidden');

  renderBattleGroundInitial();
}

function renderBattleGroundInitial() {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  // Setup Opponent Visuals
  document.getElementById('opp-name').textContent = engine.opponent.nickname;
  document.getElementById('opp-lvl').textContent = `Lv.${engine.opponent.level}`;
  document.getElementById('opp-sprite-holder').innerHTML = SPRITES[engine.opponent.species.spriteKey] || '';
  document.getElementById('opp-sprite-holder').className = 'sprite-holder';
  updateHpBar('opp', engine.opponent.currentHp, engine.opponent.maxHp);

  // Setup Player Visuals
  document.getElementById('player-name').textContent = engine.player.nickname;
  document.getElementById('player-lvl').textContent = `Lv.${engine.player.level}`;
  document.getElementById('player-sprite-holder').innerHTML = SPRITES[engine.player.species.spriteKey] || '';
  document.getElementById('player-sprite-holder').className = 'sprite-holder';
  updateHpBar('player', engine.player.currentHp, engine.player.maxHp);
  document.getElementById('player-hp-numbers').textContent = `${engine.player.currentHp} / ${engine.player.maxHp}`;

  // Dialogue
  setDialogue(`A wild ${engine.opponent.nickname} appeared! What will ${engine.player.nickname} do?`);

  // Render Move Buttons
  renderMoveButtons();
}

function renderMoveButtons() {
  const engine = AppState.activeBattleEngine;
  const grid = document.getElementById('battle-moves-grid');
  if (!grid || !engine) return;

  grid.innerHTML = '';
  engine.player.knownMoveIds.forEach(mId => {
    const move = MOVES[mId];
    if (move) {
      const btn = document.createElement('button');
      btn.className = 'move-btn';
      btn.innerHTML = `
        <div class="move-btn-top">
          <span class="move-btn-name">${move.name}</span>
          <span class="type-pill type-${move.type}" style="font-size: 5px;">${move.type}</span>
        </div>
        <div class="move-btn-pwr">PWR ${move.power}</div>
      `;

      btn.addEventListener('click', () => {
        handlePlayerMoveSelect(move.id);
      });

      grid.appendChild(btn);
    }
  });
}

function handlePlayerMoveSelect(moveId) {
  const engine = AppState.activeBattleEngine;
  if (!engine || engine.isOver) return;

  // Disable move buttons during turn animation
  setMoveButtonsDisabled(true);

  // Execute turn on battle engine
  const turnResult = engine.executeTurn(moveId);

  // Animate turn steps sequentially
  animateTurnSteps(turnResult.steps, 0, () => {
    if (turnResult.isOver) {
      handleBattleFinish(turnResult.winner);
    } else {
      setMoveButtonsDisabled(false);
      setDialogue(`What will ${engine.player.nickname} do next?`);
    }
  });
}

function animateTurnSteps(steps, index, onComplete) {
  if (index >= steps.length) {
    if (onComplete) onComplete();
    return;
  }

  const step = steps[index];

  if (step.type === 'faint') {
    // Creature fainted
    Sound.playFaint();
    setDialogue(step.log);
    const targetHolder = document.getElementById(step.faintedActor === 'player' ? 'player-sprite-holder' : 'opp-sprite-holder');
    if (targetHolder) targetHolder.classList.add('anim-faint');

    setTimeout(() => {
      animateTurnSteps(steps, index + 1, onComplete);
    }, 1200);
    return;
  }

  // Attack Step
  setDialogue(step.log);

  // Sound and shake animation on defender
  if (step.effectiveness === 'super') {
    Sound.playSuperEffective();
  } else {
    Sound.playHit();
  }

  const defenderHolder = document.getElementById(step.actor === 'player' ? 'opp-sprite-holder' : 'player-sprite-holder');
  if (defenderHolder) {
    defenderHolder.classList.remove('anim-shake');
    void defenderHolder.offsetWidth;
    defenderHolder.classList.add('anim-shake');
  }

  // Update HP bar
  const targetPrefix = step.actor === 'player' ? 'opp' : 'player';
  updateHpBar(targetPrefix, step.defenderHp, step.defenderMaxHp);
  if (step.actor === 'opponent') {
    document.getElementById('player-hp-numbers').textContent = `${step.defenderHp} / ${step.defenderMaxHp}`;
  }

  setTimeout(() => {
    animateTurnSteps(steps, index + 1, onComplete);
  }, 1000);
}

function updateHpBar(unitPrefix, currentHp, maxHp) {
  const bar = document.getElementById(`${unitPrefix}-hp-bar`);
  if (!bar) return;

  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  bar.style.width = `${pct}%`;

  bar.classList.remove('warn', 'danger');
  if (pct <= 20) {
    bar.classList.add('danger');
  } else if (pct <= 50) {
    bar.classList.add('warn');
  }
}

function setDialogue(text) {
  const el = document.getElementById('battle-dialogue-text');
  if (el) el.textContent = text;
}

function setMoveButtonsDisabled(disabled) {
  document.querySelectorAll('.move-btn').forEach(b => {
    b.disabled = disabled;
  });
}

function handleBattleFinish(winner) {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  const isPlayerWin = winner === 'player';
  if (isPlayerWin) {
    Sound.playVictory();
  }

  // Generate and save BattleRecord persistently
  const record = engine.generateBattleRecord(
    AppState.activeBattlePlayerCreature.maxHp,
    AppState.activeBattleOpponentCreature.maxHp
  );
  Storage.saveBattleRecord(record);

  // Show outcome modal
  setTimeout(() => {
    const modal = document.getElementById('battle-result-modal');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const stats = document.getElementById('result-stats');

    if (isPlayerWin) {
      title.textContent = 'VICTORY!';
      title.style.color = 'var(--accent-gold)';
      subtitle.textContent = `${engine.player.nickname} defeated ${engine.opponent.nickname}!`;
    } else {
      title.textContent = 'DEFEAT...';
      title.style.color = 'var(--accent-red)';
      subtitle.textContent = `${engine.player.nickname} was defeated in combat.`;
    }

    stats.innerHTML = `
      <div><strong>Battle Record Saved</strong></div>
      <div>Turns Taken: ${record.turnsTaken}</div>
      <div>Final HP: ${record.playerSummary.nickname} (${record.playerSummary.endHp}/${record.playerSummary.maxHp})</div>
      <div>Opponent: ${record.opponentSummary.nickname} (${record.opponentSummary.endHp}/${record.opponentSummary.maxHp})</div>
    `;

    modal.classList.remove('hidden');
  }, 800);
}

function recordAbortedBattle() {
  const engine = AppState.activeBattleEngine;
  if (!engine) return;

  const record = {
    recordId: 'rec_abort_' + Date.now().toString(36),
    timestampUtc: new Date().toISOString(),
    playerSummary: {
      instanceId: engine.player.instanceId,
      speciesName: engine.player.species.name,
      nickname: engine.player.nickname,
      level: engine.player.level,
      startHp: engine.player.maxHp,
      endHp: engine.player.currentHp,
      maxHp: engine.player.maxHp
    },
    opponentSummary: {
      speciesName: engine.opponent.species.name,
      nickname: engine.opponent.nickname,
      level: engine.opponent.level,
      startHp: engine.opponent.maxHp,
      endHp: engine.opponent.currentHp,
      maxHp: engine.opponent.maxHp
    },
    turnsTaken: engine.turn,
    outcome: 'Aborted',
    actionLog: engine.actionHistory
  };

  Storage.saveBattleRecord(record);
  AppState.activeBattleEngine = null;
}

// -------------------------------------------------------------------
// VIEW 5: BATTLE RECORDS (HISTORY)
// -------------------------------------------------------------------
function initHistory() {
  const clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all battle records?')) {
        Storage.clearBattleHistory();
        Sound.playClick();
        renderHistory();
        showToast('Battle history cleared.', 'info');
      }
    });
  }
}

function renderHistory() {
  const container = document.getElementById('history-list');
  const records = Storage.getBattleHistory();
  if (!container) return;

  container.innerHTML = '';
  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-collection-state">
        <p>No battle records recorded yet!</p>
        <button class="pixel-btn btn-battle" data-nav="view-battle">GO TO BATTLE ARENA</button>
      </div>
    `;
    const btn = container.querySelector('[data-nav="view-battle"]');
    if (btn) btn.addEventListener('click', () => { Sound.playClick(); navigateTo('view-battle'); });
    return;
  }

  records.forEach(rec => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const dateFormatted = new Date(rec.timestampUtc).toLocaleDateString() + ' ' + new Date(rec.timestampUtc).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-outcome ${rec.outcome}">${rec.outcome.toUpperCase()}</span>
        <span class="history-meta">${dateFormatted}</span>
      </div>
      <div class="history-matchup">
        <strong>${rec.playerSummary.nickname}</strong> (HP: ${rec.playerSummary.endHp}/${rec.playerSummary.maxHp}) vs <strong>${rec.opponentSummary.nickname}</strong>
      </div>
      <div class="history-meta">
        Turns: ${rec.turnsTaken} | Record ID: ${rec.recordId.substring(0, 12)}...
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------------
// VIEW 6: SETTINGS & DATA
// -------------------------------------------------------------------
function initSettings() {
  const soundBtn = document.getElementById('setting-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = Sound.toggle();
      soundBtn.classList.toggle('active', enabled);
      soundBtn.textContent = enabled ? 'ENABLED' : 'DISABLED';
      if (enabled) Sound.playClick();
    });
  }

  const crtBtn = document.getElementById('setting-crt-btn');
  if (crtBtn) {
    crtBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-enabled');
      const active = document.body.classList.contains('crt-enabled');
      crtBtn.classList.toggle('active', active);
      crtBtn.textContent = active ? 'ENABLED' : 'DISABLED';
      Sound.playClick();
    });
  }

  const inspectBtn = document.getElementById('btn-inspect-json');
  const jsonBox = document.getElementById('json-viewer-box');
  const jsonPre = document.getElementById('json-pre-content');
  const closeJsonBtn = document.getElementById('btn-close-json');

  if (inspectBtn && jsonBox && jsonPre) {
    inspectBtn.addEventListener('click', () => {
      const dump = Storage.exportDump();
      jsonPre.textContent = JSON.stringify(dump, null, 2);
      jsonBox.classList.remove('hidden');
      Sound.playClick();
    });
  }

  if (closeJsonBtn && jsonBox) {
    closeJsonBtn.addEventListener('click', () => {
      jsonBox.classList.add('hidden');
      Sound.playClick();
    });
  }

  const exportBtn = document.getElementById('btn-export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dump = Storage.exportDump();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monsterlink_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Sound.playScanSuccess();
      showToast('Data exported successfully!', 'success');
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('DANGER: This will erase all registered creatures and battle history! Continue?')) {
        Storage.clearAll();
        Sound.playError();
        updateCollectionBadge();
        showToast('All storage data has been reset.', 'info');
      }
    });
  }
}

// -------------------------------------------------------------------
// DEMO SEEDING HELPER
// -------------------------------------------------------------------
function seedDemoData() {
  if (!Storage.isCardRegistered('ML-CARD-IGNI-01')) {
    const igni = createCreatureInstance('species_ignisaur', 'ML-CARD-IGNI-01', 'Ignisaur', 5);
    Storage.addCreature(igni);
    Storage.registerCard('ML-CARD-IGNI-01', igni.instanceId);
  }

  if (!Storage.isCardRegistered('ML-CARD-AQUA-02')) {
    const aqua = createCreatureInstance('species_aquabite', 'ML-CARD-AQUA-02', 'Aquabite', 5);
    Storage.addCreature(aqua);
    Storage.registerCard('ML-CARD-AQUA-02', aqua.instanceId);
  }
}
