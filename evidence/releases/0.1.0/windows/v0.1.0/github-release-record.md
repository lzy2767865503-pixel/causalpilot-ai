# Public GitHub Release record — CausalPilot AI v0.1.0

**Published:** 2026-08-31T15:46:21Z  
**Release state:** public GitHub pre-release  
**Release URL:** <https://github.com/lzy2767865503-pixel/causalpilot-ai/releases/tag/v0.1.0>  
**Tag:** `v0.1.0`  
**Tagged source commit:** `b2a226ac9e2623ba210a192095d2feb2eb7dacf4`  
**Product author and accountable QA owner:** LAI ZEYU (来泽宇)

## Public assets

| File | Bytes | SHA-256 |
|---|---:|---|
| `CausalPilot-AI-0.1.0-windows-x64-setup.exe` | 123,901,221 | `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce` |
| `CausalPilot-AI-0.1.0-windows-x64.zip` | 166,545,543 | `76fca35d57595f480a06c4e89d51e28b4f8e424d3e737a26ffdbe84ae508d790` |
| `SHA256SUMS-windows.txt` | 212 | `a5f7d3e448f98b7556ce58c4586f9939a6576afd97733d8ec88562470391229a` |

The release asset digests reported by GitHub matched independent hashes of downloaded copies. ZIP integrity testing passed. The EXE is a Nullsoft Installer self-extracting PE32 bootstrap carrying the x64 application payload; the packaged main application and local engine in the validation artifact are PE32+ x86-64 executables.

The tagged workflow initially emitted its checksum text with Windows CRLF line endings. Before publication, that text-only asset was normalized to UTF-8 without BOM and LF so standard Windows, macOS, and Linux checksum tools can consume it. The EXE and ZIP were not modified. The normalized file passed `shasum -a 256 -c SHA256SUMS-windows.txt` for both public binaries.

## Tagged Windows validation

[GitHub Actions run 33409332005](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33409332005) rebuilt the exact tag on a GitHub-hosted Windows Server 2022 x64 runner. Build job `99544671241` and draft-release job `99546167939` both passed.

The tagged run passed:

- 17 renderer/Electron/path-contract tests;
- 15 deterministic-engine tests;
- Windows x64 sidecar build plus Unicode-path and frozen-dataset smoke;
- production frontend and Electron compilation;
- NSIS, ZIP, and unpacked Windows distributions;
- silent NSIS install with exit code `0`;
- installed-app CSV mapping, deterministic local-engine analysis, result rendering, and aggregate JSON/HTML export;
- silent uninstall with exit code `0` and confirmation that the installed main executable was removed;
- matching unpacked-app E2E;
- four 1366 × 768 packaged Windows screenshots with no captured renderer errors or horizontal overflow; and
- distribution checksum and workflow-artifact upload gates.

The installed report identifies the app as `CausalPilot AI` 0.1.0, author `LAI ZEYU (来泽宇)`, platform `win32`, architecture `x64`, packaged `true`, and processing mode `offline-local-engine`. It used `实验 数据.csv`, round-tripped the Unicode path, matched frozen dataset SHA-256 `47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244`, exported schema `causalpilot.evidence.v1`, credited LAI ZEYU (来泽宇), and found no recognized raw-row collection.

The same tagged commit had already passed [Source validation run 33409072874](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33409072874) across Ubuntu/Windows and Python 3.9/3.13, plus [Security review run 33409072634](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33409072634) for JavaScript/TypeScript and Python CodeQL.

Temporary tagged-run artifacts retained until 2026-09-30:

- Distribution artifact `9764616084`, archive size 290,274,155 bytes, digest `sha256:4343839f8201633804f22a4d63b2ee230750901c43af70a4a82fda6b766d5925`.
- Validation artifact `9764625130`, archive size 175,634,152 bytes, digest `sha256:9493dc672fc2c56c18eaa10e22e97307fbeb37ba5cf4142dabbde38cc2e67afa`.

## Anonymous availability verification

After publication, unauthenticated HTTP requests returned `200` for:

- the public release page;
- the normalized checksum download;
- the installer download endpoint; and
- the ZIP download endpoint.

The anonymously downloaded checksum file had SHA-256 `a5f7d3e448f98b7556ce58c4586f9939a6576afd97733d8ec88562470391229a` and was byte-identical to the reviewed release copy.

## Preserved evidence

- [`SHA256SUMS-windows.txt`](SHA256SUMS-windows.txt)
- [`nsis-install-uninstall-report.json`](nsis-install-uninstall-report.json)
- [`packaged-e2e-installed-report.json`](packaged-e2e-installed-report.json)
- [`packaged-e2e-unpacked-report.json`](packaged-e2e-unpacked-report.json)
- [`windows-store-capture-report.json`](windows-store-capture-report.json)
- [`01-overview-1366x768.png`](01-overview-1366x768.png)
- [`02-import-mapping-1366x768.png`](02-import-mapping-1366x768.png)
- [`03-local-results-1366x768.png`](03-local-results-1366x768.png)
- [`04-evidence-reports-1366x768.png`](04-evidence-reports-1366x768.png)

The JSON copies normalize only the ephemeral GitHub workspace prefix. Their substantive fields match the downloaded tagged-run originals.

## Remaining boundaries

This public GitHub pre-release is not a clean consumer Windows 10/11 compatibility certification, trusted Authenticode signature, SmartScreen reputation record, WACK pass, Defender report, accessibility certification, Microsoft Store submission, Store certification, or Store availability proof. The native chooser return was stubbed only inside the disposable automated process. Full residue, reinstall/upgrade, interactive installer, standard-user, high-DPI, and clean-device matrices remain open.
