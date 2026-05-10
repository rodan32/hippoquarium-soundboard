from pathlib import Path

root = Path('/home/ubuntu/hippoquarium-soundboard')

(root / 'client/src/pages/Home.tsx').write_text(r'''/**
 * Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
 * This page must reinforce the approved terracotta urn style while remaining practical for fast theatrical cueing.
 */
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Bolt,
  CircleStop,
  Heart,
  Music2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Wind,
} from "lucide-react";

type Category = "chaos" | "impact" | "magic" | "romance" | "finale" | "utility";

type Cue = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  category: Category;
  icon: "wind" | "bolt" | "crash" | "sparkles" | "heart" | "music";
  loop?: boolean;
  builder: (engine: SoundEngine) => void | (() => void);
};

type LoopHandle = () => void;

type SoundEngine = {
  ctx: AudioContext;
  master: GainNode;
  playNoiseBurst: (duration: number, filter: number, gain: number, when?: number) => void;
  playTone: (freq: number, duration: number, type?: OscillatorType, gain?: number, when?: number) => void;
  playSweep: (from: number, to: number, duration: number, gain?: number, when?: number) => void;
  createLoop: (kind: "tornado" | "rumble" | "restoration" | "preshow") => LoopHandle;
};

const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_urn_panel-ibH7zBxCFvecWcjuLXgLPs.webp";
const stormEmblem = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_storm_emblem-kbWvxB9dBJ8tPcGom7VpGN.webp";
const magicEmblem = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_magic_emblem-7BsMRk9et8Va5PbnabuhQY.webp";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeNoiseBuffer(ctx: AudioContext, duration = 1) {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function useSoundEngine(masterVolume: number) {
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

function buildCues(): Cue[] {
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

function CueIcon({ icon }: { icon: Cue["icon"] }) {
  if (icon === "wind") return <Wind className="h-6 w-6" />;
  if (icon === "bolt") return <Bolt className="h-6 w-6" />;
  if (icon === "heart") return <Heart className="h-6 w-6" />;
  if (icon === "sparkles") return <Sparkles className="h-6 w-6" />;
  if (icon === "music") return <Music2 className="h-6 w-6" />;
  return <RotateCcw className="h-6 w-6" />;
}

const categoryLabels: Record<Category, string> = {
  chaos: "Chaos & Weather",
  impact: "Wreckage Hits",
  magic: "Hippo-Kiss Magic",
  romance: "Romance Reveals",
  finale: "Finale",
  utility: "Utility",
};

export default function Home() {
  const [masterVolume, setMasterVolume] = useState(0.72);
  const [armed, setArmed] = useState(false);
  const [lastCue, setLastCue] = useState("None yet");
  const [activeLoops, setActiveLoops] = useState<Record<string, boolean>>({});
  const loopsRef = useRef<Record<string, LoopHandle>>({});
  const { ensureEngine, masterRef } = useSoundEngine(masterVolume);
  const cues = useMemo(buildCues, []);

  const setVolume = (value: number[]) => {
    const next = clamp((value[0] ?? 72) / 100, 0, 1);
    setMasterVolume(next);
    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(next, masterRef.current.context.currentTime, 0.03);
    }
  };

  const playCue = (cue: Cue) => {
    const engine = ensureEngine();
    setArmed(true);
    setLastCue(`${cue.number} · ${cue.name}`);

    if (cue.loop) {
      if (loopsRef.current[cue.id]) {
        loopsRef.current[cue.id]();
        delete loopsRef.current[cue.id];
        setActiveLoops((current) => ({ ...current, [cue.id]: false }));
        return;
      }
      const stop = cue.builder(engine);
      if (typeof stop === "function") {
        loopsRef.current[cue.id] = stop;
        setActiveLoops((current) => ({ ...current, [cue.id]: true }));
      }
      return;
    }

    cue.builder(engine);
  };

  const stopAll = () => {
    Object.values(loopsRef.current).forEach((stop) => stop());
    loopsRef.current = {};
    setActiveLoops({});
    setLastCue("Stopped all loops");
  };

  const grouped = cues.reduce<Record<Category, Cue[]>>((acc, cue) => {
    acc[cue.category] = [...(acc[cue.category] ?? []), cue];
    return acc;
  }, {} as Record<Category, Cue[]>);

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--urn-black)] text-[var(--limestone)]">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,125,73,0.28),transparent_32%),linear-gradient(135deg,#140f0c_0%,#24140d_48%,#0f0c0a_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative mx-auto grid min-h-screen max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[320px_1fr] lg:px-6">
          <aside className="control-strip rounded-[2rem] border border-[rgba(236,190,120,0.32)] bg-[rgba(20,12,8,0.82)] p-4 shadow-2xl backdrop-blur-md lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
            <div className="meander-line mb-4" />
            <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(236,190,120,0.35)] bg-[rgba(0,0,0,0.28)]">
              <img src={heroImage} alt="Grecian Hippoquarium urn panel" className="h-36 w-full object-cover opacity-95" />
            </div>

            <div className="mt-5">
              <p className="font-display text-xs uppercase tracking-[0.33em] text-[var(--gold)]">Hippoquarium</p>
              <h1 className="mt-2 font-display text-3xl leading-none text-[var(--limestone)]">Soundboard</h1>
              <p className="mt-3 text-sm leading-6 text-[rgba(247,224,185,0.72)]">
                A compact cue board for chaos, wreckage, hippo-kiss magic, and the restored romantic finale.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[rgba(236,190,120,0.26)] bg-[rgba(236,190,120,0.08)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.22em] text-[rgba(247,224,185,0.64)]">Master</span>
                <span className="font-display text-lg text-[var(--gold)]">{Math.round(masterVolume * 100)}%</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-[var(--gold)]" />
                <Slider value={[Math.round(masterVolume * 100)]} min={0} max={100} step={1} onValueChange={setVolume} aria-label="Master volume" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button className="h-14 rounded-2xl bg-[var(--gold)] font-display text-base text-[var(--urn-black)] hover:bg-[var(--rose)]" onClick={() => playCue(cues[0])}>
                <Play className="mr-2 h-4 w-4" /> Arm
              </Button>
              <Button className="h-14 rounded-2xl border border-[rgba(236,190,120,0.45)] bg-[rgba(0,0,0,0.42)] font-display text-base text-[var(--limestone)] hover:bg-[rgba(154,57,33,0.64)]" onClick={stopAll}>
                <CircleStop className="mr-2 h-4 w-4" /> Stop All
              </Button>
            </div>

            <div className="mt-4 rounded-2xl border border-[rgba(236,190,120,0.22)] bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[rgba(247,224,185,0.55)]">Last Cue</p>
              <p className="mt-2 min-h-12 font-display text-xl text-[var(--limestone)]">{lastCue}</p>
              <p className="mt-2 text-xs text-[rgba(247,224,185,0.62)]">
                {armed ? "Audio is unlocked for this browser tab." : "Click any cue once to unlock browser audio."}
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <img src={stormEmblem} alt="Storm cue emblem" className="h-20 w-20 rounded-2xl border border-[rgba(236,190,120,0.28)] object-cover" />
              <img src={magicEmblem} alt="Magic cue emblem" className="h-20 w-20 rounded-2xl border border-[rgba(236,190,120,0.28)] object-cover" />
            </div>
          </aside>

          <section className="relative rounded-[2.2rem] border border-[rgba(236,190,120,0.26)] bg-[rgba(36,19,11,0.68)] p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[rgba(236,190,120,0.2)] pb-5 md:flex-row md:items-end">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.35em] text-[var(--gold)]">Ancient vase cue console</p>
                <h2 className="mt-2 font-display text-4xl leading-tight text-[var(--limestone)] md:text-5xl">Cue the mythic disaster. Restore it with love.</h2>
              </div>
              <div className="rounded-2xl border border-[rgba(236,190,120,0.25)] bg-[rgba(0,0,0,0.22)] px-4 py-3 text-sm text-[rgba(247,224,185,0.68)] md:max-w-xs">
                Looping cues toggle on/off. One-shot cues fire immediately. Use <strong className="text-[var(--gold)]">Stop All</strong> before scene changes.
              </div>
            </div>

            <div className="space-y-6">
              {(Object.keys(categoryLabels) as Category[]).map((category) => {
                const categoryCues = grouped[category] ?? [];
                if (!categoryCues.length) return null;
                return (
                  <section key={category} className={`cue-section cue-section-${category}`}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[rgba(236,190,120,0.25)]" />
                      <h3 className="font-display text-sm uppercase tracking-[0.24em] text-[var(--gold)]">{categoryLabels[category]}</h3>
                      <div className="h-px flex-1 bg-[rgba(236,190,120,0.25)]" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {categoryCues.map((cue) => {
                        const isLooping = Boolean(activeLoops[cue.id]);
                        return (
                          <button
                            key={cue.id}
                            onClick={() => playCue(cue)}
                            className={`cue-pad group ${cue.category} ${isLooping ? "is-looping" : ""}`}
                            aria-pressed={isLooping}
                          >
                            <span className="cue-pad-ornament" />
                            <span className="flex items-start justify-between gap-4">
                              <span className="cue-number">{cue.number}</span>
                              <span className="cue-icon"><CueIcon icon={cue.icon} /></span>
                            </span>
                            <span className="mt-6 block font-display text-2xl leading-tight text-left">{cue.name}</span>
                            <span className="mt-2 block text-left text-sm leading-5 text-[rgba(247,224,185,0.68)]">{cue.subtitle}</span>
                            <span className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[rgba(247,224,185,0.58)]">
                              <span>{cue.loop ? (isLooping ? "Loop Active" : "Toggle Loop") : "One Shot"}</span>
                              <span>{isLooping ? "Stop" : "Fire"}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
''')

