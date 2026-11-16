# Cinematic portfolio update

Branch: `update/cinematic-journey`. Base: `ad4979c06c17dbbad560d22d9d76655e74c0c85a` on `main`.

The public pages now use the reviewed cinematic journey: the original SVG hero and native scroll sequence, a reversible camera path, separate service cards that shuffle through a stack, and an edge-aligned project gallery. Design covers stay 4:5; AI video players stay 16:9. Both the homepage and All Projects use the live public project records. Admin sign-in, upload routes and authorization are unchanged.

Instagram and LinkedIn now point directly to the existing profiles without mobile sharing parameters. Social buttons have explicit pointer access and a shallow foreground layer. Fonts are local, project covers use Next image optimization, and videos load only when opened. The former loading gate, cursor loop, Lenis loop, Framer Motion and GSAP are not imported by the new public routes. The journey renders only during interaction and pauses when idle, offscreen, hidden or behind a project dialog. Runtime listeners are removed on unmount.

## Validation

- `npm test`: eight portable engine and content regression checks.
- `npm run build`: production compilation and TypeScript validation pass on Next 15.5.15. The build reports 103 kB first-load JavaScript for each public route, plus the small motion runtime loaded after hydration.
- 42 additional DOM/model interaction checks passed against the actual React-rendered shell, including simulated desktop/mobile contexts, service swaps, galleries, dialogs, native scroll, social anchors, idle rendering and mount cleanup.
- A read using the existing public database key returned all 14 projects and both AI video URLs. No database rows or storage objects were changed during verification.
- Browser layout, mobile device behavior and actual frame rate were not measured because managed browser control was unavailable. Model/DOM tests do not establish visual smoothness on every device.

## Deployment and rollback

Keep `main` on its existing commit. A Git push to this branch lets the existing Vercel integration build a preview. Promote that verified branch deployment to Production to serve the current `seif-portfolio0.vercel.app` domain, and select this branch as the Vercel Production Branch if future pushes should update that domain automatically. Retain the existing Supabase production environment variables. Do not copy local build placeholders into Vercel.

The previous production deployment and unchanged `main` remain available for rollback. Promoting the previous deployment restores the prior website without rewriting branch history.
