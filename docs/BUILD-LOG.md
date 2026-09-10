# Development evidence

Only completed work is recorded here. See the handoff folder for plans.

- Reviewed the original handoff, found Claude-specific optional dialogue and keyword scoring, and redesigned the contract to accept supported disagreement.
- Opened the reference in a browser: found broken text encoding, an empty opening composition, and overlapping panels. These findings informed the new layout; they are not yet claims of verified repairs.
- Confirmed the user's key can call `gpt-6-astra`: HTTP 200, response `resp_009eb1b7bafb692e006aa2c6de85a487d2a8a76d91795e0594`, 3,324 ms for a minimal greeting. This is not a latency benchmark for the full application.
- Committed and pushed setup and the one-minute teacher/student storyboard, commit `3bd68c0`.
- TypeScript compilation and first production build passed. Seven deterministic validation/scoring tests passed.
- Live API integration: instruction attack scored 0 (`resp_086080e2cc43cb7c006aa2cb2bc93887d2ac56b08f6792c8d2`, 5.7 s); supported argument scored 4 (`resp_010a86fa1e79a784006aa2cb314a0c87d29494b5c9da5b8f2a`, 7.2 s). Two examples are smoke tests, not a grading benchmark.
- Classroom integration checks passed: persistence, isolated student state, teacher-only edits, scenario updates, standard director generation, duplicate patch application, and preserved inventory/transcript/unlock.
- Native steering passed end-to-end through the app Worker: accepted mid-turn correction, phrase incorporated in the successor response `resp_0997634907708c97006aa2ccc47cb087d2931f1b2ffae0971b`, 10.9 s.
- WebMCP tools registered with expected schemas; navigation, collection, and state readback succeeded; invalid place/evidence IDs were rejected. No broad visual/browser QA was performed in this implementation pass.
- Three first-pass authoring checks passed with different interventions (no repair): trade collapse, 15.1 s; replacement patron, 15.0 s; trade recovery without restored scholar funding, 13.1 s. Library activity varied 0.4 → 0.8 → 0.3, while harbor activity varied 0.33 → 0.22 → 0.85. These are illustrative model parameters, not historical measurements.
- Fixed a state mismatch discovered in code review: a student's locally selected scenario is now sent to argument evaluation and recorded with the attempt. New authoring is blocked after submitted arguments to avoid mixing old progression with a different lesson; teacher hints remain patchable.
