# Alexandria clothing: construction and references

The clothing pass replaces the previous rigid skirt, oversized sash, cone sleeves and flat shoulder shawl with more detailed draped garments. It retains the fictional cast and existing interpretation of the setting.

## Design basis

- [The Met, Ancient Greek Dress](https://www.metmuseum.org/es/essays/ancient-greek-dress): a chiton is a wide garment gathered at the waist, often with excess cloth bloused over a girdle; men's versions are typically shorter. A himation is a rectangular mantle draped across one or both shoulders.
- [Walters Art Museum, Standing Draped Woman, ca. 300 BCE](https://art.thewalters.org/object/48.297/): a visual reference for vertical folds in the undergarment contrasted with diagonal and horizontal mantle folds. Sculpture is a reference for drape rather than a measured pattern or an exact reconstruction.

The intended distinctions are a practical knee-length tunic for Dorian, a long girdled chiton for Thaleia, and a long chiton with an asymmetric mantle for Ione. Garment colors, accessories and the exact drape are authored choices, not claims about named historical people.

## Integration constraints

The existing heads, individual skeletons, interaction anchors, character heights and Idle/Greeting/Talk animation clips are retained. Extra triangles are allocated to cloth silhouettes and folds, with smooth weighting at shoulders and the waist. Skinning tests and export/reimport renders check the finished clothing in motion.

The user explicitly requested more geometry to improve clothing. This expands the prior core model allowance: the three guides may use up to 6 MB combined, while core Alexandria architecture, detail bundle and guide exports may use up to 20 MB. These limits exclude separately loaded external assets and background crowds; they are download allocations, not total browser memory or a frame-rate guarantee.

## Final verification

The three replacement GLBs total 5,503,324 bytes. Core architecture/detail/guide exports now total 18,400,668 bytes before the subsequent library interior changes. The cloth uses thin double-surface geometry, dedicated matte linen/wool materials and shared torso/arm skin weights. Heads and animation clips remain intact.

The exported models were reimported for front, side and peak-greeting renders. All three clips passed cloth attachment and edge-strain checks across 17 samples each. Character hash/material/skin checks, loader/fallback tests, TypeScript and the required production build passed. This pass does not claim browser frame-rate measurements for the denser clothing.
