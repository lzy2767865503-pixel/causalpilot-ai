# CausalPilot AI — Microsoft Store submission kit

**Product author and accountable owner:** LAI ZEYU (来泽宇)  
**Prepared for:** Store candidate `CausalPilot AI by LAI ZEYU`; installed product CausalPilot AI 0.1.0, Windows x64  
**Primary listing language:** English (United States)  
**Kit status:** Prepared; package identity, Windows-machine evidence, public URLs, and Partner Center submission remain gated

This directory contains evidence-bounded Microsoft Store copy and submission guidance for the Windows edition of CausalPilot AI. It does not claim that the product has been uploaded, certified, published, or made publicly available.

## Intended Store route

Use the packaged desktop-app route with an AppX/MSIX-family upload, not the unpackaged EXE/MSI URL route. The planned Store name is `CausalPilot AI by LAI ZEYU`, while the installed app displays `CausalPilot AI`. The full Store-name candidate was observed as available but has not yet been reserved. The planned package is x64 `Windows.Desktop`; its final identity and publisher must be copied exactly from the product identity assigned in Partner Center after reservation and before the Store package is built.

Do not upload a locally generated placeholder-identity package. Do not call an upload, package-validation result, or `In certification` state a public release. Public availability is established only after the submission is certified, published, shown as `In the Store`, and independently opened from its public Store listing.

## Files

- `OFFICIAL_REQUIREMENTS.md` — current official Microsoft requirements and source links.
- `LISTING_EN_US.md` — ready-to-paste English listing fields.
- `LISTING_ZH_CN.md` — optional Chinese listing that clearly states the app UI is English.
- `PRIVACY_POLICY.md` — Windows 0.1.0 privacy policy draft for public hosting.
- `SUPPORT.md` — public support content and safe bug-reporting instructions.
- `PROPERTIES_AND_RATINGS.md` — category, declarations, system requirements, and IARC answer sheet.
- `REVIEWER_NOTES.md` — certification notes and a short reproducible reviewer path.
- `SCREENSHOT_PLAN.md` — exact Windows screenshot order, captions, and acceptance checks.
- `SUBMISSION_CHECKLIST.md` — go/no-go gates from package identity through public-listing verification.
- `assets/` — Store logo candidates only. Final screenshots must be captured from the tested Windows package.

## Current truthful boundary

The cross-platform source implements an offline-first Electron workflow backed by a deterministic local Python engine. The existing macOS release evidence does not prove Windows installation, Windows compatibility, WACK compliance, Microsoft Defender results, Store package validity, or public availability. Those Windows-specific claims remain closed until the named evidence is produced on Windows.

The product name contains “AI,” but version 0.1.0 does not use a generative-AI model at runtime. It has no account, cloud analysis, advertising, telemetry integration, or external AI call. Store metadata must preserve that distinction.

## Public URLs and remaining submission gates

The public URLs below become valid when the named repository is created. Search this directory for `PENDING_`; every remaining occurrence is a deliberate hard gate, not publishable copy.

- Public repository: `https://github.com/lzy2767865503-pixel/causalpilot-ai`
- Privacy policy: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/PRIVACY_POLICY.md`
- Support page: `https://github.com/lzy2767865503-pixel/causalpilot-ai/blob/main/store/windows/SUPPORT.md`
- `PENDING_NAME_RESERVATION`
- `PENDING_PARTNER_CENTER_IDENTITY`
- `PENDING_WINDOWS_PACKAGE_EVIDENCE`

## Release-stage vocabulary

| State | Permitted wording |
|---|---|
| Local source/build only | “Windows candidate prepared” |
| Package built and hashed | “Windows package candidate built” |
| Partner Center upload accepted | “Package uploaded/validated in Partner Center” |
| Submission sent | “Submitted for certification” |
| Certification underway | “In certification” |
| Certified and publishing | “Certified; publishing pending” |
| Store status and public PDP verified | “Available in Microsoft Store” |

Copyright © 2026 LAI ZEYU (来泽宇). Source code is intended for release under the MIT License; confirm the public repository and packaged licence file before submission.
