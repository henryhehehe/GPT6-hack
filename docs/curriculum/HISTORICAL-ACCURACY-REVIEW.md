# Historical accuracy and source review

Reviewed September 10, 2026. Scope: curriculum planning documents, all 30 lesson definitions, the 71 prepared excerpt cards and their saved context, and the Alexandria source presentation. External checks used the editions and institutional sources linked below. This is a content review, not a classroom trial or a new verification of every product claim in older engineering reports.

**Verdict:** retain the source/inference/scenario distinction and the open-ended assessment approach. The documents needed more precise historical context, edition attribution, and packet coverage. The first pass corrected documentation. The user subsequently authorized implementation: the listed packet corrections are now applied in runtime version `2026-09-10.3`, including a canonical Strabo quotation and separate linked context notes. See the implementation record below. Teacher approval and live semantic evaluation remain separate gates.

## Historical context for teachers

### Alexandria: identify the institution and the period

Strabo describes the **Mouseion** (Jones translates it as Museum), a scholarly institution within the royal precinct, not a modern exhibition museum. Section 17.1.8 describes communal facilities, shared property, and a priest formerly appointed by kings and now by Caesar. This is a Roman-period account looking back to royal arrangements. It does not describe a book collection, prove a trade-funded budget, or explain a Library destruction. [Strabo, Geography 17.1.8](https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/17A1*.html).

The teaching inference is that scholarship involves institutional arrangements. Keep the trade collapse, replacement patron, and 12-to-4 ledger explicitly hypothetical. Distinguish the Mouseion, the Library/book collections, and the illustrated building. A precise year, floor plan, ship design, or destruction narrative would require additional evidence; the current scene supplies none of those checks.

### Philadelphia: distinguish adoption, signing, and political effect

