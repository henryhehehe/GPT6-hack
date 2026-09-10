# Curriculum agent state

## Mission and ownership

This task independently creates, verifies, and maintains a list of source-grounded history and literature worlds and lessons for Counterfactual Worlds. The user explicitly requested a long-running solo agent using the docs folder. Work in `docs/WORLDS-AND-LESSONS.md` and `docs/curriculum/`; preserve concurrent product and demo work. Use this mission for this task’s continuation, not as a replacement for repository-wide instructions.

Current cadence: hourly continuation, attached to this task. The scheduler confirmed automation `develop-worlds-and-lessons` as ACTIVE on September 10, 2026. Continue the content track until the user stops or redirects it. Advance existing drafts before expanding the list indefinitely. Do not create additional agents for this solo task.

## Deliverables and completion criteria

- Human-readable catalog: `../WORLDS-AND-LESSONS.md`.
- Structured planning data: `catalog.json`. This is not accepted by the runtime lesson schema.
- First three world teaching briefs: `PRIORITY-LESSON-BRIEFS.md`.
- Prepared excerpt packets and provenance: `sources/` and the pinned `lib/curriculum/packets.json` runtime snapshot; teacher review remains required.

A world proposal needs a coherent setting, subject, reading boundary, edition/source, at least three substantive lessons, provenance limits, and status. A lesson needs an inquiry, evidence activity, teacher challenge, revision artifact, and subject-appropriate assessment. A source-verified lesson additionally needs exact saved passages and locators checked against the declared edition. Teacher review and runtime verification are later distinct gates; never award those statuses from a source-page check.

## September 10, 2026 — first pass

Read the nine existing docs, including the current untracked implementation plan, and inspected `lib/world.ts` and `lib/lessonBuilder.ts` for actual contract limits. Baseline HEAD: `0928decadd9b1d64c9e1dd85cd3c8ccda8842ef4`. The working tree already contained substantial product/image changes; this pass adds curriculum documents only.

Created 10 worlds and 30 lesson drafts, plus detailed briefs for Alexandria, Odyssey IX, and Austen Chapters 35–36. The first three priorities come from the project docs; seven later worlds are new authored proposals. Provisional audience: ages 14–18. Forty-five-minute durations are planning estimates.

Opened primary-source hosting pages for all ten worlds. Opened the complete Butler Odyssey and Austen text pages and located their assigned section headings. Exact passages, saved source versions, character offsets, complete range fidelity, and redistribution notices have not yet been audited. The source pages’ automatically generated summaries are not primary evidence. No quotation packet has been represented as ready.

Corrected a mistaken candidate Gutenberg ID for The Tempest to verified #1540. Selected the explicitly identified 1831 Frankenstein edition #42324 rather than leaving #84’s edition ambiguous. Rights and excerpt verification remain pending for packaging.

Alexandria’s baseline exists; the three expanded lessons do not imply three implemented packs. Latest importer capability supersedes older Alexandria-only review snapshots. Native Odyssey/Austen settings, exact selected citation validation, before/after persistence, and classroom readiness must be established separately against the current app.

No product tests, paid model calls, deployment, or classroom trials were run for this documentation task. Catalog consistency checks passed: JSON parses; 10 world IDs and 30 lesson IDs are unique; every lesson has its required teaching fields and matching Markdown entry; local document links resolve; all proposed lessons remain labeled draft. These checks do not verify source semantics or runtime behavior.

## September 10, 2026 — implementation pass

The user subsequently requested implementation. The local app now offers all 10 worlds and 30 lessons through a searchable World Library, with teacher source review and idempotent fresh-classroom launch. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for files, source methods, exact scope, and remaining product gates. Runtime snapshots live in `lib/curriculum/`; routine hourly curriculum edits must not silently change these snapshots.

Prepared 71 exact excerpts from 60 saved source selections for the 27 literary/document lessons. Alexandria keeps its original labeled packet. Source hashes, UTF-16 offsets, and bounded in-reader context are included; source snapshots and manifest are in `sources/`. All 30 definitions passed deterministic construction checks. Four representative worlds passed local HTTP review/launch/isolation checks. Teacher review, live semantic evaluation, and classroom readiness are distinct outstanding gates.

## September 10, 2026 — historical accuracy review

