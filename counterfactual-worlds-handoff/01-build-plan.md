# Counterfactual Worlds — Build Plan

> Original concept retained for reference. [04-hackathon-winning-plan.md](04-hackathon-winning-plan.md) is the reviewed solo execution plan and supersedes this document's scope, schedule, architecture, scoring, and demo sequence. Historical and research claims below remain leads to verify.

*Lesson plan in, playable world out. GPT-6 Astra Hackathon NYC, Sept 10 2026 (9:00–22:00 EDT). Prepared for Astra to review and implement.*

## 1. The thesis in one paragraph

A history teacher pastes tomorrow's lesson, picks one counterfactual ("the Library of Alexandria never burns"), and Astra builds a small explorable 3D world that follows from it — geometry, NPCs, what those NPCs believe, and the causal rules that decide what the student's choices do. Every student opens a version tailored to their reading level and interests. Students don't memorize dates; they defend a causal claim to NPCs who argue back. The teacher sees not scores, but *where in the world* students got stuck.

The evidence behind each design choice is real and recent. Digital game-based learning shows a moderate positive effect on achievement (Hedges g = 0.667 across 33 studies; immersive games 0.583; interventions under a week 0.953 — good news for a demo-length experience) ([Wang et al., 2022](https://link.springer.com/article/10.1186/s40594-022-00344-0)). Counterfactual reasoning is something students already reach for: 114 of 139 Swedish upper-secondary students used it unprompted when asked to weigh a cause, and those who manipulated *structural* factors (economy, institutions) rather than removing an individual produced markedly stronger causal arguments ([Wendell, 2020](https://files.eric.ed.gov/fulltext/EJ1343019.pdf)) — so our counterfactual picker should offer structural levers, not "delete Napoleon." Interest-based personalization improves efficiency and cuts off-task behavior, but only when the *depth* of personalization matches the student — surface personalization for casual interests, deep for serious ones ([Walkington & Bernacki, 2019](https://link.springer.com/article/10.1007/s40593-018-0168-1)). And the teacher dashboard is a straight application of Shute's stealth assessment: define competencies, map observable in-game actions to them via an evidence model, never interrupt play with a quiz ([Shute, Lu & Rahimi](https://files.eric.ed.gov/fulltext/ED612156.pdf)).

## 2. What Astra is actually good at, and how that shapes the architecture

Two facts from the launch coverage decide the design. First, Astra drives Blender by *writing bpy Python, rendering frames, and self-correcting* — an agent loop that takes minutes to hours per asset, is strongest on architectural and geometric forms, and is weaker on organic ones ([Neural4D](https://blog.neural4d.com/neural4d/gpt-6-astra-3d-modeling/)). Second, the most convincing public demos are *browser-native* procedural scenes — a SimCity-style city builder, a procedurally regenerating city, a walkable planet — with buildings that "held up to close inspection" ([MindStudio](https://www.mindstudio.ai/blog/gpt6-astra-3d-generation-demos)). Full Unreal/Unity pipelines, by contrast, ran 12+ hours and shipped as "rough first drafts" ([MindStudio workflow](https://www.mindstudio.ai/blog/gpt-6-astra-video-game-development)).

So: **the world is generated as code, not as mesh files.** Astra emits a scene spec plus procedural three.js geometry (extruded footprints, colonnades, arches, terraces — exactly the architectural forms it's strong at). No asset pipeline, no importers, nothing to break at 9 p.m. Blender is used for at most one or two hero landmarks, generated early and cached, and is not on the critical path. Generation runs at **authoring time** (teacher configures the class while Astra works for 60–120 s), so students get an instant load. Rules require all code be written today and published as a public OSS repo — no pre-built runtime — so the schedule below starts from zero.

## 3. System design

**Three services, one repo.**

**Author** (Next.js page + one API route). Teacher pastes lesson text, picks grade band, and chooses a counterfactual from three Astra-proposed *structural* levers ("Alexandria's grain trade collapses" rather than "Caesar dies"). Astra (`gpt-6-astra`, standard mode; fast mode only if latency bites) returns a `WorldSpec` in one call, then a second call per student cluster produces `StudentVariant`s. Specs are cached in SQLite/KV keyed by lesson hash.

**Runtime** (static three.js app, vanilla JS, no bundler required). Loads a `WorldSpec`, builds geometry procedurally from the spec's primitives, spawns NPCs, runs the dialogue/argument loop against Astra via a thin server proxy, and streams `TelemetryEvent`s. Third-person orbit camera, click-to-move, one screen of UI. Target: 30–60 s of walking end to end, 5–8 buildings, 3–4 NPCs, stylized flat-shaded low-poly with one directional light. This is a diorama, not an open world — that constraint is what makes it reliable.

**Teacher board** (same Next.js app). Live heatmap of student positions over the world's top-down map, a "stuck" list (students idle > 45 s at one NPC or repeatedly failing the same claim), and one **director prompt box**: the teacher types "too easy, add a rival faction" and Astra patches the spec; connected students hot-reload. This is the stage moment.

```jsonc
// WorldSpec (abridged) — the contract between Astra and the runtime
{
  "title": "Alexandria, 48 BCE — the Library survives",
  "counterfactual": { "lever": "structural", "change": "...", "consequences": ["...", "..."] },
  "terrain": { "size": [120, 120], "heightmap": "procedural:coastal", "palette": ["#e8d8b0", "#7fa9c9"] },
  "structures": [ { "kind": "colonnade", "footprint": [[0,0],[24,0],[24,8],[0,8]], "height": 9, "style": "hellenistic" } ],
  "npcs": [ { "id": "librarian", "pos": [12, 0, 4], "belief": "...", "argues_from": "structural",
              "concedes_if": ["student cites trade dependency", "student compares to Pergamon"] } ],
  "competencies": ["causal_reasoning", "evidence_use", "structural_vs_actor"],
  "evidence_rules": [ { "on": "claim_submitted", "if": "cites_structural_factor", "credit": "structural_vs_actor" } ],
  "win": { "type": "defend_claim", "to": ["librarian", "merchant"], "min_evidence": 2 }
}
```

`StudentVariant` overrides only `readingLevel`, `interestHook` (surface or deep, per Walkington), NPC name/voice, and one extra consequence tied to the student's interest. The world stays shared; the framing changes. `TelemetryEvent` is `{student, t, pos, npc?, action, claim?, outcome}` — enough for the heatmap and the evidence rules, nothing more.

## 4. Build schedule (13 hours, team of up to 4)

**09:00–10:00 — Benchmark before committing.** Run 10 `WorldSpec` generations from three different lesson pastes. Measure p50/p95 latency, JSON validity rate, and eyeball whether the procedural geometry reads as a place. If p95 > 3 min or validity < 80%, shrink the spec, don't add retries. Decide here whether Blender hero assets are in or out.

**10:00–13:00 — Runtime and spec.** One person on the three.js builder (terrain, structure kinds: `box`, `colonnade`, `dome`, `wall`, `steps`; camera; click-to-move). One on the Astra prompt + JSON schema validation + caching. One on the NPC argument loop (system prompt carries `belief`, `argues_from`, `concedes_if`; responses capped at 60 words; the model also emits `{concedes: bool, evidence_tags: []}` for telemetry). One on Next.js scaffolding, telemetry endpoint, and repo/README hygiene (public OSS is a rule).

**13:00–16:00 — Teacher board and director loop.** Heatmap, stuck detector, director prompt that produces a *spec diff* (never a full regen — smaller, faster, safer), client hot-reload over SSE. Student variants wired in.

**16:00–19:00 — Content and polish.** Lock one hero lesson (Alexandria) and one backup (Ottomans at Vienna, 1683). Tune NPC prompts until they concede on good arguments and push back on lazy ones. Post-processing pass on visuals: fog, vignette, warm key light — cheap and worth a lot on a projector.

**19:00–21:00 — Demo hardening.** Pre-generate and cache all demo specs. Kill switch to a cached spec if the live director call fails. Rehearse the 3-minute script twice with a timer. Record a backup video.

**21:00–22:00 — Submit.** Repo public, README with architecture diagram and the citations above, 90-second video, live URL.

## 5. Demo script (3 minutes, judged by investors)

Open on the teacher pasting a real lesson (0:00–0:20). Choose the structural counterfactual, hit generate, and while it runs, state the thesis and the market: the U.S. spends heavily on curriculum content that students find inert; a teacher-directed, self-personalizing world is a new content format, not a quiz skin (0:20–1:00). Cut to a student view — the world is already cached — walk to the librarian, make a weak claim, get pushed back; make a structural claim, get a concession (1:00–2:00). Cut to the teacher board: heatmap, two students stuck at the merchant; teacher types "give the merchant a ledger the students can read," the world updates live on the student screen (2:00–2:40). Close on why now: only a model that reasons about causation *and* writes the geometry can make the content format itself generative (2:40–3:00).

## 6. Risks and the decision already made for each

*Generation latency spikes on stage* → all demo worlds pre-generated; live generation is only shown for the director patch, which is a small diff. *NPCs hallucinate history* → every NPC belief is grounded in the lesson text pasted by the teacher and the spec's `consequences` list; the prompt forbids facts not present in either. *Personalization feels gimmicky* → follow Walkington: interest hooks change framing and one consequence, never the underlying history; deep hooks only where the teacher marks a student as seriously engaged in the interest. *Scope creep into "a real game"* → the runtime supports exactly five structure kinds and one interaction verb (talk). Anything else is cut. *Judges are VCs, not teachers* → lead with the content-format argument and the teacher-as-director moment; the pedagogy citations live in the README as ballast, not in the pitch.

## 7. How effective should we expect this to be?

Be honest in the pitch: we won't have learning-outcome data by 10 p.m., and the game-based-learning literature is more sober than its headlines. The two most rigorous meta-analyses find serious games beat conventional instruction on learning (d = 0.29) and retention (d = 0.36) but are *not* significantly more motivating (d = 0.26, n.s.) ([Wouters et al., 2013](https://eric.ed.gov/?id=EJ1008015)), and that design quality matters more than the medium ([Clark, Tanner-Smith & Killingsworth, 2016](https://journals.sagepub.com/doi/10.3102/0034654315582065)). So "kids will love it" is the weakest claim we could make; "it targets causal argument and evidence use, and assesses them without a quiz" is the strong one. What we can say is where this sits relative to the evidence. The mechanisms we're combining each carry a measured effect. Digital game-based learning versus traditional instruction is a moderate positive, g ≈ 0.56–0.67, and the effect is *largest for short interventions* (under a week, g = 0.95) and in science (g = 0.75) and primary grades (g = 0.84) ([Wang et al., 2022](https://link.springer.com/article/10.1186/s40594-022-00344-0)). Interest-personalized problems in an intelligent tutor raised corrects-per-minute and cut off-task "gaming" behavior, with roughly 16% improvement for students whose personalization depth matched them ([Walkington & Bernacki, 2019](https://link.springer.com/article/10.1007/s40593-018-0168-1)). Stealth-assessment scores in Physics Playground correlated with external physics tests and students improved pre-to-post while rating enjoyment ~4/5 ([Shute et al.](https://files.eric.ed.gov/fulltext/ED612156.pdf)).

Where this project should beat those baselines: the counterfactual frame targets *causal argument*, which is the skill history teachers say they can't assess with quizzes, and NPCs who push back turn every session into a formative assessment of justification, not recall. Where it may underperform: novelty wears off (the same meta-analysis shows effects shrink past three months), and the 3D layer adds cognitive load for students with weaker spatial or reading skills unless the variant system actually lowers text density for them. The measurable claim we can make on stage: a within-session **argument-quality delta** — score the student's first claim to an NPC and their last, using the same evidence rubric. If Astra's evidence rules are working, that delta is the demo's one number.

## 8. How teachers and students use it differently

**Teacher, night before (5 minutes).** Paste the lesson or a textbook section. Choose the grade band. Astra proposes three structural counterfactuals with a one-line rationale each; the teacher picks one, or edits it. The teacher then sets the *learning target* — the one causal claim students should be able to defend — and optionally tags students with an interest (from a roster import or a one-question form students filled in earlier: "what do you spend your weekends on?"). Astra generates, the teacher walks the world once in preview, and can right-click any NPC to edit its belief. Share link goes out.

**Teacher, during class (director mode).** The board shows the top-down heatmap, each student's current NPC, and a "stuck" column. The teacher never has to look at a game screen. Three verbs: **nudge** (send one student a hint in the world — an NPC turns to them), **patch** (type an instruction, Astra diffs the spec, everyone's world updates), and **freeze** (pause all worlds and project one student's argument transcript on the board for a class discussion). Post-class, the board exports an evidence report per student: which competencies were shown, quotes of their strongest and weakest claims, and the moments they got stuck.

**Student (15–25 minutes, in class or at home).** Opens a link, no account. The opening screen is a one-paragraph brief written at their reading level, with their interest hook woven into the framing — a student who skateboards arrives at Alexandria as a courier who knows every street; a student into cooking arrives as the harbor cook who hears what the grain ships bring. They walk, talk to NPCs, and collect *evidence tokens* (a ledger, a letter, an inscription) by asking the right questions. The end state is defending the target claim to two NPCs who argue from different positions. A student can retry a failed argument immediately; a student who finishes early gets a second counterfactual lever unlocked. At home, the same link works solo, and the NPCs take over the teacher's nudge role.

The asymmetry matters: the teacher controls *the world and the target*; the student controls *the argument*. Neither can do the other's job, which is what keeps the teacher in the loop instead of replaced.

## 9. Other subjects where this transfers

The pattern is "change one structural variable, walk through the consequences, defend a claim." It maps cleanly onto anything with a causal model.

**Physics and earth science** are the strongest second act, and the evidence is strongest here (science g = 0.75). Change a constant — gravity, the speed of sound, the tilt of Earth's axis — and the world is rebuilt to be consistent with it; puzzles are only solvable if the student has actually internalized the law. This is the Physics Playground lineage, with Astra generating the level instead of a designer.

**Economics and civics.** "The town removes rent control" or "the council doubles the sales tax": the world is a market square, and the NPCs are a landlord, a tenant, a shopkeeper, and a mayor with different stakes. Students defend a policy claim to people who lose from it. Same engine, different spec.

**Philosophy and ethics.** Not a counterfactual world but a scenario world: the student's choice is fed to NPCs who argue from Kant, Mill, and Aristotle, and the evidence rules score whether the student's justification is consistent across two dilemmas. Ethics is where multiple-choice is worst and argument-grading is most valuable.

**Biology and ecology.** Remove an apex predator, introduce an invasive species, change rainfall; the biome regenerates and the student has to explain the trophic cascade to a rancher and a park warden.

**Literature.** Walk the setting of the novel with a structural change — the family's fortune isn't lost — and interrogate characters about how their choices change. Lower priority: the "causal model" is authorial, not empirical, so argument-grading is softer.

Weakest fits: procedural math and grammar, where the skill is fluency rather than causal argument. Don't pitch those.

## 10. Demo ideas — things you can see from the back of the room

**The paste-to-world reveal.** Teacher pastes a real lesson; a top-down wireframe of the city draws itself in real time as the spec streams in — footprints, then walls, then the colonnade rising. Twenty seconds of geometry appearing is worth more than any slide. (Stream the spec, build incrementally; don't wait for the full JSON.)

**Two worlds, one lever.** Split screen: left is Alexandria as history recorded it, right is the counterfactual. Same street grid, but the right side has a second library wing, a busier harbor, and an NPC who exists only there. Toggle the lever live and watch the buildings appear and disappear. This visualizes the thesis without a word of explanation.

**The argument that changes the world.** A student makes a strong structural claim to the librarian; the librarian concedes, and a locked door in the archive opens. A weak claim, and the door stays shut. Making argument quality *physically visible* is the single best five seconds of the demo.

**Heatmap to patch.** On the teacher board, dots cluster at the merchant. Teacher types "give the merchant a ledger." Cut to the student view: a scroll appears on the merchant's table, the merchant turns to the student. That round trip, in under ten seconds, is the "teacher as director" proof.

**Thirty students, thirty framings.** A grid of thirty thumbnails of opening screens, each with a different NPC name and interest hook, all the same world. Shows personalization at a glance; costs nothing to render.

**Break-the-universe teaser (if time).** A closing ten seconds: same runtime, physics lesson, gravity set to 3 m/s². A ball arcs impossibly high over the colonnade. Signals the platform, not the feature.

Pick three for the live run: reveal, argument-opens-door, heatmap-to-patch. The rest go in the video.

## 11. Open questions for Astra to resolve in the first hour

Whether to emit geometry as declarative primitives (safer, our default) or as generated three.js code (more expressive, riskier to sandbox). Whether fast mode is worth 2× cost for the director loop only. Whether one Blender hero asset — the Library itself — can be generated and exported to glTF within 20 minutes; if yes, it becomes the demo's centerpiece and the pitch's proof of Astra's 3D ability, if not, it's out and the procedural colonnade carries the scene.

---

*Model and pricing per [OpenAI](https://openai.com/index/gpt-6-astra/) and [Simon Willison](https://simonwillison.net/2026/Sep/3/gpt6-astra/): `gpt-6-astra`, $10/M input, $50/M output, fast mode 2× speed at 2× price. Event rules per [Cerebral Valley](https://cerebralvalley.ai/e/openai-gpt-6-astra-nyc): 09:00–22:00 EDT, teams ≤ 4, all code built during the event and published as a public open-source repo.*
