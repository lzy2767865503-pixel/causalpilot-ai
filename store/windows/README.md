# CausalPilot AI — Microsoft Store submission kit

**Product author and accountable owner:** LAI ZEYU (来泽宇)  
**Prepared for:** Reserved Store product `CausalPilot AI by LAI ZEYU`; public-preview installed product `CausalPilot AI` 0.1.0, Windows x64
**Primary listing language:** English (United States)  
**Kit status:** Public source and GitHub preview verified; Store name reserved; identity-bound AppX built, inspected, uploaded, and server-validated; submission `1152921505701778491` is `In certification`; certification result and Microsoft Store availability remain gated

This directory contains evidence-bounded Microsoft Store copy and submission guidance for the Windows edition of CausalPilot AI. A Windows x64 preview is publicly available on GitHub. The identity-bound Store AppX has been uploaded to Partner Center, its server status is `Validated`, and submission `1152921505701778491` is `In certification`. The product has not yet passed certification, been published, or been proven publicly acquirable through Microsoft Store.

## Intended Store route

Use the packaged desktop-app route with an AppX/MSIX-family upload, not the unpackaged EXE/MSI URL route. `CausalPilot AI by LAI ZEYU` was reserved on 2026-09-01, and the exact CausalPilot-only Store identity is recorded in `PARTNER_CENTER_IDENTITY.md`. The public GitHub preview installs as `CausalPilot AI`; the uploaded Store AppX manifest uses the reserved name `CausalPilot AI by LAI ZEYU`. The manifest display name is verified, but the AppX itself has not been installed, so its installed Start-menu label and uninstall behavior remain unverified.

The uploaded package is x64 `Windows.Desktop`. Its inspected Store-assigned values are Package/Identity/Name `LAIZEYU.CausalPilotAIbyLAIZEYU`, Publisher `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`, PublisherDisplayName `LAI ZEYU`, and Store ID `9NXZ3MJFFGFG`. Partner Center accepted the exact package and reports `Validated`; that server result is package preprocessing evidence, not certification or publication.

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
- `assets/` — Store logo candidates. Four 1366 × 768 screenshots captured from the tested packaged payload corresponding to the AppX candidate have been uploaded to the English listing; they are not evidence of an installed Store AppX.
- `../../evidence/releases/0.1.0/windows/v0.1.0-store.1/partner-center-draft-record.md` — frozen build, AppX inspection, screenshots, Partner Center `In draft` state, and remaining-gate evidence.
- `../../evidence/releases/0.1.0/windows/v0.1.0-store.1/partner-center-certification-record.md` — accepted submission, `In certification` timeline, portal capture, and post-submission evidence boundary.

## Paste readiness

| Submission material | Current readiness | Required final check |
|---|---|---|
| Reserved product name and CausalPilot identity | Complete; exact values match the inspected manifest | Preserve the identity record with the submitted package evidence |
| English description, short description, features, keywords, copyright, Developed by, and MIT licence URL | Complete in Partner Center | Re-check only if the package or copy changes |
| Privacy answer, privacy policy, website, and support URL | Complete; public URLs returned HTTP 200 without authentication on 2026-09-01 | Re-open immediately before certification submission |
| Properties section | Complete in Partner Center | Reassess its declarations if runtime behavior changes |
| IARC questionnaire | Complete in Partner Center | Preserve the generated rating/GRID with final submission evidence |
| Reviewer/testing notes | Complete and aligned with the uploaded candidate | Do not imply an AppX installation test that did not occur |
| Screenshot captions and order | Complete; four candidate-matched 1366 × 768 screenshots uploaded | Replace only if the uploaded package changes |
| Store tile/logo | AppX manifest assets inspected and hashed | AppX installation rendering and consumer-device appearance remain unverified |

## Current truthful boundary

The public source implements an offline-first Electron workflow backed by a deterministic local Python engine. The annotated tag `v0.1.0` resolves to commit `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`. GitHub Actions run `33409332005` executed that tag on Windows Server 2022 x64. It passed 17 renderer/Electron/path-contract tests and 15 engine tests, built the Windows distributions, silently installed the NSIS installer, exercised the installed application’s local-engine, Unicode-path, result-rendering, and aggregate JSON/HTML export workflow, silently uninstalled it, and confirmed that `CausalPilot AI.exe` was removed. The public installer SHA-256 is `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`; both installer and uninstaller returned exit code 0. The reviewed binaries and portable checksum file are publicly available in the GitHub `v0.1.0` pre-release.

The immutable Store-candidate tag `v0.1.0-store.1` resolves to commit `3a46c94c68fa30c4a324aaad6f60f6fceb2dfe14`. [GitHub Actions run `33415607188`, job `99565393818`](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33415607188/job/99565393818) built and inspected `CausalPilot-AI-0.1.0-windows-x64.appx`. The exact AppX is 175,766,948 bytes with SHA-256 `3b5271b822e0a05663b8c7bb802f47914dac61b5f902b52cc02511b661744825`. The run verified the exact Partner Center identity, `Windows.Desktop` x64 manifest, version `1.0.0.0`, required branded assets, minimal `runFullTrust` capability, nested notices/authorship, source-map exclusion, sensitive-file/token-pattern scan, AMD64 PE structure and security flags, byte parity between the AppX core payload and the tested unpacked build, packaged local-engine E2E/export behavior, and four 1366 × 768 screenshots. Partner Center then accepted this package and reports server state `Validated`.

This remains hosted-runner package and unpacked-payload evidence, not an installation test of the AppX. Windows App Certification Kit, Microsoft Defender/SmartScreen, AppX install/uninstall, real chooser interaction, and clean consumer Windows 10 22H2 and Windows 11 24H2 testing remain open. Pricing and availability, Properties, IARC age ratings, Submission options, Testing notes, Packages, and the English Store listing all showed `Complete`; four screenshots were uploaded; automatic publication after certification was selected. Partner Center accepted the submission on 2026-09-01 and now reports `In certification`, with Submission complete and Pre-processing underway at the first observation. A certification pass and Microsoft Store availability are not yet proven.

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

- `PENDING_APPX_INSTALL_AND_CONSUMER_WINDOWS_QA`
- `PENDING_WACK_DEFENDER_SMARTSCREEN`
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

Copyright © 2026 LAI ZEYU (来泽宇). The public source repository is licensed under the MIT License. Both the direct-download GitHub package and the identity-bound Store AppX were inspected for the intended licence, authorship, and notices. This does not replace AppX installation, certification, or public-acquisition evidence.
