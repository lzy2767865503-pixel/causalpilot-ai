import { describe, expect, it } from "vitest";
import type { AnalysisSpec, ImportedDataset } from "../types";
import { adaptDesktopEngineResult, toDesktopEngineSpec } from "./desktopEngine";

const dataset: ImportedDataset = {
  name: "checkout.csv",
  rawText: "",
  rows: [],
  columns: ["unit_id", "treatment", "converted"],
  hash: "browser-placeholder-hash",
  mappings: [],
};

const binarySpec: AnalysisSpec = {
  design: "randomized_ab",
  unitColumn: "unit_id",
  treatmentColumn: "treatment",
  outcomeColumn: "converted",
  controlValue: "0",
  treatmentValue: "1",
  outcomeType: "binary",
  alpha: 0.05,
  businessThreshold: 1.5,
  expectedAllocation: [0.5, 0.5],
  randomizedAssignmentConfirmed: true,
};

const engineResult = {
  schema_version: "1.0",
  request_id: "request_local_01",
  result_id: "result_local_01",
  status: "ok",
  plan_hash: "plan_local_01",
  engine: {
    name: "causalpilot-engine",
    version: "0.1.0",
    project_owner: "LAI ZEYU (来泽宇)",
    ai_used_for_calculations: false,
  },
  dataset: {
    filename: "checkout.csv",
    sha256: "dataset_sha256_from_engine",
    row_count: 2000,
  },
  normalized_spec: { analysis_name: "Checkout evidence" },
  diagnostics: {
    blockers: [],
    warnings: [],
    assignment_counts: { control: 1000, treatment: 1000 },
    observed_outcome_counts: { control: 1000, treatment: 1000 },
    missing_outcome_counts: { control: 0, treatment: 0 },
    srm: { p_value: 1 },
  },
  estimates: {
    raw: { control_rate: 0.1, treatment_rate: 0.125, control_successes: 100, treatment_successes: 125 },
    decision_estimate: {
      estimate: 0.025,
      confidence_interval_low: 0.004,
      confidence_interval_high: 0.046,
      p_value_two_sided: 0.02,
    },
  },
  business_interpretation: { configured: true, status: "inconclusive", roi: { available: false } },
  causal_claims: {
    claim_status: "conditional_randomized_itt",
    assumptions: ["Random assignment is correctly implemented."],
  },
  narrative: { limitations: ["This is a finite-sample estimate."] },
};

describe("desktop engine adapter", () => {
  it("converts engine proportions to percentage points and preserves evidence IDs", () => {
    const result = adaptDesktopEngineResult(engineResult, dataset, binarySpec);

    expect(result.status).toBe("ready");
    expect(result.estimate.value).toBeCloseTo(2.5);
    expect(result.estimate.ciLow).toBeCloseTo(0.4);
    expect(result.estimate.ciHigh).toBeCloseTo(4.6);
    expect(result.estimate.controlMean).toBeCloseTo(10);
    expect(result.estimate.causalClaimAllowed).toBe(true);
    expect(result.dataset.hash).toBe("dataset_sha256_from_engine");
    expect(result.plan.hash).toBe("plan_local_01");
    expect(result.resultIds).toEqual(["result_local_01"]);
    expect(result.evidenceOwner).toBe("LAI ZEYU (来泽宇)");
  });

  it("serializes the UI plan into the deterministic engine contract", () => {
    const request = toDesktopEngineSpec(
      { ...binarySpec, covariateColumn: "pre_purchase_score" },
      "Checkout evidence",
    );

    expect("minimum_practical_effect" in request).toBe(false);
    expect(request.business.minimum_practical_effect).toBe(0.015);
    expect(request.randomized_assignment_confirmed).toBe(true);
    expect(request.outcome_type).toBe("binary");
    expect(request.decision_target).toBe("aggregate_business_outcome");
    expect(request.cuped).toBeNull();
  });

  it("surfaces the engine sparse-binary warning as a non-blocking review diagnostic", () => {
    const sparse = {
      ...engineResult,
      diagnostics: {
        ...engineResult.diagnostics,
        warnings: [
          {
            code: "SPARSE_BINARY_OUTCOME",
            message: "Binary outcome information is sparse for normal-approximation inference.",
          },
        ],
      },
    };

    const result = adaptDesktopEngineResult(sparse, dataset, binarySpec);
    const diagnostic = result.diagnostics.find((item) => item.code === "binary_information");
    expect(result.status).toBe("ready");
    expect(diagnostic?.status).toBe("review");
    expect(diagnostic?.blocking).toBe(false);
    expect(result.limitations).toContain(
      "Binary outcome information is sparse for normal-approximation inference.",
    );
  });

  it("rejects a structurally blocked result when the engine has no estimate", () => {
    const blocked = {
      ...engineResult,
      status: "blocked",
      diagnostics: {
        ...engineResult.diagnostics,
        blockers: [
          {
            code: "DUPLICATE_UNIT_ID",
            message: "Duplicate unit IDs violate one-row-per-analysis-unit requirements.",
          },
        ],
      },
      estimates: {},
    };

    expect(() => adaptDesktopEngineResult(blocked, dataset, binarySpec)).toThrow(
      "Duplicate unit IDs violate one-row-per-analysis-unit requirements. No numerical estimate is available.",
    );
  });

  it("rejects an incomplete decision estimate instead of defaulting missing fields to zero", () => {
    const incomplete = {
      ...engineResult,
      estimates: {
        raw: engineResult.estimates.raw,
        decision_estimate: { estimate: 0.025 },
      },
    };

    expect(() => adaptDesktopEngineResult(incomplete, dataset, binarySpec)).toThrow(
      "The local engine did not return a complete finite decision estimate. No numerical estimate is available.",
    );
  });

  it("retains an SRM-blocked estimate for audit while forbidding causal wording", () => {
    const blocked = {
      ...engineResult,
      status: "blocked",
      diagnostics: {
        ...engineResult.diagnostics,
        blockers: [
          {
            code: "SRM_DETECTED",
            message: "Observed assignment counts differ materially from the declared allocation.",
          },
        ],
      },
      causal_claims: {
        ...engineResult.causal_claims,
        claim_status: "blocked",
      },
    };

    const result = adaptDesktopEngineResult(blocked, dataset, binarySpec);
    expect(result.status).toBe("blocked");
    expect(result.estimate.value).toBeCloseTo(2.5);
    expect(result.estimate.causalClaimAllowed).toBe(false);
  });

  it("keeps continuous effects in outcome units", () => {
    const continuousSpec: AnalysisSpec = {
      ...binarySpec,
      outcomeType: "continuous",
      businessThreshold: 2,
    };
    const continuousRaw = {
      ...engineResult,
      estimates: {
        raw: {},
        decision_estimate: {
          estimate: 2,
          confidence_interval_low: 0.5,
          confidence_interval_high: 3.5,
          p_value_two_sided: 0.01,
          control_mean: 10,
          treatment_mean: 12,
        },
      },
    };

    const result = adaptDesktopEngineResult(continuousRaw, dataset, continuousSpec);
    expect(result.estimate.unit).toBe("outcome_units");
    expect(result.estimate.value).toBe(2);
    expect(result.estimate.controlMean).toBe(10);
    expect(result.estimate.treatmentMean).toBe(12);
    expect(result.planning.label).toBe("Variance assumption required");
  });
});
