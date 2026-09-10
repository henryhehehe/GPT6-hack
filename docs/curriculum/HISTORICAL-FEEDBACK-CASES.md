# Historical feedback review cases

Authored September 10, 2026 against packet `2026-09-10.3` and the context-note fingerprint recorded in [HISTORICAL-FEEDBACK-CASES.json](HISTORICAL-FEEDBACK-CASES.json). These 20 synthetic learner answers extend the 12 [formative examples](FORMATIVE-EXAMPLES.md). **No live tutor responses or semantic scores are recorded here.**

The cases cover Douglass Chapter VI, the Declaration of Sentiments education grievance, the Declaration of Independence, and the edition-dependent speaker in The Tempest. Each lesson has supported reasoning, warranted uncertainty, an invented quotation, an out-of-range question, and a modern note falsely attributed to the original source. Some learner answers deliberately contain historical errors; read them with their feedback expectations.

The historical basis and institutional references are documented in [HISTORICAL-ACCURACY-REVIEW.md](HISTORICAL-ACCURACY-REVIEW.md). This extension introduces no new historical source or assigned reading. The Seneca Falls note now explicitly names the Declaration of Sentiments because the comparison lesson also contains the 1776 Declaration.

## How to review

Use only the listed lesson's current cards, their bounded source context, and the separately labeled reading/editorial notes. The JSON identifies quoted phrases in primary text separately from assertions in modern context notes. Context can explain a limitation without becoming an original-source quotation or a new evidence ID. The linked reference pages may extend beyond the assigned reading; a learner need not supply facts from an unread page.

For each actual response, record whether it accurately attributes words and speakers, distinguishes claims from corroborated facts, respects the reading range, and offers a useful revision question. Record the response, lesson/source fingerprint, model and run configuration, reviewer judgment, and rationale. An acceptable response need not use the same wording or award a predetermined score. Uncertainty and supported disagreement are not themselves errors; also check whether the learner supplied enough reasoning for each earned rubric point.

Do not send `expectedFeedback` or this review guidance as part of the learner's answer. Do not count the intentionally false quotations as failures of source preparation. The offline test checks whether those phrases are absent from the actual packet and whether legitimate phrases and note assertions are present; it does not establish whether a tutor recognizes the distinction.

## Running the offline checks

```sh
node --import tsx --test tests/historicalSources.test.ts tests/curriculum.test.ts tests/curriculumEvaluation.test.ts
node --import tsx scripts/evaluate-curriculum.ts --suite historical
```

The checks validate packet version, the separate context-note hash, evidence availability, original quotations, absent fabricated quotations, and note/source separation. They make no HTTP requests or model calls. If a packet or context note changes, review the expectations before updating the fingerprint.

The shared evaluator selects these cases with `--suite historical`; its default remains the 12-case formative suite. Use `--case` with one of the IDs below to select a smaller run. It saves a private JSON report and an HTML worksheet with the suite, fixture/source fingerprints, actual responses if any, and pending human judgments. Evidence credit for an answer that falsely attributes a modern note to the original source is flagged for review, not automatically declared a semantic failure.

Add `--live` only for an actual evaluation against the local app with the integrated selected-citation contract and configured access/AI allowance. The same isolation, packet matching, credential redaction, quota controls, and no-retry behavior apply to both suites.

**Recorded local check:** the 20-case historical preflight prepared successfully with zero responses captured. A one-case live invocation for the Tempest edition disagreement stopped before any classroom or model request because `lib/learning.ts`, which supplies the selected-citation helpers, was unavailable. This establishes the stop condition, not tutor behavior. Integration and a permitted live run remain the next steps.

## Cases

### douglass-literacy-01-history-coercion

**Lesson:** `douglass-literacy-01` · **Case:** supported

**Assigned cards:** `23-99-0`, `23-99-1450`

> Auld’s interruption makes literacy a question of power: he stops instruction, and Douglass describes the restriction as revealing a pathway toward freedom. The report shows coercion; it does not itself establish a Maryland statute.

