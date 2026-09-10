# Product readiness and the signature moment

September 10, 2026. User requirement: an immersive, useful learning product with a memorable demonstration. This is an acceptance contract, not a claim that the current build passes.

The [independent present-state review](INDEPENDENT-PRODUCT-REVIEW.md) records code findings against `ca40864`. Its verdict is a distinctive working prototype with substantial classroom-readiness gaps; no final sign-off has been issued.

## The signature moment

A student walks from the harbor into the market carrying an initial explanation. They inspect a source and cite a specific passage. The teacher sees the actual student's reasoning, asks Astra for a targeted challenge, and corrects it while it is being generated. After preview and application, the challenge appears at the relevant location without interrupting exploration. The student revises their argument; teacher and student can see which evidence changed the reasoning.

The visual transformation earns attention. The connection between a real learner's reasoning, a teacher's intervention, and an evidence-based revision supplies the product value. Use authored scene changes to visualize explicit scenario assumptions. Do not present animation or an opened door as proof that a student learned.

## What counts as ready

| Gate | Falsifiable acceptance check | Current standing |
|---|---|---|
| Start a real lesson | A teacher outside the implementation team can start a reviewed lesson, understand its sources, invite two students, and identify their work without developer assistance. | Not independently tested; owner-only hosting limits external access. An appropriate invitation/access design is needed before an external classroom trial. |
| Feel present | A student can walk, inspect, return to the world, and discover the next learning action without permanent dashboard panels or forced camera movement. Close-range materials and scale look consistent. | Walking and immersive shell exist; broad usability and device checks pending. |
| Fulfill the scene's promises | If the UI says an archive opens, the student can enter an authored accessible space or immediately access a meaningful archive activity. Opening doors must not lead to an unexplained invisible barrier. | Current library collision footprint remains blocked after unlocking; resolve the mismatch before using this as the closing payoff. |
| Show reasoning | Each claim has deliberately selected source evidence; feedback identifies a concrete reasoning gap; revision records what changed and why. Supported disagreement is accepted. | Basic claims/feedback exist; structured citation selection and explicit revision comparison remain work. |
| Teacher controls the lesson | With students A and B, selecting B uses B's persisted work for both director transports. The hint preview identifies its class-wide audience and correct scene location. | Known selected-learner and scene-placement fixes remain in the parallel plan. |
| Survive ordinary use | Refresh restores a returning student to the student interface and preserves saved progress; failed requests preserve drafts; a teacher regeneration cannot mix old evidence with a new world; reconnect/error states offer a useful next action. | Persistence exists; saved credentials currently do not restore student role. Role restoration, race fixes, and multi-session failure verification remain. |
| Keep evidence trustworthy | Source text, invented scenario data, simulated dialogue, and illustrative models remain visibly distinct. Source omission, fabricated quotations, and unavailable citations are rejected. | Provenance labels and several validators exist; omission regression and broader evaluation remain. |
| Work beyond the recording | Complete an unscripted teacher/two-student session on the published build, including a defensible unexpected answer and one failed/retried request. Record observed loading and walking performance on the actual target device. | Pending. A successful build or edited video does not pass this gate. |

## Final independent review

Run the final review **after implementation and integration**, against a frozen commit and its matching deployed build. The present-state independent review is diagnostic; it does not substitute for this final pass.

Assign an agent that did not implement the final feature changes. Give it the product brief, intended learning loop, exact commit/deployment, and acceptance checks. Ask it to challenge completion claims, inspect changed code, and exercise the authorized UI. It must distinguish code findings, observed behavior, and untested assumptions; it must not treat earlier passing tests as proof of the current state.

Required output: ranked defects with reproduction steps or file/line evidence; the three most damaging usability issues; evidence/citation failures; the strongest truthful 60-second sequence; and separate verdicts for **recording readiness**, **supervised classroom pilot**, and **broader release**. Missing access is an untested gate, not a pass. Fix blockers, rerun affected checks, and have the reviewer verify those fixes before the readiness verdict. Document known limitations without hiding them behind visual polish.

## Scope discipline

Complete this loop in Alexandria before expanding the lesson catalog. Odyssey and Austen remain distinct reviewed packs requiring their own passages, rubrics, and traversal geometry. Prioritize useful close-up assets and lighting over a large landscape; source models through the open-model shortlist and keep asset credits in the app. A production classroom rollout additionally needs decisions about learner access, data retention/deletion, and teacher oversight; do not claim that hackathon readiness settles those requirements.
