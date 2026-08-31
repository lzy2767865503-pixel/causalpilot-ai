# CausalPilot AI Evidence Matrix

Status: claim-control document with two preserved measured development benchmarks and frozen-commit Windows x64 package and installer preflights; formal holdout not run
Created: 2026-08-31  
Project author and evidence owner: LAI ZEYU (来泽宇)

## Purpose

This matrix prevents future application, résumé, portfolio, demo, and release statements from outrunning the available evidence. Individual rows link to implementation, test, and package records; the matrix by itself does not extend those records into clean-target installation, trusted platform signing, a public binary release, Store certification, adoption, or use by a real organisation.

Every future number must include its definition, numerator and denominator where applicable, evaluation split, time or run date, software version, and evidence location. A planned command is not evidence until it has run successfully and its output has been preserved.

## Evidence states

Use exactly one state for each claim:

1. **PLANNED** — requirement or target only.
2. **IMPLEMENTED** — code exists; runtime behaviour is not yet verified.
3. **TESTED** — a defined test ran and the result artifact was preserved.
4. **PACKAGED** — a distributable artifact was created and hashed.
5. **INSTALLED** — a clean-target installation and launch were observed.
6. **SIGNED / NOTARIZED** — the platform verification record exists for the exact artifact.
7. **PUBLICLY AVAILABLE** — an unauthenticated external check reached the exact public release or deployment.

The later states do not automatically validate earlier scientific claims. For example, a notarized application can still contain an invalid estimator.

## Future admissions-claim map

Rows remain **PLANNED** unless the precise evidence named below exists. Current non-planned states are limited to the recorded historical Mac snapshot and artifact, the frozen-commit Windows package/installer preflights, and the public source repository. A **TESTED — DEVELOPMENT ONLY** state records a real development measurement but does not establish a formal holdout pass or application-ready validation claim.