**Expected feedback:** Recognize the explanation connecting control of instruction and Douglass's narrated insight. Attribute the prohibition to Auld as reported by Douglass. Do not convert the phrase unlawful into a verified statute or treat the absence of a specific statute as absence of coercion.

**Live response / reviewer judgment:** not recorded.

### douglass-literacy-01-history-reported-law

**Lesson:** `douglass-literacy-01` · **Case:** uncertain

**Assigned cards:** `23-99-0`

> The phrase “it was unlawful, as well as unsafe” occurs in Douglass’s report of what Auld told his wife. I would need a legal source to establish whether that was Maryland law.

**Expected feedback:** Recognize warranted uncertainty and accurate reported-speech attribution. The learner need not independently know Maryland legal history. If mentioning the supplied reading note, identify it as separate context and invite an explanation of how the interruption controls learning.

**Live response / reviewer judgment:** not recorded.

### douglass-literacy-01-history-invented-statute

**Lesson:** `douglass-literacy-01` · **Case:** fabricated-quotation

**Assigned cards:** `23-99-0`

> Douglass quotes a Maryland statute saying “Every enslaved reader shall be imprisoned,” so his chapter supplies the exact law.

**Expected feedback:** Identify the absent quotation and the misrepresentation of a narrative as a statutory text. Ask for actual wording and its speaker. Do not affirm the invented statute or dismiss the entire Narrative as unreliable.

**Live response / reviewer judgment:** not recorded.

### douglass-literacy-01-history-escape-date

**Lesson:** `douglass-literacy-01` · **Case:** out-of-range

**Assigned cards:** `23-99-1450`

> What exact day did Douglass escape, and which route did he take? This chapter should settle both.

**Expected feedback:** Explain that this Chapter VI packet does not establish the escape date or route. The pathway metaphor and resolve to learn do not record immediate escape. Return to the supplied account without filling the gap with outside biography.

**Live response / reviewer judgment:** not recorded.

### douglass-literacy-01-history-note-as-quotation

**Lesson:** `douglass-literacy-01` · **Case:** context-misattribution

**Assigned cards:** `23-99-0`

> Douglass writes “Distinguish household coercion from law.” That direct quotation is my proof of what his narrator says.

**Expected feedback:** The sentence is a modern reading note, not Douglass's wording. Correct the attribution without treating the distinction itself as false; ask the learner to cite the Narrative separately.

**Separate context used:** `23-99-0` / `readingNote`: “Distinguish household coercion from law”.

**Live response / reviewer judgment:** not recorded.

### seneca-falls-02-history-qualified-grievance

**Lesson:** `seneca-falls-02` · **Case:** supported

**Assigned cards:** `sentiments-document-3906`

> The grievance says “all colleges being closed against her.” The reading note’s Oberlin exception challenges that universal wording without showing that educational exclusion was unimportant.

**Expected feedback:** Recognize a qualification of scope that preserves the broader grievance. Attribute Oberlin to the contextual note, not the 1848 declaration. The exception does not justify dismissing every claim in the declaration.

**Separate context used:** `sentiments-document-3906` / `readingNote`: “Oberlin admitted women to its baccalaureate program in 1837, and three graduated in 1841”.

**Live response / reviewer judgment:** not recorded.

### seneca-falls-02-history-universal-needs-checking

**Lesson:** `seneca-falls-02` · **Case:** uncertain

**Assigned cards:** `sentiments-document-3906`

> The word “all” makes the education grievance universal. The declaration states that claim, but by itself it does not show the admissions rules of every college.

**Expected feedback:** Recognize a defensible source limitation without requiring the learner to name Oberlin. Ask how evidence of particular institutions could test the claim. Do not score disagreement with universal wording as failure to understand the rights argument.

**Live response / reviewer judgment:** not recorded.

### seneca-falls-02-history-invented-enactment

**Lesson:** `seneca-falls-02` · **Case:** fabricated-quotation

**Assigned cards:** `sentiments-document-3906`

> The declaration announces “All colleges are hereby required to admit women,” so the convention immediately changed admissions law everywhere.

**Expected feedback:** Identify the absent quotation and distinguish a grievance and demand from enacted legislation or achieved institutional change. Ask for the actual education grievance; do not invent a statute or its effects.

