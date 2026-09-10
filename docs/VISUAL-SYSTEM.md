# Counterfactual Worlds visual system

The homepage establishes the app's identity: white, ink, vermilion, Helvetica, strong rules, and compact rectangular controls. Public reading surfaces use white. The studio, student world, and immersive dialogs use charcoal surfaces so the 3D scene remains the focus. The lesson picker, museum collection, and printable teaching guide use the same light treatment regardless of their entry point.

## Shared implementation

- `components/Brand.tsx` owns the wordmark. `components/PageHeader.tsx` owns the public header and studio link.
- `app/visual-system.css` owns brand tokens, page width and gutters, shared control states, public typography, and integration with route styles. It is imported by the final shared stylesheet, `app/ui-motion.css`, so the existing development stylesheet entry also receives updates.
- Public page width is 1160px. Gutters step from 48px to 24px and 18px. Public headers use a 2px ink rule.
- Body text uses Helvetica Neue, Helvetica, Arial, sans-serif. Main copy is 16px or larger; regular controls are 14px or larger; secondary metadata is 12px or larger. Code uses a monospace face.
- Controls use a 2px corner radius. Main actions and standalone controls target a minimum 44px height. Selected controls change their surface or underline as well as their color.
- Vermilion `#d8321c` is the action color; `#bd2816` is its darker hover/link variant. On charcoal, `#ff927f` provides readable accent text and focus indicators. Error and warning treatments retain their semantic distinctions.
- Public trial introductions can grow without compressing the interactive world. The scene retains at least 700px of height with normal page scrolling.

## Review scope

Reviewed the homepage, world atlas, museum collection, model catalog, teacher studio, and public student trial at desktop and phone widths. Checked the lesson picker, source builder, teaching guide, and student evidence surfaces. Existing interaction and data flows remain intact. The teacher access component also uses the shared header and form treatment when enabled.

When adding a page, reuse the shared header and tokens. Keep scene artwork, source images, and semantic status colors independent of interface theme colors. Avoid adding another route-specific brand or theme to a shared dialog.

## Secondary workflow pass

Dialog titles share a 28px desktop / 24px mobile scale. Workspace surfaces and secondary text use shared tokens; close controls are 44px. The source builder keeps status above one compact action row, stacking the main action on phones. Saved-world search, empty states, and primary actions follow the same control scale. Character conversations use a neutral monogram fallback and readable footer actions. The student argument button preserves readable secondary text in both collapsed and expanded states.

Museum inspection and comparison use 44px zoom/reset controls, 16px reading prompts, 14px records and citations, and 12px secondary metadata. The zoom toolbar wraps on phones and the photograph has an explicit keyboard focus outline.
