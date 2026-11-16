# Cinematic portfolio update

The cinematic version is the current `main`. The previous website is preserved on `archive/pre-cinematic-journey` at `ad4979c06c17dbbad560d22d9d76655e74c0c85a`. The implementation history is also available on `update/cinematic-journey`.

The public pages now use the reviewed cinematic journey: the original SVG hero and native scroll sequence, a reversible camera path, six persistent service cards that shuffle through a circular stack without changing their content, and an edge-aligned project gallery. Forward service selections send the front card around the right edge to the rear. The visible card underneath becomes the front card on the next turn, including the last-to-first wrap and rapid queued input. Backward selections retrieve the previous card from behind, around the right edge and into the foreground; neither path crosses the copy on the left. The header and hero read DESIGN & VISUALS. The display name is Seif El Din with no hyphen or trailing dot; the header uses the Mochi display face, and both the hero statement and About signature read Creative Designer. About punctuation uses commas instead of em dashes. Design covers stay 4:5; AI video players stay 16:9. Both the homepage and All Projects use the live public project records. Admin sign-in, upload routes and authorization are unchanged.

Instagram and LinkedIn now point directly to the existing profiles without mobile sharing parameters. Social buttons have explicit pointer access and a shallow foreground layer. Fonts are local and project covers use Next image optimization. A compact CSS logo intro uses a 60–77px mark, drawn orbit/frame, glow and progress accent. It exits after its short minimum sequence and after the runtime and local fonts are ready. The runtime initializes behind the overlay so layout is stable, and a one-shot name reveal starts as the overlay begins fading, completing within that fade; the reveal uses opacity and transform rather than a text clip. Resizing and repeated reveal calls do not restart it. Reduced-motion users get a short static intro. The cursor loop, Lenis loop, Framer Motion and GSAP are not imported by the new public routes. The journey renders only during interaction and pauses when idle, offscreen, hidden or behind a design-project dialog. Runtime listeners are removed on unmount.

The About portrait uses the original 1080px source encoded losslessly, with responsive high-quality delivery, correct square dimensions and contain fitting. The previous 580px preview, cover enlargement and desaturation are no longer used.

AI videos start inline on the first play-button activation. They do not open a dialog, and the separate Behance link remains below each player. No video source is assigned until playback is requested. Starting another video pauses the previous player, including when using native controls; leaving Portfolio, filtering or unmounting pauses/releases playback. A failed request offers an inline retry.

## Mobile layout

Phones up to 900px and touch tablets up to 1100px use the same pinned camera journey and `stationPose` model as desktop. Each chapter has a measured reading interval: native document scrolling first carries any tall content through the available space, then drives the camera flight to the next chapter. Reversing the scrollbar retraces both reading and travel. Navigation lands on a chapter's reading plateau. Resize, rotation and content-height changes remap the current journey position. There are no nested vertical scrollers. Reduced-motion users retain accessible native document flow.

The mobile hero reserves separate CSS Grid cells for text and artwork throughout the full assembly, including landscape. The artwork stays inside its cell and animates with transform; it cannot expand underneath the title. The hero scrubs directly against its measured native scroll distance, without a delayed interpolation loop.

The mobile project strip uses native horizontal scrolling and snap positions, synchronized with its arrow buttons and counter. Design media remains 4:5 and AI video remains 16:9, including All Projects. Mobile camera rendering uses transforms and opacity for at most two visible chapters, updates once per animation frame and stops when scrolling stops. The particle canvas stays idle; there are no mobile blur animations. Touch targets, dialog scrolling, safe-area padding, portrait image sizing and tablet project columns retain dedicated responsive rules.

## Validation

- `npm test`: 52 engine, responsive, native-scroll, branding, inline-video, service-order and logo-intro regression checks, including initial markup, first-click play, native controls, failure/retry and Strict Mode cleanup. Responsive checks cover 12 portrait/landscape viewport configurations from 320px phones to 1024px touch tablets, the shared camera path, long-content reading, reverse scrubbing, frame coalescing, separated hero grid cells, native swiping, last-card selection, rotation and desktop restoration. Supplied DOM geometry and CSS cascade checks do not measure pixel layout.
- `npm run build`: production compilation and TypeScript validation pass on Next 15.5.15. The build reports 103 kB first-load JavaScript for each public route, plus the small motion runtime loaded after hydration.
- 42 additional DOM/model interaction checks passed against the actual React-rendered shell, in desktop contexts, including service swaps, galleries, dialogs, native scroll, social anchors, idle rendering and mount cleanup.
- A read using the existing public database key returned all 14 projects and both AI video URLs. No database rows or storage objects were changed during verification.
- Browser layout, mobile device behavior and actual frame rate were not measured because managed browser control was unavailable. Model/DOM tests do not establish visual smoothness on every device.

## Deployment and rollback

`main` remains the Vercel Production Branch. Its current cinematic source serves `seif-portfolio0.vercel.app`, and future pushes to `main` follow the existing automatic production deployment workflow. Retain the existing Supabase production environment variables. Do not copy local build placeholders into Vercel.

The previous production deployment and `archive/pre-cinematic-journey` remain available for rollback. Promoting the previous deployment restores the prior website without rewriting branch history. No database records, storage objects or admin credentials were changed by this UI update.
