"""Dependency-free statistical primitives for CausalPilot.

All routines are deterministic and use only Python's standard library. No AI is
involved in calculation or method selection.

Project attribution: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

import math
from statistics import NormalDist
from typing import Dict, Iterable, List, Sequence, Tuple


def mean(values: Sequence[float]) -> float:
    if not values:
        raise ValueError("mean requires at least one value")
    return math.fsum(values) / len(values)


def sample_variance(values: Sequence[float]) -> float:
    if len(values) < 2:
        raise ValueError("sample variance requires at least two values")
    center = mean(values)
    return math.fsum((value - center) ** 2 for value in values) / (len(values) - 1)


def _beta_continued_fraction(a: float, b: float, x: float) -> float:
    max_iterations = 300
    epsilon = 3.0e-14
    fp_min = 1.0e-300
    qab = a + b
    qap = a + 1.0
    qam = a - 1.0
    c = 1.0
    d = 1.0 - qab * x / qap
    if abs(d) < fp_min:
        d = fp_min
    d = 1.0 / d
    h = d
    for iteration in range(1, max_iterations + 1):
        m2 = 2 * iteration
        aa = iteration * (b - iteration) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        if abs(d) < fp_min:
            d = fp_min
        c = 1.0 + aa / c
        if abs(c) < fp_min:
            c = fp_min
        d = 1.0 / d
        h *= d * c
        aa = -(a + iteration) * (qab + iteration) * x / (
            (a + m2) * (qap + m2)
        )
        d = 1.0 + aa * d
        if abs(d) < fp_min:
            d = fp_min
        c = 1.0 + aa / c
        if abs(c) < fp_min:
            c = fp_min
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < epsilon:
            return h
    raise ArithmeticError("incomplete beta continued fraction did not converge")


def regularized_incomplete_beta(a: float, b: float, x: float) -> float:
    if a <= 0 or b <= 0:
        raise ValueError("beta parameters must be positive")
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    log_term = (
        math.lgamma(a + b)
        - math.lgamma(a)
        - math.lgamma(b)
        + a * math.log(x)
        + b * math.log1p(-x)
    )
    front = math.exp(log_term)
    if x < (a + 1.0) / (a + b + 2.0):
        return front * _beta_continued_fraction(a, b, x) / a
    return 1.0 - front * _beta_continued_fraction(b, a, 1.0 - x) / b


def student_t_cdf(value: float, degrees_freedom: float) -> float:
    if degrees_freedom <= 0:
        raise ValueError("degrees_freedom must be positive")
    if value == 0:
        return 0.5
    x = degrees_freedom / (degrees_freedom + value * value)
    tail = 0.5 * regularized_incomplete_beta(degrees_freedom / 2.0, 0.5, x)
    return 1.0 - tail if value > 0 else tail


def student_t_quantile(probability: float, degrees_freedom: float) -> float:
    if not 0 < probability < 1:
        raise ValueError("probability must be between 0 and 1")
    if probability == 0.5:
        return 0.0
    if probability < 0.5:
        return -student_t_quantile(1.0 - probability, degrees_freedom)
    low = 0.0
    high = 1.0
    while student_t_cdf(high, degrees_freedom) < probability:
        high *= 2.0
        if high > 1.0e8:
            raise ArithmeticError("student-t quantile search failed")
    for _ in range(100):
        midpoint = (low + high) / 2.0
        if student_t_cdf(midpoint, degrees_freedom) < probability:
            low = midpoint
        else:
            high = midpoint
    return (low + high) / 2.0


def _wilson_interval(successes: int, total: int, z_value: float) -> Tuple[float, float]:
    if total <= 0:
        raise ValueError("total must be positive")
    probability = successes / total
    z2 = z_value * z_value
    denominator = 1.0 + z2 / total
    center = (probability + z2 / (2.0 * total)) / denominator
    spread = (
        z_value
        * math.sqrt(
            probability * (1.0 - probability) / total
            + z2 / (4.0 * total * total)
        )
        / denominator
    )
    return max(0.0, center - spread), min(1.0, center + spread)


def binary_risk_difference(
    treatment_successes: int,
    treatment_total: int,
    control_successes: int,
    control_total: int,
    confidence_level: float,
) -> Dict[str, float]:
    if treatment_total <= 0 or control_total <= 0:
        raise ValueError("both groups need at least one observed outcome")
    if not 0 <= treatment_successes <= treatment_total:
        raise ValueError("invalid treatment success count")
    if not 0 <= control_successes <= control_total:
        raise ValueError("invalid control success count")

    alpha = 1.0 - confidence_level
    z_critical = NormalDist().inv_cdf(1.0 - alpha / 2.0)
    treatment_rate = treatment_successes / treatment_total
    control_rate = control_successes / control_total
    difference = treatment_rate - control_rate

    treatment_low, treatment_high = _wilson_interval(
        treatment_successes, treatment_total, z_critical
    )
    control_low, control_high = _wilson_interval(
        control_successes, control_total, z_critical
    )
    lower = difference - math.sqrt(
        (treatment_rate - treatment_low) ** 2
        + (control_high - control_rate) ** 2
    )
    upper = difference + math.sqrt(
        (treatment_high - treatment_rate) ** 2
        + (control_rate - control_low) ** 2
    )
    lower = max(-1.0, lower)
    upper = min(1.0, upper)

    pooled = (treatment_successes + control_successes) / (
        treatment_total + control_total
    )
    pooled_se = math.sqrt(
        pooled
        * (1.0 - pooled)
        * (1.0 / treatment_total + 1.0 / control_total)
    )
    if pooled_se == 0.0:
        z_statistic = 0.0 if difference == 0.0 else math.copysign(math.inf, difference)
        p_value = 1.0 if difference == 0.0 else 0.0
    else:
        z_statistic = difference / pooled_se
        p_value = math.erfc(abs(z_statistic) / math.sqrt(2.0))

    relative_lift = None
    if control_rate != 0:
        relative_lift = difference / control_rate

    result = {
        "estimate": difference,
        "confidence_interval_low": lower,
        "confidence_interval_high": upper,
        "confidence_level": confidence_level,
        "p_value_two_sided": p_value,
        "test_statistic": z_statistic,
        "treatment_rate": treatment_rate,
        "control_rate": control_rate,
        "standard_error_null": pooled_se,
    }
    if relative_lift is not None:
        result["relative_lift"] = relative_lift
    return result


def welch_difference(
    treatment_values: Sequence[float],
    control_values: Sequence[float],
    confidence_level: float,
) -> Dict[str, float]:
    if len(treatment_values) < 2 or len(control_values) < 2:
        raise ValueError("Welch analysis requires at least two observations per group")
    treatment_mean = mean(treatment_values)
    control_mean = mean(control_values)
    treatment_variance = sample_variance(treatment_values)
    control_variance = sample_variance(control_values)
    return welch_from_summary(
        treatment_count=len(treatment_values),
        treatment_mean=treatment_mean,
        treatment_variance=treatment_variance,
        control_count=len(control_values),
        control_mean=control_mean,
        control_variance=control_variance,
        confidence_level=confidence_level,
    )


def welch_from_summary(
    treatment_count: int,
    treatment_mean: float,
    treatment_variance: float,
    control_count: int,
    control_mean: float,
    control_variance: float,
    confidence_level: float,
) -> Dict[str, object]:
    """Welch mean difference from sufficient statistics."""

    if treatment_count < 2 or control_count < 2:
        raise ValueError("Welch analysis requires at least two observations per group")
    difference = treatment_mean - control_mean
    variance_term_t = treatment_variance / treatment_count
    variance_term_c = control_variance / control_count
    standard_error = math.sqrt(variance_term_t + variance_term_c)
    denominator = 0.0
    denominator += variance_term_t**2 / (treatment_count - 1)
    denominator += variance_term_c**2 / (control_count - 1)

    if standard_error == 0.0 or denominator == 0.0:
        degrees_freedom = float(treatment_count + control_count - 2)
        test_statistic = 0.0 if difference == 0.0 else None
        p_value = 1.0 if difference == 0.0 else 0.0
        lower = difference
        upper = difference
    else:
        degrees_freedom = (variance_term_t + variance_term_c) ** 2 / denominator
        test_statistic = difference / standard_error
        p_value = 2.0 * (1.0 - student_t_cdf(abs(test_statistic), degrees_freedom))
        alpha = 1.0 - confidence_level
        critical = student_t_quantile(1.0 - alpha / 2.0, degrees_freedom)
        lower = difference - critical * standard_error
        upper = difference + critical * standard_error

    return {
        "estimate": difference,
        "confidence_interval_low": lower,
        "confidence_interval_high": upper,
        "confidence_level": confidence_level,
        "p_value_two_sided": max(0.0, min(1.0, p_value)),
        "test_statistic": test_statistic,
        "degrees_freedom": degrees_freedom,
        "standard_error": standard_error,
        "treatment_mean": treatment_mean,
        "control_mean": control_mean,
        "treatment_variance": treatment_variance,
        "control_variance": control_variance,
        "treatment_count": treatment_count,
        "control_count": control_count,
    }


def srm_chi_square(
    treatment_count: int,
    control_count: int,
    expected_treatment_fraction: float,
) -> Dict[str, float]:
    total = treatment_count + control_count
    if total <= 0:
        raise ValueError("SRM requires at least one assignment")
    expected_treatment = total * expected_treatment_fraction
    expected_control = total * (1.0 - expected_treatment_fraction)
    chi_square = (
        (treatment_count - expected_treatment) ** 2 / expected_treatment
        + (control_count - expected_control) ** 2 / expected_control
    )
    p_value = math.erfc(math.sqrt(chi_square / 2.0))
    return {
        "chi_square": chi_square,
        "degrees_freedom": 1,
        "p_value": p_value,
        "expected_treatment_count": expected_treatment,
        "expected_control_count": expected_control,
        "observed_treatment_fraction": treatment_count / total,
        "expected_treatment_fraction": expected_treatment_fraction,
    }


def cuped_adjust(
    treatment_pairs: Sequence[Tuple[float, float]],
    control_pairs: Sequence[Tuple[float, float]],
    confidence_level: float,
) -> Dict[str, object]:
    """Apply pooled CUPED adjustment to (outcome, pre_metric) pairs."""

    combined = list(treatment_pairs) + list(control_pairs)
    if len(treatment_pairs) < 2 or len(control_pairs) < 2 or len(combined) < 4:
        raise ValueError("CUPED requires at least two complete rows per group")
    outcomes = [pair[0] for pair in combined]
    pre_values = [pair[1] for pair in combined]
    pre_mean = mean(pre_values)
    outcome_mean = mean(outcomes)
    pre_variance = sample_variance(pre_values)
    if pre_variance <= 0:
        raise ValueError("CUPED pre-treatment metric has zero variance")
    covariance = math.fsum(
        (pre - pre_mean) * (outcome - outcome_mean)
        for outcome, pre in combined
    ) / (len(combined) - 1)
    theta = covariance / pre_variance

    adjusted_treatment = [
        outcome - theta * (pre - pre_mean) for outcome, pre in treatment_pairs
    ]
    adjusted_control = [
        outcome - theta * (pre - pre_mean) for outcome, pre in control_pairs
    ]
    estimate = welch_difference(
        adjusted_treatment, adjusted_control, confidence_level
    )
    adjusted_all = adjusted_treatment + adjusted_control
    raw_variance = sample_variance(outcomes)
    adjusted_variance = sample_variance(adjusted_all)
    variance_reduction = None
    if raw_variance > 0:
        variance_reduction = 1.0 - adjusted_variance / raw_variance

    return {
        "method": "CUPED pooled pre-treatment adjustment with Welch inference",
        "theta": theta,
        "pre_treatment_mean": pre_mean,
        "complete_rows": len(combined),
        "treatment_complete_rows": len(treatment_pairs),
        "control_complete_rows": len(control_pairs),
        "variance_reduction": variance_reduction,
        "estimate": estimate,
    }
