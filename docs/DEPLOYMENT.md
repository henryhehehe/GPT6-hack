# Deploying a development checkpoint

When ready, tell the deployment task: **“Deploy the latest checkpoint.”** You can also name a branch or commit. This document prepares the workflow; it does not authorize publishing every development edit or enable automatic deployments.

## Destination

- Existing Sites project: `appgprj_6aa2c66a354081918be28825f8b1ee36`.
- Site: https://counterfactual-worlds-henry.handeche49.chatgpt.site
- Student trial: https://counterfactual-worlds-henry.handeche49.chatgpt.site/try
- Teacher studio: `/studio`.
- Runtime: vinext on Cloudflare Workers; D1 binding `DB`; R2 binding `BUCKET`.
- Read `.openai/hosting.json` and reuse its project. Do not create a replacement project or provision Railway unless the user requests a hosting change.

Use the installed `sites-building` and `sites-hosting` skills and current native Sites tool schemas. Plugin paths can change during a session: discover the current installed helper location rather than assuming an older version still exists.

## 1. Select and freeze the release

1. Confirm which task currently owns publication. Only that task changes Sites source, versions, deployments, environment values, or audience. A subsequent explicit deployment request can establish the next owner; coordinate with any active release first.
2. Read the user's latest requested checkpoint, repository status, and applicable repository instructions. For “latest,” include the relevant completed development work and its dependencies. Do not silently treat an old commit or an unfinished working tree as the requested release.
3. When several tasks are editing the shared directory, use an isolated release checkout. Keep their active working tree and index intact. Include the selected uncommitted work only when it belongs to the requested checkpoint. Review the exact file list before staging.
4. Inspect the current Sites publication and source branch. Fetch its source history using a fresh source credential if needed. Merge existing published functionality into the release; a non-fast-forward rejection is a reason to reconcile history, not force-push over it.
5. Resolve conflicts in learner state, source citations, scene interactions, and pilot controls explicitly. Do not replace one side wholesale merely to make the merge finish.
6. Keep source unchanged between final validation, commit, push, packaging, and version saving. Later feature work belongs in the next release.

Exclude `.env*`, `.dev.vars*`, private credentials, local database state, recordings, and unrelated downloads from new source commits and deployment archives. Preserve required runtime assets and their license notices. Do not accidentally stage a symlinked `node_modules` directory.

## 2. Preserve cost and access settings

The last deployment verified by this task was **v12**, source `658c8c3602868e97eaca585b9a87662751a9bcaa`, preserved locally as `codex/public-pilot`. This is a historical recovery point, not a claim that it remains the newest live version.

Its public-pilot settings were:

- Public hosting access; anonymous users can open `/try` without ChatGPT sign-in.
- Isolated trial sessions never receive teacher or invitation tokens.
- Private teacher-code gate on studio entry and teacher classroom creation.
- Existing `OPENAI_API_KEY` stored as a Sites secret; existing `OPENAI_MODEL` preserved.
- `PILOT_AI_REQUEST_LIMIT=30`: total lifetime text-request allowance, stored under D1 counter `ai:pilot-v1`.
- Six AI requests per classroom, shared by the teacher and students. A steering correction consumes an additional reservation. Failures are not refunded.
- New image generation disabled, including automatic character portraits. Existing images remain readable.
- Classroom creation and invitation quotas remain enforced.

Before the next release, compare **current live settings, the selected source, and the latest user instructions**. Local hackathon/recording work has also used open teacher creation and different local AI limits. The working copy of `docs/PUBLIC-PILOT.md` and its smoke script may describe that local flow. Do not assume it matches production or silently promote local budget changes. Honor any later explicit user changes to the public access policy.

Use native Sites environment tools to preserve existing secrets. Never copy the whole local `.dev.vars` into production, print keys, embed them in browser code, or reset quota counters during deployment. Do not rename `ai:pilot-v1` as a way to replenish the budget. These caps limit request counts, not dollar charges. Avoid new paid services; live API checks count against the approved allowance.

The private teacher details originally created for v12 are in ignored `artifacts/private/pilot-owner.txt`. Keep that file private and out of source control. Do not assume its code remains current after a later rotation.

## 3. Validate the exact source

