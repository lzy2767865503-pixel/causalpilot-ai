# Windows x64 preflight — GitHub Actions run 33403432371

**Evidence date:** 2026-08-31
**Product author and accountable QA owner:** LAI ZEYU (来泽宇)
**State:** `PACKAGED` and `TESTED` on the recorded GitHub-hosted runner; not `INSTALLED`, trusted-signed, Store-submitted, or publicly released
**Source commit:** `f9b0d72716e4958f5b1d523eb926451707437dc6`
**Workflow:** [Windows x64 package and draft release — run 33403432371](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33403432371)
**Build job:** `99525075687`

## Recorded environment

- GitHub-hosted `windows-2022` runner
- Microsoft Windows Server 2022, build `10.0.20348`
- x64 process architecture
- Node.js `22.23.2`
- Python `3.13.15`
- Electron `44.0.0`
- PyInstaller `6.22.2`

This environment is direct Windows execution evidence. It is not a clean-device
installation test on consumer Windows 10 or Windows 11.

## Successful gates

Every job step completed successfully in 4 minutes 22 seconds:

1. Installed the locked JavaScript dependencies and pinned Python build/test dependencies.
2. Passed 17 renderer, Electron-bridge, and Windows path-contract tests.
3. Passed 15 deterministic-engine tests, including the forced `cp1252`/UTF-8 protocol regression.
4. Built one Windows x64 PyInstaller sidecar and exercised it with `实验 数据.csv` through UTF-8 JSON stdin.
5. Matched the frozen synthetic dataset SHA-256 `47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244`.
6. Compiled the production renderer and Electron main/preload source.
7. Built the NSIS installer, ZIP distribution, and matching `win-unpacked` directory.
8. Launched `win-unpacked/CausalPilot AI.exe` and completed CSV selection-token handling, mapping, local sidecar analysis, result rendering, and JSON/HTML evidence export.
9. Confirmed the exported evidence schema and LAI ZEYU (来泽宇) attribution, and confirmed no recognized raw-row collection was exported.
10. Captured four screenshots from the packaged Windows executable at exactly 1366 × 768, with no captured renderer errors and no horizontal overflow.
11. Generated checksums and uploaded both the distribution and validation artifacts.

The native file chooser return was stubbed only inside the disposable packaged
test process. Production file-capability handling, request validation, bundled
Windows sidecar execution, result rendering, and export were exercised. A real
interactive chooser click remains part of clean-device QA.

## Preflight artifact identity

| File | Bytes | SHA-256 |
|---|---:|---|
| `CausalPilot-AI-0.1.0-windows-x64-setup.exe` | 123,901,907 | `1af7f1f947eb83b7b98d43dd881ab03711b1bc44861cfdf9393376df60021e26` |
| `CausalPilot-AI-0.1.0-windows-x64.zip` | 166,545,934 | `bb1c986910e727b0f00f581abafdcb7a39aacd641b256a4d7b382d1b591f882d` |

The downloaded copies were hashed again on the evidence-review Mac and matched
the workflow checksum file exactly. ZIP integrity testing passed. The ZIP main
application and bundled engine are PE32+ x86-64 executables. The NSIS bootstrap
executable is PE32 and packages the x64 application payload, which is normal for
this installer target.

GitHub Actions retained these private workflow artifacts for 30 days:

- Distribution artifact `9762299905`, archive size 290,275,275 bytes, archive digest `sha256:4f24daa24f3b9593375a91cb65590cac451cde6631c6ea7d78f3b5ca906668bb`.
- Validation artifact `9762309247`, archive size 175,632,650 bytes, archive digest `sha256:b2f1cb973aa95df224028e3ab05d0bc7111632a8cb6b827f0c9285f60fe8dd20`.

The two distribution hashes above belong to this preflight commit. A tagged
release is rebuilt independently; its attached checksum file is authoritative
for public release downloads.

## Preserved Windows evidence

- [`packaged-e2e-report.json`](packaged-e2e-report.json) — packaged win32/x64 metadata, Unicode file name, local-engine provenance, result values, author surfaces, and evidence-export assertions.
- [`windows-store-capture-report.json`](windows-store-capture-report.json) — four screenshot dimensions, packaged runtime metadata, dataset hash, overflow result, and console-error result.
- [`SHA256SUMS-windows-preflight.txt`](SHA256SUMS-windows-preflight.txt) — original workflow distribution checksums.
- [`01-overview-1366x768.png`](01-overview-1366x768.png) — SHA-256 `080d92f628ef8e07ec8c761da37ce6880d53e1c6eb81588dac6005d07ea2ed95`.
- [`02-import-mapping-1366x768.png`](02-import-mapping-1366x768.png) — SHA-256 `00a529fbba0cd9d5365913af7e6a8ccd736dec97067eb0f8ae189301aecc0060`.
- [`03-local-results-1366x768.png`](03-local-results-1366x768.png) — SHA-256 `f127db74a3917cd1390b1cd6850bf4529e871cabc05ab6e4057edee1ca9abf7d`.
- [`04-evidence-reports-1366x768.png`](04-evidence-reports-1366x768.png) — SHA-256 `430f3bcc34ebcec02adfa1b71127b6edc64f87cf205cd3ee13a82cf94aa66d2b`.

The two JSON copies normalize the ephemeral GitHub workspace path before
publication. All substantive fields match the downloaded originals.

## Gates that remain open

- No NSIS or ZIP clean installation was performed on a separate Windows 10/11 device.
- No uninstall/reinstall, alternate drive, standard-user, high-DPI matrix, screen-reader, or real native-chooser test was performed.
- No Authenticode certificate was configured; Windows may show an unknown-publisher or SmartScreen warning.
- No Windows App Certification Kit, Microsoft Defender scan record, independent network observation, or Store package installation record exists.
- The preflight did not use a Partner Center identity and did not produce the final Store AppX.
- A successful Actions artifact is not a public GitHub Release or Microsoft Store listing.

Accordingly, the evidence-safe statement is:

> CausalPilot AI 0.1.0 was built and exercised end to end as a packaged Windows
> x64 application on the recorded GitHub-hosted Windows Server 2022 runner.

It is not yet evidence-safe to claim general Windows 10/11 compatibility,
clean installation, trusted signing, WACK approval, Store certification, or
Microsoft Store availability.
