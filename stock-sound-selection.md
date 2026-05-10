# Hippoquarium Stock Sound Selection

This pass adds a small, curated set of **Mixkit free sound effects** to make the largest theatrical moments feel more substantial in rehearsal and performance. The previous generated Web Audio cues remain in place as immediate backup layers, so the app can still produce sound while stock clips are loading or if a browser blocks an asset request.

## Licensing basis

Mixkit’s public free sound-effects pages state that its effects can be used in personal and commercial projects and that attribution is appreciated but not required.[1] This project uses the files as embedded theatrical sound effects inside a school performance utility, not as redistributed standalone sound libraries. The downloaded files are stored outside the source tree in `/home/ubuntu/webdev-static-assets/hippoquarium-stock-sounds/` and are referenced in the app only through uploaded `/manus-storage/` paths.

## Selected effects

| Cue Need | Mixkit Item ID | Local File | Uploaded App Path | Use in App |
|---|---:|---|---|---|
| Storm bed for tornado | 2390 | `rain-thunder-storm.mp3` | `/manus-storage/rain-thunder-storm_c3699f29.mp3` | Reinforces Q1 Tornado Vase Swirl loop |
| Large lightning crack | 1300 | `strong-close-thunder-explosion.mp3` | `/manus-storage/strong-close-thunder-explosion_0c766274.mp3` | Primary Q2 lightning hit |
| Lightning impact layer | 1286 | `cinematic-impact-thunder.mp3` | `/manus-storage/cinematic-impact-thunder_3a444cc1.mp3` | Secondary Q2 impact layer |
| Apocalypse horn bed | 724 | `cinematic-trailer-apocalypse-horn.mp3` | `/manus-storage/cinematic-trailer-apocalypse-horn_f0d1f088.mp3` | Reinforces Q3 Armageddon Rumble loop |
| Big cinematic slam | 788 | `big-cinematic-impact.mp3` | `/manus-storage/big-cinematic-impact_de367a5e.mp3` | Added to Q3, Q4, and Q5 impacts |
| Pottery/collapse texture | 2958 | `collapsing-structure.mp3` | `/manus-storage/collapsing-structure_a32cf673.mp3` | Primary Q4 Pottery Crash body |
| Heavy stomp / column hit | 3046 | `golem-stomp-c.mp3` | `/manus-storage/golem-stomp-c_b4a74d43.mp3` | Primary Q5 Column Thud body |
| Comic kiss | 2191 | `big-loving-kiss.mp3` | `/manus-storage/big-loving-kiss_d54ba6fa.mp3` | Primary Q6 Hippo Kiss moment |
| Orchestral magic lift | 2290 | `epic-orchestra-transition.mp3` | `/manus-storage/epic-orchestra-transition_e57b5460.mp3` | Q6, Q7, Q8, and finale warmth |
| Trumpet finale | 2293 | `trumpet-fanfare.mp3` | `/manus-storage/trumpet-fanfare_88e68411.mp3` | Primary Q9 Tiny Triumph Fanfare |

## Integration notes

The stock clips are intentionally layered with generated synthesis rather than replacing it outright. This gives each cue a stronger recorded body while preserving the custom comic-Greek tone, the master volume control, and the existing **Stop All** behavior. Active stock clips are now tracked by the shared sound engine, and the manual soundboard plus Performance Mode both stop them when the operator presses the stop control.

## References

[1]: https://mixkit.co/free-sound-effects/ "Mixkit Free Sound Effects"
