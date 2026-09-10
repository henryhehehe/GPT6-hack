# Independent product review

Reviewed September 10, 2026, against runtime code at `ca40864`. Reviewer: an independently delegated agent acting as a skeptical product reviewer, educator, and hackathon judge. Scope: source inspection of the teacher/student UI, evidence reader, renderer/navigation, schemas, both classroom/director APIs, and existing deterministic test definitions; comparison with the review brief, UX research, implementation plan, and asset shortlist. No browser playtest, live model evaluation, build, or classroom observation was performed by this reviewer. References below identify the reviewed revision; line numbers may move after implementation.

## Verdict

**A working, distinctive prototype; not yet ready for an unsupervised classroom pilot.** This is more than a presentation: invitations, persisted student turns, bounded model responses, source reading, movement, and teacher intervention paths exist in code. The student composition has improved beyond a permanent dashboard. However, the principal product promise—help a teacher respond to a particular student's reasoning and show that reasoning change—is incomplete. Additional model fidelity will improve the invitation to explore, but will not resolve that gap.

This is a **present-state diagnostic review**, not final acceptance. The coordinator is documenting the subsequent gates in [Product readiness](PRODUCT-READINESS.md). A fresh independent review of the final commit and running application remains required after fixes. Planned gates do not count as passing results.

## Ranked findings

### 1. P0: the teacher's intervention does not use the learner the teacher is looking at

`components/worlds/Classroom.tsx:23` derives `student` from the credentials' student ID, which is the teacher preview for teacher sessions. The live roster at line 75 has no selection action. Both director calls send that `student` object (lines 43 and 48). `app/api/classroom/route.ts:43` and `app/api/director/route.ts:45` consume caller-provided student content rather than resolving a selected classroom member from storage.

**Consequence:** a real student's claim can be visible in the roster while a hint is generated using the preview learner's context. This undermines the proposed live demonstration and the teacher's trust.

**Fix and acceptance:** select a learner explicitly; send their ID; authenticate and resolve it server-side for both transports. With two students holding distinct claims, selecting B must produce a request grounded in B's stored work. Reject missing/foreign IDs before model work. State “Based on B; shared with the class,” since the applied hint is classroom state, not private tutoring (`app/api/classroom/route.ts:48`).

### 2. P0: learning is represented by attempts and collected IDs, not an inspectable change in reasoning

`lib/world.ts:18–19` stores claims, results, and evidence IDs, but no initial prediction, passage selection, source version, or revision reflection. The evidence reader inserts a plain citation string (`components/worlds/EvidenceReader.tsx:26`). Argument assessment receives all collected evidence (`app/api/classroom/route.ts:56`). “Revise” becomes active after any second turn (`components/worlds/Classroom.tsx:80`), even if the second turn repeats the first. The teacher sees only the latest claim and rubric summary (line 75).

The code's excerpt and evidence-ID checks are useful (`lib/world.ts:54–62`), but they verify structural support, not whether an interpretation is accurate. Existing tests at `tests/world.test.ts:4–10` demonstrate structural constraints; they do not establish grading reliability or learning gains. A three-point argument can unlock without the limitation dimension, despite uncertainty being part of the objective.

**Fix and acceptance:** persist a prediction, explicitly selected source passage, claim, targeted feedback, revision, and a brief explanation of what changed. Show the teacher initial and revised wording with linked evidence. A repeated answer must not become a demonstrated revision merely by being turn two. Treat model feedback as provisional and archive unlock as a milestone. Include supported disagreement and incorrect source interpretation in a bounded live rubric evaluation.

### 3. P0: concurrent world generation can invalidate student progress

Authoring checks only for submitted arguments before a potentially long model call (`app/api/classroom/route.ts:35`). Its final update guards the classroom version, not student progress (line 39). Collection and argument persistence increment the student revision independently (lines 12, 52, 58). The argument's classroom version check at line 57 is a separate read before its student write.

**Consequence:** a student can collect evidence during generation, or finish an argument between the check and replacement, leaving progress associated with an obsolete world. The source-preservation loop also checks only historical cards that the model returned (line 38); omission of the reviewed source is allowed if the other schema constraints still pass.

**Fix and acceptance:** enforce the world/progress relationship atomically at persistence, block regeneration once meaningful progress begins, and require all reviewed source cards unchanged. Deterministic interleavings of author/collect and author/argue must either preserve one consistent version or reject cleanly. Removing the Strabo card must fail before persistence.

### 4. P0 for a pilot: returning students and fresh-classroom recovery are incomplete

The role initializes to `teacher` (`components/worlds/Classroom.tsx:17`). Invitation entry sets `student`, but restoring saved credentials does not (line 24); disabling the teacher tab (line 55) does not change the currently rendered role. A returning student can therefore begin in the teacher layout after reloading. This is a UI state defect; server-side teacher authorization still exists.

