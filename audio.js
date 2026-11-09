// Procedural Web Audio Synthesizer for Block Blast! (iOS Safari Compatible)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('bb_sound') !== 'off';
    this.unlocked = false;

    // Musical scale frequencies (C major / pentatonic ascending) for combo progression
    this.comboNotes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50 // C6
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.unlocked) {
      // Play a tiny audible click to truly wake up iOS WebAudio hardware
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        gain.gain.value = 0.001; // nearly silent, but non-zero
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(0);
        osc.stop(this.ctx.currentTime + 0.05);
        this.unlocked = true;
      } catch (e) {}
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('bb_sound', this.enabled ? 'on' : 'off');
    if (this.enabled) {
      this.init();
      this.playPickup();
    }
    return this.enabled;
  }

  tone(freq, type, duration, gainVal = 0.15, startTimeOffset = 0, slideToFreq = null) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startTimeOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + Math.min(0.015, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playPickup() {
    // Crisp pop sound when lifting a piece from the dock
    this.tone(320, 'sine', 0.085, 0.16, 0, 520);
  }

  playHoverTick() {
    // Ultra-subtle magnetic tick when moving across grid cells
    this.tone(480, 'triangle', 0.025, 0.04, 0, 420);
  }

  playReturn() {
    // Soft drop back into dock
    this.tone(360, 'sine', 0.09, 0.12, 0, 210);
  }

  playPlace(blockCount = 4) {
    // Satisfying thud + woody click when locking a piece onto the board
    const baseFreq = Math.max(140, 230 - blockCount * 8);
    this.tone(baseFreq, 'triangle', 0.11, 0.22, 0, baseFreq * 1.25);
    this.tone(baseFreq * 2, 'sine', 0.06, 0.1, 0.015, baseFreq * 2.4);
  }

  playLineClear(linesCleared = 1, comboStreak = 1, isAllClear = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const idx = Math.min(this.comboNotes.length - 4, Math.max(0, (comboStreak - 1) + (linesCleared - 1)));
    const noteCount = Math.min(6, 3 + linesCleared);

    // Ascending crystal arpeggio
    for (let i = 0; i < noteCount; i++) {
      const f = this.comboNotes[Math.min(this.comboNotes.length - 1, idx + i)];
      this.tone(f, 'triangle', 0.28, 0.18, i * 0.055);
      this.tone(f * 2, 'sine', 0.22, 0.08, i * 0.055 + 0.01);
    }

    // Extra fanfare chord for multi-line or high combo
    if (linesCleared >= 2 || comboStreak >= 2 || isAllClear) {
      const root = this.comboNotes[Math.min(this.comboNotes.length - 3, idx + 2)];
      this.tone(root, 'sine', 0.45, 0.14, 0.18);
      this.tone(root * 1.25, 'sine', 0.45, 0.12, 0.20);
      this.tone(root * 1.5, 'triangle', 0.5, 0.14, 0.22);
    }

    if (isAllClear) {
      // Grand celebration fanfare for clearing the entire board
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        this.tone(freq, 'triangle', 0.55, 0.2, 0.32 + i * 0.07);
      });
    }
  }

  playNewRecord() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, 'triangle', 0.32, 0.18, i * 0.08);
    });
  }

  playGameOver() {
    const notes = [392.00, 349.23, 329.63, 261.63];
    notes.forEach((n, i) => {
      this.tone(n, 'sawtooth', 0.28, 0.09, i * 0.12, n * 0.96);
    });
  }
}

window.soundEngine = new SoundEngine();
