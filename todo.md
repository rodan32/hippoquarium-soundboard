# Hippoquarium Soundboard GitHub Publishing Tasks

- [ ] Inspect the current Git repository status and remotes.
- [ ] Confirm the GitHub account/owner available through the configured GitHub CLI.
- [ ] Create a private repository for the Hippoquarium soundboard under the preferred owner when available.
- [ ] Add the repository as the project remote if needed.
- [ ] Commit any uncommitted project files with a clear message.
- [ ] Push the current branch to GitHub.
- [ ] Report the repository URL and any setup notes to the user.

## Public Repository Update

- [ ] Change `rodan32/hippoquarium-soundboard` from private to public for student collaboration.
- [ ] Verify the current Git push state after the earlier SSH host-key prompt.
- [ ] Ensure the current main branch is available on the public GitHub repository.
- [ ] Share the public repository URL with collaboration notes.

## Fullscreen Performance Website Concept

- [ ] Describe a single fullscreen operator website that combines backdrops, animated transitions, and sound cues.
- [ ] Define a simple keyboard and mouse cueing model suitable for rehearsal or performance.
- [ ] Explain how the audience-facing projection view and operator controls should be presented.
- [ ] Identify practical implementation steps if the concept is approved.

## Performance Mode Build

- [ ] Preserve the existing manual soundboard as the rehearsal and emergency-cue page.
- [ ] Add a separate Performance Mode view for fullscreen cue playback.
- [ ] Define a cue stack that coordinates backdrop visuals, transition video, audio effects, and timing notes.
- [ ] Add keyboard and mouse controls for next cue, previous cue, blackout, stop all audio, and operator overlay toggle.
- [ ] Keep audience-facing projection clean, with operator controls hidden unless requested.
- [ ] Run TypeScript and production build checks after implementation.
- [ ] Save a checkpoint and report the updated app link with operating instructions.

## Sound Strengthening Pass

- [ ] Inspect the shared Web Audio sound engine and current cue builders for weak gain staging, thin frequency content, and short envelopes.
- [ ] Add stronger theatrical synthesis layers for tornado, lightning, armageddon rumble, pottery crash, column thud, hippo kiss, restoration, laurel bloom, finale, and preshow hum.
- [ ] Add master-output safety shaping so the cues can become fuller without harsh clipping.
- [ ] Validate TypeScript with `pnpm run check` after the audio pass.
- [ ] Save a new checkpoint and push the stronger sound update to GitHub.

## Optional Free Stock Sound Fallback

- [ ] If the strengthened generated sounds still feel too weak in rehearsal, research free sound sources with clear licensing for theatrical use.
- [ ] Prefer short, attribution-friendly or public-domain files for storm, lightning, crash, rumble, sparkle, restoration shimmer, and fanfare cues.
- [ ] Upload any chosen audio files through the web static asset workflow rather than storing large media directly in the project.
- [ ] Add clear attribution and source notes for any external stock sounds that are integrated.

## Stock Sound Integration Pass

- [ ] Find free, license-safe stock sounds for the biggest weak cues: tornado, lightning, armageddon rumble, pottery crash, column thud, restoration shimmer, hippo kiss sparkle, laurel bloom, and finale fanfare.
- [ ] Prefer Pixabay or Mixkit files when suitable because they are simpler to use without attribution; use Freesound only for CC0 or clearly attributed CC-BY assets.
- [ ] Download only the selected short audio files and store originals outside the project in `/home/ubuntu/webdev-static-assets/`.
- [ ] Upload selected audio assets through the web static asset workflow and reference returned URLs in code.
- [ ] Keep generated Web Audio layers as backup and sweetener layers underneath stock sounds.
- [ ] Add source and license notes for every integrated stock audio file.
- [ ] Validate TypeScript and production build after integration.
- [ ] Save a checkpoint and push the stock-sound update to GitHub.

## Two-Window Soundboard and Performance Workflow

- [ ] Inspect the current soundboard and Performance Mode navigation controls.
- [ ] Add a clear control on the manual soundboard to open Performance Mode in a separate projector window.
- [ ] Keep the manual soundboard available in the original operator window after launching the projection window.
- [ ] Add helpful projection-window guidance so the Performance Mode window can be fullscreened independently.
- [ ] Validate TypeScript and production build after the navigation update.
- [ ] Save a checkpoint and push the two-window workflow update to GitHub.

## Transition Smoothing Review

- [ ] Review Performance Mode cue-change logic for abrupt image swaps, blackout timing, remote command timing, and transition overlay behavior.
- [ ] Review stock-audio and generated-audio start/stop behavior for sudden cutoffs, overlapping impacts, and missing fade-outs.
- [ ] Smooth visual transitions without making operator controls sluggish.
- [ ] Smooth audio entrances and exits while preserving the larger stock-sound cue impact.
- [ ] Validate TypeScript and production build after transition changes.
- [ ] Save a checkpoint and push the transition-smoothing update.

## Narrative Continuity Fix

- [x] Inspect Performance Mode cue scene order and confirm why the kiss/restoration sequence briefly returns to chaos imagery.
- [x] Reorder or remap the Performance Mode scenes so the narrative flows from disaster into kiss, restoration, laurel bloom, and finale without visual regression.
- [x] Validate the fix with `pnpm run check` and `pnpm run build`, then save a checkpoint and push to GitHub.