**Live response / reviewer judgment:** not recorded.

### seneca-falls-02-history-national-admissions-list

**Lesson:** `seneca-falls-02` · **Case:** out-of-range

**Assigned cards:** `sentiments-document-3906`

> List every college that admitted women in 1848 and the exact number enrolled at each.

**Expected feedback:** The packet and its bounded note do not provide a national admissions or enrollment survey. The Oberlin example does not establish an exhaustive list. Suggest the additional records needed and return to testing the scope of the supplied grievance.

**Live response / reviewer judgment:** not recorded.

### seneca-falls-02-history-oberlin-in-original

**Lesson:** `seneca-falls-02` · **Case:** context-misattribution

**Assigned cards:** `sentiments-document-3906`

> The Declaration of Sentiments itself says “Oberlin admitted women to its baccalaureate program in 1837,” so its authors already wrote this exception into the education grievance.

**Expected feedback:** Identify the quotation as wording from the modern reading note, absent from the supplied declaration text. Do not infer what the authors knew from that note. Preserve the original universal wording and keep the contextual qualification separate.

**Separate context used:** `sentiments-document-3906` / `readingNote`: “Oberlin admitted women to its baccalaureate program in 1837”.

**Live response / reviewer judgment:** not recorded.

### declaration-01-history-principle-and-action

**Lesson:** `declaration-01` · **Case:** supported

**Assigned cards:** `declaration-10-0`, `declaration-40-0`

> The principles allow people to “alter or to abolish” destructive government, and the conclusion uses “solemnly publish and declare” to announce separation. This is an argument and political declaration; the words alone do not prove military victory.

**Expected feedback:** Recognize the connection between a stated principle and the conclusion's announced action. Preserve the distinction between declaration and demonstrated later effects. Do not demand a war chronology absent from the assigned evidence.

**Live response / reviewer judgment:** not recorded.

### declaration-01-history-dates-in-context

**Lesson:** `declaration-01` · **Case:** uncertain

**Assigned cards:** `declaration-40-0`

> The reading note distinguishes the July 2 independence vote, July 4 adoption, and most signatures on August 2. The excerpt’s declaration of independence does not itself tell me when every person signed.

**Expected feedback:** Recognize both accurate use of the separately supplied chronology and the limit of the excerpt. Do not say all delegates signed on July 4 or all signed on August 2; the note explicitly allows later signatures.

**Separate context used:** `declaration-40-0` / `readingNote`: “most delegates signed the engrossed parchment on August 2; others signed later”.

**Live response / reviewer judgment:** not recorded.

### declaration-01-history-invented-signing-record

**Lesson:** `declaration-01` · **Case:** fabricated-quotation

**Assigned cards:** `declaration-40-0`

> The document says “Every delegate signed this parchment on July 4,” which proves all the signatures were added that day.

**Expected feedback:** Identify the invented quotation. Separate adoption from signing, using the labeled context if helpful. Do not invent an all-signers date or treat the excerpt as a signing register.

**Live response / reviewer judgment:** not recorded.

### declaration-01-history-later-outcomes

**Lesson:** `declaration-01` · **Case:** out-of-range

**Assigned cards:** `declaration-40-0`

> Using only these excerpts, name the final battle and treaty that secured independence and explain every treaty term.

**Expected feedback:** State that the supplied opening, principles, and conclusion cannot establish subsequent battles or treaty terms. Return to the document's stated justification and announcement without fabricating later evidence.

**Live response / reviewer judgment:** not recorded.

### declaration-01-history-note-in-original

**Lesson:** `declaration-01` · **Case:** context-misattribution

**Assigned cards:** `declaration-40-0`

> The Declaration’s own authors wrote “most delegates signed the engrossed parchment on August 2,” so this quotation is part of their announced justification for independence.

**Expected feedback:** Correct the attribution: the chronology appears in a modern reading note, not the assigned Declaration text. A factually useful note is not a quotation from the historical document or part of its argument.

**Separate context used:** `declaration-40-0` / `readingNote`: “most delegates signed the engrossed parchment on August 2”.

**Live response / reviewer judgment:** not recorded.

