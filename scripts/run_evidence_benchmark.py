#!/usr/bin/env python3
"""Run an evidence-safe development benchmark for the current CausalPilot MVP.

This harness executes only scenario families supported by the current offline
engine. It records measured development outcomes and explicitly reports planned
but unimplemented Difference-in-Differences families. It refuses a formal
holdout run unless the repository has a clean, committed source state.

No result produced by this script is evidence of real-world adoption or business
impact. Project author and QA owner: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import platform
import random
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple


ROOT = Path(__file__).resolve().parents[1]
ENGINE_ROOT = ROOT / "engine"
if str(ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(ENGINE_ROOT))

from causalpilot_engine import ENGINE_METADATA, analyze_request  # noqa: E402


RESULT_SCHEMA_VERSION = "1.0.0"
HARNESS_VERSION = "0.2.0"
IMPLEMENTED_FAMILIES = {
    "F01_RANDOMIZED_BINARY_NULL",
    "F02_RANDOMIZED_BINARY_EFFECT",
    "F03_RANDOMIZED_CONTINUOUS",
    "F04_SAMPLE_RATIO_MISMATCH",
    "F05_LOW_POWER_AND_SPARSE_EVENTS",
    "F06_PRETREATMENT_ADJUSTMENT_CUPED",
    "F09_DATA_QUALITY_AND_LEAKAGE",
}
UNIMPLEMENTED_FAMILIES = {
    "F07_DID_PARALLEL_TRENDS_SUPPORTED": (
        "The current engine has no Difference-in-Differences estimator or panel/time schema."
    ),
    "F08_DID_ASSUMPTION_VIOLATION": (
        "The current engine has no Difference-in-Differences pre-trend or anticipation diagnostics."
    ),
}


def _canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    )


def _sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _tree_digest(paths: Iterable[Path]) -> str:
    digest = hashlib.sha256()
    for path in sorted(paths, key=lambda item: item.as_posix()):
        relative = path.relative_to(ROOT).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def _manifest_spec_digest(manifest: Mapping[str, Any]) -> str:
    controlled = {
        key: manifest[key]
        for key in (
            "schema_version",
            "manifest_version",
            "v1_scope",
            "evaluation_principles",
            "split_policy",
            "scenario_families",
            "planned_acceptance_targets",
            "reference_and_freeze_plan",
            "application_claim_guardrail",
        )
        if key in manifest
    }
    return _sha256_bytes(_canonical_json(controlled).encode("utf-8"))


def _git_state() -> Dict[str, Any]:
    def run(*args: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["git", "-C", str(ROOT), *args],
            text=True,
            capture_output=True,
            check=False,
        )

    head = run("rev-parse", "--verify", "HEAD")
    status = run("status", "--porcelain")
    has_commit = head.returncode == 0
    return {
        "has_commit": has_commit,
        "head": head.stdout.strip() if has_commit else None,
        "working_tree_clean": status.returncode == 0 and not status.stdout.strip(),
        "status_entry_count": len(status.stdout.splitlines()) if status.returncode == 0 else None,
        "note": (
            "No Git commit exists; this run cannot be a formal holdout."
            if not has_commit
            else "Working-tree cleanliness is recorded independently of test outcomes."
        ),
    }


def _stable_seed(split: str, family_id: str, index: int, variant: str = "") -> int:
    material = "|".join(
        ["causalpilot", HARNESS_VERSION, split, family_id, variant, str(index)]
    )
    return int(hashlib.sha256(material.encode("utf-8")).hexdigest()[:16], 16)


def _normal(rng: random.Random) -> float:
    # Explicit Box-Muller transform avoids an implementation-specific Gaussian cache.
    first = max(rng.random(), 1.0e-15)
    second = rng.random()
    return math.sqrt(-2.0 * math.log(first)) * math.cos(2.0 * math.pi * second)


def _write_csv(path: Path, header: Sequence[str], rows: Sequence[Sequence[Any]]) -> Path:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)
    return path


def _base_request(
    csv_path: Path,
    request_id: str,
    outcome_type: str = "binary",
    outcome_column: str = "outcome",
    expected_treatment_fraction: float = 0.5,
    randomized_assignment_confirmed: bool = True,
    cuped: Optional[Mapping[str, Any]] = None,
    analysis_name: str = "Versioned benchmark scenario",
) -> Dict[str, Any]:
    spec: Dict[str, Any] = {
        "analysis_name": analysis_name,
        "unit_id_column": "unit_id",
        "treatment_column": "treatment",
        "outcome_column": outcome_column,
        "outcome_type": outcome_type,
        "decision_target": "aggregate_business_outcome",
        "treatment_value": "1",
        "control_value": "0",
        "positive_outcome_value": "1",
        "negative_outcome_value": "0",
        "expected_treatment_fraction": expected_treatment_fraction,
        "srm_alpha": 0.001,
        "confidence_level": 0.95,
        "randomized_assignment_confirmed": randomized_assignment_confirmed,
        "business": {
            "minimum_practical_effect": 0.05 if outcome_type == "binary" else 0.2,
            "preferred_direction": "increase",
            "target_population": 1000,
            "value_per_outcome_unit": 1,
            "incremental_treatment_cost_per_unit": 0.1,
            "currency": "MYR",
        },
    }
    if cuped is not None:
        spec["cuped"] = dict(cuped)
    return {
        "schema_version": "1.0",
        "request_id": request_id,
        "csv_path": str(csv_path),
        "analysis_spec": spec,
    }


def _error_codes(result: Mapping[str, Any]) -> List[str]:
    return sorted({str(item.get("code")) for item in result.get("errors", [])})


def _warning_codes(result: Mapping[str, Any]) -> List[str]:
    return sorted({str(item.get("code")) for item in result.get("warnings", [])})


def _mean(values: Sequence[float]) -> float:
    return math.fsum(values) / len(values)


def _sample_variance(values: Sequence[float]) -> float:
    center = _mean(values)
    return math.fsum((value - center) ** 2 for value in values) / (len(values) - 1)


def _rate(count: int, total: int) -> float:
    return count / total if total else 0.0


def _contains(interval_low: float, interval_high: float, truth: float) -> bool:
    return interval_low <= truth <= interval_high


def _binary_rows(
    rng: random.Random,
    treatment_total: int,
    control_total: int,
    control_probability: float,
    treatment_probability: float,
) -> Tuple[List[List[Any]], int, int]:
    rows: List[List[Any]] = []
    treatment_successes = 0
    control_successes = 0
    for index in range(treatment_total):
        outcome = 1 if rng.random() < treatment_probability else 0
        treatment_successes += outcome
        rows.append(["t_{0}".format(index), 1, outcome, ""])
    for index in range(control_total):
        outcome = 1 if rng.random() < control_probability else 0
        control_successes += outcome
        rows.append(["c_{0}".format(index), 0, outcome, ""])
    return rows, treatment_successes, control_successes


def _run_binary_family(
    family_id: str,
    split: str,
    replications: int,
    temp_root: Path,
    control_probability: float,
    treatment_probability: float,
) -> Dict[str, Any]:
    true_effect = treatment_probability - control_probability
    estimates: List[float] = []
    absolute_errors: List[float] = []
    coverage = 0
    significant = 0
    reference_agreement = 0
    blockers = 0
    deterministic_rerun_checks = 0
    deterministic_rerun_matches = 0
    for index in range(replications):
        rng = random.Random(_stable_seed(split, family_id, index))
        rows, treatment_successes, control_successes = _binary_rows(
            rng,
            treatment_total=500,
            control_total=500,
            control_probability=control_probability,
            treatment_probability=treatment_probability,
        )
        csv_path = _write_csv(
            temp_root / "{0}.csv".format(family_id),
            ["unit_id", "treatment", "outcome", "pre_metric"],
            rows,
        )
        request = _base_request(csv_path, "{0}-{1}".format(family_id, index))
        result = analyze_request(request)
        if index < 5:
            deterministic_rerun_checks += 1
            if result == analyze_request(request):
                deterministic_rerun_matches += 1
        if result["status"] == "blocked":
            blockers += 1
        estimate = result.get("estimates", {}).get("decision_estimate")
        if not estimate:
            continue
        measured = float(estimate["estimate"])
        independent = treatment_successes / 500.0 - control_successes / 500.0
        if abs(measured - independent) <= 1.0e-15:
            reference_agreement += 1
        estimates.append(measured)
        absolute_errors.append(abs(measured - true_effect))
        coverage += int(
            _contains(
                float(estimate["confidence_interval_low"]),
                float(estimate["confidence_interval_high"]),
                true_effect,
            )
        )
        significant += int(float(estimate["p_value_two_sided"]) < 0.05)

    completed = len(estimates)
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_development" if split == "development" else "measured_holdout",
        "split": split,
        "replications_planned_for_this_run": replications,
        "replications_with_estimate": completed,
        "data_generating_truth": {
            "control_probability": control_probability,
            "treatment_probability": treatment_probability,
            "risk_difference": true_effect,
            "units_per_replication": 1000,
            "allocation": {"treatment": 500, "control": 500},
        },
        "measured_outcomes": {
            "mean_estimate": _mean(estimates),
            "mean_bias": _mean(estimates) - true_effect,
            "mean_absolute_error": _mean(absolute_errors),
            "empirical_interval_coverage": _rate(coverage, completed),
            "two_sided_p_below_0_05_rate": _rate(significant, completed),
            "independent_risk_difference_agreement_rate": _rate(
                reference_agreement, completed
            ),
            "blocked_run_count": blockers,
            "deterministic_rerun_match_rate_first_five": _rate(
                deterministic_rerun_matches, deterministic_rerun_checks
            ),
        },
        "target_assessment": (
            "Not evaluated against formal acceptance bands because this is a development split."
            if split == "development"
            else "Formal target interpretation requires the frozen manifest and clean committed source conditions recorded by the harness."
        ),
    }


def _run_continuous_family(
    family_id: str, split: str, replications: int, temp_root: Path
) -> Dict[str, Any]:
    variants = [
        ("null", 0.0),
        ("positive_effect", 0.5),
    ]
    per_variant: Dict[str, Dict[str, Any]] = {}
    for variant_name, true_effect in variants:
        variant_replications = replications // 2
        if variant_name == "positive_effect":
            variant_replications = replications - replications // 2
        estimates: List[float] = []
        standard_error_matches = 0
        estimate_matches = 0
        coverage = 0
        significant = 0
        for index in range(variant_replications):
            rng = random.Random(
                _stable_seed(split, family_id, index, variant=variant_name)
            )
            treatment_values = [true_effect + _normal(rng) for _ in range(200)]
            control_values = [_normal(rng) for _ in range(200)]
            rows: List[List[Any]] = []
            rows.extend(
                ["t_{0}".format(row), 1, value, ""]
                for row, value in enumerate(treatment_values)
            )
            rows.extend(
                ["c_{0}".format(row), 0, value, ""]
                for row, value in enumerate(control_values)
            )
            csv_path = _write_csv(
                temp_root / "{0}-{1}.csv".format(family_id, variant_name),
                ["unit_id", "treatment", "outcome", "pre_metric"],
                rows,
            )
            result = analyze_request(
                _base_request(
                    csv_path,
                    "{0}-{1}-{2}".format(family_id, variant_name, index),
                    outcome_type="continuous",
                )
            )
            estimate = result.get("estimates", {}).get("decision_estimate")
            if not estimate:
                continue
            measured = float(estimate["estimate"])
            independent = _mean(treatment_values) - _mean(control_values)
            independent_se = math.sqrt(
                _sample_variance(treatment_values) / len(treatment_values)
                + _sample_variance(control_values) / len(control_values)
            )
            estimate_matches += int(abs(measured - independent) <= 1.0e-12)
            standard_error_matches += int(
                abs(float(estimate["standard_error"]) - independent_se) <= 1.0e-12
            )
            estimates.append(measured)
            coverage += int(
                _contains(
                    float(estimate["confidence_interval_low"]),
                    float(estimate["confidence_interval_high"]),
                    true_effect,
                )
            )
            significant += int(float(estimate["p_value_two_sided"]) < 0.05)
        completed = len(estimates)
        per_variant[variant_name] = {
            "replications": completed,
            "true_mean_difference": true_effect,
            "mean_estimate": _mean(estimates),
            "mean_bias": _mean(estimates) - true_effect,
            "empirical_interval_coverage": _rate(coverage, completed),
            "two_sided_p_below_0_05_rate": _rate(significant, completed),
            "independent_mean_difference_agreement_rate": _rate(
                estimate_matches, completed
            ),
            "independent_standard_error_agreement_rate": _rate(
                standard_error_matches, completed
            ),
        }
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_development" if split == "development" else "measured_holdout",
        "split": split,
        "replications_planned_for_this_run": replications,
        "data_generating_truth": {
            "outcome_noise": "Box-Muller standard normal",
            "units_per_replication": 400,
            "allocation": {"treatment": 200, "control": 200},
            "variants": {"null": 0.0, "positive_effect": 0.5},
        },
        "measured_outcomes_by_variant": per_variant,
        "target_assessment": (
            "Not evaluated against formal acceptance bands because this is a development split."
            if split == "development"
            else "See run-level holdout eligibility and frozen-manifest evidence."
        ),
    }


def _run_srm_family(family_id: str, split: str, temp_root: Path) -> Dict[str, Any]:
    fixtures = [
        ("balanced_50_50", 50, 50, False),
        ("mild_55_45", 55, 45, False),
        ("severe_90_10", 90, 10, True),
    ]
    records: List[Dict[str, Any]] = []
    matches = 0
    for label, treatment_total, control_total, should_block in fixtures:
        rng = random.Random(_stable_seed(split, family_id, 0, label))
        rows, _, _ = _binary_rows(
            rng,
            treatment_total,
            control_total,
            control_probability=0.5,
            treatment_probability=0.5,
        )
        csv_path = _write_csv(
            temp_root / "{0}-{1}.csv".format(family_id, label),
            ["unit_id", "treatment", "outcome", "pre_metric"],
            rows,
        )
        result = analyze_request(
            _base_request(csv_path, "{0}-{1}".format(family_id, label))
        )
        observed_block = "SRM_DETECTED" in _error_codes(result)
        matched = observed_block == should_block
        matches += int(matched)
        records.append(
            {
                "fixture": label,
                "assignment": {
                    "treatment": treatment_total,
                    "control": control_total,
                },
                "expected_srm_block": should_block,
                "observed_srm_block": observed_block,
                "srm_p_value": result["diagnostics"]["srm"]["p_value"],
                "matched_expected_behaviour": matched,
            }
        )
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_fixed_fixtures",
        "split": "fixed_critical",
        "fixture_count": len(records),
        "matched_expected_behaviour_count": matches,
        "matched_expected_behaviour_rate": _rate(matches, len(records)),
        "fixtures": records,
        "target_assessment": (
            "Measured only for these fixed fixtures; this is not a calibrated SRM sensitivity/specificity claim."
        ),
    }


def _run_sparse_family(family_id: str, temp_root: Path) -> Dict[str, Any]:
    fixture_rows = {
        "both_arms_zero_events": (
            [["t_{0}".format(i), 1, 0, ""] for i in range(10)]
            + [["c_{0}".format(i), 0, 0, ""] for i in range(10)]
        ),
        "one_treatment_event": (
            [["t_{0}".format(i), 1, 1 if i == 0 else 0, ""] for i in range(10)]
            + [["c_{0}".format(i), 0, 0, ""] for i in range(10)]
        ),
        "small_five_per_arm": (
            [["t_{0}".format(i), 1, 1 if i == 0 else 0, ""] for i in range(5)]
            + [["c_{0}".format(i), 0, 0, ""] for i in range(5)]
        ),
    }
    records: List[Dict[str, Any]] = []
    explicit_warning_count = 0
    non_decisive_business_count = 0
    for label, rows in fixture_rows.items():
        csv_path = _write_csv(
            temp_root / "{0}-{1}.csv".format(family_id, label),
            ["unit_id", "treatment", "outcome", "pre_metric"],
            rows,
        )
        result = analyze_request(
            _base_request(csv_path, "{0}-{1}".format(family_id, label))
        )
        warning_codes = _warning_codes(result)
        has_explicit_warning = any(
            "POWER" in code or "SPARSE" in code or "RARE" in code
            for code in warning_codes
        )
        explicit_warning_count += int(has_explicit_warning)
        business_status = result["business_interpretation"]["status"]
        is_non_decisive = business_status in {"inconclusive", "not_evaluable"}
        non_decisive_business_count += int(is_non_decisive)
        estimate = result.get("estimates", {}).get("decision_estimate", {})
        records.append(
            {
                "fixture": label,
                "status": result["status"],
                "decision_readiness": result["decision_readiness"],
                "business_status": business_status,
                "claim_status": result["causal_claims"]["claim_status"],
                "warning_codes": warning_codes,
                "explicit_low_power_or_sparse_warning": has_explicit_warning,
                "estimate": estimate.get("estimate"),
                "confidence_interval_low": estimate.get("confidence_interval_low"),
                "confidence_interval_high": estimate.get("confidence_interval_high"),
                "p_value_two_sided": estimate.get("p_value_two_sided"),
            }
        )
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_fixed_fixtures",
        "split": "fixed_critical",
        "fixture_count": len(records),
        "measured_outcomes": {
            "explicit_low_power_or_sparse_warning_count": explicit_warning_count,
            "non_decisive_business_interpretation_count": non_decisive_business_count,
        },
        "fixtures": records,
        "target_assessment": (
            "Measured only for these fixed fixtures. A sparse-information warning does not validate "
            "normal-approximation inference for every low-information design."
        ),
    }


def _manual_cuped(
    treatment: Sequence[Tuple[float, float]],
    control: Sequence[Tuple[float, float]],
) -> Tuple[float, float]:
    combined = list(treatment) + list(control)
    outcomes = [item[0] for item in combined]
    pre_values = [item[1] for item in combined]
    pre_mean = _mean(pre_values)
    outcome_mean = _mean(outcomes)
    covariance = math.fsum(
        (pre - pre_mean) * (outcome - outcome_mean)
        for outcome, pre in combined
    ) / (len(combined) - 1)
    theta = covariance / _sample_variance(pre_values)
    adjusted_treatment = [
        outcome - theta * (pre - pre_mean) for outcome, pre in treatment
    ]
    adjusted_control = [
        outcome - theta * (pre - pre_mean) for outcome, pre in control
    ]
    return theta, _mean(adjusted_treatment) - _mean(adjusted_control)


def _run_cuped_family(
    family_id: str, split: str, replications: int, temp_root: Path
) -> Dict[str, Any]:
    true_effect = 0.5
    estimates: List[float] = []
    raw_estimates: List[float] = []
    theta_matches = 0
    estimate_matches = 0
    coverage = 0
    positive_variance_reduction = 0
    for index in range(replications):
        rng = random.Random(_stable_seed(split, family_id, index))
        treatment_pairs: List[Tuple[float, float]] = []
        control_pairs: List[Tuple[float, float]] = []
        for _ in range(200):
            pre = _normal(rng)
            treatment_pairs.append((true_effect + 0.8 * pre + _normal(rng), pre))
        for _ in range(200):
            pre = _normal(rng)
            control_pairs.append((0.8 * pre + _normal(rng), pre))
        rows: List[List[Any]] = []
        rows.extend(
            ["t_{0}".format(row), 1, outcome, pre]
            for row, (outcome, pre) in enumerate(treatment_pairs)
        )
        rows.extend(
            ["c_{0}".format(row), 0, outcome, pre]
            for row, (outcome, pre) in enumerate(control_pairs)
        )
        csv_path = _write_csv(
            temp_root / "{0}.csv".format(family_id),
            ["unit_id", "treatment", "outcome", "pre_metric"],
            rows,
        )
        result = analyze_request(
            _base_request(
                csv_path,
                "{0}-{1}".format(family_id, index),
                outcome_type="continuous",
                cuped={"pre_treatment_column": "pre_metric", "is_pre_treatment": True},
            )
        )
        cuped = result.get("estimates", {}).get("cuped")
        if not cuped:
            continue
        manual_theta, manual_estimate = _manual_cuped(
            treatment_pairs, control_pairs
        )
        decision = cuped["estimate"]
        measured = float(decision["estimate"])
        theta_matches += int(abs(float(cuped["theta"]) - manual_theta) <= 1.0e-12)
        estimate_matches += int(abs(measured - manual_estimate) <= 1.0e-12)
        estimates.append(measured)
        raw_estimates.append(float(result["estimates"]["raw"]["estimate"]))
        coverage += int(
            _contains(
                float(decision["confidence_interval_low"]),
                float(decision["confidence_interval_high"]),
                true_effect,
            )
        )
        reduction = cuped.get("variance_reduction")
        positive_variance_reduction += int(
            reduction is not None and float(reduction) > 0.0
        )
    completed = len(estimates)
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_development" if split == "development" else "measured_holdout",
        "split": split,
        "replications_planned_for_this_run": replications,
        "replications_with_cuped_estimate": completed,
        "data_generating_truth": {
            "true_mean_effect": true_effect,
            "pre_treatment_coefficient": 0.8,
            "outcome_noise": "Box-Muller standard normal",
            "units_per_replication": 400,
            "allocation": {"treatment": 200, "control": 200},
        },
        "measured_outcomes": {
            "mean_cuped_estimate": _mean(estimates),
            "mean_cuped_bias": _mean(estimates) - true_effect,
            "mean_raw_estimate": _mean(raw_estimates),
            "empirical_cuped_interval_coverage": _rate(coverage, completed),
            "independent_theta_agreement_rate": _rate(theta_matches, completed),
            "independent_adjusted_estimate_agreement_rate": _rate(
                estimate_matches, completed
            ),
            "positive_reported_variance_reduction_rate": _rate(
                positive_variance_reduction, completed
            ),
        },
        "target_assessment": (
            "Not evaluated against formal acceptance bands because this is a development split."
            if split == "development"
            else "See run-level holdout eligibility and frozen-manifest evidence."
        ),
    }


def _run_data_quality_family(family_id: str, temp_root: Path) -> Dict[str, Any]:
    base_rows = (
        [["t_{0}".format(i), 1, 1 if i < 6 else 0, 0.1 * i] for i in range(10)]
        + [["c_{0}".format(i), 0, 1 if i < 3 else 0, 0.1 * i] for i in range(10)]
    )
    records: List[Dict[str, Any]] = []

    def record(
        label: str,
        result: Mapping[str, Any],
        accepted_statuses: Sequence[str],
        required_code: Optional[str],
        note: str,
    ) -> None:
        codes = _error_codes(result)
        matched = result.get("status") in accepted_statuses and (
            required_code is None or required_code in codes
        )
        records.append(
            {
                "fixture": label,
                "expected_statuses": list(accepted_statuses),
                "required_error_code": required_code,
                "observed_status": result.get("status"),
                "observed_error_codes": codes,
                "observed_claim_status": result.get("causal_claims", {}).get(
                    "claim_status"
                ),
                "matched_expected_safety_behaviour": matched,
                "note": note,
            }
        )

    duplicate_rows = [list(row) for row in base_rows]
    duplicate_rows[-1][0] = duplicate_rows[0][0]
    duplicate_path = _write_csv(
        temp_root / "duplicate.csv",
        ["unit_id", "treatment", "outcome", "pre_metric"],
        duplicate_rows,
    )
    record(
        "duplicate_unit_id",
        analyze_request(_base_request(duplicate_path, "quality-duplicate")),
        ["blocked"],
        "DUPLICATE_UNIT_ID",
        "One-row-per-unit violation should block analysis.",
    )

    missing_column_path = _write_csv(
        temp_root / "missing-column.csv",
        ["unit_id", "treatment", "pre_metric"],
        [[row[0], row[1], row[3]] for row in base_rows],
    )
    record(
        "missing_required_outcome_column",
        analyze_request(_base_request(missing_column_path, "quality-missing-column")),
        ["blocked"],
        "MISSING_REQUIRED_COLUMN",
        "Missing required analysis field should block analysis.",
    )

    invalid_rows = [list(row) for row in base_rows]
    invalid_rows[0][2] = "not-binary"
    invalid_path = _write_csv(
        temp_root / "invalid-outcome.csv",
        ["unit_id", "treatment", "outcome", "pre_metric"],
        invalid_rows,
    )
    record(
        "invalid_binary_outcome",
        analyze_request(_base_request(invalid_path, "quality-invalid-outcome")),
        ["blocked"],
        "INVALID_OUTCOME_VALUE",
        "Outcome outside declared binary levels should block analysis.",
    )

    missing_treatment_rows = [list(row) for row in base_rows]
    missing_treatment_rows[0][1] = ""
    missing_treatment_path = _write_csv(
        temp_root / "missing-treatment.csv",
        ["unit_id", "treatment", "outcome", "pre_metric"],
        missing_treatment_rows,
    )
    record(
        "missing_treatment_assignment",
        analyze_request(
            _base_request(missing_treatment_path, "quality-missing-treatment")
        ),
        ["blocked"],
        "MISSING_TREATMENT_VALUE",
        "Missing assignment should block analysis.",
    )

    valid_path = _write_csv(
        temp_root / "valid-quality-base.csv",
        ["unit_id", "treatment", "outcome", "pre_metric"],
        base_rows,
    )
    record(
        "unattested_pre_treatment_covariate",
        analyze_request(
            _base_request(
                valid_path,
                "quality-unattested-cuped",
                cuped={
                    "pre_treatment_column": "pre_metric",
                    "is_pre_treatment": False,
                },
            )
        ),
        ["error"],
        "INVALID_REQUEST",
        "CUPED request without pre-treatment attestation should fail safely.",
    )

    overlapping_request = _base_request(valid_path, "quality-overlap")
    overlapping_request["analysis_spec"]["outcome_column"] = "treatment"
    record(
        "overlapping_core_columns",
        analyze_request(overlapping_request),
        ["blocked"],
        "OVERLAPPING_CORE_COLUMNS",
        "Core analysis roles must use distinct columns.",
    )

    individual_hr_request = _base_request(
        valid_path,
        "quality-individual-hr",
        analysis_name="Structured decision-target safety fixture",
    )
    individual_hr_request["analysis_spec"][
        "decision_target"
    ] = "individual_employment_decision"
    individual_hr_result = analyze_request(individual_hr_request)
    record(
        "unsupported_individual_hr_decision_target",
        individual_hr_result,
        ["error"],
        "UNSUPPORTED_DECISION_TARGET",
        "The structured decision_target must reject individual employment decisions at input validation.",
    )

    matches = sum(
        int(item["matched_expected_safety_behaviour"]) for item in records
    )
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "implemented_in_current_mvp",
        "execution_status": "measured_fixed_fixtures",
        "split": "fixed_critical",
        "fixture_count": len(records),
        "matched_expected_safety_behaviour_count": matches,
        "matched_expected_safety_behaviour_rate": _rate(matches, len(records)),
        "fixtures": records,
        "target_assessment": (
            "Measured only for these fixed fixtures; this is not proof that every unsafe or leaking dataset is detected."
        ),
    }


def _unimplemented_family(family_id: str, reason: str) -> Dict[str, Any]:
    return {
        "family_id": family_id,
        "family_version": "1.0.0",
        "implementation_status": "not_implemented_in_current_mvp",
        "execution_status": "not_run",
        "measured_outcomes": None,
        "reason": reason,
        "claim_boundary": "No implementation, accuracy, assumption-check, or validation claim is permitted for this family.",
    }


def _validate_manifest(manifest: Mapping[str, Any]) -> None:
    listed = {
        str(item.get("id")) for item in manifest.get("scenario_families", [])
    }
    required = IMPLEMENTED_FAMILIES | set(UNIMPLEMENTED_FAMILIES)
    missing = sorted(required - listed)
    if missing:
        raise ValueError(
            "Manifest does not list required benchmark family IDs: {0}".format(
                ", ".join(missing)
            )
        )
    status = str(manifest.get("status", ""))
    if "PLANNED" not in status and "TARGET" not in status:
        raise ValueError(
            "Manifest must preserve an explicit planned-target status before this harness runs"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run versioned CausalPilot benchmark scenarios supported by the current MVP."
    )
    parser.add_argument(
        "--manifest",
        default=str(ROOT / "evidence" / "benchmark-manifest.json"),
    )
    parser.add_argument(
        "--split", choices=("development", "holdout"), default="development"
    )
    parser.add_argument(
        "--replications",
        type=int,
        help="override stochastic replications; otherwise use the manifest plan",
    )
    parser.add_argument(
        "--run-id",
        default="current-mvp-development-v0.1",
        help="versioned result filename stem",
    )
    parser.add_argument("--output", help="explicit machine-readable JSON output path")
    parser.add_argument("--force", action="store_true", help="overwrite output")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    manifest_path = Path(args.manifest).expanduser().resolve()
    manifest_bytes = manifest_path.read_bytes()
    manifest = json.loads(manifest_bytes.decode("utf-8"))
    _validate_manifest(manifest)
    git = _git_state()
    formal_holdout_eligible = bool(
        args.split == "holdout" and git["has_commit"] and git["working_tree_clean"]
    )
    if args.split == "holdout" and not formal_holdout_eligible:
        raise SystemExit(
            "Refusing formal holdout: a clean repository with an existing Git commit is required."
        )

    split_plan = manifest["split_policy"]["development_split" if args.split == "development" else "holdout_split"]
    replications = args.replications or int(
        split_plan["planned_replications_per_stochastic_family"]
    )
    if replications < 10:
        raise SystemExit("At least 10 stochastic replications are required")

    manifest_version = str(manifest["manifest_version"])
    output_path = (
        Path(args.output).expanduser().resolve()
        if args.output
        else ROOT / "evidence" / "results" / manifest_version / (args.run_id + ".json")
    )
    if output_path.exists() and not args.force:
        raise SystemExit("Output exists; choose a new run ID or pass --force: {0}".format(output_path))

    started = datetime.now(timezone.utc)
    engine_files = list((ENGINE_ROOT / "causalpilot_engine").glob("*.py"))
    harness_files = [Path(__file__).resolve()]
    with tempfile.TemporaryDirectory(prefix="causalpilot-benchmark-") as temp:
        temp_root = Path(temp)
        families: List[Dict[str, Any]] = [
            _run_binary_family(
                "F01_RANDOMIZED_BINARY_NULL",
                args.split,
                replications,
                temp_root,
                control_probability=0.15,
                treatment_probability=0.15,
            ),
            _run_binary_family(
                "F02_RANDOMIZED_BINARY_EFFECT",
                args.split,
                replications,
                temp_root,
                control_probability=0.15,
                treatment_probability=0.25,
            ),
            _run_continuous_family(
                "F03_RANDOMIZED_CONTINUOUS",
                args.split,
                replications,
                temp_root,
            ),
            _run_srm_family("F04_SAMPLE_RATIO_MISMATCH", args.split, temp_root),
            _run_sparse_family("F05_LOW_POWER_AND_SPARSE_EVENTS", temp_root),
            _run_cuped_family(
                "F06_PRETREATMENT_ADJUSTMENT_CUPED",
                args.split,
                replications,
                temp_root,
            ),
            _unimplemented_family(
                "F07_DID_PARALLEL_TRENDS_SUPPORTED",
                UNIMPLEMENTED_FAMILIES["F07_DID_PARALLEL_TRENDS_SUPPORTED"],
            ),
            _unimplemented_family(
                "F08_DID_ASSUMPTION_VIOLATION",
                UNIMPLEMENTED_FAMILIES["F08_DID_ASSUMPTION_VIOLATION"],
            ),
            _run_data_quality_family("F09_DATA_QUALITY_AND_LEAKAGE", temp_root),
        ]

    finished = datetime.now(timezone.utc)
    implemented_count = sum(
        int(item["implementation_status"] == "implemented_in_current_mvp")
        for item in families
    )
    partial_count = sum(
        int(item["implementation_status"] == "partially_implemented_in_current_mvp")
        for item in families
    )
    unimplemented_count = sum(
        int(item["implementation_status"] == "not_implemented_in_current_mvp")
        for item in families
    )
    result = {
        "schema_version": RESULT_SCHEMA_VERSION,
        "artifact_type": "actual_benchmark_run",
        "harness": {
            "name": "CausalPilot evidence-safe benchmark harness",
            "version": HARNESS_VERSION,
            "sha256": _tree_digest(harness_files),
        },
        "project": {
            "name": "CausalPilot AI",
            "product_author_problem_owner_qa_owner": "LAI ZEYU (来泽宇)",
        },
        "run": {
            "run_id": args.run_id,
            "split": args.split,
            "formal_holdout": formal_holdout_eligible,
            "started_at_utc": started.isoformat(),
            "finished_at_utc": finished.isoformat(),
            "duration_seconds": (finished - started).total_seconds(),
            "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
            "stochastic_replications_per_family": replications,
        },
        "manifest": {
            "path": str(manifest_path.relative_to(ROOT)),
            "manifest_version": manifest_version,
            "input_file_sha256": _sha256_bytes(manifest_bytes),
            "controlled_spec_sha256": _manifest_spec_digest(manifest),
            "planned_targets_are_not_results": True,
        },
        "source": {
            "engine_version": ENGINE_METADATA["version"],
            "engine_source_sha256": _tree_digest(engine_files),
            "git": git,
            "python": sys.version,
            "platform": platform.platform(),
            "current_working_directory": os.getcwd(),
        },
        "claim_boundary": {
            "evidence_scope": (
                "Measured synthetic development scenarios and fixed safety fixtures for the recorded current source only."
            ),
            "not_evidence_of": [
                "formal holdout validation" if not formal_holdout_eligible else "future or changed versions",
                "real-world adoption",
                "real-world business impact",
                "validity outside the recorded scenario families",
                "implemented Difference-in-Differences support",
                "production readiness",
            ],
        },
        "summary": {
            "manifest_family_count": len(manifest.get("scenario_families", [])),
            "implemented_family_count": implemented_count,
            "partially_implemented_family_count": partial_count,
            "not_implemented_family_count": unimplemented_count,
            "all_manifest_families_reported": len(families)
            == len(manifest.get("scenario_families", [])),
            "known_release_blocking_evidence_gaps": [
                "No clean committed source exists, so this is not a formal holdout run.",
                "Difference-in-Differences estimator and diagnostics are not implemented."
            ],
        },
        "families": families,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(result, sort_keys=True, indent=2, ensure_ascii=False, allow_nan=False)
        + "\n",
        encoding="utf-8",
    )
    output_hash = _sha256_file(output_path)
    print(
        _canonical_json(
            {
                "status": "completed_with_explicit_gaps",
                "output": str(output_path),
                "output_sha256": output_hash,
                "split": args.split,
                "formal_holdout": formal_holdout_eligible,
                "replications_per_stochastic_family": replications,
                "implemented_family_count": implemented_count,
                "partially_implemented_family_count": partial_count,
                "not_implemented_family_count": unimplemented_count,
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
