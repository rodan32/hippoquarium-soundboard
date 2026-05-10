// Design philosophy: Ancient Greek black-figure pottery turned into a projection-ready stage ritual.
// This page preserves a core scene progression while allowing temporary photo inserts to appear over any active scene.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { buildCues, clamp, type Cue, type LoopHandle, useSoundEngine } from "@/hooks/useSoundEngine";
import { CircleStop, Eye, Maximize, Minimize, SkipBack, SkipForward, Volume2, X } from "lucide-react";

type InsertId = "real-love" | "queen" | "lithuania" | "fourteen-days" | "sirens";

type ProjectionCommand = {
  source?: string;
  type?: "next" | "back" | "blackout" | "stop" | "overlay" | "goto" | "insert" | "clear-insert";
  index?: number;
  insertId?: InsertId;
};

type PerformanceCue = {
  id: string;
  title: string;
  subtitle: string;
  layout: "image" | "title" | "finale";
  image?: string;
  soundIds: string[];
  mood: "calm" | "chaos" | "armageddon" | "restoration" | "romance" | "card";
};

type InsertCue = {
  id: InsertId;
  title: string;
  subtitle: string;
  layout: "photo-duet" | "lithuania" | "queen" | "sirens" | "candid";
  image?: string;
  images?: string[];
  mood: "romance" | "domestic" | "dispatch" | "temptation";
};

const transitionVideo = "/manus-storage/hippoquarium_chaos_to_restoration_transition_5a40de2c.mp4";
const urnImage = "/manus-storage/grecian_hippoquarium_style_reference_fc33503e.png";
const kathleenSirensImage = "/manus-storage/kathleen-crappy-video-photo_bd657e76.webp";

const mainPerformanceCues: PerformanceCue[] = [
  {
    id: "title-card",
    title: "Title Card",
    subtitle: "HIPPOQUARIUM — A Mother's Day catastrophe in five children, fourteen days, and one mask",
    layout: "title",
    soundIds: [],
    mood: "card",
  },
  {
    id: "catastrophe-begins",
    title: "Beginning of the Catastrophe",
    subtitle: "Silent visual setup for the first visible damage",
    layout: "image",
    image: "/manus-storage/restoration_arc_scene_1_chaotic_wreckage_2087ae51.png",
    soundIds: [],
    mood: "chaos",
  },
  {
    id: "horrible-chaos",
    title: "Horrible Chaos",
    subtitle: "The storm grows into full collapse, then hands off into the video",
    layout: "image",
    image: "/manus-storage/restoration_arc_scene_2_absolute_armageddon_ad2795fb.png",
    soundIds: ["armageddon", "pottery-crash"],
    mood: "armageddon",
  },
  {
    id: "kiss-restoration",
    title: "Kiss and Restoration",
    subtitle: "The video resolves into the restored scenic image and gentle repair music",
    layout: "image",
    image: "/manus-storage/restoration_arc_scene_3_hippo_kiss_restoration_begins_c4369f89.png",
    soundIds: ["restoration-loop"],
    mood: "restoration",
  },
  {
    id: "finale-card",
    title: "Finale Card",
    subtitle: "Mother's Day dedication for bows",
    layout: "finale",
    soundIds: ["tiny-triumph"],
    mood: "romance",
  },
];

