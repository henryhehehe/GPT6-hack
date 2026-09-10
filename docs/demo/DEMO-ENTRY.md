# Hackathon demo entry

Open `/studio` to enter the classroom directly. No teacher code or sign-in is required to create a demo classroom. The `?lesson=` shortcut still selects a catalog lesson.

This is the intentional hackathon flow for recording and trying the app. Classroom-specific teacher and student tokens still separate each visitor's saved work.

Verified locally on 2026-09-10: `/studio` returns successfully without the teacher-code prompt, and a fresh `POST /api/classroom` with `action: "create"` and no login cookie creates a classroom with teacher access and a student preview.

## Start a recording

1. Open `/studio`. Use **Open fresh Alexandria classroom** if an earlier rehearsal is still loaded.
2. Select **Preview as student** to enter the prepared world.
3. Follow the current [demo script](SCRIPT.md) for the first claim, teacher intervention, evidence, and revised explanation. Review actual AI replies before using them in a take.
4. Share `/try` when someone only wants to explore as a student; use `/studio` to demonstrate both roles.

The latest rendered video is version 3, a new edit of the version-2 recordings with updated narration and captions. It does not show later local UI/model changes; see [recording status](README.md).

The local access rehearsal passed with `APP_URL=http://localhost:5173 node scripts/smoke-pilot.mjs`: direct classroom creation, student preview, teacher scenario propagation, invitation joins, separate student access, and evidence persistence. This check uses HTTP requests, makes no paid AI calls, and does not substitute for recording the current UI.
