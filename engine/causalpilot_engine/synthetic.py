"""Generate a deterministic synthetic checkout-incentive experiment CSV.

The data are synthetic and contain no personal data. This generator is intended
for product demos and golden-path testing, not evidence of real-world adoption.

Project attribution: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
from pathlib import Path
from typing import Any, Dict, Optional


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def generate_checkout_incentive_csv(
    output_path: Path,
    units: int = 1000,
    seed: int = 20260831,
    baseline_rate: float = 0.15,
    treatment_effect: float = 0.05,
    expected_treatment_fraction: float = 0.5,
    overwrite: bool = False,
) -> Dict[str, Any]:
    if units < 20:
        raise ValueError("units must be at least 20")
    if not 0 < baseline_rate < 1:
        raise ValueError("baseline_rate must be between 0 and 1")
    if not -1 < treatment_effect < 1:
        raise ValueError("treatment_effect must be between -1 and 1")
    if not 0 < expected_treatment_fraction < 1:
        raise ValueError("expected_treatment_fraction must be between 0 and 1")
    if output_path.exists() and not overwrite:
        raise FileExistsError(
            "Output already exists; pass overwrite=True or --force: {0}".format(output_path)
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    rng = random.Random(seed)
    treatment_units = int(round(units * expected_treatment_fraction))
    assignments = [1] * treatment_units + [0] * (units - treatment_units)
    rng.shuffle(assignments)

    generated_successes = {"treatment": 0, "control": 0}
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            ["unit_id", "treatment", "checkout_completed", "pre_purchase_score"]
        )
        for index, treatment in enumerate(assignments, start=1):
            pre_score = rng.betavariate(2.0, 2.0)
            probability = (
                baseline_rate
                + treatment_effect * treatment
                + 0.10 * (pre_score - 0.5)
            )
            probability = min(0.999, max(0.001, probability))
            outcome = 1 if rng.random() < probability else 0
            group = "treatment" if treatment else "control"
            generated_successes[group] += outcome
            writer.writerow(
                [
                    "shopper_{0:07d}".format(index),
                    treatment,
                    outcome,
                    "{0:.8f}".format(pre_score),
                ]
            )

    return {
        "generator": "causalpilot_checkout_incentive_v1",
        "project_owner": "LAI ZEYU (来泽宇)",
        "synthetic_data": True,
        "contains_personal_data": False,
        "output_path": str(output_path.resolve()),
        "sha256": _sha256(output_path),
        "units": units,
        "seed": seed,
        "baseline_rate": baseline_rate,
        "configured_direct_probability_effect": treatment_effect,
        "expected_treatment_fraction": expected_treatment_fraction,
        "assignment_counts": {
            "treatment": treatment_units,
            "control": units - treatment_units,
        },
        "generated_success_counts": generated_successes,
        "columns": [
            "unit_id",
            "treatment",
            "checkout_completed",
            "pre_purchase_score",
        ],
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m causalpilot_engine.synthetic",
        description="Generate a deterministic synthetic checkout-incentive experiment.",
    )
    parser.add_argument("--output", required=True, help="destination CSV path")
    parser.add_argument("--units", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=20260831)
    parser.add_argument("--baseline-rate", type=float, default=0.15)
    parser.add_argument("--treatment-effect", type=float, default=0.05)
    parser.add_argument("--expected-treatment-fraction", type=float, default=0.5)
    parser.add_argument("--metadata-output", help="optional metadata JSON output path")
    parser.add_argument("--force", action="store_true", help="overwrite existing outputs")
    return parser


def main(argv: Optional[Any] = None) -> int:
    args = build_parser().parse_args(argv)
    metadata = generate_checkout_incentive_csv(
        Path(args.output).expanduser().resolve(),
        units=args.units,
        seed=args.seed,
        baseline_rate=args.baseline_rate,
        treatment_effect=args.treatment_effect,
        expected_treatment_fraction=args.expected_treatment_fraction,
        overwrite=args.force,
    )
    if args.metadata_output:
        metadata_path = Path(args.metadata_output).expanduser().resolve()
        if metadata_path.exists() and not args.force:
            raise FileExistsError(
                "Metadata output already exists; pass --force: {0}".format(metadata_path)
            )
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        metadata_path.write_text(
            json.dumps(metadata, sort_keys=True, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    print(
        json.dumps(
            metadata,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
            allow_nan=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