const insertCues: InsertCue[] = [
  {
    id: "real-love",
    title: "Real Love Insert",
    subtitle: "Candid real-love photo insert",
    layout: "candid",
    images: ["/manus-storage/real-love-candid_291ec79c.webp"],
    mood: "romance",
  },
  {
    id: "queen",
    title: "Queen Insert",
    subtitle: "Queen Returns photo insert",
    layout: "queen",
    images: ["/manus-storage/young-love-bench_02e96a39.webp", "/manus-storage/real-love-candid_291ec79c.webp"],
    mood: "romance",
  },
  {
    id: "lithuania",
    title: "Lithuania Insert",
    subtitle: "Lithuania travel-photo insert",
    layout: "lithuania",
    images: [
      "/manus-storage/lithuania-airport_3d8a431f.webp",
      "/manus-storage/lithuania-meadow_595e01d9.webp",
      "/manus-storage/lithuania-sign_f89bd630.webp",
      "/manus-storage/lithuania-wooden-figure_d5540765.webp",
    ],
    mood: "dispatch",
  },
  {
    id: "fourteen-days",
    title: "14 Days Insert",
    subtitle: "Domestic survival photo insert",
    layout: "photo-duet",
    images: ["/manus-storage/chores-laundry-basement_8746936e.webp", "/manus-storage/chores-outdoor-dishes_20ffaef0.webp"],
    mood: "domestic",
  },
  {
    id: "sirens",
    title: "Sirens Insert",
    subtitle: "Crude projected Kathleen photo gag for live Sirens",
    layout: "sirens",
    image: kathleenSirensImage,
    mood: "temptation",
  },
];

function moodClass(mood: PerformanceCue["mood"] | InsertCue["mood"]) {
  if (mood === "chaos") return "storm-active";
  if (mood === "armageddon") return "storm-active armageddon-active";
  if (mood === "restoration") return "magic-active";
  if (mood === "romance") return "romance-active";
  if (mood === "temptation") return "temptation-active";
  if (mood === "dispatch") return "dispatch-active";
  if (mood === "domestic") return "domestic-active";
  return "calm-active";
}

function Backdrop({ cue, previous = false }: { cue: PerformanceCue; previous?: boolean }) {
  const animationClass = previous ? "scene-previous" : "scene-current";
  const shellClass = `${animationClass} absolute inset-0 h-full w-full overflow-hidden bg-black`;

  if (cue.layout === "image") {
    return <img src={cue.image} alt={cue.title} className={`${animationClass} absolute inset-0 h-full w-full bg-black object-contain`} />;
  }

  if (cue.layout === "title") {
    return (
      <div className={`${shellClass} grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(154,57,33,.32),transparent_36%),linear-gradient(135deg,#0b0807,#24140d_55%,#050403)]`}>
        <img src={urnImage} alt="Grecian urn silhouette" className="absolute inset-0 h-full w-full object-contain opacity-[.18]" />
        <div className="relative max-w-5xl px-10 text-center">
          <div className="meander-line mb-10" />
          <p className="font-display text-sm uppercase tracking-[.58em] text-[var(--gold)]">A Mother's Day performance</p>
          <h1 className="mt-8 font-display text-[clamp(4rem,12vw,10rem)] leading-[.82] text-[var(--limestone)] drop-shadow-[0_0_30px_rgba(220,174,89,.24)]">HIPPOQUARIUM</h1>
          <p className="mx-auto mt-8 max-w-4xl font-display text-[clamp(1.1rem,2.5vw,2.3rem)] leading-tight text-[rgba(247,224,185,.86)]">A Mother's Day catastrophe in five children, fourteen days, and one mask.</p>
          <div className="meander-line mt-10" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClass} grid place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(220,174,89,.2),transparent_35%),linear-gradient(135deg,#070504,#1b0f0a_54%,#030202)]`}>
      <img src={urnImage} alt="Grecian urn finale texture" className="absolute inset-0 h-full w-full object-contain opacity-[.12]" />
      <div className="relative max-w-6xl px-10 text-center">
        <p className="font-display text-sm uppercase tracking-[.52em] text-[var(--gold)]">Happily-Ever-Earned</p>
        <h2 className="mt-7 font-display text-[clamp(4rem,10vw,9rem)] leading-[.86] text-[var(--limestone)] drop-shadow-[0_0_40px_rgba(220,174,89,.42)]">HIPPOQUARIUM</h2>
        <p className="mx-auto mt-8 max-w-4xl font-display text-[clamp(1.8rem,4vw,4.2rem)] leading-tight text-[rgba(247,224,185,.9)]">For Kathleen. For Mother's Day. For the catastrophe she keeps turning into home.</p>
      </div>
    </div>
  );
}

