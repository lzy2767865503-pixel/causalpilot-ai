# CausalPilot AI 0.1 — Method Validation Register

**Method and evidence owner:** LAI ZEYU (来泽宇)  
**Audit date:** 2026-08-31  
**Assessment:** Share with caveats. The deterministic engine and its safety paths are implemented and regression-tested. A new versioned development benchmark records the current safety contract, but it is synthetic development evidence from a dirty, uncommitted source state—not a formal holdout or real-world validation.

This document records what the current code calculates, which checks can stop a result, what the UI exposes, and which claims remain unsupported. It is an implementation audit, not an external methods review. Every statement below is traced to repository code or tests; no external benchmark or performance metric is claimed.

## 1. Authoritative execution contract

Arbitrary CSV analysis has one product path:

1. The Electron main process resolves the local Python command, passes one JSON request over stdin, and parses one JSON object from stdout in [`analyzeWithLocalEngine`](../electron/engine-bridge.ts).
2. The Python CLI supports one-shot `analyze` and line-oriented `jsonl` modes in [`main`](../engine/causalpilot_engine/cli.py).
3. [`AnalysisRequest.from_mapping`](../engine/causalpilot_engine/models.py) and [`AnalysisSpec.from_mapping`](../engine/causalpilot_engine/models.py) validate the request before [`analyze_request`](../engine/causalpilot_engine/analysis.py) dispatches the analysis. `decision_target` is required: `aggregate_business_outcome` and `team_level_program_outcome` are accepted; `individual_employment_decision` returns `UNSUPPORTED_DECISION_TARGET` before any analysis.
4. [`adaptDesktopEngineResult`](../src/lib/desktopEngine.ts) converts proportions to percentage points for the UI. A structurally blocked engine result with no `decision_estimate` is rejected rather than converted into a zero estimate.

The browser does not analyze arbitrary CSV data. [`browserAnalysis.ts`](../src/lib/browserAnalysis.ts) contains only local import metadata helpers: SHA-256 text hashing, type/role suggestions, and a draft UI specification. [`App`](../src/App.tsx) permits the frozen synthetic result without Electron, but requires the desktop bridge for any selected CSV.

The built-in example in [`sampleResult.ts`](../src/data/sampleResult.ts) is a frozen demonstration bundle. It is not evidence from a user dataset and is not recomputed by the browser.

## 2. Population, contrast, and estimands

The implemented design is a fixed-horizon, two-arm comparison. The engine compares rows whose trimmed treatment value exactly equals the declared treatment level with rows whose value exactly equals the declared control level. Levels are case-sensitive strings after trimming. Other treatment values are blockers, not a third arm. Evidence: the row classification inside [`_analyze_valid_request`](../engine/causalpilot_engine/analysis.py).

The engine labels the causal estimand `intention_to_treat`, but operationally computes the treatment-minus-control contrast among rows with an observed valid outcome:

- Binary outcome: \(\hat p_T-\hat p_C\), the absolute risk difference. Denominators are valid, non-missing binary outcomes in each assigned group. The engine returns proportions; the UI adapter multiplies the estimate, interval, and group rates by 100 and labels them percentage points.
- Continuous outcome: \(\bar Y_T-\bar Y_C\), the arithmetic-mean difference among valid, non-missing numeric outcomes. The UI keeps this in outcome units.
- CUPED extension: the treatment-minus-control difference of the adjusted outcome \(Y-\theta(X-\bar X)\), estimated only among complete outcome/pre-metric pairs. This extension is callable through the Python contract but is disabled in the v0.1 UI.

Because missing outcomes are excluded, the numerical contrast is not a literal all-randomized-units ITT estimate unless outcome observation is complete or the complete-case assumptions hold. The `intention_to_treat` label is therefore conditional on the missingness caveat.

## 3. Binary outcome calculation

[`binary_risk_difference`](../engine/causalpilot_engine/statistics.py) implements:

- Point estimate: treatment event proportion minus control event proportion.
- Confidence interval: a Wilson interval is calculated separately for each group by [`_wilson_interval`](../engine/causalpilot_engine/statistics.py); the lower and upper risk-difference bounds combine the corresponding Wilson distances by root-sum-of-squares and clamp the result to `[-1, 1]`. The result is labeled `risk_difference_newcombe_wilson_ci_pooled_z` in [`_analyze_valid_request`](../engine/causalpilot_engine/analysis.py).
- Two-sided p-value: a pooled two-proportion z test of equality, using the pooled event proportion under the null and `erfc(|z| / sqrt(2))`.
- Degenerate pooled variance: if the pooled standard error is zero, equal observed rates produce `p=1`; a non-zero difference produces `p=0` and an infinite signed z statistic, which is serialized as `null` by [`_clean_json`](../engine/causalpilot_engine/analysis.py).

The confidence interval and p-value use different constructions. The implementation does not provide Fisher's exact test, a small-sample switch, cluster-robust uncertainty, or multiplicity correction.

## 4. Continuous outcome calculation

[`welch_from_summary`](../engine/causalpilot_engine/statistics.py) implements a Welch two-sample mean difference:

- Sample means and unbiased within-group sample variances use all valid complete outcomes.
- Standard error is \(\sqrt{s_T^2/n_T+s_C^2/n_C}\).
- Degrees of freedom use the Welch-Satterthwaite expression.
- The two-sided p-value and confidence critical value use the module's dependency-free Student-t CDF and quantile functions.
- At least two valid outcomes per group are required. Otherwise `_analyze_valid_request` adds `INSUFFICIENT_CONTINUOUS_SAMPLE`, produces no decision estimate, and blocks the result.
- If both variance contributions are zero, the interval collapses to the observed difference. The p-value is `1` for a zero difference and `0` for a non-zero difference.

No transformation, winsorization, robust location estimator, outlier sensitivity run, weighting, repeated-measures correction, or cluster adjustment is implemented. Therefore the UI must not claim an outlier-sensitivity analysis was run.

## 5. Structural and experiment-quality safeguards

The following behavior is implemented in [`_analyze_valid_request`](../engine/causalpilot_engine/analysis.py):

| Check | Exact behavior | Effect |
|---|---|---|
| File identity | SHA-256 is calculated over the CSV file's raw bytes by [`_sha256_file`](../engine/causalpilot_engine/analysis.py). | Provenance only. |
| Schema | Header required; duplicate headers, missing required columns, overlapping core columns, and a CUPED column overlapping a core column are detected. | Hard blocker. |
| Unit integrity | Unit IDs are trimmed, must be non-missing, and must be unique across rows. | Missing or duplicate ID is a hard blocker; no estimate is released. |
| Treatment integrity | Treatment must be non-missing and exactly one of the two declared levels; both arms must occur. | Hard blocker. |
| Outcome validity | Binary values must exactly match the declared positive/negative levels. Continuous values must parse to finite numbers. | Invalid non-missing values are hard blockers. |
| Malformed rows | Extra CSV values beyond the header are detected. | Hard blocker. |
| Observed outcomes | Each arm needs at least one valid binary outcome or two valid continuous outcomes. | Hard blocker if the minimum is not met. |
| SRM | Two-arm Pearson chi-square with one degree of freedom; expected counts derive from the declared treatment fraction. `p < srm_alpha` fails. The UI sends `srm_alpha=0.001`. | Hard blocker for decision and causal wording. The numerical estimate may remain in the engine bundle for audit. |
| Missing outcomes | Rates are calculated against valid assignment counts. Any missing outcome adds `MISSING_OUTCOMES`; an absolute treatment/control missing-rate gap of at least `0.05` also adds `DIFFERENTIAL_MISSING_OUTCOMES`. | Warning only unless an arm has too few observed outcomes. Estimation is complete-case. |
| Sparse binary information | After a valid binary estimate, the engine checks whether either observed group size is below 30 or any treatment/control success/failure cell is below 5. | `SPARSE_BINARY_OUTCOME` warning; estimate and wide interval remain available; readiness becomes `share_with_caveats`. |

