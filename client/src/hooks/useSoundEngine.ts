// Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
// This shared hook keeps all generated Web Audio cues consistent across the manual board and fullscreen Performance Mode.
import { useRef } from "react";

export type Category = "chaos" | "impact" | "magic" | "romance" | "finale" | "utility";

export type LoopHandle = () => void;

export type SoundEngine = {
  ctx: AudioContext;
  master: GainNode;
  playNoiseBurst: (duration: number, filter: number, gain: number, when?: number) => void;
  playTone: (freq: number, duration: number, type?: OscillatorType, gain?: number, when?: number) => void;
  playSweep: (from: number, to: number, duration: number, gain?: number, when?: number) => void;
  createLoop: (kind: "tornado" | "rumble" | "restoration" | "preshow") => LoopHandle;
};

export type Cue = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  category: Category;
  icon: "wind" | "bolt" | "crash" | "sparkles" | "heart" | "music";
  loop?: boolean;
  builder: (engine: SoundEngine) => void | LoopHandle;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function makeNoiseBuffer(ctx: AudioContext, duration = 1) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function useSoundEngine(masterVolume: number) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const ensureEngine = (): SoundEngine => {
    if (!ctxRef.current) {
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      master.gain.value = masterVolume;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }

    const ctx = ctxRef.current;
    const master = masterRef.current!;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    master.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.03);

    const playNoiseBurst = (duration: number, filter: number, gain: number, when = ctx.currentTime) => {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, duration);
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.setValueAtTime(filter, when);
      band.Q.value = 1.1;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      src.connect(band);
      band.connect(amp);
      amp.connect(master);
      src.start(when);
      src.stop(when + duration + 0.06);
    };

    const playTone = (freq: number, duration: number, type: OscillatorType = "sine", gain = 0.18, when = ctx.currentTime) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, when);
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(amp);
      amp.connect(master);
      osc.start(when);
      osc.stop(when + duration + 0.05);
    };

    const playSweep = (from: number, to: number, duration: number, gain = 0.16, when = ctx.currentTime) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const wobble = ctx.createOscillator();
      const wobbleGain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(from, when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), when + duration);
      wobble.frequency.value = 7;
      wobbleGain.gain.value = 12;
      wobble.connect(wobbleGain);
      wobbleGain.connect(osc.frequency);
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.04);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(amp);
      amp.connect(master);
      wobble.start(when);
      osc.start(when);
      wobble.stop(when + duration + 0.05);
      osc.stop(when + duration + 0.05);
    };

    const createLoop = (kind: "tornado" | "rumble" | "restoration" | "preshow") => {
      let stopped = false;
      const timers: number[] = [];
      const schedule = () => {
        if (stopped) return;
        const now = ctx.currentTime;
        if (kind === "tornado") {
          playSweep(140, 540, 1.8, 0.055, now);
          playNoiseBurst(1.4, 720, 0.075, now + 0.05);
          playNoiseBurst(0.45, 1800, 0.055, now + 1.1);
          timers.push(window.setTimeout(schedule, 1500));
        }
        if (kind === "rumble") {
          playTone(42, 2.2, "triangle", 0.11, now);
          playNoiseBurst(2.0, 95, 0.18, now);
          playNoiseBurst(0.55, 360, 0.07, now + 1.3);
          timers.push(window.setTimeout(schedule, 1900));
        }
        if (kind === "restoration") {
          playTone(523.25, 0.55, "sine", 0.06, now);
          playTone(659.25, 0.72, "sine", 0.055, now + 0.18);
          playTone(783.99, 0.9, "triangle", 0.052, now + 0.38);
          playSweep(260, 900, 1.7, 0.045, now + 0.1);
          timers.push(window.setTimeout(schedule, 1500));
        }
        if (kind === "preshow") {
          playTone(146.83, 2.8, "sine", 0.045, now);
          playTone(220, 3.1, "triangle", 0.035, now + 0.1);
          playNoiseBurst(2.5, 500, 0.018, now);
          timers.push(window.setTimeout(schedule, 2600));
        }
      };
      schedule();
      return () => {
        stopped = true;
        timers.forEach(window.clearTimeout);
      };
    };

    return { ctx, master, playNoiseBurst, playTone, playSweep, createLoop };
  };

  return { ensureEngine, masterRef };
}

