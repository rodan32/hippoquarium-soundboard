# Revised Script Backdrop Mapping

The revised script creates a stronger theatrical frame than the previous cue flow. It now wants the screen to behave less like a continuous slideshow and more like a stagehand’s projection desk: a few deliberate title cards, then the established mythic disaster arc, then only brief human-photo overlays at the points where the script explicitly invites them.

| Script beat | Projection state | Rationale | Supplied image role |
|---|---|---|---|
| Pre-show / before Thomas begins | **Title Card**: “HIPPOQUARIUM” with “A Mother’s Day catastrophe in five children, fourteen days, and one mask.” | The revised opening is a surprise reveal, so a restrained formal title gives the projector a clean house-open state without spoiling the climax. | No family photo; use designed text over the existing urn aesthetic. |
| Prologue / invocation | **Epigraph Card**: “The watch was always a watch.” | The script’s new Watchman structure benefits from an epigraph state before the chaos begins. This can also cover actor movement and audio arming. | No photo; text only. |
| Scene 1, the absent queen and the fourteen days | **Fourteen Days Without You** | This is the best place for the children-doing-chores photos, because the joke is domestic survival rather than sentimentality. Use a collage-like backdrop that feels intentionally pathetic but affectionate. | `PXL_20220610_162908827.webp` and `PXL_20220601_154602448.webp`. |
| Mneme corrections / Lithuania mention and Sirens of Staying | **Lithuania Dispatch** | The Lithuania photos should appear as a temporary TV-slide/backdrop cue, not as part of the mythic temple restoration. This supports the new “Lithuania” correction and the temptation-to-stay flashback. | `PXL_20220603_164343900.webp`, `PXL_20220605_143300635.webp`, `PXL_20220607_105142173.webp`, and `PXL_20220606_074543976.webp`. |
| Kathleen is summoned / the Watchman names her | **Queen Returns** | A brief human-photo state here can make the summons feel personal before the myth returns to the restoration video. | Prefer the younger Zach/Kathleen photos `PC210069.JPG` and `P5310102.JPG`, used softly rather than full-bright. |
| On the kiss | Existing **Restoration Video** | The script is explicit: the video starts on the kiss, frame one matches the wreckage still, and the Restored Still holds after. This should remain the central visual trick. | No extra photo during the video, to avoid confusing the switch. |
| After the video resolves / optional TV slide | **Candid Real Love Overlay** | The script asks for “not the wedding photo, something later, something tired and real.” The most fitting choice from the supplied set is the older indoor couple photo; it should be an optional overlay, not a replacement for the restored still. | `PC210069.JPG` as a softened cameo overlay. |
| Finale song and bow | **Happily-Ever-Earned / Final Mother’s Day Card** | The revised finale explicitly names a neon title and a final dedication card. Add these as cueable states, with tasteful family-photo fragments if desired. | Use initials/text first; photo use should stay light. |

Implementation note: keep these as projection cue states and Soundboard buttons. The family images should be treated as **brief scenic inserts** rather than a constant scrapbook layer, because the script still depends on the vase/temple imagery for the physical reveal.

## Uploaded Web Asset Paths

| Asset role | Storage path |
|---|---|
| Chores, laundry basement | `/manus-storage/chores-laundry-basement_8746936e.webp` |
| Chores, outdoor dishes | `/manus-storage/chores-outdoor-dishes_20ffaef0.webp` |
| Lithuania airport departure/arrival | `/manus-storage/lithuania-airport_3d8a431f.webp` |
| Lithuania meadow | `/manus-storage/lithuania-meadow_595e01d9.webp` |
| Lithuania sign | `/manus-storage/lithuania-sign_f89bd630.webp` |
| Lithuania wooden figure | `/manus-storage/lithuania-wooden-figure_d5540765.webp` |
| Later candid Zach and Kathleen | `/manus-storage/real-love-candid_291ec79c.webp` |
| Young Zach and Kathleen | `/manus-storage/young-love-bench_02e96a39.webp` |

## Sirens Temptation Insert

The new Kathleen/Sirens idea should sit inside the **Mneme corrections / Lithuania mention and Sirens of Staying** beat. It should not become a second restoration sequence. The projection state should be a deliberately brief comic insert: flat paper-cutout Kathleen alone on screen in a Lithuania-adjacent setting, leaving the Sirens as live actors who can address, tempt, and physically frame the projected character. The joke should read instantly from the audience, then disappear back into the mythic cue language.

| Script beat | New projection state | Recommended use | Why it helps |
|---|---|---|---|
| Lithuania / Sirens of Staying | **Sirens Temptation** | Fire manually from Soundboard or jump to it from Performance Mode when the line lands. Keep it visually bright, silly, and short. | It turns the revised Lithuania reference into a staged joke while avoiding a scrapbook slideshow feeling. |

Implementation recommendation: use the animated-style asset as a **cueable backdrop state** with no looped sound by default. Compose the image like a stage partner: Kathleen should be large enough to interact with, with negative space on one side or around her so live Sirens can point, sing, bargain, or cluster beside the projection. If audio is needed later, use a very short harp/glissando or “temptation sparkle,” not the previous restoration shimmer loop.

## Generated Kathleen Projection Asset

The selected **Sirens Temptation** projection asset is the second generated option because it keeps Kathleen on the left with broad open meadow space on the right for live Siren performers. Use the compressed web asset URL directly in frontend code:

| Asset role | URL |
|---|---|
| Sirens Temptation, animated Kathleen stage partner | `https://d2xsxph8kpxj0f.cloudfront.net/310419663030543142/fqAp36Pj8w3vwPYwmXr6qV/kathleen-sirens-stage-partner-b-QrenBHARvdFbStLho5ADfS.webp` |
