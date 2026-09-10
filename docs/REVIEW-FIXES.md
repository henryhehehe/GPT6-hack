# Independent review fixes

Implemented September 10, 2026 in the isolated `codex/review-fixes` worktree, starting from `0928dec`. The original checkout's ongoing setting-image and UI edits were not copied or modified. Integrate those overlapping changes deliberately before merging this branch.

## Implemented

- **Selected learner:** selectable roster; stored learner lookup shared by HTTP and native WebSocket steering; no client-supplied learner context; captured learner name/ID/revision on hints; visible classroom-wide audience and notice when the learner has since worked.
- **Observable reasoning:** saved initial prediction; keyboard-operable passage choices; exact quote/range validation against canonical material; SHA-256 source identity including provenance; relevance notes; deliberately selected citations; linked revisions and reflections; teacher before/after view with source links. Unchanged wording, punctuation, case, or whitespace does not complete revision. Earlier work remains readable without invented prediction/citation history.
- **Source integrity:** every reviewed historical card must remain present with its metadata unchanged; new historical sources cannot be invented by world generation. The Strabo primary excerpt and its explanatory paraphrase now come from shared authoritative material definitions. Imported lessons retain their canonical source path.
- **Persistence and recovery:** existing atomic world/progress guards now include predictions and archive reflections; submissions carry retry IDs and reject changed reuse; successful replies retain newer draft edits; local drafts are isolated by classroom, learner, and source identity. Session replacement resets classroom UI and invalidates old polling/hint/operation callbacks. Invitations remain copyable when the clipboard is unavailable. Non-JSON service failures show a retry message while preserving the draft.
- **World behavior:** zone-specific hint anchors in both renderers; Alexandria harbor crates, market goods, and library scholars follow their own activity values; scholars stay near the library. Multi-source places open the journal instead of silently choosing the first source. Generated markers respect reduced motion and zero-size resize is guarded.
- **Archive payoff:** an accessible, persisted alternative-explanation reflection is available from the argument panel and journal. The UI explicitly says the physical interior is not part of the lesson. New milestone evaluations require all four rubric dimensions; historical unlocks remain intact. Feedback and revision submission are not presented as proof of learning gains.

Shared additions: `lib/learning.ts`, `lib/directorContext.ts`, `lib/requestBody.ts`, `lib/draftStore.ts`. New UI sections: `LearningWork.tsx`, `LearnerWork.tsx`, and `useLearningDraft.ts`. No database migration or new dependency is needed.

## Validation performed

| Check | Result |
| --- | --- |
| Deterministic tests | 50 passed: the existing 33 plus 17 regression cases covering citation/provenance validation, revisions, idempotency, new atomic progress races, director lookup, actual body limits, zone mapping, and draft recovery. |
| TypeScript | `npx tsc --noEmit` passed. |
| Production build | Passed. The existing large-client-chunk warning remains; no measured performance claim is made. |
| Targeted lint | New learning/context/request/draft modules, new learning UI sections/hook, both changed API routes, and regression tests pass. Existing `Classroom.tsx` effect/link lint failures remain; comparison against the starting revision found the same categories there. |
| Local HTTP and WebSocket smoke | Passed with two separately joined learners: student isolation, persisted distinct predictions, missing/foreign/unauthorized selection rejection, forged quotation rejection, generation blocked by progress, and request-size rejection. |
| Source-intake smoke | Passed canonical text extraction, draft reload, teacher ownership, foreign-source rejection, and premature-launch rejection against the isolated local runtime. |
| Live Astra integration | Attempted twice using the existing local runtime configuration. Each reached the first valid assessment request, then the local worker returned HTTP 503 with “Your worker restarted mid-request.” No live assessment, successful selected-learner hint, native correction, or semantic grading result is counted as verified. |

The normal `npm test` launcher could not create its sandbox IPC socket; the same suite passed through `node --import tsx --test tests/*.test.ts`. Local HTTP tests required the normal sandbox network exception. Only the worktree's local D1 database was migrated/exercised.

## Repeatable checks

```sh
node --import tsx --test tests/*.test.ts
npx tsc --noEmit
npm run build
APP_URL=http://127.0.0.1:5193 node --import tsx scripts/smoke-learning.mjs
APP_URL=http://127.0.0.1:5193 node scripts/smoke-builder.mjs
```

