# Character conversation recovery

September 10, 2026. Follow-up to the original independent review's session-recovery requirement, based on published release `252c375d820264ddacc1a8a04d800e6e85fee2c8`.

Character conversation storage previously swallowed read/write errors while its fallback failure message claimed that the question was saved. The question and retry ID were separate records, and recovery did not check source identity.

Conversation drafts now save text and retry identity together, display storage failures, and retain editable in-memory work. A failed send reuses its request ID; success clears only the submitted text and preserves newer typing. Recovery is scoped to classroom/learner, character, scenario, and source material. An obsolete response cannot overwrite a question entered for a newer source version. The conversation remounts when this context changes, keeping old response/error state out of the new context.

Pre-upgrade unsent questions and matching pending request IDs are preserved with an explicit notice to check current sources. No legacy records are deleted. After a successful submission the new empty record prevents the older question from reappearing.

Validation: all 137 deterministic tests passed; after refining legacy retry migration, all six affected recovery tests passed again. Full TypeScript checking and the official Sites production build passed. No model requests, production data changes, or browser playtest were performed. This change still requires integration into the next published release; it does not change version 13 already deployed.
