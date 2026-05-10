/**
 * Design philosophy: Ancient Greek black-figure pottery adapted into a backstage cue console.
 * This page must reinforce the approved terracotta urn style while remaining practical for fast theatrical cueing.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { buildCues, clamp, type Category, type Cue, type LoopHandle, useSoundEngine } from "@/hooks/useSoundEngine";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Bolt,
  CircleStop,
  Heart,
  MonitorUp,
  Music2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Wind,
} from "lucide-react";

const heroImage = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_urn_panel-ibH7zBxCFvecWcjuLXgLPs.webp";
const stormEmblem = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_storm_emblem-kbWvxB9dBJ8tPcGom7VpGN.webp";
const magicEmblem = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/hippoquarium_soundboard_magic_emblem-7BsMRk9et8Va5PbnabuhQY.webp";

type ProjectionStateJump = {
  index: number;
  label: string;
  shortLabel: string;
  note: string;
};

const projectionStateJumps: ProjectionStateJump[] = [
  { index: 0, label: "Title Card", shortLabel: "Title", note: "house-open" },
  { index: 1, label: "Epigraph Card", shortLabel: "Epigraph", note: "watch line" },
  { index: 3, label: "Fourteen Days", shortLabel: "14 Days", note: "chores photos" },
  { index: 4, label: "Lithuania Dispatch", shortLabel: "Lithuania", note: "travel insert" },
  { index: 5, label: "Sirens Temptation", shortLabel: "Sirens", note: "project Kathleen only" },
  { index: 8, label: "Queen Returns", shortLabel: "Queen", note: "summons" },
  { index: 11, label: "Candid Real Love", shortLabel: "Real Love", note: "optional cameo" },
  { index: 12, label: "Finale Card", shortLabel: "Finale", note: "bows" },
];

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
  const [masterVolume, setMasterVolume] = useState(0.84);
  const [armed, setArmed] = useState(false);
  const [lastCue, setLastCue] = useState("None yet");
  const [activeLoops, setActiveLoops] = useState<Record<string, boolean>>({});
  const [projectionStatus, setProjectionStatus] = useState("Projection window not opened yet.");
  const loopsRef = useRef<Record<string, LoopHandle>>({});
  const projectionChannelRef = useRef<BroadcastChannel | null>(null);
  const { ensureEngine, masterRef } = useSoundEngine(masterVolume);
  const cues = useMemo(buildCues, []);

  useEffect(() => {
    return () => {
      projectionChannelRef.current?.close();
    };
  }, []);

  const getProjectionChannel = () => {
    if (!projectionChannelRef.current) {
      projectionChannelRef.current = new BroadcastChannel("hippoquarium-performance-control");
    }
    return projectionChannelRef.current;
  };

  const sendProjectionCommand = (type: "next" | "back" | "blackout" | "stop" | "overlay" | "goto", index?: number, label?: string) => {
    getProjectionChannel().postMessage({ source: "soundboard", type, index, at: Date.now() });
    const commandLabel = label ?? (type === "next" ? "next cue" : type === "back" ? "previous cue" : type);
    setProjectionStatus(`Sent ${commandLabel} to the projection window.`);
  };

  const openProjectionWindow = () => {
    const projector = window.open("/performance?projector=1", "hippoquarium-performance", "popup=yes,width=1280,height=760,left=80,top=40");
    if (projector) {
      projector.focus();
      setProjectionStatus("Projection window opened. Move it to the projector display, then click Fullscreen in that window.");
      return;
    }
    setProjectionStatus("The browser blocked the projection popup. Allow popups for this site, or open Performance Mode manually.");
  };

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
    const engine = ensureEngine();
    Object.values(loopsRef.current).forEach((stop) => stop());
    engine.stopStock();
    loopsRef.current = {};
    setActiveLoops({});
    setLastCue("Stopped all sounds");
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
                A compact cue board for title cards, family-photo inserts, live-Sirens projection beats, chaos, hippo-kiss magic, and the restored romantic finale.
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

            <div className="mt-4 rounded-2xl border border-[rgba(236,190,120,0.26)] bg-black/25 p-3">
              <Button
                type="button"
                className="h-13 w-full rounded-2xl bg-[rgba(220,174,89,0.18)] font-display text-base text-[var(--gold)] hover:bg-[rgba(220,174,89,0.28)] hover:text-[var(--limestone)]"
                onClick={openProjectionWindow}
              >
                <MonitorUp className="mr-2 h-4 w-4" /> Open Projector Window
              </Button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" className="rounded-xl bg-[rgba(243,223,181,0.1)] text-[var(--limestone)] hover:bg-[rgba(243,223,181,0.18)]" onClick={() => sendProjectionCommand("back")}>Back</Button>
                <Button type="button" className="rounded-xl bg-[var(--gold)] text-[var(--urn-black)] hover:bg-[var(--rose)]" onClick={() => sendProjectionCommand("next")}>Next</Button>
                <Button type="button" className="rounded-xl border border-[rgba(236,190,120,0.32)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(154,57,33,0.64)]" onClick={() => sendProjectionCommand("stop")}>Stop</Button>
                <Button type="button" className="rounded-xl border border-[rgba(236,190,120,0.32)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(220,174,89,0.18)]" onClick={() => sendProjectionCommand("blackout")}>Blackout</Button>
              </div>
              <Button type="button" className="mt-2 w-full rounded-xl border border-[rgba(236,190,120,0.32)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(220,174,89,0.18)]" onClick={() => sendProjectionCommand("overlay")}>Toggle Projector Overlay</Button>
              <div className="mt-3 rounded-2xl border border-[rgba(236,190,120,0.18)] bg-[rgba(236,190,120,0.06)] p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(247,224,185,0.55)]">Projection Inserts</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {projectionStateJumps.map((jump) => (
                    <button
                      key={jump.index}
                      type="button"
                      className="rounded-xl border border-[rgba(236,190,120,0.26)] bg-black/30 px-3 py-2 text-left transition hover:bg-[rgba(220,174,89,0.16)]"
                      onClick={() => sendProjectionCommand("goto", jump.index, jump.label)}
                    >
                      <span className="block font-display text-sm text-[var(--limestone)]">{jump.shortLabel}</span>
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[rgba(247,224,185,0.52)]">{jump.note}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-[rgba(247,224,185,0.62)]">{projectionStatus}</p>
              <Link
                href="/performance"
                className="mt-2 block text-center text-xs uppercase tracking-[0.18em] text-[rgba(220,174,89,0.82)] transition hover:text-[var(--limestone)]"
              >
                Open in this window instead
              </Link>
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
                Looping cues toggle on/off. One-shot cues fire immediately. The projector panel can also jump to script-specific backdrop states.
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
