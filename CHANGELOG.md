# Changelog


## 3.0.0

Neos 9 compatibility. **Breaking.**

**Breaking changes:**

- New `NodeTypes/Overrides.yaml` globally disables `Content.Hotspot` from generic
  `Neos.Neos:ContentCollection` slots — accidental placement is now prevented at the node type
  level.

**New:**

- `Molecule.ContentWithHotspots`: new `hotspotNodeTypes` prop, rendered as
  `data-hotspot-node-types` in edit mode so the JS layer knows which node types to watch.
  Useful for custom Hotspot node type implementations.
- `Hotspots` JS class: `onExternalNodeSelected` public callback fires when a node is selected
  (passes the element or `undefined`).
- `has-selected-pin` CSS class added to the container `domSection` when a hotspot is selected —
  useful for custom styling.
- German translations for all hotspot node type properties.

**Upgrade:** require `>= 9.0`. If you override `Atom.Hotspot`, replace any `*.context.inBackend`
with `renderingMode.isEdit` / `renderingMode.isPreview`.
