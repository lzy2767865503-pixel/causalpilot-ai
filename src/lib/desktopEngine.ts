import type { AnalysisSpec, Diagnostic, ImportedDataset, ResultBundle } from "../types";

type UnknownObject = Record<string, unknown>;

const asObject = (value: unknown): UnknownObject =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownObject)
    : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const asNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const issueCodes = (value: unknown) =>
  new Set(
    asArray(value)
      .map((item) => asString(asObject(item).code))
      .filter(Boolean),
  );

const issueMessages = (value: unknown) =>
  asArray(value)
    .map((item) => asString(asObject(item).message))
    .filter(Boolean);

const erf = (x: number) => {
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * abs);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-abs * abs));
  return sign * y;
};

const normalCdf = (value: number) => 0.5 * (1 + erf(value / Math.sqrt(2)));

export const toDesktopEngineSpec = (spec: AnalysisSpec, analysisName: string) => ({
  analysis_name: analysisName,
  unit_id_column: spec.unitColumn,
  treatment_column: spec.treatmentColumn,
  outcome_column: spec.outcomeColumn,
  outcome_type: spec.outcomeType,
  decision_target: "aggregate_business_outcome",
  treatment_value: spec.treatmentValue,
  control_value: spec.controlValue,
  positive_outcome_value: "1",
  negative_outcome_value: "0",
  expected_treatment_fraction: spec.expectedAllocation[1],
  srm_alpha: 0.001,
  confidence_level: 1 - spec.alpha,
  randomized_assignment_confirmed: spec.randomizedAssignmentConfirmed,
  // CUPED is intentionally disabled in the v0.1 UI. A mapped covariate is not
  // evidence that it was measured before treatment, and the current results
  // surface cannot show adjusted and raw estimates together.
  cuped: null,
  business: {
    minimum_practical_effect:
      spec.outcomeType === "binary" ? spec.businessThreshold / 100 : spec.businessThreshold,
    preferred_direction: "increase",
    currency: "USD",
  },
});