Congress voted for independence on **July 2, 1776**, adopted the Declaration on **July 4**, and most delegates signed the engrossed parchment on **August 2**; others signed later. The selected transcription represents the adopted document, not Jefferson's unamended draft. Do not stage every signer signing on July 4 or treat the document's announcement as proof of military victory. [National Archives history](https://www.archives.gov/founding-docs/declaration-history).

Teach the equality language as a principle asserted in a political argument. Claims about participation, slavery, Indigenous peoples, or rights in practice require their own contextual evidence. The selected grievances are a subset, not a representative survey of all colonial experiences. [National Archives transcription](https://www.archives.gov/founding-docs/declaration-transcript).

### Douglass: reported speech is not a statute

The **1845 Narrative** retrospectively recounts Douglass's experiences, including literacy learning in Baltimore. In Chapter VI he reports Hugh Auld describing instruction as unlawful. Attribute that statement to **Auld as reported by Douglass**; it does not by itself establish Maryland law. [Narrative, Chapters VI–VII](https://www.gutenberg.org/cache/epub/23/pg23-images.html).

The Maryland State Archives states that Maryland had no legislation specifically prohibiting enslaved people from reading and writing, while emphasizing that literacy was strongly discouraged. Distinguish coercive household restrictions from a verified statutory prohibition. This distinction does not diminish the coercion described. [Maryland State Archives, literacy FAQ](https://slavery.msa.maryland.gov/html/research/frequently-asked-questions.html).

Evaluate the testimony's perspective, retrospective narration, and scope. An abolitionist purpose does not automatically discredit testimony. Ask which particular claim requires corroboration rather than treating an enslaved person's account as presumptively unreliable. Literacy also does not equal immediate emancipation in the assigned passages.

### Seneca Falls: evaluate the scope of a grievance

The convention took place on **July 19–20, 1848**, in Seneca Falls, New York. The Declaration of Sentiments states demands; it is not legislation implementing them. [National Park Service convention history](https://www.nps.gov/wori/learn/historyculture/the-first-womens-rights-convention.htm).

The educational grievance says that **all colleges** were closed to women. Preserve that wording as the document's claim, but do not repeat it as a literal nationwide fact: Oberlin admitted women to its baccalaureate program in **1837**, and three graduated in **1841**. This provides a concrete way to test universal wording without dismissing the broader exclusion being challenged. [NPS transcription](https://www.nps.gov/wori/learn/historyculture/declaration-of-sentiments.htm), [Oberlin College history](https://www.oberlin.edu/about-oberlin/oberlin-history).

The Oberlin record supports a separate context note and reference link, not a new primary-source evidence card. A learner with only the declaration may correctly say that the universal claim needs checking; do not require knowledge of Oberlin to pass. Property and voting claims likewise need a specified jurisdiction, date, and affected group before generalization.

## Literature: editions are part of the evidence

| World | Source check and teaching consequence |
| --- | --- |
| Odyssey IX | Preserve Butler's names, including Ulysses, Noman, and Neptune. Narrator, translator, and authorial tradition are different attributions. Book IX is a narrated literary episode, not a neutral record of ancient Greek conduct. Butler's explanatory theories and footnote bodies remain outside the packet. [Selected translation](https://www.gutenberg.org/cache/epub/1727/pg1727-images.html). |
| Pride and Prejudice | Chapters 35–36 distinguish Darcy's letter from narration of Elizabeth's response. The encounter is near the Rosings park boundary; a reading desk is staging. A referenced witness is not a witness statement supplied in the packet. [Selected edition](https://www.gutenberg.org/cache/epub/1342/pg1342-images.html). |
| Macbeth | Retain Act 1 scene locators and speaker labels. The selected aside records Macbeth's interpretation; prediction and inevitability are different claims. This dramatic text is not documentary evidence for the historical Scottish king. Verse lineation needs a readable edition for analysis of meter or line breaks. [Selected edition](https://www.gutenberg.org/cache/epub/1533/pg1533-images.html). |
| Frankenstein | #42324 explicitly identifies an **1831** publication. Keep its chapter divisions separate from 1818; source publication date is not automatically the date of narrated events. Avoid importing film apparatus into the creation passage. [Edition record](https://www.gutenberg.org/ebooks/42324). |
| A Christmas Carol | Staves 1–3 support analysis of selected narrated scenes, not a statistical account of Victorian poverty or evidence of the ending. The sentence-boundary defect recorded below is corrected in the runtime packet. [Stave 3 source](https://www.gutenberg.org/cache/epub/46/pg46-images.html). |
| The Tempest | Gutenberg #1540 assigns the speech beginning **“Abhorred slave”** to Prospero; Folger assigns it to Miranda and explains the editorial reassignment. The packet matches its chosen edition, but its character attribution is not edition-neutral. Do not grade a Folger-based attribution as fabricated without checking the edition. [Gutenberg 1.2](https://www.gutenberg.org/cache/epub/1540/pg1540-images.html), [Folger text and editorial introduction](https://www.folgerdigitaltexts.org/Tmp/). |

## Original packet findings and correction specification

The following table records findings from the original review and the required corrections. These corrections have since been implemented as recorded below; optional expansion passages and lineated verse remain future extensions, not requirements of the current activities.

| Affected lesson or card | Observed problem | Concrete correction before use of the affected activity |
| --- | --- | --- |
| `tempest-03`, `1540-170-0` | Title “Prospero's account” hides the edition-dependent attribution central to a speaker-comparison lesson. | Add an explicit edition note alongside the card and in teaching context, or select a different Prospero passage from the same edition after review. Do not silently change the quoted speaker label. |
| `christmas-carol-03`, `46-420-0` | The card ends with the incomplete sentence fragment “But now, the plates being changed by Miss Belinda, Mrs.”; its saved source contains the continuation. | End the card after the preceding complete sentence about the children and sage and onion. Recompute its exclusive end offset. The unchanged saved source can retain the full paragraph. |
| `austen-letter-02` | All three cards and their bounded contexts are Chapter 36. The runtime activity asks students to compare the letter's language with its reception, although no direct Chapter 35 letter passage is supplied. | The planning activity now compares first reading, rereading, and self-assessment within Chapter 36. Apply that revision to the runtime catalog, or add reviewed Chapter 35 evidence before requiring a direct comparison. |
| `odyssey-ix-02` | Its three cards cover an inward boast, the crew's warning, and the shouted identity. The original brief asks for narrative framing and the actual escape plan, which these bounded contexts omit. | The revised brief analyzes the available self-description and decisions. Add framing/escape passages only if retaining the broader original task. Do not require an absent passage in assessment. |
| `frankenstein-01` and `frankenstein-03` | The former supplies Letters I–II, not I–IV; the latter supplies Chapter 5, not Chapter 4's earlier aspiration. | Planning ranges now name the supplied selections. The Chapter 5 activity compares the stated goal recalled in that chapter with the creator's response. Align runtime wording before assigning the activity. |
| `declaration-01`, `douglass-literacy-03` | The supplied packets include the Declaration conclusion and only Douglass Chapter VII, respectively; previous range descriptions differed. | Use the corrected planning ranges when updating runtime metadata. Do not imply an additional chapter is available. |
| `1727-430-0` and normalized verse | Butler's bracket and footnote marker remain in the Odyssey quotation; Shakespeare line breaks have been collapsed. | Explain retained editorial markers without feeding footnote theories into the lesson. Describe normalized text accurately and provide a separately approved lineated selection before assessing verse form. |

The original Alexandria reader separated a short quotation from a longer paraphrase. New lessons now use a saved 361-character Mouseion quotation with verified offsets and a separate explanatory note. Old saved lessons retain their original paraphrase and reader labeling. Structured per-claim quotation assessment remains separate product work.

## Review standard and verification

A hash proves agreement with saved bytes, not faithful attribution, complete context, sufficient evidence, or historical truth. Distinguish **text match**, **historical/source review**, **teacher approval**, and **runtime checks**. A lesson may pass the first and last while still needing the middle two.

For a revised packet, preserve raw source snapshots, change versioned excerpt/metadata records together, validate offsets and hashes, and inspect speaker, sentence, and reading-range boundaries. Confirm that every required comparison is answerable from the supplied evidence. Keep new contextual sources distinct from the original document, and accept an evidence-bounded statement of uncertainty.

Validation passed: 10 unique worlds and 30 unique lesson IDs; all six teaching fields per lesson agree between JSON and Markdown; 30 local document links resolve; all 60 saved source/manifest hashes and 71 UTF-16 excerpt/context ranges agree. These checks establish consistency, not semantic approval. It did not modify runtime content, run a live grading evaluation, deploy the app, or establish learning gains. Older build and demo reports remain dated records of their own runs.


## Implemented corrections — September 10, 2026

The shared curriculum pass applied the Dickens boundary, Tempest and Butler editorial notes, activity/range corrections, and teacher cautions. This follow-up integrated those changes into packet version **2026-09-10.3** and completed the following:

- All 30 runtime definitions use the reviewed planning worlds. Austen, Odyssey, Frankenstein, Declaration, and Douglass tasks now name and use the passages actually supplied.
- The 361-character Jones quotation is saved as `sources/strabo-17-1-8.txt`; the downloaded HTML is retained alongside it. Both hashes are recorded in the manifest. There are now **61 source selections and 72 excerpt records**, plus Alexandria's unchanged funding assumption and invented ledger. Page/section and footnote-reference markers are removed only from the new Strabo selection, as its normalization record states; original literary selections retain their documented normalization.
- Historical reading notes and linked institutional references appear separately from quoted text in teacher review and the student reader. They cover Alexandria, the Declaration, Douglass, Seneca Falls, and the Tempest edition distinction. Butler's markers and normalized verse have explicit editorial cautions; current activities do not assess meter or original line breaks.
- New default Alexandria worlds and new catalog drafts use the canonical quotation. Existing stored drafts and classrooms retain their saved source versions and evidence; reopening a previous classroom does not silently replace its paraphrase. Create a new lesson draft to use the corrections.
- Scenario generation restores the complete canonical historical source, including provenance and contextual notes, and rejects altered or omitted historical sources. Source-upload generation cannot manufacture trusted context metadata. Model instructions distinguish contextual explanation from source quotation and prohibit requiring unread external evidence.
- Authored formative examples for the first three worlds are available in [FORMATIVE-EXAMPLES.md](FORMATIVE-EXAMPLES.md). They are review fixtures, not measured model performance.

All 70 automated tests passed, including regressions for canonical-source integrity, legacy compatibility, source restoration, and protection against model-authored provenance. Local HTTP checks passed for ten lessons, including source review, fresh launch, replay, contextual-note persistence, collection, mode restrictions, and isolation of the original classroom. TypeScript and the production build passed. No deployment, browser interaction audit, paid model evaluation, or classroom trial was performed for this follow-up.


## Historical feedback continuation — September 10, 2026

Added 20 [historical feedback review cases](HISTORICAL-FEEDBACK-CASES.md) across Douglass Chapter VI, the Seneca Falls education grievance, the Declaration, and The Tempest's edition-dependent speaker. Each includes supported reasoning, warranted uncertainty, an invented quotation, an out-of-range request, and modern context falsely attributed to the original source. The machine-readable fixture pins packet version and the separate context-note fingerprint. These are authored expectations, not measured model behavior.

The Seneca Falls runtime note now names the Declaration of Sentiments explicitly, resolving an ambiguous “this declaration” beside the comparison lesson's 1776 text. Original source text and packet offsets are unchanged. The evaluation runner now accepts `--suite historical` while retaining the original formative suite by default; source/context checks run before requests, and credited note misattributions receive a human-review flag.

The 20-case offline report prepared successfully. A one-case live attempt for the Tempest edition disagreement stopped before classroom creation or model calls because the selected-citation helpers in `lib/learning.ts` were missing locally. Tutor semantics remain unevaluated; the next step is to complete that integration and conduct a permitted live run, then review the actual feedback against these expectations.

Validation for this continuation: all 117 shared automated tests passed via `node --import tsx --test tests/*.test.ts`, including 25 focused curriculum/source/evaluation checks; TypeScript and the scoped whitespace check passed. The standard `npm test` launcher encountered a sandbox IPC restriction, so the same test files ran through Node's import hook. Historical orchestration tests use a fake HTTP app and stub feedback. No real classroom or model request, browser audit, deployment, or classroom trial occurred in this continuation.
