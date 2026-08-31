# CausalPilot AI Visual Fidelity Ledger

Reviewed: 2026-08-31  
Product and evidence owner: **LAI ZEYU (来泽宇)**

## References and captures

- Accepted results concept: `design/concepts/causalpilot-results-workbench.png`
- Accepted import concept: `design/concepts/causalpilot-import-mapping.png`
- Browser results capture: `design/qa/results-workbench-1504x1046.png`
- Browser import capture: `design/qa/import-mapping-1504x1046.png`
- Mobile capture: `design/qa/results-mobile-390x844.png`
- Packaged local-engine capture: `design/qa/packaged-local-engine-result.png`
- Machine-readable browser check: `design/qa/visual-smoke-report.json`
- Machine-readable packaged check: `design/qa/packaged-e2e-report.json`

The accepted concepts and all latest captures were visually inspected at original detail. Browser captures were made in Google Chrome through `playwright-core`; the packaged capture came from the real Electron application through the packaged end-to-end harness.

## Fidelity comparison

| Point | Accepted direction | Implemented result | Status |
|---|---|---|---|
| 1. Shell and reading path | Narrow left rail; open white analytical canvas; question → estimate → uncertainty → diagnostics → evidence | Same left rail, full-width evidence canvas, and reading sequence at 1504 × 1046 | MATCH |
| 2. Typography | DM Sans for application chrome and numbers; Newsreader only for the central decision question | Font files are bundled locally and used in exactly those roles | MATCH |
| 3. Palette and semantics | True white, deep ink, blue evidence accent, teal pass, amber threshold/review, thin cool rules | Tokens and screenshots preserve the palette; every status also includes icon and text | MATCH |
| 4. Interval plot | Horizontal 95% interval with estimate dot, direct values, zero, threshold, and direction labels; no hover-only evidence | Code-native SVG renders all values and references directly; mobile uses a dedicated compact SVG rather than clipping or horizontal overflow | MATCH / RESPONSIVE ADAPTATION |
| 5. Diagnostics | Four visible diagnostics in a ruled evidence band | The frozen example preserves those four checks; a real local-engine result adds the implemented binary-information check and reports five checks in total | MATCH / EVIDENCE EXTENSION |
| 6. Decision table and inspector | Group evidence table plus a right-side provenance inspector | Rates/counts, p-value, dataset hash, plan hash, engine version, result ID, assumptions, and export action are visible | MATCH |
| 7. Import structure | Four-step rail, mapping table left, analysis plan right, preflight table, sticky action bar | Same structure and order, including local-data notice and random-assignment attestation | MATCH |
| 8. Authorship | LAI ZEYU / 来泽宇 visible in the shell and evidence ownership | Visible in the sidebar, inspector, footer, About panel, app metadata, and exported evidence | MATCH / STRENGTHENED |
| 9. Responsive behavior | Navigation becomes a top control; evidence remains readable with no hover dependency | At 390 × 844 the drawer control, metrics, complete interval plot, and stacked diagnostics remain within the viewport width | MATCH |

## Intentional evidence-integrity deviations

1. The implemented results screen adds **“Synthetic worked example” / “Local analysis”** and a run ID above the decision question. This was not decorative copy; it prevents a synthetic demonstration from being misrepresented as real organisational evidence.
2. The accepted concept used illustrative values (`+2.1 pp`, 40,152 units). The application shows values produced by the frozen 16,000-row synthetic dataset and local engine (`+2.6 pp`, with CUPED deliberately disabled in the v0.1 UI). Concept numbers were never copied into runtime evidence.
3. The implemented header retains **Analyzed units** as a fourth metric on wide screens because sample size materially changes statistical interpretation.
4. The generated sample exposes four necessary, non-personal columns rather than the concept's illustrative email/timestamp fields. This keeps the distributable example free of even fictional PII-like fields while retaining unit, assignment, outcome, and pre-treatment covariate roles.
5. Mobile uses a vertically spaced compact interval plot with only minimum, zero, and maximum axis ticks. Estimate, CI endpoints, zero, threshold, and direction remain directly labelled.

## Recorded checks

- Desktop viewport: 1504 × 1046; no horizontal overflow.
- Mobile viewport: 390 × 844; no horizontal overflow; mobile navigation control visible.
- Browser console errors: 0.
- Packaged renderer console errors: 0.
- Packaged app metadata reports macOS `arm64`, packaged mode, offline local engine, and author **LAI ZEYU (来泽宇)**.

No remaining visual mismatch was classified as release-blocking for the English v0.1.0 MVP.
