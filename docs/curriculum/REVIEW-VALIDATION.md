# Curriculum implementation review — September 10, 2026

The runtime library now applies the packet corrections in the [historical accuracy review](HISTORICAL-ACCURACY-REVIEW.md). Dickens card `46-420-0` ends at the complete sentence about sage and onion; its original source and continuation remain intact. Tempest card `1540-170-0` retains Gutenberg's Prospero label and displays the differing Folger attribution as editorial context. Butler's retained editorial markers and normalized Shakespeare verse are explained separately from the quotations.

Runtime tasks and reading ranges now match the reviewed planning catalog: Austen's second lesson uses Chapter 36 first reading, rereading, and self-assessment; Odyssey's second lesson compares the available self-description and crew warning; Frankenstein, Declaration, and Douglass ranges name the selections actually supplied. Teachers see the catalog cautions while reviewing a lesson. Guide instructions accept bounded uncertainty and do not require absent passages or outside facts.

This task prepared packet version `2026-09-10.2`. The concurrently active historical-review task then added a canonical Strabo quotation and linked source notes in version `2026-09-10.3`; the combined current registry contains 61 normalized source selections and 72 excerpt cards. Existing saved classrooms retain their prior packet. These updates do not constitute teacher approval.

[Formative examples](FORMATIVE-EXAMPLES.md) provide 12 authored learner answers and qualitative feedback expectations for the first Alexandria, Odyssey, and Austen lessons. Their [JSON fixtures](FORMATIVE-EXAMPLES.json) distinguish supported reasoning, defensible uncertainty, intentionally fabricated quotations, and out-of-range questions. Tests verify lesson IDs, assigned evidence, and whether quoted phrases actually occur. No live model performance is claimed.

Validation of the shared checkout passed:

- 62 automated tests, including ten curriculum checks and the historical-source checks added by the separate review task.
- TypeScript and the production build. The existing large client chunk warning remains.
- Local HTTP checks for Alexandria, Odyssey, Austen, Seneca Falls, Dickens, and Tempest: teacher-only preparation, retry consistency, explicit review before launch, isolated classrooms, collection, and mode restrictions. The corrected Dickens ending and Tempest note survive API serialization. The original classroom remains unchanged.

A duplicate teaching-kit state declaration introduced during concurrent UI edits was removed; TypeScript and the subsequent production build passed. Browser interaction, semantic grading, classroom trials, and deployment were not performed in this review pass. The earlier 43-test implementation report is a dated record, superseded by these checks for this review snapshot.

Next: use the formative fixtures for a separately recorded semantic evaluation, with human review of feedback. Continue source-bounded curriculum work before adding more worlds. Structured prediction, selected-quote citations, linked revision records, and teacher comparison remain separate product work.