## Second-to-Last Cue Cleanup

- [x] Inspect the second-to-last Performance Mode scene for duplicate kiss/restoration imagery and looping sound assignments.
- [x] Remove or reduce the annoying restoration loop in that scene while keeping a clear final narrative arc.
- [x] Validate the cue cleanup with `pnpm run check` and `pnpm run build`, then save a checkpoint and push to GitHub.

## Revised Script and Family Photo Integration

- [x] Review `Hippoquarium_v7_WatchmanHello.docx` for revised beats, title/epigraph opportunities, and photo mentions.
- [x] Map supplied personal photos to restrained cueable backdrop states, including Lithuania, young couple, and kids-doing-chores moments.
- [x] Prepare the uploaded images as web-safe assets without re-viewing the image files, honoring the user's instruction.
- [x] Add title and epigraph states if they strengthen the revised performance flow.
- [x] Implement soundboard and Performance Mode controls for the new backdrop states.
- [x] Validate with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## Animated Kathleen Sirens Temptation Insert

- [x] Create a brief comic South Park–style Kathleen/Sirens temptation projection asset using the supplied Kathleen/Lithuania reference material without re-viewing the uploaded images.
- [x] Add the Sirens temptation as a restrained cueable backdrop state rather than replacing the main restoration arc.
- [x] Expose the Sirens temptation state from the Soundboard projector controls and Performance Mode operator controls.
- [x] Re-check that title, epigraph, Lithuania, chores, and family-photo states match the revised script beats.
- [x] Validate with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## Live Sirens with Projected Kathleen Clarification

- [x] Revise the Sirens temptation concept so the projection shows only animated Kathleen as a screen character, while the Sirens remain live actors interacting with her.
- [x] Avoid drawing cartoon Sirens into the projection asset; reserve screen space and timing for live performers to address the projected Kathleen.
- [x] Give the projected Kathleen state a readable stage-partner composition, likely centered or slightly off-center with a simple Lithuania/Sirens temptation environment.

## Projection Sequence Simplification

- [x] Remove the epigraph projection state from Performance Mode and Soundboard jump controls.
- [x] Reorder the projection sequence to title, real love, queen, Lithuania, 14 days, Sirens, finale.
- [x] Remove visible text overlays from image insert states, keeping text only on the title and finale cards.
- [x] Validate the simplified sequence with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## Corrected Sirens Projection Concept

- [x] Replace the generated/cartoon Sirens projection with the attached Kathleen photo used only by file path, without re-viewing the image.
- [x] Put the photo-based Kathleen figure on one of the existing show backgrounds rather than generating a new illustrated scene.
- [x] Animate the Kathleen photo intentionally crudely, with a small bounce, wobble, and direction reversal inspired by a low-frame-rate cutout video gag.
- [x] Keep the Sirens insert free of text overlays and preserve space for live actors to interact with the projected Kathleen.
- [x] Validate the corrected Sirens scene with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## Restore Scene System with Temporary Inserts

- [x] Restore the core Performance Mode progression as title, beginning of the catastrophe, horrible chaos, kiss and restoration, then finale if still needed.
- [x] Convert real love, queen, Lithuania, 14 days, and Sirens into independently triggerable insert overlays instead of main sequence steps.
- [x] Allow inserts to be turned off cleanly so the underlying main scene remains active.
- [x] Preserve the corrected crude photo-based Kathleen Sirens gag as an insert, not as a permanent scene replacement.
- [x] Update Soundboard controls to separate main scene stepping from insert trigger/dismiss controls.
- [x] Validate the restored scene system with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## Sound Cleanup and Theatrical Flow Correction

- [x] Audit current sound cues and remove or rename leftover weird original cues that no longer serve the play.
- [x] Rebuild the soundboard cue list around coherent stage needs such as low rumble, rising chaos, crash accents, silence/hold, video underscoring, and restoration swell.
- [x] Rework the main projection sequence so chaos leads smoothly into the video moment and then resolves into the kiss/restoration scene.
- [x] Preserve the video as the successful centerpiece while correcting the scenes immediately before and after it.
- [x] Keep temporary inserts available without disrupting the main scenery flow.
- [x] Validate the corrected sound and scenery flow with `pnpm run check` and `pnpm run build`, then checkpoint and push.

## No-Blackout Transition Refinement

- [x] Avoid fades to black between scenery states except when the operator explicitly presses Blackout.
- [x] Replace abrupt chaos, video, and kiss/restoration scene shifts with cross-dissolves, lighting changes, and layered scenic transformations.
- [x] Make the video feel embedded in the stage sequence rather than a separate hard-cut projection mode.
- [x] Keep restoration visually connected to the preceding chaos and video, resolving the same world rather than switching to an unrelated scene.

## Q6/Q7 Doom-Horn Cleanup

- [x] Inspect Q6 Kiss Cue and Q7 Restoration Underscore for remaining ominous brass, doom-horn stock layers, or low synthetic horn-like tones.
- [x] Remove or replace those layers so Q6 reads as a clean comic kiss/magic handoff and Q7 reads as gentle restoration underscoring.
- [x] Validate with `pnpm run check` and `pnpm run build`, then checkpoint and push.
