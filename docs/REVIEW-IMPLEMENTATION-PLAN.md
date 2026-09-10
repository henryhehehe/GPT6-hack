# Independent review implementation plan

Prepared September 10, 2026. Requested deliverable: an implementation plan; no product changes or deployment are included in this pass.

Complete one observable loop: **predict → read and select evidence → explain → teacher selects the learner and steers a challenge → revise and explain the change → inspect both versions**. Preserve the immersive student world and the existing source importer.

This plan translates [the independent review](INDEPENDENT-PRODUCT-REVIEW.md) into work against the current checkout. It updates the remaining-work inventory from [the earlier parallel plan](PARALLEL-IMPLEMENTATION-PLAN.md); [product readiness](PRODUCT-READINESS.md) remains the acceptance contract. The original diagnostic review should remain unchanged as historical evidence.

## 1. Baseline and scope

The independent review inspected `ca40864`. Current HEAD at inspection is `0928dec`, following character dialogue and source-intake releases. There are also uncommitted classroom, lesson-builder, world/schema, server, and setting-image changes. Preserve those changes and reconcile with their owner before implementation touches the same files. These findings come from source and test-definition inspection, not a browser session or a new test run.

| Review finding | Current code evidence | Work remaining |
| --- | --- | --- |
| 1. Selected learner is ignored | `Classroom.tsx` still sends its preview `student`; both director routes accept caller-supplied student content. Roster cards have no selection action. | Implement selection, authoritative lookup, and visible context/audience for both transports. |
| 2. Reasoning change is not inspectable | `StudentState` and `Turn` lack prediction, passage selections, revision links, and reflection. Assessment receives the entire evidence inventory. Revision progress uses turn count. | Implement the complete evidence/revision contract and teacher comparison. |
| 3. Generation can invalidate work | `classroomWrites.ts` now atomically guards replacement and student writes; `dialogue.test.ts` defines progress-first and replacement-first regressions. Historical-source validation still only checks returned cards. | Retain and verify atomic guards; extend them for new learning state. Fix source omission and metadata preservation. |
| 4. Returning/fresh sessions lose or mix work | Saved student credentials now restore student role. Polls check classroom identity and sequence. Successful submission preserves newer typing. Fresh creation still resets only part of the UI; callbacks outside polling lack equivalent guards; claim drafts are not durable. | Complete session lifecycle, draft recovery, and invitation fallback. Verify existing fixes rather than reimplementing them. |
| 5. Scene payoff is inconsistent | Alexandria still takes `hint: boolean`, fixes the hint at the harbor, and shares activity groups across zones. Its archive footprint remains blocked. `GeneratedWorldScene` accepts neither hint nor unlock state. | Place hints in both renderers, isolate Alexandria activity, and provide an accessible archive activity across render modes. |

The importer now provides reviewed excerpts and symbolic literature/general lessons. Do not regress this capability or claim native Odyssey/Austen worlds exist. Deliver the reasoning loop in Alexandria first, then exercise the same contracts on one imported literature lesson before declaring integration complete. Extend the illustrated setting view as well as both 3D renderers.

## 2. Decisions to establish before UI work

Keep these contracts small and additive in `lib/world.ts`, with focused validation helpers rather than a broad rewrite.

| Contract | Proposed implementation |
| --- | --- |
| Selected learner | HTTP director and WebSocket `start` require `studentId`. A shared server helper authenticates the teacher and queries that ID within the classroom. It returns stored learner state and revision. Never fall back to preview or trust an attached student object. |
| Intervention context | Preserve `{patch, baseVersion}` and add context metadata containing selected learner ID/name and the student revision used. Persist it with the applied hint. Display “Based on [name]; shared with the class.” A selection change must not relabel a pending result. If the learner has since changed, identify that older basis and offer regeneration; existing classroom-version checks still reject stale application. |
| Source identity | Give each citable material an immutable server-derived version covering its exact text, locator, and provenance. Keep it separate from classroom `version`, which also changes when a hint or scenario changes. A hint must not invalidate a citation. |
| Passage selection | Store evidence ID, source version, exact range and quote, and the student's explanation of relevance. Use one documented range convention, such as JavaScript UTF-16 offsets. Server resolves canonical text and verifies the range; client text alone is never proof. Bound counts and lengths. |
| Prediction and turns | Add an optional persisted prediction; give new turns stable IDs and explicit selected citations. Revisions include `revisesTurnId` and a short reflection. Capture scenario, classroom version, targeted feedback, and active hint identity with the turn. |
| Compatibility | Decode older JSON with missing fields as legacy work. Do not fabricate predictions, selected quotations, or revision history. Allow a new explicitly linked revision from a legacy answer once citations are supplied. Preserve previous turns and unlocks. |
| Persistence | Start with additive fields in existing JSON state; no new SQL table is presently necessary. Extend the atomic meaningful-progress predicate to include predictions and any separately saved annotations/reflections. Use current student revision/world guards for every new write. |

