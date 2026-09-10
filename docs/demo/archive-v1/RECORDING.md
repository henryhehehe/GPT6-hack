# Recording the final take

Use the current [script](SCRIPT.md) and check [status](STATUS.md) before recording. The supplied MP4 is a narrated screenshot draft. Continuous footage will make movement, scenario changes, and teacher application clearer.

## Setup — about five minutes

1. Use the published app already signed in as its owner, or a verified running local build. The in-app browser blocked localhost in the first recording session; the published app worked. Do not rebuild, deploy, or restart a server while another agent is developing it.
2. Prepare one fresh Alexandria classroom. Keep **Prepared lesson** visible or put that label on the opening shot. Use the teacher's **Preview as student** identity for this version. Do not call it an independently joined learner or selected-student intervention.
3. Frame the browser content at 16:9, ideally 1920×1080 or 1280×720. The draft captures use the existing 1280×720 viewport. Hide bookmarks/devtools and keep invitation links, access tokens, clipboard contents, and unrelated windows outside the capture. Turn on Focus yourself if needed.
4. Open macOS Screenshot with **Shift–Command–5**. Choose **Record Selected Portion**, frame only the app, and set the save location to `output/demo/raw/`. Record screen and narration separately for easier editing. Start recording with a two-second handle before each action; leave two seconds after its visible result. Stop with the menu-bar stop button or **Control–Command–Escape**.
5. For narration, use QuickTime Player → File → New Audio Recording, choose the intended microphone, and read `voiceover.txt` in a quiet room. Keep the mic about 15–20 cm away, slightly to the side. Record two takes. Use the supplied synthetic voiceover for rehearsal or as a scratch track.

## Capture sequence

Record each clip to completion even when a request takes longer than its allotted edit slot. Trim waiting with an explicit **Generation wait shortened** label. Never speed up speech or falsify a model result to force the story.

| Clip | Record this actual action | Keep in the 60-second edit |
| --- | --- | --- |
| 01 Teacher | Fresh prepared Alexandria lesson, then Preview as student | Teacher view and prepared label, 0–7 s |
| 02 Explore | Student overview, a short Walk around movement if usable, then the hypothesis toggle | World and real change, 7–17 s |
| 03 First answer | Make your case; paste the initial claim from SCRIPT.md; submit and wait | Initial claim plus actual feedback, 17–26 s |
| 04 Teacher | Return to Teacher studio; request the exact challenge; wait for preview; inspect and apply | Teacher prompt, result preview, apply, 26–38 s |
| 05 Evidence | Student view; open harbor evidence and library source; save both; insert citation | Historical/scenario distinction and citation, 38–46 s |
| 06 Revision | Submit the revised explanation; wait for real feedback | Changed wording and feedback, 46–56 s |
| 07 Finish | World or concise real model activity panel | Product name and closing phrase, 56–60 s |

For clip 04, the first session's native connection failed. Use **Use standard request** until a later rehearsal verifies **Create a live intervention** plus actual correction acceptance. If steering is fixed, capture the correction while the request is running: “Use simpler language. Ask whether a new patron could support the scholars.” Label it native steering only if the UI confirms it. Never represent a standard completed request as an in-progress correction.

If the argument does not earn the expected rubric result, keep its actual feedback and revise against that feedback. A high score is not required for the film's premise. Close on the improved explanation; do not spend the final seconds trying to walk through the archive's blocked footprint.

## Editing and delivery

Use any existing editor. Set a 1280×720 or 1920×1080, 30 fps timeline to **exactly 60 seconds**. Place voiceover first, align seven clips to the script, then add concise captions. Use clean cuts; reserve a short dissolve for the end card. Keep source/provenance labels readable. Remove dead waiting with labeled cuts, not a claim of instant generation. Do not hide errors by replacing them with invented output.

Burn in captions or attach the supplied SRT. Use a simple sans-serif at roughly 30 px for 720p, no more than two lines, with a dark backing. Keep music optional and well below speech. Export H.264 MP4, AAC audio, yuv420p, fast start. Watch the exported file end to end, confirm both teacher and student are visible, check that captions do not cover the argument, and confirm the last word finishes before 60.00 seconds.

## Rebuilding the screenshot draft

The renderer uses Python/Pillow, FFmpeg, and macOS `say`. It creates a synthetic scratch voice for each timed segment, pads natural pauses, burns captions into a separate band below the untouched screenshot, and muxes a 60-second MP4. It never rewrites app screenshots or fabricates UI outputs.

```sh
python3 scripts/demo/render.py --ffmpeg /path/to/ffmpeg
```

On the current machine the bundled Python is `/Users/Chuanheng.He/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`. The temporary FFmpeg executable is `/private/tmp/hackathon-demo-deps/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1`; temporary tools may need restoring after cleanup. Set `--voice Samantha` to keep the current scratch voice. Keep Python packages outside the product dependency tree.

Continuous capture via macOS Screenshot is a manual final-take option. The available computer-use browser API exposes screenshots and UI controls, but no continuous recorder. No system permissions were changed to work around that limitation.
