# Hackathon submission

Reviewed September 10, 2026, 3:13 PM EDT. Team name is proposed; feedback is drafted from documented build experience. The GitHub repository is verified public. Replace the video placeholder with a hosted link before submitting.

**Team Name**

Counterfactual Worlds

**Team Members**

Henry He (handehehehe)

**Project Description**

Counterfactual Worlds turns a reading into a place students can explore—and a question they must answer with evidence. It tackles two classroom problems: preparing engaging, source-based lessons takes time, and a finished answer can hide how a student arrived at it.

Teachers choose from 30 prepared lessons across 10 history and literature worlds, or provide a reading excerpt or PDF for Astra to assemble into a lesson. After reviewing the sources, they launch a walkable 3D investigation. Students examine passages, talk with clearly labeled simulated characters, cite evidence, and defend an explanation.

In our Alexandria demo, a student argues that lost trade must end support for scholars. Astra challenges the unsupported certainty. The teacher reviews that learner's writing and shares a targeted question; the student returns to the source and revises the argument. The teacher can compare first and latest explanations and export the work. Teachers can also redirect an in-progress Astra intervention before previewing and sharing it, preserving the student's existing work.

The prototype includes teaching guides, printable worksheets, and attributed museum objects. Source material, hypothetical assumptions, and invented teaching props remain distinct. AI feedback is provisional and inspectable. Our aim is simple: step inside a question, then come back with an argument.

**Public Project GitHub Repository**

https://github.com/henryhehehe/GPT6-hack

**1-Minute Demo Video**

[ADD PUBLIC OR UNLISTED DEMO VIDEO URL]

**Describe your use of OpenAI products to build the submitted project.**

I used GPT-6 Astra in Codex to develop and iterate on the application, including the teacher/student interfaces, Three.js environments, server routes, source-handling logic, regression tests, and debugging.

Inside the product, server-side Astra Responses API calls prepare lessons from readings, generate conditional scenarios, power source-aware character dialogue, provide argument feedback, and create teaching interventions from a selected learner's saved work. Strict JSON schemas and application validation constrain outputs; canonical source IDs preserve reviewed quotations. Native WebSocket mid-turn steering lets a teacher correct an intervention while Astra is generating it. World versions and student revisions protect existing work when updates arrive.

Astra produces structured lesson data rendered through authored 3D templates. OpenAI text-to-speech, using gpt-4o-mini-tts with the Marin voice, narrates the one-minute demo; the film discloses AI narration and edits out waiting time.

**Provide feedback from your experience using OpenAI products.**

The most useful pattern in this build was combining Astra's flexible reasoning with explicit application contracts. Structured outputs made lesson generation, dialogue, and feedback practical to integrate, while mid-turn steering gave teachers a way to shape help as it was being created.

Two concrete issues shaped the implementation. A generated lesson tried to rename source IDs, so we constrained the allowed IDs in the schema and resolved quotations from stored passages. A PDF lesson request exceeded our initial timeout; reducing repeated source text in the output and allowing a longer generation window helped, while saved drafts made retries possible.

I'd value more actionable diagnostics for schema failures and incomplete generations, plus clearer progress and recovery patterns for long document requests and steered responses. For education, inspectable sources and teacher review remain essential even when the output is structurally valid.
