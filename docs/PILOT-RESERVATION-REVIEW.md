# Reserve capacity only after validating requests

Reviewed the combined release at `2ef8f1e`. Three HTTP paths reserved class capacity before rejecting invalid work:

- Joining reserved a classroom place before checking the invitation and name.
- Authoring reserved an AI request before checking the reviewed-lesson restriction, existing progress, and input lengths.
- Standard teacher interventions reserved an AI request before validating the instruction.

The fix moves those three reservations after the corresponding deterministic checks. Counter keys, ceilings, visitor throttling, failed-upstream reservation behavior, and all source/session controls remain unchanged.

Validation: all 115 tests, TypeScript, and the production build pass. `node scripts/check-pilot-reservation-order.mjs` additionally runs the actual built Worker with an ephemeral D1 database, fake credentials, and an outbound service that intercepts every request locally. It checks invalid invitations/names, invalid author input, progress-locked generation, reviewed-lesson regeneration, and invalid intervention text without capacity loss. A valid join consumes one place. Six valid intervention attempts consume six reservations even when the intercepted upstream fails; the seventh is rejected before reaching the upstream. No actual AI calls or production quotas were used.

The fix is prepared on the isolated `codex/review-pilot-guards` branch for the release owner. This check is scoped to reservation ordering; it does not change publication ownership or issue an independent classroom-readiness verdict.
