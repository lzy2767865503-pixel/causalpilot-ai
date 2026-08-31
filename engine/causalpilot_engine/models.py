"""Input schema for CausalPilot's deterministic engine.

Copyright and project attribution: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Mapping, Optional, Tuple


class EngineInputError(ValueError):
    """Raised when a request cannot be analyzed safely."""

    def __init__(self, message: str, code: str = "INVALID_REQUEST") -> None:
        super().__init__(message)
        self.code = code


def _reject_unknown(mapping: Mapping[str, Any], allowed: set, location: str) -> None:
    unknown = sorted(set(mapping) - allowed)
    if unknown:
        raise EngineInputError(
            "Unknown field(s) in {0}: {1}".format(location, ", ".join(unknown))
        )


def _required_column(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise EngineInputError("{0} must be a non-empty column name".format(field))
    return value.strip()


def _finite_number(value: Any, field: str) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise EngineInputError("{0} must be numeric".format(field))
    if number != number or number in (float("inf"), float("-inf")):
        raise EngineInputError("{0} must be finite".format(field))
    return number


def _canonical_level(value: Any, field: str) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        raise EngineInputError("{0} must not be null".format(field))
    text = str(value).strip()
    if not text:
        raise EngineInputError("{0} must not be empty".format(field))
    return text


def _decision_target(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise EngineInputError(
            "decision_target is required and must declare an aggregate supported purpose"
        )
    target = value.strip().lower()
    if target == "individual_employment_decision":
        raise EngineInputError(
            "Individual employment decisions are forbidden; analyze only aggregate business outcomes or team-level program outcomes.",
            code="UNSUPPORTED_DECISION_TARGET",
        )
    allowed = {"aggregate_business_outcome", "team_level_program_outcome"}
    if target not in allowed:
        raise EngineInputError(
            "decision_target must be 'aggregate_business_outcome' or 'team_level_program_outcome'"
        )
    return target


@dataclass(frozen=True)
class CupedSpec:
    pre_treatment_column: str
    is_pre_treatment: bool

    @classmethod
    def from_mapping(cls, value: Any) -> Optional["CupedSpec"]:
        if value is None:
            return None
        if not isinstance(value, Mapping):
            raise EngineInputError("cuped must be an object or null")
        _reject_unknown(
            value,
            {"pre_treatment_column", "is_pre_treatment"},
            "analysis_spec.cuped",
        )
        column = _required_column(
            value.get("pre_treatment_column"), "cuped.pre_treatment_column"
        )
        attested = value.get("is_pre_treatment") is True
        if not attested:
            raise EngineInputError(
                "CUPED requires is_pre_treatment=true; post-treatment covariates are forbidden"
            )
        return cls(pre_treatment_column=column, is_pre_treatment=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "pre_treatment_column": self.pre_treatment_column,
            "is_pre_treatment": self.is_pre_treatment,
        }


@dataclass(frozen=True)
class BusinessSpec:
    minimum_practical_effect: float = 0.0
    preferred_direction: str = "increase"
    target_population: Optional[int] = None
    value_per_outcome_unit: Optional[float] = None
    incremental_treatment_cost_per_unit: Optional[float] = None
    currency: str = "MYR"

    @classmethod
    def from_mapping(cls, value: Any) -> Optional["BusinessSpec"]:
        if value is None:
            return None
        if not isinstance(value, Mapping):
            raise EngineInputError("business must be an object or null")
        _reject_unknown(
            value,
            {
                "minimum_practical_effect",
                "preferred_direction",
                "target_population",
                "value_per_outcome_unit",
                "incremental_treatment_cost_per_unit",
                "currency",
            },
            "analysis_spec.business",
        )
        minimum = _finite_number(
            value.get("minimum_practical_effect", 0.0),
            "business.minimum_practical_effect",
        )
        if minimum < 0:
            raise EngineInputError("business.minimum_practical_effect must be >= 0")
        direction = str(value.get("preferred_direction", "increase")).strip().lower()
        if direction not in {"increase", "decrease"}:
            raise EngineInputError(
                "business.preferred_direction must be 'increase' or 'decrease'"
            )

        target_population = value.get("target_population")
        if target_population is not None:
            if isinstance(target_population, bool):
                raise EngineInputError("business.target_population must be an integer")
            try:
                target_population = int(target_population)
            except (TypeError, ValueError):
                raise EngineInputError("business.target_population must be an integer")
            if target_population <= 0:
                raise EngineInputError("business.target_population must be > 0")

        value_per_unit = value.get("value_per_outcome_unit")
        if value_per_unit is not None:
            value_per_unit = _finite_number(
                value_per_unit, "business.value_per_outcome_unit"
            )
            if value_per_unit < 0:
                raise EngineInputError("business.value_per_outcome_unit must be >= 0")

        cost_per_unit = value.get("incremental_treatment_cost_per_unit")
        if cost_per_unit is not None:
            cost_per_unit = _finite_number(
                cost_per_unit, "business.incremental_treatment_cost_per_unit"
            )
            if cost_per_unit < 0:
                raise EngineInputError(
                    "business.incremental_treatment_cost_per_unit must be >= 0"
                )

        currency = str(value.get("currency", "MYR")).strip().upper()
        if not currency or len(currency) > 12:
            raise EngineInputError("business.currency must be a short non-empty label")

        return cls(
            minimum_practical_effect=minimum,
            preferred_direction=direction,
            target_population=target_population,
            value_per_outcome_unit=value_per_unit,
            incremental_treatment_cost_per_unit=cost_per_unit,
            currency=currency,
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "minimum_practical_effect": self.minimum_practical_effect,
            "preferred_direction": self.preferred_direction,
            "target_population": self.target_population,
            "value_per_outcome_unit": self.value_per_outcome_unit,
            "incremental_treatment_cost_per_unit": self.incremental_treatment_cost_per_unit,
            "currency": self.currency,
        }


@dataclass(frozen=True)
class AnalysisSpec:
    unit_id_column: str
    treatment_column: str
    outcome_column: str
    outcome_type: str
    decision_target: str
    treatment_value: str = "1"
    control_value: str = "0"
    positive_outcome_value: str = "1"
    negative_outcome_value: str = "0"
    expected_treatment_fraction: float = 0.5
    srm_alpha: float = 0.001
    confidence_level: float = 0.95
    randomized_assignment_confirmed: bool = False
    analysis_name: str = "Untitled experiment"
    missing_value_tokens: Tuple[str, ...] = ("", "na", "n/a", "null", "none", "nan")
    cuped: Optional[CupedSpec] = None
    business: Optional[BusinessSpec] = None

    @classmethod
    def from_mapping(cls, value: Any) -> "AnalysisSpec":
        if not isinstance(value, Mapping):
            raise EngineInputError("analysis_spec must be an object")
        _reject_unknown(
            value,
            {
                "unit_id_column",
                "treatment_column",
                "outcome_column",
                "outcome_type",
                "decision_target",
                "treatment_value",
                "control_value",
                "positive_outcome_value",
                "negative_outcome_value",
                "expected_treatment_fraction",
                "srm_alpha",
                "confidence_level",
                "randomized_assignment_confirmed",
                "analysis_name",
                "missing_value_tokens",
                "cuped",
                "business",
            },
            "analysis_spec",
        )
        outcome_type = str(value.get("outcome_type", "")).strip().lower()
        if outcome_type not in {"binary", "continuous"}:
            raise EngineInputError("outcome_type must be 'binary' or 'continuous'")

        treatment_value = _canonical_level(
            value.get("treatment_value", "1"), "treatment_value"
        )
        control_value = _canonical_level(
            value.get("control_value", "0"), "control_value"
        )
        if treatment_value == control_value:
            raise EngineInputError("treatment_value and control_value must differ")

        positive = _canonical_level(
            value.get("positive_outcome_value", "1"), "positive_outcome_value"
        )
        negative = _canonical_level(
            value.get("negative_outcome_value", "0"), "negative_outcome_value"
        )
        if positive == negative:
            raise EngineInputError(
                "positive_outcome_value and negative_outcome_value must differ"
            )

        expected_fraction = _finite_number(
            value.get("expected_treatment_fraction", 0.5),
            "expected_treatment_fraction",
        )
        if not 0 < expected_fraction < 1:
            raise EngineInputError("expected_treatment_fraction must be between 0 and 1")

        srm_alpha = _finite_number(value.get("srm_alpha", 0.001), "srm_alpha")
        if not 0 < srm_alpha < 1:
            raise EngineInputError("srm_alpha must be between 0 and 1")

        confidence = _finite_number(
            value.get("confidence_level", 0.95), "confidence_level"
        )
        if not 0.5 < confidence < 1:
            raise EngineInputError("confidence_level must be between 0.5 and 1")

        tokens_raw = value.get(
            "missing_value_tokens", ["", "na", "n/a", "null", "none", "nan"]
        )
        if not isinstance(tokens_raw, (list, tuple)):
            raise EngineInputError("missing_value_tokens must be an array of strings")
        tokens = tuple(sorted({str(item).strip().lower() for item in tokens_raw}))
        if "" not in tokens:
            tokens = tuple(sorted(set(tokens) | {""}))

        analysis_name = str(value.get("analysis_name", "Untitled experiment")).strip()
        if not analysis_name:
            analysis_name = "Untitled experiment"
        if len(analysis_name) > 200:
            raise EngineInputError("analysis_name must be at most 200 characters")

        return cls(
            unit_id_column=_required_column(
                value.get("unit_id_column"), "unit_id_column"
            ),
            treatment_column=_required_column(
                value.get("treatment_column"), "treatment_column"
            ),
            outcome_column=_required_column(
                value.get("outcome_column"), "outcome_column"
            ),
            outcome_type=outcome_type,
            decision_target=_decision_target(value.get("decision_target")),
            treatment_value=treatment_value,
            control_value=control_value,
            positive_outcome_value=positive,
            negative_outcome_value=negative,
            expected_treatment_fraction=expected_fraction,
            srm_alpha=srm_alpha,
            confidence_level=confidence,
            randomized_assignment_confirmed=(
                value.get("randomized_assignment_confirmed") is True
            ),
            analysis_name=analysis_name,
            missing_value_tokens=tokens,
            cuped=CupedSpec.from_mapping(value.get("cuped")),
            business=BusinessSpec.from_mapping(value.get("business")),
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "unit_id_column": self.unit_id_column,
            "treatment_column": self.treatment_column,
            "outcome_column": self.outcome_column,
            "outcome_type": self.outcome_type,
            "decision_target": self.decision_target,
            "treatment_value": self.treatment_value,
            "control_value": self.control_value,
            "positive_outcome_value": self.positive_outcome_value,
            "negative_outcome_value": self.negative_outcome_value,
            "expected_treatment_fraction": self.expected_treatment_fraction,
            "srm_alpha": self.srm_alpha,
            "confidence_level": self.confidence_level,
            "randomized_assignment_confirmed": self.randomized_assignment_confirmed,
            "analysis_name": self.analysis_name,
            "missing_value_tokens": list(self.missing_value_tokens),
            "cuped": self.cuped.to_dict() if self.cuped else None,
            "business": self.business.to_dict() if self.business else None,
        }


@dataclass(frozen=True)
class AnalysisRequest:
    csv_path: str
    analysis_spec: AnalysisSpec
    request_id: Optional[str] = None

    @classmethod
    def from_mapping(cls, value: Any) -> "AnalysisRequest":
        if not isinstance(value, Mapping):
            raise EngineInputError("request must be a JSON object")
        _reject_unknown(
            value,
            {"schema_version", "request_id", "csv_path", "analysis_spec"},
            "request",
        )
        path = value.get("csv_path")
        if not isinstance(path, str) or not path.strip():
            raise EngineInputError("csv_path must be a non-empty string")
        request_id = value.get("request_id")
        if request_id is not None:
            request_id = str(request_id).strip()
            if not request_id:
                request_id = None
            elif len(request_id) > 200:
                raise EngineInputError("request_id must be at most 200 characters")
        return cls(
            csv_path=path.strip(),
            analysis_spec=AnalysisSpec.from_mapping(value.get("analysis_spec")),
            request_id=request_id,
        )
