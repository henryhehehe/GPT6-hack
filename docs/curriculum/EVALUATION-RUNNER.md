# Run a bounded curriculum feedback review

The runner turns the 12 [formative fixtures](FORMATIVE-EXAMPLES.json) into a repeatable local evaluation. It checks packet identity, creates one evaluation classroom per selected lesson and a separate synthetic student for every case, submits the real classroom assessment request, and saves JSON plus an HTML review sheet after each response. It never submits the expected feedback to the model.

A captured response is not a passing interpretation. Review the learner answer, supplied passages, actual feedback, and expected feedback focus together. Record a separate human judgment. These synthetic cases cannot establish learning gains, grading reliability, or classroom readiness.

## Commands

Run from the repository root. Preflight is the default and makes no HTTP or model calls:

```sh
node --import tsx scripts/evaluate-curriculum.ts
```

Run the current suite against the local app after the prerequisites below are met:

```sh
node --import tsx scripts/evaluate-curriculum.ts --live
```

Select a bounded case, change the local port, or choose an output parent directory:

```sh
node --import tsx scripts/evaluate-curriculum.ts --live --case austen-letter-01-supported --base http://localhost:5173 --out artifacts/private/curriculum-evaluations
```

Repeat `--case` to select several cases. Unknown and duplicate IDs are rejected. Only a local HTTP origin is accepted; redirects are rejected. The runner does not deploy or test a hosted classroom.

Reports go in a new UUID directory beneath the output parent, defaulting to ignored `artifacts/private/curriculum-evaluations/`. Files have owner-only permissions and are updated atomically. Credentials stay in memory and are redacted from saved errors. Synthetic classroom records remain in local development storage; there is no automatic deletion or resumption. A later run creates new students and classrooms.

## Required integration and configuration

- The running app and local source must contain the reviewed selected-citation learning flow, including `lib/learning.ts`. The runner loads that module's `materials` and `sourceVersion` helpers instead of duplicating the application's provenance hash. It saves a synthetic initial prediction, collects the fixture's cards, and selects each complete bounded card with its canonical text, UTF-16 offsets, source version, and a neutral relevance note. False quotations remain only in the authored learner answer, not in the selected source citation.
- The API must support `predict` and the idempotent argument schema and return the saved turn with its request ID and selected citations. An incompatible response stops further assessment calls. The report stores submitted prediction/citations and response IDs for review.
- Provide `CURRICULUM_EVAL_TEACHER_CODE` through the process environment, or both `CURRICULUM_EVAL_CLASS_ID` and `CURRICULUM_EVAL_TEACHER_TOKEN` for an existing local evaluation parent classroom. Do not put credentials into command-line arguments or source files. The runner does not read browser sessions or automatically load environment files. Existing parent classrooms are not edited; new lesson classrooms are launched only after exact packet comparison.
- The local server must have teacher access, storage migrations, its model connection, and an authorized AI allowance configured. The runner respects the app's access and usage controls; it does not enable AI, increase quotas, change credentials, or bypass a paused pilot. The full suite attempts at most 12 assessments, four per lesson; smaller case selections reduce the work.

## Results and failure behavior

Preflight rejects unknown cases, wrong packet versions, unavailable evidence, and unexpected quote matches. Before live assessment, the server packet must match the local reviewed world and every synthetic student must be new. The report includes fixture/world hashes and local code fingerprints; these are local provenance records, not independent proof of a deployed build.

The runner checks response structure, four distinct rubric keys, credited wording against the learner answer, evidence IDs against the case's available cards, and score arithmetic. Suspicious credit on intentionally fabricated quotations or out-of-range questions receives a review flag. It does not automatically judge semantic correctness or prescribe a fixed score for supported disagreement.

A timeout or connection loss stops the run without retrying a potentially saved or charged submission. Reports preserve earlier captured responses and the interrupted request ID. Access/configuration blocks remain distinct from captured model behavior. Exit code 0 means preflight completed or responses were captured structurally; it does not mean semantic approval. Exit 1 means an invalid assessment result was recorded; exit 2 means a block, interruption, or startup/report-writing failure.

## September 10, 2026 implementation validation

Eight runner tests cover offline preflight, missing integration/access, all 12 isolated cases with a fake HTTP app, source mismatch rejection, no automatic retry after connection loss, legacy-contract rejection, invalid credit, credential redaction, and escaped report output. These tests use stub feedback and are not live model evaluation. The combined shared checkout passed all 95 tests and TypeScript.

The real CLI preflight prepared all 12 cases. A live invocation stopped before any HTTP or model call because the selected-citation module was not yet present in shared main; its integration was in progress in the separate reviewed release. The local environment presence check also found no configured pilot teacher code or AI allowance. Zero actual model responses were captured in this pass.

Next: after the reviewed contract is integrated and the local pilot is configured, run a single case, inspect the report, then run the remaining predeclared cases and record human judgments. Do not reinterpret the blocked run or stub responses as model performance.

## Integrated live follow-up

The review integration subsequently ran all twelve cases against its actual built application using fresh synthetic learners and the documented local Node egress harness. All twelve responses were captured with the selected-citation contract intact. The exact output and implementation-agent observations are in [the integrated results report](../CURRICULUM-EVALUATION-RESULTS.md). This supersedes the integration-unavailable block for that isolated build; human review remains pending and production pilot configuration was not evaluated by this run.
