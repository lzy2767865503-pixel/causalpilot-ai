# Windows NSIS installer preflight — GitHub Actions run 33406656618

**Evidence date:** 2026-08-31
**Product author and accountable QA owner:** LAI ZEYU (来泽宇)
**State:** installer lifecycle `TESTED` on the recorded hosted runner; not a clean consumer-device compatibility certification
**Source commit:** `612a618a3de36ab53865354f9e8f0a5e9a05c26a`
**Workflow:** [Windows x64 package and draft release — run 33406656618](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33406656618)
**Build job:** `99535795882`

## Recorded environment

- GitHub-hosted `windows-2022` runner
- Microsoft Windows Server 2022, build `10.0.20348`
- x64 process architecture
- Node.js `22`
- Python `3.13`
- Electron `44.0.0`
- PyInstaller `6.22.2`

The same commit also passed [Source validation run 33406643887](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33406643887), including the engine matrix on Ubuntu and Windows with Python 3.9 and 3.13, and [Security review run 33406644806](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33406644806) for JavaScript/TypeScript and Python CodeQL.

## Successful installer lifecycle

After the normal 17 renderer/Electron/path-contract tests, 15 engine tests, Unicode-path sidecar smoke, production compilation, and NSIS/ZIP packaging succeeded, the workflow:

1. Started the exact NSIS installer in silent per-user mode with an isolated installation path under the workflow workspace.
2. Received installer exit code `0` and found the expected installed `CausalPilot AI.exe`.
3. Launched that installed executable through the packaged E2E harness.
4. Imported the frozen sample from `实验 数据.csv`, confirmed a Unicode path round trip, mapped four columns, and invoked the bundled local Windows engine.
5. Matched dataset SHA-256 `47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244` and engine version `causalpilot-engine 0.1.0`.
6. Rendered the expected local result with no captured console errors or horizontal overflow.
7. Exported aggregate JSON and HTML using schema `causalpilot.evidence.v1`, credited LAI ZEYU (来泽宇), and found no recognized raw-row collection in the exported JSON.
8. Started the generated NSIS uninstaller in silent mode, received exit code `0`, and confirmed that the installed main executable was removed.
9. Re-ran the packaged workflow from the matching `win-unpacked` output, captured four exact 1366 × 768 screenshots, generated checksums, and uploaded the distribution and validation records.

The native chooser return was stubbed only inside the disposable automation process. Production capability-token handling, input validation, installed executable, bundled sidecar, renderer, and evidence-export code were exercised.

## Preflight artifact identity

| File | Bytes | SHA-256 |
|---|---:|---|
| `CausalPilot-AI-0.1.0-windows-x64-setup.exe` | 123,900,931 | `22cf9261e8bf86f21637764c0c1d4f4807b0bce24567d22a1b9fa1020f4cdc88` |
| `CausalPilot-AI-0.1.0-windows-x64.zip` | 166,545,032 | `70cffa566f09fd105e64c9f83965e9bc5e5daeb7c6875201cfb50fe58aaa9c74` |

The downloaded copies were hashed independently on the evidence-review Mac and matched [`SHA256SUMS-windows-installer-preflight.txt`](SHA256SUMS-windows-installer-preflight.txt). ZIP integrity testing passed. The installed application and bundled engine are PE32+ x86-64 executables; the NSIS bootstrap is a normal PE32 self-extracting installer that carries the x64 payload.

GitHub retained these temporary workflow artifacts until 2026-09-30:

- Distribution artifact `9763560787`, archive size 290,273,391 bytes, archive digest `sha256:5d2a9e6eac3b94f0889bda704ed90620bc1ef632f9ccca0cee3a99fe0122e774`.
- Validation artifact `9763570004`, archive size 175,634,192 bytes, archive digest `sha256:30a6d097464417488354979144cf422cf5f315229a79efd62cac99d94dbe3a52`.

These hashes belong to this installer preflight commit. A tagged release is rebuilt independently, so the checksum file attached to the public GitHub Release is authoritative for public downloads.

## Preserved installer evidence

- [`nsis-install-uninstall-preflight-report.json`](nsis-install-uninstall-preflight-report.json) — platform, installer hash, install/uninstall exit codes, installed workflow assertions, and removal check.
- [`packaged-e2e-installed-preflight-report.json`](packaged-e2e-installed-preflight-report.json) — installed executable metadata, Unicode source file, local engine result, attribution, and aggregate export assertions.
- [`SHA256SUMS-windows-installer-preflight.txt`](SHA256SUMS-windows-installer-preflight.txt) — distribution checksums from the successful run.

The published JSON copies normalize the ephemeral GitHub workspace prefix. All substantive fields match the downloaded originals.

## Gates that remain open

- The runner was a provisioned Windows Server 2022 CI host, not a clean consumer Windows 10 or Windows 11 device.
- The automated test used silent install/uninstall in one isolated path. It did not cover interactive installer pages, an alternate drive, elevation, a standard-user account, reinstall, upgrade, repair, restart, Start menu or desktop shortcuts, or registry/file residue beyond confirming removal of the main executable.
- The real native chooser interaction, high-DPI matrix, keyboard-only flow, and screen-reader behaviour remain untested.
- No trusted Authenticode certificate was configured; Windows may display an unknown-publisher or SmartScreen warning.
- No Windows App Certification Kit, Microsoft Defender scan record, independent network observation, or final Partner Center-identity-bound Store AppX installation exists.
- A successful hosted preflight is not Microsoft Store certification or broad Windows compatibility proof.

The evidence-safe statement is:

> At commit `612a618a`, CausalPilot AI 0.1.0's x64 NSIS installer completed an
> automated install, installed-application analysis/export workflow, and
> uninstall smoke on the recorded GitHub-hosted Windows Server 2022 runner.

It is not evidence-safe to call that a clean-device Windows 10/11 compatibility certification, trusted-signed release, WACK pass, or Microsoft Store release.
