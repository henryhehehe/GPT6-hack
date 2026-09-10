# Production candidate — September 10, 2026

Status: prepared locally for a later explicit deployment request. This preparation has not published or changed production configuration. Use `codex/prod-candidate` in the main repository, not its active development checkout. The tested runtime checkpoint is `66ccee20d28465f6f43217ff37d3d9123ed86ae8`; the following documentation commit records this report without changing runtime code.

## Existing destination and baseline

Reuse Sites project `appgprj_6aa2c66a354081918be28825f8b1ee36` at https://counterfactual-worlds-henry.handeche49.chatgpt.site. Railway is not needed for this checkpoint.

While preparation ran, the scene task independently published the user-authorized harbor-only v15 release. Its owner reported terminal success:

- Source: `b6a1d940225f66d0c44a59b467624f1702af95c2`.
- Version: `appgprj_6aa2c66a354081918be28825f8b1ee36~appgver_88f46c8278548191b77bb7aaabeebad5`.
- Deployment: `appgdep_6aa305604bf88191994f173fdd3f0eb5`.
- Environment revision: 2; public audience unchanged.

That exact live source is an ancestor of this candidate. The four harbor additions and existing 30-model detail pack are included. Recheck the live source before a future publish; merge any subsequent changes instead of overwriting them.

## Included and deliberately frozen

The completed development snapshot adds museum collections, the coin-to-source trial, museum attachments, model catalog/header updates, themed architecture/environment work, saved-world improvements, offline writing downloads, report filters, and stability fixes. It is reconciled with the deployed learner contract: predictions, exact selected passages and relevance notes, source versions, linked revisions, archive reflections, idempotent argument retries, and scene hints at their chosen location.

Teacher interventions load the selected learner from the database and retain prediction, quotation, revision and feedback context. Names stay out of model input; private teacher previews retain the selected learner identity. Dialogue recovery from `96ec33a` and the strengthened offline regression from `21512b3` are included.

The public trial remains learner-only. Teacher tools remain gated at `/studio`; existing access credentials and quotas are preserved. A parallel development flow that gave every trial teacher privileges was not promoted. The reviewed learning editor remains the active argument editor; newer simple-argument draft helpers are not a replacement for its citation/revision contract.

Development continued after the snapshot. Later museum field notes, scenario/review stores, argument-draft-store cleanup, additional external placements, and subsequent scene edits are separate work. Their presence in the shared working directory does not mean they are part of this candidate. Inspect the candidate itself when describing the release.

## Validation

- Final unit suite: 176 passed, zero failed.
- TypeScript: passed.
- Official Sites production build: passed.
- Final built Worker review regression: passed; six deterministic local responses, zero model/network calls. Covers saved prediction/citations/revisions in teaching context, HTTP/WebSocket authorization, forged context rejection, hint idempotency, argument retries, linked revisions/reflections, learner isolation, and preserving reviewed sources.
- Final built Worker quota regression: passed. Invalid invitations, invalid requests, progress-locked generation, and forbidden reauthoring preserve capacity; real attempts remain capped.
- Alexandria detail check: all 30 models passed geometry/layout/collision/budget checks.
- Local HTTP smoke: public pages, private teacher gate, trial isolation, invite joins, cross-student denial, evidence persistence, AI-paused fallback, builder extraction/ownership/review gates, dialogue boundaries, prediction retention, quotation validation, and all ten curriculum cases passed.
- Saved-world HTTP smoke: listing/access, concurrent reuse retries, fresh classroom identity, source retention, empty new progress, original progress preservation, and launch retry passed.
- Focused browser check: museum dialog/photo, source reader, exact quotation selection, saved prediction, and reload restoration of evidence/draft/citations passed. This is focused QA, not a comprehensive accessibility or device audit.

Local checks used a disposable D1/R2 store, a dummy API key and no paid calls. Login throttling across consecutive smoke scripts was handled with distinct synthetic visitors only on the isolated loopback curriculum test. Production counters were not reset or raised.

Known limitations: repository-wide lint remains at 15 errors and 27 warnings, primarily existing effect/state patterns plus a vendored `this` alias; no rules were disabled. The build reports a large client chunk. Valid live native steering and real grading quality were not retested here. Those are not represented as passing by the offline fixture tests.

## Deploy this candidate later

Follow `docs/DEPLOYMENT.md` using the current installed Sites skills. After the user says to deploy:

1. Confirm publication ownership and current live source. Work from the preserved `codex/prod-candidate` branch or the isolated candidate, keeping other tasks' working trees intact.
2. Read the local manifest under `artifacts/releases/prod-candidate-2026-09-10.json` in the main workspace. Verify its exact source SHA, archive checksum and clean source state. If source/runtime output changes, rebuild and repeat affected checks.
3. Preserve public access, private teacher entry, the existing secret API key, model, lifetime `PILOT_AI_REQUEST_LIMIT=30`, six requests per classroom, and disabled new image generation. Do not rename/reset quota counters. Preserve all four migrations; no new schema migration is introduced by this candidate.
4. Push the exact source to the existing Sites source repository using a fresh credential if needed. Save the unchanged archive for that exact SHA, then deploy that saved version with the public deployment operation.
5. Await terminal success, verify anonymous `/try` and `/api/health`, and return the actual shareable URL. Keep saved learner data intact. Use the documented rollback procedure if needed.

The prepared archive is local, not an uploaded or deployed version. Live hosting and model use can incur their existing charges; this preparation provisioned no paid service and made no paid model request.
