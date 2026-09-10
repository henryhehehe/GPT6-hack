# Counterfactual Worlds — reviewed handoff for GPT-6 Astra

> **Start here:** [04-hackathon-winning-plan.md](04-hackathon-winning-plan.md) is the current plan, revised for a solo builder with Astra API access. It supersedes all conflicting scope, sequence, constraints, and factual assurances below. The original materials are preserved as references, not a visual ceiling or binding implementation contract. The user explicitly welcomes a substantially better Three.js experience. No production build or API benchmark has been completed during this review.

> **Review corrections:** the prototype's optional live dialogue uses a Claude-specific interface, otherwise keyword heuristics; it is not an Astra integration. Its historical assertions need source review. The current design distinguishes supported facts, interpretations, and hypothetical teaching props, accepts supported disagreement, and treats both NPC dialogue and teacher interventions as live model calls. Start implementation with an API/steering probe and deployed shell, followed by one complete argument-to-door loop.

## Original handoff (superseded where it conflicts)

You are the implementing engineer for a 13-hour hackathon build (GPT-6 Astra Hackathon NYC, 09:00–22:00 EDT, Sept 10 2026). Read the three files in this folder in order, then start with the hour-one benchmark in `01-build-plan.md §4`. Rules that bind you: all code must be written today, the repo must be public open source at submission, and the team is at most four people.

## What each file is

`01-build-plan.md` — the spec. Thesis, evidence, architecture, `WorldSpec` schema, hour-by-hour schedule, demo script, risks, and the open questions you resolve first. Treat §3 (system design) and §6 (risks, with decisions already made) as constraints, not suggestions.

`02-mockups.html` — the screens. Open it in a browser. Architecture flow, three wireframes (teacher authoring, teacher director board, student world), the spec-to-geometry contract, and a six-panel demo storyboard. Match the colour convention: teal for anything the model generates or does live, amber for the counterfactual delta and teacher actions, stone for cached geometry.

`03-prototype-before-kings.html` — a working reference implementation of one lesson, hand-built without any generation step. It runs standalone in a browser (three.js r128 from cdnjs). It shows the target *feel*: low-poly diorama, click-to-move, four sites with relics and NPCs, an evidence panel, an argument-quality bar, a reading-level toggle, role-based personalization, and a structural counterfactual lever that renders "predicted but not found" structures in amber. Its NPC dialogue is driven by a live model call when available (see `submit()` and the grounding prompt in it) with a scripted heuristic fallback. **Do not extend this file** — rebuild it as the generic runtime that reads a `WorldSpec`, and use this as the acceptance test: your runtime, given a spec describing these four sites, should produce something at least this good.

## What to build, in priority order

Build the runtime first (three.js, vanilla, reads `WorldSpec`), then the authoring call (`gpt-6-astra` → `WorldSpec` JSON, schema-validated, cached by lesson hash), then the NPC argument loop (≤60 words, returns `{reply, concedes, tags, score}`), then the teacher board (heatmap over a top-down map, stuck list, director patch as a spec *diff* broadcast over SSE), then student variants. Blender-generated hero assets are optional and only if the hour-one benchmark says they are fast and reliable; the procedural primitive kit is the plan, not the fallback.

## Non-negotiables

Generation happens at authoring time; students load from cache. The director patch is the only live generation during class and must be a diff. Every NPC belief is grounded in the pasted lesson text plus the spec's `consequences` list and nothing else. Counterfactual levers are structural (trade, institutions, seasonality), never "delete the leader". Five structure kinds, one interaction verb (talk). Pre-generate and cache every demo world before 21:00. Anything not in the plan's §3 is cut.

## Content already prepared

The prototype's site facts, relic descriptions, NPC personas and concession rules for Göbekli Tepe, Çatalhöyük, Nebelivka and Poverty Point are accurate to the current literature and to Graeber & Wengrow's *The Dawn of Everything* (ch. 8–9). Reuse them as the first cached lesson. The second demo lesson is Alexandria, 48 BCE, with the lever "grain trade collapses, 60 BCE" (see `01-build-plan.md §5` and the mockups).
