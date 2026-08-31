# CausalPilot AI — Visual Design Contract

**Accepted references**

- `design/concepts/causalpilot-results-workbench.png` — 1504 × 1046
- `design/concepts/causalpilot-import-mapping.png` — 1503 × 1046

The concepts were generated for this product and adopted as the implementation reference by the product author, **LAI ZEYU (来泽宇)**.

## Visual direction

- Theme: precise editorial research lab, not a generic SaaS dashboard.
- Background: true white `#ffffff`.
- Primary text: deep ink `#101a3d`; secondary text: cool slate `#58627a`.
- Primary evidence accent: blue around `#0b55d9`.
- Passed state: teal `#078c8c`; review state: amber `#c87500`; error state: restrained red `#b63b46`.
- Borders: thin cool slate rules; shadows are minimal and never used to turn every section into a card.
- Typography: DM Sans for application chrome and values; Newsreader for the central decision question only.
- Density: low-to-medium, with a narrow navigation rail, open analytical canvas, table bands, and one evidence inspector.

## Locked information architecture

### Results workspace

- Left navigation: Overview, Experiments, Benchmarks, Reports, Method Library.
- Header: Experiment Summary, project name, Import data, Export evidence.
- Central reading path: decision question → estimate / interval / threshold → interval chart → diagnostics → decision evidence → limitations and provenance.
- Evidence inspector: locked plan, dataset hash, plan hash, engine version, result IDs, assumptions, reproducibility action.

### Import workspace

- Four-step rail: Select file, Map fields, Validate design, Lock plan.
- Field mapping table on the left and Analysis plan inspector on the right.
- Preflight checks remain visible before the bottom action bar.
- Privacy text states that raw rows remain local.

## Component families

- App shell and navigation row.
- Primary/secondary/quiet buttons with deliberate 14 px control typography.
- Step rail, field-mapping table, diagnostic table, evidence table, inspector key/value row.
- Status indicator with icon + text; meaning never depends on color alone.
- Code-native confidence interval chart with direct labels and zero/threshold references.
- Bottom action/provenance bar.

## Chart contract

The main statistical question is whether the estimated treatment effect is distinguishable from zero and exceeds a user-defined business threshold. A horizontal confidence-interval plot is used because it preserves estimate, uncertainty, sign, and threshold in one reading path. Exact values and sample size remain visible without hover. React owns layout and state; a focused SVG component owns scales and marks.

## Responsive contract

- Desktop reference: approximately 1504 × 1046.
- Small laptop: retain navigation, main evidence, and inspector; reduce horizontal padding before hiding details.
- Mobile portrait: navigation becomes a top command bar; the primary estimate and interval plot appear first; diagnostics become rows; the inspector follows results. No hover-only evidence.

## Allowed above-the-fold copy

- CausalPilot AI
- Experiment Summary
- Project: Checkout Incentive Test
- Import data
- Export evidence
- Did the incentive create incremental conversions?
- Estimated lift
- 95% CI
- Business threshold
- Built by LAI ZEYU · 来泽宇

No decorative eyebrow, AI badge, fake usage metric, chat panel, robot, glow, or unrelated feature block may be added.
