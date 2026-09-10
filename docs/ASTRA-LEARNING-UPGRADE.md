# Astra learning and live scene editing

Release prepared September 10, 2026. Existing AI limits, teacher authorization, prediction, citation, and revision flows are preserved.

## Try the new controls

1. Submit a student explanation. Choose **Help me rethink my answer**. The character receives that authenticated learner's latest saved explanation, provisional rubric feedback, collected source IDs, and up to three saved museum notes. Earlier scenario and world-version context is explicitly identified. The unsent argument draft is not sent.
2. Open a museum field note, write an observation and save. Choose **Ask Astra about my observation**. Astra receives the curated museum image, canonical museum metadata, the saved note and the lesson objective. Feedback separates visible detail, interpretation, uncertainty and a revision question. It is saved with the note; repeated requests reuse it, and editing the note invalidates it. This does not award points or add source evidence.
3. Open **Teaching help**, choose a learner (or **My practice learner**) and enable **Change the scene too**. Describe a change, create a live scene edit, optionally correct it while Astra works, then review the consequences, activity, lighting, haze, water conditions and viewpoint. **Preview scene in my view** changes only the teacher's renderer. **Apply scene & share challenge** saves the edit. Alexandria activity edits activate the what-if; other reading-world atmosphere edits preserve the current lesson mode. Student work and reviewed sources are retained.

Suggested scene request: “Bring ships back to full activity, but keep the market quiet and scholar support low. Explain the assumptions and ask a question.”

Suggested live correction: “Keep harbor and market at 0.1, but set library activity to 0.9 because a hypothetical replacement patron replaces lost support.”

## Scope and contracts

- Scene editing changes existing ship, market-stock and district-crowd activity plus the hypothetical intervention, consequences and mechanisms. It also changes day/dawn/sunset/night lighting, clear/hazy/overcast skies, calm/choppy water and overview/harbor/market/library viewpoints. It does not generate geometry, add buildings, produce rain or snow, move characters, or run model-authored code. Literary and documentary settings accept appearance-only edits through a separate strict schema; their authored activities, texts, characters and lesson mode remain fixed.
- Alexandria activity patches require exactly three unique existing zones and activity values in `[0,1]`. Other lesson worlds use a strict appearance-only patch that cannot express story or activity changes. They cannot supply sources, baselines, character changes, or arbitrary extra fields. The UI displays activity as illustrative percentages, not historical measurements.
- Teacher authorization and classroom version checks apply to generation and application. Preview does not write to storage; duplicate application is idempotent. A persistent scene revision resets the learner's view to the new teacher scenario even if the previous class scenario was already active. Subsequent ordinary hints retain that scene identity.
- Museum feedback uses the server's curated image URL, never a browser-supplied URL. It requires ownership of the saved note and its current revision. Concurrent changes reject stale feedback writes. Generated feedback is separate from learner writing and remains provisional.
- No database migration is needed: optional fields use the existing classroom/student JSON state. Existing worlds, conversations, and field notes remain readable.
- All existing quotas remain. The six-request classroom cap is shared by students and teacher; a native steering correction reserves another request. Image analysis is an Astra input capability; new image generation remains disabled.

## Verification

- Final offline checkpoint: 236 tests passed; TypeScript passed. Targeted lint for the new helpers, routes, dialogue, scene preview, scenario hook and tests passed. The existing Classroom and MuseumNotebook effect-related lint errors remain; no rules were disabled.
- The production build passed with the existing large-chunk warning. The local `/try` route and health endpoint responded successfully. No browser interaction or visual QA was performed in this task.
- The shared local development server returned “AI paused,” so live tests used a separate local Worker and database with an explicit six-reservation allowance. Existing local/production allowances and usage counters were not reset or changed.
- Real Astra checks passed: argument assessment (9.2 s), learner-aware dialogue (5.8 s), museum image critique and cached replay (8.1 s), standard scene preview (15.5 s), and native mid-turn scene correction/application (19.8 s). These are individual observations, not latency benchmarks.
- The steered result set harbor and market activity to `0.1` and library activity to `0.9` under a hypothetical replacement patron. Applying both generated scene edits preserved the complete student state and reviewed evidence. The final scene-revision follow-up was covered by offline persistence/selection tests.

Evidence: `artifacts/astra-learning-live.json`. Synthetic classroom access is stored only under ignored `artifacts/private/`.

The earlier local harness used the pre-integration argument contract. Adapt it to the published prediction and selected-citation flow before repeating: `APP_URL=http://localhost:5173 node scripts/smoke-astra-learning.mjs --live`. It requires six available reservations, creates synthetic work in a new classroom, and never changes quotas. Do not run it against production.

Expanded appearance passed a real Astra structured-output request in 7.8 seconds: sunset, hazy, choppy, harbor. Sources and baseline remained unchanged. Release integration checks are recorded with the release deployment.

## All-world continuation

Atmosphere and station-viewpoint direction now work across the catalog and custom reading worlds. The generated renderer updates in place, retaining its camera while a learner is walking. Indoor scenes change lighting and haze; coastal scenes additionally change water movement. Appearance previews are private to the teacher until applied, and returning from preview restores the authored lighting. Viewpoint labels use the lesson station titles.

The all-world release passed 248 tests, TypeScript and targeted lint. A real Astra appearance-only request for the Austen letter world returned sunset/hazy/calm/second-station direction in 5.9 seconds, preserving all assigned sources and activities. No production classroom data or AI limits were changed by verification.
