# Parallel implementation plan

Updated September 10, 2026. This is the next implementation sprint for the existing app, not a greenfield rebuild. Three concurrent agents reviewed the interface, scene, and backend to define these work packages. Review is complete; the feature changes below are not yet implemented.

## Target

**Character-dialogue checkpoint:** free-form, source-grounded Astra conversations are now connected to three scene characters. Eight new tests cover dialogue validation/context and atomic world/progress writes. This also implements the atomic persistence guard from C2 and student-role restoration/stale-response guards; full A3 reset, selected-learner intervention, source-card omission validation, and formal prediction/revision work remain. See the build log for exact live and browser checks; do not treat the original diagnostic findings as an unchanged inventory.

**Product acceptance:** [Product readiness](PRODUCT-READINESS.md) defines the signature teacher-directed learning moment and concrete usability gates. A separate agent reviews the present build independently; after fixes, a final independent review against the frozen commit and deployed app is required before calling it ready. Distinguish recording readiness from a supervised classroom pilot or broader release.

**Learning/immersion priority:** [UX research](LEARNING-UX-RESEARCH.md) and the [independent review brief](REVIEW-CONTEXT.md) now guide the next pass. The student shell now uses a viewport-filling world with an on-demand journal/conversation and in-app evidence reader. Next learning gates: structured per-claim citation selection, passage annotations/versioning, an explicit prediction and revision reflection, and teacher-visible changes in reasoning. Evidence count and archive unlock must not be reported as learning outcomes. These requirements apply to the literature expansion too.

**Scope expansion:** the user also wants English literature, including The Odyssey and Pride and Prejudice. [Literature expansion](LITERATURE-EXPANSION.md) defines the book-specific teaching loops, Blender packs, source/rubric contracts, and revised agent work. Retain the correctness fixes below; freeze the generalized lesson-pack contract before implementing literature across these tracks. The running app remains Alexandria-only until that work is complete.

**Art direction update:** the user requested higher-fidelity landmarks and sourcing free reusable models. Use the [open-model shortlist](OPEN-MODEL-SHORTLIST.md) for a hybrid pipeline: acquire suitable existing assets, then adapt and optimize in Blender. The editable library/lighthouse scene and GLB exports are already integrated through `components/worlds/scene/landmarks.ts`. Preserve the loaded assets and door-node contract when carrying out track B below. Pottery is the first external acquisition candidate; detailed lighthouse/coastal scans require optimization before replacement. Candidates are researched, not installed. This does not replace the per-zone activity or hint-placement fixes.

Ship a reliable, readable **teacher → student → teacher intervention → student revision** loop for the 60-second video. Prioritize correct learner context, visible causal changes, and preserved progress over additional worlds or dashboard features. The recording follows `counterfactual-worlds-handoff/05-one-minute-demo.md`.

Existing baseline: teacher authoring, invitations, shared classroom state, Three.js world, evidence collection, argument assessment, intervention preview/application, and native Astra steering work in prior smoke checks. Twenty deterministic tests, TypeScript, and the production build passed for the immersive UI release at `c4672a6`, which was published privately. Earlier TLS provisioning failure is resolved. Those results do not substitute for validation after this sprint or an actual two-student session.

## Team and ownership

Use **one coordinator and three concurrent implementation agents**, matching the four available agent slots. Agents share a checkout, so assign files exclusively. Separate teacher and student agents would collide in today's monolithic `Classroom.tsx`; keep both with one interface owner initially.

| Owner | Exclusive writable files | Responsibility |
|---|---|---|
| A — Teacher/student interface | `components/worlds/Classroom.tsx`, new `TeacherPanel.tsx` and `StudentPanel.tsx`, `app/globals.css` | Learner selection, demo layout, reset, feedback visibility; scene call-site integration |
| B — 3D causal world | `components/worlds/WorldScene.tsx`, new `components/worlds/scene/*`, `tests/scene.test.ts` | Correct hint location, per-zone effects, camera focus, archive reveal |
| C — Backend reliability | `app/api/classroom/route.ts`, `app/api/director/route.ts`, `lib/server.ts`, new `lib/server/*`, new `tests/reliability.test.ts`, `scripts/smoke*.mjs`, new reliability/evaluation scripts and fixtures | Stored learner context, atomic state guards, bounded requests, regression/evaluation evidence |
| Coordinator | Shared contracts (`lib/world.ts`), database/migrations, package manifests/lockfile, README, plans/build log, Sites configuration | Freeze interfaces, resolve cross-track dependencies, review/integrate, aggregate checks, commits/pushes, hosting |

No agent edits another owner's files. Request a contract change with its caller impact instead. The coordinator alone changes dependencies, commits, pushes, manages runtime secrets, or publishes. Never stage environment files or private smoke credentials. No concurrent package installs, migrations, or builds against shared output directories.

## Wave 0 — Freeze contracts (coordinator, approximately 15–25 minutes)

Agree on these interfaces before dispatching implementation. Agents can inspect and prepare their files while this happens.

