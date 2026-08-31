# CausalPilot AI 0.1.0 — Windows preview

> This GitHub preview and its attached artifacts are not evidence of Microsoft
> Store certification, public Store availability, production adoption, or
> formal scientific validation.

CausalPilot AI is an offline-first evidence workbench for declared randomized,
two-arm business experiments. Product author and accountable owner:
**LAI ZEYU (来泽宇)**.

Source: [github.com/lzy2767865503-pixel/causalpilot-ai](https://github.com/lzy2767865503-pixel/causalpilot-ai)

## Included workflow

- Import a local UTF-8 CSV and map unit, treatment, and outcome fields.
- Confirm the randomized-assignment design and aggregate decision target.
- Run binary risk-difference or continuous mean-difference analysis with the
  bundled deterministic Python engine.
- Review uncertainty, sample-ratio mismatch, missingness, sparse-information,
  and other implemented diagnostics.
- Compare the estimate with a practical business threshold.
- Export aggregate JSON and static HTML evidence locally.

Raw experiment rows remain on the device during the implemented workflow. The
application has no account, cloud sync, telemetry integration, external AI
call, or runtime language model in version 0.1.0.

## Windows artifacts

Successful GitHub-hosted Windows Server 2022 preflight
[33403432371](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33403432371)
at commit
[`f9b0d72716e4958f5b1d523eb926451707437dc6`](https://github.com/lzy2767865503-pixel/causalpilot-ai/commit/f9b0d72716e4958f5b1d523eb926451707437dc6)
produced:

- `CausalPilot-AI-0.1.0-windows-x64-setup.exe` — SHA-256
  `1af7f1f947eb83b7b98d43dd881ab03711b1bc44861cfdf9393376df60021e26`
- `CausalPilot-AI-0.1.0-windows-x64.zip` — SHA-256
  `bb1c986910e727b0f00f581abafdcb7a39aacd641b256a4d7b382d1b591f882d`
- `SHA256SUMS-windows.txt`

These hashes identify the temporary GitHub Actions preflight artifacts only,
not the files attached to the tagged release. The tag workflow rebuilds the
release independently; verify public downloads against the attached
`SHA256SUMS-windows.txt`, which is authoritative for the tagged build.
Do not attach the Microsoft Store APPX here unless its identity was generated
from exact Partner Center values and its separate Store checks were completed.

## Preflight evidence

The successful hosted run recorded:

- 17 frontend/path-contract tests and 15 deterministic-engine tests passed;
- the Windows x64 sidecar processed the frozen CSV from a Unicode path and
  returned the expected dataset hash;
- the packaged `win32`/`x64` executable completed CSV mapping, deterministic
  local analysis, result rendering, and aggregate JSON/HTML evidence export;
- the export used schema `causalpilot.evidence.v1`, credited
  `LAI ZEYU (来泽宇)`, matched the frozen dataset hash, and contained no
  recognized raw-row collection;
- no renderer console error or horizontal overflow was captured; and
- overview, mapping, results, and reports screenshots were each captured at
  exactly 1366 × 768.

The native file/folder chooser responses were stubbed only inside the
disposable automation process. Production file capabilities, validation,
packaged sidecar execution, renderer adaptation, and export handling were
exercised.

## Important boundaries

- The preflight ran on GitHub-hosted Windows Server 2022. It did not install the
  NSIS package on clean Windows 10 or Windows 11, so consumer-Windows
  installation and compatibility are not established.
- The native chooser, installer/uninstaller, relaunch-after-install, WACK,
  Defender, network observation, high-DPI/accessibility matrix, and retention
  behaviour were not established by this run.
- The packages have no verified trusted Authenticode publisher identity merely
  because they were built in GitHub Actions. Windows may show an
  unrecognized-publisher warning.
- No Partner Center Identity, Publisher, Store-bound AppX, Store upload,
  certification, public product page, or Store acquisition has been verified.
- The cited manual preflight produced temporary Actions artifacts only. The
  assets attached to this release come from the independent tagged build and
  must be verified with its attached checksum file.
- HR use is limited to aggregate programme, policy, cohort, or team-level
  evaluation. Individual employment decisions are rejected.
- Difference-in-differences, observational causal estimation, subgroup
  disclosure controls, and runtime generative-AI explanations are not included.
- Included benchmarks are development evidence, not a formal holdout study or
  external scientific review.

See `README.md`, `docs/METHOD_VALIDATION.md`, `evidence/evidence-matrix.md`, and
`SECURITY.md` before relying on or redistributing this preview.

Released under the MIT License. Copyright © 2026 LAI ZEYU (来泽宇).
