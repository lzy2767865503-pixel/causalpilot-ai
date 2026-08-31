# CausalPilot AI — Microsoft Store submission kit

**Product author and accountable owner:** LAI ZEYU (来泽宇)  
**Prepared for:** Store candidate `CausalPilot AI by LAI ZEYU`; installed product CausalPilot AI 0.1.0, Windows x64  
**Primary listing language:** English (United States)  
**Kit status:** Public source and reviewed GitHub Windows x64 preview verified; Store name reservation, package identity, final Store AppX, submission, certification, and Microsoft Store availability remain gated

This directory contains evidence-bounded Microsoft Store copy and submission guidance for the Windows edition of CausalPilot AI. A Windows x64 preview is publicly available on GitHub, but this kit does not claim that a package has been uploaded to Partner Center, certified, published, or made available through Microsoft Store.

## Intended Store route

Use the packaged desktop-app route with an AppX/MSIX-family upload, not the unpackaged EXE/MSI URL route. The planned Store name is `CausalPilot AI by LAI ZEYU`, while the installed app displays `CausalPilot AI`. The full Store-name candidate was observed as available but has not yet been reserved. The planned package is x64 `Windows.Desktop`; its final identity and publisher must be copied exactly from the product identity assigned in Partner Center after reservation and before the Store package is built.

Do not upload a locally generated placeholder-identity package. Do not call an upload, package-validation result, or `In certification` state a public release. Public availability is established only after the submission is certified, published, shown as `In the Store`, and independently opened from its public Store listing.

## Files

- `OFFICIAL_REQUIREMENTS.md` — current official Microsoft requirements and source links.
- `LISTING_EN_US.md` — ready-to-paste English listing fields.
- `LISTING_ZH_CN.md` — optional Chinese listing that clearly states the app UI is English.
- `PRIVACY_POLICY.md` — publicly accessible Windows 0.1.0 privacy policy.
- `SUPPORT.md` — public support content, issue intake, and private vulnerability-reporting route.
- `PROPERTIES_AND_RATINGS.md` — category, declarations, system requirements, and IARC answer sheet.
- `REVIEWER_NOTES.md` — certification notes and a short reproducible reviewer path.
- `SCREENSHOT_PLAN.md` — exact Windows screenshot order, captions, and acceptance checks.
- `SUBMISSION_CHECKLIST.md` — go/no-go gates from package identity through public-listing verification.
- `assets/` — Store logo candidates only. Four preserved screenshots from the tagged Windows package exist under `evidence/releases/0.1.0/windows/v0.1.0/`; they are not final Store AppX screenshots.

## Current truthful boundary

The public source implements an offline-first Electron workflow backed by a deterministic local Python engine. The annotated tag `v0.1.0` resolves to commit `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`. GitHub Actions run `33409332005` executed that tag on Windows Server 2022 x64. It passed 17 renderer/Electron/path-contract tests and 15 engine tests, built the Windows distributions, silently installed the NSIS installer, exercised the installed application’s local-engine, Unicode-path, result-rendering, and aggregate JSON/HTML export workflow, silently uninstalled it, and confirmed that `CausalPilot AI.exe` was removed. The public installer SHA-256 is `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`; both installer and uninstaller returned exit code 0. The reviewed binaries and portable checksum file are publicly available in the GitHub `v0.1.0` pre-release.

This is automated install/workflow/uninstall evidence on a GitHub-hosted Windows Server 2022 runner—not a clean consumer Windows 10/11 test or final Store AppX test. The four screenshots remain tagged packaged `win-unpacked` evidence, not final Store AppX screenshots. Real chooser interaction, WACK, Defender, final Store AppX, Partner Center upload, certification, and Microsoft Store availability remain pending. Public GitHub preview availability does not establish Microsoft Store availability.

The product name contains “AI,” but version 0.1.0 does not use a generative-AI model at runtime. It has no account, cloud analysis, advertising, telemetry integration, or external AI call. Store metadata must preserve that distinction.

## Public repository and submission gates

The public project, MIT licence, authorship notices, privacy policy, support page, and private vulnerability-reporting route now exist:

- Public repository: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- Public Windows x64 preview: `https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0`
- MIT licence: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/LICENSE`
- Authorship: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/AUTHORS.md`
- Notices: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/NOTICE.md`
- Privacy policy: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/PRIVACY_POLICY.md`
- Support page: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/SUPPORT.md`
- Private vulnerability reporting: `https://github.com/lzy2767865503-pixel/causalpilot-ai/security/advisories/new`

The remaining `PENDING_` entries below are deliberate hard gates, not publishable claims:

- `PENDING_NAME_RESERVATION`
- `PENDING_PARTNER_CENTER_IDENTITY`
- `PENDING_FINAL_STORE_APPX`
- `PENDING_PARTNER_CENTER_UPLOAD`
- `PENDING_STORE_CERTIFICATION`
- `PENDING_STORE_AVAILABILITY`

## Release-stage vocabulary

| State | Permitted wording |
|---|---|
| Local source/build only | “Windows candidate prepared” |
| Package built and hashed | “Windows package candidate built” |
| Reviewed GitHub release publicly reachable | “Windows x64 preview available on GitHub” |
| Partner Center upload accepted | “Package uploaded/validated in Partner Center” |
| Submission sent | “Submitted for certification” |
| Certification underway | “In certification” |
| Certified and publishing | “Certified; publishing pending” |
| Store status and public PDP verified | “Available in Microsoft Store” |

Copyright © 2026 LAI ZEYU (来泽宇). The public source repository is licensed under the MIT License. The direct-download GitHub package was inspected and contains the intended licence, authorship, and notices. The final Store AppX must still be inspected independently to confirm that its packaged copies match the public source before submission.