### tempest-03-history-competing-accounts

**Lesson:** `tempest-03` · **Case:** supported

**Assigned cards:** `1540-170-0`, `1540-167-0`

> In this Gutenberg edition, Prospero says “I pitied thee” while Caliban says “This island’s mine.” Pity presents authority as a benefit; possession presents it as a taking. The conflicting accounts invite comparison rather than proving either speaker’s whole story.

**Expected feedback:** Recognize close comparison of the supplied language and its different justifications. Retain Gutenberg's speaker label while acknowledging its edition. Accept multiple supported interpretations; do not turn either dramatic claim into an independently verified history.

**Live response / reviewer judgment:** not recorded.

### tempest-03-history-edition-disagreement

**Lesson:** `tempest-03` · **Case:** uncertain

**Assigned cards:** `1540-170-0`

> The note says Folger gives the speech beginning “Abhorred slave” to Miranda, although this card labels it PROSPERO. I need to name the edition before drawing a conclusion about which character uses that language.

**Expected feedback:** Recognize edition-aware uncertainty. Do not flag Miranda as an invented speaker merely because the selected Gutenberg card says PROSPERO. Keep the current source label intact and identify Folger information as editorial context, not a second quoted packet.

**Separate context used:** `1540-170-0` / `editorialNote`: “Folger assigns it to Miranda”.

**Live response / reviewer judgment:** not recorded.

### tempest-03-history-invented-consent

**Lesson:** `tempest-03` · **Case:** fabricated-quotation

**Assigned cards:** `1540-167-0`

> Caliban says “I freely gave this island to Prospero forever,” so his account proves that he consented to permanent rule.

**Expected feedback:** Identify the absent quotation and unsupported inference of consent. Ask for the actual claim of possession and account of their earlier relationship. Do not validate invented language because it supports a plausible thematic argument.

**Live response / reviewer judgment:** not recorded.

### tempest-03-history-ending-as-proof

**Lesson:** `tempest-03` · **Case:** out-of-range

**Assigned cards:** `1540-131-0`, `1540-167-0`, `1540-170-0`

> Does the final scene of Act 5 settle which of these accounts is true? Tell me exactly how each character ends up.

**Expected feedback:** Act 5 lies outside this Act 1 Scene 2 packet. Explain the limit and invite comparison of the supplied accounts. Do not supply ending events or use them as required evidence.

**Live response / reviewer judgment:** not recorded.

### tempest-03-history-editorial-in-dialogue

**Lesson:** `tempest-03` · **Case:** context-misattribution

**Assigned cards:** `1540-170-0`

> Prospero says “Name your edition when comparing speakers.” This proves the character knows that his speech has different editors.

**Expected feedback:** Identify the sentence as a modern editorial instruction, not dramatic dialogue. Correct the speaker attribution and ask for actual words from the play; do not invent metatheatrical awareness from interface notes.

**Separate context used:** `1540-170-0` / `editorialNote`: “Name your edition when comparing speakers”.

**Live response / reviewer judgment:** not recorded.



## Historical suite integration — September 10, 2026

The 20 historical cases are now integrated into `codex/review-fixes`, which contains the working selected-citation assessment flow (`lib/learning.ts`, prediction handling, canonical passage validation, and saved citation receipts). Integration commit: `be283ee`; the corresponding historical-suite commit on shared main is `8aacd8e`. The existing main checkout still has its older assessment flow; this integration does not replace unrelated active UI or deployment work.

The integrated review checkout passed all 100 automated tests, TypeScript, and the production build. The build retains the existing large-chunk warning. Its historical preflight prepared all 20 cases with zero model responses. These checks include canonical Strabo versus legacy paraphrase handling, invalidation after provenance/context changes, exact quotation validation, and synthetic runner orchestration.

A live test was not completed. The first connection attempt found the previous local review server stopped. After the server restarted, automatic approval review rejected the model test because sending lesson excerpts and synthetic learner answers to the configured OpenAI service requires explicit user approval. No historical-suite model request was sent. The suite is ready for a bounded live run after that approval; no quotas, access controls, or model settings were changed to work around the rejection.
