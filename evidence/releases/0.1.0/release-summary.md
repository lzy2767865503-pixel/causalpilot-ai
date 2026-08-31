# CausalPilot AI 0.1.0 — Release Evidence Summary

**Evidence date:** 2026-08-31

**Product author, problem owner, and QA owner:** LAI ZEYU (来泽宇)

**Public source:** <https://github.com/lzy2767865503-pixel/causalpilot-ai>

**Public Windows binary release:** <https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0>

**Historical Mac target:** macOS 13.0 or newer, Apple Silicon (`arm64`)

**Windows release target:** Windows x64, tested on a GitHub-hosted Windows Server 2022 runner

## Evidence-safe outcome

Version 0.1.0 is a packaged English desktop MVP with two distinct platform
evidence records.

The historical macOS record covers
`CausalPilot-AI-0.1.0-arm64.dmg`. The exact DMG was mounted read-only on the
build Mac, its application bundle passed strict on-disk code-signature
verification, and the mounted application completed the synthetic CSV import,
deterministic local analysis, result rendering, and aggregate JSON/HTML
evidence-export workflow. The bundle uses an ad-hoc integrity signature, not an
Apple Developer ID certificate; Gatekeeper assessment rejected it; and no clean
independent target was used.

The latest Windows record covers tagged GitHub Actions run
[`33409332005`](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33409332005)
at source commit `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`. On the
recorded Windows x64 runner, the workflow built the PyInstaller sidecar, NSIS
installer, ZIP, and `win-unpacked` application; passed the sidecar Unicode-path
smoke; silently installed the NSIS package; launched the installed application;
completed import, mapping, local analysis, results, and JSON/HTML export;
silently uninstalled it; confirmed removal of the main executable; and captured
four 1366 × 768 packaged Windows screenshots without recorded console errors or
horizontal overflow.

The source repository and reviewed `v0.1.0` Windows x64 GitHub pre-release are
publicly reachable. The tagged installer, ZIP, and checksum file were downloaded
and rehashed before publication, and their unauthenticated endpoints returned
HTTP 200 afterward. The hosted installer lifecycle is not a clean consumer
Windows 10/11 test. No trusted Authenticode identity, full uninstall residue
audit, WACK result, Partner Center package, Store certification, or Store
availability evidence exists.

The earlier macOS artifact and development benchmarks were produced when no
frozen Git commit existed. Creating and publishing the repository later does
not retroactively freeze or identify the exact source snapshot that produced
those historical artifacts. The frozen commits apply only to their respective
Windows preflight and tagged-release records.

## Gate state

| Gate | State | Evidence boundary |
|---|---|---|
| Public source | PASS | The repository returned HTTP 200 without authentication; annotated tag `v0.1.0` resolves to frozen commit `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`. |
| Historical Mac source freeze | NOT ESTABLISHED | No commit or tag existed when the earlier DMG and benchmark artifacts were built. Current Git history does not retroactively freeze them. |
| Windows installer-preflight source freeze | PASS — preflight only | Run `33406656618` checked out and built commit `612a618a3de36ab53865354f9e8f0a5e9a05c26a`. |
| Historical Mac build | PASS — recorded snapshot | Production renderer, Electron source, icon, and PyInstaller arm64 sidecar built successfully. |
| Tagged Windows build | PASS — recorded runner | Run `33409332005` created the Windows x64 sidecar, NSIS installer, ZIP, and matching `win-unpacked` application from the frozen tag. |
| Regression tests | PASS — defined scope | Historical Mac record: 14/14 frontend and 14/14 engine tests. Tagged Windows run: 17/17 renderer/path tests and 15/15 engine tests. |
| Dependency audit | PASS — recorded npm advisory checks | `npm audit` and `npm audit --omit=dev` reported 0 known vulnerabilities at the historical Mac test time; tagged-commit Source validation run `33409072874` repeated the production-dependency audit successfully. |
| Visual smoke | PASS — recorded environments | Historical Mac captures and four packaged Windows 1366 × 768 captures reported no horizontal overflow or captured console error. |
| Development benchmark | TESTED — DEVELOPMENT ONLY | 250 stochastic replications per implemented family; F05 warning fixtures 3/3; F09 safety fixtures 7/7; DiD not implemented. This is not a formal holdout. |
| Historical Mac package | PASS | The DMG was created, hashed, mounted, and validated with `hdiutil verify`. |
| Tagged Windows packages | PASS | The public NSIS installer and ZIP were created and hashed; downloaded copies matched the portable checksum file and ZIP integrity testing passed. |
| Exact packaged workflow | PASS — recorded environments | The mounted DMG ran on its build Mac. The NSIS-installed `CausalPilot AI.exe` and matching `win-unpacked` app ran on the GitHub-hosted Windows runner. In both platforms the native chooser return was stubbed only inside the disposable test process. |
| Hosted installer lifecycle | PASS — runner smoke only | Silent install and uninstall both returned 0; the installed workflow passed and the main executable was removed. This is not a clean consumer-device test or complete residue audit. |
| Clean-target installation | NOT ESTABLISHED | No separate clean Mac, consumer Windows 10/11 device, fresh user profile, interactive installer flow, reinstall, or upgrade was tested. |
| macOS signing integrity | PASS — ad-hoc only | `codesign --verify --deep --strict` passed for the app inside the DMG; `spctl` rejected it. This is not identity assurance. |
| Windows trusted signing | NOT ACHIEVED | No Authenticode certificate or trusted publisher identity was configured; unknown-publisher or SmartScreen warnings remain possible. |
| Store package / WACK | NOT ACHIEVED | No exact Partner Center identity, final AppX, Store install, WACK result, submission, or certification record exists. |
| Public binary availability | PASS — GitHub pre-release only | The reviewed `v0.1.0` Windows installer, ZIP, and checksum file are publicly downloadable; unauthenticated release and asset endpoints returned HTTP 200. Microsoft Store availability is not established. |

