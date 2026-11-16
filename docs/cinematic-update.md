# Cinematic portfolio update

The cinematic version is the current `main`. The previous website is preserved on `archive/pre-cinematic-journey` at `ad4979c06c17dbbad560d22d9d76655e74c0c85a`. The implementation history is also available on `update/cinematic-journey`.

The public pages now use the reviewed cinematic journey: the original SVG hero and native scroll sequence, a reversible camera path, separate service cards that shuffle through a stack, and an edge-aligned project gallery. Both previous and next service selections send outgoing cards to the right, away from the copy. The header and hero read DESIGN & VISUALS. Design covers stay 4:5; AI video players stay 16:9. Both the homepage and All Projects use the live public project records. Admin sign-in, upload routes and authorization are unchanged.

Instagram and LinkedIn now point directly to the existing profiles without mobile sharing parameters. Social buttons have explicit pointer access and a shallow foreground layer. Fonts are local and project covers use Next image optimization. A lightweight CSS logo intro restores the original entrance, pulse, rotation and progress line before the homepage journey; its bounded fallback and reduced-motion mode prevent it from blocking navigation. The motion module loads during the intro and mounts after it finishes. The cursor loop, Lenis loop, Framer Motion and GSAP are not imported by the new public routes. The journey renders only during interaction and pauses when idle, offscreen, hidden or behind a design-project dialog. Runtime listeners are removed on unmount.

AI videos start inline on the first play-button activation. They do not open a dialog, and the separate Behance link remains below each player. No video source is assigned until playback is requested. Starting another video pauses the previous player, including when using native controls; leaving Portfolio, filtering or unmounting pauses/releases playback. A failed request offers an inline retry.

## Validation

- `npm test`: engine, native-scroll, branding, inline-video and logo-intro regression checks, including initial markup, first-click play, native controls, failure/retry and Strict Mode cleanup.
- `npm run build`: production compilation and TypeScript validation pass on Next 15.5.15. The build reports 103 kB first-load JavaScript for each public route, plus the small motion runtime loaded after hydration.
- 42 additional DOM/model interaction checks passed against the actual React-rendered shell, including simulated desktop/mobile contexts, service swaps, galleries, dialogs, native scroll, social anchors, idle rendering and mount cleanup.
- A read using the existing public database key returned all 14 projects and both AI video URLs. No database rows or storage objects were changed during verification.
- Browser layout, mobile device behavior and actual frame rate were not measured because managed browser control was unavailable. Model/DOM tests do not establish visual smoothness on every device.

## Deployment and rollback

`main` remains the Vercel Production Branch. Its current cinematic source serves `seif-portfolio0.vercel.app`, and future pushes to `main` follow the existing automatic production deployment workflow. Retain the existing Supabase production environment variables. Do not copy local build placeholders into Vercel.

The previous production deployment and `archive/pre-cinematic-journey` remain available for rollback. Promoting the previous deployment restores the prior website without rewriting branch history. No database records, storage objects or admin credentials were changed by this UI update.
