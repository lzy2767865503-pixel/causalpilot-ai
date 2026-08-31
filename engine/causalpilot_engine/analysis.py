"""Deterministic CSV analysis pipeline for CausalPilot AI.

All calculations and report text are produced offline without a language model.
Project attribution: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple

from . import ENGINE_METADATA
from .models import AnalysisRequest, AnalysisSpec, BusinessSpec, EngineInputError
from .statistics import (
    binary_risk_difference,
    srm_chi_square,
    welch_from_summary,
)


RESULT_SCHEMA_VERSION = "1.0"


@dataclass
class Moments:
    count: int = 0
    total: float = 0.0
    total_squares: float = 0.0

    def add(self, value: float) -> None:
        self.count += 1
        self.total += value
        self.total_squares += value * value

    @property
    def average(self) -> float:
        if self.count == 0:
            raise ValueError("mean requires observations")
        return self.total / self.count

    @property
    def variance(self) -> float:
        if self.count < 2:
            raise ValueError("variance requires at least two observations")
        numerator = self.total_squares - self.total * self.total / self.count
        return max(0.0, numerator / (self.count - 1))

    def combine(self, other: "Moments") -> "Moments":
        return Moments(
            count=self.count + other.count,
            total=self.total + other.total,
            total_squares=self.total_squares + other.total_squares,
        )


@dataclass
class JointMoments:
    """Sufficient statistics for outcome y and pre-treatment metric x."""

    count: int = 0
    sum_y: float = 0.0
    sum_x: float = 0.0
    sum_y2: float = 0.0
    sum_x2: float = 0.0
    sum_xy: float = 0.0

    def add(self, outcome: float, pre_metric: float) -> None:
        self.count += 1
        self.sum_y += outcome
        self.sum_x += pre_metric
        self.sum_y2 += outcome * outcome
        self.sum_x2 += pre_metric * pre_metric
        self.sum_xy += outcome * pre_metric

    def combine(self, other: "JointMoments") -> "JointMoments":
        return JointMoments(
            count=self.count + other.count,
            sum_y=self.sum_y + other.sum_y,
            sum_x=self.sum_x + other.sum_x,
            sum_y2=self.sum_y2 + other.sum_y2,
            sum_x2=self.sum_x2 + other.sum_x2,
            sum_xy=self.sum_xy + other.sum_xy,
        )


def _canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _digest(prefix: str, value: Any, length: int = 24) -> str:
    digest = hashlib.sha256(_canonical_json(value).encode("utf-8")).hexdigest()
    return "{0}_{1}".format(prefix, digest[:length])


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _clean_json(value: Any) -> Any:
    if isinstance(value, float):
        if not math.isfinite(value):
            return None
        if value == 0.0:
            return 0.0
        return value
    if isinstance(value, Mapping):
        return {str(key): _clean_json(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_clean_json(item) for item in value]
    return value


def error_result(
    code: str,
    message: str,
    request_id: Optional[str] = None,
    plan_hash: Optional[str] = None,
) -> Dict[str, Any]:
    identity = {
        "code": code,
        "message": message,
        "request_id": request_id,
        "plan_hash": plan_hash,
        "engine_version": ENGINE_METADATA["version"],
    }
    generated_request_id = request_id or _digest("req", identity)
    return {
        "schema_version": RESULT_SCHEMA_VERSION,
        "engine": dict(ENGINE_METADATA),
        "request_id": generated_request_id,
        "result_id": _digest("result", identity),
        "status": "error",
        "decision_readiness": "not_analyzed",
        "plan_hash": plan_hash,
        "dataset": None,
        "normalized_spec": None,
        "diagnostics": {"blockers": [], "warnings": [], "checks": []},
        "estimates": {},
        "business_interpretation": {
            "configured": False,
            "status": "not_evaluable",
        },
        "causal_claims": {
            "claim_status": "not_evaluable",
            "allowed": [],
            "forbidden": ["Any numerical or causal claim from this failed request"],
            "assumptions": [],
        },
        "narrative": {
            "headline": "Analysis could not be completed.",
            "quality_summary": message,
            "method_summary": "No statistical method was run.",
            "effect_summary": "No effect estimate is available.",
            "business_summary": "Business interpretation is unavailable.",
            "causal_language": "No causal claim is permitted.",
            "limitations": [message],
        },
        "errors": [{"code": code, "message": message, "severity": "error"}],
        "warnings": [],
    }


def _issue(code: str, message: str, severity: str, **details: Any) -> Dict[str, Any]:
    result = {"code": code, "message": message, "severity": severity}
    if details:
        result["details"] = details
    return result


def _is_missing(raw: Any, spec: AnalysisSpec) -> bool:
    if raw is None:
        return True
    return str(raw).strip().lower() in spec.missing_value_tokens


def _parse_number(raw: Any) -> Optional[float]:
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError):
        return None
    if not math.isfinite(value):
        return None
    return value


def _adjusted_group_summary(
    group: JointMoments, theta: float, pooled_pre_mean: float
) -> Tuple[int, float, float]:
    if group.count < 2:
        raise ValueError("CUPED requires two complete outcomes per group")
    adjusted_sum = group.sum_y - theta * (
        group.sum_x - group.count * pooled_pre_mean
    )
    adjusted_sum_squares = (
        group.sum_y2
        - 2.0 * theta * (group.sum_xy - pooled_pre_mean * group.sum_y)
        + theta
        * theta
        * (
            group.sum_x2
            - 2.0 * pooled_pre_mean * group.sum_x
            + group.count * pooled_pre_mean * pooled_pre_mean
        )
    )
    adjusted_mean = adjusted_sum / group.count
    variance_numerator = adjusted_sum_squares - adjusted_sum * adjusted_sum / group.count
    adjusted_variance = max(0.0, variance_numerator / (group.count - 1))
    return group.count, adjusted_mean, adjusted_variance


def _cuped_from_joint_moments(
    treatment: JointMoments,
    control: JointMoments,
    confidence_level: float,
) -> Dict[str, Any]:
    if treatment.count < 2 or control.count < 2:
        raise ValueError("CUPED requires at least two complete rows per group")
    pooled = treatment.combine(control)
    if pooled.count < 4:
        raise ValueError("CUPED requires at least four complete rows")
    pre_variance_numerator = pooled.sum_x2 - pooled.sum_x * pooled.sum_x / pooled.count
    if pre_variance_numerator <= 0:
        raise ValueError("CUPED pre-treatment metric has zero variance")
    covariance_numerator = pooled.sum_xy - pooled.sum_x * pooled.sum_y / pooled.count
    theta = covariance_numerator / pre_variance_numerator
    pooled_pre_mean = pooled.sum_x / pooled.count

    treatment_summary = _adjusted_group_summary(treatment, theta, pooled_pre_mean)
    control_summary = _adjusted_group_summary(control, theta, pooled_pre_mean)
    estimate = welch_from_summary(
        treatment_count=treatment_summary[0],
        treatment_mean=treatment_summary[1],
        treatment_variance=treatment_summary[2],
        control_count=control_summary[0],
        control_mean=control_summary[1],
        control_variance=control_summary[2],
        confidence_level=confidence_level,
    )

    raw_variance = max(
        0.0,
        (pooled.sum_y2 - pooled.sum_y * pooled.sum_y / pooled.count)
        / (pooled.count - 1),
    )
    adjusted_total = (
        treatment_summary[0] * treatment_summary[1]
        + control_summary[0] * control_summary[1]
    )
    adjusted_squares = (
        (treatment_summary[0] - 1) * treatment_summary[2]
        + treatment_summary[0] * treatment_summary[1] ** 2
        + (control_summary[0] - 1) * control_summary[2]
        + control_summary[0] * control_summary[1] ** 2
    )
    adjusted_variance = max(
        0.0,
        (adjusted_squares - adjusted_total * adjusted_total / pooled.count)
        / (pooled.count - 1),
    )
    variance_reduction = None
    if raw_variance > 0:
        variance_reduction = 1.0 - adjusted_variance / raw_variance

    return {
        "method": "cuped_pooled_pre_treatment_adjustment_welch",
        "theta": theta,
        "pre_treatment_mean": pooled_pre_mean,
        "complete_rows": pooled.count,
        "treatment_complete_rows": treatment.count,
        "control_complete_rows": control.count,
        "variance_reduction": variance_reduction,
        "estimate": estimate,
    }


def _business_interpretation(
    business: Optional[BusinessSpec],
    decision_estimate: Optional[Mapping[str, Any]],
    blocked: bool,
) -> Dict[str, Any]:
    if business is None:
        return {"configured": False, "status": "not_configured", "roi": {"available": False}}
    result: Dict[str, Any] = {
        "configured": True,
        "preferred_direction": business.preferred_direction,
        "minimum_practical_effect": business.minimum_practical_effect,
        "currency": business.currency,
    }
    if blocked or not decision_estimate:
        result.update(
            {
                "status": "not_evaluable",
                "reason": "Experiment quality blockers prevent decision interpretation.",
                "roi": {"available": False},
            }
        )
        return result

    direction = 1.0 if business.preferred_direction == "increase" else -1.0
    effect = float(decision_estimate["estimate"]) * direction
    low_raw = float(decision_estimate["confidence_interval_low"])
    high_raw = float(decision_estimate["confidence_interval_high"])
    directional_bounds = sorted((direction * low_raw, direction * high_raw))
    threshold = business.minimum_practical_effect
    if directional_bounds[0] > threshold:
        status = "meets_threshold"
    elif directional_bounds[1] < threshold:
        status = "does_not_meet_threshold"
    else:
        status = "inconclusive"
    result.update(
        {
            "status": status,
            "direction_adjusted_effect": effect,
            "direction_adjusted_confidence_interval": directional_bounds,
            "interpretation_rule": (
                "meets only when the entire confidence interval exceeds the practical threshold"
            ),
        }
    )

    roi_ready = (
        business.target_population is not None
        and business.value_per_outcome_unit is not None
        and business.incremental_treatment_cost_per_unit is not None
    )
    if not roi_ready:
        result["roi"] = {
            "available": False,
            "reason": (
                "target_population, value_per_outcome_unit, and "
                "incremental_treatment_cost_per_unit are all required"
            ),
        }
        return result

    population = int(business.target_population or 0)
    unit_value = float(business.value_per_outcome_unit or 0.0)
    cost_per_unit = float(business.incremental_treatment_cost_per_unit or 0.0)
    total_cost = population * cost_per_unit
    scenario_effects = {
        "downside": directional_bounds[0],
        "base": effect,
        "upside": directional_bounds[1],
    }
    scenarios: Dict[str, Any] = {}
    for label, scenario_effect in scenario_effects.items():
        incremental_units = population * scenario_effect
        gross_value = incremental_units * unit_value
        net_value = gross_value - total_cost
        scenarios[label] = {
            "direction_adjusted_effect": scenario_effect,
            "incremental_outcome_units": incremental_units,
            "gross_value": gross_value,
            "treatment_cost": total_cost,
            "net_value": net_value,
            "roi": net_value / total_cost if total_cost > 0 else None,
        }
    result["roi"] = {
        "available": True,
        "target_population": population,
        "value_per_outcome_unit": unit_value,
        "incremental_treatment_cost_per_unit": cost_per_unit,
        "scenarios": scenarios,
        "roi_definition": "(incremental gross value - treatment cost) / treatment cost",
    }
    return result


def _causal_claims(
    spec: AnalysisSpec, blocked: bool, has_estimate: bool
) -> Dict[str, Any]:
    assumptions = [
        "Treatment assignment corresponds to the declared randomized assignment.",
        "The analysis unit matches the randomization unit.",
        "Outcomes are measured after assignment without differential logging loss.",
        "There is no material interference or spillover between units.",
        "Any CUPED covariate was measured before treatment and was pre-specified.",
    ]
    forbidden = [
        "The p-value is the probability that the null hypothesis is true.",
        "Statistical significance alone proves business importance.",
        "The estimate identifies a per-protocol or exposure effect.",
        "The result justifies an automated hiring, firing, promotion, or individual HR decision.",
        "An observed subgroup difference proves an individual treatment effect.",
    ]
    allowed: List[str] = []
    if has_estimate:
        allowed.append("A descriptive treatment-minus-control difference with uncertainty.")
    if blocked:
        claim_status = "blocked"
        forbidden.insert(0, "Any causal conclusion while experiment quality blockers remain.")
    elif spec.randomized_assignment_confirmed and has_estimate:
        claim_status = "conditional_randomized_itt"
        allowed.append(
            "A conditional intention-to-treat causal interpretation, subject to the listed assumptions and diagnostics."
        )
    elif has_estimate:
        claim_status = "association_only"
        forbidden.insert(0, "Causal language because randomized assignment was not confirmed.")
    else:
        claim_status = "not_evaluable"
        forbidden.insert(0, "Any numerical or causal conclusion without an estimate.")
    return {
        "claim_status": claim_status,
        "estimand": "intention_to_treat",
        "decision_target": spec.decision_target,
        "allowed": allowed,
        "forbidden": forbidden,
        "assumptions": assumptions,
    }


def _format_probability(value: float) -> str:
    if value < 0.0001:
        return "<0.0001"
    return "{0:.4f}".format(value)


def _narrative(
    spec: AnalysisSpec,
    status: str,
    blockers: Sequence[Mapping[str, Any]],
    warnings: Sequence[Mapping[str, Any]],
    estimates: Mapping[str, Any],
    business: Mapping[str, Any],
    claims: Mapping[str, Any],
) -> Dict[str, Any]:
    if blockers:
        headline = "Analysis blocked: {0}.".format(blockers[0]["message"])
        quality_summary = "{0} blocker(s) and {1} warning(s) were found.".format(
            len(blockers), len(warnings)
        )
    elif warnings:
        headline = "Analysis completed with data-quality warnings."
        quality_summary = "No hard blocker was found; {0} warning(s) require review.".format(
            len(warnings)
        )
    else:
        headline = "Analysis completed without a detected quality blocker."
        quality_summary = "All implemented structural and experiment-quality checks passed."

    primary = estimates.get("decision_estimate")
    if primary:
        if spec.outcome_type == "binary" and estimates.get("decision_estimate_source") == "raw":
            effect_summary = (
                "Treatment rate {0:.2%} versus control {1:.2%}; risk difference {2:.2%} "
                "({3:.0%} CI {4:.2%} to {5:.2%}), two-sided p={6}."
            ).format(
                primary["treatment_rate"],
                primary["control_rate"],
                primary["estimate"],
                primary["confidence_level"],
                primary["confidence_interval_low"],
                primary["confidence_interval_high"],
                _format_probability(primary["p_value_two_sided"]),
            )
        else:
            effect_summary = (
                "Treatment-minus-control estimate {0:.6g} ({1:.0%} CI {2:.6g} to "
                "{3:.6g}), two-sided p={4}."
            ).format(
                primary["estimate"],
                primary["confidence_level"],
                primary["confidence_interval_low"],
                primary["confidence_interval_high"],
                _format_probability(primary["p_value_two_sided"]),
            )
    else:
        effect_summary = "No decision-eligible effect estimate is available."

    if spec.outcome_type == "binary":
        method_summary = (
            "Binary intention-to-treat analysis uses a treatment-minus-control risk "
            "difference, Newcombe-Wilson confidence interval, and two-sided pooled z test."
        )
    else:
        method_summary = (
            "Continuous intention-to-treat analysis uses a Welch treatment-minus-control "
            "mean difference and Welch-Satterthwaite degrees of freedom."
        )
    if estimates.get("cuped"):
        method_summary += " The decision estimate uses the declared pre-treatment CUPED adjustment."

    business_status = business.get("status", "not_configured")
    business_messages = {
        "not_configured": "No business threshold was configured.",
        "not_evaluable": "Business interpretation is unavailable while blockers remain.",
        "meets_threshold": "The full uncertainty interval exceeds the practical threshold.",
        "does_not_meet_threshold": "The full uncertainty interval is below the practical threshold.",
        "inconclusive": "The uncertainty interval crosses the practical threshold.",
    }
    business_summary = business_messages.get(
        business_status, "Business interpretation is unavailable."
    )

    claim_messages = {
        "conditional_randomized_itt": (
            "A conditional intention-to-treat causal interpretation is allowed only under "
            "the declared randomized design and listed assumptions."
        ),
        "association_only": (
            "Only associative language is allowed because randomized assignment was not confirmed."
        ),
        "blocked": "No causal language is allowed while quality blockers remain.",
        "not_evaluable": "No causal language is allowed without an estimate.",
    }
    limitations = [item["message"] for item in blockers] + [
        item["message"] for item in warnings
    ]
    limitations.extend(
        [
            "Implemented diagnostics cannot prove no interference, no hidden logging loss, or correct operational randomization.",
            "A p-value does not measure effect size, business value, or the probability that a hypothesis is true.",
        ]
    )
    return {
        "headline": headline,
        "quality_summary": quality_summary,
        "method_summary": method_summary,
        "effect_summary": effect_summary,
        "business_summary": business_summary,
        "causal_language": claim_messages.get(
            claims.get("claim_status"), "No causal language is allowed."
        ),
        "limitations": limitations,
    }


def _analyze_valid_request(request: AnalysisRequest) -> Dict[str, Any]:
    spec = request.analysis_spec
    normalized_spec = spec.to_dict()
    plan_hash = _digest("plan", normalized_spec)
    path = Path(request.csv_path).expanduser().resolve()
    if not path.exists():
        return error_result(
            "CSV_NOT_FOUND", "CSV file does not exist: {0}".format(path), request.request_id, plan_hash
        )
    if not path.is_file():
        return error_result(
            "CSV_NOT_FILE", "CSV path is not a regular file: {0}".format(path), request.request_id, plan_hash
        )

    try:
        dataset_sha256 = _sha256_file(path)
    except OSError as exc:
        return error_result(
            "CSV_READ_ERROR", "Could not read CSV: {0}".format(exc), request.request_id, plan_hash
        )

    blockers: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    checks: List[Dict[str, Any]] = []

    treatment_count = 0
    control_count = 0
    missing_outcomes = {"treatment": 0, "control": 0}
    binary_successes = {"treatment": 0, "control": 0}
    outcome_moments = {"treatment": Moments(), "control": Moments()}
    cuped_moments = {"treatment": JointMoments(), "control": JointMoments()}
    cuped_missing = {"treatment": 0, "control": 0}
    seen_ids = set()
    row_count = 0
    missing_unit_rows: List[int] = []
    duplicate_unit_rows: List[int] = []
    missing_treatment_rows: List[int] = []
    invalid_treatment_rows: List[int] = []
    invalid_treatment_levels = set()
    invalid_outcome_rows: List[int] = []
    invalid_outcome_levels = set()
    malformed_rows: List[int] = []

    required_columns = {
        spec.unit_id_column,
        spec.treatment_column,
        spec.outcome_column,
    }
    if spec.cuped:
        required_columns.add(spec.cuped.pre_treatment_column)
    if len({spec.unit_id_column, spec.treatment_column, spec.outcome_column}) != 3:
        blockers.append(
            _issue(
                "OVERLAPPING_CORE_COLUMNS",
                "Unit ID, treatment, and outcome must use different columns.",
                "blocker",
            )
        )
    if spec.cuped and spec.cuped.pre_treatment_column in {
        spec.unit_id_column,
        spec.treatment_column,
        spec.outcome_column,
    }:
        blockers.append(
            _issue(
                "OVERLAPPING_CUPED_COLUMN",
                "The CUPED pre-treatment metric must be a separate column.",
                "blocker",
            )
        )

    headers: List[str] = []
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            headers = list(reader.fieldnames or [])
            if not headers:
                blockers.append(
                    _issue("MISSING_HEADER", "CSV has no header row.", "blocker")
                )
            if len(headers) != len(set(headers)):
                blockers.append(
                    _issue(
                        "DUPLICATE_HEADER",
                        "CSV contains duplicate column names.",
                        "blocker",
                    )
                )
            missing_columns = sorted(required_columns - set(headers))
            if missing_columns:
                blockers.append(
                    _issue(
                        "MISSING_REQUIRED_COLUMN",
                        "CSV is missing required columns.",
                        "blocker",
                        columns=missing_columns,
                    )
                )

            if not blockers:
                for row_number, row in enumerate(reader, start=2):
                    row_count += 1
                    if None in row:
                        malformed_rows.append(row_number)
                        continue
                    unit_raw = row.get(spec.unit_id_column)
                    if _is_missing(unit_raw, spec):
                        missing_unit_rows.append(row_number)
                        continue
                    unit_id = str(unit_raw).strip()
                    if unit_id in seen_ids:
                        duplicate_unit_rows.append(row_number)
                    else:
                        seen_ids.add(unit_id)

                    treatment_raw = row.get(spec.treatment_column)
                    if _is_missing(treatment_raw, spec):
                        missing_treatment_rows.append(row_number)
                        continue
                    treatment_level = str(treatment_raw).strip()
                    if treatment_level == spec.treatment_value:
                        group = "treatment"
                        treatment_count += 1
                    elif treatment_level == spec.control_value:
                        group = "control"
                        control_count += 1
                    else:
                        invalid_treatment_rows.append(row_number)
                        if len(invalid_treatment_levels) < 10:
                            invalid_treatment_levels.add(treatment_level)
                        continue

                    outcome_raw = row.get(spec.outcome_column)
                    if _is_missing(outcome_raw, spec):
                        missing_outcomes[group] += 1
                        continue

                    if spec.outcome_type == "binary":
                        outcome_level = str(outcome_raw).strip()
                        if outcome_level == spec.positive_outcome_value:
                            outcome_value = 1.0
                            binary_successes[group] += 1
                        elif outcome_level == spec.negative_outcome_value:
                            outcome_value = 0.0
                        else:
                            invalid_outcome_rows.append(row_number)
                            if len(invalid_outcome_levels) < 10:
                                invalid_outcome_levels.add(outcome_level)
                            continue
                    else:
                        parsed_outcome = _parse_number(outcome_raw)
                        if parsed_outcome is None:
                            invalid_outcome_rows.append(row_number)
                            if len(invalid_outcome_levels) < 10:
                                invalid_outcome_levels.add(str(outcome_raw).strip())
                            continue
                        outcome_value = parsed_outcome

                    outcome_moments[group].add(outcome_value)
                    if spec.cuped:
                        pre_raw = row.get(spec.cuped.pre_treatment_column)
                        if _is_missing(pre_raw, spec):
                            cuped_missing[group] += 1
                        else:
                            pre_value = _parse_number(pre_raw)
                            if pre_value is None:
                                cuped_missing[group] += 1
                            else:
                                cuped_moments[group].add(outcome_value, pre_value)
    except UnicodeDecodeError:
        return error_result(
            "CSV_ENCODING_ERROR",
            "CSV must be UTF-8 or UTF-8 with BOM.",
            request.request_id,
            plan_hash,
        )
    except (OSError, csv.Error) as exc:
        return error_result(
            "CSV_PARSE_ERROR",
            "CSV could not be parsed: {0}".format(exc),
            request.request_id,
            plan_hash,
        )

    if row_count == 0 and not any(item["code"] == "MISSING_HEADER" for item in blockers):
        blockers.append(_issue("EMPTY_DATASET", "CSV contains no data rows.", "blocker"))
    if malformed_rows:
        blockers.append(
            _issue(
                "MALFORMED_ROWS",
                "CSV rows contain more values than the header defines.",
                "blocker",
                count=len(malformed_rows),
                sample_row_numbers=malformed_rows[:5],
            )
        )
    if missing_unit_rows:
        blockers.append(
            _issue(
                "MISSING_UNIT_ID",
                "Every row must have a unit ID.",
                "blocker",
                count=len(missing_unit_rows),
                sample_row_numbers=missing_unit_rows[:5],
            )
        )
    if duplicate_unit_rows:
        blockers.append(
            _issue(
                "DUPLICATE_UNIT_ID",
                "Duplicate unit IDs violate one-row-per-analysis-unit requirements.",
                "blocker",
                count=len(duplicate_unit_rows),
                sample_row_numbers=duplicate_unit_rows[:5],
            )
        )
    if missing_treatment_rows:
        blockers.append(
            _issue(
                "MISSING_TREATMENT_VALUE",
                "Every analyzable unit must have a treatment assignment.",
                "blocker",
                count=len(missing_treatment_rows),
                sample_row_numbers=missing_treatment_rows[:5],
            )
        )
    if invalid_treatment_rows:
        blockers.append(
            _issue(
                "INVALID_TREATMENT_VALUE",
                "Treatment column contains values outside the declared treatment/control levels.",
                "blocker",
                count=len(invalid_treatment_rows),
                observed_levels=sorted(invalid_treatment_levels),
                sample_row_numbers=invalid_treatment_rows[:5],
            )
        )
    if invalid_outcome_rows:
        blockers.append(
            _issue(
                "INVALID_OUTCOME_VALUE",
                "Outcome values do not match the declared outcome type or binary levels.",
                "blocker",
                count=len(invalid_outcome_rows),
                observed_values=sorted(invalid_outcome_levels),
                sample_row_numbers=invalid_outcome_rows[:5],
            )
        )
    if treatment_count == 0 or control_count == 0:
        blockers.append(
            _issue(
                "EMPTY_ASSIGNMENT_GROUP",
                "Both treatment and control assignments must be present.",
                "blocker",
                treatment_count=treatment_count,
                control_count=control_count,
            )
        )

    srm_result: Optional[Dict[str, Any]] = None
    if treatment_count > 0 and control_count > 0:
        srm_result = srm_chi_square(
            treatment_count, control_count, spec.expected_treatment_fraction
        )
        srm_blocked = srm_result["p_value"] < spec.srm_alpha
        srm_result["alpha"] = spec.srm_alpha
        srm_result["passed"] = not srm_blocked
        checks.append(
            {
                "code": "SAMPLE_RATIO_MISMATCH",
                "status": "fail" if srm_blocked else "pass",
                "details": srm_result,
            }
        )
        if srm_blocked:
            blockers.append(
                _issue(
                    "SRM_DETECTED",
                    "Observed assignment counts differ materially from the declared allocation.",
                    "blocker",
                    p_value=srm_result["p_value"],
                    alpha=spec.srm_alpha,
                )
            )

    assigned = {"treatment": treatment_count, "control": control_count}
    missing_rates: Dict[str, Optional[float]] = {}
    for group in ("treatment", "control"):
        missing_rates[group] = (
            missing_outcomes[group] / assigned[group] if assigned[group] > 0 else None
        )
    total_missing = missing_outcomes["treatment"] + missing_outcomes["control"]
    if total_missing:
        warnings.append(
            _issue(
                "MISSING_OUTCOMES",
                "Outcome values are missing; the estimate uses complete outcomes only.",
                "warning",
                total=total_missing,
                treatment_rate=missing_rates["treatment"],
                control_rate=missing_rates["control"],
            )
        )
    if missing_rates["treatment"] is not None and missing_rates["control"] is not None:
        missing_rate_difference = abs(
            float(missing_rates["treatment"]) - float(missing_rates["control"])
        )
        if missing_rate_difference >= 0.05:
            warnings.append(
                _issue(
                    "DIFFERENTIAL_MISSING_OUTCOMES",
                    "Outcome missingness differs by at least 5 percentage points between groups.",
                    "warning",
                    absolute_rate_difference=missing_rate_difference,
                )
            )
    checks.append(
        {
            "code": "OUTCOME_COMPLETENESS",
            "status": "warning" if total_missing else "pass",
            "details": {
                "missing_counts": missing_outcomes,
                "missing_rates": missing_rates,
            },
        }
    )

    for group in ("treatment", "control"):
        if assigned[group] > 0 and outcome_moments[group].count == 0:
            blockers.append(
                _issue(
                    "NO_OBSERVED_OUTCOME_IN_GROUP",
                    "A treatment arm has no valid observed outcomes.",
                    "blocker",
                    group=group,
                )
            )

    estimates: Dict[str, Any] = {}
    structural_block_codes = {
        "MISSING_HEADER",
        "DUPLICATE_HEADER",
        "MISSING_REQUIRED_COLUMN",
        "OVERLAPPING_CORE_COLUMNS",
        "OVERLAPPING_CUPED_COLUMN",
        "EMPTY_DATASET",
        "MALFORMED_ROWS",
        "MISSING_UNIT_ID",
        "DUPLICATE_UNIT_ID",
        "MISSING_TREATMENT_VALUE",
        "INVALID_TREATMENT_VALUE",
        "INVALID_OUTCOME_VALUE",
        "EMPTY_ASSIGNMENT_GROUP",
        "NO_OBSERVED_OUTCOME_IN_GROUP",
    }
    structurally_analyzable = not any(
        item["code"] in structural_block_codes for item in blockers
    )
    raw_estimate: Optional[Dict[str, Any]] = None
    if structurally_analyzable:
        if spec.outcome_type == "binary":
            raw_estimate = binary_risk_difference(
                treatment_successes=binary_successes["treatment"],
                treatment_total=outcome_moments["treatment"].count,
                control_successes=binary_successes["control"],
                control_total=outcome_moments["control"].count,
                confidence_level=spec.confidence_level,
            )
            raw_estimate.update(
                {
                    "method": "risk_difference_newcombe_wilson_ci_pooled_z",
                    "outcome_type": "binary",
                    "treatment_successes": binary_successes["treatment"],
                    "control_successes": binary_successes["control"],
                    "treatment_observed": outcome_moments["treatment"].count,
                    "control_observed": outcome_moments["control"].count,
                }
            )
        else:
            if (
                outcome_moments["treatment"].count < 2
                or outcome_moments["control"].count < 2
            ):
                blockers.append(
                    _issue(
                        "INSUFFICIENT_CONTINUOUS_SAMPLE",
                        "Continuous Welch analysis requires at least two valid outcomes per group.",
                        "blocker",
                    )
                )
            else:
                raw_estimate = welch_from_summary(
                    treatment_count=outcome_moments["treatment"].count,
                    treatment_mean=outcome_moments["treatment"].average,
                    treatment_variance=outcome_moments["treatment"].variance,
                    control_count=outcome_moments["control"].count,
                    control_mean=outcome_moments["control"].average,
                    control_variance=outcome_moments["control"].variance,
                    confidence_level=spec.confidence_level,
                )
                raw_estimate.update(
                    {"method": "welch_mean_difference", "outcome_type": "continuous"}
                )
    if raw_estimate:
        estimates["raw"] = raw_estimate

    if raw_estimate and spec.outcome_type == "binary":
        treatment_observed = outcome_moments["treatment"].count
        control_observed = outcome_moments["control"].count
        treatment_successes = binary_successes["treatment"]
        control_successes = binary_successes["control"]
        treatment_failures = treatment_observed - treatment_successes
        control_failures = control_observed - control_successes
        triggered_conditions: List[str] = []
        if treatment_observed < 30 or control_observed < 30:
            triggered_conditions.append("at_least_one_group_has_fewer_than_30_observed_outcomes")
        if min(
            treatment_successes,
            treatment_failures,
            control_successes,
            control_failures,
        ) < 5:
            triggered_conditions.append("at_least_one_observed_success_or_failure_cell_is_below_5")
        information_details = {
            "treatment_observed": treatment_observed,
            "control_observed": control_observed,
            "treatment_successes": treatment_successes,
            "treatment_failures": treatment_failures,
            "control_successes": control_successes,
            "control_failures": control_failures,
            "minimum_group_size_rule": 30,
            "minimum_success_failure_cell_rule": 5,
            "triggered_conditions": triggered_conditions,
        }
        checks.append(
            {
                "code": "BINARY_INFORMATION",
                "status": "warning" if triggered_conditions else "pass",
                "details": information_details,
            }
        )
        if triggered_conditions:
            warnings.append(
                _issue(
                    "SPARSE_BINARY_OUTCOME",
                    "Binary outcome information is sparse for normal-approximation inference; retain the interval and treat the p-value and decision language cautiously.",
                    "warning",
                    **information_details
                )
            )

    cuped_result: Optional[Dict[str, Any]] = None
    if spec.cuped and raw_estimate and structurally_analyzable:
        total_cuped_missing = cuped_missing["treatment"] + cuped_missing["control"]
        if total_cuped_missing:
            warnings.append(
                _issue(
                    "CUPED_PRE_METRIC_MISSING",
                    "Some valid outcomes lack a usable pre-treatment metric; CUPED uses complete pairs.",
                    "warning",
                    treatment_count=cuped_missing["treatment"],
                    control_count=cuped_missing["control"],
                )
            )
        try:
            cuped_result = _cuped_from_joint_moments(
                cuped_moments["treatment"],
                cuped_moments["control"],
                spec.confidence_level,
            )
            cuped_result["pre_treatment_column"] = spec.cuped.pre_treatment_column
            cuped_result["pre_treatment_attested"] = True
            estimates["cuped"] = cuped_result
        except ValueError as exc:
            warnings.append(
                _issue(
                    "CUPED_NOT_FEASIBLE",
                    "CUPED could not be applied; the raw estimate remains primary.",
                    "warning",
                    reason=str(exc),
                )
            )

    if cuped_result:
        decision_estimate = cuped_result["estimate"]
        estimates["decision_estimate_source"] = "cuped"
    else:
        decision_estimate = raw_estimate
        if raw_estimate:
            estimates["decision_estimate_source"] = "raw"
    if decision_estimate:
        estimates["decision_estimate"] = decision_estimate

    blocked = bool(blockers)
    if decision_estimate:
        estimates["decision_eligible"] = not blocked

    status = "blocked" if blocked else "ok"
    readiness = "blocked" if blocked else ("share_with_caveats" if warnings else "ready")
    business_result = _business_interpretation(
        spec.business, decision_estimate, blocked
    )
    claims = _causal_claims(spec, blocked, decision_estimate is not None)
    narrative = _narrative(
        spec, status, blockers, warnings, estimates, business_result, claims
    )

    dataset = {
        "path": str(path),
        "filename": path.name,
        "sha256": dataset_sha256,
        "size_bytes": path.stat().st_size,
        "row_count": row_count,
        "column_count": len(headers),
        "columns": headers,
    }
    result_identity = {
        "engine_version": ENGINE_METADATA["version"],
        "dataset_sha256": dataset_sha256,
        "plan_hash": plan_hash,
    }
    result_id = _digest("result", result_identity)
    request_id = request.request_id or _digest("req", result_identity)
    result = {
        "schema_version": RESULT_SCHEMA_VERSION,
        "engine": dict(ENGINE_METADATA),
        "request_id": request_id,
        "result_id": result_id,
        "status": status,
        "decision_readiness": readiness,
        "plan_hash": plan_hash,
        "dataset": dataset,
        "normalized_spec": normalized_spec,
        "diagnostics": {
            "blockers": blockers,
            "warnings": warnings,
            "checks": checks,
            "assignment_counts": {
                "treatment": treatment_count,
                "control": control_count,
            },
            "observed_outcome_counts": {
                "treatment": outcome_moments["treatment"].count,
                "control": outcome_moments["control"].count,
            },
            "missing_outcome_counts": missing_outcomes,
            "missing_outcome_rates": missing_rates,
            "srm": srm_result,
        },
        "estimates": estimates,
        "business_interpretation": business_result,
        "causal_claims": claims,
        "narrative": narrative,
        "errors": blockers,
        "warnings": warnings,
    }
    return _clean_json(result)


def analyze_request(payload: Mapping[str, Any]) -> Dict[str, Any]:
    """Analyze one request and always return a structured ResultBundle."""

    request_id = None
    if isinstance(payload, Mapping) and payload.get("request_id") is not None:
        request_id = str(payload.get("request_id"))
    try:
        request = AnalysisRequest.from_mapping(payload)
    except EngineInputError as exc:
        return error_result(exc.code, str(exc), request_id=request_id)
    try:
        return _analyze_valid_request(request)
    except Exception as exc:  # defensive API boundary; CLI must still emit JSON
        return error_result(
            "ENGINE_INTERNAL_ERROR",
            "The deterministic engine failed safely: {0}".format(exc),
            request_id=request.request_id,
            plan_hash=_digest("plan", request.analysis_spec.to_dict()),
        )
