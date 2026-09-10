# Museum collections in Counterfactual Worlds

## Product decision

Treat a museum object as a separately attributed historical or artistic source, with explicit limits on its relevance. A photograph of an ancient coin is not a reconstruction of Alexandria; a seventeenth-century painting of the Odyssey is evidence of later reception, not an eyewitness account. Teaching prompts are our editorial material, not museum quotations.

## Delivered first version — 10 September 2026

- `/collections`: a searchable, topic-filtered, curated collection of five real Cleveland Museum of Art records, linked from the landing page.
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

The Alexandria demo adds **Compare gold & silver coins** within the existing investigation, preserving the next step into Strabo’s source. Comparison choices are temporary viewing state and never modify the classroom’s saved object selection or a learner’s answer. The classroom collection browser suggests Alexandria or The Odyssey only from the known curriculum identity, with no guesses from a custom reading’s title. Learners continue to see every teacher-selected object, including those from another topic.

## Rights and provenance contract

Cleveland releases its dataset as CC0, but only records with `share_license_status: "CC0"` provide CC0 images. We require that exact value and a supported HTTPS museum image host. Missing or restricted images fail ingestion. We do not assume a public API response gives permission to reproduce every image.

The normalized record and editorial annotations are separate fields in `lib/museums/collection.json`. We retain accession and provider identifiers, exact human-readable dates (including BCE and uncertainty), retrieval date and provider update time. External HTML descriptions are not rendered or sent to a model. No student information is sent to the museum.

`node --import tsx scripts/museums/review-refresh.ts` re-fetches only the five approved IDs with bounded timeouts and no redirects. It writes a review candidate to `/private/tmp/cw-museum-review.json`; it never silently replaces approved records. Review source/rights changes before updating the catalogue. Retired IDs should retain a historical tombstone record while old classrooms reference them.

Primary references:
- [Cleveland Open Access](https://www.clevelandart.org/open-access)
- [Cleveland API and rights fields](https://openaccess-api.clevelandart.org/)
- [CC0 dedication](https://creativecommons.org/publicdomain/zero/1.0/)
- [Gold coin, accession 1965.552](https://www.clevelandart.org/art/1965.552)
- [Royal portrait, accession 1920.1999](https://www.clevelandart.org/art/1920.1999)
- [Silver coin, accession 1916.994](https://www.clevelandart.org/art/1916.994)
- [Siren flask, accession 1928.193](https://www.clevelandart.org/art/1928.193)
- [Calypso painting, accession 1992.2](https://www.clevelandart.org/art/1992.2)

## Next delivery: more collections and teacher curation

1. Add provider adapters for The Met and the Art Institute of Chicago. Normalize each provider’s explicit rights fields independently; retain museum-specific identifiers and source links. The Met now documents paginated `/public/collection/v1.1/search`; its previous search endpoint is scheduled for retirement on 1 October 2026. Verify the API contract at implementation time.
2. Add server-side search with fixed provider endpoints, bounded queries, pagination, timeouts, rate limits and cached results. Return partial-provider failures visibly. Do not accept arbitrary fetch URLs or include classroom/student content in a museum search.
3. Let teachers search by date, culture, material and topic, review relevance, and attach an object with their own question and a location/station. Keep teacher annotations visually distinct from catalogue metadata.
4. Store immutable record revisions and teacher-selected snapshots in D1; preserve old lesson citations when museum descriptions change. A review queue can detect rights changes and remove affected displayed images. This needs schema migration and a policy for historical citations.
5. Add collections appropriate to the other lesson packets, rather than filling every world with loosely related objects. For Austen, prefer verified British domestic material from the relevant period, with explicit discussion of class and trade; broad matches for “tea” alone are insufficient.

Sources: [Met collection API](https://metmuseum.github.io/), [Art Institute API documentation](https://api.artic.edu/docs/).

## Later: close observation and 3D

- IIIF image zoom, comparison and teacher annotations where the provider supports it. Preserve image credit and avoid confusing an annotated or cropped image with the original.
- Museum-provided 3D objects only after verifying the individual model’s license, source, orientation, units, download size and mobile performance. Cleveland exposes Sketchfab references for some objects; a link is not blanket permission to import every model.
- Place an approved scan on an inspection pedestal in the learning world with a persistent “museum object” label. Distinguish measured scan geometry from missing surfaces or illustrative reconstruction.
- Add an observation → interpretation → limitation worksheet. Only introduce museum objects into AI assessment after defining what constitutes supported visual evidence and testing failures against teacher-reviewed examples. Students must never be penalized for not knowing contextual facts absent from their packet.

## Acceptance checks

The automated tests execute the actual classroom HTTP route against SQLite: teacher addition and removal persist, repeated additions do not duplicate, learner writes and unknown IDs are refused, learner reads contain the selection, original evidence/student work remain unchanged, and no AI quota is used. Schema tests reject restricted rights, missing photographs and untrusted URLs. World parsing retains approved selections and lesson generation cannot manufacture them.

Manually verify collection filtering, readable citations, image fallback, keyboard focus, mobile layout, and teacher selection → reload → learner field journal. These objects are contextual supplements; broad live museum search, IIIF and 3D import remain future work.
