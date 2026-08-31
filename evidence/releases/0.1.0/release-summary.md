# CausalPilot AI 0.1.0 — Release Evidence Summary

**Evidence date:** 2026-08-31  
**Product author, problem owner, and QA owner:** LAI ZEYU (来泽宇)  
**Target:** macOS 13.0 or newer, Apple Silicon (`arm64`)  
**Artifact:** `CausalPilot-AI-0.1.0-arm64.dmg`

## Evidence-safe outcome

Version 0.1.0 is a packaged English desktop MVP. The exact DMG was mounted read-only on the build Mac, its application bundle passed strict on-disk code-signature verification, and the mounted application completed the synthetic CSV import, deterministic local analysis, result rendering, and aggregate JSON/HTML evidence-export workflow.

This is not a public or notarized release. The bundle uses an ad-hoc integrity signature, not an Apple Developer ID certificate; Gatekeeper assessment rejects it; no clean independent target was used; and formal statistical holdout validation was correctly refused because the repository has no frozen commit.

## Gate state

| Gate | State | Evidence boundary |
|---|---|---|
| Source freeze | PARTIAL | Source exists, but the new repository has no commit or tag and is not a clean frozen tree. |
| Build | PASS — working snapshot | Production renderer, Electron TypeScript, icon, and PyInstaller arm64 sidecar built successfully. |
| Regression tests | PASS — defined scope | 14/14 frontend tests and 14/14 engine tests passed. |
| Dependency audit | PASS — npm advisory database | `npm audit` and `npm audit --omit=dev` reported 0 known vulnerabilities at test time. |
| Visual smoke | PASS — current Mac | Desktop and mobile captures had no horizontal overflow or captured console error. |
| Development benchmark | TESTED — DEVELOPMENT ONLY | 250 stochastic replications per implemented family; F05 warning fixtures 3/3; F09 safety fixtures 7/7; DiD not implemented. Not a formal holdout. |
| Package | PASS | DMG created, hashed, mounted, and validated with `hdiutil verify`. |
| Exact-DMG workflow | PASS — current Mac | The application launched from the read-only mounted DMG and completed the packaged end-to-end workflow. The native chooser return was stubbed only in the disposable test process. |
| Clean-target installation | NOT ESTABLISHED | No separate clean Mac or fresh user profile was tested. |
| Signing integrity | PASS — ad-hoc only | `codesign --verify --deep --strict` passed for the app inside the DMG. This is not identity assurance. |
| Developer ID / notarization | NOT ACHIEVED | No Developer ID identity or Apple notarization ticket exists; `spctl` rejected the app. |
| Public availability | NOT ESTABLISHED | No public download page, store listing, adoption, or production-use claim. |

## Exact artifact identity

- DMG SHA-256: `c5e6d6561cc9db3c210cd4b2608aa1fe4d14d1e9223c34eab03ee43e2176bdf2`
- DMG bytes: `135791674`
- Bundle identifier: `com.laizeyu.causalpilot`
- Application version: `0.1.0`
- Architecture: `arm64`
- Minimum macOS version: `13.0`
- Local signature type: ad-hoc; no Team ID

## Authorship surfaces verified

`LAI ZEYU (来泽宇)` appears in product metadata, the application shell, About, evidence ownership, exported JSON and HTML, `AUTHORS.md`, `NOTICE.md`, package metadata, and this release evidence.

## Scientific claim boundary

The permitted statement is that CausalPilot AI implements and tests a deterministic offline engine for declared two-arm randomized experiments with binary risk-difference and continuous Welch analyses, SRM and data-quality diagnostics, structured individual-employment-decision refusal, a practical-effect threshold, and evidence export.

Do not claim formal holdout validation, general causal validity, observational causal identification, Difference-in-Differences, real client impact, adoption, production readiness, Apple notarization, or public availability.
