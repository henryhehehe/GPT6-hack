# Museum collections in Counterfactual Worlds

## Current collection — expanded 10 September 2026

The museum page now has **60 objects across all ten curriculum topics**, including 53 records added after the initial seven. Classroom topic suggestions cover every supported world. See [the expansion catalog and usage notes](MUSEUM-OBJECT-EXPANSION.md) for the added objects, comparison ideas, retained API snapshots, and maintenance steps. The original seven objects, demo selection, and three guided investigations remain intact. Seven additional investigations now provide one guided pair per curriculum topic; see [the classroom investigation guide](MUSEUM-INVESTIGATION-GUIDE.md).

## Product decision

Treat a museum object as a separately attributed historical or artistic source, with explicit limits on its relevance. A photograph of an ancient coin is not a reconstruction of Alexandria; a seventeenth-century painting of the Odyssey is evidence of later reception, not an eyewitness account. Teaching prompts are our editorial material, not museum quotations.

## Delivered first version — 10 September 2026

- `/collections`: a searchable, topic- and museum-filtered, curated collection of seven real records from Cleveland and The Met, linked from the landing page.
- Three Ptolemaic objects for Alexandria: gold and silver coins and a royal portrait. Two Odyssey connections: a siren-shaped flask and a later Dutch painting of Calypso. Both Odyssey objects explicitly identify their distance from the Book IX reading.
- Original museum photographs, exact catalogue dates, culture/place, medium, dimensions, maker attribution, credit line, accession number, original record link, CC0 link, retrieval date, and selectable citation.
- Teacher studio → **Museum objects** adds/removes objects in the current classroom. Changes save immediately to D1 inside the existing world JSON; learners see the selected collection through their field journal. Existing classroom authentication and optimistic version checks apply. No migration is needed.
- Museum objects stay separate from graded excerpt cards. Selecting them changes neither student evidence nor answers and makes no AI request. Existing model generation schemas cannot invent collection IDs.
- The same white, black, and vermilion visual language as the approved landing page; responsive collection grid, keyboard-accessible details and filters, image-unavailable state, empty results and recoverable save errors.

This is a reviewed snapshot, not a live search across all museum holdings. Photographs are served by the museum CDN; metadata and teaching notes remain readable if an image is unavailable. No museum partnership is implied. Selections are classroom-specific: attaching an object after launch does not rewrite the original prepared lesson draft. Copying a classroom through the saved-world flow retains its world metadata.

## Integrated demo flow

`/try` now includes a three-step museum investigation: inspect the coin, read the saved Strabo excerpt, and open the learner’s explanation. `/try?museum=1` opens directly into the coin inspection; the collection page links to it. The photograph can be enlarged from 100% to 300%, with scrollable inspection and the original museum credit always adjacent. This is image magnification, not IIIF or a 3D scan.

New practice classrooms persist the three Alexandria objects when created. Ordinary teacher classroom defaults remain unchanged. Older practice classrooms retain their selections and work; their public museum tour remains readable without rewriting those selections or requiring new teacher credentials. The guided coin is a public demo supplement, separate from the teacher-selected field-journal collection. No source is automatically collected and no answer is generated, replaced, or submitted by the tour.

The source step opens the existing reader, where the learner can save the exact excerpt and add its citation. The explanation step preserves any existing draft. Selected museum objects also appear in the teacher guide and printable observation worksheet, with attribution and evidence limits. Museum photographs require connectivity; the downloaded metadata and questions work offline.

For a presenter walkthrough, see [Museum demo flow](demo/MUSEUM-FLOW.md). Existing recorded demo films are not changed by this implementation.

## Object inspection and comparison

Every collection card now offers **Inspect & zoom** and **Compare**. Inspection retains the museum’s metadata, credit, citation, and editorial evidence limits. Select two distinct objects to open a comparison; each photograph has independent 100–300% magnification and a reset control. A scale notice explains that photographs are fitted separately and their displayed sizes cannot establish relative physical size. Museum dimensions remain available for that comparison.

The Alexandria demo adds **Compare gold & silver coins** within the existing investigation, preserving the next step into Strabo’s source. Comparison choices are temporary viewing state and never modify the classroom’s saved object selection or a learner’s answer. The classroom collection browser suggests the matching topic for all ten worlds only from the known curriculum identity, with no guesses from a custom reading’s title. Learners continue to see every teacher-selected object, including those from another topic.

## Guided pairs and reusable worksheets

