// Design philosophy: Ancient Greek black-figure pottery turned into a projection-ready stage ritual.
// This page keeps controls hidden from the audience image while preserving terracotta, soot-black, limestone, and gold cue language.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { buildCues, clamp, type Cue, type LoopHandle, useSoundEngine } from "@/hooks/useSoundEngine";
import { CircleStop, Eye, Maximize, Minimize, SkipBack, SkipForward, Volume2 } from "lucide-react";

type PerformanceCue = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  soundIds: string[];
  mood: "calm" | "chaos" | "armageddon" | "restoration" | "romance";
};

const transitionVideo = "/manus-storage/hippoquarium_chaos_to_restoration_transition_5a40de2c.mp4";

const performanceCues: PerformanceCue[] = [
  {
    id: "calm-entrance",
    title: "Calm Entrance",
    subtitle: "House-open urn panel and quiet preshow hum",
    image: "/manus-storage/grecian_hippoquarium_style_reference_fc33503e.png",
    soundIds: ["preshow-hum"],
    mood: "calm",
  },
  {
    id: "chaotic-wreckage",
    title: "Chaotic Wreckage",
    subtitle: "Tornado Vase Swirl with lightning shock hit",
    image: "/manus-storage/restoration_arc_scene_1_chaotic_wreckage_2087ae51.png",
    soundIds: ["tornado", "lightning"],
    mood: "chaos",
  },
  {
    id: "absolute-armageddon",
    title: "Absolute Armageddon",
    subtitle: "Full-collapse rumble and pottery crash",
    image: "/manus-storage/restoration_arc_scene_2_absolute_armageddon_ad2795fb.png",
    soundIds: ["armageddon", "pottery-crash"],
    mood: "armageddon",
  },
  {
    id: "hippo-kiss-restoration",
    title: "Hippo Kiss Restoration",
    subtitle: "Transition video resolves into gold repair magic",
    image: "/manus-storage/restoration_arc_scene_3_hippo_kiss_restoration_begins_c4369f89.png",
    soundIds: ["hippo-kiss", "restoration-loop"],
    mood: "restoration",
  },
  {
    id: "fully-restored-romance",
    title: "Fully Restored Romance",
    subtitle: "Laurel bloom shimmer and tiny triumph fanfare",
    image: "/manus-storage/restoration_arc_scene_4_fully_restored_romance_25131ddc.png",
    soundIds: ["laurel-bloom", "tiny-triumph"],
    mood: "romance",
  },
];

function moodClass(mood: PerformanceCue["mood"]) {
  if (mood === "chaos") return "storm-active";
  if (mood === "armageddon") return "storm-active armageddon-active";
  if (mood === "restoration") return "magic-active";
  if (mood === "romance") return "romance-active";
  return "calm-active";
}