export function buildCues(): Cue[] {
  return [
    {
      id: "tornado",
      number: "Q1",
      name: "Tornado Vase Swirl",
      subtitle: "Looping comic chaos wind",
      category: "chaos",
      icon: "wind",
      loop: true,
      builder: (engine) => engine.createLoop("tornado"),
    },
    {
      id: "lightning",
      number: "Q2",
      name: "Lightning Crack",
      subtitle: "Sharp mythic shock hit",
      category: "chaos",
      icon: "bolt",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playNoiseBurst(0.22, 3200, 0.42, now);
        engine.playTone(68, 0.45, "square", 0.18, now + 0.04);
        engine.playNoiseBurst(0.7, 180, 0.16, now + 0.11);
      },
    },
    {
      id: "armageddon",
      number: "Q3",
      name: "Armageddon Rumble",
      subtitle: "Looping full-collapse bed",
      category: "chaos",
      icon: "crash",
      loop: true,
      builder: (engine) => engine.createLoop("rumble"),
    },
    {
      id: "pottery-crash",
      number: "Q4",
      name: "Pottery Crash",
      subtitle: "Comic shards and clatter",
      category: "impact",
      icon: "crash",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        [0, 0.04, 0.1, 0.18, 0.27].forEach((offset, index) => {
          engine.playNoiseBurst(0.2 + index * 0.03, 1400 + index * 520, 0.19 - index * 0.022, now + offset);
          engine.playTone(240 + index * 73, 0.1, "triangle", 0.06, now + offset);
        });
      },
    },
    {
      id: "column-thud",
      number: "Q5",
      name: "Column Thud",
      subtitle: "Heavy limestone impact",
      category: "impact",
      icon: "crash",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playTone(47, 0.75, "sine", 0.31, now);
        engine.playNoiseBurst(0.8, 120, 0.24, now + 0.02);
        engine.playNoiseBurst(0.28, 650, 0.12, now + 0.12);
      },
    },
    {
      id: "hippo-kiss",
      number: "Q6",
      name: "Hippo Kiss Sparkle",
      subtitle: "Romantic comic magic ping",
      category: "magic",
      icon: "heart",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
          engine.playTone(freq, 0.5 + index * 0.08, index % 2 ? "triangle" : "sine", 0.09, now + index * 0.08);
        });
        engine.playSweep(880, 1320, 0.85, 0.045, now + 0.16);
      },
    },
    {
      id: "restoration-loop",
      number: "Q7",
      name: "Kintsugi Restoration",
      subtitle: "Looping gold repair magic",
      category: "magic",
      icon: "sparkles",
      loop: true,
      builder: (engine) => engine.createLoop("restoration"),
    },
    {
      id: "laurel-bloom",
      number: "Q8",
      name: "Laurel Bloom",
      subtitle: "Gentle reveal shimmer",
      category: "romance",
      icon: "sparkles",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        [392, 523.25, 659.25, 783.99, 987.77].forEach((freq, index) => {
          engine.playTone(freq, 0.9, "sine", 0.055, now + index * 0.11);
        });
        engine.playNoiseBurst(1.1, 2600, 0.035, now + 0.15);
      },
    },
    {
      id: "tiny-triumph",
      number: "Q9",
      name: "Tiny Triumph Fanfare",
      subtitle: "Final restored façade button",
      category: "finale",
      icon: "music",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        const notes = [392, 523.25, 659.25, 783.99, 1046.5, 783.99];
        notes.forEach((freq, index) => engine.playTone(freq, 0.34, "square", 0.07, now + index * 0.16));
        engine.playNoiseBurst(0.6, 1800, 0.035, now + 0.82);
      },
    },
    {
      id: "preshow-hum",
      number: "Q0",
      name: "Preshow Urn Hum",
      subtitle: "Quiet looping house texture",
      category: "utility",
      icon: "music",
      loop: true,
      builder: (engine) => engine.createLoop("preshow"),
    },
  ];
}
