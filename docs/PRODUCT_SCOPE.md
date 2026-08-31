# CausalPilot AI — English v1 Product Scope

**Product author and evidence owner:** LAI ZEYU (来泽宇)  
**Version target:** 0.1.0 desktop MVP  
**Primary audience:** Marketing analysts; ethical team-level HR intervention analysts  
**Operating model:** Offline-first desktop application. Raw rows stay on the user's device.

## Decision problem

CausalPilot AI turns a randomized two-group business experiment into a locked analysis plan, a deterministic estimate, visible design diagnostics, and an evidence-linked report. It is intentionally narrower than a general “causal AI” product.

## Required v1 workflow

1. Open the built-in checkout incentive example or import a CSV.
2. Map unit, treatment, and outcome fields. The UI may label optional covariate or timing candidates, but v0.1 does not use them in estimation.
3. Declare a structured aggregate decision target. Supported targets are aggregate business outcomes and team-level programme outcomes; individual employment decisions are rejected.
4. Run implemented preflight checks for duplicates, missing unit IDs, missing or invalid treatment encoding, invalid outcomes, empty groups, missing outcomes, sparse binary information, and sample-ratio mismatch.
5. Lock an `AnalysisSpec`; create a stable plan hash.
6. Estimate a binary risk difference or continuous mean difference with the configured two-sided confidence interval (95% by default).
7. Show effect size, uncertainty, sample size, business threshold, and diagnostics together.
8. Produce a deterministic business interpretation and optional ROI scenario.
9. Export the ResultBundle, run manifest, and human-readable evidence report.

## v1 methods

- Randomized two-group A/B experiments.
- Binary outcomes: absolute risk difference, confidence interval, two-sided test.
- Continuous outcomes: mean difference with Welch uncertainty.
- The Python engine contains an explicit-attestation CUPED extension for direct validation. The v0.1 product UI does not submit CUPED requests and does not claim adjusted results.
- Sample-ratio mismatch and data-quality diagnostics.
- A non-blocking sparse-binary warning when either group has fewer than 30 observed outcomes or any observed success/failure cell is below 5.
- Power/MDE planning is a visible planned module; it must not be reported as validated until its benchmark passes.

## Explicit exclusions

- No causal claims from arbitrary observational CSV files.
- No automated metric shopping or post-result primary-outcome changes.
- No individual hiring, firing, promotion, or employee-risk decisions.
- No login, payment, cloud sync, multi-user collaboration, or shared AI quota in v1.
- No PSM, AIPW, DML, causal forest, synthetic control, or staggered DiD in v1.
- No LLM calculation. Optional language-model features may only explain structured aggregate results.

## Exact UI and engine boundary

- Arbitrary CSV analysis is available only in the desktop application through the deterministic local Python engine. The browser surface can show the frozen synthetic example but does not calculate uploaded CSV results.
- Mapping a field as a pre-treatment covariate is not an attestation that it predates assignment. The UI therefore sends `cuped: null` in v0.1.
- Treatment-time and outcome-time roles are metadata labels only. The current engine request has no timing fields and performs no timestamp-order or automated post-treatment-leakage check.
- Causal wording depends on user confirmation of randomized assignment plus the implemented blockers. The software does not independently verify the operational randomization process, interference, or logging completeness.
- The Python request requires `decision_target`. It accepts `aggregate_business_outcome` and `team_level_program_outcome`; `individual_employment_decision` is rejected before analysis. The desktop UI sends `aggregate_business_outcome` in v0.1.
- Accepting `team_level_program_outcome` does not verify aggregation, privacy, fairness, legal basis, or minimum group size. Those controls remain separate release requirements.

## Failure-safe position

If the core randomized A/B engine cannot match the reference implementation and predefined benchmark tolerances, the product narrows to **ExperimentGuard**, an experiment quality audit and evidence-reporting workbench. A null or non-significant result is not a product failure.
