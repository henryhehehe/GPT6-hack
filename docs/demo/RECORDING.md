# Record or rebuild version 5

Current deliverable: `output/demo/v5/counterfactual-worlds-60s.mp4`.

## Capture

V5 used a fresh, isolated Playwright browser context in headless Chrome, recording its own 1728×972 viewport continuously. All actions used the app’s ordinary interface. The recording used no signed-in browser profile, recovered credentials, or substituted model responses. This keeps the capture independent of the user’s other Chrome windows. Native computer-use control was unavailable during this session; macOS window capture remains a previously authorized fallback.

The source was frozen in `/private/tmp/cw-demo-v5` at approximately 19:07 UTC on September 10, 2026, and served at `http://127.0.0.1:5179`. Ongoing product edits after that snapshot are not represented automatically. A fresh classroom was created from the first Alexandria catalog lesson. The existing teacher preview was used as a clearly labeled practice learner. Three real model requests produced the initial feedback, teaching-help preview, and revised feedback.

`scripts/demo/capture-browser.mjs` contains the isolated recorder used here. Use `--output` with a new version directory; `--url`, `--playwright`, `--chrome`, and `--command-dir` configure another machine. Launch it with Node, then submit ordinary Playwright UI operations with `send-browser-command.py`. Its `--close` flag finalizes the recording. Example: `node scripts/demo/capture-browser.mjs --output output/demo/v6 --url http://127.0.0.1:5179/`. Finish with `python3 scripts/demo/send-browser-command.py "page.demoMark('end'); return page.url();" --close`. Capture pauses around each useful state and mark their times; inspect actual video frames before choosing cuts.

## Rehearsal

1. Show the landing page, browse the thirty prepared lessons, review the first Alexandria lesson’s sources, and launch.
2. Open Museum objects and add the real Arsinoe II coin to the class. Show the museum imagery and attribution.
3. Preview as a student, explore Overview and Walk around, switch the scenario, and open the investigation journal.
4. Read Strabo and the invented ledger, save evidence, and submit the first answer in SCRIPT.md. Wait for actual feedback.
5. Return to Teacher studio → Lesson notes → Teaching help. Select the practice learner, enter the request, use the standard request path, review the generated preview, and share it with the class.
6. Return to the practice learner’s preserved work, revise, and submit. Wait for actual feedback.
7. Open the learning report and include practice work. Download the report. Also download the teaching guide and worksheet. Record those actual local documents and finish on the city.

This build repeatedly remounted open dialogs during classroom polling, making the on-screen report unstable. The film therefore shows the app’s actual exported report, labeled as downloaded; both submissions and the context-change marker are preserved. Exported text documents work offline. They do not establish offline support for live AI or the 3D app.

## Voice and music

The main narration and mission pickup use OpenAI speech generation with Marin. A verified v4 closing pickup supplies the complete final line, which the first v5 main take omitted. The editor preserves natural delivery within paragraphs and positions the mission at 50.1 seconds and the closing at 53.7 seconds.

For a personal voice take, record in a quiet room, microphone 15–20 cm away and slightly off-axis. Read `voiceover.txt` conversationally, pause after the opening test, and give the revised claim emphasis. Keep a little silence between paragraphs for editing.

```sh
node scripts/demo/narrate.mjs output/demo/v5 output/demo/v5/voiceover-main.txt
python3 scripts/demo/music-v5.py
python3 scripts/demo/edit-v5.py --ffmpeg /path/to/ffmpeg
```

Preserve the verified WAVs before regenerating. Narration commands use existing local API configuration. The edit reads `edit-input.json`, uses actual source offsets, and writes a full edit decision list, SRT/ASS captions, mixed audio, and an H.264/AAC 1080p film. Use `--reuse-shots --reuse-picture` when only captions or mixing change; these flags require the existing prepared shots and picture edit. Never infer a model result from an expected script: review actual submissions and feedback before using a take.