export default function Performance() {
  const [, navigate] = useLocation();
  const [cueIndex, setCueIndex] = useState(0);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.86);
  const [blackout, setBlackout] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [lastAction, setLastAction] = useState("Ready. Click stage or press Space to begin cueing.");
  const transitionTimerRef = useRef<number | null>(null);
  const loopsRef = useRef<Record<string, LoopHandle>>({});
  const allCues = useMemo(buildCues, []);
  const cueMap = useMemo(() => new Map(allCues.map((cue) => [cue.id, cue])), [allCues]);
  const { ensureEngine, masterRef } = useSoundEngine(masterVolume);
  const currentCue = performanceCues[cueIndex];
  const nextCue = performanceCues[Math.min(performanceCues.length - 1, cueIndex + 1)];

  const stopAllSounds = useCallback(() => {
    Object.values(loopsRef.current).forEach((stop) => stop());
    loopsRef.current = {};
    setLastAction("All looped sounds stopped.");
  }, []);

  const fireSoundCue = useCallback((cue: Cue) => {
    const engine = ensureEngine();
    if (cue.loop) {
      const stop = cue.builder(engine);
      if (typeof stop === "function") {
        loopsRef.current[cue.id] = stop;
      }
      return;
    }
    cue.builder(engine);
  }, [ensureEngine]);

  const playPerformanceCue = useCallback((cue: PerformanceCue) => {
    stopAllSounds();
    cue.soundIds.forEach((soundId) => {
      const soundCue = cueMap.get(soundId);
      if (soundCue) fireSoundCue(soundCue);
    });
    setLastAction(`${cue.title}: ${cue.subtitle}`);
  }, [cueMap, fireSoundCue, stopAllSounds]);

  const goToCue = useCallback((nextIndex: number, options: { playTransition?: boolean } = {}) => {
    const bounded = clamp(nextIndex, 0, performanceCues.length - 1);
    if (bounded === cueIndex && !options.playTransition) return;

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (options.playTransition) {
      setShowTransition(true);
      setLastAction("Playing chaos-to-restoration transition video.");
      stopAllSounds();
      const kissCue = cueMap.get("hippo-kiss");
      if (kissCue) fireSoundCue(kissCue);
      transitionTimerRef.current = window.setTimeout(() => {
        setPreviousImage(performanceCues[cueIndex].image);
        setCueIndex(bounded);
        setShowTransition(false);
        playPerformanceCue(performanceCues[bounded]);
      }, 7900);
      return;
    }

    setPreviousImage(performanceCues[cueIndex].image);
    setCueIndex(bounded);
    setShowTransition(false);
    playPerformanceCue(performanceCues[bounded]);
  }, [cueIndex, cueMap, fireSoundCue, playPerformanceCue, stopAllSounds]);

  const advance = useCallback(() => {
    if (cueIndex === 2) {
      goToCue(3, { playTransition: true });
      return;
    }
    goToCue(cueIndex + 1);
  }, [cueIndex, goToCue]);

  const back = useCallback(() => {
    goToCue(cueIndex - 1);
  }, [cueIndex, goToCue]);

  const requestFullscreen = useCallback(() => {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      void root.requestFullscreen();
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
  }, []);

  const setVolume = (value: number[]) => {
    const next = clamp((value[0] ?? 86) / 100, 0, 1);
    setMasterVolume(next);
    if (masterRef.current) {
      masterRef.current.gain.setTargetAtTime(next, masterRef.current.context.currentTime, 0.03);
    }
  };

  useEffect(() => {
    playPerformanceCue(performanceCues[0]);
    return () => {
      stopAllSounds();
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT") return;
      if (event.code === "Space" || event.key === "ArrowRight") {
        event.preventDefault();
        advance();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      }
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setBlackout((current) => !current);
      }
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        stopAllSounds();
      }
      if (event.key.toLowerCase() === "o") {
        event.preventDefault();
        setOperatorOpen((current) => !current);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (document.fullscreenElement) void document.exitFullscreen();
        else navigate("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance, back, navigate, stopAllSounds]);

  return (
    <main className={`performance-shell ${moodClass(currentCue.mood)} fixed inset-0 overflow-hidden bg-black text-[var(--limestone)]`}>
      <style>{`
        .performance-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: radial-gradient(circle at 50% 40%, transparent 0 46%, rgba(21,16,12,.34) 77%, rgba(0,0,0,.72) 100%);
        }
        .storm-active .storm-flash { animation: stormFlash 3.2s infinite steps(1, end); }
        .armageddon-active .storm-flash { animation-duration: 2.2s; }
        .storm-active .storm-dust { opacity: .42; animation: stormDrift 9s linear infinite; }
        .magic-active .magic-glow, .romance-active .magic-glow { opacity: .56; animation: magicBreathe 4.2s ease-in-out infinite; }
        .romance-active .magic-glow { opacity: .72; }
        @keyframes stormFlash {
          0%, 15%, 18%, 52%, 55%, 100% { opacity: 0; }
          16%, 53% { opacity: .72; }
          17%, 54% { opacity: .28; }
        }
        @keyframes stormDrift {
          from { transform: translate3d(-2%, -1%, 0) rotate(0deg); }
          to { transform: translate3d(2%, 1%, 0) rotate(1deg); }
        }
        @keyframes magicBreathe {
          0%, 100% { filter: blur(24px); transform: scale(1); }
          50% { filter: blur(34px); transform: scale(1.035); }
        }
      `}</style>

      <button
        type="button"
        aria-label="Advance performance cue"
        className="absolute inset-0 z-20 cursor-none bg-transparent"
        onClick={advance}
      />

      <div className="absolute inset-0 z-0 bg-black">
        {previousImage && !showTransition && (
          <img
            key={`previous-${previousImage}`}
            src={previousImage}
            alt="Previous Hippoquarium scene"
            className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-[800ms]"
          />
        )}
        {showTransition ? (
          <video
            key="restoration-transition"
            src={transitionVideo}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        ) : (
          <img
            key={currentCue.image}
            src={currentCue.image}
            alt={currentCue.title}
            className="absolute inset-0 h-full w-full object-contain opacity-100 transition-opacity duration-[800ms]"
          />
        )}
      </div>

      <div className="storm-dust pointer-events-none absolute -inset-8 z-5 opacity-0 [background-image:radial-gradient(circle_at_25%_35%,rgba(220,174,89,.28),transparent_10%),radial-gradient(circle_at_70%_30%,rgba(243,223,181,.22),transparent_9%),repeating-linear-gradient(105deg,transparent_0_18px,rgba(0,0,0,.24)_18px_20px)]" />
      <div className="storm-flash pointer-events-none absolute inset-0 z-10 bg-[rgba(243,223,181,.78)] opacity-0 mix-blend-screen" />
      <div className="magic-glow pointer-events-none absolute inset-[10%] z-10 rounded-[50%] bg-[radial-gradient(circle,rgba(220,174,89,.42),rgba(199,131,104,.18)_38%,transparent_70%)] opacity-0 mix-blend-screen" />

      {blackout && <div className="absolute inset-0 z-30 bg-black" aria-label="Blackout active" />}

      <div
        className={`group absolute inset-x-0 bottom-0 z-40 px-5 pb-5 pt-28 transition-opacity duration-300 ${operatorOpen ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
      >
        <div className="mx-auto max-w-6xl rounded-[1.7rem] border border-[rgba(236,190,120,.32)] bg-[rgba(12,8,6,.82)] p-4 shadow-2xl backdrop-blur-xl">
          <div className="meander-line mb-4" />
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[.24em] text-[rgba(247,224,185,.62)]">
                <span>Performance Mode</span>
                <span className="text-[var(--gold)]">Cue {cueIndex + 1} / {performanceCues.length}</span>
                <span>{blackout ? "Blackout active" : isFullscreen ? "Fullscreen" : "Windowed"}</span>
              </div>
              <h1 className="mt-2 truncate font-display text-3xl text-[var(--limestone)]">{currentCue.title}</h1>
              <p className="mt-1 text-sm text-[rgba(247,224,185,.7)]">{lastAction}</p>
              <p className="mt-2 text-xs uppercase tracking-[.22em] text-[rgba(220,174,89,.82)]">Next: {nextCue.id === currentCue.id ? "End of sequence" : nextCue.title}</p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
              <Button type="button" className="rounded-xl bg-[rgba(243,223,181,.12)] text-[var(--limestone)] hover:bg-[rgba(243,223,181,.2)]" onClick={(event) => { event.stopPropagation(); back(); }}>
                <SkipBack className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" className="rounded-xl bg-[var(--gold)] text-[var(--urn-black)] hover:bg-[var(--rose)]" onClick={(event) => { event.stopPropagation(); advance(); }}>
                <SkipForward className="mr-2 h-4 w-4" /> Next
              </Button>
              <Button type="button" className="rounded-xl border border-[rgba(236,190,120,.35)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(154,57,33,.64)]" onClick={(event) => { event.stopPropagation(); stopAllSounds(); }}>
                <CircleStop className="mr-2 h-4 w-4" /> Stop
              </Button>
              <Button type="button" className="rounded-xl border border-[rgba(236,190,120,.35)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(220,174,89,.18)]" onClick={(event) => { event.stopPropagation(); setBlackout((current) => !current); }}>
                <Eye className="mr-2 h-4 w-4" /> B
              </Button>
              <Button type="button" className="rounded-xl border border-[rgba(236,190,120,.35)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(220,174,89,.18)]" onClick={(event) => { event.stopPropagation(); requestFullscreen(); }}>
                {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />} Fullscreen
              </Button>
              <Link href="/" className="rounded-xl border border-[rgba(236,190,120,.35)] bg-black/35 px-4 py-2 text-sm font-medium text-[var(--limestone)] transition hover:bg-[rgba(220,174,89,.18)]">
                ← Soundboard
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border-t border-[rgba(236,190,120,.18)] pt-4 md:grid-cols-[1fr_220px] md:items-center">
            <div className="flex flex-wrap gap-2">
              {performanceCues.map((cue, index) => (
                <button
                  key={cue.id}
                  type="button"
                  className={`h-2 flex-1 rounded-full transition ${index === cueIndex ? "bg-[var(--gold)]" : "bg-[rgba(243,223,181,.28)] hover:bg-[rgba(243,223,181,.45)]"}`}
                  aria-label={`Jump to ${cue.title}`}
                  onClick={(event) => { event.stopPropagation(); goToCue(index); }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-[var(--gold)]">
              <Volume2 className="h-5 w-5 shrink-0" />
              <Slider value={[Math.round(masterVolume * 100)]} min={0} max={100} step={1} onValueChange={setVolume} aria-label="Performance mode master volume" />
              <span className="w-10 text-right font-display text-sm">{Math.round(masterVolume * 100)}%</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-[rgba(247,224,185,.58)]">
            Controls: Space / Right Arrow advances, Left Arrow backs up, B toggles blackout, S stops sounds, O hides or shows this overlay, Esc exits fullscreen or returns to the Soundboard. Hover the bottom edge to reveal hidden controls.
          </p>
        </div>
      </div>
    </main>
  );
}
