# CausalPilot AI 0.1.0 — Release Evidence Summary

**Evidence date:** 2026-08-31  
**Product author, problem owner, and QA owner:** LAI ZEYU (来泽宇)  
**Historical Mac target:** macOS 13.0 or newer, Apple Silicon (`arm64`)
**Windows preflight target:** Windows x64; tested on a GitHub-hosted Windows Server 2022 runner

## Evidence-safe outcome

CausalPilot AI 0.1.0 is a packaged English desktop MVP. The historical Apple-silicon DMG was mounted read-only on the build Mac, passed strict on-disk ad-hoc signature verification, and completed the synthetic CSV import, deterministic local analysis, result rendering, and aggregate JSON/HTML evidence-export workflow.

Separately, GitHub Actions [run 33403432371](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33403432371) built and exercised the Windows x64 application at source commit `f9b0d72716e4958f5b1d523eb926451707437dc6`. It passed 17 renderer/Electron/path-contract tests, 15 engine tests, a Unicode-path sidecar smoke, packaged import/analysis/export E2E, and four 1366 × 768 screenshot checks on Windows Server 2022.

These records do not establish trusted signing, a clean consumer-device installation, broad Windows 10/11 or macOS compatibility, WACK approval, Microsoft Store certification, adoption, or production use.

## Source and artifact chronology

The earlier macOS DMG and development-benchmark records were created before this Git repository had a frozen commit. The later public repository and its current history do not retroactively identify or prove the exact source snapshot that produced those historical artifacts. Their hashes and test records remain valid only within their documented build-machine boundary.

The Windows preflight is directly traceable to the exact commit above. At this evidence snapshot, no `v0.1.0` tag or public GitHub binary Release existed; the run's downloadable files were temporary Actions artifacts rather than a public release.

## Gate state

| Gate | State | Evidence boundary |
|---|---|---|
| Public source | PASS | The MIT source repository is public at `https://github.com/lzy2767865503-pixel/causalpilot-ai`. Source publication is not binary availability. |
| Source freeze | PARTIAL | The Windows preflight has an exact immutable commit; a `v0.1.0` release tag is still pending. The historical Mac artifact has no build-time source commit. |
| Regression tests | PASS — defined scope | Windows preflight: 17/17 frontend/path-contract and 15/15 engine tests. Historical Mac evidence retains its own recorded test counts. |
| Development benchmark | TESTED — DEVELOPMENT ONLY | Two measured development records exist; formal holdout was not run and Difference-in-Differences remains unimplemented. |
| Historical Mac package | PASS — build-Mac boundary | The arm64 DMG was hashed, verified, mounted, and exercised. It was not clean-installed, Developer ID signed, notarized, or made publicly downloadable. |
| Windows x64 package preflight | PASS — hosted-runner boundary | NSIS, ZIP, and `win-unpacked` outputs were built and hashed; the unpacked packaged application completed the synthetic local workflow and screenshot checks on Windows Server 2022. |
| Windows installation | NOT ESTABLISHED | The recorded preflight launched `win-unpacked`; it did not install/uninstall the NSIS package on a clean Windows 10 or Windows 11 device. |
| Trusted signing and platform certification | NOT ACHIEVED | The Mac bundle has ad-hoc integrity only. No trusted Windows Authenticode identity, WACK record, Apple notarization, or Store re-signing record exists. |
| Public binary availability | NOT ESTABLISHED | The repository is public, but no public GitHub binary Release or Microsoft Store listing existed at this snapshot. |
| Microsoft Store | NOT SUBMITTED | Product-name reservation, exact Partner Center identity, final Store AppX, upload, certification, and public acquisition remain separate open gates. |

## Exact artifact identity

### Historical Apple-silicon DMG

- File: `CausalPilot-AI-0.1.0-arm64.dmg`
- Bytes: `135791674`
- SHA-256: `c5e6d6561cc9db3c210cd4b2608aa1fe4d14d1e9223c34eab03ee43e2176bdf2`
- Bundle identifier: `com.laizeyu.causalpilot`
- Application version: `0.1.0`
- Architecture: `arm64`
- Local signature type: ad-hoc; no Team ID

### Windows x64 preflight

- Source commit: `f9b0d72716e4958f5b1d523eb926451707437dc6`
- Workflow run: `33403432371`
- Installer: `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
- Installer bytes: `123901907`
- Installer SHA-256: `1af7f1f947eb83b7b98d43dd881ab03711b1bc44861cfdf9393376df60021e26`
- ZIP: `CausalPilot-AI-0.1.0-windows-x64.zip`
- ZIP bytes: `166545934`
- ZIP SHA-256: `bb1c986910e727b0f00f581abafdcb7a39aacd641b256a4d7b382d1b591f882d`
- Full record: [`windows/windows-preflight-run-33403432371.md`](windows/windows-preflight-run-33403432371.md)

These Windows hashes identify the preflight artifacts only. A tagged release is rebuilt independently, so its attached checksum file must be treated as authoritative for public downloads.

## Authorship surfaces verified

`LAI ZEYU (来泽宇)` appears in product metadata, the application shell, privacy and evidence surfaces, exported JSON and HTML, `AUTHORS.md`, `NOTICE.md`, packaged project notices, Windows PE metadata for the sidecar, screenshots, and this evidence summary.

## Scientific and release claim boundary

The permitted statement is that CausalPilot AI implements and tests a deterministic offline engine for declared two-arm randomized experiments with binary risk-difference and continuous Welch analyses, SRM and data-quality diagnostics, structured individual-employment-decision refusal, a practical-effect threshold, and aggregate evidence export.

Do not claim formal holdout validation, general causal validity, observational causal identification, Difference-in-Differences, real client impact, adoption, production readiness, broad platform compatibility, trusted signing, Store certification, or Microsoft Store availability without the separate evidence required for each claim.
