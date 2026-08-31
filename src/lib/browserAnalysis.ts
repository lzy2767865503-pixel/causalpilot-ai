import type {
  AnalysisSpec,
  FieldMapping,
} from "../types";

export const sha256Text = async (text: string) => {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const inferType = (values: string[]) => {
  const present = values.filter((value) => value !== "").slice(0, 200);
  if (!present.length) return "Empty";
  if (present.every((value) => value === "0" || value === "1")) return "Integer (0/1)";
  if (present.every((value) => Number.isFinite(Number(value)))) return "Number";
  if (present.every((value) => !Number.isNaN(Date.parse(value)))) return "Datetime";
  return `String${new Set(present).size <= 8 ? ` (${new Set(present).size})` : ""}`;
};

const inferRole = (column: string): FieldMapping["role"] => {
  const normalized = column.toLowerCase();
  if (/(^id$|_id$|visitor|customer|employee_id)/.test(normalized)) return "unit_id";
  if (/(treatment|assignment|variant|group)/.test(normalized)) return "treatment";
  if (/(converted|conversion|outcome|retained|completed)/.test(normalized)) {
    return "primary_outcome";
  }
  if (/(pre_|baseline|prior)/.test(normalized)) return "pre_treatment_covariate";
  if (/(assigned_at|treatment_time|exposure_time)/.test(normalized)) return "treatment_time";
  if (/(converted_at|outcome_time|completed_at)/.test(normalized)) return "outcome_time";
  if (/(revenue|spend|value)/.test(normalized)) return "secondary_outcome";
  return "exclude";
};

export const buildMappings = (
  columns: string[],
  rows: Array<Record<string, string>>,
): FieldMapping[] =>
  columns.map((source) => {
    const role = inferRole(source);
    const possiblePii = /(email|phone|name|passport|identity|address)/i.test(source);
    return {
      source,
      detectedType: inferType(rows.map((row) => row[source] ?? "")),
      role,
      status: possiblePii ? "review" : "passed",
      note: possiblePii ? "Possible PII" : undefined,
    };
  });

export const buildSpecFromMappings = (mappings: FieldMapping[], rows: Array<Record<string, string>>): AnalysisSpec => {
  const byRole = (role: FieldMapping["role"]) => mappings.find((mapping) => mapping.role === role)?.source;
  const treatmentColumn = byRole("treatment") ?? "";
  const treatmentValues = Array.from(
    new Set(rows.map((row) => row[treatmentColumn]).filter(Boolean)),
  ).sort();
  const controlValue = treatmentValues.find((value) => /control|holdout|a|0/i.test(value)) ?? treatmentValues[0] ?? "control";
  const treatmentValue = treatmentValues.find((value) => value !== controlValue) ?? treatmentValues[1] ?? "treatment";

  return {
    design: "randomized_ab",
    unitColumn: byRole("unit_id") ?? "",
    treatmentColumn,
    outcomeColumn: byRole("primary_outcome") ?? "",
    controlValue,
    treatmentValue,
    outcomeType: "binary",
    alpha: 0.05,
    businessThreshold: 1.5,
    expectedAllocation: [0.5, 0.5],
    randomizedAssignmentConfirmed: false,
    covariateColumn: byRole("pre_treatment_covariate"),
    treatmentTimeColumn: byRole("treatment_time"),
    outcomeTimeColumn: byRole("outcome_time"),
  };
};
