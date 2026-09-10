# Live demo: a student changes their mind

Prepared September 10, 2026 against public release 26 and GitHub main `6ea7679`. This is a live presentation guide, separate from the recorded-film scripts in this folder. Timings are targets; model latency varies.

## The story

**“Students explore a world, make a claim from evidence, and revise when their teacher challenges it.”**

Use Alexandria for the main demonstration. Show the harbor and inhabited streets, a source inside the app, a teacher-directed change that reaches the student, and the student's revised reasoning. Spend four minutes on this complete learning loop. Keep other worlds and textbook upload for questions.

The opening question: **“If Alexandria loses its trade, must its community of scholars disappear?”** Ask the audience for a quick show of hands. End by returning to their answer.

## Prepare before presenting

1. Open [Teacher studio](https://counterfactual-worlds-henry.handeche49.chatgpt.site/studio) in your usual browser profile. Enter your private teacher access code off-screen. Reuse a saved Alexandria classroom; choose **Saved worlds** if necessary. Use the first Alexandria lesson, **Could knowledge survive a trade collapse?**, or the prepared Alexandria classroom.
2. Choose **Invite students**. Open its invitation in a separate browser profile or private window, and join with a fictional name such as “Demo learner.” Keep that window open. This demonstrates an actual joined learner. **Preview as student** alone does not demonstrate a separate learner connection. The public `/try` route is learner-only and is not the teacher entry point.
3. In the student window, open **Make your case**. Save this starting prediction: “If trade falls, support for scholars will fall too.” Open **Field journal** and read the source, funding assumption, and invented ledger. Save the source and funding assumption to the journal.
4. On **A community of scholars**, choose a passage from Strabo under **Choose the passage to cite**, explain its relevance, then choose **Use selected passage**. Suggested relevance: “This describes a scholarly community with shared resources. It does not identify trade as its only support.” Add a passage from the funding assumption as a separately identified assumption.
5. Submit this deliberately incomplete practice argument with **Defend your idea**: “Under the exercise's funding assumption, less trade means fewer resources for scholars. Strabo describes a community sharing resources, so a disruption to support could affect its work.” Wait for the actual feedback. Do not script or promise a particular score.
6. In the teacher window, open **Live classroom** and select **Select learner** on this learner's card. Confirm the saved writing appears. Open **Lesson notes → Teaching help** and prepare the prompt below, without submitting it yet.
7. Warm up the 3D scene in both windows. Leave the student at a good harbor view with panels closed. Rehearse **World tools → Explore the city → Library reading hall** once, then return to the harbor. Have the two windows easy to switch between; show one at full size for readable text.
8. Keep this guide's argument and revision text in a local note for pasting. Keep a separate completed rehearsal classroom available as a fallback; clearly identify it as saved work if used. Do not share credentials or invitation tokens in public slides or repository files.

The preparation uses one text-model request for the initial argument. The main live sequence uses two more: the teacher intervention and the submitted revision. The deployed pilot has six shared text requests per classroom and a separate global lifetime allowance; failed requests and steering corrections can consume allowance. Remaining availability has not been checked for this guide. Avoid repeatedly rehearsing AI calls. Generated portraits are optional and have their own quota; generate one beforehand only if desired and available. Setting-image generation is disabled in this public release.

## Four-minute run of show

### 0:00–0:30 — Start inside the world

**Screen:** Student, harbor, panels closed. Click **Walk around**, move a short distance, and drag to look at the waterfront and people. Make one deliberate camera move rather than wandering.

**Say:** “If this city loses its trade, must its community of scholars disappear? Counterfactual Worlds turns that question into a place students can investigate.”

Ask for a quick show of hands. Explain that the environment is an illustrative reconstruction.

### 0:30–1:05 — Establish what counts as evidence

**Screen:** **Field journal → A community of scholars → Text & citation**. Show the passage and provenance inside the app. Briefly show the funding card's **Scenario assumption** label.

**Say:** “The student has to separate what a source says from what our scenario assumes. Strabo describes the scholarly institution. The trade-to-funding link is an assumption they can challenge.”

Point at the selected passage and its relevance. Do not open external tabs. Saving a card and citing a specific passage are separate actions.

### 1:05–1:30 — Show the student's starting reasoning

**Screen:** **Continue your argument**. Show the saved initial explanation and one line of actual feedback.

**Say:** “I prepared this fictional learner's first attempt before the demo. They have a causal explanation, but it leaves another source of support unexplored. Watch how the teacher responds.”

Do not present the prepared submission as newly generated. Choose a feedback line that is actually on screen, even if it differs from your rehearsal.

### 1:30–2:20 — Let the teacher change the scenario

**Screen:** Switch to teacher. Show **Live classroom** with the same learner's writing. Then **Lesson notes → Teaching help**, with that learner selected. Enable **Change the scene too**, paste this prompt, and click **Create a live scene edit**:

> Keep harbor trade low and market activity unchanged. Introduce hypothetical replacement patronage so scholar support recovers. Set warm sunset lighting with clear skies and calm water, with the harbor viewpoint. State that replacement patronage is an assumption, not historical evidence. Use this learner's latest argument to ask one short question about whether declining trade necessarily means declining scholar support. Preserve the source text and saved student work.

**Say while it runs:** “Astra receives this learner's saved reasoning. The teacher is asking it for a different scenario and a question that challenges that reasoning.”

When the proposal arrives, read it before applying. Click **Preview scene in my view**, briefly show the proposed activity changes, then **Apply scene & share challenge**. Switch to the learner and allow a few seconds for the shared update.

**Say:** “The preview was private to the teacher. Now the changed scenario and challenge reach the learner, while their earlier work remains.”

Walking learners retain their camera position; do not expect the teacher's requested viewpoint to move their camera. The scene edit changes supported activity and atmosphere parameters, not arbitrary buildings or geometry.

### 2:20–3:20 — Make the learning visible

**Screen:** Student: **Teacher hint** or **Continue your argument**. Read the actual challenge. Under **Choose an earlier explanation to revise**, select the prepared explanation. Retain the selected citations, then paste or adapt this revision:

> Less trade would reduce scholar support only if that support depended on trade and no replacement appeared. Strabo describes shared resources and institutional arrangements, but does not establish trade as the only source of support. In the new hypothetical scenario, a patron could sustain the scholars despite low trade. We would need evidence about actual funding sources to decide which explanation fits.

For **What changed in your reasoning, and why?**, use:

> I changed a one-way prediction into a conditional explanation. The replacement-patron scenario exposed an assumption about funding that the source does not establish.

Click **Submit revision**. Read one concrete point from the returned feedback; do not linger on the numeric score.

**Say:** “The meaningful result is the change in the student's explanation: they can now identify the assumption, cite the source, and consider an alternative.”

If the teacher generated a different scenario or question, adapt the revision to it. The example above is a rehearsal aid, not a required student answer. Feedback is provisional; a submitted revision is not a validated measure of learning gain.

### 3:20–4:00 — Finish with classroom value and one visual payoff

**Screen:** Teacher: **Live classroom → Compare & download student work**. Show the first and revised writing. Then switch back to the student, close panels, and use **World tools → Explore the city → Library reading hall**. Take a short step through the furnished hall.

**Say:** “The teacher can see how the explanation changed and use that writing to lead the next discussion. The world gives students something to explore; the evidence and revision give the exploration a learning purpose.”

Return to the opening question: “Who would now change their answer—or say, ‘it depends on the funding’?”

The physical reading hall is freely enterable. It is separate from the argument-based archive reflection milestone.

## If a live response takes too long

- At roughly 15 seconds, explain the current learner input and point out the source/assumption distinction. Avoid narrating a spinner.
- At roughly 30 seconds, move to the saved rehearsal classroom if needed: **“This request is still running. Here is a saved run of the same flow so you can see the result.”** Keep the pending request open; do not repeatedly submit duplicates.
- If the native intervention request reports a connection failure, **Use standard request** is an available fallback. Use it only after failure and if allowance remains; it is another model request.
- If the pilot allowance is exhausted, show saved output and say so. Do not present manually changed controls or recorded footage as a fresh model response.
- If 3D walking is slow, use the destination menu and the journal's evidence buttons. The evidence and writing flow is accessible without walking.
- If a scene proposal is unsuitable, do not apply it. Teacher review is part of the flow. After an applied edit, **Undo last scene edit** and **Restore original atmosphere** are available without another Astra request.

## Sixty-second cutdown

Use a prepared initial explanation and source citation. For a recorded version, compress model waiting time transparently; do not promise the entire unedited live flow will fit a minute.

| Time | Show | Say |
|---|---|---|
| 0–10 s | Walk through Alexandria | “What happens to knowledge when a city's trade collapses?” |
| 10–22 s | Source, assumption label, saved student claim | “Students use cited evidence and distinguish it from the scenario's assumptions.” |
| 22–40 s | Teacher selects learner, requests a patron scenario, previews and applies it | “Astra helps the teacher challenge this student's reasoning by changing the shared scenario.” |
| 40–53 s | Revised explanation and teacher comparison | “The student revises a prediction into an explanation that considers another possibility.” |
| 53–60 s | Reading hall, then product name | “Explore a world. Defend an idea. Change your mind with evidence.” |

## Optional extensions for questions

Choose one based on what the judges ask; do not add all of them to the four-minute path.

- **“Can it teach English?”** Open [Worlds](https://counterfactual-worlds-henry.handeche49.chatgpt.site/worlds) and show *The Odyssey* or *Pride and Prejudice*. Explain that the same loop applies to interpretation, textual evidence, and alternative readings. The catalog has ten worlds and thirty prepared lessons; educational effectiveness still needs classroom evaluation.
- **“Can a teacher bring a textbook?”** In the studio, choose **Use your own reading**. Show the source input and review flow using [the included Pride and Prejudice sample PDF](../../public/samples/pride-and-prejudice-chapter-3.pdf). Prepare a generated result before presenting; current generation uses bounded source selections and scene templates, not a complete arbitrary 3D reconstruction of any book.
- **“Can students talk to characters?”** Use **World tools → Talk to someone → Ione**, then ask: “Does Strabo say trade paid for everything?” This uses another text request. Identify the character as a simulated guide. Reuse an existing portrait if available.
- **“Where are the real images?”** Open [Collections](https://counterfactual-worlds-henry.handeche49.chatgpt.site/collections), inspect a real museum object and its attribution, then show an observation prompt. Keep visual observations distinct from inferred historical claims.
- **“How is Astra technically integrated?”** Show the teacher's reviewed proposal, the learner basis, and preserved earlier work. Explain that model output is constrained and validated before changing classroom state. Native teacher steering uses a WebSocket; classroom state refreshes separately. Multiple students have separate work, but this is not a multiplayer avatar simulation.
- **“How did you use Astra to build this?”** Prepare one real repository diff or development record beforehand. Explain the concrete task, implementation, and verification shown there. Attribute only work supported by that record; do not rely on a general claim that “AI built everything.”

## What the demo proves

The strongest proof is observable: a real joined learner, source text inside the app, a teacher-reviewed Astra proposal, an update reaching that learner, and preserved writing that can be compared. The visuals attract attention; the changed explanation is the payoff.