1. **Selected learner:** both standard director requests and WebSocket `start` send `studentId`, not a caller-provided student object. Backend authenticates the teacher and resolves that learner within the classroom. Missing or foreign IDs fail before an Astra call. Teacher preview remains an explicitly selectable learner, rather than an implicit fallback.
2. **Hint audience:** keep hints classroom-wide for this sprint. UI says “Based on [learner]; shared with the class.” Selecting a learner changes the reasoning context, not delivery permissions. Private per-student patches would require a separate state contract and are deferred.
3. **Scene hint:** replace `hint: boolean` with `hint: Pick<Intervention, 'id' | 'zone'> | null`. Agent B owns the prop declaration; A updates the call site. No world schema migration is needed.
4. **Regeneration rule:** a world must not be replaced after students begin evidence collection or argument submission. Enforce the rule at persistence time, including concurrent operations. The UI directs the teacher to a fresh classroom. This intentionally avoids silently discarding collected evidence.
5. Preserve existing response shapes for assessment and `{patch, baseVersion}`; native correction acceptance remains distinct from completed output. Do not silently represent the standard fallback as native steering.

## Wave 1 — Three concurrent feature tracks

### Agent A: teacher/student demo flow (roughly 2–3 hours)

**A1 · P0 — Correct learner selection.** Make live classroom rows selectable. Show the chosen learner's latest claim, evidence, and missing rubric items beside the director. Send that learner's ID for both transports. Keep teacher preview identity separate from the selected real learner.

Acceptance: with two joined students, selecting B uses B's persisted context, not A or the preview account. Selection survives polling; a missing selection produces a clear action instead of silently changing learners. Hint preview states the classroom-wide audience.

**A2 · P0 — Keep the critical actions visible.** Extract typed teacher/student panels as useful, without a broad architecture rewrite. Put teacher intervention controls in the Live view next to the learner's claim. Show latest student feedback and the teacher hint where the student can find them immediately. Preserve source editing in the Lesson view.

Acceptance: teacher can select learner, request help, correct it, and apply preview without hunting through unrelated causal cards. Student can find feedback and revise. Keep keyboard-accessible navigation and source/assumption labels. Target 1440×900; check 1280×720 before recording when browser QA is authorized.

**A3 · P0 — Repeatable fresh classroom.** Reset claim, scenario, focus, evidence selection, patch, steering input/status, and selected learner after successful creation. Guard polling and in-flight completions so an older classroom cannot overwrite the new view.

Acceptance: a second take begins at the prepared baseline with no old claim, hint, or steering state. Failed creation preserves the current classroom. Failed submission preserves the student's draft; successful submission must not erase text typed after that submission started.

**A4 · P1 — Legible progress and feedback.** Use actual socket events for working, correction accepted, preview ready, and applied states. Expose rubric reasons without hover-only tooltips. Reveal new feedback/hints without scripted successful answers.

### Agent B: 3D causal readability (roughly 2–3 hours)

**B1 · P0 — Place the intervention correctly.** The current scene discards the intervention zone and always places the prop at the harbor. Use the agreed hint prop to anchor it at harbor, market, or library.

Acceptance: each zone places its hint correctly; changing the patch moves it; clearing removes it. No scene reload or progress reset. Coordinate the single call-site change with A.

**B2 · P0 — Tie visible activity to the right cause.** Harbor crates currently follow market activity; library activity controls citizens spread around the plaza. Partition props by zone and place scholars near the library.

Acceptance: isolated harbor/market/library parameter changes affect only that zone's assigned activity. Values 0 and 1 work, baseline restores the scene, and hypothetical labels remain intact. Add focused pure mapping tests if mappings are extracted.

**B3 · P1 — Make focus and success readable.** Add bounded camera presets and a clear archive reveal. User orbit interrupts automatic focus. Avoid new dependencies or external assets.

Acceptance: quick focus shows the intended place; switching focus mid-transition remains stable. Reduced motion snaps to the intended state and skips celebratory camera movement. Do not report measured FPS or visual quality until checked.

**B4 · P1 — Renderer robustness.** Guard zero-size resize, clean up RAF/listeners/resources, and provide an actionable WebGL failure state while preserving non-canvas navigation.

### Agent C: reliable Astra and classroom state (roughly 2–3 hours)

**C1 · P0 — Resolve learner context server-side.** Implement the selected learner contract in both director paths. Share lookup/validation logic where practical. Update smoke scripts that currently submit student objects.

Acceptance: valid teacher plus same-class learner succeeds; missing learner, another classroom's learner, and student credentials fail before paid model work. Supplied arbitrary student content is not used as authoritative context.

**C2 · P0 — Close state races.** Authoring currently checks for arguments before a long model call and later guards only the classroom version. Argument persistence checks the world separately from the student write. Prevent a concurrent regeneration from persisting alongside progress from the old world. Evidence collection also needs a consistent world reference.