Important source distinction: the Alexandria Strabo card is a **paraphrase**, while `EvidenceReader.tsx` renders a separate verified quotation hardcoded in the client. Move that quotation into authoritative source data before allowing passage selection. Explicitly distinguish primary excerpt, reading note, scenario assumption, and invented teaching prop. Imported PDF excerpts remain teacher-reviewed model extraction; a hash proves consistency with the saved excerpt, not fidelity to the original PDF.

## 3. Implementation sequence

### Work package 0 — Establish a stable implementation baseline

**Files:** current diff, shared contracts, existing checks and smoke scripts.

- Record the exact starting commit and outstanding edits; integrate or isolate ongoing image work before editing overlapping files.
- Run the existing deterministic suite and TypeScript check once to establish failures attributable to the starting state. Do not mistake historical build-log results for this baseline.
- Freeze the contracts above, including legacy JSON decoding, request limits, and the distinction between source version and classroom version.

**Done when:** the implementation baseline is reproducible, existing failures are recorded, and both director transports and learning writes have agreed request/response shapes.

### Work package 1 — Correct learner context and preserve reviewed sources · P0

**Files:** `components/worlds/Classroom.tsx`, a focused teacher panel if useful, `app/api/classroom/route.ts`, `app/api/director/route.ts`, new shared director-context helper, `lib/world.ts`, affected smoke scripts/tests.

- Make roster rows keyboard-selectable; keep `selectedStudentId` separate from the teacher-preview identity. Show the selected learner's claim, citations, and feedback beside intervention controls in Live classroom.
- Resolve the learner from storage in both director paths before any upstream model connection/request. Reject absent, malformed, foreign, or unauthorized selection. Keep preview explicitly selectable.
- Capture request identity and learner context at generation start. Preview and applied hint retain that context while polling or roster selection changes.
- Keep actual native steering events distinct from standard-request completion. Preserve preview/apply and stale/duplicate-patch behavior.
- Replace the one-way historical-card check with a required-source-set validator: every reviewed source must remain present, retain its ID, kind, title, text, source/provenance, and zone, and no unreviewed source may appear. Hypothetical cards may change within schema bounds.
- Keep prepared Alexandria authoring tied to its reviewed template. Imported lessons continue launching fresh classrooms from canonical reviewed passages; do not silently run Alexandria regeneration over an imported lesson.

**Acceptance:** two learners have different claims. Selecting B produces model input from B's persisted work in both transports. Tampered client content is ignored or rejected; invalid membership produces zero upstream calls. Changing selection during generation does not mislabel its result. Removing Strabo, reclassifying it, or changing its metadata fails before persistence. Source-preserving hypothetical edits can succeed.

### Work package 2 — Make evidence and revision inspectable · P0

**Files:** `lib/world.ts`, new learning/source validation helpers, `lib/classroomWrites.ts`, `app/api/classroom/route.ts`, `lib/lessonBuilder.ts`, `components/worlds/EvidenceReader.tsx`, student and teacher panels, `app/globals.css`.

- Add a compact prediction prompt in the journal. Save the initial prediction before the first assessed argument without blocking optional movement or reading. For a returning learner who already submitted work, label the absent prediction rather than requesting a retroactive “initial” answer.
- Add passage selection and a relevance note to the reader. Provide a keyboard-operable selection method, such as sentence choices, alongside optional text highlighting. Keep journal collection distinct from “use in this argument.”
- Show removable citation chips and their selected passages beside the draft. Send only those selections to assessment; validate ownership, source version, ranges, and canonical quote before model work.
- Persist immutable submitted turns with their citations, feedback, context, and IDs. Use an idempotency/request ID so a retry after a lost response does not create another attempt; reject reuse with changed content.
- Provide “Revise this explanation” linked to a prior turn, with the prior answer and targeted feedback available while editing. Require a reflection on what changed and why.
- Compare normalized answer text: an unchanged resubmission is another attempt, never a completed revision. A changed answer plus reflection is a **revision submitted**, not automatically an improvement. Show the text and evidence for teacher judgment; a character difference alone cannot establish learning.
- Add a teacher comparison showing prediction, initial answer, selected revised answer, source links, feedback, and reflection. Keep it inside the selected learner's Live classroom view.
- Label feedback provisional. For new evaluations, require all four rubric dimensions, including limitation/alternative reading, for the archive milestone. Preserve historical results rather than retroactively relocking students. Keep revision status separate from milestone status.
- Apply subject-specific assessment language: history uses conditional causal reasoning; literature uses textual analysis and alternative interpretations. Do not require agreement with the teacher's hypothesis.

