# Public pilot

Share `/try` for an isolated student trial, or `/studio` for the full hackathon demo with teacher and student preview. Both open without a teacher code or sign-in. Each new studio classroom receives its own teacher and invitation tokens; student trials never receive those tokens. Existing classroom tokens remain valid.

Paid text AI requires `PILOT_AI_REQUEST_LIMIT` (production: 30). The D1 counter `ai:pilot-v1` is a lifetime allowance for this pilot, not a daily reset. Each classroom has six requests shared by its students and teacher. A WebSocket correction consumes an additional reservation. Reservations are atomic and are not refunded after failures. Missing or malformed limits disable AI; values are capped at 100. These are request limits, not dollar limits. New image generation is disabled at the server, including automatic character portraits.

Trial/teacher classroom creation is capped at 150 for the pilot and eight per connection per UTC day. Invitations allow 40 joins per classroom; builder requests are also limited. D1 quotas persist across redeploys. The legacy teacher-login endpoint is not required by the hackathon entry flow.

Use fictional names and sample material for this early evaluation. This release does not provide account recovery, school rostering, or a deletion/retention workflow. Students should return using the same browser/profile. No new paid hosting service was provisioned; API text requests use the existing configured API account.

Validation: `node --import tsx --test tests/*.test.ts`, `npx tsc --noEmit`, production build, and `scripts/smoke-pilot.mjs`. Run the smoke script against a local test server with `APP_URL=http://localhost:5173`; no teacher code is needed. `PILOT_TEST_AI_DISABLED=1` additionally checks an AI-disabled server with a dummy API key. It creates two test classrooms and two invited students, saves sample evidence, and does not print credentials. The default run makes no paid AI calls.
