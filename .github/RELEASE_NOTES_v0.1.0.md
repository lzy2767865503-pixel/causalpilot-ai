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

The tagged GitHub-hosted Windows Server 2022 workflow
[33409332005](https://github.com/lzy2767865503-pixel/causalpilot-ai/actions/runs/33409332005)
built annotated tag `v0.1.0` at commit
[`b2a226ac9e2623ba210a192095d2feb2eb7dacf4`](https://github.com/lzy2767865503-pixel/causalpilot-ai/commit/b2a226ac9e2623ba210a192095d2feb2eb7dacf4)
and produced the attached public files:

- `CausalPilot-AI-0.1.0-windows-x64-setup.exe` — SHA-256
  `3d8f12ea5dc999cd014710ef78c7e6dcce467a2aa20c5a609f37ca35b116a0ce`
- `CausalPilot-AI-0.1.0-windows-x64.zip` — SHA-256
  `76fca35d57595f480a06c4e89d51e28b4f8e424d3e737a26ffdbe84ae508d790`
- `SHA256SUMS-windows.txt` — SHA-256
  `a5f7d3e448f98b7556ce58c4586f9939a6576afd97733d8ec88562470391229a`

The draft assets were downloaded and independently rehashed before publication.
The checksum file uses UTF-8 without BOM and LF line endings, and both binary
entries passed `shasum -a 256 -c` after the portability correction. The release
page and all three asset endpoints returned HTTP 200 without authentication.
Verify every download against the attached `SHA256SUMS-windows.txt`.
Do not attach the Microsoft Store APPX here unless its identity was generated
from exact Partner Center values and its separate Store checks were completed.

## Tagged release evidence

The successful tagged run recorded:

- 17 frontend/path-contract tests and 15 deterministic-engine tests passed;
- the Windows x64 sidecar processed the frozen CSV from a Unicode path and
  returned the expected dataset hash;
- the packaged `win32`/`x64` executable completed CSV mapping, deterministic
  local analysis, result rendering, and aggregate JSON/HTML evidence export;
- the NSIS installer returned exit code 0, the installed executable completed
  the same local workflow, the silent uninstaller returned exit code 0, and the
  installed main executable was removed;
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

- The tagged package ran on GitHub-hosted Windows Server 2022 and exercised silent
  install, installed-app launch/workflow, silent uninstall, and main-executable
  removal. It was not a clean Windows 10 or Windows 11 consumer device, so
  broad consumer-Windows compatibility is not established.
- The real native chooser, interactive installer pages, standard-user matrix,
  reinstall/upgrade, complete residue audit, WACK, Defender, network
  observation, high-DPI/accessibility matrix, and retention behaviour were not
  established by this run.
- The packages have no verified trusted Authenticode publisher identity merely
  because they were built in GitHub Actions. Windows may show an
  unrecognized-publisher warning.
- No Partner Center Identity, Publisher, Store-bound AppX, Store upload,
  certification, public product page, or Store acquisition has been verified.
- The assets attached to this release come from the tagged build and are the
  public binaries identified by the hashes above.
- HR use is limited to aggregate programme, policy, cohort, or team-level
  evaluation. Individual employment decisions are rejected.
- Difference-in-differences, observational causal estimation, subgroup
  disclosure controls, and runtime generative-AI explanations are not included.
- Included benchmarks are development evidence, not a formal holdout study or
  external scientific review.

See `README.md`, `docs/METHOD_VALIDATION.md`, `evidence/evidence-matrix.md`, and
`SECURITY.md` before relying on or redistributing this preview.

Released under the MIT License. Copyright © 2026 LAI ZEYU (来泽宇).
