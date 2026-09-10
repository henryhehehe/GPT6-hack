# Scene recovery

Teachers can undo the last scene edit or restore the authored atmosphere in Teaching help. Reset removes the visual override and retains activities and the current challenge. Undo is one level, including undoing an atmosphere reset; edits made before this deployment have no undo checkpoint. Atmosphere reset still works for those classes.

Recovery uses no model request or AI quota. The server stores only scene-owned fields, prior scenario and the prior teacher hint. It restores the prior challenge only if the teacher has not shared a newer one. Museum selections, sources and learner progress are preserved. Checkpoints stay private to teacher snapshots, and new lesson generation clears them. Requests require teacher authentication and the current classroom version; a repeated completed request is idempotent.

Validation covers actual classroom handlers and the built Worker with isolated data and no real model calls, including stale requests, learner denial, private metadata, exact scene restoration and unchanged student work.
