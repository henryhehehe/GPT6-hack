# Public pilot

Share `/try` for an isolated student trial. `/studio` accepts a private teacher access code and supports invitations. Teacher codes are checked server-side; the session cookie is HttpOnly, SameSite=Strict, and Secure on HTTPS. Student trials never receive teacher or invitation tokens. Existing classroom tokens remain valid.

Paid text AI requires `PILOT_AI_REQUEST_LIMIT` (production: 30). The D1 counter `ai:pilot-v1` is a lifetime allowance for this pilot, not a daily reset. Each classroom has six requests shared by its students and teacher. A WebSocket correction consumes an additional reservation. Reservations are atomic and are not refunded after failures. Missing or malformed limits disable AI; values are capped at 100. These are request limits, not dollar limits. New image generation is disabled at the server, including automatic character portraits.

Trial/teacher classroom creation is capped at 150 for the pilot and eight per connection per UTC day. Invitations allow 40 joins per classroom; builder requests and teacher-code attempts are also limited. D1 quotas persist across redeploys. `PILOT_TEACHER_CODE` is a Sites secret; rotate it to invalidate teacher session cookies. It does not revoke existing classroom tokens.

Use fictional names and sample material for this early evaluation. This release does not provide account recovery, school rostering, or a deletion/retention workflow. Students should return using the same browser/profile. No new paid hosting service was provisioned; API text requests use the existing configured API account.

Validation: `node --import tsx --test tests/*.test.ts`, `npx tsc --noEmit`, production build, and `scripts/smoke-pilot.mjs`. Run the smoke script against an isolated D1 store with `PILOT_TEACHER_CODE=local-pilot-test`; `PILOT_TEST_AI_DISABLED=1` additionally checks an AI-disabled server with a dummy API key. It creates test classrooms and does not print credentials.
