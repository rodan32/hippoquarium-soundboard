# Hippoquarium Soundboard Design

The selected design philosophy is **Ancient Greek black-figure pottery adapted into a backstage cue console**. The interface will continue the same terracotta, black-figure, cream-limestone, dusty-rose, and ochre-gold visual language as the approved backdrops, while keeping controls large enough for practical cueing during rehearsal or performance.

| Cue Group | Cue Name | Intended Use | Playback Behavior |
|---|---|---|---|
| Chaos | Tornado Vase Swirl | Swirling comic disaster and rising chaos | Loopable ambience |
| Chaos | Lightning Crack | Sharp punctuation during wreckage or surprise | One-shot |
| Chaos | Armageddon Rumble | Full-collapse disaster bed | Loopable ambience |
| Impact | Pottery Crash | Comic crash or entrance destruction | One-shot |
| Impact | Column Thud | Heavy architectural hit | One-shot |
| Magic | Hippo Kiss Sparkle | Kiss moment and comic romantic shimmer | One-shot |
| Magic | Kintsugi Restoration | Repair magic building under dialogue or transition | Loopable ambience |
| Romance | Laurel Bloom | Gentle love-magic reveal | One-shot |
| Finale | Tiny Triumph Fanfare | Final restored façade celebration | One-shot |
| Utility | Preshow Urn Hum | Quiet warm ambience before the scene begins | Loopable ambience |

The app will use browser-native Web Audio synthesis rather than external audio files. This keeps the project self-contained, avoids asset loading problems in a theatre setting, and allows every sound to respond instantly after the operator unlocks audio with the first click.

Operationally, the board will have a fixed master strip with **Stop All**, master volume, loop-status readout, and a short operator note. The cue pads will be grouped by dramatic purpose and color-coded: dark red-brown for chaos, black/cream for impact, gold for magic, rose for romance, and cream for utility. Looping cues will display a persistent active state until stopped.
