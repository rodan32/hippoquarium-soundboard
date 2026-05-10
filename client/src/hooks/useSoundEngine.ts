// Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
// This shared hook keeps all generated Web Audio cues consistent across the manual board and fullscreen Performance Mode.
// Stock audio is layered only as theatrical reinforcement; generated synthesis remains the immediate backup on every cue.
import { useRef } from "react";

export type Category = "chaos" | "impact" | "magic" | "romance" | "finale" | "utility";

export type LoopHandle = () => void;

export type StockCueId =
  | "stormBed"
  | "closeThunder"
  | "impactThunder"
  | "apocalypseHorn"
  | "cinematicImpact"
  | "collapsingStructure"
  | "golemStomp"
  | "comicKiss"
  | "orchestraTransition"
  | "trumpetFanfare";

export type SoundEngine = {
  ctx: AudioContext;
  master: GainNode;
  playNoiseBurst: (duration: number, filter: number, gain: number, when?: number, type?: BiquadFilterType, q?: number) => void;
  playTone: (freq: number, duration: number, type?: OscillatorType, gain?: number, when?: number) => void;
  playSweep: (from: number, to: number, duration: number, gain?: number, when?: number, type?: OscillatorType) => void;
  playStock: (id: StockCueId, gain?: number, whenOffset?: number, offset?: number) => void;
  stopStock: (fadeOutSeconds?: number) => void;
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

const STOCK_SOUNDS: Record<StockCueId, string> = {
  stormBed: "/manus-storage/rain-thunder-storm_c3699f29.mp3",
  closeThunder: "/manus-storage/strong-close-thunder-explosion_0c766274.mp3",
  impactThunder: "/manus-storage/cinematic-impact-thunder_3a444cc1.mp3",
  apocalypseHorn: "/manus-storage/cinematic-trailer-apocalypse-horn_f0d1f088.mp3",
  cinematicImpact: "/manus-storage/big-cinematic-impact_de367a5e.mp3",
  collapsingStructure: "/manus-storage/collapsing-structure_a32cf673.mp3",
  golemStomp: "/manus-storage/golem-stomp-c_b4a74d43.mp3",
  comicKiss: "/manus-storage/big-loving-kiss_d54ba6fa.mp3",
  orchestraTransition: "/manus-storage/epic-orchestra-transition_e57b5460.mp3",
  trumpetFanfare: "/manus-storage/trumpet-fanfare_88e68411.mp3",
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
  const stockBuffersRef = useRef<Partial<Record<StockCueId, AudioBuffer>>>({});
  const stockLoadsRef = useRef<Partial<Record<StockCueId, Promise<AudioBuffer>>>>({});
  const activeStockRef = useRef<Set<{ source: AudioBufferSourceNode; gain: GainNode }>>(new Set());

  const ensureEngine = (): SoundEngine => {
    if (!ctxRef.current) {
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      const master = ctx.createGain();
      const safetyCompressor = ctx.createDynamicsCompressor();
      const warmth = ctx.createBiquadFilter();
      master.gain.value = masterVolume;
      safetyCompressor.threshold.value = -14;
      safetyCompressor.knee.value = 24;
      safetyCompressor.ratio.value = 7;
      safetyCompressor.attack.value = 0.004;
      safetyCompressor.release.value = 0.24;
      warmth.type = "lowpass";
      warmth.frequency.value = 7800;
      warmth.Q.value = 0.28;
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

    const loadStock = (id: StockCueId) => {
      const existing = stockBuffersRef.current[id];
      if (existing) return Promise.resolve(existing);
      const loading = stockLoadsRef.current[id];
      if (loading) return loading;
      const request = fetch(STOCK_SOUNDS[id])
        .then((response) => {
          if (!response.ok) throw new Error(`Could not load stock sound ${id}`);
          return response.arrayBuffer();
        })
        .then((buffer) => ctx.decodeAudioData(buffer))
        .then((decoded) => {
          stockBuffersRef.current[id] = decoded;
          return decoded;
        })
        .catch((error) => {
          console.warn(error);
          delete stockLoadsRef.current[id];
          throw error;
        });
      stockLoadsRef.current[id] = request;
      return request;
    };

    const preloadStock = () => {
      (Object.keys(STOCK_SOUNDS) as StockCueId[]).forEach((id) => {
        void loadStock(id).catch(() => undefined);
      });
    };

    const stopStock = (fadeOutSeconds = 0.42) => {
      const stopAt = ctx.currentTime + Math.max(0.03, fadeOutSeconds);
      activeStockRef.current.forEach((voice) => {
        try {
          voice.gain.gain.cancelScheduledValues(ctx.currentTime);
          voice.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, Math.max(0.025, fadeOutSeconds / 3));
          voice.source.stop(stopAt + 0.08);
        } catch {
          // The source may already have completed; removing it below is enough.
        }
      });
      window.setTimeout(() => activeStockRef.current.clear(), Math.ceil((fadeOutSeconds + 0.12) * 1000));
    };

    const playStock = (id: StockCueId, gain = 0.75, whenOffset = 0, offset = 0) => {
      void loadStock(id)
        .then((buffer) => {
          const source = ctx.createBufferSource();
          const amp = ctx.createGain();
          const when = ctx.currentTime + whenOffset;
          source.buffer = buffer;
          const targetGain = Math.max(0.001, gain);
          const attack = id === "closeThunder" || id === "cinematicImpact" || id === "golemStomp" ? 0.02 : 0.16;
          amp.gain.setValueAtTime(0.0001, when);
          amp.gain.exponentialRampToValueAtTime(targetGain, when + attack);
          amp.gain.setTargetAtTime(targetGain * 0.86, when + attack + 0.12, 0.45);
          source.connect(amp);
          amp.connect(master);
          const voice = { source, gain: amp };
          source.onended = () => activeStockRef.current.delete(voice);
          activeStockRef.current.add(voice);
          source.start(when, offset);
        })
        .catch(() => undefined);
    };

    preloadStock();

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
      if (kind === "tornado") playStock("stormBed", 0.82);
      if (kind === "rumble") {
        playStock("apocalypseHorn", 0.82);
        playStock("cinematicImpact", 0.68, 0.08);
      }
      const schedule = () => {
        if (stopped) return;
        const now = ctx.currentTime;
        if (kind === "tornado") {
          playNoiseBurst(2.6, 520, 0.09, now + 0.02, "bandpass", 0.85);
          playNoiseBurst(1.8, 1450, 0.035, now + 0.72, "highpass", 0.5);
          playTone(58, 1.7, "sine", 0.035, now + 0.05);
          timers.push(window.setTimeout(schedule, 2360));
        }
        if (kind === "rumble") {
          playTone(38, 2.9, "sine", 0.16, now);
          playNoiseBurst(2.7, 86, 0.22, now, "lowpass", 0.72);
          playNoiseBurst(0.7, 360, 0.055, now + 1.35, "bandpass", 1.1);
          timers.push(window.setTimeout(schedule, 2450));
        }
        if (kind === "restoration") {
          playTone(329.63, 2.2, "sine", 0.026, now);
          playTone(493.88, 2.0, "sine", 0.032, now + 0.2);
          playTone(659.25, 1.85, "sine", 0.026, now + 0.48);
          playTone(987.77, 1.35, "triangle", 0.014, now + 0.78);
          playNoiseBurst(1.1, 3400, 0.012, now + 0.24, "highpass", 0.55);
          timers.push(window.setTimeout(schedule, 2600));
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
        if (kind !== "preshow") stopStock(0.62);
      };
    };

    return { ctx, master, playNoiseBurst, playTone, playSweep, playStock, stopStock, createLoop };
  };

  return { ensureEngine, masterRef };
}

export function buildCues(): Cue[] {
  return [
    {
      id: "tornado",
      number: "Q1",
      name: "Storm Bed",
      subtitle: "Continuous storm atmosphere for the catastrophe setup",
      category: "chaos",
      icon: "wind",
      loop: true,
      builder: (engine) => engine.createLoop("tornado"),
    },
    {
      id: "lightning",
      number: "Q2",
      name: "Thunder Strike",
      subtitle: "Single thunder accent for stage emphasis",
      category: "chaos",
      icon: "bolt",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playStock("closeThunder", 1.0);
        engine.playStock("impactThunder", 0.72, 0.045);
        engine.playNoiseBurst(0.2, 3600, 0.22, now, "highpass", 0.55);
        engine.playNoiseBurst(0.9, 150, 0.12, now + 0.08, "lowpass", 0.8);
      },
    },
    {
      id: "armageddon",
      number: "Q3",
      name: "Collapse Rumble",
      subtitle: "Low continuous collapse bed for horrible chaos",
      category: "chaos",
      icon: "crash",
      loop: true,
      builder: (engine) => engine.createLoop("rumble"),
    },
    {
      id: "pottery-crash",
      number: "Q4",
      name: "Pottery Break",
      subtitle: "Short ceramic crash accent",
      category: "impact",
      icon: "crash",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playStock("collapsingStructure", 0.82);
        engine.playStock("cinematicImpact", 0.28, 0.02);
        engine.playTone(62, 0.42, "sine", 0.09, now);
        engine.playNoiseBurst(0.55, 780, 0.1, now + 0.12, "bandpass", 1.0);
      },
    },
    {
      id: "column-thud",
      number: "Q5",
      name: "Stone Impact",
      subtitle: "Heavy scenic thud accent",
      category: "impact",
      icon: "crash",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playStock("golemStomp", 1.05);
        engine.playStock("cinematicImpact", 0.5, 0.035);
        engine.playTone(38, 0.95, "sine", 0.39, now);
        engine.playTone(76, 0.62, "triangle", 0.2, now + 0.02);
        engine.playNoiseBurst(0.95, 105, 0.34, now + 0.01, "lowpass", 0.8);
        engine.playNoiseBurst(0.36, 720, 0.15, now + 0.1, "bandpass", 1.2);
      },
    },
    {
      id: "hippo-kiss",
      number: "Q6",
      name: "Kiss Cue",
      subtitle: "Comic kiss that starts the restoration video moment",
      category: "magic",
      icon: "heart",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playStock("comicKiss", 0.92);
        [659.25, 783.99, 1046.5, 1318.51].forEach((freq, index) => {
          engine.playTone(freq, 0.62 + index * 0.06, "sine", 0.045 - index * 0.004, now + 0.12 + index * 0.095);
        });
        engine.playNoiseBurst(0.34, 4200, 0.012, now + 0.26, "highpass", 0.5);
      },
    },
    {
      id: "restoration-loop",
      number: "Q7",
      name: "Restoration Underscore",
      subtitle: "Gentle looping repair music after the video",
      category: "magic",
      icon: "sparkles",
      loop: true,
      builder: (engine) => engine.createLoop("restoration"),
    },
    {
      id: "laurel-bloom",
      number: "Q8",
      name: "Warm Reveal",
      subtitle: "Soft shimmer for photo inserts and restored scenery",
      category: "romance",
      icon: "sparkles",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        engine.playStock("orchestraTransition", 0.42);
        [392, 523.25, 659.25].forEach((freq, index) => {
          engine.playTone(freq, 1.15, "sine", 0.045, now + index * 0.16);
        });
        engine.playNoiseBurst(1.05, 2750, 0.02, now + 0.18, "highpass", 0.65);
      },
    },
    {
      id: "tiny-triumph",
      number: "Q9",
      name: "Final Bow Fanfare",
      subtitle: "Short closing fanfare for the finale card",
      category: "finale",
      icon: "music",
      builder: (engine) => {
        const now = engine.ctx.currentTime;
        const melody = [392, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
        engine.playStock("trumpetFanfare", 0.9);
        engine.playStock("orchestraTransition", 0.28, 0.58);
        melody.slice(0, 5).forEach((freq, index) => {
          engine.playTone(freq, 0.34, "triangle", 0.055, now + index * 0.16);
        });
      },
    },
    {
      id: "preshow-hum",
      number: "Q0",
      name: "Preshow Atmosphere",
      subtitle: "Quiet looping house texture",
      category: "utility",
      icon: "music",
      loop: true,
      builder: (engine) => engine.createLoop("preshow"),
    },
  ];
}