| Candidate future claim | Current state | Required evidence artifact | Planned verification command or procedure | Version fields required | Claim allowed only after verification | Wording that remains prohibited |
|---|---|---|---|---|---|---|
| Designed a versioned benchmark protocol | TESTED — manifest parsed; development harness consumed it | `evidence/benchmark-manifest.json` plus its SHA-256 | `jq empty evidence/benchmark-manifest.json` and `shasum -a 256 evidence/benchmark-manifest.json` | Manifest version, schema version, creation date | “Designed a versioned development/holdout benchmark protocol and executed the recorded development run” | “Validated the engine” or “passed holdout targets” |
| Built a working end-to-end analysis product | TESTED — historical exact-DMG E2E plus frozen-commit Windows x64 installer preflight | Historical Mac records plus `evidence/releases/0.1.0/windows/windows-installer-preflight-run-33406656618.md` and its installed packaged E2E report | Historical exact-DMG workflow; Windows Actions run `33406656618` installed the NSIS package and exercised mapping, bundled local analysis, results, export, and uninstall | App 0.1.0; historical Mac artifact has no build-time source commit; Windows installer-preflight commit `612a618a3de36ab53865354f9e8f0a5e9a05c26a` | “Built and tested an offline workflow on the recorded build Mac and in an installed application on the recorded Windows-hosted runner” | “Production-ready”, “enterprise-grade”, or clean consumer-target Windows/macOS compatibility |
| Supports a named statistical method | TESTED — limited current-MVP scope | Method specification, unit/golden tests, reference-comparison output, current development result JSON | `PYTHONPATH=engine engine/.venv/bin/python -m pytest engine/tests -q` and `engine/.venv/bin/python scripts/run_evidence_benchmark.py --split development --run-id current-mvp-development-v0.2` | Engine 0.1.0, engine-source hash, harness 0.2.0, manifest version, fixture/generator version | “Implemented and tested binary risk difference, continuous Welch difference, SRM fixtures, CUPED, sparse warnings, and structured decision-target safety on the recorded synthetic/fixed scope” | “Universally valid”, “unbiased in all cases”, or any DiD implementation claim |
| Ran ground-truth simulation benchmarks | TESTED — DEVELOPMENT ONLY; formal holdout not run | Current: `evidence/results/causalpilot-benchmark-v0.1-planning/current-mvp-development-v0.2.json`; v0.1 retained as prior evidence | `engine/.venv/bin/python scripts/run_evidence_benchmark.py --split development --run-id current-mvp-development-v0.2`; preserve stdout, source hashes, and result hash | Manifest and result versions, engine/harness source hashes, environment, seeds; source commit is currently unavailable | State only the actual development split, family, replication count, result, and gaps | “Passed ground-truth validation”, citing planned thresholds as achieved, or omitting unimplemented families |
| Controlled false positives or interval coverage | TESTED — MEASURED BUT NOT ESTABLISHED | Family-level development summary in the versioned result JSON; future formal holdout still required | Recompute from per-scenario deterministic seeds or rerun the exact harness against the recorded source hash | Family ID/version, replications, alpha, engine and harness source hashes | “Observed [actual rate] in the recorded development simulation” | “Controlled at 5%”, “95% accurate”, or “met target”; development results cannot establish the planned formal-holdout targets |
| Reproduces the same numeric result | TESTED — limited to recorded checks | Engine unit test plus first-five deterministic rerun checks in F01 and F02 | `PYTHONPATH=engine engine/.venv/bin/python -m pytest engine/tests -q`; inspect `deterministic_rerun_match_rate_first_five` in result JSON | Engine version/source hash, manifest and result versions, Python/platform | “Matched repeated deterministic result bundles for the recorded checks” | Claiming all workflows, PDF files, AI prose, or changed environments are byte-identical |
| Generated evidence-linked reports | TESTED — synthetic packaged workflows on the recorded Mac and Windows runner | Historical Mac E2E records plus `evidence/releases/0.1.0/windows/packaged-e2e-report.json` | The packaged workflows exported JSON + HTML and asserted schema, author, dataset hash, and absence of recognized raw-row keys | Report schema `causalpilot.evidence.v1`, app 0.1.0, platform/artifact identity, synthetic data hash | “Exported an aggregate JSON/HTML evidence bundle in the recorded synthetic packaged workflows” | “Hallucination-free”, every possible raw-data shape is detected, or externally audited reporting |
| Protects raw local data from optional external AI | TESTED — limited architecture/export boundary on recorded package tests | Main/preload/sidecar source, export sanitizer, historical package E2E, and `evidence/releases/0.1.0/windows/packaged-e2e-report.json` | Inspect the relevant exact build and run package E2E; a preserved independent network capture remains future work | App 0.1.0, offline local-engine mode, platform/artifact identity, test date | “In the tested workflows, the local sidecar processed the CSV and the exported bundle contained no recognized raw-row collection” | “Zero data risk”, “no byte can ever leave the device”, or vendor-retention claims without network proof |
| Provides a Marketing Analytics case study | TESTED — synthetic demonstration only | Frozen sample metadata, historical exact-DMG result, and Windows installed packaged E2E result | Re-run the packaged synthetic checkout-incentive workflow and verify dataset SHA-256 `47ab1a639eecfbb1630063298d6d3b447bac5123e87d6e9653bdc283bf9de244` | Synthetic case version/hash, app 0.1.0, platform/artifact identity; Windows installer preflight has commit `612a618a…`, historical Mac build does not | “Demonstrated a synthetic marketing A/B workflow with the recorded question, method, result, and limitations” | Invented client, revenue, adoption, or real-world uplift |
| Provides an HR Analytics case study | PLANNED | Aggregate intervention case, safety review, result bundle, limitations | Re-run the case and confirm no individual employment recommendation is emitted | Case version, data provenance, safety-policy version | “Demonstrated aggregate intervention evaluation using [actual dataset type]” | “Improves hiring quality” without real validated evidence |
| Packaged a desktop or installable release | PACKAGED — historical arm64 DMG and frozen-commit Windows x64 installer preflight | Historical Mac package record/checksums plus `evidence/releases/0.1.0/windows/windows-installer-preflight-run-33406656618.md` and `SHA256SUMS-windows-installer-preflight.txt` | Historical DMG hash/verify/mounted E2E; Windows run `33406656618` built and hashed NSIS + ZIP from commit `612a618a…` | App 0.1.0; Mac arm64 SHA-256 `c5e6d656…`; Windows x64 installer `22cf9261…` and ZIP `70cffa56…` | “Packaged and internally tested CausalPilot AI 0.1.0 for Apple silicon and as a Windows x64 installer preflight” | “Installed on a clean target”, trusted-signed, “public binary release”, or Store-available |
| Installed and launched on a clean target | TESTED — hosted-runner installer lifecycle; not clean-target INSTALLED | Historical Mac launch record plus Windows installer preflight and installed packaged E2E report | The DMG was launched from a read-only mount on the build Mac; the NSIS package was silently installed, exercised, silently uninstalled, and its main executable confirmed removed on the GitHub-hosted runner; separate clean-device installation remains required | Artifact/commit identity, platform/architecture, install/uninstall exit codes, test date | “Completed an automated install, installed-app workflow, and uninstall smoke on the recorded Windows Server 2022 runner” | “Clean-installed”, general Windows 10/11 compatibility, complete residue removal, “works on all Macs”, or Intel compatibility |
| Signed or notarized a release | TESTED — historical macOS ad-hoc integrity only; trusted signing not achieved | Historical signing record plus Windows preflight limitations | Historical `codesign --verify --deep --strict` passed and `spctl` rejected; no Windows Authenticode identity, Apple notarization, or Store re-signing evidence exists | Exact artifact, signature type, Team/publisher identity status, test date | “The historical Mac app has a verified ad-hoc local integrity signature” | “Developer ID signed”, “notarized”, “trusted-signed on Windows”, “Gatekeeper approved”, or identity-assured |
| Made the source code publicly available | PUBLICLY AVAILABLE — source only | Public repository `https://github.com/lzy2767865503-pixel/causalpilot-ai` and unauthenticated HTTP check | On 2026-08-31 the repository returned HTTP 200 and public `main` resolved to `612a618a3de36ab53865354f9e8f0a5e9a05c26a` | Repository URL, branch/commit, check date | “Published the CausalPilot AI source repository on GitHub” | Implying that source publication makes any installer, GitHub Release, or Store listing public |
| Made a binary release publicly available | PLANNED | Public GitHub Release or Store URL plus an unauthenticated download/listing check | Publish the exact hashed binary, then retrieve it from a separate unauthenticated session and compare its checksum | Release/tag or Store product ID, artifact hash, publication date | “The [exact artifact] is publicly downloadable at [URL]” only after that check | “Released publicly” based on temporary Actions artifacts, a draft release, source code, or a Store submission in review |
| LAI ZEYU led the product and QA | TESTED — release attribution and disclosure present | Contribution/AI disclosure, author files, app metadata, exported reports, Windows screenshots, and this release summary | Reconcile author-bearing source, UI, package, screenshot, and evidence surfaces with the AI-assistance disclosure | Release 0.1.0, evidence date, repository and historical-build boundaries | “Product author, problem owner, evidence owner, and QA owner” with the recorded AI-assistance disclosure | “Hand-coded every line” or sole implementation without AI/third-party assistance |

