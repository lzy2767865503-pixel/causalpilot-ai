# Microsoft Store Windows screenshot plan

**Store product:** CausalPilot AI by LAI ZEYU  
**Installed application:** CausalPilot AI 0.1.0  
**Author shown in the product:** LAI ZEYU (来泽宇)  
**Status:** Capture plan only; existing macOS/browser images are not Windows Store evidence

## Capture specification

- Capture the exact final Windows Store candidate on a Windows 11 x64 test environment.
- PNG, 1920 × 1080 preferred; never below 1366 × 768; each file below 50 MB.
- Capture the application UI without desktop notifications, personal filenames, developer tools, test overlays, cursors covering important content, or unrelated windows.
- Use only the built-in synthetic experiment.
- Do not add marketing text, badges, logos, borders, device frames, or decorative overlays.
- Keep all critical UI in the top two-thirds because Store overlays can cover the lower third.
- Do not show unimplemented modules as working.
- Preserve the capture machine/version, package hash, capture command/tool, and image SHA-256 in the Windows release record.

## Required order and captions

### 01 — Overview

File: `01-overview-windows-1920x1080.png`

Caption (130 characters):

> Start with the built-in synthetic experiment or import a local CSV for a declared randomized A/B analysis. No account is required.

### 02 — Import and field mapping

File: `02-import-mapping-windows-1920x1080.png`

Caption (138 characters):

> Map the analysis unit, assigned treatment, and primary outcome before locking a reproducible analysis plan with visible validation checks.

### 03 — Result and confidence interval

File: `03-results-windows-1920x1080.png`

Caption (135 characters):

> Review effect size, a 95% confidence interval, sample sizes, and practical business relevance together in one evidence-oriented result.

### 04 — Diagnostics

File: `04-diagnostics-windows-1920x1080.png`

Caption (131 characters):

> Inspect sample-ratio mismatch, missingness, sparse-data warnings, and other quality checks before using causal conclusion language.

### 05 — Evidence export or Reports

File: `05-evidence-export-windows-1920x1080.png`

Caption (135 characters):

> Export aggregate JSON and static HTML evidence locally with method metadata, diagnostics, limitations, and reproducibility identifiers.

### 06 — About and authorship (optional sixth)

File: `06-about-author-windows-1920x1080.png`

Caption (112 characters):

> CausalPilot AI is authored and led by LAI ZEYU (来泽宇), with an explicit record of product and evidence ownership.

## Listing-language rule

For the English listing, use the English screenshots above. If the optional Simplified Chinese listing is submitted while the application UI remains English, the Chinese description must prominently state that the current interface is English. Do not fabricate localized screenshots.

## Acceptance checklist for each image

- [ ] Captured from the exact hashed Windows package, not the development server
- [ ] Correct Windows version and x64 package recorded
- [ ] Actual feature shown works in the packaged build
- [ ] Synthetic data only
- [ ] No personal or confidential information
- [ ] No local paths, tokens, credentials, or machine username
- [ ] No macOS window chrome
- [ ] No visual test overlays or browser developer tools
- [ ] PNG dimensions and file size verified
- [ ] Caption is 200 characters or fewer
- [ ] Critical content remains in the top two-thirds
- [ ] Screenshot SHA-256 recorded

## Logo assets

`assets/app-tile-300x300.png` and `assets/app-logo-1080x1080.png` are resized from the project’s existing 1024 × 1024 mark. Inspect them in Partner Center against the package icon before use. They are logo candidates, not evidence that the package contains every required Windows asset scale.
