// ============================================================================
// DIAVET CYBER SOUND ENGINE & AMBIENT MUSIC SYNTHESIZER
// High-fidelity Web Audio API engine for realistic animal sounds,
// futuristic UI sound effects, and generative ambient welcome music.
// ============================================================================

export type BgmMode = 'cyber_algiers' | 'neo_zen' | 'future_pulse';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private isMuted: boolean = false;
  private currentBgmMode: BgmMode = 'cyber_algiers';
  private bgmInterval: any = null;
  private bgmNotesInterval: any = null;
  private suspendTimeout: any = null;

  constructor() {
    // Check saved preferences or default
    try {
      const savedMuted = localStorage.getItem('diavet_music_muted');
      this.isMuted = savedMuted === null ? true : savedMuted === 'true';
      const savedMode = localStorage.getItem('diavet_bgm_mode') as BgmMode;
      if (savedMode && ['cyber_algiers', 'neo_zen', 'future_pulse'].includes(savedMode)) {
        this.currentBgmMode = savedMode;
      }
    } catch {
      this.isMuted = true;
    }
  }

  // Initialize or resume AudioContext safely on user interaction
  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Master SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      // Master BGM Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public scheduleSuspend() {
    if (this.isBgmPlaying) return;
    if (this.suspendTimeout) clearTimeout(this.suspendTimeout);
    this.suspendTimeout = setTimeout(() => {
      if (this.ctx && !this.isBgmPlaying && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    }, 1200);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying && !this.isMuted;
  }

  public getBgmMode(): BgmMode {
    return this.currentBgmMode;
  }

  public setBgmMode(mode: BgmMode) {
    this.currentBgmMode = mode;
    try {
      localStorage.setItem('diavet_bgm_mode', mode);
    } catch {}
    if (this.isBgmPlaying) {
      this.stopWelcomeMusic();
      this.startWelcomeMusic();
    }
  }

  public cycleBgmMode(): BgmMode {
    const modes: BgmMode[] = ['cyber_algiers', 'neo_zen', 'future_pulse'];
    const nextIdx = (modes.indexOf(this.currentBgmMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    this.setBgmMode(nextMode);
    return nextMode;
  }

  // Toggle Background Music Mute
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('diavet_music_muted', String(this.isMuted));
    } catch {}

    if (this.bgmGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.22, now + 0.2);
    }

    if (!this.isMuted && !this.isBgmPlaying) {
      this.startWelcomeMusic();
    }

    return this.isMuted;
  }

  // ============================================================================
  // GENERATIVE AMBIENT CYBER & BIO-VETERINARY MUSIC SYNTHESIZER
  // High-tech atmospheric chord progressions, ambient shimmers, and melodic pads
  // ============================================================================
  public startWelcomeMusic() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;

    if (this.currentBgmMode === 'neo_zen') {
      this.startZenAmbient();
    } else if (this.currentBgmMode === 'future_pulse') {
      this.startFuturePulse();
    } else {
      this.startCyberAlgiersAmbient();
    }
  }

  // 1. MODE: CYBER ALGIERS AMBIENT (Lush, dreamlike, high-contrast cyber chords)
  private startCyberAlgiersAmbient() {
    if (!this.ctx || !this.bgmGain) return;
    const chords = [
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9 / E
      [110.00, 164.81, 196.00, 261.63, 329.63], // Am9
      [87.31, 130.81, 174.61, 220.00, 261.63],  // Fmaj7#11
      [98.00, 146.83, 196.00, 246.94, 293.66],  // Gsus4 / D
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, i) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const noteGain = this.ctx.createGain();

        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(i === 0 ? 300 : 700 + Math.sin(now * 0.5) * 200, now);
        filter.Q.setValueAtTime(1.5, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.045 / (i + 1), now + 1.4);
        noteGain.gain.linearRampToValueAtTime(0.028 / (i + 1), now + 3.4);
        noteGain.gain.linearRampToValueAtTime(0.0001, now + 5.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 5.3);
      });
    };

    const arpNotes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    let arpStep = 0;

    const playArp = () => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;
      if (Math.random() > 0.25) {
        const note = arpNotes[arpStep % arpNotes.length];
        arpStep++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.9);
      }
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 5000);
    this.bgmNotesInterval = setInterval(playArp, 650);
  }

  // 2. MODE: NEO-VETERINARY ZEN (Gentle organic pentatonic chords, soothing bells, purr vibrations, calm clinical serenity)
  private startZenAmbient() {
    if (!this.ctx || !this.bgmGain) return;
    const zenChords = [
      [146.83, 220.00, 293.66, 369.99, 440.00], // D maj9
      [164.81, 246.94, 329.63, 392.00, 493.88], // E min7(9)
      [196.00, 293.66, 369.99, 440.00, 587.33], // G maj9
      [146.83, 220.00, 293.66, 440.00, 554.37], // D add9 / F#
    ];
    let chordIdx = 0;

    const playZenChord = () => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;
      const chord = zenChords[chordIdx % zenChords.length];
      chordIdx++;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.032 / (i + 1), now + 2.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 6.4);
      });
    };

    // Soft gentle chime melody (sweet lullaby bell notes for soothing pets and owners)
    const chimeMelody = [440.00, 554.37, 659.25, 739.99, 880.00, 659.25, 554.37, 493.88];
    let chimeIdx = 0;

    const playZenChime = () => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;
      const noteFreq = chimeMelody[chimeIdx % chimeMelody.length];
      chimeIdx++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 1.9);
    };

    playZenChord();
    playZenChime();
    this.bgmInterval = setInterval(playZenChord, 6000);
    this.bgmNotesInterval = setInterval(playZenChime, 1800);
  }

  // Quick helper to start or toggle gentle relaxing music directly
  public startDouceMusique() {
    this.currentBgmMode = 'neo_zen';
    try {
      localStorage.setItem('diavet_bgm_mode', 'neo_zen');
      localStorage.setItem('diavet_music_muted', 'false');
    } catch {}
    this.isMuted = false;
    this.init();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
    }
    if (this.isBgmPlaying) {
      this.stopWelcomeMusic();
    }
    this.startWelcomeMusic();
  }

  public toggleDouceMusique(): boolean {
    if (this.isBgmPlaying && !this.isMuted) {
      this.toggleMute();
      return false;
    } else {
      this.startDouceMusique();
      return true;
    }
  }

  // 3. MODE: FUTURE PULSE DZ (High tech cyber pulse arpeggios, energy rhythm)
  private startFuturePulse() {
    if (!this.ctx || !this.bgmGain) return;
    const pulseNotes = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25];
    let step = 0;

    const playPulseStep = () => {
      if (!this.ctx || !this.bgmGain || !this.isBgmPlaying) return;
      const now = this.ctx.currentTime;
      const note = pulseNotes[step % pulseNotes.length];
      step++;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.sin(now * 2) * 500, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.4);
    };

    this.bgmNotesInterval = setInterval(playPulseStep, 250);
  }

  public stopWelcomeMusic() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmNotesInterval) {
      clearInterval(this.bgmNotesInterval);
      this.bgmNotesInterval = null;
    }
  }

  // ============================================================================
  // REAL RECORDED ANIMAL AUDIO SOUNDS (AUTHENTIC SOUNDS)
  // ============================================================================

  private realAudioElements: Record<string, HTMLAudioElement[]> = {};

  private readonly REAL_ANIMAL_SOURCES: Record<string, string[]> = {
    chat: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Meow.ogg',
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Meow_domestic_cat.ogg'
    ],
    chien: [
      'https://upload.wikimedia.org/wikipedia/commons/2/22/Barking_of_a_dog.ogg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Barking_of_a_dog_2.ogg'
    ],
    oiseau: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Bird_singing.ogg'
    ],
    cheval: [
      'https://upload.wikimedia.org/wikipedia/commons/a/af/Horse_neighing.ogg'
    ]
  };

  private playRealAnimalAudio(species: 'chat' | 'chien' | 'oiseau' | 'cheval', fallbackFn: () => void) {
    if (this.isMuted) return;
    this.init();
    // Use harmonic Web Audio acoustic synthesis directly
    // This avoids creating HTMLMediaElement sessions that hijack the iOS Dynamic Island
    try {
      fallbackFn();
    } catch {}
    this.scheduleSuspend();
  }

  // 1. CHAT (CAT: Real Recorded Cat Meow + Harmonic Fallback)
  public playCatMeow() {
    this.playRealAnimalAudio('chat', () => this.synthesizeCatMeow());
  }

  public synthesizeCatMeow() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const formantFilter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';

    // Pitch contour of a meow: starts at ~350Hz, rises to ~520Hz, drops to ~300Hz
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.75);

    // Formant filter simulating feline vocal tract ("ee" -> "ow")
    formantFilter.type = 'bandpass';
    formantFilter.Q.setValueAtTime(4.0, now);
    formantFilter.frequency.setValueAtTime(900, now);
    formantFilter.frequency.linearRampToValueAtTime(1400, now + 0.25);
    formantFilter.frequency.linearRampToValueAtTime(600, now + 0.75);

    // Volume envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.15);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(formantFilter);
    formantFilter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);

    // Secondary subtle harmonic purr
    const purrOsc = this.ctx.createOscillator();
    const purrGain = this.ctx.createGain();
    purrOsc.type = 'sine';
    purrOsc.frequency.setValueAtTime(25, now); // 25Hz purr rumble
    purrGain.gain.setValueAtTime(0.05, now);
    purrGain.gain.linearRampToValueAtTime(0.001, now + 0.8);

    purrOsc.connect(purrGain);
    purrGain.connect(this.sfxGain);
    purrOsc.start(now);
    purrOsc.stop(now + 0.8);
  }

  // 2. CHIEN (DOG: Real Recorded Barking + Synthesis Fallback)
  public playDogBark() {
    this.playRealAnimalAudio('chien', () => this.synthesizeDogBark());
  }

  public synthesizeDogBark() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const makeSingleBark = (startTime: number, pitchMult: number = 1.0) => {
      if (!this.ctx || !this.sfxGain) return;
      
      // Resonant body tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 * pitchMult, startTime);
      osc.frequency.exponentialRampToValueAtTime(90 * pitchMult, startTime + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, startTime);
      filter.frequency.exponentialRampToValueAtTime(300, startTime + 0.18);

      oscGain.gain.setValueAtTime(0.001, startTime);
      oscGain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);

      // Throat noise burst (husky bark rasp)
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450 * pitchMult, startTime);
      noiseFilter.Q.setValueAtTime(2.5, startTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(startTime);
    };

    // Double playful bark: Woof! ... Woof!
    makeSingleBark(now, 1.0);
    makeSingleBark(now + 0.22, 1.15);
  }

  // 3. OISEAU (BIRD: Real Recorded Bird Song + Synthesis Fallback)
  public playBirdChirp() {
    this.playRealAnimalAudio('oiseau', () => this.synthesizeBirdChirp());
  }

  public synthesizeBirdChirp() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const makeChirp = (startTime: number, baseFreq: number) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, startTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + 0.12);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    };

    makeChirp(now, 1900);
    makeChirp(now + 0.14, 2300);
    makeChirp(now + 0.28, 2100);
  }

  // 4. CHEVAL (HORSE: Real Recorded Neigh + Synthesis Fallback)
  public playHorseWhinny() {
    this.playRealAnimalAudio('cheval', () => this.synthesizeHorseWhinny());
  }

  public synthesizeHorseWhinny() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(1100, now + 0.3);
    osc.frequency.linearRampToValueAtTime(450, now + 0.85);

    // Vibrato/Tremolo
    lfo.frequency.setValueAtTime(16, now);
    lfoGain.gain.setValueAtTime(70, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(2.0, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(now);
    osc.start(now);
    osc.stop(now + 0.95);
    lfo.stop(now + 0.95);
  }

  // 6. Universal dispatcher by animal keyword / string
  public playAnimalSound(animalName: string) {
    const clean = animalName.toLowerCase();
    if (clean.includes('chat') || clean.includes('cat') || clean.includes('félin') || clean.includes('kitten')) {
      this.playCatMeow();
    } else if (clean.includes('chien') || clean.includes('dog') || clean.includes('canin') || clean.includes('puppy')) {
      this.playDogBark();
    } else if (clean.includes('oiseau') || clean.includes('bird') || clean.includes('perroquet') || clean.includes('canari')) {
      this.playBirdChirp();
    } else if (clean.includes('cheval') || clean.includes('horse') || clean.includes('équin')) {
      this.playHorseWhinny();
    } else {
      // Default cute chime
      this.playCatMeow();
    }
  }

  // ============================================================================
  // FUTURISTIC CYBER UI SFX
  // ============================================================================

  // Sci-fi holographic click / button blip
  public playCyberClick() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
    this.scheduleSuspend();
  }

  // Badge Forge Celebratory Laser Chime
  public playBadgeForged() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Rising arpeggiated chords
    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Mode Switch Warp (Veterinarian <=> Owner)
  public playWarpSwitch() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 0.2);
    filter.frequency.linearRampToValueAtTime(500, now + 0.4);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  // Soft bubble pop SFX for interactive selections
  public playPop() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Step advancement & success chime
  public playSuccess() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.28);
    });
  }

  // Error alert tone
  public playError() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Celebration & reward fanfare
  public playCelebration() {
    this.playBadgeForged();
  }

  // Level Up / Registration Sound
  public playLevelUp() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.55);
    });
  }

  // ============================================================================
  // FUTURISTIC CYBER SFX
  // ============================================================================

  // Holographic Laser Scanner sweep
  public playHoloScan() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);

    filter.type = 'bandpass';
    filter.Q.setValueAtTime(5, now);
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1600, now + 0.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  // Quantum biometric unlock chime
  public playQuantumUnlock() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const freqs = [659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.45);
    });
  }

  // Realtime Bio-Telemetry pulse beep
  public playBioTelemetry() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.03);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Cyber Shield activation hum
  public playCyberShield() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }
}

export const soundEngine = new SoundEngine();