**Acceptance:** a reviewer can trace each credited evidence reference to the saved selected passage and its provenance. Collected-but-unselected evidence cannot earn evidence credit. Fabricated or stale passage selections reject before assessment. Reload retains prediction and both answers. Repeated wording does not complete revision. A supported alternative interpretation can meet all rubric dimensions. New prediction/annotation writes prevent concurrent replacement atomically.

### Work package 3 — Complete session recovery · P0 before pilot

**Files:** `components/worlds/Classroom.tsx`, a small session/draft hook, `CharacterDialogue.tsx` where draft handling is shared, lesson-launch callback, relevant UI tests.

- Use one successful-session transition for initial creation, invitation join, fresh classroom, and imported-lesson launch. Set a session generation identifier synchronously; close old sockets and invalidate in-flight callbacks.
- Guard every async completion, error, notice, busy-state update, and hint result against that session identifier, not just polling. Include learner identity so sessions in one classroom cannot mix. Abort obsolete fetches where possible.
- Reset classroom-specific claim/citations/reflection, source/intervention fields, scenario, focus, reader, character/journal panels, learner selection, patch, and steering state only after new credentials are successfully obtained. Failed creation retains the current session.
- Store local unsent drafts under classroom + student + source identity. Restore them without overwriting newer edits or writing an initial empty state over saved content. Save claim, citations, prediction/reflection drafts, and any exposed dialogue draft. Label local recovery as device-local.
- Clear only the exact draft revision successfully submitted. Preserve newer typing and failed/offline submissions. Handle unavailable local storage visibly without making the rest of the classroom unusable.
- Retain the existing returning-student role fix; validate saved credentials before use. Display a selectable invitation link if clipboard writing fails.

**Acceptance:** reload returns a joined student to their work; disconnect/reconnect preserves drafts; failed fresh creation preserves the original classroom. Complete a second-class launch while delaying an old poll, argument result, and steering result: none can overwrite or label the new session. New text typed during submission survives success. Clipboard denial still leaves a usable invitation.

### Work package 4 — Deliver the visible challenge and archive payoff · P1, required for the signature demo

**Files:** `WorldScene.tsx`, `GeneratedWorldScene.tsx`, scene helpers, `Classroom.tsx`, a compact archive activity component, relevant scene tests/styles.

- Replace the boolean hint with `{id, zone}` or the bounded intervention projection. Anchor markers using each renderer's own zone coordinates. Update/clear them without recreating the world or resetting walking. Show the same readable challenge and place action in illustrated mode and the non-WebGL path.
- Partition Alexandria ships/crates/stall goods/scholars by zone; keep library scholars near the library. Pure activity mapping should affect only the assigned zone and restore the baseline.
- Use an immediately accessible archive activity for this release. Keep the interior deferred, but change “the archive is open” to a precise action such as “Archive reflection available,” with a clear entry point outside the blocked footprint and in the journal.
- The activity offers a reviewed contrasting passage and a short comparison/reflection. Where a pack has no suitable additional passage, use an explicitly labeled alternative-reading exercise over existing material; never invent a historical source or imply it is new evidence. Persist the response with the learner's work.
- List all source cards associated with a place when there is more than one instead of always opening the first. Keep place buttons and source reading usable without movement.
- Respect reduced motion in both renderers, including the generated scene's rotating markers. Verify zero-size resize handling and cleanup. Measure performance before considering asset additions.

**Acceptance:** every zone places/moves/clears the hint correctly across both scenes; illustrated and WebGL-failure modes expose the same challenge. Activity values 0 and 1 affect only intended groups. Unlock exposes a useful activity without requiring passage through a blocked building. Its reflection persists after reload.

