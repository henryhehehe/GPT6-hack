# Hackathon demo entry

Open `/studio` to enter the classroom directly. No teacher code or sign-in is required to create a demo classroom. The `?lesson=` shortcut still selects a catalog lesson.

This is the intentional hackathon flow for recording and trying the app. Classroom-specific teacher and student tokens still separate each visitor's saved work.

Verified locally on 2026-09-10: `/studio` returns successfully without the teacher-code prompt, and a fresh `POST /api/classroom` with `action: "create"` and no login cookie creates a classroom with teacher access and a student preview.