## Source and artifact chronology

The first Windows x64 package preflight is traceable to commit
`f9b0d72716e4958f5b1d523eb926451707437dc6` and run `33403432371`. The later
installer preflight is traceable to commit
`612a618a3de36ab53865354f9e8f0a5e9a05c26a` and run `33406656618`; it added
silent install, installed-app E2E/export, silent uninstall, and main-executable
removal evidence. Both preserved records are under
`evidence/releases/0.1.0/windows/`.

The source repository is now public. That fact does not make the Windows
Actions artifacts or any macOS binary a public binary release. No GitHub
Release or Microsoft Store listing was publicly available at the recorded
check time.

The earlier macOS DMG and development-benchmark records explicitly state that
no frozen Git commit existed at their build/run time. The repository and its
current history were created later and do not retroactively freeze, identify,
or prove the exact source snapshot that produced those historical artifacts.
Their existing snapshot/hash evidence remains valid only within its documented
boundary.

## Historical measured development benchmark v0.1 — preserved

Artifact:

`evidence/results/causalpilot-benchmark-v0.1-planning/current-mvp-development-v0.1.json`

Artifact SHA-256:

`d55f14265f3a719eef45af33952a375e6f4084c4d79ecccfa7adc9b814909392`

Exact benchmark command:

```sh
python3 scripts/run_evidence_benchmark.py --split development --run-id current-mvp-development-v0.1
```

