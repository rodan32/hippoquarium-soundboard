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
