# Literature worlds: English alongside history

September 10, 2026. User-directed expansion specification, originally written before literature packet implementation. The local World Library now provides prepared Odyssey and Pride and Prejudice lessons in symbolic settings; see [implementation scope](curriculum/IMPLEMENTATION.md). Bespoke environments and several learning-loop features below remain planned. The [historical accuracy review](curriculum/HISTORICAL-ACCURACY-REVIEW.md) identifies edition and packet-coverage issues still requiring correction; prepared does not mean fully reviewed.

## Product direction

**Step into a text. Examine the evidence. Defend your reading.**

The shared experience is teacher-guided exploration and evidence-based reasoning across history and English. Keep Counterfactual Worlds as the working name. Counterfactuals are one teaching mode; close reading must work without changing the original story.

For English, the world helps students notice setting, perspective, motivation, irony, and the consequences of choices. Astra challenges an interpretation using the assigned passages, and the teacher can redirect that challenge live. A beautiful location or unrestricted conversation with a fictional character is not sufficient on its own.

## Two concrete lesson packs

| Pack | Playable setting | Central question | Student interaction | Optional counterfactual |
|---|---|---|---|---|
| The Odyssey — Book IX | Shore, Cyclops' cave, departing ship | How does the episode complicate the relationship between cleverness, pride, and leadership? | Collect passages, distinguish Odysseus' account from a neutral report, and defend a reading of his choices | What might change if he withholds his identity after escaping? Clearly label the branch as invented |
| Pride and Prejudice — Chapters 35–36 | Hunsford garden path, letter-reading space, evidence desk | How and why does Elizabeth revise her judgment? | Compare passages available before and after the letter; separate Darcy's claims, corroboration, and Elizabeth's response | Explore how withholding a piece of information might affect an interpretation, without asserting Austen wrote that alternate outcome |

