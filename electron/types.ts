export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface SelectedExperimentFile {
  cancelled: false;
  token: string;
  displayName: string;
  sizeBytes: number;
  lastModifiedIso: string;
  columns: string[];
}

export interface CancelledFileSelection {
  cancelled: true;
}

export type ExperimentFileSelection =
  | SelectedExperimentFile
  | CancelledFileSelection;

export interface AnalyzeExperimentRequest {
  experimentFileToken: string;
  analysisSpec: JsonObject;
  requestId?: string;
}

/**
 * The engine owns the detailed ResultBundle schema. Keeping this bridge type
 * JSON-only prevents Electron or the renderer from acquiring executable values.
 */
export type AnalysisResultBundle = JsonObject;

export type EvidenceExportFormat = "folder" | "json" | "html";

export interface EvidenceExportBundle {
  format: EvidenceExportFormat;
  resultBundle: AnalysisResultBundle;
  analysisSpec?: JsonObject;
  provenance?: JsonObject;
  title?: string;
  suggestedBaseName?: string;
}

/**
 * Renderer integrations may pass an engine ResultBundle directly. In that
 * shorthand form the desktop bridge creates a folder containing JSON + HTML.
 */
export type EvidenceExportRequest =
  | EvidenceExportBundle
  | AnalysisResultBundle;

export interface EvidenceExportResult {
  cancelled: boolean;
  paths: string[];
}

export interface AppMetadata {
  name: "CausalPilot AI";
  author: "LAI ZEYU (来泽宇)";
  description: string;
  version: string;
  platform: NodeJS.Platform;
  architecture: string;
  packaged: boolean;
  processingMode: "offline-local-engine";
}

export interface CausalPilotDesktopApi {
  selectExperimentFile(): Promise<ExperimentFileSelection>;
  analyzeExperiment(
    request: AnalyzeExperimentRequest,
  ): Promise<AnalysisResultBundle>;
  exportEvidence(
    bundle: EvidenceExportRequest,
  ): Promise<EvidenceExportResult>;
  getAppMetadata(): Promise<AppMetadata>;
}

declare global {
  interface Window {
    causalPilot: CausalPilotDesktopApi;
  }
}
