// Web Audio API Synthesizer for tactile audio feedback
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Soft pleasant click / bubble pop
  pop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }

  // Playful spring dodge sound
  dodge() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(240, t + 0.16);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  // Romantic sparkle chime on "Yes"
  sparkle() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      } catch {}
    });
  }

  // Celebratory warm chime sequence
  celebrate() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [
      { f: 523.25, d: 0.0 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.2 }, // G5
      { f: 1046.5, d: 0.3 }, // C6
      { f: 1318.51, d: 0.45 }, // E6
      { f: 1567.98, d: 0.6 }, // G6
    ];

    chords.forEach(({ f, d }) => {
      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = this.ctx!.currentTime + d;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.5);
      } catch {}
    });
  }
}

export const sound = new SoundSynthesizer();