Source editions: [The Odyssey, Samuel Butler's English prose translation](https://www.gutenberg.org/ebooks/1727) and [Pride and Prejudice](https://www.gutenberg.org/ebooks/1342), available through Project Gutenberg. The selected translation matters: Butler uses names such as Ulysses. Record edition and translator, display consistent names, and never fabricate line numbers for a prose translation. Use book/chapter plus stable passage IDs and character offsets. Gutenberg lists these editions as public domain in the USA; preserve applicable source/edition notices when packaging excerpts. Do not assume a modern translation has the same reuse status.

For Austen, the initial excerpt packet is limited to the assigned chapters and necessary earlier passages approved by the teacher. The [novel's text](https://www.gutenberg.org/cache/epub/1342/pg1342-images.html) supplies the letter and Elizabeth's reassessment. That reassessment is material for argument, not a required answer that every student must repeat. Book IX of [the selected Odyssey text](https://www.gutenberg.org/cache/epub/1727/pg1727-images.html) supplies the escape and subsequent identification episode.

## What the interfaces do

Teacher selects subject, work, assigned book/chapter range, learning objective, and close-reading or counterfactual mode. Preview shows the actual excerpts and which details are interpretive scene design. Publishing a pack creates a fresh classroom; changing books must never reinterpret existing student progress as progress in a different text.

Student explores three meaningful locations, opens readable passages, selects citations, and makes a claim. Each passage offers “Read in context.” Opening a letter or approaching a cave is a way into the text; scenery never substitutes for the text. Subsequent evidence can be revealed as a reading sequence, but it must not depend on accepting a prescribed interpretation.

Teacher sees the selected learner's claim, cited passages, and assessment. A live correction might say “Ask them to examine the narrator's wording; don't tell them which interpretation to choose.” Student receives a guiding question and a highlighted available passage. The original text remains unchanged.

Character dialogue is optional generated role-play and visibly distinguished from quotations. The teacher's reading boundary is enforced server-side so a character does not reveal later chapters. A character's statement is not automatically reliable, and an omniscient tutor voice must not be silently attributed to that character.

## Assessment changes

Literature rubric: **interpretive claim · textual evidence · analysis · alternative reading**. Analysis can explain diction, irony, narration, imagery, motivation, or structure. It must not require a historical cause-and-effect mechanism or a single moral judgment.

Retain code-level validation of actual student excerpts and cited source IDs. Verify quotations against the chosen edition; distinguish direct quotation from paraphrase. Unsupported confidence, fabricated quotations, and merely mentioning a theme must not earn evidence/analysis credit. Accept different readings when students can substantiate them.

Avoid a “correct reading” gate. A completion milestone can recognize a supported argument and revision; later primary-text evidence must remain accessible according to the teacher's reading range. Teacher review remains available because model feedback is formative, not validated grading.

Three labels remain visible: **Text from the work**, **Interpretation**, **Invented what-if**. Generated dialogue and visual staging cannot be promoted to primary textual evidence. Switching a what-if off restores the canonical source packet and original scene state.

## Blender asset direction

Literature needs distinct settings, not the Alexandria library renamed for every book.

- **Odyssey pack:** original rocky coastal environment, cave entrance/interior, detailed ship with mast/rigging, amphorae and sheep silhouettes. Begin with the coast and cave; a fully rigged giant, combat, and cinematic character animation are optional later work. Mythic geography is interpretive, not a claimed archaeological reconstruction.
- **Austen pack:** an intimate period interior/garden kit: sash windows, paneled walls, writing desk, folded letter, chairs, garden path and doorway. A broader later pack can add a country-house exterior and ballroom for other chapters. Do not conflate Hunsford with Pemberley or reproduce a film set as the book's definitive location.
- Both export GLB assets with named interaction anchors. Letters and books open an accessible text panel rather than embedding tiny unreadable text into a texture. Preserve editable Blender files and deterministic generation scripts; keep per-pack download/triangle budgets and test them before integration.

## Required architecture refactor

At the original specification baseline, code hardcoded harbor/market/library, merchant/archivist names, historical author prompts, activity values, and a causal rubric. The later implementation adds subject-aware lessons and fictional reading guides while retaining legacy zone IDs. Treat the refactor below as the design target, not an audit of the current code; changing labels alone would misrepresent support.

Coordinator owns a versioned `LessonPack` contract containing subject, work/edition metadata, approved passages, reading boundary, places, characters, objectives, rubric, allowed branch settings, and scene-template ID. Place and character IDs come from the selected pack; a registry restricts templates and assets to authored implementations. Astra cannot supply arbitrary scripts or asset URLs.

Keep source/pack data separate from runtime classroom state. Add a schema version and an explicit adapter for existing Alexandria worlds so saved evidence and turns remain valid. New book selection starts a new classroom. The backend chooses prompts, validators, characters, and rubric from trusted pack configuration rather than caller-provided roles or lesson names.

Scene rendering dispatches to Alexandria, Odyssey, or Austen templates. The shared runtime retains camera navigation, evidence anchors, teacher intervention previews, and state preservation. Replace the universal `activity` assumption with bounded template-specific state: an Odyssey branch might alter the ship's route cue; Austen close reading might reveal a letter or comparison panel, not change building population.

Free movement is part of the shared runtime: the Alexandria controller now supports walking, keyboard/touch input, nearby inspection, and overview switching. Each future pack must supply its own walkable floor boundaries, obstacles, elevations, and safe arrival points. Odyssey cave interiors and Austen rooms require authored traversal geometry rather than reusing Alexandria's outdoor collision map.

## Concurrent implementation after the contract is frozen

Use the existing one-coordinator/three-agent model. This expansion supersedes Alexandria-only assumptions in the next sprint; retain the P0 learner-selection and state-race fixes from the parallel plan.

| Owner | Work | Boundaries and gate |
|---|---|---|
| Coordinator | Versioned pack/schema contracts, compatibility adapter, database decisions, final integration/commits/hosting | Land the shared contract first; validate existing Alexandria sessions before launching dependent edits |
| A — Teacher/student UI | Pack picker, reading boundary, citations/context panel, literature rubric display, selected learner | Own Classroom/panels/CSS; no server or asset files; both subjects must remain usable |
| B — Scene/assets | Odyssey Blender pack first, scene-template renderer, evidence anchors; Austen kit second | Own scene/assets/scripts; coordinate manifest through coordinator; each model must serve a lesson interaction |
| C — Text and Astra | Reviewed excerpt packs, source validation, literature prompts, spoiler enforcement, transport grounding, regression/eval fixtures | Own pack content modules, backend and tests; no UI or renderer edits; reject fabricated and out-of-range citations |

Dependencies: contracts → concurrent implementation → pack integration → teacher/student rehearsal. If asset work is slower, implement genuine close reading in a labeled simple setting while assets finish. Do not claim arbitrary-book generation; support the two reviewed packs explicitly.

Acceptance: Alexandria remains functional; both literature packs use their own places/characters; quotations resolve to the right edition; a defensible disagreement can pass; fabricated quotations cannot; teacher-selected reading boundaries prevent future passages from entering model context; live steering preserves student work; source and invented branch remain distinguishable. Verify two actual clients before recording.

## One-minute hackathon scope

Finish one literature loop before expanding another. Default implementation order: **Odyssey first** for an immediately legible visual setting, **Austen second** to demonstrate that close reading also works for social and narrative interpretation. This is a product prioritization decision, not evidence that one teaches better.

The one-minute video should show one complete lesson rather than three incomplete worlds. Suggested literature edit: teacher selects work/reading range (0–8s), student explores and opens a passage (8–20s), makes a claim (20–31s), teacher steers the guiding question (31–43s), student compares evidence and revises (43–56s), final result (56–60s). Show a second book in the picker only once that pack is genuinely working; do not portray a roadmap as functionality.