(root / 'client/src/index.css').write_text(r'''/**
 * Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
 * Global styling uses terracotta, soot black, limestone cream, dusty rose, and ochre-gold to match the play backdrops.
 */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --urn-black: #15100c;
  --terracotta: #a9562d;
  --terracotta-dark: #6f2f1b;
  --limestone: #f3dfb5;
  --limestone-soft: #d9bc80;
  --rose: #c78368;
  --gold: #dcae59;
  --primary: oklch(0.72 0.12 66);
  --primary-foreground: oklch(0.17 0.02 55);
  --sidebar-primary: oklch(0.72 0.12 66);
  --sidebar-primary-foreground: oklch(0.17 0.02 55);
  --chart-1: oklch(0.66 0.13 43);
  --chart-2: oklch(0.72 0.12 66);
  --chart-3: oklch(0.58 0.08 31);
  --chart-4: oklch(0.8 0.06 78);
  --chart-5: oklch(0.38 0.04 38);
  --radius: 1.15rem;
  --background: oklch(0.17 0.02 55);
  --foreground: oklch(0.9 0.04 82);
  --card: oklch(0.23 0.04 48);
  --card-foreground: oklch(0.9 0.04 82);
  --popover: oklch(0.2 0.03 48);
  --popover-foreground: oklch(0.9 0.04 82);
  --secondary: oklch(0.3 0.06 43);
  --secondary-foreground: oklch(0.9 0.04 82);
  --muted: oklch(0.25 0.03 48);
  --muted-foreground: oklch(0.72 0.03 82);
  --accent: oklch(0.72 0.12 66);
  --accent-foreground: oklch(0.17 0.02 55);
  --destructive: oklch(0.55 0.16 31);
  --destructive-foreground: oklch(0.95 0.03 85);
  --border: oklch(0.72 0.06 72 / 30%);
  --input: oklch(0.72 0.06 72 / 30%);
  --ring: oklch(0.72 0.12 66);
  --sidebar: oklch(0.2 0.03 48);
  --sidebar-foreground: oklch(0.9 0.04 82);
  --sidebar-accent: oklch(0.3 0.06 43);
  --sidebar-accent-foreground: oklch(0.9 0.04 82);
  --sidebar-border: oklch(0.72 0.06 72 / 24%);
  --sidebar-ring: oklch(0.72 0.12 66);
}

.dark {
  --background: oklch(0.17 0.02 55);
  --foreground: oklch(0.9 0.04 82);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Source Sans 3', system-ui, sans-serif;
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [type="button"]:not(:disabled),
  [type="submit"]:not(:disabled),
  [type="reset"]:not(:disabled),
  a[href],
  select:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled) { @apply cursor-pointer; }
}

@layer components {
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .flex { min-height: 0; min-width: 0; }
  .font-display { font-family: 'Cinzel', Georgia, serif; letter-spacing: -0.02em; }
  .meander-line {
    height: 16px;
    border-top: 2px solid rgba(220, 174, 89, 0.65);
    border-bottom: 2px solid rgba(220, 174, 89, 0.65);
    background-image: repeating-linear-gradient(90deg, transparent 0 10px, rgba(220,174,89,.65) 10px 13px, transparent 13px 23px), repeating-linear-gradient(90deg, rgba(220,174,89,.22) 0 2px, transparent 2px 8px);
  }
  .control-strip::before {
    content: "";
    position: absolute;
    inset: 14px;
    pointer-events: none;
    border-radius: 1.5rem;
    border: 1px solid rgba(220, 174, 89, 0.18);
  }
  .cue-pad {
    position: relative;
    min-height: 190px;
    overflow: hidden;
    border-radius: 1.4rem;
    border: 1px solid rgba(236, 190, 120, 0.28);
    padding: 1.05rem;
    color: var(--limestone);
    background: linear-gradient(135deg, rgba(122, 54, 29, 0.92), rgba(35, 17, 10, 0.94));
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.28), 0 18px 40px rgba(0,0,0,.25);
    transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease;
  }
  .cue-pad:hover {
    transform: translateY(-3px);
    border-color: rgba(220, 174, 89, 0.72);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.34), 0 26px 52px rgba(0,0,0,.34);
  }
  .cue-pad:active { transform: translateY(0) scale(.99); }
  .cue-pad.is-looping {
    border-color: rgba(248, 207, 105, .96);
    box-shadow: inset 0 0 0 1px rgba(248,207,105,.48), 0 0 0 2px rgba(248,207,105,.18), 0 24px 56px rgba(220,174,89,.22);
    animation: kintsugiPulse 1.5s ease-in-out infinite;
  }
  .cue-pad.impact { background: linear-gradient(135deg, rgba(56, 39, 28, 0.98), rgba(7, 7, 6, 0.96)); }
  .cue-pad.magic { background: radial-gradient(circle at 80% 10%, rgba(220,174,89,.32), transparent 30%), linear-gradient(135deg, rgba(114, 67, 27, 0.96), rgba(26, 14, 9, .98)); }
  .cue-pad.romance { background: radial-gradient(circle at 80% 10%, rgba(199,131,104,.35), transparent 34%), linear-gradient(135deg, rgba(116, 55, 43, 0.94), rgba(28, 14, 11, .98)); }
  .cue-pad.finale { background: radial-gradient(circle at 22% 0%, rgba(220,174,89,.42), transparent 32%), linear-gradient(135deg, rgba(156, 82, 42, .98), rgba(31, 16, 9, .98)); }
  .cue-pad.utility { background: linear-gradient(135deg, rgba(80, 61, 42, .95), rgba(20, 14, 10, .98)); }
  .cue-pad-ornament {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 14px;
    opacity: .72;
    background-image: repeating-linear-gradient(90deg, transparent 0 9px, rgba(243,223,181,.56) 9px 11px, transparent 11px 20px);
    border-top: 1px solid rgba(243,223,181,.2);
  }
  .cue-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    min-width: 52px;
    border-radius: 999px;
    border: 1px solid rgba(243,223,181,.32);
    background: rgba(0,0,0,.24);
    font-family: 'Cinzel', Georgia, serif;
    color: var(--gold);
  }
  .cue-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    width: 46px;
    border-radius: 50%;
    background: rgba(0,0,0,.24);
    color: var(--gold);
  }
  @keyframes kintsugiPulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.18); }
  }

  @media (min-width: 640px) {
    .container { padding-left: 1.5rem; padding-right: 1.5rem; }
  }
  @media (min-width: 1024px) {
    .container { padding-left: 2rem; padding-right: 2rem; max-width: 1280px; }
  }
}
''')

(root / 'client/src/App.tsx').write_text(r'''/**
 * Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
 * The app wrapper stays simple so the cue board remains the focus.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
''')

(root / 'client/index.html').write_text(r'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <meta name="description" content="A Grecian-urn inspired theatrical soundboard for Hippoquarium the Musical." />
    <title>Hippoquarium Soundboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script defer src="%VITE_ANALYTICS_ENDPOINT%/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"></script>
  </body>
</html>
''')

print('Wrote Hippoquarium soundboard app files.')
