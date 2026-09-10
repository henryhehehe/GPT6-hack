# Public pilot

Share `/try` to start in the student experience, or `/studio` to start with teacher tools. Both open without a teacher code or sign-in. The creator of either practice classroom receives its teacher and invitation access, so they can switch roles and review their own practice work without losing it. Invited students receive learner-only access. Older saved trials remain learner-only; their work is preserved and they can open a separate studio to try teacher tools.

Paid text AI requires `PILOT_AI_REQUEST_LIMIT` (production: 30). The D1 counter `ai:pilot-v1` is a lifetime allowance for this pilot, not a daily reset. Each classroom has six requests shared by its students and teacher. A WebSocket correction consumes an additional reservation. Reservations are atomic and are not refunded after failures. Missing or malformed limits disable AI; values are capped at 100. These are request limits, not dollar limits. New image generation is disabled at the server, including automatic character portraits. The builder skips that step and offers the walkable lesson for review and launch. Existing illustrations remain viewable.

Trial/teacher classroom creation is capped at 150 for the pilot and eight per connection per UTC day. Invitations allow 40 joins per classroom; builder requests are also limited. D1 quotas persist across redeploys. The legacy teacher-login endpoint is not required by the hackathon entry flow.

Use fictional names and sample material for this early evaluation. This release does not provide account recovery, school rostering, or a deletion/retention workflow. Students should return using the same browser/profile. No new paid hosting service was provisioned; API text requests use the existing configured API account.

Validation: `node --import tsx --test tests/*.test.ts`, `npx tsc --noEmit`, production build, and `scripts/smoke-pilot.mjs`. Run the smoke script against a local test server with `APP_URL=http://localhost:5173`; no teacher code is needed. `PILOT_TEST_AI_DISABLED=1` additionally checks an AI-disabled server with a dummy API key. It creates two test classrooms and two invited students, saves sample evidence, and does not print credentials. The default run makes no paid AI calls.

## Hackathon scope

School procurement, billing, rostering, and institutional readiness gates are future work; they are not prerequisites to trying this demo. Guest creation and existing classroom ownership checks stay available together. Practice work is optionally included in teacher reports but never inflates joined-learner counts.

**Download my writing** saves the current draft, saved evidence cards, and previous submissions as a standalone HTML document that can be opened offline and printed. It does not submit the draft or make an AI request. AI outages or exhausted allowance therefore leave a useful reading/writing activity, without pretending a saved draft has been assessed or delivered to a teacher.
