# CausalPilot AI — Microsoft Store submission kit

**Product author and accountable owner:** LAI ZEYU (来泽宇)  
**Prepared for:** Reserved Store product `CausalPilot AI by LAI ZEYU`; public-preview installed product `CausalPilot AI` 0.1.0, Windows x64
**Primary listing language:** English (United States)  
**Kit status:** Public source, reviewed GitHub Windows x64 preview, reserved Store name, and CausalPilot-specific Partner Center identity verified; final Store AppX, upload, certification, and Microsoft Store availability remain gated

This directory contains evidence-bounded Microsoft Store copy and submission guidance for the Windows edition of CausalPilot AI. A Windows x64 preview is publicly available on GitHub, but this kit does not claim that a package has been uploaded to Partner Center, certified, published, or made available through Microsoft Store.

## Intended Store route

Use the packaged desktop-app route with an AppX/MSIX-family upload, not the unpackaged EXE/MSI URL route. `CausalPilot AI by LAI ZEYU` was reserved on 2026-09-01, and the exact CausalPilot-only Store identity is recorded in `PARTNER_CENTER_IDENTITY.md`. The public GitHub preview installs as `CausalPilot AI`; the Store workflow currently plans the reserved name as the AppX manifest display name so the Store listing and installed Store label remain aligned. The final AppX manifest and installed label must still be inspected before the reviewer notes or listing are submitted.

The planned package is x64 `Windows.Desktop`. Its Store-assigned values are Package/Identity/Name `LAIZEYU.CausalPilotAIbyLAIZEYU`, Publisher `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`, PublisherDisplayName `LAI ZEYU`, and Store ID `9NXZ3MJFFGFG`. These values are product metadata, not evidence that a Store package has been built or uploaded.

Do not upload a locally generated placeholder-identity package. Do not call an upload, package-validation result, or `In certification` state a public release. Public availability is established only after the submission is certified, published, shown as `In the Store`, and independently opened from its public Store listing.

## Files

- `OFFICIAL_REQUIREMENTS.md` — current official Microsoft requirements and source links.
- `PARTNER_CENTER_IDENTITY.md` — verified reserved name and exact CausalPilot Store identity values.
- `LISTING_EN_US.md` — ready-to-paste English listing fields.
- `LISTING_ZH_CN.md` — optional Chinese listing that clearly states the app UI is English.
- `PRIVACY_POLICY.md` — publicly accessible Windows 0.1.0 privacy policy.
- `SUPPORT.md` — public support content, issue intake, and private vulnerability-reporting route.
- `PROPERTIES_AND_RATINGS.md` — category, declarations, system requirements, and IARC answer sheet.
- `REVIEWER_NOTES.md` — certification notes and a short reproducible reviewer path.
- `SCREENSHOT_PLAN.md` — exact Windows screenshot order, captions, and acceptance checks.
- `SUBMISSION_CHECKLIST.md` — go/no-go gates from package identity through public-listing verification.
- `assets/` — Store logo candidates only. Four preserved screenshots from the tagged Windows package exist under `evidence/releases/0.1.0/windows/v0.1.0/`; they are not final Store AppX screenshots.

## Paste readiness

| Submission material | Current readiness | Required final check |
|---|---|---|
| Reserved product name and CausalPilot identity | Verified and build-ready | Bind the exact values in `PARTNER_CENTER_IDENTITY.md`; inspect the generated manifest |
| English description, short description, features, keywords, copyright, Developed by, and MIT licence URL | Copy-ready | Re-read against the exact final AppX before submission |
| Privacy answer, privacy policy, website, and support URL | Copy-ready; all public URLs returned HTTP 200 without authentication on 2026-09-01 | Re-open the URLs immediately before submission |
| Category and non-generative-AI declarations | Answer sheet ready | Match the live Partner Center wording and final package behavior |
| IARC questionnaire | Draft answers ready | Complete the live questionnaire and preserve the generated rating/GRID |
| Reviewer notes | Behavioral draft ready and below 2,000 characters | Confirm the installed display label, manifest target/version, and every review step against the exact AppX |
| Screenshot captions and order | Plan ready | Capture from the exact installed, hashed Store candidate; existing tagged preview images are not final Store images |
| Store tile/logo | Candidate files and hashes ready | Inspect rendering in Partner Center and compare with the final package icons |

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