A separate documentation review checked historical framing, source attribution, and the prepared packets against their teaching tasks. See [HISTORICAL-ACCURACY-REVIEW.md](HISTORICAL-ACCURACY-REVIEW.md) for cited findings. Planning catalog and human-readable lessons now agree on corrected ranges and the Chapter 36 Austen task; priority briefs distinguish supplied evidence from proposed extensions. Review context and literature specification now date their older Alexandria-only claims.

New findings: Mouseion/Library distinctions need explicit framing; the Tempest speaker attribution depends on the chosen edition; Douglass's report of Auld's legal assertion needs Maryland context; the Sentiments education grievance needs its universal wording tested. One Dickens card remains clipped mid-sentence. Several original activity descriptions required passages absent from their particular lesson packet. Source byte agreement is insufficient to settle these issues.

This pass changes documentation only. Existing source text files, manifest, runtime snapshots, and application code were preserved. It does not claim a new classroom trial, teacher approval, deployment, or live grading evaluation, and does not change any automation.

## Earlier next-work list (completed in the follow-up below)

1. Apply the exact packet/metadata corrections listed in the historical accuracy review to a deliberately versioned runtime update: Dickens sentence boundary; Tempest edition note; Austen activity; Frankenstein, Declaration, and Douglass ranges. Preserve original source wording and saved provenance.
2. Add teacher-visible historical context for Alexandria, Douglass, and Seneca Falls. Keep corroborating-source extensions separate from current student evidence, and do not assess students on sources they cannot access.
3. Reconcile Alexandria's paraphrase and separate reader quotation before exact-quote assessment; do not conflate the Mouseion, book collections, and illustrated building.
4. Prepare contrasting formative examples using only each lesson's available passages, including supported disagreement, uncertainty, fabricated quotations, and out-of-range questions. Do not claim model performance without running the evaluation.

## Original queue (historical; packet preparation is now complete)

1. **Odyssey IX exact packet:** fetch the selected source through an authorized route; save the necessary text and provenance; verify framing, escape, crew objection, and naming passages; create stable IDs, explicit offset convention, exact locators, and content hashes. Preserve source notices. Limit each candidate app card to 700 characters without corrupting quotation or context. Keep the complete approved reading context separate. Update only the verification status actually achieved.
2. **Austen 35–36 exact packet:** repeat the method for encounter, letter claims/support, and narration of reconsideration. Check the supplied packet contains no Chapter 37 or later text. Record which earlier contextual passages, if any, need teacher approval.
3. **Alexandria provenance reconciliation:** inspect the existing paraphrase and client excerpt against Geography 17.1.8; document a proposed canonical packet without altering another agent’s product code. Retain the funding assumption and ledger labels.
4. **Concrete formative examples:** add supported contrasting interpretations, shallow-but-plausible answers, fabricated quotes, and out-of-range requests for the first three lessons. Record expected feedback, not claimed live model performance. Preserve multiple defensible interpretations.
5. **Second wave:** verify Macbeth and Frankenstein ranges and source editions, then Christmas Carol and The Tempest. Advance documentary history packs with additional corroborating-source candidates where their inquiries require them. Do not use advocacy allegations or autobiographical statements as automatically corroborated fact.
6. **Maintain:** compare relevant docs and runtime contracts for changes; correct stale readiness and compatibility notes. Add new worlds only when they introduce a distinct inquiry and existing priorities have progressed. Keep a dated, concise change log and an explicit next action.

## Continuation procedure

At each run, inspect this state, the catalog, relevant docs changes, and the working-tree status. Choose one bounded item from the queue that materially improves the deliverable. Read-only source research and curriculum edits are in scope. Respect the current teacher-reviewed launch boundary; do not publish drafts, create student sessions, deploy, overwrite product changes, or claim source/teacher/runtime verification that did not occur. No need to modify product code to maintain this catalog.

Check structured JSON parsing, unique world/lesson IDs, source references, required teaching fields, and consistency with Markdown. Verify new source locators against the actual chosen source, rather than tests that merely restate the authored data. Record exactly what changed and the next item. Stay quiet if nothing actionable changed; notify only for a meaningful content improvement, completed verification milestone, failure, or required user action. An inaccessible source should prompt alternative source research or advancement of another queued packet, with the limitation recorded.