## Exact artifact identity

### Historical Mac DMG

- File: `CausalPilot-AI-0.1.0-arm64.dmg`
- SHA-256: `c5e6d6561cc9db3c210cd4b2608aa1fe4d14d1e9223c34eab03ee43e2176bdf2`
- Bytes: `135791674`
- Bundle identifier: `com.laizeyu.causalpilot`
- Application version: `0.1.0`
- Architecture: `arm64`
- Minimum macOS version: `13.0`
- Local signature type: ad-hoc; no Team ID
- Build-time source commit: unavailable

### Windows x64 package preflight — run 33403432371

- Source commit: `f9b0d72716e4958f5b1d523eb926451707437dc6`
- Installer: `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
- Installer bytes: `123901907`
- Installer SHA-256: `1af7f1f947eb83b7b98d43dd881ab03711b1bc44861cfdf9393376df60021e26`
- ZIP: `CausalPilot-AI-0.1.0-windows-x64.zip`
- ZIP bytes: `166545934`
- ZIP SHA-256: `bb1c986910e727b0f00f581abafdcb7a39aacd641b256a4d7b382d1b591f882d`
- Distribution Actions artifact: `CausalPilot-AI-0.1.0-windows-x64`, ID `9762299905`, archive digest `sha256:4f24daa24f3b9593375a91cb65590cac451cde6631c6ea7d78f3b5ca906668bb`
- Validation Actions artifact: `CausalPilot-AI-0.1.0-windows-x64-validation`, ID `9762309247`, archive digest `sha256:b2f1cb973aa95df224028e3ab05d0bc7111632a8cb6b827f0c9285f60fe8dd20`

The Actions artifacts were configured for 30-day retention. They are preflight
evidence, not stable public distribution URLs. A later tagged release must be
rebuilt and must publish its own authoritative checksum file.

### Windows x64 installer preflight — run 33406656618

- Source commit: `612a618a3de36ab53865354f9e8f0a5e9a05c26a`
- Installer: `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
- Installer bytes: `123900931`
- Installer SHA-256: `22cf9261e8bf86f21637764c0c1d4f4807b0bce24567d22a1b9fa1020f4cdc88`
- ZIP: `CausalPilot-AI-0.1.0-windows-x64.zip`
- ZIP bytes: `166545032`
- ZIP SHA-256: `70cffa566f09fd105e64c9f83965e9bc5e5daeb7c6875201cfb50fe58aaa9c74`
- Distribution Actions artifact: `CausalPilot-AI-0.1.0-windows-x64`, ID `9763560787`, archive digest `sha256:5d2a9e6eac3b94f0889bda704ed90620bc1ef632f9ccca0cee3a99fe0122e774`
- Validation Actions artifact: `CausalPilot-AI-0.1.0-windows-x64-validation`, ID `9763570004`, archive digest `sha256:30a6d097464417488354979144cf422cf5f315229a79efd62cac99d94dbe3a52`

