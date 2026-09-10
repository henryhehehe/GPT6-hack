# Student usability review

Reviewed the student journey in the current source: joining, exploring, reading and saving evidence, writing an explanation, receiving feedback, and revising. This is a code-based walkthrough, not an observed student study or a browser playtest.

The main friction was the transition from exploration to a supported explanation. Students could open the writing panel without knowing the criteria, and returning to an earlier answer required manually copying it. A refresh also discarded an unfinished draft.

| Student question | Issue found | Improvement |
| --- | --- | --- |
| What should I do first? | The journal said to inspect an item, although reading alone did not save it. | Added a next-step card, a direct first-evidence action, and explicit instructions to choose **Save to journal**. |
| Did I save this? | Saved state depended mainly on an icon and border color. | Evidence cards now say **Saved** or **Not saved**. |
| What will my answer be judged on? | Detailed criteria appeared after the first submission. Archive requirements were vague. | Added a pre-submission explanation checklist, with subject-appropriate reasoning guidance, and the actual archive requirements. |
| Will I lose my writing? | Drafts only lived in component state. | Drafts are saved in this browser by classroom and learner, restored on return, and removed when successfully submitted and unchanged. A save-status message indicates when a draft is not saved. |
| How do I improve my answer? | The next question was tucked into a truncated dock subtitle. There was no reuse action. | Added a full revision question and **Revise my last answer**, which preserves an existing draft and restores the prior answer's scenario. |
| Which scenario am I discussing? | Argument history did not distinguish baseline and hypothetical attempts. | Added scenario labels to each attempt and the composer. |
| Why can't I submit after citing? | Programmatic citation insertion could exceed the textarea's 1,600-character limit. | Citation insertion checks available space and explains how much room is needed. |

| How do I come back tomorrow? | Opening the same invitation always offered a new join, creating a separate learner without the earlier work. | Added an explicit **Continue as…** action that validates the saved learner with the server before opening their work. Teacher previews are excluded. |
| What if I visited a different class? | Only the most recently used classroom access was remembered. | Remember access by classroom as well as the current session, with compatibility for older saved access. |
| Why did refreshing send me to the landing page? | Joining through the original invitation removed its query parameters but kept the root path, which now serves the landing page. | Both joining and resuming leave a refreshable `/studio` URL. New invitations use that route; original root invitations remain supported. |
| Is this my journal on a shared device? | The invitation did not distinguish returning work from a new learner. | Show the saved name when available, make resuming explicit, and label the alternative **Start a new journal**. |
| Did joining fail when browser storage was blocked? | An exception while remembering access could report failure after the server had already joined the learner. | Storage failures no longer interrupt successful entry; a message explains that the tab should stay open. |

Draft storage is local to the browser; it is not cross-device synchronization. Existing submitted work remains server-backed. No grading rules were changed.

Validation: the production build, TypeScript check, and all 70 current automated tests passed, including five new return-flow regressions. The previously missing asset index is now present. A local API smoke check used isolated classrooms to verify that returning after a classroom switch restores the same learner and saved evidence without creating a duplicate; both current and legacy entry routes responded successfully. No model requests were made.

Browser layout, keyboard/focus behavior, draft recovery under real navigation, and a complete live feedback turn still need a student playtest. The production build reports the existing large-client-bundle warning; load time on school devices remains unmeasured.
