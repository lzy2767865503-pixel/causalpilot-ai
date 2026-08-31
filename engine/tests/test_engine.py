"""Golden and safety tests for the CausalPilot deterministic engine."""

from __future__ import annotations

import csv
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

from causalpilot_engine import analyze_request
from causalpilot_engine.synthetic import generate_checkout_incentive_csv


HERE = Path(__file__).resolve().parent


def _write_rows(path: Path, rows, header=None) -> Path:
    header = header or ["unit_id", "treatment", "converted", "pre_metric"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)
    return path


def _valid_binary_rows():
    rows = []
    for index in range(10):
        rows.append(
            [
                "t{0}".format(index),
                "1",
                "1" if index < 7 else "0",
                "{0:.2f}".format(0.2 + index * 0.05),
            ]
        )
    for index in range(10):
        rows.append(
            [
                "c{0}".format(index),
                "0",
                "1" if index < 3 else "0",
                "{0:.2f}".format(0.25 + index * 0.04),
            ]
        )
    return rows


def _request(csv_path: Path, **spec_overrides):
    spec = {
        "analysis_name": "Checkout incentive experiment",
        "unit_id_column": "unit_id",
        "treatment_column": "treatment",
        "outcome_column": "converted",
        "outcome_type": "binary",
        "decision_target": "aggregate_business_outcome",
        "treatment_value": "1",
        "control_value": "0",
        "positive_outcome_value": "1",
        "negative_outcome_value": "0",
        "expected_treatment_fraction": 0.5,
        "srm_alpha": 0.001,
        "confidence_level": 0.95,
        "randomized_assignment_confirmed": True,
        "business": {
            "minimum_practical_effect": 0.10,
            "preferred_direction": "increase",
            "target_population": 1000,
            "value_per_outcome_unit": 50,
            "incremental_treatment_cost_per_unit": 2,
            "currency": "MYR",
        },
    }
    spec.update(spec_overrides)
    return {
        "schema_version": "1.0",
        "request_id": "pytest-request",
        "csv_path": str(csv_path),
        "analysis_spec": spec,
    }


def _issue_codes(result, key):
    return {issue["code"] for issue in result[key]}


def test_valid_binary_experiment_matches_golden(tmp_path):
    csv_path = _write_rows(tmp_path / "valid.csv", _valid_binary_rows())
    result = analyze_request(_request(csv_path))
    estimate = result["estimates"]["decision_estimate"]
    actual = {
        "status": result["status"],
        "decision_readiness": result["decision_readiness"],
        "assignment_counts": result["diagnostics"]["assignment_counts"],
        "estimate": estimate["estimate"],
        "confidence_interval_low": estimate["confidence_interval_low"],
        "confidence_interval_high": estimate["confidence_interval_high"],
        "p_value_two_sided": estimate["p_value_two_sided"],
        "treatment_rate": estimate["treatment_rate"],
        "control_rate": estimate["control_rate"],
        "method": result["estimates"]["raw"]["method"],
        "decision_estimate_source": result["estimates"]["decision_estimate_source"],
        "business_status": result["business_interpretation"]["status"],
        "claim_status": result["causal_claims"]["claim_status"],
    }
    expected = json.loads(
        (HERE / "golden" / "valid_binary_expected.json").read_text(encoding="utf-8")
    )
    # Normal-distribution primitives can differ by a few ULPs across platform
    # libm implementations. Keep the contract exact and compare only derived
    # inferential floats with a tight numerical tolerance.
    approximate_fields = {
        "confidence_interval_low",
        "confidence_interval_high",
        "p_value_two_sided",
    }
    assert {key: value for key, value in actual.items() if key not in approximate_fields} == {
        key: value for key, value in expected.items() if key not in approximate_fields
    }
    for key in approximate_fields:
        assert actual[key] == pytest.approx(expected[key], rel=1e-12, abs=1e-15)
    assert result["engine"]["ai_used_for_calculations"] is False
    assert result["engine"]["project_owner"] == "LAI ZEYU (来泽宇)"
    assert result["business_interpretation"]["roi"]["available"] is True
    assert "SPARSE_BINARY_OUTCOME" in _issue_codes(result, "warnings")