`scripts/smoke-learning.mjs --live` additionally exercises a real assessment, identical retry, hint based on B despite forged client context, class application, linked revision, unchanged resubmission, retained citations, and archive reflection when earned. It never replaces failed model output with a fixture. Existing smoke scripts now use the selected-learner and structured-submission contracts.

`node --import tsx scripts/evaluate-rubric.mjs` lists twelve predeclared history cases without model calls. Add `--live` to record actual rubric outputs, response IDs, durations, failures, and how many cases were exercised in `artifacts/review/rubric-evaluation.json`. This diagnostic was prepared but not run to completion because of the local runtime failure. It does not yet include a live imported-literature rubric run; use the imported-lesson acceptance flow for that gate.

## Acceptance gates at the first checkpoint

Live model verification, the imported-literature learning loop, browser accessibility/device/performance checks, and a final independent reviewer on the integrated commit/build remain outstanding. These are explicit unverified gates, not implementation passes. No browser playtest, publication, classroom pilot, or video recording occurred in this worktree pass. The original diagnostic review remains unchanged; this report does not issue readiness sign-off.


## Follow-up integration and live validation

Integrated committed main `7a9bf7e` in merge commit `b6ff754`, retaining portrait/image support, teaching-help tabs, reader errors and publication links, accessible dialogs, and focus behavior. The merged suite has **54 passing tests**, and TypeScript and the production build pass. Commit `5150634` also guards delayed lesson launch against a newer session and raises only complete-lesson output allowance from 7,000 to 12,000 tokens after a confirmed truncation.

A direct Node request to Astra succeeded (HTTP 200, 1.8 seconds), isolating the earlier HTTP 503 to local workerd egress. `scripts/local-model-check.mjs` runs the **actual built Worker** with ephemeral D1/R2 and a test-only Miniflare outbound service that relays requests through Node fetch/WebSocket. The destination remains the real OpenAI API, with actual responses; no production endpoint or model output was substituted. The existing ignored `.dev.vars` supplies credentials; the script does not print them. Start it after building, then run the smoke scripts against its printed local URL. This verifies application behavior under an alternate local transport, not production deployment or workerd's normal outbound TLS.

Passed through this test transport:

- Existing classroom smoke: creation, persistence, collection, learner isolation, teacher-only changes, and inventory retention.
- Full real-model learning flow: selected learner B despite forged client context, class-wide hint application, identical retry, linked revision, unchanged resubmission, and retained citations. Response IDs: `resp_045a9e72aef098f8006aa2f1a7f1bc87d2a55f261ba4006a22`, `resp_0c598815d3bdadf0006aa2f1adec8487d2aab70465e1a47dab`, `resp_0dec7ffacf141c21006aa2f1b2591c87d2aef25b620a14ba2e`, `resp_01efd0e1d552fdb9006aa2f1b8a36087d2aaaec064591fb4a2`.
- Native WebSocket steering: correction accepted and incorporated; response `resp_043b58914b8227c6006aa2f1c5d6f487d2b94eec187f1424c5`, 13.4 seconds.
- **12/12 rubric expectations passed**: ten real assessments plus two deterministic pre-model rejection cases. Model-case end-to-end times were 4.7–15.4 seconds. Full expected/actual outputs and response IDs are in [the diagnostic report](../artifacts/review/rubric-evaluation.json). This is a small diagnostic sample, not grading reliability or learning efficacy evidence.

The first two generated-literature attempts stopped before assessment because the model exhausted 7,000 output tokens. The second response explicitly reported `incomplete/max_output_tokens`, response `resp_0895327c5714074d006aa2f2c8b52487d2a7f16b089751ff11`. After the bounded allowance fix, `scripts/smoke-literature.mjs` passed the complete generated-literature flow: original test story → canonical source review → fresh launch → prediction → supported alternative reading → selected citations → linked revision → teacher-visible retained history. Actual generation/assessment response IDs: `resp_05a74ccd087107af006aa2f3ad1c0887d29cc9569ad56fb70c`, `resp_04cda754312892bd006aa2f3c83c6087d2b453c271aca43899`, `resp_0305e9e3fd126115006aa2f3cf81ec87d28109a3da4fa09984`. This supersedes the first-checkpoint live-learning limitations above.