Acceptance: deterministic interleavings of author/argue and author/collect never leave old evidence or graded turns attached to a replacement world. Use atomic SQL predicates/transactions appropriate to D1, not only an extra read. Preserve existing duplicate patch, stale patch, and per-student revision guards. Ask the coordinator for any necessary migration; do not silently alter the database schema.

**C3 · P1 — Failure/transport coverage.** Add targeted tests for invalid director IDs, stale writes, closed steering connection, and rejection after a world change. Bound actual request bodies and WebSocket frames, rather than trusting Content-Length alone. Preserve drafts and state on errors; never fabricate a successful fallback.

**C-source · P0 — Retain reviewed historical evidence.** Existing validation rejects altered historical cards but permits omission. Require every reviewed source card to remain present with its original content and provenance. Coordinate any `lib/world.ts` helper change with the coordinator.

Acceptance: omitted, altered, or fabricated historical source cards are rejected before persistence; legitimate changes to hypothetical teaching props remain possible. Add a focused deterministic regression.

**C4 · P1 — Twelve-case rubric evaluation.** Create fixtures for supported agreement, supported disagreement, alternative mechanism, weak mechanism, missing evidence, keyword stuffing, fabricated quotation, unavailable evidence, prompt injection, uncertainty, partial reasoning, and irrelevant prose. Deterministic structural checks run offline; an explicit live command evaluates model behavior and records response IDs, timing, and failures without credentials.

Acceptance: malformed evidence/excerpts cannot unlock through code. Live semantic failures are reported, not hidden or changed into passing fixtures. Report sample size and latency range; do not infer educational efficacy or a reliable p95 from this small sample.

## Wave 2 — Integration and verification (coordinator, approximately 45–75 minutes)

Integrate A+C selected learner behavior first, then A+B hint placement. No new features during integration.

1. Inspect each agent's diff for ownership, secrets, API compatibility, and unintended source/provenance changes.
2. Run deterministic tests, TypeScript, then one production build. Do not run three redundant builds while agents are editing shared output.
3. Exercise a teacher and two actual student sessions: select B → generate/steer hint → preview/apply → student sees the hint → revised argument is assessed. Check inventory, transcript, and unlock preservation.
4. Run the new race regressions, existing live smoke checks affected by the changed contract, and the bounded rubric evaluation. Reuse already-passing unaffected authoring checks unless a related change requires them.
5. Run scene mapping checks and the required WebMCP contract checks if affected. Browser layout/performance checks are separately pending until performed; do not label them passed based on a build.
6. Update `docs/BUILD-LOG.md` with actual agent contributions, defects fixed, tests, and measured results. This is submission evidence for Astra in development.
7. Commit and push the integrated, validated state; build/package/save the exact source and deploy privately. Preserve the existing Sites project and authorized audience.
8. Run the final independent review from `PRODUCT-READINESS.md` on that commit and deployment. Resolve blockers, verify fixes, and record separate readiness verdicts before recording. The diagnostic review of the earlier build is not this final gate.

## Wave 3 — One-minute demonstration

Rehearse the existing storyboard against real results: teacher setup (0–10s), student transformation (10–23s), weak claim (23–33s), teacher correction (33–45s), revision/archive (45–56s), actual model inspector (56–60s).

Recording/editing is a distinct deliverable, currently not produced. Cut generation waits transparently; do not imply the whole workflow took 60 seconds. Native steering, selected learner, physical hint location, and preserved revision must be visible. If time is short, cut camera polish and expanded evaluation before cutting correctness fixes or either interface.

## Agent dispatch protocol

Give each agent this plan plus its exact track and writable paths. The coordinator retains the fourth slot for integration work. Suggested dispatch message:

> Implement track [A/B/C] from docs/PARALLEL-IMPLEMENTATION-PLAN.md after the Wave 0 contracts are frozen. Edit only your owned files. Preserve other agents' changes. Do not install dependencies, change shared schemas, commit, push, deploy, or expose credentials. Send any cross-track requirement to the coordinator before editing outside your boundary. Report completed tasks, changed files, checks actually run, remaining failures, and integration notes. Do not claim unperformed visual or live verification.

Agents report a first dependency check promptly, then completed milestones. A blocked agent continues independent work in its own track. Coordinator resolves contract changes once and broadcasts them to affected agents. Agents do not wait on one another for unrelated work.

Commit checkpoints: (1) this plan; (2) contract-compatible P0 fixes after all participating files are ready; (3) validated polish/regressions; (4) final build evidence and storyboard adjustments. Stage explicit files, inspect the staged diff, and push each coherent checkpoint. Never commit half of a changed API or prop contract solely to maintain cadence.

The estimated elapsed sprint is approximately 3–5 hours for P0 and integration with parallel work, excluding optional P1 tasks, external hosting delays, and recording. This is a planning range, not a promise; re-estimate after Wave 0. Defer new eras, voice, arbitrary generated geometry, individual hint delivery, roster imports, and analytics until this demo loop passes.
