export type ViewKey =
  | "overview"
  | "experiments"
  | "benchmarks"
  | "reports"
  | "methods";

export type DiagnosticStatus = "passed" | "review" | "blocked" | "info";

export interface Diagnostic {
  code: string;
  title: string;
  status: DiagnosticStatus;
  summary: string;
  detail: string;
  blocking: boolean;
}

export interface AnalysisSpec {
  design: "randomized_ab";
  unitColumn: string;
  treatmentColumn: string;
  outcomeColumn: string;
  controlValue: string;
  treatmentValue: string;
  outcomeType: "binary" | "continuous";
  alpha: number;
  businessThreshold: number;
  expectedAllocation: [number, number];
  randomizedAssignmentConfirmed: boolean;
  covariateColumn?: string;
  treatmentTimeColumn?: string;
  outcomeTimeColumn?: string;
}

export interface ResultBundle {
  schemaVersion: "1.0";
  runId: string;
  projectName: string;
  question: string;
  design: "randomized_ab";
  status: "ready" | "blocked";
  createdAt: string;
  evidenceOwner: "LAI ZEYU (来泽宇)";
  dataset: {
    name: string;
    hash: string;
    rowCount: number;
    analyzedUnits: number;
  };
  plan: {
    hash: string;
    locked: boolean;
    alpha: number;
    businessThreshold: number;
    primaryOutcome: string;
    outcomeType: "binary" | "continuous";
  };
  estimate: {
    estimand: "risk_difference" | "mean_difference";
    value: number;
    ciLow: number;
    ciHigh: number;
    pValue: number;
    unit: "percentage_points" | "outcome_units";
    controlMean: number;
    treatmentMean: number;
    controlN: number;
    treatmentN: number;
    controlEvents?: number;
    treatmentEvents?: number;
    causalClaimAllowed: boolean;
  };
  diagnostics: Diagnostic[];
  planning: {
    powerAtBusinessThreshold: number;
    mdeAt80Power: number;
    label: string;
  };
  roi?: {
    valuePerIncrementalOutcome: number;
    costPerTreatedUnit: number;
    incrementalOutcomes: number;
    incrementalRevenue: number;
    incrementalCost: number;
    incrementalProfit: number;
    returnMultiple: number;
  };
  assumptions: string[];
  limitations: string[];
  resultIds: string[];
  engineVersion: string;
  provenance: "synthetic_demo" | "local_engine";
}

export type FieldRole =
  | "unit_id"
  | "treatment"
  | "primary_outcome"
  | "secondary_outcome"
  | "pre_treatment_covariate"
  | "treatment_time"
  | "outcome_time"
  | "exclude";

export interface FieldMapping {
  source: string;
  detectedType: string;
  role: FieldRole;
  status: DiagnosticStatus;
  note?: string;
}

export interface ImportedDataset {
  name: string;
  rawText: string;
  rows: Array<Record<string, string>>;
  columns: string[];
  hash: string;
  mappings: FieldMapping[];
}

export interface DesktopBridge {
  selectExperimentFile: () => Promise<
    | { cancelled: true }
    | {
        cancelled: false;
        token: string;
        displayName: string;
        sizeBytes: number;
        lastModifiedIso: string;
        columns: string[];
      }
  >;
  analyzeExperiment: (request: unknown) => Promise<unknown>;
  exportEvidence: (bundle: ResultBundle) => Promise<unknown>;
  getAppMetadata: () => Promise<unknown>;
}

declare global {
  interface Window {
    causalPilot?: DesktopBridge;
  }
}
