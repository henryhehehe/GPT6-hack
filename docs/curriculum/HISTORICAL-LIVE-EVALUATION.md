# Historical feedback: first live evaluation

Completed September 10, 2026 after the user approved a bounded 20-case run. This record supersedes the earlier missing-integration and approval blocks for this historical suite.

## Outcome

All 20 unique historical cases produced structurally valid responses through the integrated classroom API. One edition-disagreement case ran first; the remaining 19 ran sequentially without repeating it. There were **20 assessment calls, no model retries, no model errors, and no automatic review flags**. Local connection failures before server recovery did not reach model assessment.

Assistant review of the captured feedback found the intended source safeguards in all four lessons: invented quotations and modern-note misattributions received no evidence credit; out-of-range questions did not elicit invented missing material; supported uncertainty and the Tempest edition difference were accepted. This is a small synthetic sample, not proof of general reliability, learning gains, or teacher/classroom approval. Human review fields in the original reports remain pending.

**Scoring caveat:** `tempest-03-history-invented-consent` received 1/4 for stating a clear claim even though its quotation was fabricated. The feedback explicitly rejected the quotation, awarded no evidence/mechanism/limitation points, and did not unlock progression. The other three invented-quotation cases received 0/4. The authored cases do not prescribe exact scores, so this is a teacher scoring-policy question rather than evidence that the false quotation was accepted. No scoring-rule change or extra model call was made to erase the discrepancy.

## Configuration and scope

- Model configured on the local review server: `gpt-6-astra`; reasoning effort: low.
- Endpoint: the existing local review classroom API; new isolated evaluation classrooms and synthetic students. No real learner submissions were used.
- Suite: `historical`, packet `2026-09-10.3`; fixture, source-world, and code fingerprints are preserved in each raw report.
- Request ceiling used by the existing server: 7,000 output tokens and 65-second timeout per assessment. No quotas or access settings were raised. Token usage and billed cost are not present in the saved API reports, so no dollar-cost claim is made.
- Observed model latency: 5.3–10.1 seconds; median 7.1 seconds.
- No source, rubric, prompt, expectation, or application code was changed during this evaluation. No deployment was performed.

## Review by case

Judgments below are assistant content review of actual captured responses. They are separate from the runner’s structural validation and from later human approval.

| Case | Score | Assistant review |
| --- | ---: | --- |
| `douglass-literacy-01-history-coercion` | 4/4 | Connects interruption to power and keeps the statute claim unproven. |
| `douglass-literacy-01-history-reported-law` | 4/4 | Accepts the testimony chain and does not require outside legal knowledge. |
| `douglass-literacy-01-history-invented-statute` | 0/4 | Identifies the absent quotation and distinguishes reported speech from a statute. |
| `douglass-literacy-01-history-escape-date` | 0/4 | Declines to invent an escape date or itinerary from the pathway metaphor. |
| `douglass-literacy-01-history-note-as-quotation` | 0/4 | Correctly identifies modern reading guidance, not Douglass’s words. |
| `seneca-falls-02-history-qualified-grievance` | 4/4 | Uses the Oberlin exception to qualify universality without dismissing exclusion. |
| `seneca-falls-02-history-universal-needs-checking` | 4/4 | Accepts the source limit without requiring the learner to name Oberlin. |
| `seneca-falls-02-history-invented-enactment` | 0/4 | Distinguishes the actual grievance from invented enacted admissions law. |
| `seneca-falls-02-history-national-admissions-list` | 0/4 | Does not invent a national census; proposes relevant additional records. |
| `seneca-falls-02-history-oberlin-in-original` | 0/4 | Separates the Oberlin reading note from the declaration’s universal wording. |
| `declaration-01-history-principle-and-action` | 4/4 | Connects principles to announced separation without claiming military victory. |
| `declaration-01-history-dates-in-context` | 4/4 | Treats the chronology as a separate note and the excerpt as a political declaration. |
| `declaration-01-history-invented-signing-record` | 0/4 | Rejects the invented all-signers quotation and separates adoption from signing. |
| `declaration-01-history-later-outcomes` | 0/4 | Does not supply later battles or treaty terms absent from the packet. |
| `declaration-01-history-note-in-original` | 0/4 | Corrects the signing-note attribution and returns to the document’s justification. |
| `tempest-03-history-competing-accounts` | 4/4 | Compares actual words and preserves the selected edition’s speaker label. |
| `tempest-03-history-edition-disagreement` | 3/4 | Accepts the Folger/Gutenberg difference and asks for closer textual analysis. |
| `tempest-03-history-invented-consent` | 1/4 | Rejects the invented consent quotation; awards one claim point despite unsupported content. Teacher scoring-policy review recommended. |
| `tempest-03-history-ending-as-proof` | 0/4 | Keeps Act 5 outside the assigned Act 1 Scene 2 packet. |
| `tempest-03-history-editorial-in-dialogue` | 0/4 | Rejects editorial guidance as dramatic speech and offers two supported readings. |

## Saved records

Full JSON responses and HTML worksheets are stored privately in both the main and review checkouts under `artifacts/private/curriculum-evaluations/`. These files include the actual submitted selected passages, feedback, response IDs, and fingerprints; credentials are excluded.

- Run `23b0241e-1797-41cf-a561-ac0ccedbb7fd`: 1 captured response(s), report SHA-256 `c936ed5388e1c3ebf5a5f1f8ca87a4e5fbe7b9e62c969ebee9fdceb90702747f`.
- Run `898c6e6f-d973-4757-a89d-e19c3703e2cb`: 19 captured response(s), report SHA-256 `8f9898965e590c084d419dc8a97bc0cc6ff774b20aaed72778d3527bbed17697`.

Next: a teacher should review the feedback and decide whether a clearly stated but unsupported claim should earn a claim point. Further model runs need a new bounded purpose; do not keep rerunning this sample to obtain preferred scores.


## Claim-credit clarification after the live run

The subsequent continuation clarified claim credit in both the working app and the integrated review checkout. A clear position is insufficient when its conclusion depends on invented quotations, fabricated facts, or words falsely attributed to the original source. The model is instructed to explain that premise and invite revision. This does not make claim credit depend automatically on evidence credit: a conditional hypothesis, supported disagreement, or warranted uncertainty may still earn a claim point.

The student checklist and assessment prompt share the same policy module, `lib/claimAssessment.ts`; future evaluation reports also fingerprint that module. The evaluator now flags claim credit in intentionally fabricated-quotation or context-misattribution cases for review. This is a review flag, not a deterministic assertion that every such response must receive zero in every dimension.

An offline reanalysis of all 20 saved responses flagged exactly `tempest-03-history-invented-consent`. Its original 1/4 score and the full live reports remain unchanged. The captured response is retained as a regression fixture; tests also verify that legitimate uncertainty and edition-aware disagreement do not receive this flag. Private reanalysis output is in `artifacts/private/historical-claim-review/reanalysis.json` in both checkouts.

No new model calls were made. The prompt correction has not yet had a live semantic retest, so this change establishes clearer instructions and detection of the recorded inconsistency, not proof that future model grading will always follow the policy. Teacher review remains appropriate.

Validation: all 102 tests in the integrated review checkout passed, as did its TypeScript check and production build. TypeScript also passed in the shared main checkout. The existing large-bundle warning remains.