## 4. Verification and release gates

Verification is a work package, not implied by completing the code. Run focused checks with each change, then the integrated suite, TypeScript, and one production build against the final source. Add tests for invariants and failure modes, not markup snapshots that mirror implementation.

| Gate | Required evidence |
| --- | --- |
| Deterministic correctness | Both director authorization paths with upstream-call spies; reviewed-source omission/mutation; selected quote/range/version validation; idempotent submission; unchanged revision; legacy state; and both orders of author/collect, author/argue, author/predict, and author/annotation races. Exercise request handlers as well as shared SQL. |
| Transport/recovery | Lost submission response and retry, stale/duplicate hint, closed steering connection, cross-session completions, out-of-order polls, unavailable storage/clipboard, and actual request/frame size limits. The HTTP Content-Length check alone is insufficient. |
| Bounded model evaluation | Twelve predeclared cases: supported agreement, disagreement, alternative explanation, weak reasoning, missing citation, keyword stuffing, fabricated quote, unavailable source, prompt injection, uncertainty, partial reasoning, irrelevant prose. Include history and literature, plus incorrect interpretation of a real selected passage. Separate deterministic rejection from cases that reach the model. Record actual outputs, response IDs, duration, expected rubric behavior, and failures. |
| Real learning loop | One teacher and two separate student sessions: B submits an overconfident explanation; teacher selects B, generates and natively steers a challenge, previews/applies; B cites material, revises, reflects; teacher compares both versions; all sessions reload with work retained. Repeat the core flow on one imported literature lesson. |
| Usability and rendering | Exercise join → source → citation → submit → next action with an unfamiliar user. Check keyboard/focus return, 200% text zoom, 1280×720 and narrow/mobile layout, reduced motion, and unavailable WebGL. Measure loading and walking on named hardware/browser for both renderers. This is scheduled verification, not performed in this planning pass. |
| Final independent review | Freeze the exact tested commit and matching build. A reviewer who did not implement the fixes reports exercised gates, observed defects, untested assumptions, and separate verdicts for recording, supervised pilot, and broader release. Fix blockers and recheck them. |

Record results in `BUILD-LOG.md`; refresh stale readiness/README claims only from actual evidence. The small rubric sample can reveal failures, but cannot establish grading reliability, educational gains, or a reliable p95. Do not weaken expected results to make evaluation pass.

Use the existing Sites project and hosting configuration for any later authorized publication. A classroom invitation does not bypass private hosting access; verify authorized teacher/student/reviewer access before scheduling an external pilot. Publishing and recording are subsequent deliverables, not actions performed by this planning request.

## 5. Dependencies, checkpoints, and effort

Use one integration owner initially: the shared `Classroom.tsx`, contracts, and classroom route make premature parallel editing expensive. If implementation is later delegated, establish exclusive file ownership after extracting panel boundaries; do not reuse the earlier plan's ownership table unchanged because the importer adds shared surfaces.

| Checkpoint | Dependency | Planning estimate for one implementer |
| --- | --- | --- |
| 0. Baseline and contracts | Existing edits reconciled | 2–3 hours |
| 1. Learner context + source integrity | 0 | 4–6 hours |
| 2. Evidence, prediction, revision, comparison | 1 and frozen source identity | 10–16 hours |
| 3. Recovery and session isolation | 0; finalize after 2's draft fields | 4–6 hours |
| 4. Hint placement + archive activity | 1's hint contract; 2's reflection storage | 4–7 hours |
| 5. Integrated verification + review fixes | 1–4 | 6–10 hours |

Estimated implementation and verification effort: **30–48 hours**, roughly 4–6 full workdays, excluding participant scheduling, external access delays, recording, and unforeseen model failures. Re-estimate after checkpoint 0; the earlier 3–5-hour sprint estimate did not include the complete learning loop or imported-scene parity.

Each checkpoint should leave matching UI/API contracts and a reviewable diff. Keep baseline, focused verification, and final review evidence attached to the corresponding changes. Do not commit or publish unrelated in-progress image work as part of these checkpoints.

If time is constrained, defer imported asset packs, physical archive interiors, new lesson catalogs, voice, cinematic camera work, analytics, exports, and private per-learner hints. Retain selected-learner correctness, source integrity, explicit revision, session recovery, and honest validation. The truthful demonstration ends with **a learner's visible change in reasoning**, supported by passages and reflection; the archive is a milestone alongside that artifact.
