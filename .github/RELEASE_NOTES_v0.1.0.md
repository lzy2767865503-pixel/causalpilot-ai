# CausalPilot AI 0.1.0 — Windows preview

> Draft release notes. Publishing this draft or attaching an artifact is not
> evidence of Microsoft Store certification, public Store availability,
> production adoption, or formal scientific validation.

CausalPilot AI is an offline-first evidence workbench for declared randomized,
two-arm business experiments. Product author and accountable owner:
**LAI ZEYU (来泽宇)**.

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

The Windows release workflow is designed to produce:

- `CausalPilot-AI-0.1.0-windows-x64-setup.exe`
- `CausalPilot-AI-0.1.0-windows-x64.zip`
- `SHA256SUMS-windows.txt`

Only attach artifacts produced by a successful workflow or an equivalently
preserved Windows build. Verify the published SHA-256 values after downloading.
Do not attach the Microsoft Store APPX here unless its identity was generated
from exact Partner Center values and its separate Store checks were completed.

## Important boundaries

- Windows x64 is the intended target for this preview; compatibility must be
  stated only for versions actually tested in the corresponding build record.
- Packages are not Microsoft-signed merely because they were built in GitHub
  Actions. Windows may show an unrecognized-publisher warning unless a trusted
  signing process was completed.
- HR use is limited to aggregate programme, policy, cohort, or team-level
  evaluation. Individual employment decisions are rejected.
- Difference-in-differences, observational causal estimation, subgroup
  disclosure controls, and runtime generative-AI explanations are not included.
- Included benchmarks are development evidence, not a formal holdout study or
  external scientific review.

See `README.md`, `docs/METHOD_VALIDATION.md`, `evidence/evidence-matrix.md`, and
`SECURITY.md` before relying on or redistributing this preview.

Released under the MIT License. Copyright © 2026 LAI ZEYU (来泽宇).