SRM uses assignment counts before outcome filtering, so missing outcomes do not change the assignment-ratio test. Rows already blocked for missing unit ID or invalid treatment are not valid assignments. Passing SRM is a diagnostic result, not proof that randomization was correctly implemented.

The sparse-binary rule is an explicit information warning, not a power calculation and not an exact-test substitute. It does not change the Wilson-based risk-difference interval or pooled-z p-value. The current causal-claim state can remain `conditional_randomized_itt` with this warning, so the warning and wide interval must remain visible beside any decision language.

There is no maximum permitted missing-outcome rate. Even severe missingness is warning-only if both arms retain the minimum number of valid observations. This is a known high-risk limitation: a result may remain numerically decision-eligible even when complete-case selection could materially bias it.

## 6. CUPED safeguard and current product boundary

[`CupedSpec.from_mapping`](../engine/causalpilot_engine/models.py) rejects CUPED unless the request explicitly contains `is_pre_treatment: true`. It cannot verify that attestation against timestamps or source-system lineage.

When requested, [`_cuped_from_joint_moments`](../engine/causalpilot_engine/analysis.py):

1. pools complete outcome/pre-metric pairs from both arms;
2. calculates \(\theta=Cov(Y,X)/Var(X)\);
3. centers `X` on the pooled pre-metric mean;
4. adjusts outcomes in each arm; and
5. runs Welch inference on the adjusted group summaries.

At least two complete pairs per arm and non-zero pooled pre-metric variance are required. Missing or non-numeric pre-metrics generate `CUPED_PRE_METRIC_MISSING`; infeasible adjustment generates `CUPED_NOT_FEASIBLE` and leaves the raw estimate primary. If adjustment succeeds, the raw estimate remains in `estimates.raw`, the adjusted analysis is stored in `estimates.cuped`, and `estimates.decision_estimate_source` becomes `cuped`.

The Python tests verify attestation enforcement and the selected output path, but do not test CUPED bias, interval coverage, reference-library parity, or variance-reduction behavior. In addition, a CUPED estimate with missing pre-metrics uses a smaller complete-pair population than the raw estimate. For these reasons [`toDesktopEngineSpec`](../src/lib/desktopEngine.ts) always sends `cuped: null` in v0.1. The UI may suggest a covariate role, but that role is metadata only; it is not an attestation and does not trigger adjustment.

## 7. Business threshold and ROI

[`_business_interpretation`](../engine/causalpilot_engine/analysis.py) is deterministic and separate from statistical inference:

- The preferred direction is converted to a positive-is-better scale.
- `meets_threshold` requires the entire direction-adjusted interval to be strictly above the minimum practical effect.
- `does_not_meet_threshold` requires the entire interval to be strictly below the threshold.
- All overlap and equality cases are `inconclusive`.
- Any blocker or missing decision estimate makes business interpretation `not_evaluable`.

ROI is produced only when target population, value per outcome unit, and incremental treatment cost per unit are all supplied. Downside, base, and upside scenarios use the direction-adjusted confidence lower bound, point estimate, and upper bound. Net value is gross incremental value minus treatment cost; ROI is net value divided by treatment cost when cost is positive.

The current UI adapter supplies the practical threshold and currency, but not the three ROI inputs. Therefore arbitrary desktop CSV analyses do not receive a local-engine ROI scenario from the UI. The frozen synthetic example contains a demonstration ROI that must not be presented as a user-data calculation.

## 8. Causal-language boundary

[`_causal_claims`](../engine/causalpilot_engine/analysis.py) emits four states:

- `conditional_randomized_itt`: randomized assignment was user-confirmed, an estimate exists, and no blocker exists.
- `association_only`: an estimate exists, but randomized assignment was not confirmed.
- `blocked`: an estimate may exist, but one or more quality blockers exist.
- `not_evaluable`: no estimate exists.