`newClass` resets credentials, snapshot, and patch but leaves claim, source, focus, and steering state (line 39). Polling's `active` guard protects error handling, while `refresh` always sets the snapshot (lines 25–26), so a late response can replace a newer classroom view. Drafts live only in component state (line 19): ordinary request failure preserves them, but a reload does not. Clipboard failure gives no visible invitation fallback (line 38).

**Fix and acceptance:** derive the restored role from credentials; guard asynchronous responses by classroom/session identity; reset the full session only after successful creation; save drafts per student/classroom; show a copyable invitation if clipboard access fails. Reload, temporarily disconnect, reconnect, and start a second classroom without losing or mixing work.

### 5. P1: the world promises a stronger interaction payoff than it currently delivers

The hint prop is a boolean (`components/worlds/WorldScene.tsx:9`), and its mesh is always at the harbor (line 74), regardless of `Intervention.zone`. Market activity controls every item in `goods`, while library activity controls citizens distributed across the plaza (lines 93–94). This weakens the causal explanation the scenery should communicate.

The archive doors animate on unlock (line 95), but the whole library footprint remains blocked in `components/worlds/scene/walkGeometry.ts:24`, with no unlock parameter. “The archive is open” (`components/worlds/Classroom.tsx:76`) therefore lacks an enterable-space payoff. Exploration currently opens the first source for a zone (`Classroom.tsx:34`); it is not a dense world of distinct source-bearing objects.

**Fix and acceptance:** anchor the hint to the requested place; isolate each zone's activity; provide a worthwhile archive result, such as an additional contrasting source and reflection, even if an interior is deferred. Keep movement optional: non-canvas place buttons and the WebGL error message already provide a useful fallback (`WorldScene.tsx:19`). Measure actual loading/navigation performance before adding high-cost assets. External models in the shortlist are candidates, not integrated upgrades.

## The strongest useful wow moment

**A teacher changes the help while a student's reasoning changes on screen.** Show an actual learner making a plausible but overconfident claim. The teacher selects that learner and asks Astra for a challenge, then corrects the in-progress request to emphasize an alternative patron. A bounded, clearly hypothetical comparison appears at the relevant location. The student reads the source, revises the claim, and explains the newly recognized uncertainty. The teacher sees the original and revised wording together, with source references.

This combines immersion, teacher judgment, native steering, and a useful assessment artifact. It requires the above fixes; the complete moment is not currently implemented. A bigger lighthouse alone cannot deliver it.

## Three highest-impact improvements

1. **Complete the selected-learner loop.** Correct context, visible audience, intervention location, readable student challenge, teacher before/after view.
2. **Make evidence use observable.** A compact prediction, passage-linked citation, student explanation, and explicit revision reflection. Preserve the distinction between historical text, scenario assumption, and simulation.
3. **Make one lesson resilient.** Returning-student onboarding, preserved drafts, atomic progress/version checks, fresh-classroom reset, invitation fallback, and a usable non-3D path. Finish these before importing multiple asset packs.

## Functional versus planned

| Present in reviewed runtime | Staged, absent, or unverified |
| --- | --- |
| Alexandria template, editable authoring input, three fixed zones | General lesson ingestion; Odyssey/Pride and Prejudice packs. The schema fixes harbor/market/library (`lib/world.ts:3–9`), and authoring retains the Alexandria evidence template. |
| Real server calls, schema validation, native steering transport, stored turns | Reliable selected-learner intervention; semantic assessment evaluation at classroom scale |
| In-app source note, a short fixed Strabo excerpt, citation text, labeled setting image | General source/image ingestion, passage annotation/versioning, source-specific images, learning export |
| Blender assets, exterior walking, on-demand student panels | Enterable archive, imported shortlist assets, measured performance on classroom devices |
| Teacher preview, invitations, rubric feedback | Complete recovery/onboarding and independently verified end-to-end classroom pilot |

## Final readiness acceptance gates

- **Teacher/student:** one teacher and two separately joined learners; select B, steer a hint, apply it, see the correct place and audience, revise B's claim, reload all sessions, and inspect retained evidence and before/after work.
- **Learning:** a reviewer can trace every credited claim to its selected material; unsupported certainty and fabricated quotations receive useful correction; a defensible alternative interpretation can succeed. An unchanged resubmission is not presented as learning improvement.
- **Reliability:** forced request failure preserves draft and session; stale hints reject; concurrent generation/progress stays consistent; reviewed historical sources cannot disappear; an old poll cannot replace a new classroom.
- **Usability:** a person unfamiliar with the app can join, find a source, cite it, submit, and understand the next action without narration. Test keyboard navigation, movement-to-reader focus, narrow viewport, reduced motion, and unavailable WebGL on the running app.
- **Honest demonstration:** record real teacher and student sessions and actual outputs. Show generation cuts transparently. Do not present a prepared fixture as a generated lesson or a model score as measured learning gain. Cut additional worlds, arbitrary asset generation, voice, and cinematic flourishes before cutting the reasoning loop.

The final independent reviewer must name the exact tested commit, report which gates were exercised, separate observed failures from inference, and list remaining limitations. No final readiness sign-off is issued by this document.