export function adaptDesktopEngineResult(
  rawValue: unknown,
  datasetInput: ImportedDataset,
  spec: AnalysisSpec,
): ResultBundle {
  const raw = asObject(rawValue);
  const status = asString(raw.status);
  if (status === "error") {
    const message = issueMessages(raw.errors)[0] || "The deterministic local engine rejected the request.";
    throw new Error(message);
  }

  const dataset = asObject(raw.dataset);
  const engine = asObject(raw.engine);
  const diagnostics = asObject(raw.diagnostics);
  const estimates = asObject(raw.estimates);
  const decisionEstimate = asObject(estimates.decision_estimate);
  const rawEstimate = asObject(estimates.raw);
  const blockers = issueCodes(diagnostics.blockers);
  const warnings = issueCodes(diagnostics.warnings);
  const assignmentCounts = asObject(diagnostics.assignment_counts);
  const observedCounts = asObject(diagnostics.observed_outcome_counts);
  const missingCounts = asObject(diagnostics.missing_outcome_counts);
  const srm = asObject(diagnostics.srm);
  const claims = asObject(raw.causal_claims);
  const narrative = asObject(raw.narrative);
  const business = asObject(raw.business_interpretation);
  const roi = asObject(business.roi);
  const roiScenarios = asObject(roi.scenarios);
  const roiBase = asObject(roiScenarios.base);
  const binary = spec.outcomeType === "binary";
  const scale = binary ? 100 : 1;
  const controlN = asNumber(observedCounts.control, asNumber(assignmentCounts.control));
  const treatmentN = asNumber(observedCounts.treatment, asNumber(assignmentCounts.treatment));
  const estimateValue = asNumber(decisionEstimate.estimate) * scale;
  const controlMean =
    asNumber(decisionEstimate.control_mean, asNumber(rawEstimate.control_rate)) * scale;
  const treatmentMean =
    asNumber(decisionEstimate.treatment_mean, asNumber(rawEstimate.treatment_rate)) * scale;

  const baseRate = binary ? Math.max(0.001, Math.min(0.999, controlMean / 100)) : 0;
  const threshold = binary ? spec.businessThreshold / 100 : spec.businessThreshold;
  const alternativeRate = Math.max(0.001, Math.min(0.999, baseRate + threshold));
  const planningSe = binary
    ? Math.sqrt(
        (baseRate * (1 - baseRate)) / Math.max(controlN, 1) +
          (alternativeRate * (1 - alternativeRate)) / Math.max(treatmentN, 1),
      )
    : 0;
  const power =
    binary && planningSe > 0
      ? Math.max(
          0,
          Math.min(
            1,
            normalCdf(threshold / planningSe - 1.959964) +
              normalCdf(-threshold / planningSe - 1.959964),
          ),
        )
      : 0;
  const pooledRate = binary ? (controlMean + treatmentMean) / 200 : 0;
  const mdeSe =
    binary && controlN > 0 && treatmentN > 0
      ? Math.sqrt(
          (pooledRate * (1 - pooledRate)) / controlN +
            (pooledRate * (1 - pooledRate)) / treatmentN,
        )
      : 0;

  const uiDiagnostics: Diagnostic[] = [
    {
      code: "sample_ratio",
      title: "Sample ratio",
      status: blockers.has("SRM_DETECTED") ? "blocked" : "passed",
      summary: blockers.has("SRM_DETECTED") ? "Blocked" : "Passed",
      detail: srm.p_value == null ? "Not evaluable" : `SRM p=${asNumber(srm.p_value).toFixed(3)}`,
      blocking: blockers.has("SRM_DETECTED"),
    },
    {
      code: "missing_outcomes",
      title: "Missing outcomes",
      status: warnings.has("MISSING_OUTCOMES") ? "review" : "passed",
      summary: warnings.has("MISSING_OUTCOMES") ? "Review" : "Passed",
      detail: `${asNumber(missingCounts.treatment) + asNumber(missingCounts.control)} missing primary outcomes`,
      blocking: false,
    },
    {
      code: "binary_information",
      title: "Binary information",
      status: warnings.has("SPARSE_BINARY_OUTCOME") ? "review" : binary ? "passed" : "info",
      summary: warnings.has("SPARSE_BINARY_OUTCOME") ? "Review" : binary ? "Passed" : "Not applicable",
      detail: warnings.has("SPARSE_BINARY_OUTCOME")
        ? "A group has fewer than 30 observed outcomes or a success/failure cell is below 5"
        : binary
          ? "Implemented sparse-information thresholds passed"
          : "Sparse binary-cell checks apply only to binary outcomes",
      blocking: false,
    },
    {
      code: "unit_integrity",
      title: "Unit integrity",
      status: blockers.has("DUPLICATE_UNIT_ID") ? "blocked" : "passed",
      summary: blockers.has("DUPLICATE_UNIT_ID") ? "Blocked" : "Passed",
      detail: blockers.has("DUPLICATE_UNIT_ID")
        ? "Duplicate analysis units detected"
        : `${asNumber(dataset.row_count).toLocaleString()} rows inspected`,
      blocking: blockers.has("DUPLICATE_UNIT_ID"),
    },
    {
      code: "planning_power",
      title: "Planning power",
      status: !binary ? "info" : power >= 0.8 ? "passed" : "review",
      summary: binary ? `${Math.round(power * 100)}%` : "Not estimated",
      detail: binary
        ? `Prospective approximation for ${spec.businessThreshold.toFixed(1)} pp`
        : "Continuous-outcome planning requires a variance assumption",
      blocking: false,
    },
  ];

  const claimStatus = asString(claims.claim_status);
  const narrativeLimitations = asArray(narrative.limitations)
    .map((item) => asString(item))
    .filter(Boolean);
  const blockerMessages = issueMessages(diagnostics.blockers);
  const warningMessages = issueMessages(diagnostics.warnings);
  const hasEstimate = [
    decisionEstimate.estimate,
    decisionEstimate.confidence_interval_low,
    decisionEstimate.confidence_interval_high,
    decisionEstimate.p_value_two_sided,
  ].every(isFiniteNumber);
  const isBlocked = status === "blocked";

  if (!hasEstimate) {
    const detail = isBlocked
      ? blockerMessages[0] || "The local engine blocked this dataset before estimation."
      : "The local engine did not return a complete finite decision estimate.";
    throw new Error(`${detail} No numerical estimate is available.`);
  }

  const result: ResultBundle = {
    schemaVersion: "1.0",
    runId: asString(raw.request_id, "local-engine-run"),
    projectName: asString(asObject(raw.normalized_spec).analysis_name, datasetInput.name.replace(/\.[^.]+$/, "")),
    question: `Did the assigned treatment create incremental ${spec.outcomeColumn.replaceAll("_", " ")}?`,
    design: "randomized_ab",
    status: isBlocked ? "blocked" : "ready",
    createdAt: new Date().toISOString(),
    evidenceOwner: "LAI ZEYU (来泽宇)",
    dataset: {
      name: asString(dataset.filename, datasetInput.name),
      hash: asString(dataset.sha256, datasetInput.hash),
      rowCount: asNumber(dataset.row_count, datasetInput.rows.length),
      analyzedUnits: controlN + treatmentN,
    },
    plan: {
      hash: asString(raw.plan_hash),
      locked: true,
      alpha: spec.alpha,
      businessThreshold: spec.businessThreshold,
      primaryOutcome: spec.outcomeColumn,
      outcomeType: spec.outcomeType,
    },
    estimate: {
      estimand: binary ? "risk_difference" : "mean_difference",
      value: estimateValue,
      ciLow: asNumber(decisionEstimate.confidence_interval_low) * scale,
      ciHigh: asNumber(decisionEstimate.confidence_interval_high) * scale,
      pValue: asNumber(decisionEstimate.p_value_two_sided, 1),
      unit: binary ? "percentage_points" : "outcome_units",
      controlMean,
      treatmentMean,
      controlN,
      treatmentN,
      controlEvents: binary ? asNumber(rawEstimate.control_successes) : undefined,
      treatmentEvents: binary ? asNumber(rawEstimate.treatment_successes) : undefined,
      causalClaimAllowed: claimStatus === "conditional_randomized_itt" && !isBlocked,
    },
    diagnostics: uiDiagnostics,
    planning: {
      powerAtBusinessThreshold: power,
      mdeAt80Power: binary ? mdeSe * (1.959964 + 0.841621) * 100 : 0,
      label: binary ? "Prospective normal approximation" : "Variance assumption required",
    },
    assumptions: asArray(claims.assumptions).map((item) => asString(item)).filter(Boolean),
    limitations: [
      ...blockerMessages,
      ...warningMessages,
      ...narrativeLimitations,
      "Evidence applies to the analyzed sample and the declared observation window.",
    ].filter((item, index, items) => item && items.indexOf(item) === index),
    resultIds: [asString(raw.result_id)].filter(Boolean),
    engineVersion: `${asString(engine.name, "causalpilot-engine")} ${asString(engine.version, "0.1.0")}`,
    provenance: "local_engine",
  };

  if (roi.available === true && Object.keys(roiBase).length) {
    result.roi = {
      valuePerIncrementalOutcome: asNumber(roi.value_per_outcome_unit),
      costPerTreatedUnit: asNumber(roi.incremental_treatment_cost_per_unit),
      incrementalOutcomes: asNumber(roiBase.incremental_outcome_units),
      incrementalRevenue: asNumber(roiBase.gross_value),
      incrementalCost: asNumber(roiBase.treatment_cost),
      incrementalProfit: asNumber(roiBase.net_value),
      returnMultiple: asNumber(roiBase.roi),
    };
  }

  return result;
}