def test_srm_blocks_decision_and_causal_claim(tmp_path):
    rows = []
    for index in range(90):
        rows.append(["t{0}".format(index), "1", str(index % 2), "0.5"])
    for index in range(10):
        rows.append(["c{0}".format(index), "0", str(index % 2), "0.5"])
    result = analyze_request(_request(_write_rows(tmp_path / "srm.csv", rows)))
    assert result["status"] == "blocked"
    assert "SRM_DETECTED" in _issue_codes(result, "errors")
    assert result["diagnostics"]["srm"]["passed"] is False
    assert result["estimates"]["decision_eligible"] is False
    assert result["causal_claims"]["claim_status"] == "blocked"
    assert result["business_interpretation"]["status"] == "not_evaluable"


def test_duplicate_unit_is_a_hard_block(tmp_path):
    rows = _valid_binary_rows()
    rows[-1][0] = rows[0][0]
    result = analyze_request(_request(_write_rows(tmp_path / "duplicate.csv", rows)))
    assert result["status"] == "blocked"
    assert "DUPLICATE_UNIT_ID" in _issue_codes(result, "errors")
    assert result["estimates"] == {}
    assert result["causal_claims"]["claim_status"] == "not_evaluable" or result[
        "causal_claims"
    ]["claim_status"] == "blocked"


def test_missing_outcomes_warn_but_do_not_block(tmp_path):
    rows = _valid_binary_rows()
    rows[0][2] = ""
    result = analyze_request(_request(_write_rows(tmp_path / "missing.csv", rows)))
    assert result["status"] == "ok"
    assert result["decision_readiness"] == "share_with_caveats"
    assert "MISSING_OUTCOMES" in _issue_codes(result, "warnings")
    assert result["diagnostics"]["missing_outcome_counts"]["treatment"] == 1
    assert result["estimates"]["decision_eligible"] is True


def test_deterministic_rerun_is_byte_equivalent(tmp_path):
    csv_path = _write_rows(tmp_path / "repeat.csv", _valid_binary_rows())
    request = _request(csv_path)
    first = analyze_request(request)
    second = analyze_request(request)
    assert first == second
    assert first["plan_hash"] == second["plan_hash"]
    assert first["result_id"] == second["result_id"]
    assert json.dumps(first, sort_keys=True, separators=(",", ":")) == json.dumps(
        second, sort_keys=True, separators=(",", ":")
    )


def test_continuous_welch_analysis(tmp_path):
    rows = []
    for index, outcome in enumerate([10, 11, 12, 13, 14]):
        rows.append(["t{0}".format(index), "1", outcome, 0.2 + index * 0.1])
    for index, outcome in enumerate([8, 9, 10, 11, 12]):
        rows.append(["c{0}".format(index), "0", outcome, 0.3 + index * 0.1])
    csv_path = _write_rows(tmp_path / "continuous.csv", rows)
    result = analyze_request(
        _request(
            csv_path,
            outcome_type="continuous",
            positive_outcome_value="1",
            negative_outcome_value="0",
        )
    )
    assert result["status"] == "ok"
    assert result["estimates"]["raw"]["method"] == "welch_mean_difference"
    assert result["estimates"]["raw"]["estimate"] == pytest.approx(2.0)
    assert result["estimates"]["raw"]["degrees_freedom"] == pytest.approx(8.0)


def test_cuped_uses_attested_pre_treatment_metric(tmp_path):
    csv_path = _write_rows(tmp_path / "cuped.csv", _valid_binary_rows())
    result = analyze_request(
        _request(
            csv_path,
            cuped={"pre_treatment_column": "pre_metric", "is_pre_treatment": True},
        )
    )
    assert result["status"] == "ok"
    assert result["estimates"]["decision_estimate_source"] == "cuped"
    assert result["estimates"]["cuped"]["pre_treatment_attested"] is True
    assert result["estimates"]["cuped"]["complete_rows"] == 20


