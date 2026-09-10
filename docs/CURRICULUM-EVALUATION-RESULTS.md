# Captured curriculum feedback evaluation

September 10, 2026. All 12 predeclared synthetic cases produced structurally valid responses through the actual built application. This report covers the integrated runtime at `d2e13b2`; the runner was added at `d99cfe8`. One supported Austen case ran first, followed by the other eleven cases, without retries. Canonical packets were checked before each launch; each case used a fresh synthetic learner, saved prediction, explicit citations, and returned submission identity.

The local Miniflare harness used ephemeral D1/R2 and the documented test-only Node relay to the real configured Astra API. This tests application behavior using alternate local transport. It does not test production access, public-pilot quotas, browser recovery, or classroom learning outcomes.

| Fixture | Model score | Evidence credit | Request time |
| --- | --- | --- | --- |
| alexandria-01-supported | 4/4 | Yes | 8.2 s |
| alexandria-01-uncertain | 3/4 | Yes | 7.1 s |
| alexandria-01-fabricated-quotation | 0/4 | No | 7.2 s |
| alexandria-01-out-of-range | 0/4 | No | 6.5 s |
| odyssey-ix-01-supported | 4/4 | Yes | 6.8 s |
| odyssey-ix-01-uncertain | 4/4 | Yes | 8.4 s |
| odyssey-ix-01-fabricated-quotation | 1/4 | No | 7.5 s |
| odyssey-ix-01-out-of-range | 0/4 | No | 6.6 s |
| austen-letter-01-supported | 4/4 | Yes | 8.5 s |
| austen-letter-01-uncertain | 4/4 | Yes | 7.3 s |
| austen-letter-01-fabricated-quotation | 0/4 | No | 9.2 s |
| austen-letter-01-out-of-range | 0/4 | No | 8.7 s |

## Agent observations

- All three supported readings received provisional credit for all four criteria, including qualified disagreement.
- All three fabricated-quotation examples were identified as absent from the supplied source and received no evidence credit. The Odyssey example received one claim point for a clear interpretation, while the two other fabricated examples received zero overall. This difference reinforces why the criterion-level reasons need teacher review.
- All three out-of-range questions received zero points and feedback returning to the assigned material, without supplying later plot events or a historical destruction date.
- Uncertain readings were treated as defensible. The Alexandria answer was asked to develop its missing conditional mechanism; the Odyssey and Austen answers received credit for explaining the narrator/source or witness/corroboration distinction.
- The generated questions invite further thought, though they do not always match the fixture's suggested next question word for word. Expectations were qualitative and did not prescribe an exact score.

These observations were made by the implementation agent after inspecting the captured feedback and selected passages. They are not a fresh independent reviewer verdict. Every record retains `humanReview: pending`. The sample contains only one response per fixture and cannot establish repeatability, semantic grading reliability, or learning gains. No acceptance threshold was changed after seeing the results.

[Readable review sheet](../artifacts/review/curriculum-evaluation.html) · [Exact requests, responses, source hashes, and response IDs](../artifacts/review/curriculum-evaluation.json). No credentials or actual learner records are included.
