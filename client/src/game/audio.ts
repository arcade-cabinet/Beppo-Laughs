// Procedural Audio System using Web Audio API
// Creates creepy carnival/circus sounds without external files

class ProceduralAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeSources: AudioBufferSourceNode[] = [];
  private isInitialized = false;

  // Ambient drone state
  private droneOscillators: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;

  async init() {
    if (this.isInitialized) return;

    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.context.destination);

    this.isInitialized = true;
  }

  async resume() {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  // Create white/pink noise buffer
  private createNoiseBuffer(duration: number, type: 'white' | 'pink' = 'white'): AudioBuffer {
    if (!this.context) throw new Error('Audio not initialized');

    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pink noise (1/f)
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    return buffer;
  }

  // Creepy laugh generator
  playCreepyLaugh(intensity: number = 0.5) {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;
    const laughGain = this.context.createGain();
    laughGain.connect(this.masterGain);
    laughGain.gain.value = 0;

    // Create multiple detuned oscillators for unsettling quality
    const frequencies = [180, 220, 280, 350]; // Creepy vocal range
    const syllables = Math.floor(3 + Math.random() * 5); // "HA HA HA..."

    for (let s = 0; s < syllables; s++) {
      const syllableStart = now + s * 0.25;
      const syllableDuration = 0.15 + Math.random() * 0.1;

      frequencies.forEach((baseFreq, i) => {
        const osc = this.context?.createOscillator();
        const oscGain = this.context?.createGain();

        // Use different waveforms for texture
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = baseFreq * (0.9 + Math.random() * 0.2);

        // Vibrato for creepiness
        const vibrato = this.context?.createOscillator();
        const vibratoGain = this.context?.createGain();
        vibrato.frequency.value = 5 + Math.random() * 3;
        vibratoGain.gain.value = 10 + intensity * 20;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(syllableStart);
        vibrato.stop(syllableStart + syllableDuration);

        oscGain.gain.setValueAtTime(0, syllableStart);
        oscGain.gain.linearRampToValueAtTime(0.15 * intensity, syllableStart + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.01, syllableStart + syllableDuration);

        osc.connect(oscGain);
        oscGain.connect(laughGain);

        osc.start(syllableStart);
        osc.stop(syllableStart + syllableDuration + 0.1);

        this.activeOscillators.push(osc);
      });
    }

    // Add some noise for breath/rasp quality
    const noise = this.context.createBufferSource();
    noise.buffer = this.createNoiseBuffer(syllables * 0.3);
    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 2;
    const noiseGain = this.context.createGain();
    noiseGain.gain.value = 0.1 * intensity;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(laughGain);
    noise.start(now);

    // Fade in laugh
    laughGain.gain.setValueAtTime(0, now);
    laughGain.gain.linearRampToValueAtTime(intensity, now + 0.05);
    laughGain.gain.setValueAtTime(intensity, now + syllables * 0.25 - 0.1);
    laughGain.gain.exponentialRampToValueAtTime(0.01, now + syllables * 0.25 + 0.5);

    this.activeSources.push(noise);
  }

  // Distorted carnival organ
  playDistortedOrgan(note: number = 60, duration: number = 1) {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;
    const freq = 440 * 2 ** ((note - 69) / 12);

    const organGain = this.context.createGain();
    organGain.connect(this.masterGain);

    // Multiple harmonics for organ sound
    [1, 2, 3, 4, 5, 6].forEach((harmonic, i) => {
      const osc = this.context?.createOscillator();
      const oscGain = this.context?.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq * harmonic;

      // Slight detuning for creepiness
      osc.detune.value = (Math.random() - 0.5) * 30;

      oscGain.gain.value = 0.1 / harmonic;

      osc.connect(oscGain);
      oscGain.connect(organGain);

      osc.start(now);
      osc.stop(now + duration);

      this.activeOscillators.push(osc);
    });

    // Tremolo effect
    const tremolo = this.context.createOscillator();
    const tremoloGain = this.context.createGain();
    tremolo.frequency.value = 4;
    tremoloGain.gain.value = 0.3;
    tremolo.connect(tremoloGain);
    tremoloGain.connect(organGain.gain);
    tremolo.start(now);
    tremolo.stop(now + duration);

    organGain.gain.setValueAtTime(0.2, now);
    organGain.gain.setValueAtTime(0.2, now + duration - 0.2);
    organGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  }

  // Ambient horror drone
  startAmbientDrone(fearLevel: number = 0.5) {
    if (!this.context || !this.masterGain) return;

    // Stop existing drone
    this.stopAmbientDrone();

    this.droneGain = this.context.createGain();
    this.droneGain.gain.value = 0.1 + fearLevel * 0.15;
    this.droneGain.connect(this.masterGain);

    // Low rumbling frequencies
    [40, 60, 80, 120].forEach((freq, i) => {
      const osc = this.context?.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq + Math.random() * 5;

      // Slow wobble
      const lfo = this.context?.createOscillator();
      const lfoGain = this.context?.createGain();
      lfo.frequency.value = 0.1 + Math.random() * 0.2;
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      const oscGain = this.context?.createGain();
      oscGain.gain.value = 0.1 / (i + 1);

      osc.connect(oscGain);
      oscGain.connect(this.droneGain!);

      osc.start();
      this.droneOscillators.push(osc, lfo);
    });

    // Add filtered noise layer
    const noise = this.context.createBufferSource();
    noise.buffer = this.createNoiseBuffer(60, 'pink');
    noise.loop = true;

    const lowpass = this.context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 200 + fearLevel * 300;

    const noiseGain = this.context.createGain();
    noiseGain.gain.value = 0.05 + fearLevel * 0.1;

    noise.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(this.droneGain);
    noise.start();

    this.activeSources.push(noise);
  }

  stopAmbientDrone() {
    this.droneOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (_e) {}
    });
    this.droneOscillators = [];

    if (this.droneGain) {
      this.droneGain.disconnect();
      this.droneGain = null;
    }
  }

  // Footstep sounds
  playFootstep() {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;

    const noise = this.context.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.1);

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // Jump scare stinger
  playJumpScare() {
    if (!this.context || !this.masterGain) return;

    const now = this.context.currentTime;
    const stingerGain = this.context.createGain();
    stingerGain.connect(this.masterGain);
    stingerGain.gain.value = 0.4;

    // Harsh, dissonant chord
    [150, 158, 200, 237, 316].forEach((freq) => {
      const osc = this.context?.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.connect(stingerGain);
      osc.start(now);
      osc.stop(now + 0.3);
      this.activeOscillators.push(osc);
    });

    // Fast attack, quick decay
    stingerGain.gain.setValueAtTime(0, now);
    stingerGain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    stingerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    // Follow with distorted laugh
    setTimeout(() => this.playCreepyLaugh(0.8), 100);
  }

  // Sanity distortion - warped sounds at low sanity
  playSanityDistortion(sanityLevel: number) {
    if (!this.context || !this.masterGain) return;
    if (sanityLevel > 50) return; // Only at low sanity

    const intensity = (50 - sanityLevel) / 50;
    const now = this.context.currentTime;

    // Warped whispers
    const whisperGain = this.context.createGain();
    whisperGain.gain.value = 0.1 * intensity;
    whisperGain.connect(this.masterGain);

    // Multiple detuned oscillators
    for (let i = 0; i < 3; i++) {
      const osc = this.context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 200 + Math.random() * 100;

      const tremolo = this.context.createOscillator();
      tremolo.frequency.value = 10 + Math.random() * 20;
      const tremoloGain = this.context.createGain();
      tremoloGain.gain.value = 50;
      tremolo.connect(tremoloGain);
      tremoloGain.connect(osc.frequency);

      osc.connect(whisperGain);
      tremolo.start(now);
      osc.start(now);
      osc.stop(now + 0.5 + Math.random());
      tremolo.stop(now + 0.5 + Math.random());

      this.activeOscillators.push(osc, tremolo);
    }
  }

  // Update drone based on fear level
  updateDroneIntensity(fearLevel: number) {
    if (this.droneGain && this.context) {
      const targetGain = 0.1 + (fearLevel / 100) * 0.2;
      this.droneGain.gain.linearRampToValueAtTime(targetGain, this.context.currentTime + 0.5);
    }
  }

  // Cleanup
  cleanup() {
    this.stopAmbientDrone();
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (_e) {}
    });
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (_e) {}
    });
    this.activeOscillators = [];
    this.activeSources = [];
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioSystem = new ProceduralAudio();