def test_cli_one_shot_and_jsonl_contract(tmp_path):
    csv_path = _write_rows(tmp_path / "cli.csv", _valid_binary_rows())
    request = _request(csv_path)
    environment = dict(os.environ)
    environment["PYTHONPATH"] = str(HERE.parent)
    command = [sys.executable, "-m", "causalpilot_engine.cli", "analyze"]
    completed = subprocess.run(
        command,
        input=json.dumps(request),
        text=True,
        capture_output=True,
        check=False,
        env=environment,
        cwd=str(HERE.parent),
    )
    assert completed.returncode == 0
    assert completed.stderr == ""
    assert completed.stdout.isascii()
    one_shot = json.loads(completed.stdout)
    assert one_shot["status"] == "ok"
    assert one_shot["engine"]["project_owner"] == "LAI ZEYU (来泽宇)"

    jsonl = subprocess.run(
        [sys.executable, "-m", "causalpilot_engine.cli", "jsonl"],
        input=json.dumps(request) + "\n" + "{bad-json}\n",
        text=True,
        capture_output=True,
        check=False,
        env=environment,
        cwd=str(HERE.parent),
    )
    lines = [json.loads(line) for line in jsonl.stdout.splitlines()]
    assert jsonl.returncode == 0
    assert [item["status"] for item in lines] == ["ok", "error"]
    assert lines[1]["errors"][0]["code"] == "INVALID_JSON"


def test_synthetic_generator_is_reproducible(tmp_path):
    first_path = tmp_path / "synthetic-first.csv"
    second_path = tmp_path / "synthetic-second.csv"
    first = generate_checkout_incentive_csv(first_path, units=100, seed=42)
    second = generate_checkout_incentive_csv(second_path, units=100, seed=42)
    assert first_path.read_bytes() == second_path.read_bytes()
    assert first["sha256"] == second["sha256"]
    assert first["assignment_counts"] == {"treatment": 50, "control": 50}
    assert first["synthetic_data"] is True


def test_unattested_cuped_request_fails_safely(tmp_path):
    csv_path = _write_rows(tmp_path / "bad-cuped.csv", _valid_binary_rows())
    result = analyze_request(
        _request(
            csv_path,
            cuped={"pre_treatment_column": "pre_metric", "is_pre_treatment": False},
        )
    )
    assert result["status"] == "error"
    assert result["errors"][0]["code"] == "INVALID_REQUEST"
    assert "post-treatment covariates are forbidden" in result["errors"][0]["message"]


def test_individual_employment_decision_target_is_rejected(tmp_path):
    csv_path = _write_rows(tmp_path / "individual-employment.csv", _valid_binary_rows())
    result = analyze_request(
        _request(csv_path, decision_target="individual_employment_decision")
    )
    assert result["status"] == "error"
    assert result["errors"][0]["code"] == "UNSUPPORTED_DECISION_TARGET"
    assert "Individual employment decisions are forbidden" in result["errors"][0][
        "message"
    ]


def test_decision_target_is_required(tmp_path):
    csv_path = _write_rows(tmp_path / "missing-decision-target.csv", _valid_binary_rows())
    request = _request(csv_path)
    del request["analysis_spec"]["decision_target"]
    result = analyze_request(request)
    assert result["status"] == "error"
    assert result["errors"][0]["code"] == "INVALID_REQUEST"
    assert "decision_target is required" in result["errors"][0]["message"]


def test_team_level_program_target_is_allowed(tmp_path):
    csv_path = _write_rows(tmp_path / "team-program.csv", _valid_binary_rows())
    result = analyze_request(
        _request(csv_path, decision_target="team_level_program_outcome")
    )
    assert result["status"] == "ok"
    assert result["normalized_spec"]["decision_target"] == "team_level_program_outcome"
    assert result["causal_claims"]["decision_target"] == "team_level_program_outcome"


def test_sparse_binary_outcome_warns_without_blocking_and_keeps_interval(tmp_path):
    rows = []
    for index in range(40):
        rows.append(["t{0}".format(index), "1", "1" if index < 2 else "0", "0.5"])
    for index in range(40):
        rows.append(["c{0}".format(index), "0", "1" if index < 1 else "0", "0.5"])
    result = analyze_request(_request(_write_rows(tmp_path / "sparse.csv", rows)))
    estimate = result["estimates"]["decision_estimate"]
    assert result["status"] == "ok"
    assert result["decision_readiness"] == "share_with_caveats"
    assert "SPARSE_BINARY_OUTCOME" in _issue_codes(result, "warnings")
    assert estimate["confidence_interval_low"] < estimate["estimate"]
    assert estimate["confidence_interval_high"] > estimate["estimate"]
    assert result["causal_claims"]["claim_status"] == "conditional_randomized_itt"
