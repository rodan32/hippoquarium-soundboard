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