Result: exit code 0; 250 stochastic development replications per executed family; five families implemented, two partially implemented, and two not implemented. The run lasted 8.118247 seconds in the recorded environment. No Git commit existed, so the harness marked `formal_holdout: false`.

Exact engine-test command that passed:

```sh
PYTHONPATH=engine engine/.venv/bin/python -m pytest engine/tests -q
```

Result: 10 tests passed. The package command `npm run test:engine` was also checked and exited 1 because the system Python did not have `pytest`; therefore that package script is not evidence of a passing test path until its environment is fixed.

| Family | Actual scope and denominator | Actual measured result | Evidence-safe interpretation |
|---|---|---|---|
| F01 binary null | 250 simulations; true risk difference 0 | Mean estimate −0.00128; coverage 0.928; p<0.05 rate 0.072; independent estimate agreement 250/250 | Development measurement only. The observed rate/coverage are numerically outside the planned 1,000-run holdout bands; no pass claim. |
| F02 binary effect | 250 simulations; true risk difference 0.10 | Mean estimate 0.100416; mean bias 0.000416; coverage 0.94; p<0.05 rate 0.968; independent estimate agreement 250/250 | The p<0.05 rate is empirical detection frequency for this configured effect, not model accuracy or business uplift. |
| F03 continuous | 125 null and 125 positive-effect simulations | Null: mean 0.014788, coverage 0.912, p<0.05 rate 0.088. Effect truth 0.5: mean 0.493792, coverage 0.92. Independent estimate/SE agreement 250/250. | Both coverage values are numerically below the planned formal-holdout band. Development result only. |
| F04 SRM | 3 fixed allocation fixtures | Expected behaviour matched 3/3 | Limited to balanced 50/50, mild 55/45, and severe 90/10 fixtures; not sensitivity/specificity evidence. |
| F05 sparse/low power | 3 fixed sparse-event fixtures | Non-decisive business interpretation 3/3; dedicated sparse/low-power warning 0/3 | Partial implementation. The normal-approximation method must not be called an exact sparse-event method. |
| F06 CUPED | 250 simulations; true effect 0.5 | Mean adjusted estimate 0.502091; mean bias 0.002091; coverage 0.936; independent theta and estimate agreement 250/250 | Agreement covers the recorded formulas and generator, not general causal validity. |
| F07 DiD valid design | Not run | Not implemented | No DiD implementation or accuracy claim. |
| F08 DiD assumption violations | Not run | Not implemented | No pre-trend/anticipation diagnostic claim. |
| F09 data/safety | 7 fixed fixtures | Expected safety behaviour matched 6/7 | Duplicate/missing/invalid/post-treatment cases were blocked as recorded. Individual HR decision intent was not refused at input level; planned complete-detection target not achieved. |

Historical v0.1 safe summary:

> Executed a versioned synthetic development benchmark for CausalPilot engine 0.1.0, preserving family-level results, independent formula comparisons, two unimplemented DiD families, and two measured safety/method gaps. A formal holdout validation has not been run.

## Current measured development benchmark v0.2 — 2026-08-31

Artifact:

`evidence/results/causalpilot-benchmark-v0.1-planning/current-mvp-development-v0.2.json`

Artifact SHA-256:

`c8734fd34ba9bd420f2887bcccf2e4eb93e7d02deca994b7b0af36d4ffb4d41b`

Exact benchmark command:

```sh
engine/.venv/bin/python scripts/run_evidence_benchmark.py --split development --run-id current-mvp-development-v0.2
```

Result: exit code 0; 250 stochastic development replications per executed family; seven families implemented, zero partially implemented, and two DiD families not implemented. The run lasted 8.787888 seconds in the recorded environment. No Git commit existed and the working tree was not clean, so `formal_holdout` remains false.

Exact engine-test command:

```sh
PYTHONPATH=engine engine/.venv/bin/python -m pytest engine/tests -q
```

Result: 14 tests passed. The root `npm run test:engine` script was corrected to use `engine/.venv/bin/python` and was rerun successfully with the same 14/14 result. This verifies the recorded unit/golden/safety suite only.