The collection now offers ten editorial eight-minute investigations, including the original three: **How does power make itself visible?** (Alexandria coins), **What changes when a story is retold?** (the siren flask and Calypso painting), and **What do appearances leave out?** (the Met dress and teapot). Each opens the existing comparison with observation, comparison and limitation prompts, followed by a specific bridge back to its assigned reading. These are discussion starters, not museum quotations or generated answers.

Choosing the same pair manually reveals the same guide. The Alexandria demo’s gold/silver comparison also includes its guide. Teacher suggestions follow the known lesson topic; learner suggestions appear only when both objects are selected for that classroom. The selected topic filters the suggested investigations too. All-topic browsing starts with three suggestions and offers a Show all investigations control; the complete set is documented in the investigation guide.

Teacher collection cards now offer **Add pair to lesson** (or **Add missing object** when one is already selected). The `museum-investigation` action requires the teacher token, accepts only a reviewed investigation ID, validates the full union against the six-object limit, and persists it in one classroom-version-checked write. It cannot leave half a pair behind after a capacity failure. Existing objects keep their order; retries with both objects present do not write or increment the world version. Learner work and AI quota are unchanged.

Complete pairs appear in the on-screen teaching guide and its downloaded teacher plan, with the three timed prompts and reading bridge. Each pair also has a standalone worksheet download from the teaching guide. Teachers are asked to choose one discussion within investigation time, so these optional activities do not silently lengthen the selected 30-, 45-, or 60-minute plan. Removing either object removes that complete-pair suggestion; no additional investigation state is stored.

Each guide downloads a standalone HTML worksheet with blank response spaces, full citations, original-record links and evidence limits. It can be printed or saved as PDF from a browser; questions and metadata work offline, but photographs are linked rather than embedded. There is no new persistence, AI request, or automatic change to lesson selection or learner work.

Public links open the selected pair directly: `/collections?study=royal-power`, `/collections?study=odyssey-retold`, and `/collections?study=austen-first-impressions`. Unknown or repeated query values fall back to the normal collection. Links contain only a reviewed investigation ID, never classroom credentials or learner data.

## Learner field notebook

Learners can write a field note from the coin demo, any selected object’s inspector/comparison, or the field journal. The notebook separates observation (required, 500 characters), interpretation (optional, 500), and uncertainty (optional, 300). It accepts only reviewed collection IDs. Notes are personal contextual work; they are not museum quotations, collected source cards, or scored evidence.

Save and remove actions use the existing learner token, D1 student JSON, student revision and classroom version checks. A per-object revision plus a monotonic notebook sequence prevents stale updates, including deleting and re-creating an object’s note. Identical content can be retried safely after a lost response. Note saving makes no AI call. A learner can read only their own notes; the classroom teacher can review them in the live classroom and learning report. Both the learner writing download and teacher report include notes and source attribution, with all learner text escaped.

Unsubmitted note drafts stay in memory across dialog closes and object switches. They do not survive page reload; the interface explicitly asks learners to save first. Saved notes persist across reloads. A classroom switch clears the in-memory draft collection. Notes count as meaningful progress, so world regeneration cannot erase their context once learners have started writing.

No new database migration is required: notes live in the already persisted student state. They are not sent to museum providers or silently added to AI assessment context.

## Second museum and Austen collection

The collection now includes The Met’s **Dress**, ca. 1810 (13.49.16), and **Teapot**, ca. 1800 (13.31.1a, b). Both API records explicitly mark their photographs as public domain. The prompts connect observation to appearance, assumptions, hospitality and social expectations in Austen’s fiction. They do not identify either object as Austen’s possession or a prop from a fictional scene.

The Met adapter retains exact catalogue dates and artist attribution qualifiers. Missing dimensions or culture are shown as unavailable in the API record, rather than invented. The teapot’s API culture field is blank although its public object page identifies it as British; the teaching limits explain this discrepancy and link to the original record. The dress has no free-text dimensions in the API; no units are inferred from its separate measurements array.

Museum and topic filters are independent; search also covers maker and provider. Empty results offer a reset. Counts and topic options derive from the approved collection. Existing comparison, six-object lesson selection, notebook, citations and exports accept both providers. Austen lessons suggest the Jane Austen topic; the Alexandria demo retains its three existing objects.

## Rights and provenance contract

Cleveland releases its dataset as CC0, but only records with `share_license_status: "CC0"` provide CC0 images. We require that exact value and a supported HTTPS museum image host. Missing or restricted images fail ingestion. We do not assume a public API response gives permission to reproduce every image.

The Met adapter requires `isPublicDomain: true` and an approved HTTPS photograph URL. Provider-specific schemas bind IDs, record links and image hosts to the correct museum; the Met record URL must match its object ID.