The shared main checkout has ongoing scene/catalog/UI changes from other tasks. Its coordinating task has the validated branch commits for a merge at its checkpoint; this task does not stash or overwrite those edits. Browser/device QA, deployment, and the final independent review remain separate gates.

## Expanded-scene integration

Merged committed main `f4b6edb`, including expanded Alexandria `2bdcd7a`, into the isolated review branch. The merge retains reflective water, atmosphere, flicker corrections, city geometry/navigation, model replacement and its fallback visibility, invitation dialog, scene provenance, and accessible lesson tabs. Review behavior remains connected: library activity affects terrace scholars, harbor activity affects ships/cargo, market activity affects merchandise, and hints use the selected zone anchor. The complete combined suite passes **56 tests**; TypeScript and the production build pass. Shared main remains with its coordinating task for final integration of active curriculum/UI work.

## Curriculum and teaching-kit integration

Integrated published world release `6aa043b` with curriculum checkpoint `450771f` in `62fe62e`, then added committed studio/returning-student dependencies through `3582cc1` in `d2e13b2`. This preserves the 10-world / 30-lesson library, authored source context and references, lesson-mode boundaries, review-before-launch, downloadable teaching kit, and class-specific invitation recovery alongside the complete selected-learner and citation/revision contracts.

Integration corrections:

- New Alexandria quotes the complete reviewed Jones excerpt. Legacy saved paraphrase cards retain their separate short verified quotation and existing citation hashes.
- Citation versions now include bounded context, locators, edition notes, reading notes, and reference links. Context/provenance mutations invalidate selections; reviewed source replacement preserves the canonical packet.
- Teaching reports include recorded predictions, exact selected passages and source versions, linked revisions/reflections, and archive reflections. Downloads escape all learner/source text. Punctuation-only changes remain unchanged wording; no report claims measured learning improvement.
- Returning-student recovery uses the class-specific access store and session identity guards. A requested catalog lesson still opens after restoring an existing teacher session. The inactive learning-progress label says “Revise.”

Validation on `d2e13b2`: **89/89 tests**, TypeScript, and the production build pass (existing large-bundle advisory remains). The actual built Worker with ephemeral D1/R2 passed ten prepared-lesson HTTP flows covering source fidelity, teacher review, retry identity, fresh launch, collection, and mode restrictions. The HTTP/WebSocket learner isolation/prediction/quotation/progress checks also passed.

The real-model synthetic learner loop passed again using the documented test-only Node egress transport: selected B despite forged caller context, class hint application, linked revision, unchanged resubmission, replay-safe retry, and retained citations. Actual response IDs: `resp_0de40615cfe0747b006aa2f80d94e487d28639d6aee9988f43`, `resp_010afdf1856247f2006aa2f814417c87d2b686074b17207d96`, `resp_0961ed9be0121e09006aa2f818dd4487d29ebaf5e68f412bf9`, `resp_046cb4b188f80011006aa2f8224eb887d2a9b9ff2a0b9ec49c`. Automatic approval initially rejected external model traffic; after confirming the script creates only synthetic learners in an empty local database and uses literal test claims/public source material, reconsideration approved the same command. No actual student data was used.

The pilot-release task has `d2e13b2` for its isolated integration. Its publication/usage policy and remaining shared-main changes are owned by their respective tasks. This worktree has not deployed or modified shared main. The prior published world release received browser QA from its owner; this subsequent curriculum integration has API/code validation, not a new browser or independent final readiness sign-off.

## Live curriculum fixture follow-up

The integrated runner captured all twelve predeclared curriculum cases through the actual built application's synthetic local evaluation, without retries. The three fabricated-quotation answers received no evidence credit; all three out-of-range questions were redirected to the assigned packet; supported readings and qualified uncertainty received relevant provisional feedback. See [the results and limitations](CURRICULUM-EVALUATION-RESULTS.md) and [the exact captured review sheet](../artifacts/review/curriculum-evaluation.html). These are implementation-agent observations of one response per fixture; independent human review remains pending. The temporary test server has been stopped.