| Family | Actual scope and denominator | Actual measured result | Evidence-safe interpretation |
|---|---|---|---|
| F01 binary null | 250 simulations; true risk difference 0 | Mean estimate −0.000136; coverage 0.948; p<0.05 rate 0.052; independent estimate agreement 250/250 | Development measurement only; no formal target-pass claim. |
| F02 binary effect | 250 simulations; true risk difference 0.10 | Mean estimate 0.100040; mean bias 0.000040; coverage 0.952; p<0.05 rate 0.972; independent estimate agreement 250/250 | Detection frequency for the configured synthetic effect is not product accuracy or business impact. |
| F03 continuous | 125 null and 125 positive-effect simulations | Null: mean −0.005532, coverage 0.952, p<0.05 rate 0.048. Effect truth 0.5: mean 0.504119, coverage 0.984. Independent estimate/SE agreement 250/250. | Positive-effect coverage is numerically above the planned formal-holdout band. Development result only; no pass claim. |
| F04 SRM | 3 fixed allocation fixtures | Expected behaviour matched 3/3 | Limited to the recorded fixtures; not sensitivity/specificity evidence. |
| F05 sparse/low power | 3 fixed sparse-event fixtures | `SPARSE_BINARY_OUTCOME` warning 3/3; `share_with_caveats` 3/3; non-decisive business interpretation 3/3 | The warning closes the recorded v0.1 fixture gap but does not validate normal approximation for every sparse design. |
| F06 CUPED | 250 simulations; true effect 0.5 | Mean adjusted estimate 0.489581; mean bias −0.010419; coverage 0.948; independent theta/estimate agreement 250/250 | Agreement covers the recorded formulas and generator, not general causal validity. |
| F07 DiD valid design | Not run | Not implemented | No DiD implementation or accuracy claim. |
| F08 DiD assumption violations | Not run | Not implemented | No pre-trend/anticipation diagnostic claim. |
| F09 data/safety | 7 fixed fixtures | Expected safety behaviour matched 7/7; individual employment target returned `UNSUPPORTED_DECISION_TARGET` | The structured rejection closes the recorded v0.1 fixture gap. Seven fixtures do not prove detection of every unsafe request or dataset. |

Current safe summary:

> Executed CausalPilot harness 0.2.0 as a versioned synthetic development benchmark, recording 250 stochastic replications per supported family, 3/3 sparse-warning fixtures, 7/7 predefined safety fixtures, and two explicitly unimplemented DiD families. A formal holdout validation has not been run.

## Required evidence bundle structure

The following are future expected artifacts, not statements that they currently exist:

```text
evidence/
  benchmark-manifest.json
  evidence-matrix.md
  release-gates.md
  contribution-and-ai-disclosure.md
  privacy-and-hr-safety.md
  results/
    <manifest-version>/
      environment.json
      benchmark-summary.json
      per-family-results.*
      command-log.txt
      checksums.txt
  cases/
    <case-id>/
      README.md
      data-provenance.md
      config.json
      normalized-results.json
      report.*
  releases/
    <app-version>/
      build-record.md
      test-record.md
      package-record.md
      install-record.md
      signing-record.md
      public-availability-record.md
      checksums.txt
```

## Application evidence checklist

Before using a metric in an application:

- [ ] It is an achieved result, not a target from the manifest.
- [ ] The numerator, denominator, scenario family, and split are stated.
- [ ] The exact source commit, manifest version, and result version are recorded.
- [ ] The result can be regenerated from preserved inputs or a documented generator.
- [ ] Failures, exclusions, and inconclusive outputs are shown.
- [ ] The statement distinguishes simulation evidence, public-data demonstration, and real-world adoption.
- [ ] AI-assisted work and third-party libraries/data are attributed.
- [ ] No private, identifying, or sensitive HR data appears in the public evidence.

## Safe résumé template

Do not fill the brackets until formal evidence exists:

> Designed and led development of CausalPilot AI, an AI-assisted experiment and causal-decision workbench; evaluated version **[actual version]** across **[actual family count]** versioned benchmark families and **[actual replication count]** holdout simulations, with **[actual measured result]**, while preserving traceable assumptions, failures, and report evidence.

If the formal benchmark has not run, use:

> Designed a versioned benchmark and evidence protocol for an in-development experiment and causal-decision workbench.