Use Node 24, as specified in `.tool-versions`. From the release checkout:

```sh
node --import tsx --test tests/*.test.ts
npx tsc --noEmit
```

Build using the current Sites `scripts/build-site.mjs` helper. The repository's build command is `npm run build`. The app's `start` command is a local Wrangler preview, not a Railway production server.

For database changes, generate and include the SQL migrations and Drizzle metadata. Apply migrations to an isolated local D1 test store, not repeatedly to the developer's active database. Confirm the packaged migration set includes every required table, especially `pilot_usage`.

Run `scripts/smoke-pilot.mjs` against the isolated local server after checking that its assertions match the chosen access policy. Test with AI disabled and a dummy API key wherever possible. Existing smoke scripts create fixture classrooms; some `--live`, steering, authoring, and image scripts incur paid usage. Do not run them blindly.

Acceptance checks:

- `/`, `/try`, and the intended teacher entry route render.
- Trial credentials omit teacher and invitation privileges.
- Teacher creation follows the agreed public access policy.
- Separate learners can join the same room; one cannot read or mutate another's work.
- Evidence, predictions, selected quotations, arguments, and revisions retain their expected behavior; retries do not overwrite newer work.
- Reloading in the same browser restores saved trial progress.
- AI reservations remain atomic and block calls when limits are reached; image paths remain disabled unless explicitly enabled.
- `/api/health` reports readiness, including the required database table.

For changed user flows or scenes, perform focused browser QA of those changes. A successful build alone does not verify a working student flow. Record what was actually checked, including any checks intentionally skipped to avoid API charges.

## 4. Publish

1. Obtain a source repository write credential for the existing project. Use its returned remote and branch, with per-command Git authentication. Never persist the credential in a remote URL, Git config, or a file.
2. Commit and push the exact validated source. After the push exits successfully, run `git rev-parse --verify HEAD`; copy its complete output as `commit_sha`.
3. Run the current Sites `scripts/package-site.mjs PROJECT_DIR ARCHIVE_PATH` helper. Package validated build output, not the source tree. Wait for completion and preserve the resulting archive unchanged.
4. Call native `save_site_version` with the existing project ID, exact pushed SHA, and absolute archive path. Retain the returned version ID.
5. For the existing public site, call `deploy_site_version` with that version ID. Preserve its audience and runtime secrets. Do not use the private-only deployment operation for an already-public site.
6. Poll the returned deployment ID until `succeeded` or `failed`. Report success only for a terminal successful response and use its literal returned URL.

Publishing the requested checkpoint to the already-approved audience does not require a redundant conversational confirmation. Runtime approval checks still apply. Do not change sharing, increase spending limits, or buy services merely to complete deployment.

## 5. Verify and hand over

- Check the actual anonymous visitor path without owner cookies or a hosting bypass credential. A successful owner-authenticated test is not evidence that visitors can open the link.
- In the initial rollout, changing Sites access to `public` after a private deployment still returned HTTP 401 until the saved version was deployed again through `deploy_site_version`. If this recurs, inspect current audience/deployment state and apply the correct public deployment path; do not share a bypass token.
- Confirm readiness and the important API flow. Use synthetic names and sample material. A live AI check is optional when unaffected; if required, keep it within the existing authorized allowance and report that it consumed a request.
- Open the verified trial URL, preserving the existing app tab where possible. Stop only the temporary test servers owned by this release task.
- Record the source SHA, saved version ID/number, deployment ID, environment revision, audience, validation, and any limitations. Preserve a local release branch without changing the developer's active checkout.
- Return the shareable link, what changed, and any material access/cost limitation. Do not claim that pending work in other tasks is already deployed.

## Recovery

For a failed publish, inspect the native failure and fix the concrete cause; do not create duplicate projects. If a version was saved but deployment failed, reuse that saved version once the failure is resolved. If the outcome is uncertain, reconcile deployment/version status before retrying.

For an application regression, redeploy a verified compatible earlier saved version through the appropriate native deployment operation. Application rollback does **not** restore database contents or undo migrations. Check schema compatibility first; do not reset production data or quota counters as part of rollback. Preserve the current audience and environment unless the recovery specifically requires an authorized change.