## September 10, 2026 — runtime review continuation

Applied the reviewed packet/range/activity corrections, added visible editorial and teacher notes, and authored 12 formative review examples. The historical-review task concurrently supplied canonical Strabo and linked notes in packet version 2026-09-10.3; preserved that work. The combined checkout passed 62 tests, TypeScript, production build, and local API checks for six representative lessons. See [REVIEW-VALIDATION.md](REVIEW-VALIDATION.md) for exact scope and limitations. No deployment or live model grading was performed.

The four items in the earlier Current next work list have now advanced: packet corrections, teaching context, canonical Strabo, and formative examples exist locally. Next priority is a separately recorded semantic evaluation of the examples; do not label the static fixtures as evaluated model performance. Preserve existing saved classrooms and the teacher review gate.


## Current next work after accuracy integration

Packet `2026-09-10.3` includes the canonical Strabo passage, all reviewed activity/range corrections, editorial notes, and separately linked historical context. The historical-accuracy follow-up verified 70 automated tests, TypeScript, and ten local HTTP lesson flows; the [review record](HISTORICAL-ACCURACY-REVIEW.md) gives the scope. Existing source selections and classrooms remain preserved.

Next: conduct a separately recorded semantic evaluation using the authored formative examples, then teacher review and an applicable classroom pilot. Optional additional corroborating documents and lineated verse require their own reviewed source selections before assessment. Do not repeat the completed packet repairs or label static examples as evaluated model performance.

## September 10, 2026 — evaluation runner implementation

Implemented the local, bounded runner in `scripts/evaluate-curriculum.ts`, with eight tests, offline preflight, isolated synthetic students, exact packet matching, canonical selected passages, incremental JSON/HTML reports, and explicit human-review status. Full shared checks: 95 tests and TypeScript passed. See [EVALUATION-RUNNER.md](EVALUATION-RUNNER.md). The real live invocation stopped before requests because shared main does not yet contain the reviewed `lib/learning.ts` integration. No actual model responses were generated; local teacher/AI configuration is also pending.

## Current next work

1. After the selected-citation release is integrated and the local server has authorized teacher/AI configuration, run one formative case and inspect its actual output before completing the remaining cases. Do not bypass pilot limits or present the current blocked/stub runs as model evaluation.
2. Record human judgments of source use, interpretation, uncertainty, and revision guidance. Preserve failed cases and unexpected feedback; do not change expectations merely to make results pass.
3. The historical review continuation has added 20 predeclared [historical feedback cases](HISTORICAL-FEEDBACK-CASES.md), selectable with `--suite historical`. After the first three lessons have an actual evaluation record, use these to assess reported law, universal claims, Declaration chronology, edition-dependent speakers, and modern-note misattribution. Their offline checks pass; the one-case live attempt still stopped at the missing selected-citation integration. Keep teacher approval and classroom trials as distinct gates.

## September 10, 2026 — themed world implementation

The user prioritized realistic, usable worlds. Added ten authored setting profiles, period-inspired scenery and furniture, fictional reading companions, and a public self-guided `/worlds` route for all thirty lessons. Readers can explore and open sources without teacher access or live AI; classroom teaching remains a separate reviewed flow. See [THEMED-WORLDS.md](THEMED-WORLDS.md). All 122 shared tests, TypeScript, and production build passed, with local HTTP 200. Visual/browser/device and classroom-trial checks remain outstanding. Preserve the release branch’s newer hint and learning contracts during renderer integration. Next: inspect the themed routes on target classroom devices and refine text-specific scenery from observed usability issues; keep source evidence distinct from interpretive art.

## September 10, 2026 — varied architecture and model lighting

The user requested distinct themes and reuse of the existing detailed models. Added per-work layouts and architectural composition, integrated the existing paneled doorway/window GLBs and themed furniture, and reused the harbor sky/environment/water techniques with separate lighting profiles. All reading stops and arrivals remain connected in the new collision layouts. Targeted scene tests (29) and TypeScript passed. See [THEMED-WORLDS.md](THEMED-WORLDS.md) for scope, asset reuse and verification limits. Source packets are unchanged. Next visual work is browser/device review of the new settings; do not claim photorealism or classroom validation from automated geometry checks.
