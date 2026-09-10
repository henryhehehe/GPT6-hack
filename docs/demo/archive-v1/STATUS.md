# Demo status and next check-in

Version 1 · September 10, 2026, approximately 13:30–13:46 America/New_York. This is a recording work log, not a product acceptance review.

## Verified in this session

- Created the active **Keep hackathon demo current** heartbeat, ID `keep-hackathon-demo-current`, every 30 minutes in this task. Quiet when unchanged; notify for material script/video improvements, demo regressions, completion, or needed user action.
- Read the docs, original handoff storyboard, README, and latest independent-review implementation plan. Older documents contain superseded findings; build-log additions and observed UI take priority for this draft.
- Published target: `https://counterfactual-worlds-henry.handeche49.chatgpt.site/`. Owner-authenticated page accessible. Created a fresh prepared Alexandria classroom through the UI, preserving the prior classroom in storage.
- The in-app browser blocked `http://localhost:5173` with `ERR_BLOCKED_BY_CLIENT`; did not bypass it. Recorded the accessible published app instead. No product files, deployment settings, or existing server processes were changed for the demo.
- Used both Teacher studio and the same teacher's Preview as student. Exercised baseline/hypothesis toggle, initial argument, actual Astra feedback, standard teacher preview/application, source reading/collection/citation, revised argument, and model inspector.
- Initial argument received 1/4. Revised argument received 4/4. Exact inputs and actual text outputs are in SCRIPT.md. This is one scripted example, not a semantic benchmark or measured learning gain.
- Native **Create a live intervention** failed with “Live steering connection unavailable. Use the standard intervention button.” Standard request completed, produced “Fewer ships—what about support?”, and applied to the same student world. The current script does not claim native steering.
- Saved `ledger`, `funding`, and `strabo`; citation action inserted `[Strabo, Geography 17.1.8]`. The historical source reader visibly distinguished excerpt and paraphrase. Applied teacher hint remained available after collecting evidence.
- The inspector identified `gpt-6-astra`, **Prepared teaching fixture**, world version 2, and last argument 7.5 s. Actual final response ID: `resp_0e6226db0bb6d3af006aa2ebd25fc487d2a9104f98142cc204`. This is one UI-reported request duration, not a full-workflow latency measurement.
- Browser captures are 1280×720. A contact sheet was inspected; the on-demand conversation has a compact, scrolling transcript. Continuous final footage should deliberately scroll to the relevant feedback text instead of relying on automatic framing.
- The browser API provides screenshots but no continuous recorder. The deliverable is transparently labeled a screenshot walkthrough with synthetic narration. Smooth screen footage is still a separate final-take task.

## Freshness and limits

Initial local HEAD was `0928decadd9b1d64c9e1dd85cd3c8ccda8842ef4`, with active uncommitted feature work. During recording it advanced to `c56f2f8dac4706772be87e352c9974435dffc700`. The published app's exact source commit was not established; do not equate either local SHA to these captures. Recordings must be rechecked after deployment changes. Preserve all concurrent product edits.

This version does not exercise uploaded-source generation, generated setting images, full walking navigation, a separately invited learner, selected-learner context, formal prediction/reflection fields, a before/after comparison screen, reconnect behavior, or an enterable archive. Their presence must be independently checked before adding them to the script. The existing independent review is diagnostic, not final sign-off.

The renderer's first sandboxed speech request produced empty audio. Its render was stopped, oversized temporary output removed, and an explicit empty-audio guard plus duration bounds added. An approved macOS speech-service call produced nonempty audio. No product dependency files were changed; temporary FFmpeg lives under `/private/tmp/hackathon-demo-deps`.

## Next 30-minute pass

1. Compare docs, latest commit, and working tree with this log. Identify the published build if possible. Do not infer deployed features from new local code alone.
2. Recheck the current demo flow where changed. Prioritize native steering, selected-learner context, source/revision UI, source import, setting-image mode, and archive payoff.
3. If importing a passage is now the strongest reliable opening, rehearse the whole lesson from that input before replacing Alexandria. Keep teacher review and source provenance visible; do not splice unrelated classrooms into one implied workflow.
4. Update SCRIPT.md, timeline.json, voiceover.txt, captions.srt, and the video together. Preserve prior captures/version information when changing the story. Never mark the recording current just because narration was edited.
5. When continuous capture becomes available, use RECORDING.md and the same real UI flow. Keep generated waits as labeled cuts and capture actual outputs.
6. Stay quiet if the story and working behavior have not materially changed. Report blockers with the exact observed symptom and a viable fallback.

No independent final review has been commissioned in this demo-preparation pass. No classroom-pilot or release-readiness sign-off is implied.

## Delivered render verification

`output/demo/counterfactual-worlds-60s-draft.mp4` rendered successfully: **60.00 seconds**, 1,800 frames, 1920×1080, 30 fps, H.264/yuv420p, AAC mono at 48 kHz, approximately 3.45 MB. Full audio/video decode completed without errors. The separate voiceover is exactly 60 seconds, with nonempty speech in every scene; all seven segments use Samantha at the 150 wpm synthesis setting. Measured encoded audio peak is −1.9 dBFS, mean −16.9 dBFS. No music is included.

Inspected the original capture contact sheet, all 14 captioned composition cards, and the source-reader composition at full size. Captions sit in a separate band and do not overwrite the captured app. The closing narration was shortened to “Counterfactual Worlds makes reasoning visible.” The script, clean narration, SRT, timeline, and renderer agree. Technical audio validation is complete; a subjective listening pass by the presenter remains useful before submission.
