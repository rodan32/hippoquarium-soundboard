// Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
// This shared hook keeps all generated Web Audio cues consistent across the manual board and fullscreen Performance Mode.
import { useRef } from "react";

export type Category = "chaos" | "impact" | "magic" | "romance" | "finale" | "utility";

export type LoopHandle = () => void;

export type SoundEngine = {
  ctx: AudioContext;
  master: GainNode;
  playNoiseBurst: (duration: number, filter: number, gain: number, when?: number, type?: BiquadFilterType, q?: number) => void;
  playTone: (freq: number, duration: number, type?: OscillatorType, gain?: number, when?: number) => void;
  playSweep: (from: number, to: number, duration: number, gain?: number, when?: number, type?: OscillatorType) => void;
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
      const safetyCompressor = ctx.createDynamicsCompressor();
      const warmth = ctx.createBiquadFilter();
      master.gain.value = masterVolume;
      safetyCompressor.threshold.value = -16;
      safetyCompressor.knee.value = 22;
      safetyCompressor.ratio.value = 5;
      safetyCompressor.attack.value = 0.006;
      safetyCompressor.release.value = 0.2;
      warmth.type = "lowpass";
      warmth.frequency.value = 7200;
      warmth.Q.value = 0.3;
      master.connect(safetyCompressor);
      safetyCompressor.connect(warmth);
      warmth.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }

    const ctx = ctxRef.current;
    const master = masterRef.current!;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    master.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.03);

    const playNoiseBurst = (duration: number, filter: number, gain: number, when = ctx.currentTime, type: BiquadFilterType = "bandpass", q = 1.1) => {
      const src = ctx.createBufferSource();
      src.buffer = makeNoiseBuffer(ctx, duration);
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = type;
      filterNode.frequency.setValueAtTime(filter, when);
      filterNode.Q.value = q;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.015);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      src.connect(filterNode);
      filterNode.connect(amp);
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
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(amp);
      amp.connect(master);
      osc.start(when);
      osc.stop(when + duration + 0.05);
    };

    const playSweep = (from: number, to: number, duration: number, gain = 0.16, when = ctx.currentTime, type: OscillatorType = "sawtooth") => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const wobble = ctx.createOscillator();
      const wobbleGain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, from), when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), when + duration);
      wobble.frequency.value = 7;
      wobbleGain.gain.value = 16;
      wobble.connect(wobbleGain);
      wobbleGain.connect(osc.frequency);
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.035);
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
          playSweep(92, 680, 2.15, 0.105, now, "sawtooth");
          playSweep(210, 1020, 1.35, 0.045, now + 0.38, "square");
          playNoiseBurst(1.85, 540, 0.16, now + 0.02, "bandpass", 0.9);
          playNoiseBurst(1.0, 1600, 0.09, now + 0.78, "highpass", 0.55);
          playTone(58, 1.15, "triangle", 0.07, now + 0.05);
          timers.push(window.setTimeout(schedule, 1680));
        }
        if (kind === "rumble") {
          playTone(34, 2.6, "sine", 0.24, now);
          playTone(51, 2.35, "triangle", 0.17, now + 0.04);
          playSweep(72, 38, 2.4, 0.12, now + 0.02, "sawtooth");
          playNoiseBurst(2.25, 82, 0.32, now, "lowpass", 0.7);
          playNoiseBurst(0.65, 420, 0.11, now + 1.28, "bandpass", 1.4);
          timers.push(window.setTimeout(schedule, 2050));
        }
        if (kind === "restoration") {
          playTone(261.63, 1.15, "triangle", 0.05, now);
          playTone(523.25, 0.72, "sine", 0.095, now + 0.04);
          playTone(659.25, 0.86, "sine", 0.085, now + 0.19);
          playTone(783.99, 1.0, "triangle", 0.075, now + 0.38);
          playTone(1046.5, 0.9, "sine", 0.04, now + 0.62);
          playSweep(240, 1280, 1.9, 0.07, now + 0.08, "triangle");
          playNoiseBurst(1.15, 2900, 0.045, now + 0.12, "highpass", 0.7);
          timers.push(window.setTimeout(schedule, 1520));
        }
        if (kind === "preshow") {
          playTone(110, 3.3, "sine", 0.045, now);
          playTone(146.83, 3.1, "triangle", 0.055, now + 0.04);
          playTone(220, 3.4, "sine", 0.035, now + 0.12);
          playNoiseBurst(3.0, 420, 0.028, now, "bandpass", 0.7);
          timers.push(window.setTimeout(schedule, 2860));
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
        engine.playNoiseBurst(0.12, 4800, 0.58, now, "highpass", 0.5);
        engine.playNoiseBurst(0.26, 2500, 0.44, now + 0.018, "bandpass", 2.2);
        engine.playTone(74, 0.52, "square", 0.28, now + 0.035);
        engine.playTone(148, 0.22, "sawtooth", 0.16, now + 0.055);
        engine.playNoiseBurst(0.86, 170, 0.28, now + 0.09, "lowpass", 0.8);
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
        engine.playTone(62, 0.5, "sine", 0.18, now);
        [0, 0.026, 0.065, 0.12, 0.19, 0.31].forEach((offset, index) => {
          engine.playNoiseBurst(0.18 + index * 0.035, 1150 + index * 610, 0.28 - index * 0.025, now + offset, "bandpass", 1.7);
          engine.playTone(180 + index * 91, 0.14, index % 2 ? "square" : "triangle", 0.09, now + offset);
        });
        engine.playNoiseBurst(0.62, 520, 0.12, now + 0.16, "lowpass", 1.0);
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
        engine.playTone(38, 0.95, "sine", 0.39, now);
        engine.playTone(76, 0.62, "triangle", 0.2, now + 0.02);
        engine.playNoiseBurst(0.95, 105, 0.34, now + 0.01, "lowpass", 0.8);
        engine.playNoiseBurst(0.36, 720, 0.15, now + 0.1, "bandpass", 1.2);
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
        engine.playTone(196, 0.75, "triangle", 0.055, now);
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, index) => {
          engine.playTone(freq, 0.58 + index * 0.08, index % 2 ? "triangle" : "sine", 0.12 - index * 0.01, now + index * 0.075);
        });
        engine.playSweep(620, 1760, 1.05, 0.075, now + 0.1, "triangle");
        engine.playNoiseBurst(0.65, 3600, 0.04, now + 0.14, "highpass", 0.7);
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
        engine.playTone(196, 1.6, "triangle", 0.045, now);
        [392, 523.25, 659.25, 783.99, 987.77, 1174.66].forEach((freq, index) => {
          engine.playTone(freq, 1.0, index % 2 ? "triangle" : "sine", 0.08, now + index * 0.105);
        });
        engine.playSweep(360, 1180, 1.55, 0.055, now + 0.12, "triangle");
        engine.playNoiseBurst(1.35, 2750, 0.052, now + 0.15, "highpass", 0.65);
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
        const melody = [392, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
        melody.forEach((freq, index) => {
          engine.playTone(freq, 0.38, index % 2 ? "triangle" : "square", 0.095, now + index * 0.145);
          engine.playTone(freq / 2, 0.42, "triangle", 0.045, now + index * 0.145);
        });
        engine.playNoiseBurst(0.72, 1850, 0.052, now + 0.78, "bandpass", 1.2);
        engine.playTone(196, 1.05, "sine", 0.065, now + 0.62);
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
