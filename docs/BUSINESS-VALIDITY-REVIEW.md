# Business validity review: Counterfactual Worlds

September 10, 2026. Scope: current local application, teacher/student flows, existing readiness reviews, and current competitor product pages. The workspace is being changed by several tasks. This is a code and commercial review, not a classroom observation, customer interview, or claim of product–market fit.

## Hackathon priority

The user clarified that this remains a hackathon: people should be able to try and use it before a complete school rollout. The institutional gates below apply to sales/rollout claims, not guest access to the demo. Keep no-signup exploration, teacher tools, prepared packets, and downloads available; defer school administration and billing. New practice-classroom creators can switch teacher/student roles; invitees still have learner-only access. The builder skips disabled image generation. Practice work is clearly distinguished from joined students and unsent drafts from submitted work.

## Decision

**Continue with a narrow teacher-led product; do not sell it as a school-ready platform yet.** The useful proposition is a source-based history or literature investigation that produces writing a teacher can discuss and assess. The 3D setting can attract attention, but repeat purchases will depend on preparation time, curriculum fit, reliable delivery, and inspectable student reasoning.

Proposed positioning: **“Teach an evidence-based investigation. See how students defend and reconsider their ideas.”** Start with secondary humanities teachers, provisionally ages 14–18, subject to lesson-specific reading and suitability review. This is a segment hypothesis, not validated demand. Do not target every age, subject, and buyer at once.

## Who uses it, who pays, and why

| Segment | Job to be done | Possible reason to pay | Recommendation |
| --- | --- | --- | --- |
| History / English teacher | Teach a specific reading and get a defensible written explanation in one period | Less lesson preparation; useful evidence for discussion and feedback | Primary user and internal champion. Start with an upcoming unit they already teach. |
| Department head / curriculum lead | Help several teachers deliver a consistent inquiry lesson | Reviewed packs, reusable teaching materials, inspectable work, dependable support | First institutional buyer to interview. Sell a bounded department use case before a district rollout. |
| School technology / purchasing team | Evaluate access, data handling, device fit, cost, and support | Operational readiness, agreements, predictable cost | Approval stakeholder; the present prototype does not meet all their needs. |
| Tutor / homeschool parent | Lead a meaningful reading discussion without designing everything | Guided packets and visible writing | Secondary discovery channel; test separately. Printable kits already support adult-led use. |
| Independent learner | Explore a subject and understand sources | Interesting investigations and useful feedback | Do not lead with a consumer subscription before retention is observed. Current setup assumes a teacher or guide. |

## Competitive reality

These are vendor-described capabilities, not independently measured outcomes. Pages checked September 10, 2026.