function InsertOverlay({ insert }: { insert: InsertCue }) {
  const shellClass = "insert-current absolute inset-0 h-full w-full overflow-hidden bg-black";

  if (insert.layout === "sirens") {
    return (
      <div className={`${shellClass} bg-[radial-gradient(circle_at_70%_35%,rgba(220,174,89,.18),transparent_28%),linear-gradient(135deg,#100b08,#27160e_48%,#050403)]`}>
        <img src={urnImage} alt="Grecian urn backdrop" className="absolute inset-0 h-full w-full object-contain opacity-[.2]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_0_34%,rgba(0,0,0,.22)_72%,rgba(0,0,0,.46)_100%)]" />
        <figure className="kathleen-crappy-video absolute left-1/2 top-1/2 w-[min(40vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-visible shadow-[0_34px_90px_rgba(0,0,0,.44)]">
          <img src={insert.image} alt="Kathleen photo projected as a deliberately crude bouncing video gag" className="block h-[70vh] w-full object-cover opacity-92 contrast-[1.04] saturate-[.94]" />
        </figure>
      </div>
    );
  }

  if (insert.layout === "photo-duet") {
    const [first, second] = insert.images ?? [];
    return (
      <div className={`${shellClass} bg-[radial-gradient(circle_at_20%_20%,rgba(220,174,89,.16),transparent_32%),linear-gradient(135deg,#17100b,#2b160d_50%,#090706)] p-[5vw]`}>
        <div className="absolute inset-[7%] grid grid-cols-2 gap-[4vw]">
          {[first, second].map((src, index) => (
            <figure key={src} className={`relative overflow-hidden rounded-[1.8rem] border border-[rgba(236,190,120,.48)] bg-black/40 shadow-[0_34px_90px_rgba(0,0,0,.52)] ${index === 0 ? "-rotate-2" : "rotate-2"}`}>
              <img src={src} alt={index === 0 ? "Chores photo insert one" : "Chores photo insert two"} className="h-full w-full object-cover opacity-85 sepia-[.18]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.35))]" />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  if (insert.layout === "lithuania") {
    const images = insert.images ?? [];
    return (
      <div className={`${shellClass} bg-[linear-gradient(135deg,#06140d,#1f3a24_45%,#0b0d08)] p-[4vw]`}>
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_22%_22%,rgba(243,223,181,.25),transparent_13%),radial-gradient(circle_at_75%_64%,rgba(220,174,89,.18),transparent_15%)]" />
        <div className="relative z-10 grid h-full grid-cols-[1.15fr_.85fr] gap-[3vw]">
          <figure className="overflow-hidden rounded-[2rem] border border-[rgba(236,190,120,.45)] bg-black/35 shadow-2xl">
            <img src={images[1]} alt="Lithuania meadow scenic insert" className="h-full w-full object-cover opacity-90" />
          </figure>
          <div className="grid grid-rows-3 gap-[2vw]">
            {images.filter((_, index) => index !== 1).slice(0, 3).map((src, index) => (
              <figure key={src} className="overflow-hidden rounded-[1.5rem] border border-[rgba(236,190,120,.36)] bg-black/35 shadow-xl">
                <img src={src} alt={`Lithuania scenic insert ${index + 1}`} className="h-full w-full object-cover opacity-86" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (insert.layout === "queen") {
    const [young, candid] = insert.images ?? [];
    return (
      <div className={`${shellClass} bg-[radial-gradient(circle_at_50%_48%,rgba(220,174,89,.18),transparent_38%),linear-gradient(135deg,#080604,#24140d_58%,#050403)]`}>
        <img src={urnImage} alt="Urn texture behind Queen Returns" className="absolute inset-0 h-full w-full object-contain opacity-[.14]" />
        <div className="absolute inset-[8%] grid grid-cols-[.95fr_1.05fr] items-center gap-[4vw]">
          <figure className="overflow-hidden rounded-[2rem] border border-[rgba(236,190,120,.5)] bg-black/40 shadow-2xl -rotate-2">
            <img src={young} alt="Young couple scenic insert" className="h-[70vh] w-full object-cover opacity-86 sepia-[.12]" />
          </figure>
          <figure className="overflow-hidden rounded-[1.7rem] border border-[rgba(236,190,120,.35)] bg-black/35 shadow-xl rotate-1">
            <img src={candid} alt="Later candid couple scenic insert" className="h-[52vh] w-full object-cover opacity-76" />
          </figure>
        </div>
      </div>
    );
  }

  const [candid] = insert.images ?? [];
  return (
    <div className={`${shellClass} grid place-items-center bg-[radial-gradient(circle_at_50%_46%,rgba(220,174,89,.18),transparent_38%),linear-gradient(135deg,#060504,#21130c_50%,#050403)]`}>
      <img src="/manus-storage/restoration_arc_scene_4_fully_restored_romance_25131ddc.png" alt="Restored urn background" className="absolute inset-0 h-full w-full object-contain opacity-45" />
      <figure className="relative w-[min(64vw,980px)] overflow-hidden rounded-[2rem] border border-[rgba(236,190,120,.5)] bg-black/55 p-4 shadow-[0_42px_120px_rgba(0,0,0,.65)]">
        <img src={candid} alt="Candid real love scenic insert" className="max-h-[72vh] w-full rounded-[1.3rem] object-cover opacity-86 sepia-[.08]" />
      </figure>
    </div>
  );
}

export default function Performance() {
  const [, navigate] = useLocation();
  const isProjectorWindow = useMemo(() => new URLSearchParams(window.location.search).get("projector") === "1", []);
  const [cueIndex, setCueIndex] = useState(0);
  const [previousCue, setPreviousCue] = useState<PerformanceCue | null>(null);
  const [activeInsert, setActiveInsert] = useState<InsertCue | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.86);
  const [blackout, setBlackout] = useState(false);
  const [operatorOpen, setOperatorOpen] = useState(() => !isProjectorWindow);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [isSceneSettling, setIsSceneSettling] = useState(false);
  const [lastAction, setLastAction] = useState(() => isProjectorWindow ? "Projector window ready. Click once to arm audio, then use the Soundboard window controls." : "Ready. Click stage or press Space to begin cueing.");
  const transitionTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const loopsRef = useRef<Record<string, LoopHandle>>({});
  const allCues = useMemo(buildCues, []);
  const cueMap = useMemo(() => new Map(allCues.map((cue) => [cue.id, cue])), [allCues]);
  const insertMap = useMemo(() => new Map(insertCues.map((insert) => [insert.id, insert])), []);
  const { ensureEngine, masterRef } = useSoundEngine(masterVolume);
  const currentCue = mainPerformanceCues[cueIndex];
  const nextCue = mainPerformanceCues[Math.min(mainPerformanceCues.length - 1, cueIndex + 1)];

  const stopAllSounds = useCallback((options: { fadeOutSeconds?: number; announce?: boolean } = {}) => {
    const engine = ensureEngine();
    Object.values(loopsRef.current).forEach((stop) => stop());
    engine.stopStock(options.fadeOutSeconds ?? 0.58);
    loopsRef.current = {};
    if (options.announce !== false) setLastAction("All sounds stopped.");
  }, [ensureEngine]);

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

  const playPerformanceCue = useCallback((cue: PerformanceCue, options: { fadeOutSeconds?: number; startDelayMs?: number } = {}) => {
    stopAllSounds({ fadeOutSeconds: options.fadeOutSeconds ?? 0.68, announce: false });
    const startCue = () => {
      cue.soundIds.forEach((soundId) => {
        const soundCue = cueMap.get(soundId);
        if (soundCue) fireSoundCue(soundCue);
      });
      setLastAction(`${cue.title}: ${cue.subtitle}`);
    };
    if (options.startDelayMs && options.startDelayMs > 0) {
      window.setTimeout(startCue, options.startDelayMs);
      return;
    }
    startCue();
  }, [cueMap, fireSoundCue, stopAllSounds]);

  const clearInsert = useCallback(() => {
    setActiveInsert(null);
    setLastAction(`Insert cleared; remaining on ${currentCue.title}.`);
  }, [currentCue.title]);

  const showInsert = useCallback((insertId: InsertId) => {
    const insert = insertMap.get(insertId);
    if (!insert) return;
    setActiveInsert((current) => current?.id === insertId ? null : insert);
    setLastAction((previous) => {
      void previous;
      return activeInsert?.id === insertId ? `Insert cleared; remaining on ${currentCue.title}.` : `${insert.title}: ${insert.subtitle}`;
    });
  }, [activeInsert?.id, currentCue.title, insertMap]);

  const goToCue = useCallback((nextIndex: number, options: { playTransition?: boolean } = {}) => {
    const bounded = clamp(nextIndex, 0, mainPerformanceCues.length - 1);
    if (bounded === cueIndex && !options.playTransition) return;

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    setActiveInsert(null);

    if (options.playTransition) {
      setShowTransition(true);
      setPreviousCue(mainPerformanceCues[cueIndex]);
      setLastAction("Chaos remains visible while the restoration video carries the scene into the kiss.");
      stopAllSounds({ fadeOutSeconds: 1.35, announce: false });
      const kissCue = cueMap.get("hippo-kiss");
      window.setTimeout(() => { if (kissCue) fireSoundCue(kissCue); }, 420);
      transitionTimerRef.current = window.setTimeout(() => {
        setPreviousCue(mainPerformanceCues[cueIndex]);
        setCueIndex(bounded);
        setIsSceneSettling(true);
        setShowTransition(false);
        playPerformanceCue(mainPerformanceCues[bounded], { fadeOutSeconds: 1.15, startDelayMs: 320 });
        settleTimerRef.current = window.setTimeout(() => setIsSceneSettling(false), 1500);
      }, 7600);
      return;
    }

    setPreviousCue(mainPerformanceCues[cueIndex]);
    setCueIndex(bounded);
    setIsSceneSettling(true);
    setShowTransition(false);
    playPerformanceCue(mainPerformanceCues[bounded], { fadeOutSeconds: 0.7, startDelayMs: 90 });
    settleTimerRef.current = window.setTimeout(() => setIsSceneSettling(false), 980);
  }, [cueIndex, cueMap, fireSoundCue, playPerformanceCue, stopAllSounds]);

  const advance = useCallback(() => {
    const nextIndex = clamp(cueIndex + 1, 0, mainPerformanceCues.length - 1);
    goToCue(nextIndex, { playTransition: currentCue.id === "horrible-chaos" && mainPerformanceCues[nextIndex]?.id === "kiss-restoration" });
  }, [cueIndex, currentCue.id, goToCue]);

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
    playPerformanceCue(mainPerformanceCues[0]);
    return () => {
      stopAllSounds();
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel("hippoquarium-performance-control");
    const onMessage = (event: MessageEvent<ProjectionCommand>) => {
      const command = event.data;
      if (command?.source !== "soundboard") return;
      if (command.type === "next") advance();
      if (command.type === "back") back();
      if (command.type === "stop") stopAllSounds();
      if (command.type === "blackout") {
        setBlackout((current) => !current);
        setLastAction("Blackout toggled from the Soundboard window.");
      }
      if (command.type === "overlay") {
        setOperatorOpen((current) => !current);
        setLastAction("Operator overlay toggled from the Soundboard window.");
      }
      if (command.type === "goto" && typeof command.index === "number") {
        goToCue(command.index);
      }
      if (command.type === "insert" && command.insertId) {
        showInsert(command.insertId);
      }
      if (command.type === "clear-insert") {
        clearInsert();
      }
    };
    channel.addEventListener("message", onMessage);
    return () => channel.close();
  }, [advance, back, clearInsert, goToCue, showInsert, stopAllSounds]);

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
      if (event.key.toLowerCase() === "i") {
        event.preventDefault();
        clearInsert();
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
        if (activeInsert) clearInsert();
        else if (document.fullscreenElement) void document.exitFullscreen();
        else navigate("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeInsert, advance, back, clearInsert, navigate, stopAllSounds]);

  const displayMood = activeInsert?.mood ?? currentCue.mood;

  return (
    <main className={`performance-shell ${moodClass(displayMood)} ${showTransition ? "transitioning-restoration" : ""} fixed inset-0 overflow-hidden bg-black text-[var(--limestone)]`}>
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
        .transitioning-restoration .storm-flash { animation: stormFlash 3.8s infinite steps(1, end); opacity: .16; }
        .transitioning-restoration .storm-dust { opacity: .2; animation: stormDrift 13s linear infinite; }
        .transitioning-restoration .magic-glow { opacity: .5; animation: magicBreathe 4.2s ease-in-out infinite; }
        .magic-active .magic-glow, .romance-active .magic-glow { opacity: .56; animation: magicBreathe 4.2s ease-in-out infinite; }
        .romance-active .magic-glow { opacity: .72; }
        .temptation-active .magic-glow { opacity: .18; animation: magicBreathe 5.4s ease-in-out infinite; }
        .kathleen-crappy-video {
          transform-origin: 50% 78%;
          animation: kathleenCrappyBounce 2100ms steps(2, end) infinite;
          will-change: transform;
        }
        @keyframes kathleenCrappyBounce {
          0% { transform: translate3d(-50%, -50%, 0) rotate(-1.5deg); }
          25% { transform: translate3d(calc(-50% - 1.6vw), calc(-50% + 1.2vh), 0) rotate(1.25deg); }
          50% { transform: translate3d(calc(-50% - .4vw), calc(-50% - 1vh), 0) rotate(-1deg); }
          75% { transform: translate3d(calc(-50% + 1.5vw), calc(-50% + 1vh), 0) rotate(1deg); }
          100% { transform: translate3d(-50%, -50%, 0) rotate(-1.5deg); }
        }
        .insert-current { animation: insertPopIn 240ms steps(2, end) both; }
        @keyframes insertPopIn {
          from { opacity: 0; filter: contrast(1.15) saturate(.74); transform: translate3d(.8vw,-.8vh,0) scale(1.012); }
          to { opacity: 1; filter: contrast(1) saturate(1); transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes stormFlash {
          0%, 15%, 18%, 52%, 55%, 100% { opacity: 0; }
          16%, 53% { opacity: .72; }
          17%, 54% { opacity: .28; }
        }
        @keyframes stormDrift {
          from { transform: translate3d(-2%, -1%, 0) rotate(0deg); }
          to { transform: translate3d(2%, 1%, 0) rotate(1deg); }
        }
        .scene-previous { animation: sceneFadeOut 980ms ease-in-out forwards; }
        .scene-current { animation: sceneFadeIn 980ms ease-in-out both; }
        .scene-settling::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 6;
          background: radial-gradient(circle at 50% 42%, rgba(243,223,181,.16), transparent 36%, rgba(0,0,0,.2) 100%);
          animation: settleWash 1100ms ease-out forwards;
        }
        .transition-video {
          animation: videoFloatIn 1100ms ease-out both;
          filter: drop-shadow(0 0 42px rgba(220,174,89,.24));
        }
        .transition-video-frame::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(circle at 50% 46%, transparent 0 55%, rgba(0,0,0,.38) 100%);
        }
        @keyframes magicBreathe {
          0%, 100% { filter: blur(24px); transform: scale(1); }
          50% { filter: blur(34px); transform: scale(1.035); }
        }
        @keyframes videoFloatIn {
          from { opacity: 0; filter: blur(4px) saturate(.9); transform: scale(1.006); }
          to { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); }
        }
        @keyframes sceneFadeIn {
          from { opacity: .18; filter: blur(5px) saturate(.9); transform: scale(1.006); }
          to { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); }
        }
        @keyframes sceneFadeOut {
          from { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); }
          to { opacity: .22; filter: blur(6px) saturate(.78); transform: scale(.996); }
        }
        @keyframes settleWash {
          0% { opacity: .92; }
          100% { opacity: 0; }
        }
      `}</style>

      <button
        type="button"
        aria-label="Advance performance cue"
        className="absolute inset-0 z-20 cursor-none bg-transparent"
        onClick={advance}
      />

      <div className={`absolute inset-0 z-0 bg-black ${isSceneSettling ? "scene-settling" : ""}`}>
        {previousCue && !showTransition && <Backdrop cue={previousCue} previous />}
        {showTransition ? (
          <>
            <Backdrop key={`${currentCue.id}-under-video`} cue={currentCue} />
            <div className="transition-video-frame absolute inset-0 grid place-items-center bg-transparent">
              <video
                key="restoration-transition"
                src={transitionVideo}
                autoPlay
                muted
                playsInline
                className="transition-video relative z-0 h-full w-full bg-transparent object-contain"
              />
            </div>
          </>
        ) : (
          <Backdrop key={currentCue.id} cue={currentCue} />
        )}
      </div>

      {activeInsert && (
        <div className="absolute inset-0 z-[18] bg-black" aria-label={`${activeInsert.title} active`}>
          <InsertOverlay key={activeInsert.id} insert={activeInsert} />
        </div>
      )}

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
                <span className="text-[var(--gold)]">Scene {cueIndex + 1} / {mainPerformanceCues.length}</span>
                <span>{activeInsert ? `Insert: ${activeInsert.title}` : "No insert"}</span>
                <span>{blackout ? "Blackout active" : isFullscreen ? "Fullscreen" : "Windowed"}</span>
                {isProjectorWindow && <span className="text-[var(--gold)]">Remote controlled</span>}
              </div>
              <h1 className="mt-2 truncate font-display text-3xl text-[var(--limestone)]">{currentCue.title}</h1>
              <p className="mt-1 text-sm text-[rgba(247,224,185,.7)]">{lastAction}</p>
              <p className="mt-2 text-xs uppercase tracking-[.22em] text-[rgba(220,174,89,.82)]">Next Scene: {nextCue.id === currentCue.id ? "End of sequence" : nextCue.title}</p>
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
              <Button type="button" className="rounded-xl border border-[rgba(236,190,120,.35)] bg-black/35 text-[var(--limestone)] hover:bg-[rgba(220,174,89,.18)]" onClick={(event) => { event.stopPropagation(); clearInsert(); }}>
                <X className="mr-2 h-4 w-4" /> Clear Insert
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
              {mainPerformanceCues.map((cue, index) => (
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

          <div className="mt-4 grid grid-cols-5 gap-2 border-t border-[rgba(236,190,120,.18)] pt-4">
            {insertCues.map((insert) => (
              <button
                key={insert.id}
                type="button"
                className={`rounded-xl border px-3 py-2 text-left transition ${activeInsert?.id === insert.id ? "border-[var(--gold)] bg-[rgba(220,174,89,.22)]" : "border-[rgba(236,190,120,.26)] bg-black/30 hover:bg-[rgba(220,174,89,.16)]"}`}
                onClick={(event) => { event.stopPropagation(); showInsert(insert.id); }}
              >
                <span className="block font-display text-sm text-[var(--limestone)]">{insert.title.replace(" Insert", "")}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[rgba(247,224,185,0.52)]">toggle insert</span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-[rgba(247,224,185,.58)]">
            Controls: Space / Right Arrow advances the main scenery. Chaos flows into the video, then dissolves into kiss/restoration without a blackout. Left Arrow backs up, I clears the active insert, B toggles emergency blackout, S stops sounds, O hides or shows this overlay, Esc clears an insert or exits.
          </p>
        </div>
      </div>
    </main>
  );
}
