from pathlib import Path

root = Path('/home/ubuntu/hippoquarium-soundboard')
engine_path = root / 'client/src/hooks/useSoundEngine.ts'
perf_path = root / 'client/src/pages/Performance.tsx'

engine = engine_path.read_text()
engine = engine.replace(
    '  const activeStockRef = useRef<Set<AudioBufferSourceNode>>(new Set());',
    '  const activeStockRef = useRef<Set<{ source: AudioBufferSourceNode; gain: GainNode }>>(new Set());'
)
engine = engine.replace(
    '  stopStock: () => void;',
    '  stopStock: (fadeOutSeconds?: number) => void;'
)
engine = engine.replace(
    '''    const stopStock = () => {
      activeStockRef.current.forEach((source) => {
        try {
          source.stop();
        } catch {
          // The source may already have completed; removing it below is enough.
        }
      });
      activeStockRef.current.clear();
    };
''',
    '''    const stopStock = (fadeOutSeconds = 0.42) => {
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
'''
)
engine = engine.replace(
    '''          amp.gain.setValueAtTime(0.0001, when);
          amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), when + 0.035);
          amp.gain.setTargetAtTime(Math.max(0.001, gain) * 0.86, when + 0.12, 0.35);
          source.connect(amp);
          amp.connect(master);
          source.onended = () => activeStockRef.current.delete(source);
          activeStockRef.current.add(source);
          source.start(when, offset);
''',
    '''          const targetGain = Math.max(0.001, gain);
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
'''
)
engine = engine.replace('        if (kind !== "preshow") stopStock();', '        if (kind !== "preshow") stopStock(0.62);')
engine_path.write_text(engine)

perf = perf_path.read_text()
perf = perf.replace(
    '  const [showTransition, setShowTransition] = useState(false);',
    '  const [showTransition, setShowTransition] = useState(false);\n  const [isSceneSettling, setIsSceneSettling] = useState(false);'
)
perf = perf.replace(
    '  const transitionTimerRef = useRef<number | null>(null);',
    '  const transitionTimerRef = useRef<number | null>(null);\n  const settleTimerRef = useRef<number | null>(null);'
)
perf = perf.replace(
    '''  const stopAllSounds = useCallback(() => {
    const engine = ensureEngine();
    Object.values(loopsRef.current).forEach((stop) => stop());
    engine.stopStock();
    loopsRef.current = {};
    setLastAction("All sounds stopped.");
  }, [ensureEngine]);
''',
    '''  const stopAllSounds = useCallback((options: { fadeOutSeconds?: number; announce?: boolean } = {}) => {
    const engine = ensureEngine();
    Object.values(loopsRef.current).forEach((stop) => stop());
    engine.stopStock(options.fadeOutSeconds ?? 0.58);
    loopsRef.current = {};
    if (options.announce !== false) setLastAction("All sounds stopped.");
  }, [ensureEngine]);
'''
)
perf = perf.replace(
    '''  const playPerformanceCue = useCallback((cue: PerformanceCue) => {
    stopAllSounds();
    cue.soundIds.forEach((soundId) => {
      const soundCue = cueMap.get(soundId);
      if (soundCue) fireSoundCue(soundCue);
    });
    setLastAction(`${cue.title}: ${cue.subtitle}`);
  }, [cueMap, fireSoundCue, stopAllSounds]);
''',
    '''  const playPerformanceCue = useCallback((cue: PerformanceCue, options: { fadeOutSeconds?: number; startDelayMs?: number } = {}) => {
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
'''
)
perf = perf.replace(
    '''    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
''',
    '''    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
'''
)
perf = perf.replace('      stopAllSounds();', '      stopAllSounds({ fadeOutSeconds: 0.9, announce: false });', 1)
perf = perf.replace(
    '''        setPreviousImage(performanceCues[cueIndex].image);
        setCueIndex(bounded);
        setShowTransition(false);
        playPerformanceCue(performanceCues[bounded]);
      }, 7900);
''',
    '''        setPreviousImage(performanceCues[cueIndex].image);
        setCueIndex(bounded);
        setIsSceneSettling(true);
        setShowTransition(false);
        playPerformanceCue(performanceCues[bounded], { fadeOutSeconds: 0.95, startDelayMs: 180 });
        settleTimerRef.current = window.setTimeout(() => setIsSceneSettling(false), 1200);
      }, 7600);
'''
)
perf = perf.replace(
    '''    setPreviousImage(performanceCues[cueIndex].image);
    setCueIndex(bounded);
    setShowTransition(false);
    playPerformanceCue(performanceCues[bounded]);
''',
    '''    setPreviousImage(performanceCues[cueIndex].image);
    setCueIndex(bounded);
    setIsSceneSettling(true);
    setShowTransition(false);
    playPerformanceCue(performanceCues[bounded], { fadeOutSeconds: 0.7, startDelayMs: 90 });
    settleTimerRef.current = window.setTimeout(() => setIsSceneSettling(false), 980);
'''
)
perf = perf.replace(
    '''      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
''',
    '''      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
'''
)
perf = perf.replace(
    '''        @keyframes magicBreathe {
          0%, 100% { filter: blur(24px); transform: scale(1); }
          50% { filter: blur(34px); transform: scale(1.035); }
        }
''',
    '''        .scene-previous { animation: sceneFadeOut 980ms ease-in-out forwards; }
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
        .transition-video { animation: sceneFadeIn 700ms ease-out both; }
        @keyframes magicBreathe {
          0%, 100% { filter: blur(24px); transform: scale(1); }
          50% { filter: blur(34px); transform: scale(1.035); }
        }
        @keyframes sceneFadeIn {
          from { opacity: 0; filter: blur(8px) saturate(.86); transform: scale(1.012); }
          to { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); }
        }
        @keyframes sceneFadeOut {
          from { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); }
          to { opacity: 0; filter: blur(10px) saturate(.72); transform: scale(.992); }
        }
        @keyframes settleWash {
          0% { opacity: .92; }
          100% { opacity: 0; }
        }
'''
)
perf = perf.replace('      <div className="absolute inset-0 z-0 bg-black">', '      <div className={`absolute inset-0 z-0 bg-black ${isSceneSettling ? "scene-settling" : ""}`}>')
perf = perf.replace('className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-[800ms]"', 'className="scene-previous absolute inset-0 h-full w-full object-contain"')
perf = perf.replace('className="absolute inset-0 h-full w-full bg-black object-contain"', 'className="transition-video absolute inset-0 h-full w-full bg-black object-contain"')
perf = perf.replace('className="absolute inset-0 h-full w-full object-contain opacity-100 transition-opacity duration-[800ms]"', 'className="scene-current absolute inset-0 h-full w-full object-contain"')
perf_path.write_text(perf)