| Alternative | Current offering | Implication |
| --- | --- | --- |
| Nearpod | Free Silver includes interactive lessons, real-time insights, and post-session reports. Gold is listed at $159/year; school plans add administration and integrations. [Official plans](https://nearpod.com/pricing) | Interactivity, AI creation, and a basic report are not sufficient differentiation. |
| Diffit | Individual subscriptions are listed at $14.99/month or $149.99/year. Its school offering emphasizes preparation, differentiation, and exports. [Individual pricing](https://web.diffit.me/individual-teacher-subscription), [School offering](https://web.diffit.me/pricing) | Preparation savings and compatibility with teachers’ existing materials are meaningful buying criteria to test. |
| iCivics | Offers free games and teaching resources, including lesson plans. [Official educator introduction](https://vision.icivics.org/welcome-to-icivics/) | A history-related game competes with strong free substitutes. Pack quality and a complete teaching sequence matter. |
| Existing worksheet + discussion | Already fits a teacher’s workflow; can use the same sources | Low switching cost, flexible, no new student login | The most useful pilot comparison. The app must earn the added setup and device time. |

Inference: the strongest differentiator is the combination of a bounded source packet, exploration, a teacher challenge, and a visible written response. A defensible advantage would accumulate through reviewed subject-specific lessons, evidence of repeat use, reliable source handling, and teacher trust. “Uses the newest model” is not a durable advantage.

## Findings and changes made in this pass

| Finding | Buyer consequence | Improvement implemented |
| --- | --- | --- |
| Studio prioritized building a world without a complete practical teaching guide | Teacher must invent timing, classroom sequence, support, and fallback | Teaching kit with 30/45/60-minute plans, source-specific challenges, support and extension, source cards, and student worksheet. |
| Live view showed latest answers and counted the teacher preview | Hard to inspect change; classroom numbers could mislead | Joined-learner counts exclude the preview by ID. Learning report shows first/latest writing, context differences, and provisional feedback. Download includes every submitted turn. |
| Another attempt could appear as “Revise” even with repeated wording | Activity could be confused with learning | New comparison distinguishes first submission, same wording, changed wording, and changed context. None is labeled an improvement. Progress styling no longer relies only on turn count. |
| Device or connection failure could consume the lesson | Teacher needs a usable fallback | Self-contained downloadable HTML teaching kit can be opened offline and printed or saved as PDF. Paper responses do not automatically sync. |
| Product language emphasized world creation over the teacher’s work | Novelty may get a demo without earning repeat use | Revised hero and practical educator section describe preparation, reviewable writing, and present evaluation limits. Existing world-library work is preserved. |

The kit uses authored sequencing and existing source material; opening or downloading it does not make an additional AI call. Reports reuse submitted classroom state. Exported HTML escapes learner/source text and contains no remote assets or scripts. Downloads contain names and work, so the interface identifies them as classroom records.

The current report does **not** establish learning gains, validate AI grading, reconstruct historical source versions, capture unsent drafts, or prove that a model-referenced source was deliberately selected by a student. These limitations are visible. Reporting improves reviewability; it does not finish the underlying assessment design.

## What still prevents a credible school sale

1. **Reliable external classroom entry.** Hosting access is separate from invitation tokens. Demonstrate one teacher and multiple students on actual intended devices without developer assistance before recruiting a classroom trial. Changing hosting alone does not supply account recovery, teacher ownership, or school administration.
2. **Classroom validation of targeted guidance.** The follow-up implementation now resolves the chosen learner and classroom authorization from one database snapshot for both HTTP and WebSocket generation. The preview labels whose saved work informed it and its whole-class audience. Offline request-handler tests verify selection, authorization, forged input rejection, frozen context, and private attribution. A teacher/two-student browser session and review of actual generated challenges are still needed before claiming dependable personalized support.
3. **A complete assessment trail.** Persist deliberately selected passages, initial predictions, revision relationships, and reflections. Preserve source identity. Evaluate supported disagreement and incorrect interpretations of real quotations. A comparison of text alone is not a learning measure.
4. **Data ownership and lifecycle.** Account recovery, appropriate role boundaries, retention/deletion controls, a truthful data-flow description, and the school’s required review documents need implementation and review. No blanket legal-compliance claim is made here.
5. **Device and accessibility evidence.** Test the entire task on a school Chromebook or equivalent target, keyboard, enlarged text, constrained network, and unavailable WebGL. Printable fallback helps, but does not prove digital accessibility or replace needed accommodations.
6. **Predictable cost and operations.** Record actual model usage, latency, retries, storage, and support time per completed lesson. Enforce authenticated quotas and spend limits before offering paid or broadly accessible usage. Argument-count limits alone do not establish a safe cost model.

Resolve these before a school subscription commitment. Do not add district analytics, billing, voice, more environments, or premium image polish merely to look enterprise-ready. The existing catalog is sufficient for validating a small number of carefully reviewed lessons.

## Packaging and pricing experiments

These are proposed research offers, not published prices, commitments, or validated willingness to pay. No checkout or payment collection was added.

- **Evaluation:** teacher-only walkthrough of one prepared lesson and its teaching kit; assess preparation and source trust before involving real learners.
- **Teacher hypothesis:** test approximately $120/year for a clearly capped set of investigations. Compare the teacher’s willingness to pay against the alternative of using free tools and existing materials. Define included usage from measured costs first.
- **Department hypothesis:** test approximately $1,500/year for five teachers, a bounded usage allowance, reviewed packs, and onboarding after readiness gates pass. The department pays for instructional use and support, not an unlimited AI promise.
- **Pilot hypothesis:** a $250, four-week department pilot, creditable toward a subscription, only after external access and student-data gates pass. Treat refusal, procurement delays, and requested conditions as evidence, not objections to explain away.

Illustrative unit economics for the department offer: 5 teachers × 2 lessons/month × 25 learners × 9 months = **2,250 student-lessons/year**. At an assumed all-in variable delivery cost of $0.05 per student-lesson plus $150 of annual support, cost is $262.50 and gross margin is 82.5% on $1,500 revenue. At $0.50 plus the same support, margin falls to 15%. These are sensitivity scenarios, **not measured API costs**. They exclude acquisition, development, fixed overhead, taxes, and payment processing, so they are not a profit forecast. Include authoring, images, feedback, dialogue, retries, and hosting in the measured delivery cost.

Model: `(revenue − student-lessons × measured delivery cost − direct support cost) / revenue`. If the measured cost cannot fit the intended price, cap interaction allowances, reuse approved content, or change the offer before selling. Never promise unlimited generation on the basis of this hypothetical model.

## Four-week validation sequence

Targets below are explicit proposed decision rules; no interviews, pilots, payments, or outcomes have been observed in this pass.

| Stage | Work | Evidence and decision rule |
| --- | --- | --- |
| Week 1: problem and buyer | Interview 8 humanities teachers and 2 department heads. Ask about their last source-based lesson, prep time, existing tools, next unit, budget owner, and approval process. Demonstrate only after hearing their workflow. | At least 5 teachers identify a concrete upcoming lesson they would replace or improve; record existing time/cost and the actual decision-maker. Otherwise narrow or change the segment. |
| Week 2: adult-only usability | Observe 5 teachers reviewing one pack, preparing a lesson, opening the worksheet, and inspecting example work. Resolve access and source issues. | At least 4 of 5 complete the workflow without implementation-team intervention. Target median repeat preparation ≤10 minutes after onboarding. Record actual time; do not advertise savings yet. |
| Week 3: gated supervised trial | If classroom-readiness requirements pass, run two reviewed investigations with the same teachers and intended devices. Compare against a source worksheet/discussion using a comparable objective. | Record lesson completion, failed access, minutes lost, teacher effort, actual variable cost, and whether teachers can identify a useful next instructional action from the report. Separate novelty from second-session use. |
| Week 4: retention and purchase | Ask teachers to schedule another lesson; present a concrete bounded offer to the buyer. Have teachers assess de-identified first/revised writing without relying on the AI score. | Seek 3 of 5 teachers voluntarily scheduling repeat use and 2 authorized budget holders accepting a paid pilot or a concrete documented procurement step. Compliments and demo attendance are insufficient. |

Learning review: use a teacher-defined rubric for warranted claims, accurate evidence, reasoning, and limitations. Have an additional reviewer inspect a sample and record disagreement. A small pilot can surface problems and useful signals; it cannot support a broad causal claim of improved learning.

Stop or reconsider the 3D investment if teachers prefer the printable packet, device/setup time displaces reading, or students produce less useful writing than the worksheet discussion. A viable result could be a strong guided inquiry product with optional exploration. Keep the product that earns repeated classroom use.

## Validation of this implementation

The final integrated deterministic suite passed 72 tests, including four new tests covering all 30 catalog lessons at three timings, repeat/context comparison, preview exclusion and complete turn export, and hostile text escaping. The integrated TypeScript check and production build passed. The build retains the existing large-chunk warning; device performance remains unmeasured. A small response-type correction in the concurrently added teacher access screen was needed for the integrated type check. No browser interaction or print-layout QA, real classroom observation, paid-model evaluation, or deployment was performed as part of this business pass. The local preview returned HTTP 200 and a request to open the studio preview was queued in Codex. Concurrent deployment/access work is outside this business pass; its in-progress gates do not count as classroom validation.

## Follow-up: from report to teaching action

The report now groups latest AI feedback by claim, evidence, reasoning, and limitation, with a separate missing-work group. Counts exclude the teacher preview; a learner may appear in multiple criteria. “Prepare teaching help” opens the selected learner’s saved explanation in the teacher controls, without automatically sending a model request. Teachers can also select a learner there.

Both generation paths require a learner ID and resolve membership and work from storage before quota/model use. Browser-supplied learner content is ignored. The model receives the latest three explanations, with their scenario/version and feedback, but no learner name, conversation history, credentials, or transport metadata. The returned teacher-only preview includes frozen learner identity/revision, classroom identity, world version, and whole-class audience. Attribution is outside the shared hint, so applying it does not expose another learner’s explanation or identity through the student classroom response. This does not guarantee a model will never repeat words from the supplied answer; actual generation still needs review.

Selecting another learner clears the old preview. The client rejects mismatched results and ignores results from a different classroom. A closed steering connection stops after the context lookup without consuming quota or opening the upstream connection. These safeguards are bounded; they do not constitute a complete browser session-recovery audit.

Six offline tests exercise the real request handlers/shared resolver with in-memory SQLite and a fake model transport. They cover selected learner B, forged client work, unauthorized/foreign/missing learners, context bounds, changed work during generation, student-visible applied state, and early disconnect. Five teaching-kit tests cover report grouping and the earlier kit/export invariants. No paid AI calls or browser interaction tests were performed in this follow-up.

Validation for the follow-up: the final full deterministic run passed 119/119 tests; TypeScript and the production build passed. The existing large-chunk warning remains. The studio returned HTTP 200. Concurrent scene work briefly introduced an obsolete `setting` reference; the integration fix uses the scene’s current `theme.landscape` value. No model-quality, classroom, visual, or print acceptance claim follows from these checks.
