// MonsterLink 8-Bit Web Audio Synthesizer
// Generates authentic retro chiptune SFX without external audio files

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, gainStart = 0.15, gainEnd = 0.001) {
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
    } catch {
      // Audio autoplay policy catch
    }
  }

  // UI Click / Navigation Blip
  public playClick() {
    this.playTone(520, 'square', 0.06, 0.1);
  }

  // NFC Scan success chime
  public playScanSuccess() {
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
  public playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.playTone(180, 'sawtooth', 0.18, 0.2);
    setTimeout(() => {
      this.playTone(140, 'sawtooth', 0.25, 0.2);
    }, 120);
  }

  // Battle: Physical attack impact
  public playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
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
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Battle: Fire move (whoosh + sizzle explosion)
  public playFireMove() {
    this.playHit();
    this.playTone(320, 'sawtooth', 0.22, 0.2, 0.01);
    setTimeout(() => this.playTone(180, 'square', 0.25, 0.25, 0.01), 60);
  }

  // Battle: Water move (rapid bubbling cascade)
  public playWaterMove() {
    const bubbles = [400, 600, 520, 750, 640];
    bubbles.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.08, 0.18, 0.01);
      }, idx * 45);
    });
  }

  // Battle: Grass move (sharp leafy whip slash)
  public playGrassMove() {
    this.playHit();
    this.playTone(880, 'triangle', 0.1, 0.2, 0.01);
    setTimeout(() => this.playTone(550, 'sawtooth', 0.15, 0.15, 0.01), 50);
  }

  // Battle: Electric move (rapid high voltage discharge zaps)
  public playElectricMove() {
    const freqs = [800, 300, 950, 420, 1100];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.06, 0.22, 0.01);
      }, idx * 35);
    });
  }

  // Battle: Ice move (chime frost shatter)
  public playIceMove() {
    const notes = [880, 1175, 1568];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.12, 0.2, 0.01);
      }, idx * 60);
    });
    setTimeout(() => this.playHit(), 120);
  }

  // Battle: Rock / Ground move (deep rumble and shatter)
  public playRockMove() {
    this.playHit();
    this.playTone(110, 'square', 0.35, 0.3, 0.01);
    setTimeout(() => this.playTone(75, 'sawtooth', 0.28, 0.25, 0.01), 70);
  }

  // Battle: Ghost / Dark move (ominous descending distortion)
  public playShadowMove() {
    this.playTone(330, 'sawtooth', 0.25, 0.2, 0.01);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.3, 0.22, 0.01), 80);
    setTimeout(() => this.playTone(146, 'square', 0.35, 0.25, 0.01), 160);
  }

  // Battle: Flying / Wind move (whirling gale rush)
  public playWindMove() {
    this.playTone(587, 'sine', 0.2, 0.18, 0.01);
    setTimeout(() => this.playTone(784, 'triangle', 0.18, 0.2, 0.01), 60);
  }

  // Dispatch sound by elemental type
  public playSkillSound(elementType?: string) {
    switch (elementType?.toLowerCase()) {
      case 'fire':
        this.playFireMove();
        break;
      case 'water':
        this.playWaterMove();
        break;
      case 'grass':
        this.playGrassMove();
        break;
      case 'electric':
        this.playElectricMove();
        break;
      case 'ice':
        this.playIceMove();
        break;
      case 'rock':
      case 'ground':
      case 'steel':
        this.playRockMove();
        break;
      case 'ghost':
      case 'dark':
      case 'psychic':
      case 'poison':
        this.playShadowMove();
        break;
      case 'flying':
      case 'fairy':
      case 'dragon':
        this.playWindMove();
        break;
      default:
        this.playHit();
        break;
    }
  }

  // Battle: Super Effective strike
  public playSuperEffective() {
    this.playHit();
    setTimeout(() => {
      this.playTone(880, 'square', 0.15, 0.18);
    }, 50);
  }

  // Battle: Creature Faint
  public playFaint() {
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
  public playVictory() {
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