The normalized record and editorial annotations are separate fields in `lib/museums/collection.json`. We retain accession and provider identifiers, exact human-readable dates (including BCE and uncertainty), retrieval date and provider update time. External HTML descriptions are not rendered or sent to a model. No student information is sent to the museum.

`node --import tsx scripts/museums/review-refresh.ts` re-fetches only the seven approved IDs from their respective provider endpoints with bounded timeouts and no redirects. It writes a review candidate to `/private/tmp/cw-museum-review.json`; it never silently replaces approved records. Review source/rights changes before updating the catalogue. Retired IDs should retain a historical tombstone record while old classrooms reference them.

Primary references:
- [Cleveland Open Access](https://www.clevelandart.org/open-access)
- [Cleveland API and rights fields](https://openaccess-api.clevelandart.org/)
- [The Met Open Access](https://www.metmuseum.org/hubs/open-access)
- [Dress, accession 13.49.16](https://www.metmuseum.org/art/collection/search/90487)
- [Teapot, accession 13.31.1a, b](https://www.metmuseum.org/art/collection/search/192043)
- [CC0 dedication](https://creativecommons.org/publicdomain/zero/1.0/)
- [Gold coin, accession 1965.552](https://www.clevelandart.org/art/1965.552)
- [Royal portrait, accession 1920.1999](https://www.clevelandart.org/art/1920.1999)
- [Silver coin, accession 1916.994](https://www.clevelandart.org/art/1916.994)
- [Siren flask, accession 1928.193](https://www.clevelandart.org/art/1928.193)
- [Calypso painting, accession 1992.2](https://www.clevelandart.org/art/1992.2)

## Next delivery: more collections and teacher curation

1. Add an Art Institute of Chicago adapter alongside the delivered Cleveland and Met adapters. Normalize each provider’s explicit rights fields independently; retain museum-specific identifiers and source links. The Met now documents paginated `/public/collection/v1.1/search`; its previous search endpoint is scheduled for retirement on 1 October 2026. Verify the API contract at implementation time.
2. Add server-side search with fixed provider endpoints, bounded queries, pagination, timeouts, rate limits and cached results. Return partial-provider failures visibly. Do not accept arbitrary fetch URLs or include classroom/student content in a museum search.
3. Let teachers search by date, culture, material and topic, review relevance, and attach an object with their own question and a location/station. Keep teacher annotations visually distinct from catalogue metadata.
4. Store immutable record revisions and teacher-selected snapshots in D1; preserve old lesson citations when museum descriptions change. A review queue can detect rights changes and remove affected displayed images. This needs schema migration and a policy for historical citations.
5. Expand the remaining lesson packets with verified, period-appropriate objects. The Austen collection now begins with two Met objects; future additions should extend specific readings rather than simply match broad terms such as “tea”.

Sources: [Met collection API](https://metmuseum.github.io/), [Art Institute API documentation](https://api.artic.edu/docs/).

## Later: close observation and 3D

- IIIF image zoom, comparison and teacher annotations where the provider supports it. Preserve image credit and avoid confusing an annotated or cropped image with the original.
- Museum-provided 3D objects only after verifying the individual model’s license, source, orientation, units, download size and mobile performance. Cleveland exposes Sketchfab references for some objects; a link is not blanket permission to import every model.
- Place an approved scan on an inspection pedestal in the learning world with a persistent “museum object” label. Distinguish measured scan geometry from missing surfaces or illustrative reconstruction.
- Add an observation → interpretation → limitation worksheet. Only introduce museum objects into AI assessment after defining what constitutes supported visual evidence and testing failures against teacher-reviewed examples. Students must never be penalized for not knowing contextual facts absent from their packet.

## Acceptance checks

The automated tests execute the actual classroom HTTP route against SQLite: teacher addition and removal persist, repeated additions do not duplicate, learner writes and unknown IDs are refused, learner reads contain the selection, original evidence/student work remain unchanged, and no AI quota is used. Schema tests reject restricted rights, missing photographs and untrusted URLs. World parsing retains approved selections and lesson generation cannot manufacture them.

Manually verify collection filtering, readable citations, image fallback, keyboard focus, mobile layout, and teacher selection → reload → learner field journal. These objects are contextual supplements; broad live museum search, IIIF and 3D import remain future work.

## Direct object and comparison links

The object inspector now offers a reusable public link and Copy link. `/collections?object=<reviewed-id>` opens one object; adding `&compare=<second-reviewed-id>` opens the ordered pair. Links may cross topics, contain no classroom or learner data, and do not modify lesson selections. The existing investigation links retain precedence. Invalid, repeated, partial, or duplicate IDs return to normal browsing. See the expansion guide for working examples.
