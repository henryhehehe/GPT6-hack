# World library implementation

September 10, 2026. The local app now has a teacher world library covering all 10 catalog worlds and 30 lessons. This is an implementation of prepared teaching packets in existing scene templates; it does not provide ten new bespoke 3D environments.

## Teacher and student flow

Teacher studio → Browse worlds & lessons → choose a lesson → review exact evidence, bounded reading context, activities, and teaching notes → approve → launch a fresh classroom. Search matches titles and inquiry questions; subjects filter history and literature. Existing source upload/paste/PDF authoring remains available.

Preparation uses a pinned, authored registry, so opening a packet needs no model request. Optional setting illustrations and the existing conversational/evaluation features still use Astra. Each launch has a draft-specific identity; retries reuse that classroom, and a new lesson never overwrites the original classroom. A teacher credential is required for preparation, review, and launch.

The classroom carries the selected question, reading range, three evidence stations, three explicitly fictional reading guides, teacher challenge, and revision prompt. Close-reading and documentary investigation lessons keep original evidence; their what-if switch is hidden and fabricated scenario requests are rejected by the server. The three declared counterfactual lessons retain a hypothetical comparison. Alexandria uses the existing scene; the other worlds use the existing coast, garden, or archive renderer. These are symbolic settings, not book-specific reconstructions.

Students can read each excerpt’s bounded source context inside the evidence reader, collect evidence, cite it, and submit an argument using existing persistence. The revision prompt asks them to include what changed and why in the revised argument. This implementation does **not** add structured prediction records, per-claim quote selections, linked revision/reflection fields, or teacher before/after comparison. Those remain the core learning-loop work described in the implementation plan.

## Source preparation

`lib/curriculum/catalog.json` is a pinned runtime snapshot of the planning catalog. `lib/curriculum/packets.json` contains 61 normalized source selections and 72 excerpt records: the original literary/document selections plus a saved Strabo passage. New Alexandria lessons use that exact quotation alongside the existing assumption and invented ledger; older saved worlds retain their original cards. A selection’s text and SHA-256 are preserved in `docs/curriculum/sources/`; the manifest also records the downloaded HTML hash and retrieval date. Offsets are zero-based UTF-16 code units with exclusive ends. Whitespace is normalized; source page and footnote markers remain. The implementation pass inspected excerpt boundaries and corrected three cutoffs. A subsequent [content review](HISTORICAL-ACCURACY-REVIEW.md) found another incomplete sentence in `46-420-0`, an edition-dependent Tempest attribution, and mismatches between several activities and supplied passages. These corrections are now integrated in version `2026-09-10.3`; see the content review implementation record. Text/offset/hash agreement alone would not have resolved them.

Source editions are Butler’s Odyssey (#1727), Austen (#1342), Macbeth (#1533), Shelley’s 1831 Frankenstein (#42324), A Christmas Carol (#46), The Tempest (#1540), Douglass’s 1845 Narrative (#23), the National Archives Declaration transcription, and the National Park Service Declaration of Sentiments transcription. Full Project Gutenberg reuse notices and attribution are available at `/curriculum-notices.txt`. Source URLs and edition information travel with evidence. The teacher-facing original-source links may contain material beyond the lesson; students receive only the saved excerpts and bounded context through classroom state.

These consistency checks establish that stored excerpts match the pinned normalized selections. They do not independently prove that selection/normalization preserved all relevant features of the downloaded edition. They do not establish pedagogical efficacy, independent corroboration of documentary claims, or teacher approval. A declaration’s allegation and a narrator’s recollection remain statements to interpret and evaluate.

## Boundaries and compatibility

Optional `Evidence.context` and `lessonPack.curriculum` fields preserve legacy classroom decoding. Context ranges must resolve exactly to the evidence text. Model-generated lesson schemas cannot supply these trusted catalog identifiers or source contexts. Server lookup accepts a known lesson ID, not arbitrary client world/source JSON. The existing D1 draft storage needs no migration.

Review and launch reuse the existing teacher gate. Catalog drafts carry no generated-run telemetry. Later source changes create a new registry version; saved classrooms retain their packet. Do not overwrite runtime snapshots merely because the planning automation revises a lesson. Review and test each source update deliberately.

The application’s pre-existing selected-learner director limitation, broader recovery work, provisional grading, archive-milestone limitations, and browser/accessibility/performance gates remain. Prompt instructions restrict answers to the source packet; semantic spoiler refusal and interpretation quality have not been validated by a live model evaluation in this pass.

## Verification

- Deterministic checks cover all 30 world constructions, local evidence links, exact source/offset/hash agreement, assigned section locators, unknown IDs, tampered context, preserved Alexandria provenance, mode restrictions, and exclusion of trusted catalog metadata from model-authored lessons.
- Local HTTP smoke covers Alexandria, Odyssey, Austen, and Seneca Falls: teacher authorization, unknown IDs, draft replay, conflicting request IDs, unreviewed launch rejection, idempotent fresh-classroom launch, source collection, mode rejection, and preservation of the original classroom. No model calls are made by this smoke.
- Final verification: 43 automated tests passed, TypeScript passed, and the production build passed against the shared checkout. A material type annotation was added to the concurrently introduced harbor Water renderer so TypeScript recognizes its actual ShaderMaterial; rendering behavior is unchanged. Browser interaction, layout screenshots, device performance, semantic grading, and a teacher/two-student learning trial were not performed in this implementation pass. The existing large-client-chunk build warning remains.
- No deployment was requested by this implementation turn. Changes are available in the local preview.

## Maintaining the library

Continue curricular improvements in the planning docs first. For a runtime addition or correction, update the pinned catalog/packet snapshots, exact source selections, provenance manifest, and version together. Preserve complete source notices. Run the curriculum tests and applicable local smoke checks; never make a source-verified status stand in for teacher review or classroom readiness.

## Subsequent review

The corrections previously listed as outstanding above were applied locally in the reviewed packet update, followed by canonical Strabo and linked context in version 2026-09-10.3. See [REVIEW-VALIDATION.md](REVIEW-VALIDATION.md) for the current 62-test/build result, six-lesson HTTP checks, formative examples, and remaining limitations. Earlier counts and scope in this document describe the initial implementation pass.


## Historical accuracy follow-up — packet 2026-09-10.3

The [historical accuracy review](HISTORICAL-ACCURACY-REVIEW.md) now records the completed runtime corrections. Canonical Strabo text has a retained HTML source, normalized selection, hashes, and offsets. Reading notes and contextual reference links travel with the evidence and appear separately from quotations in teacher and student readers. They are optional fields for legacy compatibility; generated lesson schemas omit the complete trusted context object. Scenario generation preserves the verified source with its metadata. Fresh drafts receive the new content; saved drafts and classrooms keep their existing version. No database migration or deployment is required for the local change.

Ten lesson HTTP smoke cases passed, including historical note persistence through launch and classroom retrieval. All 70 automated tests passed, including canonical-source, compatibility, and provenance-protection regressions. TypeScript and production build passed. A large-client-chunk build warning remains. No browser interaction, live grading, or classroom outcome claim is added.
