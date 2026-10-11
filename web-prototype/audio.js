// MonsterLink 8-Bit Web Audio Synthesizer
// Generates authentic retro chiptune SFX without external audio files

class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // UI Click / Navigation Blip
  playClick() {
    this.playTone(520, 'square', 0.06, 0.1);
  }

  // NFC Scan success chime
  playScanSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [392, 523, 659, 784]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.15);
      }, idx * 70);
    });
  }

  // Duplicate / Error buzzer
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.playTone(180, 'sawtooth', 0.18, 0.2);
    setTimeout(() => {
      this.playTone(140, 'sawtooth', 0.25, 0.2);
    }, 120);
  }

  // Battle: Physical attack impact
  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      // White noise burst for impact
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      noise.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Battle: Super Effective strike
  playSuperEffective() {
    this.playHit();
    setTimeout(() => {
      this.playTone(880, 'square', 0.15, 0.18);
    }, 50);
  }

  // Battle: Creature Faint
  playFaint() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [440, 370, 311, 220, 155];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.18, 0.15);
      }, idx * 100);
    });
  }

  // Battle: Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 523, d: 0.12 }, // C
      { f: 523, d: 0.12 },
      { f: 523, d: 0.12 },
      { f: 523, d: 0.30 },
      { f: 415, d: 0.30 }, // G#
      { f: 466, d: 0.30 }, // A#
      { f: 523, d: 0.50 }  // C
    ];

    let delay = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.2);
      }, delay);
      delay += (note.d + 0.05) * 1000;
    });
  }
}

export const Sound = new SoundController();