This later run added silent install, installed-app E2E/export, silent uninstall,
and main-executable removal checks. Its temporary artifacts were also configured
for 30-day retention. The independently rebuilt public tag is recorded below
with its own authoritative checksum file.

### Public tagged Windows x64 preview — v0.1.0

- Tagged commit: `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`
- Tagged workflow: `33409332005`
- Published: `2026-08-31T15:46:21Z`
- Release URL: `https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0`
- Installer bytes: `123901221`
- Installer SHA-256: `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`
- ZIP bytes: `166545543`
- ZIP SHA-256: `76fca35d57595f480a06c4e89d51e28b4f8e424d3e737a26ffdbe84ae508d790`
- Portable checksum-file SHA-256: `a5f7d3e448f98b7556ce58c4586f9939a6576afd97733d8ec88562470391229a`

The tagged build repeated all installer lifecycle and packaged-workflow checks.
The draft assets were downloaded and independently rehashed; the checksum file
was normalized from CRLF to LF before publication without changing either
binary. Full details are in
[`windows/v0.1.0/github-release-record.md`](windows/v0.1.0/github-release-record.md).

## Preserved Windows evidence

- [`windows/windows-preflight-run-33403432371.md`](windows/windows-preflight-run-33403432371.md)
- [`windows/SHA256SUMS-windows-preflight.txt`](windows/SHA256SUMS-windows-preflight.txt)
- [`windows/packaged-e2e-report.json`](windows/packaged-e2e-report.json)
- [`windows/windows-store-capture-report.json`](windows/windows-store-capture-report.json)
- [`windows/01-overview-1366x768.png`](windows/01-overview-1366x768.png)
- [`windows/02-import-mapping-1366x768.png`](windows/02-import-mapping-1366x768.png)
- [`windows/03-local-results-1366x768.png`](windows/03-local-results-1366x768.png)
- [`windows/04-evidence-reports-1366x768.png`](windows/04-evidence-reports-1366x768.png)
- [`windows/windows-installer-preflight-run-33406656618.md`](windows/windows-installer-preflight-run-33406656618.md)
- [`windows/nsis-install-uninstall-preflight-report.json`](windows/nsis-install-uninstall-preflight-report.json)
- [`windows/packaged-e2e-installed-preflight-report.json`](windows/packaged-e2e-installed-preflight-report.json)
- [`windows/SHA256SUMS-windows-installer-preflight.txt`](windows/SHA256SUMS-windows-installer-preflight.txt)
- [`windows/v0.1.0/github-release-record.md`](windows/v0.1.0/github-release-record.md)
- [`windows/v0.1.0/SHA256SUMS-windows.txt`](windows/v0.1.0/SHA256SUMS-windows.txt)
- [`windows/v0.1.0/nsis-install-uninstall-report.json`](windows/v0.1.0/nsis-install-uninstall-report.json)
- [`windows/v0.1.0/packaged-e2e-installed-report.json`](windows/v0.1.0/packaged-e2e-installed-report.json)

## Authorship surfaces verified

`LAI ZEYU (来泽宇)` appears in product metadata, the application shell, About,
evidence ownership, exported JSON and HTML, `AUTHORS.md`, `NOTICE.md`, package
metadata, the Windows packaged-runtime report, and the four preserved Windows
screenshots.

## Scientific and release claim boundary

The permitted statement is that CausalPilot AI implements and tests a
deterministic offline engine for declared two-arm randomized experiments with
binary risk-difference and continuous Welch analyses, SRM and data-quality
diagnostics, structured individual-employment-decision refusal, a
practical-effect threshold, and aggregate evidence export. It was exercised in
the recorded historical Mac workflow, frozen-commit Windows x64 preflights, and
the tagged public `v0.1.0` Windows preview.

Do not claim formal holdout validation, general causal validity, observational
causal identification, Difference-in-Differences, real client impact, adoption,
production readiness, clean-device Windows 10/11 compatibility, trusted Windows
signing, WACK approval, Apple notarization, Microsoft Store certification, or
Microsoft Store availability.