The allowed causal interpretation is conditional on correct operational randomization, matching analysis/randomization units, post-assignment outcome measurement without differential logging loss, no material interference, and valid pre-treatment status for any CUPED covariate. These are declared assumptions; the code does not verify them.

The engine explicitly forbids interpreting a p-value as the probability the null is true, treating significance as business importance, calling the contrast a per-protocol effect, inferring individual treatment effects from subgroup differences, or using the result for automated individual HR decisions.

This narrative prohibition is reinforced at input validation: [`_decision_target`](../engine/causalpilot_engine/models.py) permits only aggregate business or team-level programme outcomes and emits the structured `UNSUPPORTED_DECISION_TARGET` error for `individual_employment_decision`. It does not use analysis-name keywords or infer intent from outcome-column text. This enum is a purpose gate, not proof of aggregation, privacy, fairness, lawful basis, or policy compliance; the engine does not inspect whether row identifiers represent identifiable employees or enforce a minimum team size.

Timestamp roles in the UI are not part of the Python request schema. The engine does not check assignment/outcome ordering or detect post-treatment leakage. A causal claim must not say those checks passed.

## 9. Determinism and provenance

[`_canonical_json`](../engine/causalpilot_engine/analysis.py), [`_digest`](../engine/causalpilot_engine/analysis.py), and [`_sha256_file`](../engine/causalpilot_engine/analysis.py) provide:

- a plan hash from the normalized analysis specification;
- a result ID from engine version, dataset SHA-256, and plan hash; and
- a generated request ID from the same identity when the caller does not supply one.

For the same file bytes and identical request payload, the Python result is deterministic and contains no runtime timestamp. The CLI emits sorted JSON keys. The deterministic-rerun test compares the full Python result and canonical serialized bytes.

The adapted UI `ResultBundle` is not byte-deterministic because [`adaptDesktopEngineResult`](../src/lib/desktopEngine.ts) adds `createdAt: new Date().toISOString()`, and the desktop request ID is timestamp-based in [`App`](../src/App.tsx). Dataset hash, plan hash, result ID, statistical values, and engine narrative remain the reproducible evidence fields.

Raw local paths from the engine result are sanitized by [`sanitizeEngineResult`](../electron/engine-bridge.ts) before reaching the renderer.

## 10. UI contract audit

| Surface | Verified behavior | Boundary or limitation |
|---|---|---|
| Desktop request adapter | Sends `decision_target: aggregate_business_outcome`, two declared levels, binary coding `1/0`, allocation, SRM alpha, confidence level, randomized-design confirmation, practical threshold, and `cuped: null`. | v0.1 has no UI selector for the team-level programme target, alternate binary encodings, ROI inputs, CUPED attestation, or timestamp checks. |
| Desktop result adapter | Scales binary outputs to percentage points and maps engine blockers/warnings into the UI bundle. It preserves an SRM-blocked estimate for audit, renders sparse binary information as a non-blocking review diagnostic, and rejects blocked results with no decision estimate. | Only a subset of diagnostics receives a dedicated card; other engine messages remain in limitations or the thrown error. |
| Browser surface | Shows the frozen synthetic bundle and import mapping suggestions. | It does not calculate arbitrary CSV statistics. |
| Planning panel | [`adaptDesktopEngineResult`](../src/lib/desktopEngine.ts) calculates approximate power and MDE from observed rates and normal constants. | This is presentation-side, not returned by the Python engine, and has no benchmark test. It must remain labeled an approximation and not a validated decision metric. |
| Frozen sample | [`sampleResult`](../src/data/sampleResult.ts) is fixed and explicitly marked `synthetic_demo`; sample mapping and plan controls are locked in [`ImportWorkspace`](../src/features/import/ImportWorkspace.tsx). | Its numbers and ROI are demonstration evidence only and are not recomputed in the browser. |

## 11. Current regression evidence

[`engine/tests/test_engine.py`](../engine/tests/test_engine.py) and [`engine/tests/golden/valid_binary_expected.json`](../engine/tests/golden/valid_binary_expected.json) cover:

- one valid binary golden result;
- SRM blocking and causal/business suppression;
- duplicate-unit blocking with no estimate;
- missing-outcome warning behavior;
- byte-equivalent rerun behavior;
- one continuous Welch point estimate and degrees-of-freedom check;
- one CUPED output-path and attestation check;
- one-shot and JSONL CLI behavior;
- deterministic synthetic CSV generation; and
- rejection of an unattested CUPED request;
- required decision-target validation, structured rejection of an individual employment-decision target, and acceptance of a team-level programme target; and
- a sparse-event warning that preserves the interval and a non-blocked, caveated result.

[`desktopEngine.test.ts`](../src/lib/desktopEngine.test.ts) covers percentage-point conversion, evidence identifiers, continuous units, UI CUPED suppression, structural-block rejection, and retention of an SRM-blocked audit estimate. [`browserAnalysis.test.ts`](../src/lib/browserAnalysis.test.ts) covers only browser hashing and mapping suggestions. [`App.test.tsx`](../src/App.test.tsx) covers the frozen example workflow and the requirement for the desktop engine on arbitrary CSV import.

These tests demonstrate code-path stability for their fixtures. They do not establish nominal confidence-interval coverage, calibrated type-I error, power, robustness to sparse events, numerical parity with an independent implementation, or real-world causal validity.

Latest local audit execution on 2026-08-31:

- Python engine regression suite: 14 passed.
- UI regression suite: 14 passed across 3 test files.
- TypeScript, Vite, and Electron build command: exited successfully.
- The preserved [`current-mvp-development-v0.2.json`](../evidence/results/causalpilot-benchmark-v0.1-planning/current-mvp-development-v0.2.json) run used harness 0.2.0 and 250 stochastic replications per executed family. F05 recorded `SPARSE_BINARY_OUTCOME` and `share_with_caveats` for all 3 fixed sparse fixtures; F09 matched all 7 predefined safety fixtures, including `UNSUPPORTED_DECISION_TARGET`. Its verified SHA-256 is `c8734fd34ba9bd420f2887bcccf2e4eb93e7d02deca994b7b0af36d4ffb4d41b`. The artifact explicitly records `formal_holdout: false`; F07 and F08 DiD remain unimplemented and not run.

## 12. Known limitations and release claims

The following are not implemented or not validated:

- multi-arm, factorial, clustered, paired, repeated-measures, switchback, sequential, or adaptive experiments;
- multiple-testing correction, subgroup-inference control, covariate-balance testing, randomization inference, or exact binary tests;
- ratio, count, time-to-event, ordinal, or bounded-continuous outcome models;
- missing-data imputation, inverse-probability weighting, attrition bounds, or a hard missingness release threshold;
- robust/outlier-sensitive continuous analysis;
- timestamp-order, exposure, contamination, interference, or source-lineage validation;
- independent verification that the user-confirmed assignment was randomized;
- decision-target inference beyond the two explicit supported aggregate enum values;
- minimum-group suppression, protected-attribute governance, fairness analysis, or employment-law compliance for team-level programme data;
- observational causal identification;
- CUPED simulation coverage, independent parity, and UI disclosure of raw versus adjusted samples;
- reference-library parity for the Student-t routines and boundary cases; and
- validated power/MDE calculations in the product UI.

Permitted release wording: the product implements a deterministic offline two-arm randomized-experiment analysis engine with the estimators and safeguards recorded here.

Not permitted release wording: “all causal assumptions are verified,” “the method is fully statistically validated,” “CUPED is available in the v0.1 UI,” “browser uploads are analyzed,” “timing leakage is checked,” or any accuracy, coverage, bias-reduction, power, or business-impact metric not supported by a saved benchmark artifact.

## 13. Reproduction commands

Run the engine check from `engine/`, then run the UI checks from the repository root:

```text
cd engine
.venv/bin/python -m pytest tests -q -p no:cacheprovider
cd ..
npm test
npm run build
```

Passing these commands verifies the committed regression and type/build contracts. It does not close the statistical-validation gaps listed above.
